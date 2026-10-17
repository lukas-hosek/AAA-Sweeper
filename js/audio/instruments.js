// audio/instruments.js — Synthesised instruments used by the music: drums, pads, plucks, braam, oud, ney, flute, ocarina, harp, bells, e-piano, whistle, piano.
import {n2f,rand} from '../core/util.js';
import {A,env,nz,osc} from './engine.js';

export function taiko(t,vol,dest){dest=dest||A.duck;osc('sine',115,t,.42,vol,dest,{glide:46,rel:.12,send:A.sendM});nz(t,.06,vol*.45,dest,{type:'lowpass',f:700,send:A.sendM});}
export function pad(notes,t,dur,vol){const c=A.ctx,f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=760;const g=c.createGain();env(g,t,.6,vol,dur,.7);f.connect(g);g.connect(A.duck);g.connect(A.sendM);
  for(const m of notes)for(const d of[-9,9]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=n2f(m);o.detune.value=d;o.connect(f);o.start(t);o.stop(t+dur+5);}}
export function pluck(f,t,vol){osc('sawtooth',f,t,.09,vol,A.duck,{lp:2600,lp2:380,q:3,rel:.06,send:A.sendM});}
export function braam(root,t,vol){const c=A.ctx,f=c.createBiquadFilter();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(110,t);f.frequency.exponentialRampToValueAtTime(1700,t+.55);f.frequency.exponentialRampToValueAtTime(260,t+2.6);
  const ws=c.createWaveShaper();ws.curve=A.boomCurve;const g=c.createGain();env(g,t,.06,vol,2.1,.8);f.connect(ws);ws.connect(g);g.connect(A.duck);g.connect(A.sendM);
  for(const m of[root-12,root,root+7,root-24])for(const ty of['sawtooth','square']){const o=c.createOscillator();o.type=ty;o.frequency.value=n2f(m);o.detune.value=rand(-12,12);o.connect(f);o.start(t);o.stop(t+6);}}
export function kick(t,vol){osc('sine',150,t,.28,vol,A.duck,{glide:42,gt:.12,rel:.08});}
export function clap(t,vol){for(let i=0;i<3;i++)nz(t+i*.011,.008,vol,A.duck,{type:'bandpass',f:1500,q:1.1});nz(t+.033,.1,vol*.7,A.duck,{type:'bandpass',f:1300,q:1,send:A.sendM});}
export function hat(t,vol,open){nz(t,open?.07:.02,vol,A.duck,{type:'highpass',f:7600});}
export function stab(notes,t,vol){for(const m of notes)osc('sawtooth',n2f(m),t,.12,vol,A.duck,{lp:2600,lp2:600,rel:.06,send:A.sendM});}
export function oud(f,t,vol){osc('triangle',f*1.014,t,.16,vol,A.duck,{glide:f,gt:.03,rel:.12,send:A.sendM});osc('sawtooth',f,t,.07,vol*.35,A.duck,{lp:2600,lp2:500,rel:.05});}
export function doum(t,vol){osc('sine',105,t,.2,vol,A.duck,{glide:58,gt:.15,rel:.08,send:A.sendM});nz(t,.03,vol*.4,A.duck,{type:'lowpass',f:500});}
export function tek(t,vol){nz(t,.025,vol,A.duck,{type:'bandpass',f:3400,q:2.2});osc('triangle',780,t,.015,vol*.25,A.duck,{rel:.01});}
export function ney(m,t,dur){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(n2f(m),t);o.frequency.setTargetAtTime(n2f(m-2),t+dur*.55,.08);l.frequency.value=5.2;lg.gain.value=n2f(m)*.012;l.connect(lg);lg.connect(o.frequency);
  env(g,t,.35,.05,dur,.4);o.connect(g);g.connect(A.duck);g.connect(A.sendM);o.start(t);o.stop(t+dur+3);l.start(t);l.stop(t+dur+3);nz(t,dur,.01,A.duck,{type:'bandpass',f:1600,q:.8,a:.3,rel:.3});}
export function flute(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),o2=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),g2=c.createGain();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f;l.frequency.value=4.8;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.012,t+dur*.6);l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);
  env(g,t,.18,vol,dur,.35);g.connect(A.duck);g.connect(A.sendL);o.start(t);o2.start(t);l.start(t);const st=t+dur+3;o.stop(st);o2.stop(st);l.stop(st);nz(t,dur,vol*.18,A.duck,{type:'bandpass',f:f*1.5,q:2,a:.1,rel:.3,send:A.sendL});}
export function ocarina(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.value=f;l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.008,t+dur*.5);l.connect(lg);lg.connect(o.frequency);env(g,t,.07,vol,dur,.3);o.connect(g);g.connect(A.duck);g.connect(A.sendL);o.start(t);l.start(t);o.stop(t+dur+3);l.stop(t+dur+3);osc('sine',f*3,t,dur,vol*.06,A.duck,{a:.07,rel:.2});}
export function harp(f,t,vol){osc('triangle',f,t,.02,vol,A.duck,{rel:.9,send:A.sendL});osc('sine',f*2,t,.01,vol*.3,A.duck,{rel:.4,send:A.sendL});}
export function bell(f,t,vol){osc('sine',f,t,.02,vol,A.duck,{rel:.7,send:A.sendM});osc('sine',f*2.76,t,.01,vol*.35,A.duck,{rel:.25,send:A.sendM});osc('sine',f*5.4,t,.01,vol*.12,A.duck,{rel:.12});}
export function softpad(notes,t,dur,vol){for(const m of notes){osc('sine',n2f(m),t,dur,vol,A.duck,{a:dur*.4,rel:dur*.35,send:A.sendM});osc('triangle',n2f(m)*1.003,t,dur,vol*.35,A.duck,{a:dur*.4,rel:dur*.35});}}
export function epiano(f,t,vol){osc('sine',f,t,.03,vol,A.duck,{rel:.45,send:A.sendM});osc('sine',f*2,t,.02,vol*.25,A.duck,{rel:.2});osc('triangle',f*1.002,t,.02,vol*.3,A.duck,{rel:.3});}
export function whistle(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f*.97,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);l.frequency.value=5.5;lg.gain.value=f*.008;l.connect(lg);lg.connect(o.frequency);env(g,t,.04,vol,dur,.12);o.connect(g);g.connect(A.duck);g.connect(A.sendM);o.start(t);o.stop(t+dur+1);l.start(t);l.stop(t+dur+1);}
export function piano(f,t,vol){osc('triangle',f,t,.03,vol,A.duck,{rel:.55,send:A.sendM});osc('sine',f*2,t,.02,vol*.3,A.duck,{rel:.3});}
