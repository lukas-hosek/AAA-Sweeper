// scenes/desktop.js — The fake Windows 98 desktop: icons, windows, Start menu, patch notes, launcher progress bars.
import {$,$$,clamp,esc,rand,sleep,tween} from '../core/util.js';
import {audioInit} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {fadeTo,show} from '../ui/screens.js';
import {runIntro} from './intro.js';

/* ================= desktop ================= */
const desk=$('#desktop');
let launching=false,lastIconClick={el:null,t:0},zTop=10;
function tickClock(){const d=new Date();$('#clock').textContent=d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});}
tickClock();
setInterval(tickClock,10000);
export function selectIcon(el){$$('.dicon',desk).forEach(x=>x.classList.toggle('sel',x===el));}
desk.addEventListener('pointerdown',e=>{if(!e.target.closest('.dicon')&&!e.target.closest('.win98')&&!e.target.closest('#startmenu')&&!e.target.closest('.taskbar'))selectIcon(null);if(!e.target.closest('#startmenu')&&!e.target.closest('#startbtn'))closeStart();});
$$('.icons .dicon').forEach(b=>b.addEventListener('click',()=>{selectIcon(b);const t=performance.now();if(lastIconClick.el===b&&t-lastIconClick.t<500){openDesk(b.dataset.open);lastIconClick.el=null;}else lastIconClick={el:b,t};}));
$$('.icons .dicon').forEach(b=>b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openDesk(b.dataset.open);}}));
$('#aaa-icon').addEventListener('click',()=>{selectIcon($('#aaa-icon'));audioInit();setTimeout(launch,280);});
function winFrame(title,icon,body,cls='',width=''){
  const w=document.createElement('div');w.className='win98 '+cls;w.setAttribute('role','dialog');w.style.zIndex=++zTop;if(width)w.style.width=width;
  w.innerHTML=`<div class="title98">${icon?`<svg><use href="#${icon}"/></svg>`:''}<span>${esc(title)}</span><button class="btn98 x" aria-label="Close">×</button></div>${body}`;
  desk.appendChild(w);const r=w.getBoundingClientRect();w.style.left=Math.max(8,(innerWidth-r.width)/2+rand(-30,30))+'px';w.style.top=Math.max(8,(innerHeight-30-r.height)/2.4+rand(-20,20))+'px';
  w.addEventListener('pointerdown',()=>{w.style.zIndex=++zTop;});
  const tb=w.querySelector('.title98');tb.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const sx=e.clientX,sy=e.clientY,ox=w.offsetLeft,oy=w.offsetTop;tb.setPointerCapture(e.pointerId);
    const mv=ev=>{w.style.left=clamp(ox+ev.clientX-sx,-w.offsetWidth+60,innerWidth-60)+'px';w.style.top=clamp(oy+ev.clientY-sy,0,innerHeight-60)+'px';};const up=()=>{tb.removeEventListener('pointermove',mv);tb.removeEventListener('pointerup',up);};tb.addEventListener('pointermove',mv);tb.addEventListener('pointerup',up);});
  w.close=()=>{w.remove();renderTasks();};w.querySelector('.x').addEventListener('click',()=>w.close());w.dataset.title=title;w.dataset.icon=icon||'';renderTasks();return w;
}
function renderTasks(){const box=$('#tb-tasks');box.innerHTML='';$$('.win98',desk).forEach(w=>{const b=document.createElement('button');b.className='btn98 tb-task down';b.innerHTML=`${w.dataset.icon?`<svg><use href="#${w.dataset.icon}"/></svg>`:''}<span>${esc(w.dataset.title)}</span>`;b.onclick=()=>{w.style.zIndex=++zTop;};box.appendChild(b);});}
function msgbox(title,text,icon='i-info'){S.ding();const w=winFrame(title,null,`<div class="body98"><div class="l-row"><svg><use href="#${icon}"/></svg><p>${text}</p></div><div class="btnrow"><button class="btn98 ok">OK</button></div></div>`,'','min(380px,calc(100vw - 20px))');w.querySelector('.ok').onclick=()=>w.close();w.querySelector('.ok').focus();return w;}
const PATCH=`TRIPLE A SWEEPER — PATCH NOTES v1.0.7 (DAY ONE)

GAMEPLAY
- Mines are now 14% more explosive.
- Removed the "lose" condition based on player feedback.
- Health now regenerates. Please stand near a wall.
- Fixed a bug where clicking a tile revealed the tile.
  (This was not a bug. It has been restored.)
- The quest marker now marks the quest.

NARRATIVE
- Added 340 lines of radio dialogue.
- Big Dez will now ask you to come to the club
  roughly 40% less often (from 100%).
- Dr. Kova is sorry.

ECONOMY
- Flags remain free. For now.
- Added the Chrome Flag. It is very shiny.

KNOWN ISSUES
- The club cannot be reached on foot.
- Mom keeps calling.
- Some numbers may be numbers.

Thank you for playing. Please leave a review.`;
function openDesk(k){
  if(k==='notes'){const w=winFrame('PATCH_NOTES.TXT - Notepad','i-note',`<div class="np-menu"><span>File</span><span>Edit</span><span>Search</span><span>Help</span></div><div class="np-text" tabindex="0"></div>`,'notepad');w.querySelector('.np-text').textContent=PATCH;}
  else if(k==='pc')msgbox('My Computer','My Computer is busy downloading the Triple A Sweeper day-one patch. Please try again in 74.2 GB.','i-warn');
  else if(k==='docs')msgbox('My Documents','This folder is empty. Your save games are in the cloud. You do not have Cloud Saves+.');
  else if(k==='bin')msgbox('Recycle Bin','The Recycle Bin contains 1 item: "Single-player games without an online requirement".');
}
let startOpen=false;
function closeStart(){const m=$('#startmenu');if(m)m.remove();startOpen=false;$('#startbtn').classList.remove('down');}
$('#startbtn').addEventListener('click',()=>{if(startOpen){closeStart();return;}startOpen=true;$('#startbtn').classList.add('down');const m=document.createElement('div');m.id='startmenu';m.className='win98';m.style.zIndex=++zTop;
  m.innerHTML=`<div class="side"><b>Sweep</b>OS 98</div><ul><li><button data-s="play"><svg><use href="#i-mine"/></svg>Triple A Sweeper</button></li><li><button data-s="notes"><svg><use href="#i-note"/></svg>Patch Notes</button></li><li><hr></li><li><button data-s="off"><svg><use href="#i-pc"/></svg>Shut Down...</button></li></ul>`;
  desk.appendChild(m);m.style.left='2px';m.style.top='auto';m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;closeStart();if(b.dataset.s==='play'){audioInit();launch();}else if(b.dataset.s==='notes')openDesk('notes');else{const s=document.createElement('div');s.id='safeoff';s.innerHTML='It’s now safe to turn off<br>your computer.';desk.appendChild(s);s.addEventListener('click',()=>s.remove());}});});
async function launch(){
  if(launching)return;launching=true;closeStart();desk.classList.add('busy');
  const w=winFrame('Triple A Sweeper Launcher','i-mine',`<div class="body98"><div class="l-row"><svg><use href="#i-mine"/></svg><div><p id="l-msg">Checking for launcher updates…</p><p class="dim98" id="l-sub">&nbsp;</p></div></div><div class="prog98"><i id="l-bar"></i></div><div class="btnrow"><button class="btn98" disabled>Cancel</button></div></div>`,'','min(420px,calc(100vw - 20px))');
  const r=w.getBoundingClientRect();w.style.left=(innerWidth-r.width)/2+'px';w.style.top=Math.max(8,(innerHeight-30-r.height)/2)+'px';
  const msg=$('#l-msg'),sub=$('#l-sub'),bar=$('#l-bar');
  const step=async(m,ms,fn)=>{msg.textContent=m;bar.style.width='0%';await tween(ms,p=>{bar.style.width=(p*100)+'%';sub.textContent=fn?fn(p):' ';});};
  await step('Checking for launcher updates…',650,p=>'Updating the launcher for the launcher');
  await step('Downloading day-one patch…',1700,p=>`${(74.2*p).toFixed(1)} GB of 74.2 GB · ${Math.round(900+Math.random()*500)} MB/s`);
  await step('Compiling shaders…',1500,p=>`${Math.floor(48213*p).toLocaleString('en-US')} / 48,213`);
  await step('Installing kernel-level anti-cheat for a single-player game…',700);
  await step('Signing in to Megalith Online™ (required)…',600,p=>p<1?'Connecting':'Connected. 0 friends online.');
  await fadeTo(1,700);w.close();desk.classList.remove('busy');selectIcon(null);launching=false;show('intro');await sleep(200);fadeTo(0,10);runIntro();
}
