// audio/engine.js — Web Audio graph (master, buses, reverbs, muffle filter, compressor) and the low-level voice builders osc(), nz(), env().
import {ST} from '../core/shared.js';
import {PIN} from '../data/dialogue.js';
import {settings} from '../core/storage.js';
import {predecode} from './voice-bank.js';

/* ================= audio ================= */
export const A={ctx:null,buffers:{},pending:{},lru:[]};
export function audioInit(){
  if(A.ctx){if(A.ctx.state==='suspended')A.ctx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
  let ctx; try{ctx=new AC();}catch{return;}
  A.ctx=ctx;
  const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-12; comp.knee.value=8; comp.ratio.value=4; comp.attack.value=.004; comp.release.value=.25; comp.connect(ctx.destination);
  A.master=ctx.createGain(); A.master.gain.value=settings.muted?0:settings.master; A.comp=comp; A.muf=ctx.createBiquadFilter(); A.muf.type='lowpass'; A.muf.frequency.value=20000; A.master.connect(A.muf); A.muf.connect(comp);
  A.music=ctx.createGain(); A.music.gain.value=settings.music; A.music.connect(A.master);
  A.duck=ctx.createGain(); A.duck.connect(A.music);
  A.sfx=ctx.createGain(); A.sfx.gain.value=settings.sfx; A.sfx.connect(A.master);
  A.voice=ctx.createGain(); A.voice.gain.value=settings.voice; A.voice.connect(A.master);
  A.an=ctx.createAnalyser(); A.an.fftSize=512; A.voice.connect(A.an);
  const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate); const nd=nb.getChannelData(0); for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1; A.noise=nb;
  A.revM=ctx.createConvolver(); A.revM.buffer=makeIR(2.8); A.revM.connect(A.duck); A.sendM=ctx.createGain(); A.sendM.gain.value=.55; A.sendM.connect(A.revM);
  A.revS=ctx.createConvolver(); A.revS.buffer=makeIR(1.7); A.revS.connect(A.sfx); A.sendS=ctx.createGain(); A.sendS.gain.value=.5; A.sendS.connect(A.revS);
  A.revL=ctx.createConvolver(); A.revL.buffer=makeIR(6.5); A.revL.connect(A.duck); A.sendL=ctx.createGain(); A.sendL.gain.value=.85; A.sendL.connect(A.revL); A.mufBase=19000;
  A.radioCurve=curve(2.4); A.boomCurve=curve(5);
  predecode(['a_title',...PIN]);
}
export function makeIR(sec){const c=A.ctx,len=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.4);}return b;}
export function curve(k){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k);}return c;}
export function shellshock(){if(!A.ctx)return;const t=A.ctx.currentTime,f=A.muf.frequency;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setValueAtTime(300,t+.06);f.exponentialRampToValueAtTime(A.mufBase||19000,t+2.9);
  const o=A.ctx.createOscillator(),g=A.ctx.createGain();o.type='sine';o.frequency.value=3900;const v=settings.muted?0:.03*settings.master;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+2.7);o.connect(g);g.connect(A.comp);o.start(t);o.stop(t+2.8);}
export function setVol(){if(!A.ctx)return;const t=A.ctx.currentTime;A.master.gain.setTargetAtTime(settings.muted?0:settings.master,t,.05);A.music.gain.setTargetAtTime(settings.music*(ST.G&&ST.G.paused?.45:1),t,.1);A.sfx.gain.setTargetAtTime(settings.sfx,t,.05);A.voice.gain.setTargetAtTime(settings.voice,t,.05);}
export function env(g,t,a,peak,dur,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+Math.max(a,dur));g.gain.setTargetAtTime(0,t+Math.max(a,dur),rel);}
export function osc(type,f,t,dur,vol,dest,o={}){
  const c=A.ctx,os=c.createOscillator(),g=c.createGain(); os.type=type; os.frequency.setValueAtTime(f,t); if(o.glide)os.frequency.exponentialRampToValueAtTime(o.glide,t+(o.gt||dur)); if(o.det)os.detune.value=o.det;
  env(g,t,o.a??.005,vol,dur,o.rel??.05); let last=os;
  if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,t);if(o.lp2)fl.frequency.exponentialRampToValueAtTime(o.lp2,t+dur);fl.Q.value=o.q??1;os.connect(fl);last=fl;}
  last.connect(g); g.connect(dest); if(o.send)g.connect(o.send); os.start(t); os.stop(t+dur+(o.rel??.05)*7+.05); return g;
}
export function nz(t,dur,vol,dest,o={}){
  const c=A.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain(); s.buffer=A.noise; s.loop=true;
  fl.type=o.type||'bandpass'; fl.frequency.setValueAtTime(o.f||1000,t); if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,t+dur); fl.Q.value=o.q??1;
  env(g,t,o.a??.002,vol,dur,o.rel??.05); s.connect(fl); fl.connect(g); g.connect(dest); if(o.send)g.connect(o.send); s.start(t,Math.random()*1.5); s.stop(t+dur+(o.rel??.05)*7+.05); return g;
}
export function unmuffle(){if(!A.ctx)return;A.mufBase=19000;const f=A.muf.frequency,t=A.ctx.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setTargetAtTime(19000,t,.25);}
