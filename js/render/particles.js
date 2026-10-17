// render/particles.js — Particle system (sparks, smoke, dust, glints, rings, chunks, confetti, bubbles) and explosions.
import {ST} from '../core/shared.js';
import {RM,rand} from '../core/util.js';
import {P} from '../game/state.js';
import {bubbleAt} from '../game/pathos.js';

/* ================= particles ================= */
export function emit(p){if(P.length<1800){p.max=p.life;P.push(p);}}
export function explode(x,y){
  emit({t:'flash',x,y,vx:0,vy:0,g:0,drag:0,life:.32,s:ST.T*4.5});emit({t:'ring',x,y,vx:0,vy:0,g:0,drag:0,life:.55,s:ST.T*.3,grow:ST.T*4.5});
  for(let k=0;k<80;k++){const a=rand(0,6.283),v=rand(140,640);emit({t:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,g:520,drag:1.4,life:rand(.3,1),s:rand(1,2.6)});}
  for(let k=0;k<24;k++){const a=rand(0,6.283),v=rand(10,90);emit({t:'smoke',x:x+rand(-ST.T*.3,ST.T*.3),y:y+rand(-ST.T*.3,ST.T*.3),vx:Math.cos(a)*v,vy:Math.sin(a)*v-rand(20,60),g:-22,drag:1.1,life:rand(1.3,2.8),s:rand(ST.T*.3,ST.T*.7),c:rand(35,85)|0});}
  for(let k=0;k<14;k++){const a=rand(-Math.PI,0),v=rand(120,380);emit({t:'chunk',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,drag:.6,life:rand(.6,1.2),s:rand(2,4),r:rand(0,6)});}
  ST.G.shake=RM?3:17;
  if(ST.G.flooded)for(let k=0;k<40;k++)bubbleAt(x+rand(-ST.T,ST.T),y+rand(-ST.T,ST.T),rand(2,6));
}
export function drawParticles(g,dt){
  for(let k=P.length-1;k>=0;k--){const p=P[k];p.life-=dt;if(p.life<=0){P.splice(k,1);continue;}const dg=Math.max(0,1-p.drag*dt);p.vx*=dg;p.vy=p.vy*dg+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const a=p.life/p.max;
    switch(p.t){
      case 'spark':g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,${170+(Math.random()*70|0)},80,${a})`;g.lineWidth=p.s;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);g.stroke();break;
      case 'smoke':{g.globalCompositeOperation='source-over';const r=p.s*(1+(1-a)*2.4);g.fillStyle=`rgba(${p.c},${p.c},${p.c},${a*.32})`;g.beginPath();g.arc(p.x,p.y,r,0,6.283);g.fill();break;}
      case 'dust':g.globalCompositeOperation='lighter';g.fillStyle=`rgba(${p.c||'150,220,255'},${a*.7})`;g.fillRect(p.x,p.y,p.s,p.s);break;
      case 'glint':{g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,215,120,${a})`;g.lineWidth=1.3;const s=p.s*(.6+a);g.beginPath();g.moveTo(p.x-s,p.y);g.lineTo(p.x+s,p.y);g.moveTo(p.x,p.y-s);g.lineTo(p.x,p.y+s);g.stroke();break;}
      case 'flash':{g.globalCompositeOperation='lighter';const r=p.s*(1.25-a*.25);const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,`rgba(255,240,200,${a})`);gr.addColorStop(.3,`rgba(255,150,60,${a*.7})`);gr.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=gr;g.fillRect(p.x-r,p.y-r,2*r,2*r);break;}
      case 'ring':g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,220,170,${a*.8})`;g.lineWidth=3*a+.5;g.beginPath();g.arc(p.x,p.y,p.s+(1-a)*p.grow,0,6.283);g.stroke();break;
      case 'chunk':g.globalCompositeOperation='source-over';g.fillStyle=`rgba(20,16,14,${a})`;g.save();g.translate(p.x,p.y);g.rotate(p.r+=dt*8);g.fillRect(-p.s/2,-p.s/2,p.s,p.s);g.restore();break;
      case 'bubble':{g.globalCompositeOperation='source-over';p.x+=Math.sin(p.life*3+p.ph)*.4;g.strokeStyle=`rgba(200,245,255,${Math.min(1,a*1.4)*.55})`;g.lineWidth=1;g.beginPath();g.arc(p.x,p.y,p.s,0,6.283);g.stroke();g.fillStyle=`rgba(255,255,255,${a*.5})`;g.fillRect(p.x-p.s*.4,p.y-p.s*.45,Math.max(1,p.s*.35),Math.max(1,p.s*.35));break;}
      case 'confetti':g.globalCompositeOperation='source-over';g.fillStyle=`hsla(${p.h},95%,62%,${Math.min(1,a*1.5)})`;g.save();g.translate(p.x,p.y);g.rotate(p.r+=dt*7);g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore();break;
    }}
  g.globalCompositeOperation='source-over';
}
