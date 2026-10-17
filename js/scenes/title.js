// scenes/title.js — Title screen, main menu, difficulty and chapter select, loading screen.
import {ST} from '../core/shared.js';
import {DIFFS,LOADING,TIPS} from '../data/content.js';
import {FIELDS} from '../data/fields.js';
import {musicStart,musicStop} from '../audio/music.js';
import {$,esc,pick,shuffle,sleep,tween} from '../core/util.js';
import {PROFILE,saveProfile} from '../core/storage.js';
import {A,audioInit,unmuffle} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {braam} from '../audio/instruments.js';
import {say,stopAllVoices} from '../audio/voices.js';
import {cur,fadeTo,show} from '../ui/screens.js';
import {selectIcon} from './desktop.js';
import {notify,unlock} from '../ui/notify.js';
import {o2Off} from '../game/pathos.js';
import {startGame} from '../game/start.js';
import {sizeAll} from '../render/layout.js';
import {closeOverlays,openPanel} from '../ui/panels.js';
import {startCredits} from './credits.js';

/* ================= title ================= */
let ldBusy=false;ST.menuState='press';
export async function toTitle(fromGame){
  await fadeTo(1,fromGame?600:400);
  stopAllVoices();unmuffle();show('title');$('#toasts').classList.remove('mid');o2Off(true);sizeAll();$('#ld').hidden=true;$('#press').hidden=!!fromGame;$('#mainmenu').hidden=!fromGame;$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;ST.menuState=fromGame?'main':'press';ldBusy=false;
  musicStart('title');
  if(!fromGame&&A.ctx){braam(38,A.ctx.currentTime+.15,.42);setTimeout(()=>{if(cur==='title')say('a_title');},1300);}
  await fadeTo(0,fromGame?700:900);
  if(fromGame)focusFirst('#mainmenu');
}
export function focusFirst(sel){const b=$(sel+' button');if(b)b.focus();}
export function showMain(){ST.menuState='main';$('#press').hidden=true;$('#mainmenu').hidden=false;$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;S.whoosh();focusFirst('#mainmenu');}
$('#title').addEventListener('pointerdown',e=>{audioInit();if(ST.menuState==='press'&&!e.target.closest('button')){e.preventDefault();showMain();}});
$('#mainmenu').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.ui();const m=b.dataset.m;
  if(m==='new'){ST.menuState='diff';$('#mainmenu').hidden=true;$('#diffmenu').hidden=false;focusFirst('#diffmenu');}
  else if(m==='continue'){S.denied();notify('CLOUD SAVES+ REQUIRED','Continue is available with a Cloud Saves+ subscription. Or start a New Game.','info','!');}
  else if(m==='credits')startCredits('title');
  else if(m==='store')openPanel('store','title');else if(m==='settings')openPanel('settings','title');
  else if(m==='quit')quitDesktop();});
$('#diffmenu').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.ui();const d=b.dataset.d;
  if(d==='back'){showMain();return;}if(d==='realism'){S.denied();notify('SEASON PASS REQUIRED','Realism mode unlocks with the Season Pass. The Season Pass unlocks with money.','info','!');return;}showChapters(d);});
let chapDiff='normal';
function showChapters(d){ST.menuState='chap';chapDiff=d;const m=PROFILE.maxField||1,nav=$('#chapmenu');
  nav.innerHTML=`<div class="menu-h">SELECT CHAPTER · ${DIFFS[d].label.toUpperCase()}</div>`+FIELDS.map((f,i)=>{const n=i+1,lock=n>m;return `<button data-c="${n}" class="${lock?'locked':''}">${n}. ${esc(f.name.toUpperCase())}<small>${lock?'Locked · Clear the previous chapter':esc(f.op)}</small></button>`;}).join('')+(m<FIELDS.length?`<button data-c="pack">TIME SAVER PACK<small class="hot">Unlock every chapter now · €4.99</small></button>`:'')+`<button data-c="back">BACK</button>`;
  $('#diffmenu').hidden=true;nav.hidden=false;focusFirst('#chapmenu');}
$('#chapmenu').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.ui();const c=b.dataset.c;
  if(c==='back'){ST.menuState='diff';$('#chapmenu').hidden=true;$('#diffmenu').hidden=false;focusFirst('#diffmenu');return;}
  if(c==='pack'){PROFILE.maxField=FIELDS.length;saveProfile();S.coin();unlock('timesaver');notify('PURCHASE COMPLETE','€0.00 charged|Every chapter unlocked. Your time is valuable. Ours is not.','ach','⏱');showChapters(chapDiff);return;}
  const n=+c;if(n>(PROFILE.maxField||1)){S.denied();notify('CHAPTER LOCKED','Clear the previous chapter, or buy the Time Saver Pack.','info','!');return;}loadGame(chapDiff,n);});
['#mainmenu','#diffmenu','#chapmenu','#pause .menu'].forEach(s=>$(s).addEventListener('pointerover',e=>{if(e.target.closest('button'))S.hover();}));
async function loadGame(d,field){
  if(ldBusy)return;ldBusy=true;ST.menuState='load';$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;$('#ld').hidden=false;$('#ld-tip').textContent=pick(TIPS);
  const msgs=shuffle([...LOADING]);await tween(2600,p=>{$('#ld-bar').style.width=(p*100)+'%';$('#ld-st').textContent=msgs[Math.min(msgs.length-1,Math.floor(p*4))]+'…';});
  $('#ld-st').textContent='Press any key to continue';await sleep(250);startGame(d,false,field||1);
}
export function quitDesktop(){$('#toasts').classList.remove('mid');o2Off(true);(async()=>{await fadeTo(1,500);musicStop();stopAllVoices();unmuffle();closeOverlays();ST.G=null;show('desktop');selectIcon(null);await fadeTo(0,500);})();}
