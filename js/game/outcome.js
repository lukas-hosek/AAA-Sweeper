// game/outcome.js — Death and checkpoint, victory, results screen.
import {ST} from '../core/shared.js';
import {VOICES} from '../data/voice-manifest.js';
import {DIFFS,QUOTES} from '../data/content.js';
import {FI,FIELDS} from '../data/fields.js';
import {musicStart} from '../audio/music.js';
import {$,$$,esc,pick,rand,sleep,tween} from '../core/util.js';
import {PROFILE,saveProfile} from '../core/storage.js';
import {S} from '../audio/sfx.js';
import {bark,say,stopAllVoices} from '../audio/voices.js';
import {toTitle} from '../scenes/title.js';
import {addFeed,banner,notify,unlock} from '../ui/notify.js';
import {sched} from './state.js';
import {startGame} from './start.js';
import {emit} from '../render/particles.js';
import {updateHUD} from '../ui/hud.js';
import {CR,startCredits} from '../scenes/credits.js';

export function die(){ST.G.dead=true;ST.G.deaths++;$('#game').classList.add('dying');unlock('dead');bark('r_dead','dead',0,{});sched(2.6,()=>bark('k_dead','kdead',90,{}));setTimeout(showDeath,900);}
async function showDeath(){if(!ST.G)return;const d=$('#death'),q=pick(QUOTES);$('#dt-q').innerHTML=`“${esc(q[0])}”<cite>${esc(q[1])}</cite>`;$('#dt-bar').style.width='0';$('#dt-st').textContent='';d.hidden=false;
  await sleep(2400);if(!ST.G)return;$('#dt-st').textContent='Loading last checkpoint…';await tween(2000,p=>{$('#dt-bar').style.width=(p*100)+'%';});
  $('#dt-st').textContent='Checkpoint restored. Your progress was kept, because we respect your time.';await sleep(1500);if(!ST.G)return;d.hidden=true;
  ST.G.dead=false;ST.G.hp=100;ST.G.hpTrail=100;ST.G.lastHit=-99;$('#game').classList.remove('dying');say('s_check');sched(1.4,()=>bark('j_respawn','jresp',120,{}));addFeed('<b>CHECKPOINT RESTORED</b> · Respawn tokens: ∞ (Premium)','gold');}
export async function win(){
  ST.G.won=true;ST.G.over=true;ST.G.target=-1;for(let i=0;i<ST.G.n;i++)if(ST.G.mine[i]&&ST.G.st[i]===0){ST.G.st[i]=2;ST.G.flags++;}
  const f=ST.G.field;PROFILE.maxField=Math.max(PROFILE.maxField||1,Math.min(FIELDS.length,f+1));saveProfile();
  updateHUD();unlock('win');if(ST.G.theme.ach)unlock(ST.G.theme.ach);if(ST.G.theme.bg==='pathos')unlock(ST.G.flooded?'breath':'dryrun');musicStart('win');$('#letterbox').classList.add('on');stopAllVoices();
  for(let k=0;k<7;k++)setTimeout(()=>{if(!ST.G)return;const x=ST.BX+rand(0,ST.BW),y=ST.BY+rand(0,ST.BH*.7);for(let j=0;j<46;j++){const a=rand(0,6.283),v=rand(80,320);emit({t:'confetti',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,g:260,drag:1.2,life:rand(1.2,2.4),s:rand(3,6),h:rand(0,360),r:rand(0,6)});}S.ach();},k*380);
  banner('FIELD CLEARED',ST.G.theme.op.toUpperCase(),'Mission complete');setTimeout(()=>say('a_complete'),300);setTimeout(()=>{if(ST.G&&ST.G.won)say(ST.G.theme.win[0]);},2000);
  if(f>=FIELDS.length){await sleep(2600+((VOICES[ST.G.theme.win[0]]||{d:5}).d)*1000);if(!ST.G||!ST.G.won)return;say(ST.G.theme.win[1]);await sleep(((VOICES[ST.G.theme.win[1]]||{d:5}).d+1.4)*1000);if(!ST.G||!ST.G.won)return;$('#letterbox').classList.remove('on');startCredits('game');return;}
  await sleep(5600);if(!ST.G||!ST.G.won)return;showResults();setTimeout(()=>{if(ST.G&&ST.G.won)say(ST.G.theme.win[1]);},2400);
}
export function showResults(final){
  const t=ST.G.elapsed,mm=String(Math.floor(t/60)).padStart(2,'0'),ss=String(Math.floor(t%60)).padStart(2,'0');
  const rank=ST.G.booms===0&&ST.G.deaths===0?'S':ST.G.booms<=1?'A':ST.G.booms<=3?'B':'C';
  const nx=FI(ST.G.field+1);$('#rs').innerHTML=`<div class="rs-k">${final?'CAMPAIGN COMPLETE':'MISSION COMPLETE · CHAPTER '+ST.G.field} · ${DIFFS[ST.G.dkey].label.toUpperCase()}</div><h2>${final?'Triple A Sweeper':esc(ST.G.theme.op)}</h2>
  <div class="rs-g"><div class="rank">${rank}</div><dl>
  <dt>Mission time</dt><dd>${mm}:${ss}</dd><dt>Tiles revealed</dt><dd>${ST.G.opened}</dd><dt>Mines stepped on</dt><dd>${ST.G.booms}</dd><dt>Deaths</dt><dd>${ST.G.deaths}</dd>
  <dt>Quest markers followed</dt><dd>${ST.G.follows}</dd><dt>Radio transmissions endured</dt><dd>${ST.G.trans}</dd><dt>Respects paid</dt><dd>${ST.G.respects}</dd><dt>XP earned</dt><dd>${ST.G.xpEarned.toLocaleString('en-US')}</dd></dl></div>
  <div class="rs-rate">Rate this mission <span class="stars">${[1,2,3,4,5].map(n=>`<button data-star="${n}" aria-label="${n} stars">★</button>`).join('')}</span></div>
  <div class="rs-btns">${final?`<button class="pbtn" data-r="restart1">PLAY AGAIN FROM CHAPTER 1</button><button class="pbtn alt" data-r="credits">WATCH THE CREDITS AGAIN</button>`:`<button class="pbtn" data-r="next">NEXT: ${esc(nx.name.toUpperCase())} →</button><button class="pbtn alt" data-r="again">REPLAY CHAPTER</button>`}<button class="pbtn alt" data-r="dlc">BUY DLC: MINES OF THE NORTH · €24.99</button><button class="pbtn alt" data-r="title">MAIN MENU</button></div>
  <div class="rs-f">${final?`Chapters 6–87 coming as DLC · You watched ${CR.skipped?'some':'all'} of the credits`:`Chapter ${ST.G.field+1} of 87 unlocked · Credits roll after Chapter ${FIELDS.length}`}</div>`;
  $('#results').hidden=false;$('#letterbox').classList.remove('on');
}
$('#results').addEventListener('click',e=>{const s=e.target.closest('[data-star]');if(s){$$('.stars button').forEach(b=>b.classList.toggle('on',+b.dataset.star<=+s.dataset.star));notify('THANK YOU','Your feedback has been received and ignored.','info','★');return;}
  const b=e.target.closest('[data-r]');if(!b)return;S.ui();if(b.dataset.r==='next'){$('#results').hidden=true;startGame(ST.G.dkey,true,ST.G.field+1);}else if(b.dataset.r==='restart1'){$('#results').hidden=true;startGame(ST.G.dkey,true,1);}else if(b.dataset.r==='credits'){$('#results').hidden=true;startCredits('game');}else if(b.dataset.r==='again'){$('#results').hidden=true;startGame(ST.G.dkey,true,ST.G.field);}else if(b.dataset.r==='title'){$('#results').hidden=true;ST.G=null;toTitle(true);}else{S.denied();notify('DLC UNAVAILABLE','Mines of the North is still being made by 2,800 people.','info','!');}});
