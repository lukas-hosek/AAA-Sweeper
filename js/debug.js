// debug.js — test and tooling hooks. Loaded only when the URL contains ?debug (see main.js).
// Used by tools/browser/*.py (smoke tests, screenshots) and tools/ost/render_ost.py (soundtrack export).
import {ST} from './core/shared.js';
import {A,audioInit,makeIR,curve} from './audio/engine.js';
import {MUS,STEP,musicStep} from './audio/music.js';
import {VM,nextChatter,say} from './audio/voices.js';
import {VOICES} from './data/voice-manifest.js';
import {FIELDS} from './data/fields.js';
import {startGame} from './game/start.js';
import {actReveal} from './game/rules.js';
import {startCredits,CR} from './scenes/credits.js';
import {toTitle} from './scenes/title.js';
import {cur} from './ui/screens.js';

window.__t={
  /** Create/resume the AudioContext (normally needs a user gesture). */
  audio:()=>audioInit(),
  /** Current music theme name. */
  mus:()=>MUS.mode,
  /** Seconds per sequencer step of a music theme. */
  step:m=>STEP[m],
  /** Name of the visible screen: desktop | intro | title | game. */
  screen:()=>cur,
  /** Jump to a chapter: difficulty 'story'|'normal'|'veteran', field 1..6 (7+ = New Game+). */
  start:(d='normal',f=1)=>startGame(d,true,f),
  /** The live field object (board, timers, health...). */
  G:()=>ST.G,
  /** Board geometry in CSS pixels. */
  board:()=>({x:ST.BX,y:ST.BY,w:ST.BW,h:ST.BH,tile:ST.T,layout:ST.LK}),
  /** Title screen (skips desktop and intro). */
  title:()=>toTitle(false),
  /** Roll the credits from the title screen. */
  credits:()=>startCredits('title'),
  cr:()=>({on:CR.on,y:CR.y,n:CR.offs.length,listH:CR.listH}),
  /** Step on the first hidden mine (for blood / damage tests). Returns its index. */
  boom:()=>{const G=ST.G;for(let i=0;i<G.n;i++)if(G.mine[i]&&G.st[i]===0){actReveal(i);return i;}},
  /** Pathos-4 only: jump the flood timer to `secondsLeft` before the base floods. */
  floodIn:(secondsLeft=1)=>{const G=ST.G;G.clock=G.floodStart+G.floodTotal-secondsLeft;},
  /** Pathos-4 only: set the breath meter (log10 of percent; 2 = 100 %, -12 = 1e-12 %). */
  breath:L=>{ST.G.bLog=L;},
  /** Number of decoded voice lines currently cached (proves MP3 loading + decoding works). */
  voicesLoaded:()=>Object.keys(A.buffers).length,
  /** Voice manager internals. */
  nc:()=>nextChatter(), say:id=>say(id), VM:()=>VM,
  V:k=>VOICES[k]&&{w:VOICES[k].w,t:VOICES[k].t,d:VOICES[k].d},
  chapters:()=>FIELDS.map((f,i)=>({n:i+1,name:f.name,bg:f.bg,mus:f.mus,ts:f.ts})),
};

/**
 * Offline-render one music theme to a 24-bit stereo WAV and trigger a download of `<mode>.wav`.
 * Uses the game's own instruments and musicStep() with an OfflineAudioContext, then peak-normalises to -1 dBFS.
 * @param {string} mode   theme name (title, game, desert, club, arctic, pathos, home, win, credits)
 * @param {number} nSteps number of sequencer steps to render before the fade
 * @param {number} fadeSec fade-out length in seconds (music keeps playing during the fade)
 */
window.__render=async(mode,nSteps,fadeSec=10)=>{
  const sr=48000,sd=STEP[mode],musicDur=nSteps*sd,total=musicDur+fadeSec+.3;
  const oc=new OfflineAudioContext(2,Math.ceil(total*sr),sr);
  const keys=['ctx','duck','sendM','sendL','revM','revL','noise','boomCurve','radioCurve'];const save={};for(const k of keys)save[k]=A[k];
  A.ctx=oc;
  const comp=oc.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.25;comp.connect(oc.destination);
  const fade=oc.createGain();fade.gain.setValueAtTime(1,0);fade.gain.setValueAtTime(1,musicDur);fade.gain.linearRampToValueAtTime(0,musicDur+fadeSec);fade.connect(comp);
  const mus=oc.createGain();mus.gain.value=.45;mus.connect(fade); // in-game music (0.5) x master (0.9)
  A.duck=oc.createGain();A.duck.connect(mus);
  const nb=oc.createBuffer(1,sr*2,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;A.noise=nb;
  A.revM=oc.createConvolver();A.revM.buffer=makeIR(2.8);A.revM.connect(A.duck);A.sendM=oc.createGain();A.sendM.gain.value=.55;A.sendM.connect(A.revM);
  A.revL=oc.createConvolver();A.revL.buffer=makeIR(6.5);A.revL.connect(A.duck);A.sendL=oc.createGain();A.sendL.gain.value=.85;A.sendL.connect(A.revL);
  A.boomCurve=curve(5);A.radioCurve=curve(2.4);
  let buf;
  try{const n=Math.ceil((musicDur+fadeSec)/sd);for(let s=0;s<n;s++)musicStep(mode,s,.05+s*sd);buf=await oc.startRendering();}
  finally{for(const k of keys)A[k]=save[k];}
  const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0;for(let i=0;i<L.length;i++){const a=Math.abs(L[i]),b=Math.abs(R[i]);if(a>pk)pk=a;if(b>pk)pk=b;}
  const gain=pk>0?Math.pow(10,-1/20)/pk:1,N=L.length,bytes=new Uint8Array(44+N*6),dv=new DataView(bytes.buffer);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)bytes[o+i]=s.charCodeAt(i);};
  ws(0,'RIFF');dv.setUint32(4,36+N*6,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*6,true);dv.setUint16(32,6,true);dv.setUint16(34,24,true);ws(36,'data');dv.setUint32(40,N*6,true);
  let o=44;for(let i=0;i<N;i++){for(const ch of [L,R]){const v=Math.round(Math.max(-1,Math.min(1,ch[i]*gain))*8388607);bytes[o++]=v&255;bytes[o++]=(v>>8)&255;bytes[o++]=(v>>16)&255;}}
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));const a=document.createElement('a');a.href=url;a.download=mode+'.wav';document.body.appendChild(a);a.click();a.remove();
  return {peak:pk,gainDb:20*Math.log10(gain),sec:N/sr};
};
window.__debugReady=true;
