// main.js — Entry point: imports every module in the original order, then starts the render loop.
import {ST} from './core/shared.js';
import './data/voice-manifest.js';
import './data/dialogue.js';
import './data/content.js';
import './data/fields.js';
import './audio/music.js';
import {$} from './core/util.js';
import './core/storage.js';
import './audio/engine.js';
import './audio/voice-bank.js';
import './audio/sfx.js';
import './audio/instruments.js';
import './audio/voices.js';
import './ui/radio.js';
import {cur} from './ui/screens.js';
import './scenes/desktop.js';
import './scenes/intro.js';
import './scenes/title.js';
import './ui/notify.js';
import './game/state.js';
import './game/rules.js';
import './game/pathos.js';
import './game/events.js';
import './game/outcome.js';
import './game/start.js';
import './render/layout.js';
import './render/sprites.js';
import {drawTitle} from './render/scenery.js';
import './render/blood.js';
import './render/particles.js';
import {gameUpdate} from './game/update.js';
import {drawGame} from './render/draw-game.js';
import './render/hud-canvas.js';
import './ui/hud.js';
import './game/input.js';
import './ui/panels.js';
import {CR} from './scenes/credits.js';
import './scenes/concept-art.js';

/* ================= boot ================= */
(function makeGrain(){const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),id=g.createImageData(160,160);for(let k=0;k<id.data.length;k+=4){const v=Math.random()*255|0;id.data[k]=id.data[k+1]=id.data[k+2]=v;id.data[k+3]=255;}g.putImageData(id,0,0);$('#fx-grain').style.backgroundImage=`url(${c.toDataURL()})`;})();
let lastTs=0;
function tick(ts){const t=ts/1000,dt=Math.min(.05,Math.max(0,(ts-lastTs)/1000));lastTs=ts;
  try{if(CR.on&&!$('#credits').hidden){}else if(cur==='title')drawTitle(t,dt);else if(cur==='game'&&ST.G){gameUpdate(t,dt);if(ST.G)drawGame(t,dt);}}catch(err){console.error(err);}
  requestAnimationFrame(tick);}
requestAnimationFrame(tick);
$('#aaa-icon').focus({preventScroll:true});

// Test and tooling hooks (window.__t, window.__render) are only loaded with ?debug in the URL.
if(new URLSearchParams(location.search).has('debug'))import('./debug.js');
