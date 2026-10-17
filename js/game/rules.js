// game/rules.js — Minesweeper rules plus the AAA layer: planting, flood fill, chording, flags, damage, quest marker, XP, levels, lore, side quests.
import {ST} from '../core/shared.js';
import {CHAR} from '../data/dialogue.js';
import {LORE,RANKS,SIDE} from '../data/content.js';
import {now,pick,rand,shuffle} from '../core/util.js';
import {PROFILE,saveProfile} from '../core/storage.js';
import {shellshock} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {bark} from '../audio/voices.js';
import {addFeed,banner,combo,notify,popAt,unlock} from '../ui/notify.js';
import {CAM,forN,idx,label,sched,tileCenter} from './state.js';
import {openCrate} from './events.js';
import {die,win} from './outcome.js';
import {bloodHit} from '../render/blood.js';
import {emit,explode} from '../render/particles.js';
import {updateHUD} from '../ui/hud.js';

function plant(safe){
  const ban=new Set([safe]);const sc=safe%ST.G.cols,sr=(safe/ST.G.cols)|0;
  if(ST.G.n-ST.G.mines>=9)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const c=sc+dc,r=sr+dr;if(c>=0&&r>=0&&c<ST.G.cols&&r<ST.G.rows)ban.add(idx(c,r));}
  const pool=[];for(let i=0;i<ST.G.n;i++)if(!ban.has(i))pool.push(i);shuffle(pool);for(let k=0;k<ST.G.mines;k++)ST.G.mine[pool[k]]=1;
  for(let i=0;i<ST.G.n;i++){if(ST.G.mine[i])continue;let k=0;forN(i,j=>{if(ST.G.mine[j])k++;});ST.G.cnt[i]=k;}
  const safeT=[];for(let i=0;i<ST.G.n;i++)if(!ST.G.mine[i]&&!ban.has(i))safeT.push(i);shuffle(safeT);const L=ST.G.n<100?3:ST.G.n<300?5:6;for(let k=0;k<L&&k<safeT.length;k++)ST.G.lore.add(safeT[k]);
  ST.G.started=true;
}
function flood(i){
  const out=[],q=[[i,0]],seen=new Set([i]),tn=now();let h=0;
  while(h<q.length){const[j,d]=q[h++];if(ST.G.st[j]!==0||ST.G.mine[j])continue;ST.G.st[j]=1;ST.G.opened++;const at=tn+d*.017;ST.G.revAt[j]=at;out.push(j);ST.G.revealQ.push({i:j,at});
    if(ST.G.cnt[j]===0)forN(j,k=>{if(!seen.has(k)&&ST.G.st[k]===0){seen.add(k);q.push([k,d+1]);}});}
  return out;
}
export function canAct(){return ST.G&&!ST.G.over&&!ST.G.dead&&!ST.G.paused;}
export function actReveal(i){
  if(!canAct()||i<0)return;
  if(ST.G.crate&&ST.G.crate.landed&&ST.G.crate.i===i){openCrate();return;}
  const s=ST.G.st[i];
  if(s===2||s===3){S.denied();return;}
  if(s===1){chord(i);return;}
  const wasTarget=i===ST.G.target,hadTarget=ST.G.target>=0;
  if(!ST.G.started)plant(i);
  ST.G.lastClick=i;unlock('first');
  if(ST.G.mine[i]){detonate(i);}
  else{const list=flood(i);onRevealed(list,i,wasTarget,hadTarget,false);}
  afterAction();
}
function onRevealed(list,i,wasTarget,hadTarget,isChord){
  const n=list.length;if(!n)return;S.reveal(n);const p=tileCenter(i);
  const xp=gainXP(10*n+(isChord?25:0));popAt(p.x,p.y-ST.T*.3,`+${xp} XP`,n>=10?'big':'');
  if(wasTarget){ST.G.follows++;gainXP(15);addFeed('<b>OBJECTIVE COMPLETE</b> · Click the next glowing tile','gold');if(ST.G.follows===10)unlock('follow');if(Math.random()<.25)bark('s_obj','sobj',45);}
  else if(hadTarget&&!isChord&&ST.G.opened>n){ST.G.rebels++;unlock('rebel');}
  if(n>=2){const nm=n>=60?'SWEEPOCALYPSE':n>=30?'SWEEPTACULAR':n>=15?'MEGA SWEEP':n>=5?'MULTI-REVEAL':n===2?'DOUBLE REVEAL':n===3?'TRIPLE REVEAL':'QUAD REVEAL';combo(nm,n);}
  if(n>=20){unlock('cascade');banner('AREA CLEARED',`${n} TILES SECURED`,'+250 XP');gainXP(250);bark(pick(['r_area','r_area2','j_area']),'area',25,{});}
  else if(n<=2&&Math.random()<.14)bark('j_1','j1',40,{chatter:true});
  if(ST.G.opened>=10)unlock('ten');
  if(ST.G.opened>=50&&!ST.G.chal){ST.G.chal=true;PROFILE.coins+=100;ST.G.coinsEarned+=100;notify('DAILY CHALLENGE COMPLETE','Reveal 50 tiles|+100 Sweep Coins','ach','✓');sched(.8,()=>bark('s_chal','schal',60));}
  addFeed(`SWEEPER <span style="color:#8fd3ff">▸</span> ${isChord?'CHORDED':'REVEALED'} ${label(i)}${n>1?` ×${n}`:''}<em>+${xp}</em>`);
}
export function chord(i){
  const n=ST.G.cnt[i];if(!n){S.denied();return;}let f=0;const hid=[];forN(i,j=>{if(ST.G.st[j]===2||ST.G.st[j]===3)f++;else if(ST.G.st[j]===0)hid.push(j);});
  if(f!==n||!hid.length){S.denied();return;}
  let opened=[];for(const j of hid){if(ST.G.st[j]!==0)continue;if(ST.G.mine[j]){detonate(j);if(ST.G.dead)break;}else opened=opened.concat(flood(j));}
  ST.G.lastClick=i;if(opened.length)onRevealed(opened,i,false,true,true);afterAction();
}
export function actFlag(i){
  if(!canAct()||i<0)return;const s=ST.G.st[i];
  if(s===0){ST.G.st[i]=2;ST.G.flags++;S.flag();if(PROFILE.skin==='tune')S.tune();const p=tileCenter(i);for(let k=0;k<8;k++)emit({t:'dust',x:p.x-CAM.x,y:p.y-CAM.y+ST.T*.3,vx:rand(-60,60),vy:rand(-50,-10),g:120,drag:2,life:rand(.3,.6),s:rand(1,2),c:'255,200,170'});
    if(!ST.G.ever[i]){ST.G.ever[i]=1;const xp=gainXP(5);popAt(p.x,p.y-ST.T*.3,`+${xp} XP`);}
    addFeed(`SWEEPER <span style="color:#ff6b6b">⚑</span> FLAGGED ${label(i)}`);
    if(ST.G.flags===1)bark(pick(['r_flag','r_flag2','r_flag3']),'flag',40,{});else if(Math.random()<.22)bark(pick(['r_flag','r_flag2','r_flag3']),'flag',40,{chatter:true});}
  else if(s===2){ST.G.st[i]=0;ST.G.flags--;S.unflag();}
  else if(s===1){chord(i);return;}
  afterAction();
}
function detonate(i){
  ST.G.st[i]=3;ST.G.booms++;const p=tileCenter(i);explode(p.x-CAM.x,p.y-CAM.y);S.boom();
  bloodHit(p.x,p.y);shellshock();
  const dmg=Math.round(60*(PROFILE.perks.thick?.75:1));ST.G.hp-=dmg;ST.G.lastHit=ST.G.clock;ST.G.flash=1;popAt(p.x,p.y,`−${dmg} HP`,'neg');
  addFeed(`SWEEPER <span style="color:#ff9a3c">✸</span> MINE AT ${label(i)}<em class="neg">−${dmg} HP</em>`);
  unlock('ouch');ST.G.respectsUntil=ST.G.clock+6;
  if(!ST.G.momBoom){ST.G.momBoom=true;sched(10,()=>bark('m_4','m4',999,{}));}
  if(ST.G.hp<=0){ST.G.hp=0;die();return;}
  sched(.35,()=>bark(pick(['r_hit1','r_hit2','r_hit3','r_hit4','r_hit5','j_hit']),'hit',7,{}));
}
function afterAction(){if(!ST.G)return;ST.G.lastAction=ST.G.clock;ST.G.idle=0;pickTarget();checkWin();updateHUD();}
function pickTarget(){
  if(!ST.G.started||ST.G.over)return;
  if(ST.G.target>=0&&ST.G.st[ST.G.target]===0&&!ST.G.mine[ST.G.target])return;
  let best=-1,bd=1e9;const from=ST.G.lastClick>=0?ST.G.lastClick:0,fc=from%ST.G.cols,fr=(from/ST.G.cols)|0;
  for(let i=0;i<ST.G.n;i++){if(ST.G.st[i]!==0||ST.G.mine[i])continue;let front=false;forN(i,j=>{if(ST.G.st[j]===1)front=true;});const d=Math.hypot(i%ST.G.cols-fc,((i/ST.G.cols)|0)-fr)+(front?0:100);if(d<bd){bd=d;best=i;}}
  ST.G.target=best;
}
function checkWin(){if(ST.G.started&&!ST.G.won&&ST.G.opened===ST.G.n-ST.G.mines)win();}
export const need=l=>200+140*l;
export function gainXP(a){let m=1;if(PROFILE.perks.scholar)m*=1.25;if(PROFILE.boostUntil>Date.now())m*=2;a=Math.round(a*m);PROFILE.xp+=a;if(ST.G)ST.G.xpEarned+=a;
  while(PROFILE.xp>=need(PROFILE.lvl)){PROFILE.xp-=need(PROFILE.lvl);PROFILE.lvl++;levelUp();}saveProfile();return a;}
function levelUp(){PROFILE.skill++;PROFILE.coins+=100;if(ST.G)ST.G.coinsEarned+=100;banner('LEVEL UP',`SWEEPER RANK ${PROFILE.lvl}`,'+1 SKILL POINT · +100 SWEEP COINS');S.level();if(ST.G){bark('s_level','slevel',30);if((PROFILE.lvl-1)%2===0)sched(1.6,()=>bark('s_season','sseason',25));addFeed(`<b>LEVEL ${PROFILE.lvl}</b> · ${RANKS[Math.min(RANKS.length-1,PROFILE.lvl-1)]}`,'gold');}}
export function collectLore(i){
  ST.G.lore.delete(i);ST.G.loreFound++;PROFILE.lore++;const p=tileCenter(i);S.lore();
  for(let k=0;k<26;k++){const a=rand(0,6.283),v=rand(40,170);emit({t:'glint',x:p.x-CAM.x,y:p.y-CAM.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:40,drag:2,life:rand(.6,1.2),s:rand(2,4)});}
  const xp=gainXP(50);popAt(p.x,p.y-ST.T*.6,`LORE +${xp} XP`,'big');
  notify(`LORE FRAGMENT ${PROFILE.lore}/400`,`${LORE[(PROFILE.lore-1)%LORE.length]}|Added to your quest log`,'ach','?');
  unlock('lore');if(PROFILE.lore===1||ST.G.loreFound===1)bark(pick(['j_lore','r_lore']),'jlore',999,{});addFeed(`<b>LORE FRAGMENT</b> FOUND AT ${label(i)}`,'gold');
}
export function addSide(k){if(!ST.G||ST.G.side.includes(k))return;ST.G.side.push(k);ST.G.tracked=k;const q=SIDE[k];banner('NEW QUEST',q.name,`From ${q.giver} · Added to your quest log`,CHAR[q.who].color);S.quest();sched(.5,()=>bark('s_quest','squest',8));updateHUD();}
