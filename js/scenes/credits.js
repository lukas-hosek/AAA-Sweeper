// scenes/credits.js — End credits: 1,412 rows of Claude, cards, auto-scroll, fast-forward and skip.
import {ST} from '../core/shared.js';
import {VOICES} from '../data/voice-manifest.js';
import {CHAR,lineText} from '../data/dialogue.js';
import {FIELDS} from '../data/fields.js';
import {musicStart,musicStop} from '../audio/music.js';
import {$,esc} from '../core/util.js';
import {A,unmuffle} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {braam} from '../audio/instruments.js';
import {say,stopAllVoices} from '../audio/voices.js';
import {fadeTo} from '../ui/screens.js';
import {toTitle} from './title.js';
import {unlock} from '../ui/notify.js';
import {o2Off} from '../game/pathos.js';
import {showResults} from '../game/outcome.js';
import {plate} from '../render/sprites.js';
import {closeOverlays} from '../ui/panels.js';
import {ART,showArt} from './concept-art.js';

/* ================= credits ================= */
export const CR={on:false,from:'title',tok:0,raf:0,y:0,fast:false,skipped:false,offs:[],listH:0,rollH:0,artI:0,artT:0,lastTs:0,rollDone:null};
function creditsData(){
  const S=[],add=(h,roles)=>S.push({h,roles}),note=t=>S.push({note:t});
  add('DIRECTION',['Game Director','Creative Director','Associate Creative Director','Art Director','Audio Director','Narrative Director','Technical Director','Design Director','Director of Quest Marker Brightness','Director of Directing']);
  const feats=['Quest Markers','Regenerating Health','Radio Chatter','Supply Drops','The Battle Pass','Lore Fragments','The Minimap','The Compass','Flag Skins','Achievements','Autosave','The Club',"Mom's Calls",'Blood','The Launcher'];
  add('PRODUCTION',['Executive Producer','Senior Producer','Producer','Associate Producer','Assistant Producer','Production Coordinator','Production Manager','Release Manager','Scrum Master','Agile Coach','Jira Archaeologist','Meeting Scheduler','Producer of Producers',...feats.map(f=>'Associate Producer, '+f)]);
  add('GAME DESIGN',['Lead Game Designer','Principal Designer','Senior Systems Designer','Systems Designer','Combat Designer (Clicking)','Economy Designer','Progression Designer','Flag Designer','Quest Marker Designer','Mine Placement Designer (Random)','Difficulty Designer','Accessibility Designer',...FIELDS.map(f=>'Level Designer, '+f.name),...FIELDS.map(f=>'Associate Level Designer, '+f.name),...[1,2,3,4,5,6,7,8].map(n=>'Number Designer, The Number '+n)]);
  add('NARRATIVE',['Lead Writer','Senior Writer','Narrative Designer','Bark Writer','Barks-per-Minute Consultant','Lore Writer (5 of 400)','Subtitle Wrangler','Dialogue Coordinator','Story Consultant','Continuity Supervisor',...['Cmdr. Reyes','Dr. Mirela Kova','Big Dez','Quartermaster Pryce','Mom','Pvt. Jenkins','DJ Detonator','Prof. Lindqvist','HALCYON','???'].map(c=>'Writer, '+c)]);
  const artR=[];['Environment Artist','Concept Artist','Lighting Artist','Prop Artist'].forEach(r=>FIELDS.forEach(f=>['Lead ','Senior ',''].forEach(l=>artR.push(`${l}${r}, ${f.name}`))));
  add('ART',['Lead Artist','Principal Artist',...artR,'Tile Artist, Brushed Steel','Tile Artist, Sandstone','Tile Artist, Dance Floor','Tile Artist, Ice','Tile Artist, Lawn','Tile Artist, Bulkhead','VFX Artist, Bubbles','VFX Artist, Caustics','Water Level Designer','Number Glow Artist','VFX Artist, Explosions','VFX Artist, Blood','VFX Artist, Lens Flares','VFX Artist, Embers','VFX Artist, Sand','VFX Artist, Snow','VFX Artist, Lasers','Technical Artist','UI Artist','HUD Artist','Icon Artist','Font Picker','Film Grain Specialist','Bloom Consultant','Gnome Sculptor','Tulip Placement Artist']);
  add('ANIMATION',['Animation Director','Lead Animator','Flag Wave Animator','Tile Pop Animator','Crowd Bobbing Animator','Aurora Animator','Vulture Animator','Mirror Ball Rotation Animator','Mayhem Letter Drop Animator','Mocap Performer (Index Finger)','Mocap Performer (Right Click)']);
  const eng=['Gameplay','Graphics','Rendering','Engine','Tools','UI','Audio','Physics','Build','Online','Save System','Performance'];
  add('ENGINEERING',['Lead Engineer','Principal Engineer','Chief Architect',...eng.flatMap(e=>['Senior '+e+' Engineer',e+' Engineer']),'Flood Fill Engineer','Chord Click Engineer','Shader Compiler Babysitter','Anti-Cheat Engineer (Single-Player)','Network Engineer (Offline Mode)','Day-One Patch Engineer','Launcher-for-the-Launcher Engineer','Cloud Saves+ Engineer','localStorage Engineer','Regenerating Health Engineer']);
  note('Statistically, about 2% of players are still watching at this point. Hello. You are the 2%.');
  add('AUDIO',['Composer','Orchestrator','Music Supervisor','Lead Sound Designer','Sound Designer, Explosions','Sound Designer, Radio Squelch','Sound Designer, Heartbeat','Sound Designer, Tinnitus','Foley Artist, Flag Cloth','Foley Artist, Sand','Braam Technician','Mix Engineer','Mastering Engineer']);
  add('VOICE & PERFORMANCE',['Voice Director','Casting Director','Dialogue Editor','Text-to-Speech Wrangler','Radio Filter Engineer','Pronunciation Coach ("Nord Seven")','Line Producer']);
  const langs=['Czech','German','French','Spanish','Italian','Polish','Portuguese (Brazil)','Japanese','Korean','Chinese (Simplified)','Chinese (Traditional)','Russian','Turkish','Arabic','Dutch','Swedish','Finnish','Hungarian','Ukrainian','Romanian','Greek','Thai','Vietnamese','Klingon'];
  add('LOCALIZATION',['Localization Director','Localization Producer',...langs.flatMap(l=>[`Translator (${l})`,`Reviewer (${l})`,`Linguistic QA (${l})`])]);
  note('Fun fact: every single name in these credits is Claude.');
  add('USER RESEARCH',['User Research Lead','Playtest Coordinator','Eye-Tracking Analyst (Quest Marker)','Survey Author','Focus Group Snack Coordinator']);
  add('LIVE OPS & MONETIZATION',['Live Ops Director','Battle Pass Architect','Sweep Coin Economist','Store Curator','Time Saver Pack Ethicist','Loot Odds Discloser (Undisclosed)','Limited Time Offer Timer Operator','Season 7 Showrunner','Daily Challenge Designer']);
  add('MARKETING & COMMUNITY',['Brand Director','Brand Manager','Trailer Editor','"Not Actual Gameplay" Disclaimer Placer','Community Manager','Social Media Manager','Patch Notes Author','Influencer Relations','Discord Moderator','Reply Guy']);
  add('LEGAL & BUSINESS',['General Counsel','Parody Clearance Counsel','EULA Author (74 pages)','Privacy Officer','Business Development','Finance','Payroll (Unpaid)']);
  add('OPERATIONS',['IT Manager','IT Support ("Have you tried restarting?")','Facilities','Office Plant Care','Barista','Crunch Pizza Logistics','Chief Morale Officer']);
  add('QUALITY ASSURANCE',['QA Director','QA Manager','QA Lead','Lead Mine Tester']);
  const studios=['Montréal','Bucharest','Kyiv','Shanghai','Pune','Kraków','Austin','Cardiff','Manila','Lyon','Sofia','Kuala Lumpur','Halifax','Osaka'];
  const fixedStudio=['Studio Head','Studio Producer','Lead Artist','Artist','Artist','Engineer','Engineer','Designer'];
  let fixed=0;for(const x of S)if(x.roles)fixed+=x.roles.length;fixed+=studios.length*fixedStudio.length;
  const R=Math.max(0,1412-fixed),base=Math.floor(R/studios.length),extra=R%studios.length;
  const QA=['QA Tester','QA Tester','Senior QA Tester','QA Analyst','Compliance Tester','Click Tester','Right-Click Tester','Regression Tester','Mine Tester (Respawned)','QA Tester','Localization Tester','Performance Tester'];
  let q=0;studios.forEach((c,i)=>{const n=base+(i<extra?1:0);const roles=[...fixedStudio];for(let k=0;k<n;k++)roles.push(QA[q++%QA.length]);add('MEGALITH '+c.toUpperCase(),roles);if(i===6)note('Claude would like to thank Claude for their patience during crunch.');});
  return S;
}
const CR_END=`<h3>SPECIAL THANKS</h3><p class="cr-note">The person who typed “Tripple-A”, without whom this game would have been called Minesweeper.</p>
<p class="cr-note">Voices synthesized with Kokoro TTS, an open-weights speech model. Music, sound and tinnitus performed live by the Web Audio API in your browser. Built with Canvas 2D and an unreasonable amount of HTML.</p>
<h3>PRODUCTION BABIES</h3><p class="cr-note">Opus · Sonnet · Haiku</p>
<h3>NO THANKS TO</h3><p class="cr-note">The mines.</p>
<p class="cr-note">Unreality® Engine, Mayhem Physics, Blink Video and WWice™ are fictional, as is Megalith Interactive. Big Dez is real in our hearts. No minesweepers were harmed in the making of this game. Several were exploded.</p>
<div class="cr-big">1,412 POSITIONS<br>ONE CLAUDE</div>`;
function buildCreditsDOM(){const list=$('#cr-list');if(list.dataset.built)return;let h='';
  for(const s of creditsData()){if(s.note){h+=`<p class="cr-note">${esc(s.note)}</p>`;continue;}h+=`<h3>${esc(s.h)}</h3>`;for(const r of s.roles)h+=`<div class="cr-row cnt"><span>${esc(r)}</span><b>Claude</b></div>`;}
  list.innerHTML=h+CR_END;list.dataset.built='1';}
const OPEN_CARDS=[
  {html:`<div class="crc-logo"><span>TRIPLE A</span><span>SWEEPER</span></div><div class="crc-s">Remastered · Definitive · Game of the Year Edition</div>`,ms:4400,braam:true},
  {html:`<div class="crc-k">A MEGALITH INTERACTIVE PRODUCTION</div><div class="crc-n sm">A CLAUDE GAME</div>`},
  {html:`<div class="crc-k">DIRECTED BY</div><div class="crc-n">CLAUDE</div>`,braam:true},
  {html:`<div class="crc-k">WRITTEN BY</div><div class="crc-n">CLAUDE</div>`},
  {html:`<div class="crc-k">ORIGINAL SCORE BY</div><div class="crc-n">CLAUDE</div><div class="crc-s">Performed live by the Web Audio API Philharmonic</div>`},
  {html:`<div class="crc-k">STARRING</div><div class="crc-n sm">KOKORO TTS</div><div class="crc-s">as Cmdr. Reyes · Dr. Mirela Kova · Big Dez · Quartermaster Pryce · Mom · Pvt. Jenkins · DJ Detonator · Prof. Lindqvist · ??? · and the System</div>`,ms:4800},
  {html:`<div class="crc-k">CREATIVE DIRECTION</div><div class="crc-n sm">THE PERSON WHO TYPED “TRIPPLE-A”</div>`,ms:4200},
];
const END_CARDS=[{html:`<div class="crc-n sm">THANK YOU FOR PLAYING</div>`,ms:3600},{html:`<div class="crc-n">THE END</div><div class="crc-s">?</div>`,ms:3200,braam:true}];
function crSleep(ms,tok){return new Promise(res=>{let el=0;const iv=setInterval(()=>{el+=50*(CR.fast?5:1);if(tok!==CR.tok||el>=ms){clearInterval(iv);res();}},50);});}
async function crCards(cards,tok){const box=$('#cr-cards');for(const c of cards){if(tok!==CR.tok)return false;box.innerHTML=`<div class="crc">${c.html}</div>`;const el=box.firstChild;void el.offsetWidth;el.classList.add('on');if(c.braam&&A.ctx)braam(41,A.ctx.currentTime+.05,.26);await crSleep(c.ms||3600,tok);if(tok!==CR.tok)return false;el.classList.remove('on');await crSleep(1000,tok);}return tok===CR.tok;}
export async function startCredits(from){o2Off(true);
  CR.from=from;CR.on=true;CR.fast=false;CR.skipped=false;const tok=++CR.tok;if(document.fonts&&document.fonts.load)document.fonts.load('700 24px Caveat').catch(()=>{});cancelAnimationFrame(CR.raf);
  stopAllVoices();unmuffle();closeOverlays();await fadeTo(1,800);if(tok!==CR.tok)return;
  $('#credits').hidden=false;$('#cr-stage').hidden=true;$('#cr-ui').hidden=false;$('#cr-cards').innerHTML='';$('#cr-count').textContent='POSITIONS CREDITED 0000 / 1,412';musicStart('credits');
  await fadeTo(0,900);
  if(!await crCards(OPEN_CARDS,tok))return;
  buildCreditsDOM();$('#cr-cards').innerHTML='';$('#cr-stage').hidden=false;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));if(tok!==CR.tok)return;
  const list=$('#cr-list');CR.listH=list.offsetHeight;CR.rollH=$('#cr-roll').clientHeight;CR.offs=[...list.querySelectorAll('.cnt')].map(e=>e.offsetTop);CR.y=0;CR.artI=0;CR.artT=0;showArt(0);
  await new Promise(res=>{CR.rollDone=res;CR.lastTs=performance.now();CR.raf=requestAnimationFrame(crTick);});
  if(tok!==CR.tok)return;if(!CR.skipped)unlock('credits');await crEnd(tok);
}
function crTick(ts){if(!CR.on||!CR.rollDone)return;const dt=Math.min(.1,Math.max(0,(ts-CR.lastTs)/1000));CR.lastTs=ts;CR.y+=dt*(CR.fast?1600:125);
  $('#cr-list').style.transform=`translate3d(0,${Math.round(CR.rollH-CR.y)}px,0)`;
  const lim=CR.y-CR.rollH*.5;let lo=0,hi=CR.offs.length;while(lo<hi){const mid=(lo+hi)>>1;if(CR.offs[mid]<lim)lo=mid+1;else hi=mid;}
  $('#cr-count').textContent=`POSITIONS CREDITED ${String(lo).padStart(4,'0')} / ${CR.offs.length.toLocaleString('en-US')}`;
  CR.artT+=dt*(CR.fast?5:1);if(CR.artT>9.5){CR.artT=0;CR.artI=(CR.artI+1)%ART.length;showArt(CR.artI);}
  if(CR.y>CR.listH+CR.rollH*.6){const r=CR.rollDone;CR.rollDone=null;r();return;}
  CR.raf=requestAnimationFrame(crTick);}
async function crEnd(tok){
  $('#cr-stage').hidden=true;if(!await crCards(END_CARDS,tok))return;$('#cr-ui').hidden=true;
  const box=$('#cr-cards');box.innerHTML=`<div class="crc pc"><div class="pc-mk"></div><canvas id="cr-tile" width="220" height="220"></canvas><p class="pc-sub" id="pc-sub"></p></div>`;
  const tc=$('#cr-tile');tc.getContext('2d').drawImage(plate(220,false),0,0);const el=box.firstChild;void el.offsetWidth;el.classList.add('on');musicStop();
  await crSleep(1800,tok);if(tok!==CR.tok)return;say('d_win');$('#pc-sub').innerHTML=`<b style="color:${CHAR.dez.color}">Big Dez:</b> ${esc(lineText('d_win'))}`;
  await crSleep(((VOICES.d_win&&VOICES.d_win.d)||3)*1000+1500,tok);if(tok!==CR.tok)return;el.classList.remove('on');await crSleep(900,tok);
  musicStart('credits');if(!await crCards([{html:`<div class="crc-k">SWEEPER WILL RETURN IN</div><div class="crc-n sm">TRIPLE A SWEEPER 2</div><div class="crc-s">Double Trouble · Triple Edition · Pre-order now and receive one (1) exclusive flag</div>`,ms:4600,braam:true}],tok))return;
  finishCredits();
}
function finishCredits(){CR.on=false;CR.fast=false;cancelAnimationFrame(CR.raf);(async()=>{await fadeTo(1,700);$('#credits').hidden=true;$('#cr-cards').innerHTML='';
  if(CR.from==='game'&&ST.G){musicStart('win');showResults(true);await fadeTo(0,700);}else{ST.G=null;toTitle(true);}})();}
export function skipCredits(){if(!CR.on)return;CR.skipped=true;unlock('skipcred');const tok=++CR.tok;cancelAnimationFrame(CR.raf);CR.rollDone=null;CR.fast=false;stopAllVoices();$('#cr-stage').hidden=true;$('#cr-cards').innerHTML='';crEnd(tok);}
$('#cr-skip').addEventListener('click',e=>{e.stopPropagation();S.ui();skipCredits();});
$('#credits').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;CR.fast=true;});
addEventListener('pointerup',()=>{CR.fast=false;});
addEventListener('pointercancel',()=>{CR.fast=false;});
