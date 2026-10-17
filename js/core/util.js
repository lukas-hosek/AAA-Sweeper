// core/util.js — Tiny helpers: DOM queries, maths, random, timing, HTML escaping, MIDI note to frequency.
/* ================= utils / storage ================= */
export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const rand=(a,b)=>a+Math.random()*(b-a);
export const pick=a=>a[Math.floor(Math.random()*a.length)];
export const now=()=>performance.now()/1000;
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const n2f=m=>440*Math.pow(2,(m-69)/12);
export function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function tween(ms,fn){return new Promise(res=>{const t0=performance.now();const st=()=>{const p=Math.min(1,(performance.now()-t0)/ms);fn(p);if(p<1)requestAnimationFrame(st);else res();};requestAnimationFrame(st);});}
export const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
