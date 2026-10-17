// audio/music.js — Music data (progressions, melodies, tempos) and the look-ahead step scheduler. musicStep() composes every theme.
import {n2f} from '../core/util.js';
import {A,env,nz,osc} from './engine.js';
import {bell,braam,clap,doum,epiano,flute,harp,hat,kick,ney,ocarina,oud,pad,piano,pluck,softpad,stab,taiko,tek,whistle} from './instruments.js';

const HIJAZ=[[62,0,63,66,67,0,66,63,62,0,0,63,66,67,69,0],[70,0,69,67,66,0,67,66,63,0,62,0,63,66,63,0],[62,0,63,66,67,0,66,63,62,0,0,63,66,67,69,0],[74,72,70,69,70,69,67,66,67,66,63,66,62,0,0,0]];
const triad=(r,q)=>[r,r+(q==='m'?3:4),r+7];
const PROG={pathos:[[41,'M'],[43,'M'],[45,'m'],[43,'M']],arctic:[[40,'m'],[36,'M'],[45,'m'],[47,'m']],home:[[41,'maj7'],[38,'m7'],[43,'m7'],[36,'7']],credits:[[41,'M'],[48,'M'],[50,'m'],[46,'M'],[41,'M'],[48,'M'],[46,'M'],[48,'M']],title:[[38,'m'],[34,'M'],[41,'M'],[36,'M']],game:[[38,'m'],[38,'m'],[34,'M'],[36,'M']],club:[[45,'m'],[41,'M'],[48,'M'],[43,'M']],win:[[41,'M'],[48,'M'],[50,'m'],[46,'M']]};
export const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4,credits:60/68/2,arctic:60/66/2,home:60/88/2,pathos:60/62/2};
const ARCPAT=[[0,-1,2,-1,1,-1,-1,4,0,-1,2,-1,4,-1,3,-1,1,-1,2,-1,0,-1,-1,5,2,-1,1,-1,0,-1,-1,-1],[3,-1,-1,2,-1,1,-1,-1,4,-1,-1,3,-1,2,-1,-1,5,-1,4,-1,3,-1,2,-1,1,-1,-1,-1,0,-1,-1,-1]];
const HOMEMEL=[[77,0,76,77,0,72,0,0],[74,0,72,74,0,69,0,0],[70,0,72,74,0,77,0,76],[74,0,72,0,70,0,0,0]];
const CH7={maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10]};
const PMEL=[[77,0,0,76,72,0,0,0],[74,0,71,0,74,76,0,0],[76,0,72,0,69,0,0,71],[74,0,0,0,0,0,0,0]];
const OMEL=[[0,0,65,0,0,67,0,0],[0,0,71,0,0,69,0,0],[0,0,69,0,0,64,0,0],[0,0,67,0,0,0,0,0]];
const CRMEL=[[69,0,72,0,77,0,76,74],[72,0,0,0,67,0,72,74],[74,0,77,0,76,0,74,72],[70,0,74,0,72,0,70,69],[69,0,72,0,77,0,79,81],[79,0,0,76,77,0,76,74],[74,0,77,0,82,0,81,79],[77,0,0,0,76,0,0,0]];
export const MUS={mode:'none',step:0,next:0,timer:null};
export function musicStart(mode){if(!A.ctx)return;MUS.mode=mode;MUS.step=0;MUS.next=A.ctx.currentTime+.08;if(!MUS.timer)MUS.timer=setInterval(musicTick,40);}
export function musicStop(){MUS.mode='none';}
function musicTick(){if(!A.ctx||MUS.mode==='none')return;const c=A.ctx;if(MUS.next<c.currentTime-.05)MUS.next=c.currentTime+.05;let g=0;while(MUS.next<c.currentTime+.3&&g++<48){musicStep(MUS.mode,MUS.step,MUS.next);MUS.next+=STEP[MUS.mode];MUS.step++;}}
export function musicStep(mode,s,t){
  if(mode==='title'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.title[bar];
    if(st===0){pad(triad(r+12,q),t,STEP.title*8,.045);osc('sine',n2f(r-12),t,STEP.title*8,.13,A.duck,{a:.8,rel:.8});taiko(t,.5);}
    if(st===5||st===6)taiko(t,.25);
    if(st%2===1){const tr=triad(r+36,q);osc('sine',n2f(tr[(s>>1)%3]),t,.08,.025,A.duck,{send:A.sendM,rel:.4});}
  }else if(mode==='game'){const bar=Math.floor(s/16)%4,st=s%16,[r,q]=PROG.game[bar],tr=triad(r,q);
    if(st===0){pad(triad(r+12,q),t,STEP.game*16,.03);osc('sine',n2f(r-12),t,STEP.game*16,.1,A.duck,{a:.3,rel:.6});if(bar===0&&Math.floor(s/64)%2===1)braam(r,t,.16);}
    const pat=[0,2,1,2,0,2,1,2,0,2,1,2,0,1,2,1];pluck(n2f(tr[pat[st]]+24+(bar===3&&st>11?12:0)),t,.05);
    if(st===0||st===7||st===10)taiko(t,st===0?.55:.3);
    if(st===4||st===12)hat(t,.04,false);
  }else if(mode==='club'){const bar=Math.floor(s/16)%4,st=s%16,[r,q]=PROG.club[bar],tr=triad(r,q);
    if(st%4===0)kick(t,.8);if(st===4||st===12)clap(t,.28);if(st%4===2)hat(t,.11,true);else if(st%2===1)hat(t,.045,false);
    if(st%4===2)osc('sawtooth',n2f(r-12),t,STEP.club*1.5,.17,A.duck,{lp:560,q:6,rel:.04});
    if(st===3||st===10)stab(tr.map(m=>m+12),t,.05);
    const b8=Math.floor(s/16)%8;if(b8>=4){const arp=[0,7,12,16,12,7,3,7];osc('square',n2f(tr[0]+24+arp[st%8]),t,.06,.022,A.duck,{lp:3200,rel:.03,send:A.sendM});}
    if(b8===7&&st===0)nz(t,STEP.club*16,.07,A.duck,{type:'bandpass',f:300,f2:6000,q:2,a:STEP.club*14,rel:.05});
  }else if(mode==='desert'){const bar=Math.floor(s/16)%4,st=s%16;
    if(st===0){osc('sawtooth',n2f(38),t,STEP.desert*16,.05,A.duck,{a:.4,rel:.6,lp:320});osc('sawtooth',n2f(45),t,STEP.desert*16,.035,A.duck,{a:.4,rel:.6,lp:380});
      if(bar===0&&Math.floor(s/64)%2===1)braam(38,t,.13);if(bar===2&&Math.floor(s/64)%2===0)ney(74,t+STEP.desert*2,STEP.desert*10);}
    const m=HIJAZ[bar][st];if(m>0)oud(n2f(m),t,.075);
    if(st===0||st===8)doum(t,st===0?.5:.4);if(st===2||st===6||st===12)tek(t,.2);if(st===14||st===15)tek(t,.07);
  }else if(mode==='pathos'){const bar=Math.floor(s/8)%4,st=s%8,ph=Math.floor(s/32),[r,q]=PROG.pathos[bar],tr=triad(r,q);
    if(st===0){softpad([...tr.map(m=>m+12),bar===0?r+18:r+24],t,STEP.pathos*8,.022);osc('sine',n2f(r-12),t,STEP.pathos*8,.08,A.duck,{a:1.5,rel:1.2,send:A.sendL});
      if(bar%2===0)nz(t,STEP.pathos*16,.02,A.duck,{type:'lowpass',f:380,q:.7,a:STEP.pathos*6,rel:1.5});
      if(bar===0&&ph%4===3){const c=A.ctx,o=c.createOscillator(),gg=c.createGain();o.type='sine';o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(150,t+1.6);o.frequency.exponentialRampToValueAtTime(270,t+3.2);env(gg,t,.6,.02,2.8,.6);o.connect(gg);gg.connect(A.sendL);gg.connect(A.duck);o.start(t);o.stop(t+7);}}
    const v4=[tr[0]+24,tr[1]+24,tr[2]+24,tr[0]+36],ap=[0,1,2,3,2,1,0,1];harp(n2f(v4[ap[st]]),t,.03);
    const m=PMEL[bar][st];if(m&&ph%2===0)flute(n2f(m),t,STEP.pathos*(PMEL[bar][st+1]===0?2.6:1.6),.05);
    const oc=OMEL[bar][st];if(oc&&ph%2===1)ocarina(n2f(oc+12),t,STEP.pathos*2.4,.05);
  }else if(mode==='arctic'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.arctic[bar],tr=triad(r,q);
    if(st===0){softpad(tr.map(m=>m+12),t,STEP.arctic*8,.026);osc('sine',n2f(r-12),t,STEP.arctic*8,.09,A.duck,{a:1.2,rel:1});nz(t,STEP.arctic*8,.028,A.duck,{type:'bandpass',f:450,f2:1500,q:1.6,a:STEP.arctic*4,rel:1});if(bar===0&&Math.floor(s/32)%2===1)taiko(t,.22);}
    const p=ARCPAT[Math.floor(s/32)%2][bar*8+st];if(p>=0)bell(n2f(tr[p%3]+36+(p>=3?12:0)),t,.05);
    if(bar===3&&st===5)bell(n2f(tr[2]+48),t,.028);
  }else if(mode==='home'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.home[bar],ch=CH7[q].map(x=>r+24+x),tt=t+((st&1)?STEP.home*.22:0);
    if(st===0||st===4)osc('sine',110,tt,.18,.32,A.duck,{glide:50,gt:.1,rel:.06});
    if(st%2===0)osc('triangle',n2f([r,r+7,r+12,r+7][st/2]),tt,STEP.home*1.6,.12,A.duck,{lp:900,rel:.12});
    nz(tt,.04,(st&1)?.022:.035,A.duck,{type:'bandpass',f:6000,q:.8});
    if(st===2||st===6||(st===7&&bar===3))for(const m of ch)epiano(n2f(m),tt,.032);
    if(Math.floor(s/32)%2===1){const m=HOMEMEL[bar][st];if(m)whistle(n2f(m),tt,STEP.home*1.7,.04);}
  }else if(mode==='credits'){const cyc=Math.floor(s/64)%3,bar=Math.floor(s/8)%8,st=s%8,[r,q]=PROG.credits[bar],tr=triad(r,q);
    if(st===0){pad(triad(r+12,q),t,STEP.credits*8,.04);osc('sine',n2f(r-12),t,STEP.credits*8,.11,A.duck,{a:.4,rel:.8});if(cyc>=1)taiko(t,cyc===2?.5:.28);if(cyc===2&&(bar===0||bar===4))braam(r,t,.12);}
    const m=CRMEL[bar][st];if(m){piano(n2f(m),t,.09);if(cyc===2)osc('sawtooth',n2f(m-12),t,STEP.credits*1.6,.025,A.duck,{a:.08,rel:.4,lp:1800,send:A.sendM});}
    if(cyc>=1){const arp=[0,1,2,1,0,1,2,1];piano(n2f(tr[arp[st]]+12),t,.035);}
  }else if(mode==='win'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.win[bar],tr=triad(r,q);
    if(st===0){pad(triad(r+12,q),t,STEP.win*8,.05);osc('sine',n2f(r-12),t,STEP.win*8,.12,A.duck,{a:.5,rel:.8});taiko(t,.4);}
    osc('triangle',n2f(tr[st%3]+36),t,.12,.03,A.duck,{send:A.sendM,rel:.3});
  }
}
