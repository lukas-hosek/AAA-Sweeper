// game/events.js — Timed events: the club, tips, autosave, supply drops and loot.
import {ST} from '../core/shared.js';
import {LOOT,TIPS} from '../data/content.js';
import {musicStart} from '../audio/music.js';
import {$,now,pick,rand} from '../core/util.js';
import {PROFILE,saveProfile} from '../core/storage.js';
import {S} from '../audio/sfx.js';
import {bark} from '../audio/voices.js';
import {addFeed,banner,popAt,unlock} from '../ui/notify.js';
import {CAM,tileCenter} from './state.js';
import {gainXP} from './rules.js';
import {fieldMusic} from './start.js';
import {emit} from '../render/particles.js';
import {updateHUD} from '../ui/hud.js';

export function startClub(){if(!ST.G||ST.G.over)return;ST.G.club=24;ST.G.clubDone=true;musicStart('club');$('#game').classList.add('club');banner('THE CLUB HAS ARRIVED','QUEST COMPLETE','Get Yo Ass In Da Club · +500 XP','#9bff4a');gainXP(500);unlock('club');updateHUD();}
export function endClub(){ST.G.club=0;$('#game').classList.remove('club');if(!ST.G.over)musicStart(fieldMusic());addFeed('The club has left. Big Dez thanks you for coming.');}
export function showTip(){const t=$('#tip');$('#tip-t').textContent=TIPS[ST.G.tipsShown%TIPS.length];ST.G.tipsShown++;t.hidden=false;requestAnimationFrame(()=>t.classList.add('on'));setTimeout(()=>{t.classList.remove('on');setTimeout(()=>{t.hidden=true;},350);},7000);}
export function autosave(){const a=$('#autosave');a.hidden=false;setTimeout(()=>{a.hidden=true;if(Math.random()<.4)bark('s_save','ssave',60);},2400);}
export function spawnCrate(){const open=[];for(let i=0;i<ST.G.n;i++)if(ST.G.st[i]===1&&now()>ST.G.revAt[i])open.push(i);if(open.length<3){ST.G.nextCrate=ST.G.clock+8;return;}
  ST.G.crate={i:pick(open),t0:ST.G.clock,landed:false};bark('s_drop','sdrop',40);banner('SUPPLY DROP INCOMING','Marked on your minimap','Click the crate to open it','#6fb6ff');S.whoosh();}
export function openCrate(){const c=ST.G.crate;ST.G.crate=null;ST.G.nextCrate=ST.G.clock+(PROFILE.perks.lucky?32:64);const p=tileCenter(c.i);S.crate();S.coin();
  for(let k=0;k<30;k++){const a=rand(0,6.283),v=rand(60,220);emit({t:'glint',x:p.x-CAM.x,y:p.y-CAM.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:120,drag:1.5,life:rand(.5,1),s:rand(2,4)});}
  const coins=Math.round(rand(60,180));PROFILE.coins+=coins;ST.G.coinsEarned+=coins;popAt(p.x,p.y-ST.T*.4,`+${coins} COINS`,'big');lootRoll();unlock('crate');saveProfile();updateHUD();}
export function lootRoll(){const r=Math.random();const it=r<.35?LOOT[0]:r<.6?LOOT[1]:r<.8?LOOT[2]:r<.92?LOOT[3]:r<.98?LOOT[4]:LOOT[5];banner(it[0].toUpperCase()+' ITEM',it[2],'Equip it in a menu that does not exist yet',it[1]);}
