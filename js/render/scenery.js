// render/scenery.js — Procedural backgrounds per chapter (bake once, animate per frame) and the title-screen backdrop.
import {ST} from '../core/shared.js';
import {$,clamp,pick,rand} from '../core/util.js';
import {makeCaustics} from '../game/pathos.js';

/* ================= scenery ================= */
export const SC={key:'',w:0,h:0,st:null,fog:null,parts:[],x:{}};
function bake(w,h,fn){const c=document.createElement('canvas');c.width=Math.ceil(w*ST.dpr);c.height=Math.ceil(h*ST.dpr);const g=c.getContext('2d');g.scale(ST.dpr,ST.dpr);fn(g);return c;}
export function ensureScenery(th,w,h){const key=th+':'+w+'x'+h+'@'+ST.dpr;if(SC.key===key)return;SC.key=key;SC.w=w;SC.h=h;SC.x={};SC.parts=[];if(!SC.fog)buildFog();(BUILD[th]||BUILD.battle)(w,h);}
function jag(g,w,h,base,amp,step,col){g.fillStyle=col;g.beginPath();g.moveTo(0,h);let y=base;for(let x=0;x<=w+step;x+=step){y=clamp(y+rand(-amp,amp),base-amp*3,base+amp*2);g.lineTo(x,y);}g.lineTo(w,h);g.closePath();g.fill();}
function buildFog(){const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');for(let k=0;k<80;k++){const x=rand(0,1024),y=rand(60,200),r=rand(40,130);for(const ox of[-1024,0,1024]){const gr=g.createRadialGradient(x+ox,y,0,x+ox,y,r);gr.addColorStop(0,'rgba(200,175,160,.075)');gr.addColorStop(1,'rgba(200,175,160,0)');g.fillStyle=gr;g.fillRect(x+ox-r,y-r,2*r,2*r);}}SC.fog=c;}
function drawFog(g,w,t,y,hh,alpha){const fw=Math.max(w,1024),o1=(t*14)%fw,o2=(t*7)%fw;g.globalAlpha=alpha;for(let x=-o1;x<w;x+=fw)g.drawImage(SC.fog,x,y,fw,hh);g.globalAlpha=alpha*.7;for(let x=o2-fw;x<w;x+=fw)g.drawImage(SC.fog,x,y+hh*.38,fw,hh*.8);g.globalAlpha=1;}
function sunFlare(g,w,h,sx,sy,k,warm){g.globalCompositeOperation='lighter';let gr=g.createRadialGradient(sx,sy,0,sx,sy,70*k);gr.addColorStop(0,`rgba(255,245,220,${.9*k})`);gr.addColorStop(.25,warm?'rgba(255,190,120,.35)':'rgba(255,245,215,.32)');gr.addColorStop(1,'rgba(255,150,80,0)');g.fillStyle=gr;g.fillRect(sx-70*k,sy-70*k,140*k,140*k);
  g.save();g.translate(sx,sy);g.scale(1,.022);gr=g.createRadialGradient(0,0,0,0,0,w*.62);gr.addColorStop(0,`rgba(140,200,255,${.5*k})`);gr.addColorStop(1,'rgba(80,140,255,0)');g.fillStyle=gr;g.fillRect(-w*.62,-w*.62,w*1.24,w*1.24);g.restore();
  const dx=w/2-sx,dy=h/2-sy;for(const[m,r,col]of[[.35,26,'120,170,255'],[.72,14,'255,180,120'],[1.18,46,'120,255,200'],[1.55,22,'190,140,255']]){const x=sx+dx*m,y=sy+dy*m;gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${.07*k})`);gr.addColorStop(.7,`rgba(${col},${.05*k})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
  g.globalCompositeOperation='source-over';}
function birdV(g,x,y,f){g.beginPath();g.moveTo(x-7,y-f);g.quadraticCurveTo(x-3,y-2,x,y);g.quadraticCurveTo(x+3,y-2,x+7,y-f);g.stroke();}
export const BUILD={},DRAW={};
function ember(init){return{x:rand(-60,SC.w),y:init?rand(0,SC.h):SC.h+10,vx:rand(6,30),vy:-rand(14,46),s:rand(.6,2.2),f:rand(0,6.28),hue:rand(18,42)};}
BUILD.battle=(w,h)=>{const hz=h*.64;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#071018');sky.addColorStop(.55,'#192530');sky.addColorStop(1,'#5c3b25');g.fillStyle=sky;g.fillRect(0,0,w,hz+2);
  const sx=w*.84,sy=hz-h*.04;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.6);gr.addColorStop(0,'rgba(255,175,95,.55)');gr.addColorStop(.16,'rgba(225,105,50,.24)');gr.addColorStop(1,'rgba(120,40,20,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  jag(g,w,h,hz-46,9,18,'rgba(70,56,56,.5)');jag(g,w,h,hz-18,7,14,'rgba(38,33,36,.9)');
  g.fillStyle='#17161a';for(let k=0;k<8;k++){const bx=rand(0,w),bw=rand(18,64),bh=rand(18,90);g.beginPath();g.moveTo(bx,hz+8);g.lineTo(bx,hz-bh);let x=bx;while(x<bx+bw){x+=rand(3,9);g.lineTo(Math.min(x,bx+bw),hz-bh+rand(-12,10));}g.lineTo(bx+bw,hz+8);g.closePath();g.fill();
    g.fillStyle='rgba(255,170,90,.18)';for(let wy=hz-bh+14;wy<hz;wy+=10)for(let wx=bx+4;wx<bx+bw-4;wx+=9)if(Math.random()<.12)g.fillRect(wx,wy,3,4);g.fillStyle='#17161a';}
  const tx=w*.16,th=h*.3;g.strokeStyle='#121114';g.lineWidth=1.3;g.beginPath();g.moveTo(tx-15,hz);g.lineTo(tx,hz-th);g.lineTo(tx+15,hz);for(let k=1;k<10;k++){const yy=hz-th*k/10,ww=15*(1-k/10),wn=15*(1-(k+1)/10);g.moveTo(tx-ww,yy);g.lineTo(tx+wn,yy-th/10);g.moveTo(tx+ww,yy);g.lineTo(tx-wn,yy-th/10);}g.stroke();SC.x.tower={x:tx,y:hz-th};
  jag(g,w,h,hz+14,6,10,'#0b0b0e');const gg=g.createLinearGradient(0,hz,0,h);gg.addColorStop(0,'#0d0c0f');gg.addColorStop(1,'#040405');g.fillStyle=gg;g.fillRect(0,hz+34,w,h);});
  SC.parts=Array.from({length:Math.round(clamp(w*h/12000,30,140))},()=>ember(true));};
DRAW.battle=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.64,tw=SC.x.tower;if(tw&&Math.sin(t*3)>.2){g.fillStyle='rgba(255,40,40,.9)';g.beginPath();g.arc(tw.x,tw.y,2.2,0,6.283);g.fill();}
  drawFog(g,w,t,hz-h*.2,h*.4,1);sunFlare(g,w,h,w*.84,hz-h*.04,1,true);
  g.globalCompositeOperation='lighter';for(const e of SC.parts){e.x+=e.vx*dt;e.y+=e.vy*dt;e.f+=dt*6;if(e.y<-10||e.x>w+20)Object.assign(e,ember(false));const a=.45+.45*Math.sin(e.f);g.fillStyle=`hsla(${e.hue},100%,62%,${a})`;g.fillRect(e.x,e.y,e.s,e.s);}g.globalCompositeOperation='source-over';};
function archGate(g,x,b,wd,ht){const p=wd*.22;g.beginPath();g.moveTo(x,b);g.lineTo(x,b-ht);g.lineTo(x+wd,b-ht);g.lineTo(x+wd,b);g.lineTo(x+wd-p,b);g.lineTo(x+wd-p,b-ht*.55);g.arc(x+wd/2,b-ht*.55,(wd-2*p)/2,0,Math.PI,true);g.lineTo(x+p,b);g.closePath();g.fill();}
function palm(g,x,b,hgt,lean,col){g.strokeStyle=col;g.lineCap='round';g.lineWidth=Math.max(2,hgt*.045);const tx=x+lean,ty=b-hgt;g.beginPath();g.moveTo(x,b);g.quadraticCurveTo(x+lean*.15,b-hgt*.5,tx,ty);g.stroke();g.lineWidth=Math.max(1.4,hgt*.028);
  for(let k=0;k<8;k++){const a=-Math.PI/2+(k-3.5)*.42,l=hgt*rand(.32,.46),ex=tx+Math.cos(a)*l*1.1,ey=ty+Math.sin(a)*l*.5+l*.38;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*l*.6,ty+Math.sin(a)*l*.6-l*.12,ex,ey);g.stroke();}}
BUILD.desert=(w,h)=>{const hz=h*.6;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#2a5784');sky.addColorStop(.55,'#86aec6');sky.addColorStop(1,'#f2d7a6');g.fillStyle=sky;g.fillRect(0,0,w,h);
  const sx=w*.7,sy=h*.15;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.5);gr.addColorStop(0,'rgba(255,250,225,.75)');gr.addColorStop(.12,'rgba(255,236,190,.3)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(183,139,104,.55)';for(let k=0;k<4;k++){const mx=rand(-60,w),mw=rand(120,320),mh=rand(35,90),sl=rand(15,40);g.beginPath();g.moveTo(mx,hz+4);g.lineTo(mx+sl,hz-mh);g.lineTo(mx+mw-sl,hz-mh+rand(-6,6));g.lineTo(mx+mw,hz+4);g.closePath();g.fill();}
  g.fillStyle='rgba(160,116,76,.92)';const rb=hz+6,rx=w*.16;archGate(g,rx,rb,70,92);for(let k=0;k<5;k++){const cx=rx+100+k*24,ch=rand(22,72);g.fillRect(cx,rb-ch,10,ch);g.fillRect(cx-3,rb-ch-4,16,5);}
  const dx=w*.7;g.fillRect(dx,rb-40,64,40);g.beginPath();g.ellipse(dx+32,rb-40,27,25,0,Math.PI,0);g.fill();g.fillRect(dx+30,rb-74,4,12);g.fillRect(dx+80,rb-60,12,60);g.beginPath();g.moveTo(dx+80,rb-60);g.lineTo(dx+86,rb-74);g.lineTo(dx+92,rb-60);g.fill();
  const dune=(base,amp,wl,c1,c2)=>{const ph=rand(0,6),yAt=x=>base+Math.sin(x/wl+ph)*amp+Math.sin(x/(wl*.37)+ph*2)*amp*.35;g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+8;x+=8)g.lineTo(x,yAt(x));g.lineTo(w,h);g.closePath();const gg=g.createLinearGradient(0,base-amp,0,base+amp*3+40);gg.addColorStop(0,c1);gg.addColorStop(1,c2);g.fillStyle=gg;g.fill();
    g.strokeStyle='rgba(255,244,215,.35)';g.lineWidth=1.2;g.beginPath();for(let x=0;x<=w+8;x+=8){const y=yAt(x);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();};
  dune(hz+6,10,160,'#e8c995','#d2a86f');palm(g,w*.05,hz+12,70,8,'rgba(70,56,36,.85)');palm(g,w*.09,hz+16,52,-6,'rgba(70,56,36,.85)');palm(g,w*.94,hz+10,64,-10,'rgba(70,56,36,.85)');
  dune(hz+40,16,220,'#e2b97f','#c1915a');dune(hz+92,22,300,'#d7a96c','#a8773f');dune(hz+172,30,380,'#c89255','#8a5a2c');
  g.strokeStyle='rgba(110,70,35,.13)';g.lineWidth=1;for(let k=0;k<60;k++){const x=rand(0,w),y=rand(hz+110,h);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+20,y-4,x+44,y+1);g.stroke();}});
  SC.parts=Array.from({length:Math.round(clamp(w*h/9000,40,200))},()=>({x:rand(0,w),y:rand(h*.3,h),vx:rand(140,380),vy:rand(-8,8),s:rand(.6,1.8),a:rand(.2,.6)}));
  SC.x.birds=[{cx:w*.2,cy:h*.2,r:46,ph:0},{cx:w*.24,cy:h*.24,r:30,ph:2}];};
DRAW.desert=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.6;
  for(let y=Math.floor(hz-36);y<hz+16;y+=4){const dx=Math.sin(y*.35+t*4)*1.3;g.drawImage(SC.st,0,y*ST.dpr,SC.st.width,4*ST.dpr,dx,y,w,4);}
  sunFlare(g,w,h,w*.7,h*.15,.9,false);
  g.strokeStyle='rgba(40,30,25,.75)';g.lineWidth=1.6;for(const b of SC.x.birds){const a=t*.4+b.ph;birdV(g,b.cx+Math.cos(a)*b.r*1.6,b.cy+Math.sin(a)*b.r*.5,Math.sin(t*6+b.ph)*3);}
  const storm=Math.pow(Math.max(0,Math.sin(t*.07)),6);
  for(const p of SC.parts){p.x+=p.vx*dt*(1+storm*1.6);p.y+=p.vy*dt;if(p.x>w+10){p.x=-10;p.y=rand(h*.3,h);}g.fillStyle=`rgba(236,206,156,${clamp(p.a*(.5+storm),0,1)})`;g.fillRect(p.x,p.y,p.s*3,p.s);}
  if(storm>.02){g.fillStyle=`rgba(214,170,110,${storm*.38})`;g.fillRect(0,0,w,h);}};
function neon(g,txt,x,y,sz,col,t){const fl=Math.sin(t*23)>.96?.3:1;g.font=`700 ${Math.round(sz)}px Audiowide,"Chakra Petch",sans-serif`;g.textAlign='center';g.shadowColor=`rgba(${col},1)`;g.shadowBlur=18;g.fillStyle=`rgba(${col},${.85*fl})`;g.fillText(txt,x,y);g.shadowBlur=6;g.fillStyle=`rgba(255,255,255,${.7*fl})`;g.fillText(txt,x,y);g.shadowBlur=0;}
BUILD.club=(w,h)=>{const fl=h*.72;SC.st=bake(w,h,g=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0a0513');gr.addColorStop(.7,'#160b28');gr.addColorStop(.72,'#05030a');gr.addColorStop(1,'#0c0716');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.045)';for(let y=20;y<fl-20;y+=14)for(let x=10;x<w;x+=14)g.fillRect(x,y,3,3);
  const spk=(x,y,sw,sh)=>{g.fillStyle='#0b0a10';g.fillRect(x,y,sw,sh);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,sw-1,sh-1);const n=Math.max(1,Math.floor(sh/(sw*.9)));for(let k=0;k<n;k++){const cy=y+sw*.5+k*sw*.9;g.fillStyle='#16141c';g.beginPath();g.arc(x+sw/2,cy,sw*.36,0,6.283);g.fill();g.strokeStyle='rgba(255,255,255,.1)';g.stroke();g.fillStyle='#050408';g.beginPath();g.arc(x+sw/2,cy,sw*.14,0,6.283);g.fill();}};
  const sw=Math.max(50,w*.05);spk(w*.02,fl-sw*3.6,sw,sw*3.6);spk(w*.02+sw+4,fl-sw*2.7,sw,sw*2.7);spk(w*.98-sw,fl-sw*3.6,sw,sw*3.6);spk(w*.98-2*sw-4,fl-sw*2.7,sw,sw*2.7);
  g.fillStyle='rgba(255,255,255,.06)';g.fillRect(0,fl,w,1);});
  SC.x.crowd=[];const n=Math.round(w/26);for(let k=0;k<=n;k++)SC.x.crowd.push({x:(k+rand(-.3,.3))*26,y:h-rand(0,26),s:rand(.8,1.25),ph:rand(0,1),arms:Math.random()<.3});
  SC.parts=Array.from({length:44},()=>({a:Math.random(),y:rand(h*.05,h*.95),r:rand(1.5,3.5)}));};
DRAW.club=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const b=t*124/60,ph=b%1,pulse=Math.exp(-ph*5),bar=Math.floor(b/4),fl=h*.72;
  g.globalCompositeOperation='lighter';
  for(let k=0;k<4;k++){const hue=(t*30+k*90)%360,x=w*(.5+.42*Math.sin(t*.23+k*1.7)),y=fl*(.45+.3*Math.sin(t*.31+k)),r=Math.max(w,h)*.32;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`hsla(${hue},100%,55%,${.1+.08*pulse})`);gr.addColorStop(1,`hsla(${hue},100%,55%,0)`);g.fillStyle=gr;g.fillRect(0,0,w,fl);}
  const em=[[w*.14,h*.04],[w*.86,h*.04]],col=bar%2?'60,255,110':'255,60,240';
  for(let e=0;e<2;e++)for(let k=0;k<5;k++){const base=e?Math.PI*.62:Math.PI*.38,a=base+(k-2)*.12+Math.sin(t*.9+k+e*2)*.45*(e?-1:1),L=h*1.6,x2=em[e][0]+Math.cos(a)*L,y2=em[e][1]+Math.sin(a)*L;g.beginPath();g.moveTo(em[e][0],em[e][1]);g.lineTo(x2,y2);g.strokeStyle=`rgba(${col},.08)`;g.lineWidth=8;g.stroke();g.strokeStyle=`rgba(${col},${.35+.3*pulse})`;g.lineWidth=1.4;g.stroke();}
  for(const p of SC.parts){const x=((p.a+t*.035)%1)*w;g.fillStyle=`rgba(255,255,255,${.12+.1*Math.sin(t*3+p.y)})`;g.beginPath();g.arc(x,p.y,p.r,0,6.283);g.fill();}
  g.globalCompositeOperation='source-over';
  const mbx=w/2,mby=22;g.strokeStyle='rgba(200,200,220,.5)';g.lineWidth=1;g.beginPath();g.moveTo(mbx,0);g.lineTo(mbx,mby-12);g.stroke();const mg=g.createRadialGradient(mbx-4,mby-4,1,mbx,mby,13);mg.addColorStop(0,'#fff');mg.addColorStop(.4,'#a9a9bd');mg.addColorStop(1,'#3a3a4a');g.fillStyle=mg;g.beginPath();g.arc(mbx,mby,13,0,6.283);g.fill();
  neon(g,'DA CLUB',w*.1,h*.44,Math.max(24,w*.027),'255,70,200',t);neon(g,'VIP',w*.1,h*.33,Math.max(20,w*.02),'80,230,255',t+1.3);
  const bw2=Math.min(180,w*.14),bx=w*.82-bw2/2,by=fl-60,bob=pulse*4;g.fillStyle='#050308';g.beginPath();g.arc(bx+bw2/2,by-26+bob,13,0,6.283);g.fill();g.fillRect(bx+bw2/2-22,by-14+bob,44,30);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;g.beginPath();g.arc(bx+bw2/2,by-28+bob,15,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.fillStyle='#0e0a16';g.fillRect(bx,by,bw2,60);g.fillStyle=`rgba(255,70,200,${.5+.4*pulse})`;g.fillRect(bx,by,bw2,3);g.font=`700 ${Math.max(9,Math.round(bw2*.09))}px "Chakra Petch",sans-serif`;g.textAlign='center';g.fillStyle=`rgba(255,160,235,${.6+.3*pulse})`;g.fillText('DJ DETONATOR',bx+bw2/2,by+32);
  const hc=(t*40)%360,cg=g.createLinearGradient(0,h*.82,0,h);cg.addColorStop(0,`hsla(${hc},90%,50%,0)`);cg.addColorStop(1,`hsla(${hc},90%,50%,.25)`);g.fillStyle=cg;g.fillRect(0,h*.82,w,h*.18);
  g.fillStyle='#030106';g.strokeStyle='#030106';for(const p of SC.x.crowd){const s=p.s,bp=Math.abs(Math.sin((b+p.ph)*Math.PI))*6*s,x=p.x,y=p.y-bp;g.beginPath();g.ellipse(x,y+8*s,15*s,12*s,0,Math.PI,0);g.fill();g.fillRect(x-15*s,y+8*s,30*s,44);g.beginPath();g.arc(x,y-8*s,8*s,0,6.283);g.fill();if(p.arms){g.lineWidth=4*s;g.beginPath();g.moveTo(x-10*s,y);g.lineTo(x-14*s,y-24*s-bp);g.moveTo(x+10*s,y);g.lineTo(x+14*s,y-24*s-bp);g.stroke();}}
  if(Math.floor(b)%16===15&&ph<.12){g.fillStyle='rgba(255,255,255,.14)';g.fillRect(0,0,w,h);}};
BUILD.arctic=(w,h)=>{const hz=h*.62;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#01040b');sky.addColorStop(.55,'#071a2e');sky.addColorStop(1,'#173a55');g.fillStyle=sky;g.fillRect(0,0,w,h);
  for(let k=0;k<Math.round(w*h/2600);k++){g.fillStyle=`rgba(255,255,255,${rand(.15,.8)})`;const s=Math.random()<.08?1.6:1;g.fillRect(rand(0,w),rand(0,hz*.95),s,s);}
  const mtn=(base,amp,step,col,snow)=>{const pts=[];let y=base;for(let x=0;x<=w+step;x+=step){y=clamp(y+rand(-amp,amp),base-amp*4,base+amp);pts.push([x,y]);}g.fillStyle=col;g.beginPath();g.moveTo(0,h);for(const[x,yy]of pts)g.lineTo(x,yy);g.lineTo(w,h);g.closePath();g.fill();g.strokeStyle=snow;g.lineWidth=2.2;g.beginPath();pts.forEach(([x,yy],i)=>i?g.lineTo(x,yy):g.moveTo(x,yy));g.stroke();};
  mtn(hz-40,16,22,'#1c3246','rgba(220,236,248,.45)');mtn(hz-8,10,16,'#2a465e','rgba(230,242,252,.55)');
  const ice=g.createLinearGradient(0,hz,0,h);ice.addColorStop(0,'#a9c7dc');ice.addColorStop(1,'#56778f');g.fillStyle=ice;g.fillRect(0,hz+10,w,h);
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;for(let k=0;k<26;k++){let x=rand(0,w),y=rand(hz+20,h);g.beginPath();g.moveTo(x,y);for(let j=0;j<4;j++){x+=rand(-40,40);y+=rand(-6,10);g.lineTo(x,y);}g.stroke();}
  const sx=w*.84,sb=hz+16;g.fillStyle='#c6d3dc';g.beginPath();g.arc(sx,sb,34,Math.PI,0);g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(sx,sb);g.arc(sx,sb,34,Math.PI*1.5,0);g.closePath();g.fill();
  g.fillStyle='#8fa3b1';g.fillRect(sx+40,sb-26,70,22);g.fillRect(sx-110,sb-22,64,18);g.fillStyle='#3b4a55';for(const xx of[sx+44,sx+104,sx-106,sx-52])g.fillRect(xx,sb-4,3,8);
  g.fillStyle='#ffd27a';for(let k=0;k<5;k++)g.fillRect(sx+46+k*12,sb-20,6,5);for(let k=0;k<4;k++)g.fillRect(sx-104+k*14,sb-17,6,5);
  g.strokeStyle='#5d6f7c';g.lineWidth=1.5;g.beginPath();g.moveTo(sx+75,sb-26);g.lineTo(sx+75,sb-120);g.stroke();for(let k=1;k<6;k++){g.beginPath();g.moveTo(sx+69,sb-26-k*17);g.lineTo(sx+81,sb-26-k*17);g.stroke();}SC.x.mast={x:sx+75,y:sb-120};});
  const strip=document.createElement('canvas');strip.width=4;strip.height=256;const sg=strip.getContext('2d'),ag=sg.createLinearGradient(0,256,0,0);ag.addColorStop(0,'rgba(90,255,170,0)');ag.addColorStop(.12,'rgba(90,255,170,.9)');ag.addColorStop(.45,'rgba(60,220,200,.45)');ag.addColorStop(.8,'rgba(150,90,255,.25)');ag.addColorStop(1,'rgba(150,90,255,0)');sg.fillStyle=ag;sg.fillRect(0,0,4,256);SC.x.aur=strip;
  SC.parts=Array.from({length:Math.round(clamp(w*h/8000,50,220))},()=>({x:rand(0,w),y:rand(0,h),vy:rand(18,55),s:rand(1,2.6),ph:rand(0,6)}));};
DRAW.arctic=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.62;g.globalCompositeOperation='lighter';
  for(let c=0;c<3;c++){const base=h*(.2+c*.06),ph=c*2.1;for(let x=0;x<w;x+=5){const y0=base+Math.sin(x*.004+t*.15+ph)*40+Math.sin(x*.011-t*.3+ph)*14,len=90+60*Math.sin(x*.007+t*.4+ph);g.globalAlpha=clamp(.16+.12*Math.sin(x*.02+t*.8+ph),0,1)*(c===1?.8:1);g.drawImage(SC.x.aur,x,y0-len,6,len+10);}}
  g.globalAlpha=1;if(SC.x.mast&&Math.sin(t*2.5)>.3){g.fillStyle='rgba(255,50,50,.9)';g.beginPath();g.arc(SC.x.mast.x,SC.x.mast.y,2,0,6.283);g.fill();}
  const sp=(t%17)/17;if(sp<.06){const p=sp/.06,x=w*(.1+.5*p),y=h*(.08+.12*p),gr=g.createLinearGradient(x,y,x-60,y-18);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x-60,y-18);g.stroke();}
  g.globalCompositeOperation='source-over';
  const mist=g.createLinearGradient(0,hz-60,0,hz+80);mist.addColorStop(0,'rgba(200,225,245,0)');mist.addColorStop(.5,'rgba(200,225,245,.16)');mist.addColorStop(1,'rgba(200,225,245,0)');g.fillStyle=mist;g.fillRect(0,hz-60,w,140);
  g.fillStyle='#fff';for(const p of SC.parts){p.y+=p.vy*dt;p.x+=Math.sin(t+p.ph)*.4;if(p.y>h+4){p.y=-4;p.x=rand(0,w);}g.globalAlpha=.45+.4*Math.abs(Math.sin(p.ph));g.fillRect(p.x,p.y,p.s,p.s);}g.globalAlpha=1;};
BUILD.home=(w,h)=>{const hz=h*.6;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#5f7fb5');sky.addColorStop(.6,'#e9a978');sky.addColorStop(1,'#ffd08e');g.fillStyle=sky;g.fillRect(0,0,w,h);
  const sx=w*.14,sy=hz-24;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.55);gr.addColorStop(0,'rgba(255,230,170,.8)');gr.addColorStop(.12,'rgba(255,190,120,.35)');gr.addColorStop(1,'rgba(255,160,90,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,220,200,.25)';for(let k=0;k<6;k++){g.beginPath();g.ellipse(rand(0,w),rand(h*.08,h*.35),rand(60,160),rand(6,14),0,0,6.283);g.fill();}
  g.fillStyle='rgba(84,92,80,.75)';for(let x=-20;x<w+20;x+=rand(18,34)){g.beginPath();g.arc(x,hz-rand(4,22),rand(14,26),0,6.283);g.fill();}g.fillRect(0,hz-10,w,14);
  const house=(x,b,hw,hh,col,lit)=>{g.fillStyle=col;g.fillRect(x,b-hh,hw,hh);g.beginPath();g.moveTo(x-6,b-hh);g.lineTo(x+hw/2,b-hh-hw*.42);g.lineTo(x+hw+6,b-hh);g.closePath();g.fill();g.fillRect(x+hw*.7,b-hh-hw*.42,hw*.1,hw*.3);if(lit){g.fillStyle='#ffd27a';for(let k=0;k<3;k++)if(Math.random()<.7)g.fillRect(x+hw*(.15+k*.27),b-hh*.7,hw*.13,hh*.22);}};
  for(let k=0;k<8;k++){const hw=rand(60,110);house(rand(-30,w),hz+4,hw,rand(40,62),'#3c3344',Math.random()<.6);}
  const mw=Math.min(240,w*.18),mx=w*.8-mw/2,mb=hz+30;house(mx,mb,mw,mw*.5,'#4a3a42',false);g.fillStyle='#ffdc8a';g.fillRect(mx+mw*.62,mb-mw*.36,mw*.16,mw*.14);g.fillStyle='#2a1f24';g.fillRect(mx+mw*.42,mb-mw*.3,mw*.14,mw*.3);SC.x.tv={x:mx+mw*.12,y:mb-mw*.36,w:mw*.16,h:mw*.14};
  g.fillStyle='#2b2422';g.fillRect(w*.07,hz-30,10,70);g.fillStyle='#2d4628';for(let k=0;k<14;k++){g.beginPath();g.arc(w*.07+5+rand(-46,46),hz-60+rand(-40,26),rand(18,32),0,6.283);g.fill();}
  const lw=g.createLinearGradient(0,hz+30,0,h);lw.addColorStop(0,'#6b9447');lw.addColorStop(1,'#2c4c22');g.fillStyle=lw;g.fillRect(0,hz+30,w,h);g.fillStyle='rgba(255,255,255,.05)';for(let x=0;x<w;x+=80)g.fillRect(x,hz+30,40,h);
  const fy=hz+30;g.fillStyle='#efe8d8';g.fillRect(0,fy-26,w,4);g.fillRect(0,fy-12,w,4);for(let x=4;x<w;x+=16){g.fillStyle='#efe8d8';g.beginPath();g.moveTo(x,fy);g.lineTo(x,fy-34);g.lineTo(x+5,fy-40);g.lineTo(x+10,fy-34);g.lineTo(x+10,fy);g.closePath();g.fill();g.fillStyle='rgba(120,90,70,.25)';g.fillRect(x+7,fy-34,3,34);}
  for(let x=10;x<w;x+=rand(10,22)){g.fillStyle='#2f5a24';g.fillRect(x,fy+4,1.5,10);g.fillStyle=pick(['#ff4d6d','#ffd23f','#ff8fab','#ffffff']);g.beginPath();g.arc(x+.7,fy+4,3.2,0,6.283);g.fill();}
  const gx=w*.3,gy=fy+22;g.fillStyle='#d64545';g.beginPath();g.moveTo(gx-6,gy-10);g.lineTo(gx,gy-26);g.lineTo(gx+6,gy-10);g.closePath();g.fill();g.fillStyle='#f3d3b5';g.fillRect(gx-4,gy-10,8,6);g.fillStyle='#fff';g.beginPath();g.moveTo(gx-5,gy-5);g.lineTo(gx,gy+4);g.lineTo(gx+5,gy-5);g.closePath();g.fill();g.fillStyle='#3b6fd6';g.fillRect(gx-5,gy-1,10,10);});
  SC.parts=Array.from({length:60},()=>({x:rand(0,w),y:rand(h*.3,h),vx:rand(-8,8),vy:rand(-6,6),ph:rand(0,6)}));};
DRAW.home=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.6;sunFlare(g,w,h,w*.14,hz-24,.8,true);
  const tv=SC.x.tv;if(tv){g.fillStyle=`rgba(120,170,255,${.35+.3*Math.abs(Math.sin(t*7)*Math.sin(t*2.3))})`;g.fillRect(tv.x,tv.y,tv.w,tv.h);}
  for(let k=0;k<10;k++){const p=(t*.18+k/10)%1,x=w*.22+Math.sin(p*6+k)*8*p+p*30,y=hz+40-p*160,r=6+p*26;g.fillStyle=`rgba(230,225,220,${.18*(1-p)})`;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();}
  g.globalCompositeOperation='lighter';for(const p of SC.parts){p.x+=p.vx*dt+Math.sin(t+p.ph)*.2;p.y+=p.vy*dt+Math.cos(t*.8+p.ph)*.2;if(p.x<0)p.x+=w;if(p.x>w)p.x-=w;if(p.y<h*.25)p.y=h;if(p.y>h)p.y=h*.25;g.fillStyle=`rgba(255,235,150,${.25+.25*Math.sin(t*2+p.ph)})`;g.beginPath();g.arc(p.x,p.y,1.6,0,6.283);g.fill();}g.globalCompositeOperation='source-over';
  const bp=(t%23)/23;if(bp<.35){const p=bp/.35;g.strokeStyle='rgba(40,30,40,.7)';g.lineWidth=1.4;for(let k=0;k<3;k++)birdV(g,w*(-.05+1.1*p)-k*18,h*.18+k*8+Math.sin(p*20+k)*3,Math.sin(t*8+k)*3);}};
BUILD.pathos=(w,h)=>{SC.st=bake(w,h,g=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0e1f25');gr.addColorStop(.6,'#0a171b');gr.addColorStop(1,'#050b0d');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(150,210,210,.06)';g.lineWidth=2;for(let x=60;x<w;x+=140){g.beginPath();g.moveTo(x,h*.13);g.lineTo(x,h*.86);g.stroke();}
  for(const y of[h*.13,h*.86]){g.fillStyle='rgba(150,210,210,.07)';g.fillRect(0,y,w,3);}
  const R=Math.max(34,Math.min(w,h)*.085);SC.x.ports=[[w*.07,h*.44],[w*.93,h*.44],[w*.07,h*.7],[w*.93,h*.7],[w*.3,h*.3],[w*.7,h*.3]].map(([x,y])=>({x,y,r:R}));
  for(const p of SC.x.ports){const ring=g.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,p.r*.2,p.x,p.y,p.r*1.25);ring.addColorStop(0,'#6d8c8f');ring.addColorStop(1,'#1d2d30');g.fillStyle=ring;g.beginPath();g.arc(p.x,p.y,p.r*1.22,0,6.283);g.fill();
    const gl=g.createLinearGradient(0,p.y-p.r,0,p.y+p.r);gl.addColorStop(0,'#0f4a6a');gl.addColorStop(1,'#03141f');g.fillStyle=gl;g.beginPath();g.arc(p.x,p.y,p.r,0,6.283);g.fill();
    g.fillStyle='#1a2629';for(let k=0;k<12;k++){const a=k/12*6.283;g.beginPath();g.arc(p.x+Math.cos(a)*p.r*1.11,p.y+Math.sin(a)*p.r*1.11,p.r*.045,0,6.283);g.fill();}}
  const pipe=(y,r)=>{const pg=g.createLinearGradient(0,y-r,0,y+r);pg.addColorStop(0,'#5d7376');pg.addColorStop(.5,'#2c3c3f');pg.addColorStop(1,'#141d1f');g.fillStyle=pg;g.fillRect(0,y-r,w,2*r);g.fillStyle='rgba(0,0,0,.4)';for(let x=80;x<w;x+=220)g.fillRect(x,y-r-2,10,2*r+4);};
  pipe(h*.05,10);pipe(h*.09,6);pipe(h*.93,9);
  g.strokeStyle='#a34a2a';g.lineWidth=3;for(const x of[w*.2,w*.8]){g.beginPath();g.arc(x,h*.05,14,0,6.283);g.stroke();g.beginPath();g.moveTo(x-14,h*.05);g.lineTo(x+14,h*.05);g.moveTo(x,h*.05-14);g.lineTo(x,h*.05+14);g.stroke();}
  const sy=h*.86;g.save();g.beginPath();g.rect(0,sy,w,10);g.clip();g.fillStyle='#c9a227';g.fillRect(0,sy,w,10);g.fillStyle='#1a1a1a';for(let x=-20;x<w+20;x+=24){g.beginPath();g.moveTo(x,sy+10);g.lineTo(x+12,sy);g.lineTo(x+24,sy);g.lineTo(x+12,sy+10);g.closePath();g.fill();}g.restore();
  g.strokeStyle='rgba(140,190,190,.08)';g.lineWidth=1;for(let x=0;x<w;x+=12){g.beginPath();g.moveTo(x,h*.87+4);g.lineTo(x+6,h);g.stroke();}
  g.font='700 13px "Chakra Petch",sans-serif';g.fillStyle='rgba(210,230,220,.32)';g.textAlign='left';g.fillText('PATHOS-4 · DECK C · −300 M',w*.03,h*.18);g.textAlign='right';g.fillText('WATERTIGHT DOOR 7 · KEEP CLOSED',w*.97,h*.18);g.textAlign='left';});
  SC.x.fish=Array.from({length:14},(_,i)=>({p:i%6,o:Math.random(),y:rand(-.6,.6),sp:rand(.03,.09)*(Math.random()<.5?1:-1),s:rand(.12,.28)}));
  SC.parts=Array.from({length:60},()=>({x:rand(0,w),y:rand(0,h),vy:-rand(15,45),s:rand(1,3.5),ph:rand(0,6)}));
  SC.x.drips=Array.from({length:10},()=>({x:rand(0,w),y:h*.1,v:0,wait:rand(0,4)}));if(!SC.cau)makeCaustics();};
DRAW.pathos=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const pth=ST.G&&ST.G.theme&&ST.G.theme.bg==='pathos',p=pth?ST.G.floodP:.35,fl=pth&&ST.G.flooded;
  SC.x.ports.forEach((pt,pi)=>{g.save();g.beginPath();g.arc(pt.x,pt.y,pt.r,0,6.283);g.clip();
    for(const f of SC.x.fish){if(f.p!==pi)continue;f.o=(f.o+f.sp*dt+1)%1;const fx=pt.x-pt.r*1.4+f.o*pt.r*2.8,fy=pt.y+f.y*pt.r+Math.sin(t+f.o*9)*3,fs=pt.r*f.s,dir=Math.sign(f.sp);g.fillStyle='rgba(2,10,16,.75)';g.beginPath();g.ellipse(fx,fy,fs,fs*.45,0,0,6.283);g.fill();g.beginPath();g.moveTo(fx-dir*fs*.9,fy);g.lineTo(fx-dir*fs*1.5,fy-fs*.4);g.lineTo(fx-dir*fs*1.5,fy+fs*.4);g.closePath();g.fill();}
    g.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const a=t*.3+k*1.1+pi*2;g.fillStyle=`rgba(80,255,220,${.25+.2*Math.sin(t*2+k)})`;g.beginPath();g.arc(pt.x+Math.cos(a)*pt.r*.6,pt.y+Math.sin(a*1.3)*pt.r*.6,1.6,0,6.283);g.fill();}
    const sh=g.createLinearGradient(pt.x-pt.r,pt.y-pt.r,pt.x,pt.y);sh.addColorStop(0,'rgba(160,230,255,.18)');sh.addColorStop(1,'rgba(160,230,255,0)');g.fillStyle=sh;g.fillRect(pt.x-pt.r,pt.y-pt.r,pt.r*2,pt.r*2);g.restore();
    g.strokeStyle='rgba(220,250,255,.25)';g.lineWidth=2;g.beginPath();g.arc(pt.x,pt.y,pt.r*.82,Math.PI*1.1,Math.PI*1.45);g.stroke();});
  const wl=fl?-20:h*(1-.92*p);
  if(!fl){const a=(Math.sin(t*4)+1)/2;g.fillStyle=`rgba(255,30,20,${.04+.08*a})`;g.fillRect(0,0,w,h);g.fillStyle=`rgba(255,60,40,${.5+.5*a})`;g.beginPath();g.arc(w/2,h*.05,6,0,6.283);g.fill();
    g.fillStyle='rgba(170,230,255,.6)';for(const d of SC.x.drips){if(d.wait>0){d.wait-=dt;continue;}d.v+=500*dt;d.y+=d.v*dt;g.fillRect(d.x,d.y,1.5,5);if(d.y>wl){d.y=h*.1;d.v=0;d.wait=rand(1,5);d.x=rand(0,w);}}}
  const wy=x=>wl+Math.sin(x*.02+t*2)*4+Math.sin(x*.05-t*3)*2;
  g.save();g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+10;x+=10)g.lineTo(x,wy(x));g.lineTo(w,h);g.closePath();const wg=g.createLinearGradient(0,Math.max(0,wl),0,h);wg.addColorStop(0,'rgba(30,130,150,.38)');wg.addColorStop(1,'rgba(5,40,60,.62)');g.fillStyle=wg;g.fill();g.clip();
  g.globalCompositeOperation='lighter';g.globalAlpha=.08;const cs=SC.cau,s2=512,ox=((t*14)%s2+s2)%s2,oy=((t*6)%s2+s2)%s2;for(let x=-ox;x<w;x+=s2)for(let y=-oy;y<h;y+=s2)g.drawImage(cs,x,y,s2,s2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.strokeStyle='rgba(200,245,255,.45)';g.lineWidth=1;for(const b of SC.parts){b.y+=b.vy*dt;b.x+=Math.sin(t*2+b.ph)*.3;if(b.y<wl+4){b.y=h+5;b.x=rand(0,w);}g.beginPath();g.arc(b.x,b.y,b.s,0,6.283);g.stroke();}
  g.restore();
  if(!fl){g.strokeStyle='rgba(190,245,255,.55)';g.lineWidth=1.5;g.beginPath();for(let x=0;x<=w+10;x+=10){const y=wy(x);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}};
export function drawBackground(g,w,h,t,dt,th){th=th||'battle';ensureScenery(th,w,h);(DRAW[th]||DRAW.battle)(g,w,h,t,dt);}
export function drawTitle(t,dt){const c=$('#tcv'),g=c.getContext('2d');g.setTransform(ST.dpr,0,0,ST.dpr,0,0);drawBackground(g,ST.W,ST.H,t,dt,'battle');const v=g.createRadialGradient(ST.W/2,ST.H*.42,0,ST.W/2,ST.H*.42,Math.max(ST.W,ST.H)*.75);v.addColorStop(0,'rgba(0,0,0,.2)');v.addColorStop(1,'rgba(0,0,0,.82)');g.fillStyle=v;g.fillRect(0,0,ST.W,ST.H);}
