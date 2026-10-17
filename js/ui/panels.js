// ui/panels.js — Pause menu and the tabbed panel (quest log, skills, store, achievements, settings).
import {ST} from '../core/shared.js';
import {CHAR} from '../data/dialogue.js';
import {ACH,DIFFS,LORE,PERKS,SIDE,SKINS,STORE} from '../data/content.js';
import {$,esc} from '../core/util.js';
import {PROFILE,ownedSkins,saveProfile,saveSettings,settings} from '../core/storage.js';
import {setVol} from '../audio/engine.js';
import {S} from '../audio/sfx.js';
import {VM,chatterGap} from '../audio/voices.js';
import {cur} from './screens.js';
import {focusFirst,quitDesktop,toTitle} from '../scenes/title.js';
import {banner,notify,unlock} from './notify.js';
import {lootRoll} from '../game/events.js';
import {startGame} from '../game/start.js';
import {BL} from '../render/blood.js';
import {updateHUD} from './hud.js';

/* ================= pause / panels ================= */
let panelTab='quests',panelReturn='game';
function setPaused(on){if(!ST.G)return;ST.G.paused=on;ST.press=null;ST.G.pressed=-1;setVol();}
export function openPause(){if(!ST.G||ST.G.over||ST.G.dead)return;setPaused(true);$('#pz-s').textContent=`${ST.G.theme.name} · ${DIFFS[ST.G.dkey].label} · ${$('#timer').textContent}`;$('#pz-sp').textContent=PROFILE.skill?`${PROFILE.skill} unspent point${PROFILE.skill>1?'s':''}`:'No unspent points';$('#pause').hidden=false;S.ui();focusFirst('#pause .menu');}
export function resume(){$('#pause').hidden=true;setPaused(false);S.ui();}
export function closeOverlays(){['#pause','#panel','#death','#results'].forEach(s=>$(s).hidden=true);}
$('#pause').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const p=b.dataset.p;S.ui();
  if(p==='resume')resume();else if(['quests','skills','store','ach','settings'].includes(p))openPanel(p,'pause');
  else if(p==='restart'){$('#pause').hidden=true;startGame(ST.G.dkey,true,ST.G.field);}else if(p==='title'){$('#pause').hidden=true;ST.G=null;toTitle(true);}else if(p==='desktop')quitDesktop();});
export function openPanel(tab,from){panelTab=tab;panelReturn=from||(cur==='game'?(!$('#pause').hidden?'pause':'game'):'title');if(cur==='game'&&ST.G)setPaused(true);$('#pause').hidden=true;renderPanel();$('#panel').hidden=false;if(tab==='quests')unlock('quest');S.ui();}
export function closePanel(){$('#panel').hidden=true;S.ui();if(panelReturn==='pause'&&ST.G){openPause();}else if(panelReturn==='game'&&ST.G){setPaused(false);}else if(cur==='title'){focusFirst('#mainmenu');}}
function renderPanel(){
  const tabs=[['quests','QUEST LOG'],['skills','SKILLS'],['store','STORE'],['ach','ACHIEVEMENTS'],['settings','SETTINGS']];
  $('#pn-tabs').innerHTML=tabs.map(([k,n])=>`<button data-tab="${k}" class="${k===panelTab?'on':''}">${n}</button>`).join('')+`<button class="x" data-close="1">BACK [ESC]</button>`;
  const b=$('#pn-body');let h='';
  if(panelTab==='quests'){
    if(!ST.G){h=`<div class="pn-h">No active operation</div><p class="pn-p">Start a New Game to receive quests. Quests are where the game tells you what to do.</p>`;}
    else{const safe=ST.G.n-ST.G.mines;h+=`<div class="pn-h">Main quest · ${esc(ST.G.theme.ch)}</div><div class="grid"><div class="qc main"><span class="qk">MAIN · ${esc(ST.G.theme.giver)}</span><span class="qn">${esc(ST.G.theme.op)}</span><span class="qd">${esc(ST.G.theme.desc)}</span>
      <ul><li>Reveal the safe tiles: ${ST.G.opened}/${safe}</li><li>Flag the mines (optional): ${ST.G.flags}/${ST.G.mines}</li><li>Follow the quest marker: ${ST.G.follows} times</li><li>Survive: ${ST.G.deaths} deaths</li></ul></div></div>`;
      h+=`<div class="pn-h" style="margin-top:20px">Side quests</div>`;
      if(!ST.G.side.length)h+=`<p class="pn-p">No side quests yet. Keep your radio on. Someone will call. Someone always calls.</p>`;
      else h+=`<div class="grid">${ST.G.side.map(k=>{const q=SIDE[k],col=CHAR[q.who].color,done=k==='club'&&ST.G.clubDone;return `<div class="qc" style="--qcol:${col}"><span class="qk">SIDE · ${esc(q.giver.toUpperCase())}</span><span class="qn">${esc(q.name)}</span><span class="qd">${esc(q.desc)}</span><span class="qo ${done?'done':''}">${done?'✓ ':'◆ '}${esc(q.obj())}</span>${done?'':`<button class="pbtn ${ST.G.tracked===k?'':'alt'}" data-q="${k}">${ST.G.tracked===k&&q.act==='TRACK'?'TRACKED':esc(q.act)}</button>`}</div>`;}).join('')}</div>`;
      h+=`<div class="pn-h" style="margin-top:20px">Lore fragments · ${PROFILE.lore}/400</div>`;
      h+=PROFILE.lore?`<ul class="lore-l">${Array.from({length:Math.min(PROFILE.lore,LORE.length)},(_,i)=>`<li>${esc(LORE[i])}</li>`).join('')}</ul>`:`<p class="pn-p">Lore fragments hide under safe tiles. The minimap marks them with a question mark, which defeats the purpose.</p>`;}
  }else if(panelTab==='skills'){
    h=`<div class="pn-h">Skill points available: ${PROFILE.skill}</div><p class="pn-p">Earn skill points by levelling up. Level up by clicking tiles. Click tiles by following the marker.</p><div class="grid">${PERKS.map(p=>{const own=PROFILE.perks[p.id];return `<div class="qc"><span class="qk">PERK</span><span class="qn">${esc(p.name)}</span><span class="qd">${esc(p.desc)}</span>${own?'<span class="qo done">✓ UNLOCKED</span>':`<button class="pbtn" data-perk="${p.id}" ${PROFILE.skill<1?'disabled':''}>UNLOCK · 1 POINT</button>`}</div>`;}).join('')}</div>`;
  }else if(panelTab==='store'){
    h=`<div class="pn-h">Sweep coins: ${PROFILE.coins.toLocaleString('en-US')}</div><p class="pn-p">Earn coins by levelling up and opening supply drops. Or skip the grind. Equipped flag: ${esc(SKINS[PROFILE.skin].name)}.</p><div class="grid">${STORE.map(it=>{const own=it.type==='skin'&&PROFILE.owned[it.id];const eq=own&&PROFILE.skin===it.id;
      const sw=it.type==='skin'?`<div class="swatch"><svg viewBox="0 0 40 48"><rect x="10" y="6" width="3" height="36" fill="#1b2127"/><rect x="5" y="42" width="18" height="4" fill="#0c0f12"/><path d="M13 6 L36 13 L13 20 Z" fill="${SKINS[it.id].a}" stroke="${SKINS[it.id].b}" stroke-width="2"/></svg></div>`:`<div class="swatch"><span style="font:600 26px var(--f-num);color:var(--gold-hi)">${it.type==='boost'?'×2':it.type==='crate'?'?':'⛁'}</span></div>`;
      const btn=own?(eq?`<button class="pbtn" disabled>EQUIPPED</button>`:`<button class="pbtn alt" data-equip="${it.id}">EQUIP</button>`):`<button class="pbtn" data-buy="${it.id}">BUY</button>`;
      return `<div class="qc si">${sw}<span class="qn">${esc(it.name)}</span><span class="qd">${esc(it.desc)}</span><span class="price">${typeof it.price==='number'?`<span class="coin"></span>${it.price}`:esc(it.price)}</span>${btn}</div>`;}).join('')}${PROFILE.skin!=='red'?`<div class="qc si"><div class="swatch"><svg viewBox="0 0 40 48"><rect x="10" y="6" width="3" height="36" fill="#1b2127"/><rect x="5" y="42" width="18" height="4" fill="#0c0f12"/><path d="M13 6 L36 13 L13 20 Z" fill="#ff4a4a" stroke="#a5111b" stroke-width="2"/></svg></div><span class="qn">Standard Flag</span><span class="qd">The flag you started with. Free, forever, probably.</span><button class="pbtn alt" data-equip="red">EQUIP</button></div>`:''}</div><p class="pn-p" style="margin-top:16px;font-size:11px;color:#71808a">*No real money is involved. This is a parody of real money.</p>`;
  }else if(panelTab==='ach'){
    const keys=Object.keys(ACH),got=keys.filter(k=>PROFILE.ach[k]).length;h=`<div class="pn-h">${got}/${keys.length} unlocked · ${PROFILE.gs} G</div><div class="grid">${keys.map(k=>{const a=ACH[k],own=PROFILE.ach[k];return `<div class="ac ${own?'':'lock'}"><div class="ti-ic">${own?'✦':'?'}</div><div><b>${esc(a[0])}</b><span>${esc(a[1])}</span></div><span class="gs">${a[2]} G</span></div>`;}).join('')}</div>`;
  }else if(panelTab==='settings'){
    const rng=(id,lab,v)=>`<label for="s-${id}">${lab}</label><input type="range" id="s-${id}" min="0" max="1" step="0.05" value="${v}" data-set="${id}">`;
    h=`<div class="pn-h">Audio</div><div class="set">${rng('master','Master volume',settings.master)}${rng('music','Music',settings.music)}${rng('voice','Voices',settings.voice)}${rng('sfx','Sound effects',settings.sfx)}
      <label for="s-chatter">Radio chatter</label><select id="s-chatter" data-set="chatter">${[['off','Off (not recommended by our narrative team)'],['normal','Normal (default)'],['constant','Constant (they talk over each other)'],['unbearable','Unbearable']].map(([v,n])=>`<option value="${v}" ${settings.chatter===v?'selected':''}>${n}</option>`).join('')}</select>
      <label for="s-subs">Subtitles</label><select id="s-subs" data-set="subs"><option value="1" ${settings.subs?'selected':''}>On</option><option value="0" ${settings.subs?'':'selected'}>Off</option></select></div>
      <div class="pn-h" style="margin-top:22px">Graphics</div><div class="set">
      <label for="s-grain">Film grain</label><select id="s-grain" data-set="grain"><option value="1" ${settings.grain?'selected':''}>Cinematic</option><option value="0" ${settings.grain?'':'selected'}>Off</option></select>
      <label for="s-sway">Camera sway</label><select id="s-sway" data-set="sway"><option value="1" ${settings.sway?'selected':''}>On</option><option value="0" ${settings.sway?'':'selected'}>Off</option></select>
      <label for="s-blood">Blood</label><select id="s-blood" data-set="blood"><option value="1" ${settings.blood?'selected':''}>On (cinematic)</option><option value="0" ${settings.blood?'':'selected'}>Off</option></select>
      <label for="s-mb">Motion blur</label><select id="s-mb" disabled><option>Cinematic (mandatory)</option></select>
      <label for="s-pt">Path-traced tiles</label><select id="s-pt" disabled><option>Ultra</option></select>
      <label for="s-up">Upscaling</label><select id="s-up" disabled><option>Ultra Performance (renders at 9 × 9)</option></select><span class="note">Some options are locked to preserve the artistic vision.</span></div>`;
  }
  b.innerHTML=h;
}
$('#pn-tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close){closePanel();return;}panelTab=b.dataset.tab;S.ui();renderPanel();if(panelTab==='quests')unlock('quest');});
$('#pn-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.q){const k=b.dataset.q,q=SIDE[k];S.ui();if(q.act==='CALL'){notify('CALL FAILED','No signal in the minefield.|Mom has been notified that you tried.','info','✆');}else if(q.act==='OPEN STORE'){panelTab='store';}ST.G.tracked=k;updateHUD();renderPanel();return;}
  if(b.dataset.perk){if(PROFILE.skill<1)return;PROFILE.skill--;PROFILE.perks[b.dataset.perk]=1;saveProfile();S.level();unlock('skill');updateHUD();renderPanel();return;}
  if(b.dataset.equip){PROFILE.skin=b.dataset.equip;saveProfile();S.flag();if(PROFILE.skin==='tune')S.tune();updateHUD();renderPanel();return;}
  if(b.dataset.buy){const it=STORE.find(x=>x.id===b.dataset.buy);if(it.type==='iap'){PROFILE.coins+=1000;saveProfile();S.coin();unlock('whale');notify('PURCHASE COMPLETE','€0.00 charged|This is a parody. Enjoy 1,000 coins anyway.','ach','⛁');renderPanel();updateHUD();return;}
    if(PROFILE.coins<it.price){S.denied();notify('NOT ENOUGH SWEEP COINS','Level up, open supply drops, or buy the 1,000 coin bundle.','info','!');return;}
    PROFILE.coins-=it.price;S.coin();unlock('whale');
    if(it.type==='skin'){PROFILE.owned[it.id]=true;PROFILE.skin=it.id;if(it.id==='tune')S.tune();notify('PURCHASED',`${it.name}|Equipped. Same hitbox. Feels better.`,'ach','⚑');if(ownedSkins()>=3&&ST.G&&ST.G.side.includes('qm'))banner('QUEST COMPLETE','Premium Flag Collector','The Quartermaster is proud of you','#4fd8ff');}
    else if(it.type==='boost'){PROFILE.boostUntil=Math.max(Date.now(),PROFILE.boostUntil)+5*60*1000;notify('XP BOOST ACTIVE','Double XP for 5 minutes','ach','×2');}
    else if(it.type==='crate'){lootRoll();}
    saveProfile();updateHUD();renderPanel();}});
$('#pn-body').addEventListener('input',e=>{const el=e.target;const k=el.dataset.set;if(!k)return;if(el.type==='range')settings[k]=+el.value;else if(k==='chatter')settings.chatter=el.value;else settings[k]=el.value==='1';
  saveSettings();setVol();$('#fx-grain').classList.toggle('off',!settings.grain);if(k==='blood'&&!settings.blood){BL.s.length=0;BL.ind.length=0;BL.on=false;$('#blood').style.opacity=0;}if(k==='chatter'&&ST.G)VM.next=ST.G.clock+chatterGap();});
