// game/update.js — gameUpdate(): per-frame simulation (health regen, timers, chatter, scheduled events, Pathos-4 flooding...).
import {ST} from '../core/shared.js';
import {VOICES} from '../data/voice-manifest.js';
import {$,clamp,now,pick,rand} from '../core/util.js';
import {PROFILE,settings} from '../core/storage.js';
import {decodeOne} from '../audio/voice-bank.js';
import {S} from '../audio/sfx.js';
import {VM,bark,nextChatter,radioActive,say} from '../audio/voices.js';
import {addFeed,banner,unlock} from '../ui/notify.js';
import {CAM,sched,tileCenter} from './state.js';
import {collectLore} from './rules.js';
import {bubbleAt,floodNow} from './pathos.js';
import {autosave,endClub,showTip,spawnCrate} from './events.js';
import {emit} from '../render/particles.js';
import {updateHUDframe} from '../ui/hud.js';

/* ================= game update & draw ================= */
export function gameUpdate(t,dt){
  if(!ST.G)return;const tn=now();
  if(ST.G.revealQ.length){const keep=[];for(const q of ST.G.revealQ){if(tn>=q.at){const x=ST.BX+((q.i%ST.G.cols)+.5)*ST.T,y=ST.BY+(((q.i/ST.G.cols)|0)+.5)*ST.T;for(let k=0;k<2;k++)emit({t:'dust',x:x+rand(-ST.T*.4,ST.T*.4),y:y+rand(-ST.T*.4,ST.T*.4),vx:rand(-20,20),vy:rand(-50,-15),g:-10,drag:1,life:rand(.3,.7),s:rand(1,2.2)});if(ST.G.lore.has(q.i))collectLore(q.i);}else keep.push(q);}ST.G.revealQ=keep;}
  ST.G.shake=Math.max(0,ST.G.shake-dt*45);ST.G.flash=Math.max(0,ST.G.flash-dt*2.2);
  if(ST.G.paused){updateHUDframe();return;}
  ST.G.clock+=dt;if(ST.G.started&&!ST.G.over&&!ST.G.dead)ST.G.elapsed+=dt;
  for(let k=ST.G.sched.length-1;k>=0;k--){if(ST.G.sched[k].at<=ST.G.clock){const s=ST.G.sched[k];ST.G.sched.splice(k,1);try{s.fn();}catch(e){}}}
  if(!ST.G.dead&&ST.G.clock-ST.G.lastHit>(PROFILE.perks.wind?1.5:3)&&ST.G.hp<100)ST.G.hp=Math.min(100,ST.G.hp+24*dt);
  if(ST.G.hpTrail>ST.G.hp){if(ST.G.clock-ST.G.lastHit>.6)ST.G.hpTrail=Math.max(ST.G.hp,ST.G.hpTrail-55*dt);}else ST.G.hpTrail=ST.G.hp;
  const low=ST.G.hp<40&&!ST.G.over&&!ST.G.dead;$('#game').classList.toggle('lowhp',low);
  if(low){if(ST.G.clock>=ST.G.nextHeart){S.heart();ST.G.nextHeart=ST.G.clock+.85;}if(!ST.G.lowWarned){ST.G.lowWarned=true;say('s_crit');sched(1.7,()=>bark('j_low','jlow',25,{}));}}else if(ST.G.hp>75)ST.G.lowWarned=false;
  if(!ST.G.over&&!ST.G.dead&&settings.chatter!=='off'&&!radioActive().length&&ST.G.clock>=VM.next){const id=VM.queued||nextChatter();VM.queued=null;if(id&&VOICES[id]&&bark(id,null,0,{chatter:true})){VM.next=ST.G.clock+60;VM.queued=nextChatter();decodeOne(VM.queued);}else VM.next=ST.G.clock+1;}
  if(ST.G.started&&!ST.G.over&&!ST.G.dead){const idle=ST.G.clock-ST.G.lastAction;if(idle>13&&ST.G.idle===0){ST.G.idle=1;bark(pick(['r_idle','r_idle2','j_idle']),'idle',30,{});}if(idle>20&&ST.G.idle===1){ST.G.idle=2;unlock('idle');}}
  if(PROFILE.skill>0&&ST.G.started&&!ST.G.over&&!ST.G.dead&&ST.G.clock>=ST.G.nextNag){ST.G.nextNag=ST.G.clock+80;bark('s_skill','sskill',70);}
  if(ST.G.started&&!ST.G.half&&ST.G.opened>=(ST.G.n-ST.G.mines)/2&&!ST.G.over){ST.G.half=true;sched(1,()=>bark('r_half','half',999,{}));}
  if(!ST.G.over&&ST.G.clock>=ST.G.nextSave){ST.G.nextSave=ST.G.clock+rand(26,40);autosave();}
  if(!ST.G.over&&ST.G.clock>=ST.G.nextTip){ST.G.nextTip=ST.G.clock+(ST.G.tipsShown<3?11:rand(28,44));showTip();}
  if(ST.G.started&&!ST.G.over&&!ST.G.crate&&ST.G.clock>=ST.G.nextCrate)spawnCrate();
  if(ST.G.crate){const c=ST.G.crate;if(!c.landed&&ST.G.clock-c.t0>2){c.landed=true;S.crate();const p=tileCenter(c.i);for(let k=0;k<14;k++)emit({t:'dust',x:p.x-CAM.x+rand(-ST.T*.5,ST.T*.5),y:p.y-CAM.y+ST.T*.3,vx:rand(-80,80),vy:rand(-40,-5),g:60,drag:2,life:rand(.4,.8),s:rand(1.5,3),c:'210,200,180'});}
    if(ST.G.clock-c.t0>38){ST.G.crate=null;ST.G.nextCrate=ST.G.clock+(PROFILE.perks.lucky?30:60);addFeed('Supply drop was looted by another player. (This is a single-player game.)');}}
  if(ST.G.theme.bg==='pathos'&&!ST.G.over){const el=ST.G.clock-ST.G.floodStart;ST.G.floodP=clamp(el/ST.G.floodTotal,0,1);
    if(!ST.G.flooded){const rem=ST.G.floodTotal-el;
      if(el>=12&&!ST.G.breachSaid){ST.G.breachSaid=true;bark('s_breach','sbreach',999,{});}
      if(rem<=30&&!ST.G.warn30){ST.G.warn30=true;say('s_flood');sched(1.2,()=>bark('rp_2','rp2',999,{}));banner('FLOODING IMMINENT','30 SECONDS','Take a deep breath','#ff6b4a');}
      if(rem<=10&&rem>0){const sec=Math.ceil(rem);if(sec!==ST.G.lastTick){ST.G.lastTick=sec;S.ctick();}}
      if(rem<=30&&Math.random()<dt*8)bubbleAt(ST.BX+rand(0,ST.BW),ST.BY+ST.BH+rand(0,20));
      if(rem<=0)floodNow();}
    else{ST.G.bLog-=dt*0.30103/40;ST.G.breath=Math.pow(10,ST.G.bLog);
      if(Math.random()<dt*10)bubbleAt(rand(0,ST.W)-CAM.x,ST.H+10);if(ST.G.clock>=ST.G.nextBub){ST.G.nextBub=ST.G.clock+rand(2,5);S.bubble();}}}
  if(ST.G.club>0){ST.G.club-=dt;if(ST.G.club<=0)endClub();}
  if(ST.G.clock>=ST.G.nextSmoke){ST.G.nextSmoke=ST.G.clock+.22;let n=0;for(let i=0;i<ST.G.n&&n<12;i++)if(ST.G.st[i]===3){n++;if(Math.random()<.5){const x=ST.BX+((i%ST.G.cols)+.5)*ST.T,y=ST.BY+(((i/ST.G.cols)|0)+.5)*ST.T;emit({t:'smoke',x:x+rand(-3,3),y,vx:rand(-6,6),vy:-rand(14,30),g:-4,drag:.3,life:rand(1.5,2.6),s:ST.T*.18,c:45});}}}
  $('#respects').hidden=!(ST.G.clock<ST.G.respectsUntil);
  updateHUDframe();
}
