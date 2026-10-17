// scenes/intro.js — Middleware logo intro with hold-to-skip.
import {$,$$,sleep} from '../core/util.js';
import {S} from '../audio/sfx.js';
import {cur} from '../ui/screens.js';
import {toTitle} from './title.js';

/* ================= intro ================= */
let introTok=0,introLeaving=false,hold={on:false,t0:0,raf:0};
export async function runIntro(){
  introLeaving=false;const tok=++introTok;const cards=$$('#intro .card');cards.forEach(c=>c.classList.remove('on'));$('#skip').classList.remove('hot');
  await sleep(900);
  for(const c of cards){if(tok!==introTok)return;c.classList.add('on');S.sting(c.dataset.sting);await sleep(+c.dataset.hold||2300);if(tok!==introTok)return;c.classList.remove('on');await sleep(900);}
  if(tok===introTok&&!introLeaving){introLeaving=true;toTitle(false);}
}
export function holdStart(){if(cur!=='intro'||hold.on||introLeaving)return;hold.on=true;hold.t0=performance.now();$('#skip').classList.add('hot');const fg=$('#sk-fg');
  const loop=()=>{if(!hold.on)return;const p=Math.min(1,(performance.now()-hold.t0)/850);fg.style.strokeDashoffset=94.25*(1-p);if(p>=1){hold.on=false;introTok++;fg.style.strokeDashoffset=94.25;introLeaving=true;toTitle(false);return;}hold.raf=requestAnimationFrame(loop);};loop();}
export function holdEnd(){if(!hold.on)return;hold.on=false;cancelAnimationFrame(hold.raf);$('#sk-fg').style.strokeDashoffset=94.25;}
$('#intro').addEventListener('pointerdown',e=>{e.preventDefault();holdStart();});
addEventListener('pointerup',holdEnd);
addEventListener('pointercancel',holdEnd);
