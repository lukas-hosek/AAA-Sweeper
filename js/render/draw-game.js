// render/draw-game.js — Draws the board, flags, crate, quest marker beam and trail.
import {ST} from '../core/shared.js';
import {SKINS} from '../data/content.js';
import {$,RM,clamp,now,rand} from '../core/util.js';
import {PROFILE,settings} from '../core/storage.js';
import {CAM,SPR,ctx,tileCenter} from '../game/state.js';
import {drawUnderwater,fmtBreath,o2Off,o2Set} from '../game/pathos.js';
import {vh} from './sprites.js';
import {drawBackground} from './scenery.js';
import {drawBlood} from './blood.js';
import {drawParticles} from './particles.js';
import {drawCompass,drawMinimap,drawWave} from './hud-canvas.js';

function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
export function drawGame(t,dt){
  const g=ctx;g.setTransform(ST.dpr,0,0,ST.dpr,0,0);drawBackground(g,ST.W,ST.H,t,dt,ST.G.theme.bg);
  let cx=0,cy=0;if(settings.sway&&!RM){cx=Math.sin(t*.37)*1.5;cy=Math.cos(t*.29)*1.1;}if(ST.G.flooded&&!RM){cx+=Math.sin(t*.55)*3.5;cy+=Math.cos(t*.42)*2.5;}if(ST.G.shake>0){cx+=rand(-1,1)*ST.G.shake;cy+=rand(-1,1)*ST.G.shake;}CAM.x=cx;CAM.y=cy;
  g.save();g.translate(cx,cy);
  const pad=Math.max(8,Math.round(ST.T*.34));
  g.save();g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=50;g.shadowOffsetY=18;rr(g,ST.BX-pad,ST.BY-pad,ST.BW+pad*2,ST.BH+pad*2,pad*.6);const FR=[['#323b43','#14191e'],['#8a6a44','#46301c'],['#1d1428','#07040c'],['#a9c6da','#4d6b82'],['#7a4e2c','#3f2614'],['#3f5f63','#14262a']][ST.G.tileset];const fg=g.createLinearGradient(0,ST.BY-pad,0,ST.BY+ST.BH+pad);fg.addColorStop(0,FR[0]);fg.addColorStop(1,FR[1]);g.fillStyle=fg;g.fill();g.restore();
  if(ST.G.tileset===2){g.save();const nc=`hsl(${(t*60)%360},100%,62%)`;g.strokeStyle=nc;g.lineWidth=2;g.shadowColor=nc;g.shadowBlur=16;rr(g,ST.BX-pad+3,ST.BY-pad+3,ST.BW+pad*2-6,ST.BH+pad*2-6,pad*.5);g.stroke();g.restore();}
  g.strokeStyle='rgba(255,255,255,.1)';g.lineWidth=1;rr(g,ST.BX-pad+.5,ST.BY-pad+.5,ST.BW+pad*2-1,ST.BH+pad*2-1,pad*.6);g.stroke();g.strokeStyle='rgba(0,0,0,.8)';g.strokeRect(ST.BX-1.5,ST.BY-1.5,ST.BW+3,ST.BH+3);
  if(ST.G.tileset!==2){g.fillStyle=['#596570','#c49a62','','#e6f4fb','#c7a27a','#9fc3c0'][ST.G.tileset];for(const[x,y]of[[ST.BX-pad/2,ST.BY-pad/2],[ST.BX+ST.BW+pad/2,ST.BY-pad/2],[ST.BX-pad/2,ST.BY+ST.BH+pad/2],[ST.BX+ST.BW+pad/2,ST.BY+ST.BH+pad/2]]){g.beginPath();g.arc(x,y,Math.max(1.5,pad*.16),0,6.283);g.fill();}}
  g.font='600 10px "Chakra Petch", sans-serif';g.textAlign='left';g.fillStyle='rgba(233,238,242,.5)';if(ST.BY-pad-8>0&&ST.G.theme.bg!=='pathos')g.fillText(`${ST.G.theme.name.toUpperCase()}  //  FIELD ${String(ST.G.field).padStart(2,'0')} OF 87  //  ${ST.G.cols}×${ST.G.rows}`,ST.BX-pad,ST.BY-pad-8);
  g.textAlign='right';
  if(ST.G.theme.bg==='pathos'&&!ST.G.won){const rem=Math.max(0,ST.G.floodTotal-(ST.G.clock-ST.G.floodStart)),nar=ST.LK==='narrow';let html,cls;
    if(!ST.G.flooded){html=`FLOODING IN ${String(Math.floor(rem/60)).padStart(2,'0')}:${String(Math.floor(rem%60)).padStart(2,'0')}`;cls=rem<30?'cd alarm':'cd';
      const gx=ST.BX+ST.BW+pad*.35,gw=Math.max(3,pad*.3);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(gx,ST.BY,gw,ST.BH);g.fillStyle='rgba(80,210,240,.8)';g.fillRect(gx,ST.BY+ST.BH*(1-ST.G.floodP),gw,ST.BH*ST.G.floodP);}
    else{const b=fmtBreath(ST.G.bLog);html=(ST.LK==='wide'?'UNDERWATER · ':'')+'BREATH '+(Array.isArray(b)?`${b[0]}<sup>${b[1]}</sup>%`:b+'%');cls='';}
    o2Set(html,cls,Math.round(ST.BX+ST.BW/2),Math.round(ST.BY-pad-4),nar?48:66,ST.LK==='wide'?ST.W-680:ST.LK==='mid'?ST.W-420:ST.W-24);}
  else{o2Off();
  if(ST.BY-pad-8>0)g.fillText(ST.G.over?'THREAT: CLEARED':`THREAT: ${ST.G.mines} MINES`,ST.BX+ST.BW+pad,ST.BY-pad-8);}
  const tn=now(),hovOK=!ST.G.over&&!ST.G.dead;
  for(let r=0;r<ST.G.rows;r++)for(let c=0;c<ST.G.cols;c++){const i=r*ST.G.cols+c,x=ST.BX+c*ST.T,y=ST.BY+r*ST.T,s=ST.G.st[i];
    if(s===0){g.drawImage(i===ST.G.pressed?SPR.open:(hovOK&&(i===ST.G.hover||(ST.kbdOn&&i===ST.G.kbd)))?SPR.hov:SPR.var[c&1][vh(i)],x,y,ST.T,ST.T);}
    else if(s===2){g.drawImage(hovOK&&i===ST.G.hover?SPR.hov:SPR.var[c&1][vh(i)],x,y,ST.T,ST.T);drawFlag(g,x,y,t,i);if(ST.G.won&&!ST.G.mine[i]){g.strokeStyle='#ff3d3d';g.lineWidth=2;g.beginPath();g.moveTo(x+ST.T*.2,y+ST.T*.2);g.lineTo(x+ST.T*.8,y+ST.T*.8);g.stroke();}}
    else if(s===3)g.drawImage(SPR.crater,x,y,ST.T,ST.T);
    else{const ra=ST.G.revAt[i];if(tn<ra){g.drawImage(SPR.hid,x,y,ST.T,ST.T);continue;}g.drawImage(SPR.open,x,y,ST.T,ST.T);const p=(tn-ra)/.24,n=ST.G.cnt[i];
      if(n){if(p<1)g.globalAlpha=p;g.drawImage(SPR.num[n],x,y,ST.T,ST.T);g.globalAlpha=1;}
      if(p<1){const k=1-p,sz=ST.T*(.55+.45*k);g.globalAlpha=k;g.drawImage(SPR.hid,x+(ST.T-sz)/2,y+(ST.T-sz)/2-(1-k)*ST.T*.3,sz,sz);g.globalAlpha=1;}}
    if(ST.kbdOn&&i===ST.G.kbd){g.strokeStyle='#ffd77a';g.lineWidth=2;g.strokeRect(x+1.5,y+1.5,ST.T-3,ST.T-3);}
  }
  if(ST.G.tileset===4){for(let i=0;i<ST.G.n;i++){if(ST.G.st[i]!==0||((i*40503+7)>>>0)%11)continue;const x=ST.BX+((i%ST.G.cols)+.3+((i*13)%40)/100)*ST.T,y=ST.BY+(((i/ST.G.cols)|0)+.3+((i*29)%40)/100)*ST.T,r=Math.max(1,ST.T*.045);g.fillStyle=['#ffffff','#ffd23f','#ff8fab'][i%3];for(let k=0;k<5;k++){const a=k*1.2566;g.beginPath();g.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.8,0,6.283);g.fill();}g.fillStyle='#f3b81c';g.beginPath();g.arc(x,y,r*.7,0,6.283);g.fill();}}
  if(ST.G.tileset===3){const fr=Math.floor(t*3);g.save();g.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const i=((fr*7919+k*104729)>>>0)%ST.G.n;if(ST.G.st[i]!==0)continue;const ph=(t*3)%1,a=Math.sin(ph*Math.PI),x=ST.BX+((i%ST.G.cols)+.25+((k*37)%50)/100)*ST.T,y=ST.BY+(((i/ST.G.cols)|0)+.25+((k*53)%50)/100)*ST.T,r=ST.T*.16*a;g.strokeStyle=`rgba(255,255,255,${.9*a})`;g.lineWidth=1.2;g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);g.stroke();}g.restore();}
  if(ST.G.tileset===2){const bb=t*124/60,pulse=Math.exp(-(bb%1)*5),ins=ST.T*.14;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<ST.G.n;i++){const s=ST.G.st[i],c=i%ST.G.cols,r=(i/ST.G.cols)|0,hue=(c*28+r*46+t*70)%360;if(s===0||s===2){g.fillStyle=`hsla(${hue},100%,58%,${.14+.2*pulse})`;g.fillRect(ST.BX+c*ST.T+ins,ST.BY+r*ST.T+ins,ST.T-2*ins,ST.T-2*ins);}else if(s===1&&tn>=ST.G.revAt[i]){g.fillStyle=`hsla(${hue},100%,58%,${.03+.05*pulse})`;g.fillRect(ST.BX+c*ST.T,ST.BY+r*ST.T,ST.T,ST.T);}}g.restore();}
  g.save();g.beginPath();g.rect(ST.BX,ST.BY,ST.BW,ST.BH);g.clip();g.globalCompositeOperation='lighter';
  if(ST.G.inCv){const mx=ST.G.mx-cx,my=ST.G.my-cy;const gr=g.createRadialGradient(mx,my,0,mx,my,ST.T*5);gr.addColorStop(0,'rgba(255,240,215,.13)');gr.addColorStop(1,'rgba(255,240,215,0)');g.fillStyle=gr;g.fillRect(ST.BX,ST.BY,ST.BW,ST.BH);}
  const ph=(t%7)/7;if(ph<.4){const pos=-ST.T*6+(ST.BW+ST.BH+ST.T*12)*(ph/.4);const gr=g.createLinearGradient(ST.BX+pos-ST.BH,ST.BY,ST.BX+pos-ST.BH+ST.T*2.4,ST.BY+ST.T*1.4);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(ST.BX,ST.BY,ST.BW,ST.BH);}
  if(ST.G.club>0){const hue=(t*140)%360;g.globalCompositeOperation='lighter';const fr=Math.floor(t*4);for(let i=0;i<ST.G.n;i++){const h=((i*2654435761+fr*97)>>>0)%360;if(((i+fr)%3)===0){g.fillStyle=`hsla(${h},100%,55%,.22)`;g.fillRect(ST.BX+(i%ST.G.cols)*ST.T,ST.BY+((i/ST.G.cols)|0)*ST.T,ST.T,ST.T);}}g.globalCompositeOperation='overlay';g.fillStyle=`hsla(${hue},100%,50%,.35)`;g.fillRect(ST.BX,ST.BY,ST.BW,ST.BH);}
  g.restore();
  drawCrate(g,t);drawParticles(g,dt);drawMarker(g,t);drawTrail(g,t);
  g.restore();
  if(ST.G.club>0){g.save();g.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const ox=ST.W*(.2+.3*k),a=Math.sin(t*1.3+k*2)*.5;const len=ST.H*1.2;g.save();g.translate(ox,-20);g.rotate(a);const gr=g.createLinearGradient(0,0,0,len);const hc=(t*100+k*120)%360;gr.addColorStop(0,`hsla(${hc},100%,60%,.25)`);gr.addColorStop(1,`hsla(${hc},100%,60%,0)`);g.fillStyle=gr;g.beginPath();g.moveTo(-8,0);g.lineTo(8,0);g.lineTo(len*.22,len);g.lineTo(-len*.22,len);g.closePath();g.fill();g.restore();}g.restore();}
  if(ST.G.flooded)drawUnderwater(g,t);
  drawCompass(t);drawMinimap(t);drawWave();drawBlood(dt);
  $('#fx-dmg').style.opacity=clamp((1-ST.G.hp/100)*1.05+ST.G.flash*.6,0,1).toFixed(3);
}
function drawFlag(g,x,y,t,i){const sk=SKINS[PROFILE.skin]||SKINS.red;const px=x+ST.T*.36,top=y+ST.T*.18,bot=y+ST.T*.78;
  g.fillStyle='#0c0f12';g.fillRect(x+ST.T*.22,bot,ST.T*.44,Math.max(1.5,ST.T*.07));g.fillRect(x+ST.T*.3,bot-ST.T*.04,ST.T*.28,ST.T*.05);g.fillStyle='#1b2127';g.fillRect(px-ST.T*.025,top,Math.max(1.5,ST.T*.05),bot-top);
  const gr=g.createLinearGradient(px,top,px+ST.T*.4,top+ST.T*.3);gr.addColorStop(0,sk.a);gr.addColorStop(1,sk.b);if(PROFILE.skin==='chrome'){gr.addColorStop(.5,'#9aa7b1');}g.fillStyle=gr;
  g.beginPath();g.moveTo(px,top);const N=6;for(let k=1;k<=N;k++){const u=k/N;g.lineTo(px+u*ST.T*.4,top+u*ST.T*.15+Math.sin(t*7-u*4+i)*ST.T*.035*u);}for(let k=N;k>=0;k--){const u=k/N;g.lineTo(px+u*ST.T*.4*.98,top+ST.T*.32-u*ST.T*.17+Math.sin(t*7-u*4+i)*ST.T*.035*u);}g.closePath();g.fill();
  if(PROFILE.skin==='gold'&&Math.sin(t*4+i)>.9){g.fillStyle='rgba(255,255,255,.9)';g.fillRect(px+ST.T*.2,top+ST.T*.12,2,2);}}
function drawCrate(g,t){if(!ST.G.crate)return;const c=ST.G.crate,x=ST.BX+((c.i%ST.G.cols)+.5)*ST.T,yT=ST.BY+(((c.i/ST.G.cols)|0)+.5)*ST.T;const p=clamp((ST.G.clock-c.t0)/2,0,1),e=1-Math.pow(1-p,2.2);const y=(ST.BY-ST.T*5)+(yT-(ST.BY-ST.T*5))*e;const s=ST.T*.72;
  g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,yT,0,yT-ST.T*6);gr.addColorStop(0,'rgba(110,180,255,.42)');gr.addColorStop(1,'rgba(110,180,255,0)');g.fillStyle=gr;g.fillRect(x-ST.T*.25,yT-ST.T*6,ST.T*.5,ST.T*6);g.restore();
  if(!c.landed){g.strokeStyle='rgba(230,230,230,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x-s/2,y-s/2);g.lineTo(x-ST.T*.8,y-ST.T*1.4);g.moveTo(x+s/2,y-s/2);g.lineTo(x+ST.T*.8,y-ST.T*1.4);g.stroke();g.fillStyle='#d9dde0';g.beginPath();g.ellipse(x,y-ST.T*1.4,ST.T*.85,ST.T*.42,0,Math.PI,0);g.fill();g.fillStyle='#c0392b';g.fillRect(x-ST.T*.1,y-ST.T*1.82,ST.T*.2,ST.T*.42);}
  const bob=c.landed?Math.sin(t*3)*1.5:0;g.fillStyle='#4b5a33';g.fillRect(x-s/2,y-s/2+bob,s,s);g.fillStyle='#38452a';g.fillRect(x-s/2,y-s/2+bob,s,s*.18);g.strokeStyle='#1c2414';g.lineWidth=1.5;g.strokeRect(x-s/2,y-s/2+bob,s,s);g.fillStyle='#e8e2c8';g.fillRect(x-s*.08,y-s*.28+bob,s*.16,s*.56);g.fillRect(x-s*.28,y-s*.08+bob,s*.56,s*.16);
  if(c.landed){g.font=`600 ${Math.round(clamp(ST.T*.36,10,14))}px "Chakra Petch", sans-serif`;g.textAlign='center';g.fillStyle='#bfe0ff';g.fillText('SUPPLY DROP',x,y-s*.75);}}
export function markerDist(){if(ST.G.target<0)return 0;let fc,fr;if(ST.G.hover>=0){fc=ST.G.hover%ST.G.cols;fr=(ST.G.hover/ST.G.cols)|0;}else{fc=(ST.G.cols-1)/2;fr=(ST.G.rows-1)/2;}return Math.max(1,Math.round(Math.hypot(ST.G.target%ST.G.cols-fc,((ST.G.target/ST.G.cols)|0)-fr)*1.8));}
function drawMarker(g,t){if(ST.G.target<0||ST.G.over||ST.G.dead)return;const c=ST.G.target%ST.G.cols,r=(ST.G.target/ST.G.cols)|0,x=ST.BX+(c+.5)*ST.T,y=ST.BY+(r+.5)*ST.T,k=PROFILE.perks.beacon?1.5:1;
  g.save();g.globalCompositeOperation='lighter';const top=Math.max(-ST.T*2,ST.BY-ST.T*4);const bw=ST.T*.5*k;let gr=g.createLinearGradient(0,y,0,top);gr.addColorStop(0,'rgba(255,196,70,.36)');gr.addColorStop(1,'rgba(255,196,70,0)');g.fillStyle=gr;g.fillRect(x-bw/2,top,bw,y-top);
  const pul=.5+.5*Math.sin(t*5);g.fillStyle=`rgba(255,190,60,${.12+.16*pul})`;g.fillRect(x-ST.T/2,y-ST.T/2,ST.T,ST.T);
  for(let j=0;j<2;j++){const p=((t*.9)+j*.5)%1;g.strokeStyle=`rgba(255,205,90,${(1-p)*.9})`;g.lineWidth=2;g.beginPath();g.arc(x,y,ST.T*(.42+p*1.1)*k,0,6.283);g.stroke();}g.restore();
  const d=Math.max(7,ST.T*.27)*k,by=y-ST.T*.95*k-8-Math.sin(t*3)*3;g.save();g.shadowColor='rgba(255,180,40,.95)';g.shadowBlur=14;g.fillStyle='#ffc94a';g.beginPath();g.moveTo(x,by-d);g.lineTo(x+d*.72,by);g.lineTo(x,by+d);g.lineTo(x-d*.72,by);g.closePath();g.fill();g.shadowBlur=0;
  g.fillStyle='#3a2600';g.beginPath();g.moveTo(x,by-d*.45);g.lineTo(x+d*.32,by);g.lineTo(x,by+d*.45);g.lineTo(x-d*.32,by);g.closePath();g.fill();
  const fs=Math.round(clamp(ST.T*.4,10,15)*(k>1?1.15:1));g.font=`700 ${fs}px "Chakra Petch", sans-serif`;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.65)';const txt=`${markerDist()} m`;g.strokeText(txt,x,by-d-5);g.fillStyle='#ffd77a';g.fillText(txt,x,by-d-5);g.restore();}
function drawTrail(g,t){if(ST.G.target<0||!ST.G.inCv||ST.G.over||ST.G.dead||ST.G.touch)return;const tc=tileCenter(ST.G.target);const ax=ST.G.mx-CAM.x,ay=ST.G.my-CAM.y,bx=tc.x-CAM.x,by=tc.y-CAM.y;const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);if(len<ST.T*1.6)return;
  const mx=(ax+bx)/2-dy*.22,my=(ay+by)/2+dx*.22;const N=Math.floor(len/15);g.save();g.globalCompositeOperation='lighter';const ph=(t*2.2)%1;
  for(let k=0;k<N;k++){const u=(k+ph)/N;if(u>1)continue;const iu=1-u;const px=iu*iu*ax+2*iu*u*mx+u*u*bx,py=iu*iu*ay+2*iu*u*my+u*u*by;const a=Math.sin(Math.PI*u)*.55;g.fillStyle=`rgba(255,205,100,${a})`;g.beginPath();g.arc(px,py,2.1,0,6.283);g.fill();}g.restore();}
