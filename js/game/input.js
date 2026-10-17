// game/input.js — Mouse, touch and keyboard input for the board, HUD buttons and menus.
import {ST} from '../core/shared.js';
import {$,$$,clamp} from '../core/util.js';
import {saveSettings,settings} from '../core/storage.js';
import {audioInit,setVol} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {cur} from '../ui/screens.js';
import {holdEnd,holdStart} from '../scenes/intro.js';
import {focusFirst,showMain} from '../scenes/title.js';
import {addFeed,combo,unlock} from '../ui/notify.js';
import {CAM,cv} from './state.js';
import {actFlag,actReveal,canAct,chord} from './rules.js';
import {updateHUD} from '../ui/hud.js';
import {closePanel,openPanel,openPause,resume} from '../ui/panels.js';
import {CR,skipCredits} from '../scenes/credits.js';

/* ================= input ================= */
function tileAt(x,y){if(!ST.G)return -1;const c=Math.floor((x-CAM.x-ST.BX)/ST.T),r=Math.floor((y-CAM.y-ST.BY)/ST.T);if(c<0||r<0||c>=ST.G.cols||r>=ST.G.rows)return -1;return r*ST.G.cols+c;}
ST.press=null;
cv.addEventListener('pointerdown',e=>{audioInit();if(!canAct())return;const i=tileAt(e.clientX,e.clientY);ST.G.mx=e.clientX;ST.G.my=e.clientY;ST.G.inCv=true;ST.G.touch=e.pointerType!=='mouse';ST.kbdOn=false;
  if(e.pointerType==='mouse'){if(e.button===2){e.preventDefault();actFlag(i);return;}if(e.button===1){e.preventDefault();if(i>=0&&ST.G.st[i]===1)chord(i);return;}if(e.button===0){ST.press={i,mouse:true};ST.G.pressed=i>=0&&ST.G.st[i]===0?i:-1;}}
  else{ST.press={i,x:e.clientX,y:e.clientY,long:false};ST.G.hover=i;ST.press.timer=setTimeout(()=>{if(ST.press&&ST.press.i>=0){ST.press.long=true;actFlag(ST.press.i);try{navigator.vibrate&&navigator.vibrate(25);}catch(_){}}},430);}});
cv.addEventListener('pointermove',e=>{if(!ST.G)return;ST.G.mx=e.clientX;ST.G.my=e.clientY;ST.G.inCv=true;const i=tileAt(e.clientX,e.clientY);if(i!==ST.G.hover&&e.pointerType==='mouse'){ST.G.hover=i;}
  if(ST.press&&ST.press.mouse)ST.G.pressed=(i===ST.press.i&&i>=0&&ST.G.st[i]===0)?i:-1;
  if(ST.press&&!ST.press.mouse&&Math.hypot(e.clientX-ST.press.x,e.clientY-ST.press.y)>12){clearTimeout(ST.press.timer);ST.press=null;}});
cv.addEventListener('pointerleave',e=>{if(!ST.G)return;if(e.pointerType==='mouse'){ST.G.inCv=false;ST.G.hover=-1;}});
addEventListener('pointerup',e=>{if(!ST.press||!ST.G)return;const p=ST.press;ST.press=null;ST.G.pressed=-1;clearTimeout(p.timer);if(p.long)return;const i=tileAt(e.clientX,e.clientY);if(i<0||i!==p.i)return;if(!p.mouse&&ST.flagMode)actFlag(i);else actReveal(i);});
cv.addEventListener('contextmenu',e=>e.preventDefault());
$('#b-mute').addEventListener('click',()=>{settings.muted=!settings.muted;saveSettings();setVol();updateHUD();});
$('#b-menu').addEventListener('click',()=>openPause());
$('#flagmode').addEventListener('click',()=>{ST.flagMode=!ST.flagMode;S.ui();updateHUD();});
$('#skillnag').addEventListener('click',()=>openPanel('skills'));
$('#respects').addEventListener('click',payRespects);
function payRespects(){if(!ST.G||ST.G.over)return;ST.G.respects++;S.respects();unlock('respects');const hadPrompt=ST.G.clock<ST.G.respectsUntil;ST.G.respectsUntil=0;combo(hadPrompt?'RESPECTS PAID':'RESPECTS PAID TO NO ONE',ST.G.respects);addFeed(`SWEEPER <span style="color:#c9c9d6">F</span> PAID RESPECTS <em>+1 RESPECT</em>`);}
addEventListener('keydown',e=>{
  if(CR.on){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();CR.fast=true;}else if(e.key==='Escape'){e.preventDefault();skipCredits();}return;}
  if(cur==='intro'){if(['Space','Enter','Escape'].includes(e.code)){e.preventDefault();audioInit();holdStart();}return;}
  if(cur==='title'){audioInit();if(!$('#panel').hidden){if(e.key==='Escape')closePanel();return;}if(ST.menuState==='press'){e.preventDefault();showMain();return;}
    if(e.key==='Escape'&&ST.menuState==='diff'){showMain();return;}if(e.key==='Escape'&&ST.menuState==='chap'){ST.menuState='diff';$('#chapmenu').hidden=true;$('#diffmenu').hidden=false;focusFirst('#diffmenu');return;}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();menuNav(e.key==='ArrowDown'?1:-1);}return;}
  if(cur!=='game'||!ST.G)return;
  if(!$('#panel').hidden){if(e.key==='Escape'){e.preventDefault();closePanel();}return;}
  if(!$('#pause').hidden){if(e.key==='Escape'){e.preventDefault();resume();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();menuNav(e.key==='ArrowDown'?1:-1);}return;}
  if(!$('#results').hidden||!$('#death').hidden)return;
  const k=e.key.toLowerCase();
  if(k==='escape'){e.preventDefault();openPause();return;}
  if(k==='j'){openPanel('quests');return;}if(k==='k'){openPanel('skills');return;}if(k==='b'){openPanel('store');return;}
  if(k==='f'){payRespects();return;}if(k==='m'){settings.muted=!settings.muted;saveSettings();setVol();updateHUD();return;}
  const mv={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[k];
  if(mv){e.preventDefault();if(ST.G.kbd<0)ST.G.kbd=ST.G.target>=0?ST.G.target:Math.floor(ST.G.n/2);if(ST.kbdOn){const c=clamp(ST.G.kbd%ST.G.cols+mv[0],0,ST.G.cols-1),r=clamp(((ST.G.kbd/ST.G.cols)|0)+mv[1],0,ST.G.rows-1);ST.G.kbd=r*ST.G.cols+c;}ST.kbdOn=true;ST.G.hover=ST.G.kbd;ST.G.inCv=false;S.hover();return;}
  if((k===' '||k==='enter')&&ST.kbdOn&&ST.G.kbd>=0){e.preventDefault();actReveal(ST.G.kbd);return;}
  if((k==='x'||k==='q')&&ST.kbdOn&&ST.G.kbd>=0){e.preventDefault();actFlag(ST.G.kbd);return;}
});
addEventListener('keyup',e=>{if(CR.on&&(e.code==='Space'||e.code==='Enter'))CR.fast=false;if(cur==='intro'&&['Space','Enter','Escape'].includes(e.code))holdEnd();});
function menuNav(d){const nav=cur==='title'?(!$('#mainmenu').hidden?$('#mainmenu'):!$('#diffmenu').hidden?$('#diffmenu'):$('#chapmenu')):$('#pause .menu');const bs=$$('button',nav);const i=bs.indexOf(document.activeElement);const n=bs[(i+d+bs.length)%bs.length];if(n){n.focus();S.hover();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cur==='game'&&ST.G&&!ST.G.over&&!ST.G.paused&&$('#death').hidden)openPause();});
