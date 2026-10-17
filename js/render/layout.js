// render/layout.js — Responsive layout: picks wide / mid / narrow HUD layout and sizes the board and canvases.
import {ST} from '../core/shared.js';
import {$,clamp} from '../core/util.js';
import {cur} from '../ui/screens.js';
import {cv} from '../game/state.js';
import {buildSprites} from './sprites.js';

function chooseLayout(){
  const opts=[];if(ST.W>=1180)opts.push({k:'wide',top:86,bot:132,side:310});if(ST.W>=900)opts.push({k:'mid',top:176,bot:140,side:16});if(ST.W<900)opts.push({k:'narrow',top:134,bot:236,side:12});
  if(ST.G&&ST.G.theme.bg==='pathos')for(const o of opts)o.top+={wide:56,mid:110,narrow:40}[o.k];
  let best=null;for(const o of opts){const t=Math.floor(Math.min((ST.W-2*o.side)/ST.G.cols,(ST.H-o.top-o.bot)/ST.G.rows));o.t=t;if(!best||t>best.t+1)best=o;}return best;
}
export function layout(){
  ST.W=innerWidth;ST.H=innerHeight;ST.dpr=Math.min(2,devicePixelRatio||1);sizeCanvas(cv);if(!ST.G)return;
  const L=chooseLayout();$('#toasts').classList.toggle('mid',L.k==='mid');const gm=$('#game');gm.classList.remove('L-wide','L-mid','L-narrow');gm.classList.add('L-'+L.k);
  ST.LK=L.k;ST.T=clamp(L.t,10,52);ST.BW=ST.T*ST.G.cols;ST.BH=ST.T*ST.G.rows;ST.BX=Math.round((ST.W-ST.BW)/2);ST.BY=Math.round(L.top+Math.max(0,(ST.H-L.top-L.bot-ST.BH)/2));
  sizeCanvas($('#compassCv'));sizeCanvas($('#mm'));sizeCanvas($('#blood'));buildSprites();
}
function sizeCanvas(c){const r=c.getBoundingClientRect();const w=Math.max(1,Math.round((r.width||innerWidth)*ST.dpr)),h=Math.max(1,Math.round((r.height||innerHeight)*ST.dpr));if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;}
export function sizeAll(){ST.W=innerWidth;ST.H=innerHeight;ST.dpr=Math.min(2,devicePixelRatio||1);if(cur==='title')sizeCanvas($('#tcv'));if(cur==='game')layout();}
addEventListener('resize',sizeAll);
