// render/blood.js — Damage overlay: blood splats, drips and hit-direction arcs.
import {ST} from '../core/shared.js';
import {$,clamp,now,rand} from '../core/util.js';
import {settings} from '../core/storage.js';

/* ================= blood ================= */
export const BL={s:[],ind:[],on:false};
export function bloodHit(sx,sy){if(!settings.blood)return;const m=Math.min(ST.W,ST.H),n=4+Math.floor(Math.random()*4);
  for(let k=0;k<n;k++){const side=Math.floor(Math.random()*4),ins=rand(-.04,.16)*m;let x,y;if(side===0){x=rand(0,ST.W);y=ins;}else if(side===1){x=ST.W-ins;y=rand(0,ST.H);}else if(side===2){x=rand(0,ST.W);y=ST.H-ins;}else{x=ins;y=rand(0,ST.H);}BL.s.push(makeSplat(x,y,rand(.045,.11)*m));}
  if(Math.random()<.7)BL.s.push(makeSplat(rand(ST.W*.25,ST.W*.75),rand(ST.H*.2,ST.H*.8),rand(.025,.05)*m));
  while(BL.s.length>18)BL.s.shift();BL.ind.push({a:Math.atan2(sy-ST.H/2,sx-ST.W/2),t0:now()});BL.on=true;}
function makeSplat(x,y,r){const S=Math.ceil(r*4.4),c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const cx=S/2,cy=S/2;
  const blob=(bx,by,br,n,jit)=>{g.beginPath();for(let k=0;k<=n;k++){const a=k/n*6.283,rr=br*(1+rand(-jit,jit)),px=bx+Math.cos(a)*rr,py=by+Math.sin(a)*rr;k?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();};
  g.fillStyle='rgba(92,0,0,.9)';const ns=4+Math.floor(Math.random()*6);for(let k=0;k<ns;k++){const a=rand(0,6.283),l=rand(r*.9,r*2),w=rand(r*.06,r*.16);g.save();g.translate(cx,cy);g.rotate(a);g.beginPath();g.ellipse(l*.55,0,l*.55,w,0,0,6.283);g.fill();g.restore();}
  const gr=g.createRadialGradient(cx-r*.2,cy-r*.2,r*.1,cx,cy,r*1.15);gr.addColorStop(0,'rgba(140,8,8,.96)');gr.addColorStop(.7,'rgba(98,0,0,.96)');gr.addColorStop(1,'rgba(58,0,0,.96)');g.fillStyle=gr;blob(cx,cy,r,18,.28);
  g.fillStyle='rgba(120,4,4,.9)';blob(cx+r*.1,cy+r*.05,r*.55,12,.3);
  g.fillStyle='rgba(100,0,0,.92)';const nd=8+Math.floor(Math.random()*10);for(let k=0;k<nd;k++){const a=rand(0,6.283),d=rand(r*1.05,r*2),rr=rand(r*.03,r*.14);g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,rr,0,6.283);g.fill();}
  g.fillStyle='rgba(255,190,190,.11)';g.beginPath();g.ellipse(cx-r*.3,cy-r*.35,r*.35,r*.16,-.5,0,6.283);g.fill();
  const drips=[];const nk=1+Math.floor(Math.random()*3);for(let k=0;k<nk;k++)drips.push({ox:rand(-r*.6,r*.6),len:0,max:rand(r*.8,r*3.2),sp:rand(10,34),w:rand(r*.07,r*.15)});
  return{x,y,r,S,img:c,drips};}
export function drawBlood(dt){if(!BL.on||!ST.G)return;const c=$('#blood'),g=c.getContext('2d');g.setTransform(ST.dpr,0,0,ST.dpr,0,0);g.clearRect(0,0,ST.W,ST.H);
  if(ST.G.hp>=99.5&&!BL.ind.length&&!ST.G.dead){BL.s.length=0;BL.on=false;c.style.opacity=0;return;}
  c.style.opacity=1;g.globalAlpha=ST.G.dead?1:clamp((100-ST.G.hp)/50,0,1);
  for(const s of BL.s){g.drawImage(s.img,s.x-s.S/2,s.y-s.S/2,s.S,s.S);g.fillStyle='rgba(88,0,0,.92)';for(const d of s.drips){if(d.len<d.max)d.len=Math.min(d.max,d.len+d.sp*dt*(1-d.len/d.max*.7));const x=s.x+d.ox,y=s.y+s.r*.4;g.fillRect(x-d.w/2,y,d.w,d.len);g.beginPath();g.arc(x,y+d.len,d.w*.75,0,6.283);g.fill();}}
  g.globalAlpha=1;const tn=now(),m=Math.min(ST.W,ST.H);BL.ind=BL.ind.filter(i=>tn-i.t0<1.8);
  for(const i of BL.ind){const a=1-(tn-i.t0)/1.8;g.strokeStyle=`rgba(230,30,30,${a*.85})`;g.lineWidth=12;g.lineCap='round';g.shadowColor='rgba(255,0,0,.8)';g.shadowBlur=16;g.beginPath();g.arc(ST.W/2,ST.H/2,m*.3,i.a-.32,i.a+.32);g.stroke();g.shadowBlur=0;}}
