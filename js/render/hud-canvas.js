// render/hud-canvas.js — Canvas-drawn HUD parts: compass, minimap with radar, radio waveform.
import {ST} from '../core/shared.js';
import {CHAR} from '../data/dialogue.js';
import {SIDE} from '../data/content.js';
import {$,clamp} from '../core/util.js';
import {A} from '../audio/engine.js';
import {radioColor} from '../ui/radio.js';
import {markerDist} from './draw-game.js';

function bearingTo(i){let fc,fr;if(ST.G.hover>=0){fc=ST.G.hover%ST.G.cols;fr=(ST.G.hover/ST.G.cols)|0;}else{fc=(ST.G.cols-1)/2;fr=(ST.G.rows-1)/2;}const dx=i%ST.G.cols-fc,dy=((i/ST.G.cols)|0)-fr;return(Math.atan2(dx,-dy)*180/Math.PI+360)%360;}
export function drawCompass(t){const c=$('#compassCv'),g=c.getContext('2d'),w=c.width/ST.dpr,h=c.height/ST.dpr;g.setTransform(ST.dpr,0,0,ST.dpr,0,0);g.clearRect(0,0,w,h);
  const heading=((ST.G.inCv?(ST.G.mx/ST.W-.5):0)*70+Math.sin(t*.13)*4+360)%360,span=w<300?90:110,ppd=w/span;
  g.fillStyle='rgba(5,9,13,.55)';g.fillRect(0,0,w,26);g.strokeStyle='rgba(233,238,242,.5)';g.lineWidth=1;g.textAlign='center';
  const start=Math.floor((heading-span/2)/5)*5;for(let d=start;d<=heading+span/2+5;d+=5){const x=w/2+(d-heading)*ppd,dd=((d%360)+360)%360;let len=4;
    if(dd%45===0){len=0;const lab=['N','NE','E','SE','S','SW','W','NW'][dd/45];g.fillStyle=dd===0?'#ffcf5a':'rgba(233,238,242,.95)';g.font=(dd%90===0?'700 13px':'600 11px')+' "Chakra Petch", sans-serif';g.fillText(lab,x,17);}
    else if(dd%15===0){len=8;g.fillStyle='rgba(233,238,242,.45)';g.font='500 9px "Chakra Petch", sans-serif';g.fillText(dd,x,13);}
    if(len){g.beginPath();g.moveTo(Math.round(x)+.5,26);g.lineTo(Math.round(x)+.5,26-len);g.stroke();}}
  g.fillStyle='#ffd77a';g.beginPath();g.moveTo(w/2-5,0);g.lineTo(w/2+5,0);g.lineTo(w/2,5);g.closePath();g.fill();
  const pois=[];if(ST.G.target>=0&&!ST.G.over)pois.push({b:bearingTo(ST.G.target),c:'#ffc94a',l:`${markerDist()} m`,big:true});
  if(ST.G.crate)pois.push({b:bearingTo(ST.G.crate.i),c:'#6fb6ff',l:'DROP'});
  for(const k of ST.G.side){const q=SIDE[k];pois.push({b:k==='whisper'?(t*37)%360:q.brg,c:CHAR[q.who].color,l:q.dist});}
  for(const p of pois){let rel=((p.b-heading+540)%360)-180;const edge=Math.abs(rel)>span/2-4;rel=clamp(rel,-span/2+4,span/2-4);const x=w/2+rel*ppd,y=31,s=p.big?6:4;
    g.fillStyle=p.c;g.beginPath();if(edge){const dir=Math.sign(rel);g.moveTo(x+dir*s,y);g.lineTo(x-dir*s*.6,y-s);g.lineTo(x-dir*s*.6,y+s);}else{g.moveTo(x,y-s);g.lineTo(x+s*.75,y);g.lineTo(x,y+s);g.lineTo(x-s*.75,y);}g.closePath();g.fill();
    if(h>=44){g.font='600 9px "Chakra Petch", sans-serif';g.fillText(p.l,x,y+s+8);}}}
export function drawMinimap(t){const c=$('#mm'),g=c.getContext('2d'),S2=c.width/ST.dpr;g.setTransform(ST.dpr,0,0,ST.dpr,0,0);g.clearRect(0,0,S2,S2);
  const cell=(S2-12)/Math.max(ST.G.cols,ST.G.rows),ox=(S2-cell*ST.G.cols)/2,oy=(S2-cell*ST.G.rows)/2,gap=cell>4?.7:0;
  for(let i=0;i<ST.G.n;i++){const s=ST.G.st[i];g.fillStyle=s===0?'#2f3c47':s===1?(ST.G.cnt[i]?'#6e7f8c':'#56656f'):s===2?'#ff4d4d':'#ff9a3c';g.fillRect(ox+(i%ST.G.cols)*cell,oy+((i/ST.G.cols)|0)*cell,cell-gap,cell-gap);}
  g.fillStyle='#ffcf5a';g.font=`700 ${Math.max(6,Math.round(cell*.9))}px "Chakra Petch", sans-serif`;g.textAlign='center';for(const i of ST.G.lore){const x=ox+((i%ST.G.cols)+.5)*cell,y=oy+(((i/ST.G.cols)|0)+.5)*cell;if(cell>=6)g.fillText('?',x,y+cell*.32);else g.fillRect(x-1,y-1,2,2);}
  if(ST.G.crate){g.fillStyle='#6fb6ff';g.fillRect(ox+(ST.G.crate.i%ST.G.cols)*cell-1,oy+((ST.G.crate.i/ST.G.cols)|0)*cell-1,cell+2,cell+2);}
  if(g.createConicGradient){const cg=g.createConicGradient(t*1.4,S2/2,S2/2);cg.addColorStop(0,'rgba(120,255,170,.22)');cg.addColorStop(.12,'rgba(120,255,170,0)');cg.addColorStop(1,'rgba(120,255,170,0)');g.fillStyle=cg;g.fillRect(0,0,S2,S2);}
  if(ST.G.target>=0&&!ST.G.over){const x=ox+((ST.G.target%ST.G.cols)+.5)*cell,y=oy+(((ST.G.target/ST.G.cols)|0)+.5)*cell,p=(t*1.2)%1;g.strokeStyle=`rgba(255,201,74,${1-p})`;g.lineWidth=1.5;g.beginPath();g.arc(x,y,cell*.6+p*cell*2.4,0,6.283);g.stroke();g.fillStyle='#ffc94a';g.beginPath();g.arc(x,y,Math.max(2,cell*.45),0,6.283);g.fill();}
  if(ST.G.hover>=0){const x=ox+((ST.G.hover%ST.G.cols)+.5)*cell,y=oy+(((ST.G.hover/ST.G.cols)|0)+.5)*cell,s=Math.max(4,cell*.9);g.fillStyle='#fff';g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*.65,y+s*.7);g.lineTo(x,y+s*.35);g.lineTo(x-s*.65,y+s*.7);g.closePath();g.fill();}}
const waveData=new Uint8Array(256);
export function drawWave(){const r=$('#radio');if(r.hidden||!A.an)return;const c=$('#wave'),g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);A.an.getByteTimeDomainData(waveData);const bars=40,bw=w/bars;g.fillStyle=radioColor;
  for(let k=0;k<bars;k++){let m=0;for(let j=0;j<6;j++){const v=Math.abs(waveData[(k*6+j)%256]-128);if(v>m)m=v;}const bh=Math.max(2,(m/128)*h*1.8);g.globalAlpha=.85;g.fillRect(k*bw+1,(h-Math.min(h,bh))/2,bw-2,Math.min(h,bh));}g.globalAlpha=1;}
