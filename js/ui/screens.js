// ui/screens.js — Screen switching (desktop / intro / title / game) and the full-screen fade.
import {$,$$,sleep} from '../core/util.js';

/* ================= screens / fade ================= */
export let cur='desktop';
export function show(id){cur=id;for(const s of $$('.screen'))s.hidden=s.id!==id;}
export function fadeTo(v,ms){const f=$('#fade');f.style.transition=`opacity ${ms}ms`;f.classList.toggle('block',v>0);void f.offsetWidth;f.style.opacity=v;return sleep(ms);}
