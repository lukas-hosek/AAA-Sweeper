// render/sprites.js — Procedural tile sprites for all six tilesets, numbers, mines, craters.
import {ST} from '../core/shared.js';
import {NUMCOL} from '../data/content.js';
import {rand} from '../core/util.js';
import {SPR} from '../game/state.js';

/* ================= sprites ================= */
function mk(s){const c=document.createElement('canvas');c.width=c.height=s;return c;}
export function plate(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#c6d2db':'#a6b2bc');gr.addColorStop(.55,hover?'#97a6b1':'#7d8a94');gr.addColorStop(1,hover?'#6f7c86':'#56616a');g.fillStyle=gr;g.fillRect(0,0,s,s);
  for(let y=0;y<s;y++){g.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;g.fillRect(0,y,s,1);}
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(0,0);g.lineTo(s,0);g.lineTo(s-b,b);g.lineTo(b,b);g.lineTo(b,s-b);g.lineTo(0,s);g.closePath();g.fill();
  g.fillStyle='rgba(8,14,20,.62)';g.beginPath();g.moveTo(s,s);g.lineTo(0,s);g.lineTo(b,s-b);g.lineTo(s-b,s-b);g.lineTo(s-b,b);g.lineTo(s,0);g.closePath();g.fill();
  const sp=g.createRadialGradient(s*.3,s*.25,0,s*.3,s*.25,s*.75);sp.addColorStop(0,'rgba(255,255,255,.38)');sp.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sp;g.fillRect(b,b,s-2*b,s-2*b);
  if(s>=44){g.fillStyle='rgba(0,0,0,.35)';for(const[x,y]of[[b*2,b*2],[s-b*2,b*2],[b*2,s-b*2],[s-b*2,s-b*2]]){g.beginPath();g.arc(x,y,s*.03,0,6.283);g.fill();}}
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openTile(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#1f2830');gr.addColorStop(1,'#12181d');g.fillStyle=gr;g.fillRect(0,0,s,s);
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
export function numSprite(s,n){const c=mk(s),g=c.getContext('2d');g.font=`600 ${Math.round(s*.92)}px Teko, "Arial Narrow", sans-serif`;g.textAlign='center';g.textBaseline='alphabetic';
  const m=g.measureText(String(n));const asc=m.actualBoundingBoxAscent||s*.6,desc=m.actualBoundingBoxDescent||0;const y=s/2+(asc-desc)/2;
  g.shadowColor=NUMCOL[n];g.shadowBlur=s*.38;g.fillStyle=NUMCOL[n];g.fillText(n,s/2,y);g.shadowBlur=s*.12;g.fillText(n,s/2,y);g.shadowBlur=0;g.globalAlpha=.5;g.fillStyle='#fff';g.fillText(n,s/2,y-s*.01);g.globalAlpha=1;g.fillStyle=NUMCOL[n];g.globalAlpha=.6;g.fillText(n,s/2,y);return c;}
function drawMine(g,cx,cy,r){g.strokeStyle='#07090b';g.lineWidth=Math.max(1,r*.32);g.lineCap='round';for(let k=0;k<8;k++){const a=k*Math.PI/4,l=r*(k%2?1.35:1.6);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l);g.stroke();}
  const gr=g.createRadialGradient(cx-r*.35,cy-r*.35,r*.1,cx,cy,r);gr.addColorStop(0,'#6a7580');gr.addColorStop(1,'#07090b');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(cx-r*.38,cy-r*.38,r*.22,0,6.283);g.fill();}
function craterSprite(s,ts){const c=ts===1?openSand(s):ts===2?openClub(s):ts===3?openIce(s):ts===4?openLawn(s):ts===5?openSub(s):openTile(s),g=c.getContext('2d');const gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s*.7);gr.addColorStop(0,'rgba(255,120,40,.55)');gr.addColorStop(.35,'rgba(120,30,10,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;for(let k=0;k<6;k++){const a=rand(0,6.283);g.beginPath();g.moveTo(s/2,s/2);g.lineTo(s/2+Math.cos(a)*s*.5,s/2+Math.sin(a)*s*.5);g.stroke();}drawMine(g,s/2,s/2,s*.2);return c;}
function speck(g,s,n,a,b){for(let k=0;k<n;k++){g.fillStyle=Math.random()<.5?a:b;g.fillRect(Math.random()*s,Math.random()*s,1,1);}}
function bevel(g,s,b,lite,dark){g.fillStyle=lite;g.beginPath();g.moveTo(0,0);g.lineTo(s,0);g.lineTo(s-b,b);g.lineTo(b,b);g.lineTo(b,s-b);g.lineTo(0,s);g.closePath();g.fill();g.fillStyle=dark;g.beginPath();g.moveTo(s,s);g.lineTo(0,s);g.lineTo(b,s-b);g.lineTo(s-b,s-b);g.lineTo(s-b,b);g.lineTo(s,0);g.closePath();g.fill();}
export function plateSand(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#f8e0ae':'#e8c993');gr.addColorStop(.55,hover?'#e0bd84':'#cda46c');gr.addColorStop(1,hover?'#ba915b':'#a37b48');g.fillStyle=gr;g.fillRect(0,0,s,s);
  speck(g,s,s*s/8,'rgba(255,246,222,.22)','rgba(96,58,22,.2)');bevel(g,s,b,'rgba(255,244,214,.5)','rgba(84,50,18,.55)');
  if(Math.random()<.55){g.strokeStyle='rgba(96,58,26,.5)';g.lineWidth=Math.max(.7,s*.025);g.beginPath();let x=rand(b,s-b),y=b;g.moveTo(x,y);for(let k=0;k<3;k++){x+=rand(-s*.15,s*.15);y+=rand(s*.12,s*.28);g.lineTo(x,y);}g.stroke();}
  if(Math.random()<.3){g.globalCompositeOperation='destination-out';const k=s*.14,cn=Math.floor(Math.random()*4),px=cn%2?s:0,py=cn>1?s:0,dx=cn%2?-k:k,dy=cn>1?-k:k;g.beginPath();g.moveTo(px,py);g.lineTo(px+dx,py);g.lineTo(px,py+dy);g.closePath();g.fill();g.globalCompositeOperation='source-over';}
  g.strokeStyle='rgba(70,40,12,.55)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openSand(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#6f4f30');gr.addColorStop(1,'#4a321e');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/10,'rgba(255,220,170,.12)','rgba(0,0,0,.15)');
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(30,15,5,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(255,220,170,.08)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
export function plateClub(s,hover){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,hover?'#2e2446':'#1b1429');gr.addColorStop(1,hover?'#181029':'#0a0712');g.fillStyle=gr;g.fillRect(0,0,s,s);
  const i=Math.max(1,s*.08);g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=Math.max(1,s*.03);g.strokeRect(i,i,s-2*i,s-2*i);
  const gl=g.createLinearGradient(0,0,s*.6,s*.6);gl.addColorStop(0,'rgba(255,255,255,.24)');gl.addColorStop(.5,'rgba(255,255,255,.05)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.beginPath();g.moveTo(0,0);g.lineTo(s,0);g.lineTo(0,s);g.closePath();g.fill();
  g.strokeStyle='rgba(0,0,0,.85)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openClub(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'#150d24');gr.addColorStop(1,'#08050f');g.fillStyle=gr;g.fillRect(0,0,s,s);g.strokeStyle='rgba(255,90,230,.12)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);return c;}
export function plateIce(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#f4fcff':'#e0f2fb');gr.addColorStop(.5,hover?'#bde0f1':'#a6cee4');gr.addColorStop(1,hover?'#8ab8d4':'#719fbf');g.fillStyle=gr;g.fillRect(0,0,s,s);
  const rg=g.createRadialGradient(s*.55,s*.6,s*.05,s*.5,s*.5,s*.7);rg.addColorStop(0,'rgba(50,110,165,.28)');rg.addColorStop(1,'rgba(50,110,165,0)');g.fillStyle=rg;g.fillRect(0,0,s,s);
  speck(g,s,s*s/12,'rgba(255,255,255,.55)','rgba(255,255,255,.2)');
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=Math.max(.6,s*.018);for(let k=0;k<2;k++)if(Math.random()<.6){g.beginPath();let x=rand(0,s),y=rand(0,s);g.moveTo(x,y);for(let j=0;j<3;j++){x+=rand(-s*.25,s*.25);y+=rand(-s*.25,s*.25);g.lineTo(x,y);}g.stroke();}
  bevel(g,s,b,'rgba(255,255,255,.62)','rgba(30,70,105,.5)');
  const gl=g.createLinearGradient(0,0,s,s);gl.addColorStop(0,'rgba(255,255,255,.38)');gl.addColorStop(.35,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(20,50,80,.55)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openIce(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#143046');gr.addColorStop(1,'#0a1a29');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/16,'rgba(180,220,255,.12)','rgba(0,0,0,.12)');
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(200,235,255,.14)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
export function plateLawn(s,hover,dark){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.09));
  const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,hover?'#95d65e':dark?'#6aa83e':'#7cbc4b');gr.addColorStop(1,hover?'#60a038':dark?'#437a24':'#4f8a2b');g.fillStyle=gr;g.fillRect(0,0,s,s);
  for(let k=0;k<s*1.6;k++){const x=Math.random()*s,y=Math.random()*s,l=rand(s*.05,s*.14);g.strokeStyle=Math.random()<.5?'rgba(195,245,145,.32)':'rgba(25,65,18,.35)';g.lineWidth=Math.max(.6,s*.015);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-1.5,1.5),y-l);g.stroke();}
  bevel(g,s,b,'rgba(225,255,195,.35)','rgba(20,50,15,.5)');g.strokeStyle='rgba(15,40,10,.6)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openLawn(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#5a3d26');gr.addColorStop(1,'#3a2617');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/9,'rgba(255,220,180,.1)','rgba(0,0,0,.2)');
  for(let k=0;k<Math.max(2,s/10);k++){g.fillStyle=Math.random()<.5?'rgba(150,130,110,.6)':'rgba(110,95,80,.6)';g.beginPath();g.ellipse(rand(0,s),rand(0,s),Math.max(.8,s*.03),Math.max(.6,s*.022),rand(0,3),0,6.283);g.fill();}
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(20,10,5,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(120,190,80,.35)';g.fillRect(0,0,s,Math.max(1,s*.03));return c;}
export function plateSub(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#77a3a2':'#5c8483');gr.addColorStop(.55,hover?'#517a79':'#3f6262');gr.addColorStop(1,hover?'#385857':'#2a4444');g.fillStyle=gr;g.fillRect(0,0,s,s);
  speck(g,s,s*s/14,'rgba(190,110,50,.35)','rgba(20,40,40,.3)');
  if(Math.random()<.6){const x=rand(s*.2,s*.8),rg=g.createLinearGradient(0,s*.15,0,s*.75);rg.addColorStop(0,'rgba(170,90,40,.5)');rg.addColorStop(1,'rgba(170,90,40,0)');g.fillStyle=rg;g.fillRect(x-s*.03,s*.15,s*.06,s*.6);}
  const al=g.createLinearGradient(0,s*.68,0,s);al.addColorStop(0,'rgba(60,140,80,0)');al.addColorStop(1,'rgba(60,140,80,.5)');g.fillStyle=al;g.fillRect(0,s*.68,s,s*.32);
  bevel(g,s,b,'rgba(200,240,235,.35)','rgba(5,20,22,.6)');
  for(const[x,y]of[[b*2,b*2],[s-b*2,b*2],[b*2,s-b*2],[s-b*2,s-b*2]]){g.fillStyle='rgba(15,30,30,.85)';g.beginPath();g.arc(x,y,Math.max(1,s*.045),0,6.283);g.fill();g.fillStyle='rgba(220,255,250,.35)';g.fillRect(x-s*.02,y-s*.025,Math.max(1,s*.02),Math.max(1,s*.02));}
  for(let k=0;k<3;k++)if(Math.random()<.7){g.fillStyle='rgba(220,255,255,.35)';g.beginPath();g.ellipse(rand(b*2,s-b*2),rand(b*2,s-b*2),s*.02,s*.03,0,0,6.283);g.fill();}
  g.strokeStyle='rgba(5,15,15,.7)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
export function openSub(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#0a2c35');gr.addColorStop(1,'#04161c');g.fillStyle=gr;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(120,200,210,.08)';g.lineWidth=1;for(let k=-s;k<s;k+=Math.max(4,s/6)){g.beginPath();g.moveTo(k,s);g.lineTo(k+s,0);g.stroke();}
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(140,230,240,.1)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
export const vh=i=>((i*2654435761)>>>0)%SPR.nv;
export function buildSprites(){const s=Math.max(8,Math.round(ST.T*ST.dpr));SPR.s=s;const ts=ST.G?ST.G.tileset:0;
  const mkHid=d=>ts===1?plateSand(s,false):ts===2?plateClub(s,false):ts===3?plateIce(s,false):ts===4?plateLawn(s,false,d):ts===5?plateSub(s,false):plate(s,false);
  SPR.nv=(ts===1||ts===3||ts===4||ts===5)?4:1;SPR.var=[Array.from({length:SPR.nv},()=>mkHid(false))];SPR.var[1]=ts===4?Array.from({length:SPR.nv},()=>mkHid(true)):SPR.var[0];SPR.hid=SPR.var[0][0];
  SPR.hov=ts===1?plateSand(s,true):ts===2?plateClub(s,true):ts===3?plateIce(s,true):ts===4?plateLawn(s,true,false):ts===5?plateSub(s,true):plate(s,true);
  SPR.open=ts===1?openSand(s):ts===2?openClub(s):ts===3?openIce(s):ts===4?openLawn(s):ts===5?openSub(s):openTile(s);
  SPR.num=[null];for(let n=1;n<=8;n++)SPR.num.push(numSprite(s,n));SPR.crater=craterSprite(s,ts);}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(ST.G)buildSprites();});
