// game/pathos.js — Pathos-4 specifics: flood, breath readout (asymptotic), underwater muffle, caustics and light rays.
import {ST} from '../core/shared.js';
import {$,RM,rand} from '../core/util.js';
import {A} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {VM,bark} from '../audio/voices.js';
import {banner} from '../ui/notify.js';
import {CAM,sched} from './state.js';
import {SC} from '../render/scenery.js';
import {emit} from '../render/particles.js';
import {updateHUD} from '../ui/hud.js';

export function bubbleAt(x,y,sz){emit({t:'bubble',x,y,vx:rand(-10,10),vy:-rand(40,120),g:-20,drag:.4,life:rand(2,5),s:sz||rand(1.5,5),ph:rand(0,6)});}
let O2F={k:'',fs:0};
export function o2Set(html,cls,x,y,fs,maxW){const k=html+'|'+cls+'|'+x+'|'+y+'|'+fs+'|'+maxW;if(k===ST.O2K)return;ST.O2K=k;const e=$('#o2');
  const lk=x+'|'+y+'|'+fs+'|'+maxW;if(O2F.k!==lk){O2F.k=lk;O2F.fs=fs;}
  e.className='on '+cls;e.style.fontSize=O2F.fs+'px';e.innerHTML=html;e.style.left=x+'px';e.style.top=y+'px';
  const w=e.offsetWidth;if(w>maxW){O2F.fs=Math.max(14,Math.floor(O2F.fs*maxW/w));e.style.fontSize=O2F.fs+'px';}
  $('#toasts').style.top=Math.round(e.getBoundingClientRect().bottom+8)+'px';}
export function o2Off(force){if(ST.O2K||force){ST.O2K='';O2F.k='';$('#o2').className='';$('#toasts').style.top='';}}
export function fmtBreath(L){const v=Math.pow(10,L);if(L>=1)return String(Math.round(v));
  if(L>=-6)return v.toFixed(Math.min(9,2-Math.floor(L)));
  const e=Math.floor(L),m=Math.min(9.99,Math.pow(10,L-e));return [m.toFixed(2)+'×10','−'+(-e)];}
export function floodNow(){ST.G.flooded=true;ST.G.floodP=1;$('#game').classList.add('flooded');S.flood();
  if(A.ctx){A.mufBase=1200;const f=A.muf.frequency,t=A.ctx.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setTargetAtTime(1200,t,.9);}
  banner('BASE FLOODED','HOLD YOUR BREATH','Breath meter enabled','#6fe3d6');sched(1.6,()=>bark('rp_flood','rpflood',999,{}));sched(10,()=>bark('hc_flood','hcflood',999,{}));
  VM.opening.push('rp_3','jp_3','mp_2');VM.next=Math.max(VM.next,ST.G.clock+14);ST.G.shake=RM?2:8;for(let k=0;k<120;k++)bubbleAt(rand(0,ST.W)-CAM.x,ST.H+rand(0,80),rand(2,7));updateHUD();}
export function makeCaustics(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),id=g.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.283,v=y/N*6.283;let q=Math.sin(u*3+Math.sin(v*2)*1.5)+Math.sin(v*3+Math.sin(u*2+1)*1.5)+Math.sin((u+v)*2+Math.sin(u-v)*1.2);const val=Math.pow(1-Math.min(1,Math.abs(q)/1.2),4),k=(y*N+x)*4;id.data[k]=180*val;id.data[k+1]=240*val;id.data[k+2]=255*val;id.data[k+3]=255;}
  g.putImageData(id,0,0);SC.cau=c;return c;}
export function drawUnderwater(g,t){g.save();g.globalCompositeOperation='lighter';const cs=SC.cau||makeCaustics();g.globalAlpha=.07;
  for(const[ox,oy,sp]of[[t*14,t*9,1],[-t*11,t*13,1.3]]){const s2=512*sp,x0=-(((ox%s2)+s2)%s2),y0=-(((oy%s2)+s2)%s2);for(let x=x0;x<ST.W;x+=s2)for(let y=y0;y<ST.H;y+=s2)g.drawImage(cs,x,y,s2,s2);}
  g.globalAlpha=1;for(let k=0;k<4;k++){const x=ST.W*(.12+.26*k)+Math.sin(t*.2+k)*60,gr=g.createLinearGradient(x,0,x+ST.W*.12,ST.H);gr.addColorStop(0,'rgba(160,230,255,.1)');gr.addColorStop(1,'rgba(160,230,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x-30,0);g.lineTo(x+40,0);g.lineTo(x+ST.W*.2,ST.H);g.lineTo(x+ST.W*.08,ST.H);g.closePath();g.fill();}
  g.restore();}
