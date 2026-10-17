// ui/hud.js — DOM HUD updates (quest list, XP, health, mines counter, prompts).
import {ST} from '../core/shared.js';
import {CHAR} from '../data/dialogue.js';
import {RANKS,SIDE,SKINS} from '../data/content.js';
import {$,esc} from '../core/util.js';
import {PROFILE,settings} from '../core/storage.js';
import {need} from '../game/rules.js';

/* ================= HUD ================= */
export function updateHUD(){if(!ST.G)return;
  $('#minesleft').textContent=ST.G.mines-ST.G.flags-ST.G.booms;$('#minestotal').textContent=ST.G.mines;$('#flagsn').textContent=ST.G.flags;$('#coins').textContent=PROFILE.coins.toLocaleString('en-US');
  $('#lvl').textContent=PROFILE.lvl;$('#rank').textContent=RANKS[Math.min(RANKS.length-1,PROFILE.lvl-1)]+' · RANK '+PROFILE.lvl;$('#xpbar').style.width=(PROFILE.xp/need(PROFILE.lvl)*100)+'%';$('#xptxt').textContent=`${PROFILE.xp} / ${need(PROFILE.lvl)} XP`;
  const sk=$('#skillnag');sk.hidden=PROFILE.skill<1;sk.textContent=`${PROFILE.skill} UNSPENT SKILL POINT${PROFILE.skill>1?'S':''}`;
  $('#tier').textContent=1+Math.floor((PROFILE.lvl-1)/2);$('#sbar').style.width=((PROFILE.lvl-1)%2*50+PROFILE.xp/need(PROFILE.lvl)*50)+'%';
  $('#boost').hidden=!(PROFILE.boostUntil>Date.now());$('#equip').textContent=PROFILE.skin==='red'?'STANDARD-ISSUE FINGER':(SKINS[PROFILE.skin].name+' · PREMIUM').toUpperCase();
  const safe=ST.G.n-ST.G.mines,o=[[`Reveal the safe tiles`,`${ST.G.opened}/${safe}`,ST.G.won],[`Flag the mines (optional)`,`${ST.G.flags}/${ST.G.mines}`,ST.G.won],[`Follow the quest marker`,`${ST.G.follows}`,ST.G.follows>=10],[`Survive`,ST.G.deaths?`${ST.G.deaths} ✝`:'',ST.G.won],[`Find lore fragments`,`${ST.G.loreFound}/400`,false]];
  if(ST.G.theme.bg==='pathos')o.splice(1,0,[ST.G.flooded?'Hold your breath (indefinitely)':'Clear the base before it floods','',ST.G.won&&!ST.G.flooded]);
  $('#q-obj').innerHTML=o.map(([n,v,d])=>`<li class="${d?'done':''}"><i></i><span>${esc(n)}</span><b>${esc(v)}</b></li>`).join('');
  const qs=$('#q-side');if(ST.G.tracked){const q=SIDE[ST.G.tracked];qs.hidden=false;qs.innerHTML=`<span class="qs-n" style="color:${CHAR[q.who].color}">◆ ${esc(q.name)}</span><span class="qs-o">${esc(q.obj())}</span>`;}else qs.hidden=true;
  $('#b-mute').textContent=settings.muted?'SOUND OFF':'SOUND ON';$('#flagmode').textContent=ST.flagMode?'FLAG MODE: ON':'FLAG MODE: OFF';$('#flagmode').classList.toggle('on',ST.flagMode);
}
export function updateHUDframe(){const hp=Math.max(0,ST.G.hp);$('#hpbar').style.width=hp+'%';$('#hptrail').style.width=Math.max(hp,ST.G.hpTrail)+'%';$('#hptxt').textContent=Math.ceil(hp);const t=ST.G.elapsed;$('#timer').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
