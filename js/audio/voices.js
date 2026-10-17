// audio/voices.js — Voice manager: radio chain, chatter scheduling (arcs, weights, queueing), barks with cooldowns, subtitles hook.
import {ST} from '../core/shared.js';
import {VOICES} from '../data/voice-manifest.js';
import {CHAR,CHAT,QUEST_ON_LINE,REPEATS,lineText,whoOf} from '../data/dialogue.js';
import {$,esc,now,rand,shuffle} from '../core/util.js';
import {settings} from '../core/storage.js';
import {A,nz,osc} from './engine.js';
import {decodeOne,touchBuf} from './voice-bank.js';
import {hideRadioSoon,showRadio} from '../ui/radio.js';
import {cur} from '../ui/screens.js';
import {notify,unlock} from '../ui/notify.js';
import {sched} from '../game/state.js';
import {addSide} from '../game/rules.js';
import {startClub} from '../game/events.js';

function squelch(t,open){nz(t,open?.12:.16,.18,A.voice,{type:'bandpass',f:open?1900:1500,q:.7,a:.004,rel:.03});if(open)osc('sine',1350,t+.1,.05,.06,A.voice,{rel:.01});else osc('sine',900,t+.12,.04,.05,A.voice,{rel:.01});}
function hiss(t,dur){nz(t,dur,.012,A.voice,{type:'highpass',f:2500,a:.05,rel:.05});}
/* ================= voices / radio ================= */
export const VM={active:[],next:9,opening:[],arcs:{},last:null,cds:{},rep:[],queued:null,shared:null,fav:[],wait:[]};
const calmVO=()=>settings.chatter==='normal'||settings.chatter==='off';
export const radioActive=()=>VM.active.filter(v=>v.radio);
export function initChatter(theme){const C=CHAT[theme]||CHAT.battle;VM.arcs={};for(const k in C.arcs)VM.arcs[k]=(C.shuf||[]).includes(k)?[C.arcs[k][0],...shuffle(C.arcs[k].slice(1))]:[...C.arcs[k]];VM.favW=C.favW||2.2;VM.opening=[...C.open];VM.fav=C.fav||[];VM.last=null;VM.rep=[];VM.cds={};VM.next=9;VM.queued=null;VM.wait=[];}
export function chatterGap(){const m={off:[1e9,1e9],normal:[11,19],constant:[3.5,7],unbearable:[.5,1.6]}[settings.chatter]||[11,19];return rand(m[0],m[1]);}
export function nextChatter(){
  if(VM.opening.length){const id=VM.opening.shift();const who=whoOf(id);const arc=VM.arcs[who];if(arc&&arc[0]===id)arc.shift();VM.last=who;return id;}
  let keys=Object.keys(VM.arcs).filter(k=>VM.arcs[k].length);
  if(keys.length>1)keys=keys.filter(k=>k!==VM.last);
  if(keys.length){const w=keys.map(k=>VM.fav.includes(k)?VM.favW:k==='whisper'?.6:1);let r=Math.random()*w.reduce((a,b)=>a+b,0),k=keys[0];for(let i=0;i<keys.length;i++){r-=w[i];if(r<=0){k=keys[i];break;}}VM.last=k;return VM.arcs[k].shift();}
  if(VM.shared&&VM.shared.length){const id=VM.shared.shift();VM.last=whoOf(id);return id;}
  if(!VM.rep.length)VM.rep=shuffle([...REPEATS]);
  return VM.rep.shift();
}
export function say(id,o={}){
  if(!A.ctx||!VOICES[id])return false;
  const who=whoOf(id),ch=CHAR[who],buf=A.buffers[id];
  if(calmVO()&&VM.active.length&&who!=='announcer'){if(o.chatter)return false;VM.wait.push({id,o,t:now()});return true;}
  if(!buf){decodeOne(id).then(b=>{if(b)say(id,{...o,chatter:false});});return true;}
  const c=A.ctx,tn=c.currentTime;touchBuf(id);
  if(ch.radio){const ra=radioActive();if(o.chatter&&ra.length)return false;if(ra.length>=2)stopVoice(ra[0]);for(const v of radioActive())v.g.gain.setTargetAtTime(.32,tn,.06);}
  const lead=ch.radio?.17:.02,t0=tn+lead,dur=buf.duration;
  const src=c.createBufferSource();src.buffer=buf;const g=c.createGain();g.gain.value=ch.radio?1.1:.95;
  if(ch.radio){const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=ch.phone?450:300;const pk=c.createBiquadFilter();pk.type='peaking';pk.frequency.value=1700;pk.Q.value=.9;pk.gain.value=6;
    const pre=c.createGain();pre.gain.value=1.7;const ws=c.createWaveShaper();ws.curve=A.radioCurve;ws.oversample='2x';const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=ch.phone?3400:3100;
    src.connect(hp);hp.connect(pk);pk.connect(pre);pre.connect(ws);ws.connect(lp);lp.connect(g);
    if(ch.eerie||ch.pa){const dl=c.createDelay(1);dl.delayTime.value=ch.pa?.13:.24;const fb=c.createGain();fb.gain.value=ch.pa?.3:.4;lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(g);}
    squelch(tn,true);squelch(t0+dur-.05,false);hiss(t0,dur);A.duck.gain.setTargetAtTime(.36,tn,.12);
  }else src.connect(g);
  g.connect(A.voice);src.start(t0);
  const v={id,who,radio:ch.radio,src,g,done:false,el:null};
  if(settings.subs&&!ch.nosub&&cur==='game')v.el=addSub(who,id);
  VM.active.push(v);src.onended=()=>finishVoice(v);
  if(ch.radio){showRadio(who);if(ST.G){ST.G.trans++;if(ST.G.trans>=10)unlock('listener');}}
  return true;
}
function finishVoice(v){
  if(v.done)return;v.done=true;VM.active=VM.active.filter(x=>x!==v);
  if(v.el){v.el.classList.add('out');const el=v.el;setTimeout(()=>el.remove(),400);}
  if(v.radio){const ra=radioActive();if(!ra.length){if(A.ctx)A.duck.gain.setTargetAtTime(1,A.ctx.currentTime+.2,.4);hideRadioSoon();if(ST.G)VM.next=ST.G.clock+chatterGap();}else{ra.forEach(x=>x.g.gain.setTargetAtTime(1.1,A.ctx.currentTime,.1));showRadio(ra[ra.length-1].who);}}
  if(ST.G&&cur==='game')onLineEnd(v.id);
  if(!VM.active.length&&VM.wait.length){const n=now();VM.wait=VM.wait.filter(x=>n-x.t<6);const nx=VM.wait.shift();if(nx)setTimeout(()=>{if(!VM.active.length)say(nx.id,nx.o);else VM.wait.unshift(nx);},450);}
}
function stopVoice(v){try{v.src.onended=null;v.src.stop();}catch{}finishVoice(v);}
export function stopAllVoices(){VM.wait=[];[...VM.active].forEach(stopVoice);VM.wait=[];}
export function bark(id,cd,sec,o={}){if(!ST.G)return say(id,o);if(cd&&(VM.cds[cd]??-1e9)>ST.G.clock)return false;const ok=say(id,o);if(ok&&cd)VM.cds[cd]=ST.G.clock+sec;return ok;}
function onLineEnd(id){if(ST.G.over)return;const q=QUEST_ON_LINE[id];if(q)addSide(q);if(id==='d_5'&&ST.G.theme.bg!=='club')startClub();if(whoOf(id)==='qm'&&Math.random()<.5){setTimeout(()=>notify('LIMITED TIME OFFER','Premium flag skins are in the store. Press B.','info','%'),600);sched(1.3,()=>bark('s_store','sstore',60));}}
function addSub(who,id){const ch=CHAR[who],box=$('#subs');const p=document.createElement('p');p.className='sub'+(who==='sys'?' sys':'');
  p.innerHTML=who==='sys'?`<span class="sub-sys">[SYSTEM]</span> ${esc(lineText(id))}`:`<b style="color:${ch.color}">${esc(ch.name)}:</b> ${esc(lineText(id))}`;box.appendChild(p);while(box.children.length>3)box.firstChild.remove();return p;}
