// game/start.js — startGame(): resets everything and enters a chapter.
import {ST} from '../core/shared.js';
import {CHAT,SHARED} from '../data/dialogue.js';
import {DIFFS} from '../data/content.js';
import {FIELDS} from '../data/fields.js';
import {musicStart} from '../audio/music.js';
import {$,shuffle} from '../core/util.js';
import {settings} from '../core/storage.js';
import {unmuffle} from '../audio/engine.js';
import {decodeOne,predecode} from '../audio/voice-bank.js';
import {VM,bark,initChatter,nextChatter,say,stopAllVoices} from '../audio/voices.js';
import {fadeTo,show} from '../ui/screens.js';
import {P,newField,sched} from './state.js';
import {layout} from '../render/layout.js';
import {buildSprites} from '../render/sprites.js';
import {BL} from '../render/blood.js';
import {updateHUD} from '../ui/hud.js';
import {closeOverlays} from '../ui/panels.js';

/* ================= start / layout ================= */
export async function startGame(dkey,quick,field){
  field=field||1;
  await fadeTo(1,quick?400:600);
  closeOverlays();stopAllVoices();unmuffle();newField(dkey,field);initChatter(ST.G.theme.bg);if(field===1||!VM.shared)VM.shared=shuffle([...SHARED]);
  BL.s.length=0;BL.ind.length=0;BL.on=false;
  $('#feed').innerHTML='';$('#subs').innerHTML='';$('#game').className='screen'+(ST.G.theme.bg==='club'?' clubfield':ST.G.theme.bg==='pathos'?' pathosfield':'');$('#letterbox').classList.remove('on');$('#radio').hidden=true;$('#radio').classList.remove('on');$('#tip').hidden=true;$('#autosave').hidden=true;$('#respects').hidden=true;$('#blood').style.opacity=0;
  $('#fx-grain').classList.toggle('off',!settings.grain);P.length=0;
  $('#mm-lab').textContent=ST.G.theme.name.toUpperCase();$('#q-title').textContent=ST.G.theme.op;
  if(ST.G.theme.bg==='club'){ST.G.clubDone=true;ST.G.side.push('club');ST.G.tracked='club';}
  show('game');layout();updateHUD();musicStart(fieldMusic());if(document.fonts&&document.fonts.load)document.fonts.load('600 40px Teko').then(()=>{if(ST.G)buildSprites();},()=>{});
  predecode([ST.G.theme.vo,ST.G.theme.start,...CHAT[ST.G.theme.bg].open,...ST.G.theme.win]).then(()=>{if(ST.G&&!VM.queued){VM.queued=nextChatter();decodeOne(VM.queued);}});
  await fadeTo(0,900);
  const loop=Math.floor((field-1)/FIELDS.length),ch=$('#chapter');ch.querySelector('.ch-k').textContent=ST.G.theme.ch+(loop?` · NEW GAME${'+'.repeat(loop)}`:'');ch.querySelector('.ch-t').textContent=ST.G.theme.name.toUpperCase();ch.querySelector('.ch-s').textContent=`${ST.G.theme.time} · ${DIFFS[dkey].label.toUpperCase()} · ${ST.G.theme.op.toUpperCase()}`;ch.classList.add('on');setTimeout(()=>ch.classList.remove('on'),3600);
  sched(.4,()=>say(ST.G.theme.vo));sched(3.3,()=>bark(ST.G.theme.start,'start',0,{}));
}
export function fieldMusic(){return ST.G?ST.G.theme.mus:'game';}
