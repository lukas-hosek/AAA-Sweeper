// ui/radio.js — Incoming-transmission panel and the procedurally drawn character portraits.
import {CHAR} from '../data/dialogue.js';
import {$} from '../core/util.js';
import {radioActive} from '../audio/voices.js';

export let radioHideT=0,radioColor='#f4b740';
export function showRadio(who){clearTimeout(radioHideT);const ch=CHAR[who],r=$('#radio');radioColor=ch.color;r.style.setProperty('--rc',ch.color);$('#rd-name').textContent=ch.name;$('#rd-tag').textContent=`CH ${ch.chan} · ${ch.tag}`;drawPortrait(who);r.hidden=false;requestAnimationFrame(()=>r.classList.add('on'));}
export function hideRadioSoon(){clearTimeout(radioHideT);radioHideT=setTimeout(()=>{const r=$('#radio');r.classList.remove('on');setTimeout(()=>{if(!radioActive().length)r.hidden=true;},300);},700);}
function hexMix(h,k){const n=parseInt(h.slice(1),16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;return `rgb(${r*k|0},${g*k|0},${b*k|0})`;}
export function drawPortrait(who,c){
  c=c||$('#portrait');const g=c.getContext('2d'),S=c.width,col=CHAR[who].color;g.setTransform(S/84,0,0,S/84,0,0);
  const bg=g.createLinearGradient(0,0,0,84);bg.addColorStop(0,hexMix(col,.42));bg.addColorStop(1,'#04070a');g.fillStyle=bg;g.fillRect(0,0,84,84);
  if(who==='halcyon'){g.strokeStyle=col;g.lineWidth=2;for(let k=0;k<3;k++){g.globalAlpha=.9-k*.25;g.beginPath();g.arc(42,42,12+k*9,0,6.283);g.stroke();}g.globalAlpha=1;g.fillStyle=col;g.shadowColor=col;g.shadowBlur=14;g.beginPath();g.arc(42,42,7,0,6.283);g.fill();g.shadowBlur=0;g.fillStyle='#fff';g.beginPath();g.arc(39,39,2,0,6.283);g.fill();return;}
  const sil='#0a0e12',dark='#141a20';
  const head=()=>{g.beginPath();g.ellipse(42,40,15,18,0,0,Math.PI*2);};
  g.fillStyle=sil;g.beginPath();g.ellipse(42,96,36,30,0,0,Math.PI*2);g.fill();g.fillRect(35,52,14,16);
  if(who==='kova'){g.fillStyle='#120d16';g.beginPath();g.moveTo(24,40);g.quadraticCurveTo(22,14,42,16);g.quadraticCurveTo(62,14,60,40);g.lineTo(62,70);g.lineTo(22,70);g.closePath();g.fill();}
  if(who==='mom'){g.fillStyle='#24180f';for(let i=0;i<9;i++){const a=Math.PI*(1.05+i*.11);g.beginPath();g.arc(42+Math.cos(a)*16,38+Math.sin(a)*18,7,0,Math.PI*2);g.fill();}}
  g.fillStyle=sil;head();g.fill();g.strokeStyle=col;g.globalAlpha=.85;g.lineWidth=1.4;g.beginPath();g.ellipse(42,40,15,18,0,-1.2,1.1);g.stroke();g.globalAlpha=1;
  g.fillStyle=dark;g.strokeStyle=col;
  if(who==='reyes'||who==='jenkins'){g.beginPath();g.arc(42,36,19,Math.PI,0);g.lineTo(62,40);g.lineTo(22,40);g.closePath();g.fill();g.globalAlpha=.6;g.stroke();g.globalAlpha=1;
    if(who==='reyes'){g.lineWidth=2;g.beginPath();g.moveTo(26,44);g.quadraticCurveTo(28,58,40,56);g.stroke();g.fillStyle=col;g.fillRect(39,54,4,3);}
    else{g.fillStyle='#1d252c';g.beginPath();g.arc(35,28,5,0,Math.PI*2);g.arc(49,28,5,0,Math.PI*2);g.fill();g.fillStyle=col;g.globalAlpha=.7;g.fillRect(33,26,2,2);g.fillRect(47,26,2,2);g.globalAlpha=1;g.strokeStyle='#e8eef2';g.lineWidth=1.5;g.beginPath();g.arc(42,46,6,.2,Math.PI-.2);g.stroke();}}
  if(who==='kova'){g.lineWidth=1.6;g.strokeRect(32,37,8,5);g.strokeRect(44,37,8,5);g.beginPath();g.moveTo(40,39);g.lineTo(44,39);g.stroke();g.fillStyle='#fff';g.fillRect(34,38,2,1);g.fillRect(46,38,2,1);}
  if(who==='dez'){g.beginPath();g.arc(42,32,16,Math.PI,0);g.lineTo(66,32);g.lineTo(66,35);g.lineTo(26,35);g.closePath();g.fill();g.globalAlpha=.7;g.stroke();g.globalAlpha=1;g.strokeStyle='#ffd34d';g.lineWidth=2.4;g.beginPath();g.arc(42,58,12,.25,Math.PI-.25);g.stroke();g.fillStyle='#ffd34d';g.fillRect(40,68,5,5);}
  if(who==='qm'){g.beginPath();g.ellipse(42,26,24,4,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(42,20,13,10,0,Math.PI,0);g.fill();g.fillRect(29,20,26,6);g.globalAlpha=.6;g.stroke();g.globalAlpha=1;g.fillStyle=col;g.globalAlpha=.8;g.beginPath();g.moveTo(32,48);g.quadraticCurveTo(42,42,52,48);g.quadraticCurveTo(42,46,32,48);g.fill();g.globalAlpha=1;}
  if(who==='mom'){g.fillStyle=col;g.beginPath();g.arc(27,46,2,0,Math.PI*2);g.arc(57,46,2,0,Math.PI*2);g.fill();}
  if(who==='whisper'){g.fillStyle='#07090c';g.beginPath();g.moveTo(42,10);g.quadraticCurveTo(66,22,62,62);g.lineTo(22,62);g.quadraticCurveTo(18,22,42,10);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(42,42,11,14,0,0,Math.PI*2);g.fill();g.shadowColor=col;g.shadowBlur=8;g.fillStyle='#e9e9ff';g.fillRect(36,40,4,2);g.fillRect(45,40,4,2);g.shadowBlur=0;}
  if(who==='dj'){g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(42,38,18,Math.PI*1.08,Math.PI*1.92);g.stroke();g.fillStyle=col;g.fillRect(22,36,6,12);g.fillRect(56,36,6,12);}
  if(who==='prof'){g.fillStyle='#1c2a33';g.beginPath();g.arc(42,32,16,Math.PI,0);g.fill();g.fillRect(26,28,32,6);g.fillStyle=col;g.beginPath();g.arc(42,14,3.5,0,6.283);g.fill();g.strokeStyle=col;g.lineWidth=1.4;g.beginPath();g.arc(36,41,4,0,6.283);g.moveTo(52,41);g.arc(48,41,4,0,6.283);g.stroke();}
}
