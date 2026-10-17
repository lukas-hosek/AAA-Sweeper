// ui/notify.js — Toasts, achievements, centre banners, kill-feed lines, floating +XP pops, combo text.
import {ST} from '../core/shared.js';
import {ACH} from '../data/content.js';
import {$,esc} from '../core/util.js';
import {PROFILE,saveProfile} from '../core/storage.js';
import {S} from '../audio/sfx.js';
import {bark} from '../audio/voices.js';

/* ================= notifications ================= */
const toastQ=[];
let toastBusy=false;
export function notify(kick,name,cls='info',icon='i',gs=''){toastQ.push({kick,name,cls,icon,gs});pumpToasts();}
function pumpToasts(){if(toastBusy||!toastQ.length)return;toastBusy=true;const t=toastQ.shift();const el=document.createElement('div');el.className='toast '+t.cls;
  el.innerHTML=`<div class="ti-ic">${esc(t.icon)}</div><div class="tx"><span class="tk">${esc(t.kick)}</span><span class="tn">${esc(t.name.split('|')[0])}</span>${t.name.includes('|')?`<span class="td">${esc(t.name.split('|')[1])}</span>`:''}</div>${t.gs?`<span class="gs">${esc(t.gs)}</span>`:''}`;
  $('#toasts').appendChild(el);setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();toastBusy=false;pumpToasts();},400);},3200);}
export function unlock(k){if(PROFILE.ach[k]||!ACH[k])return;PROFILE.ach[k]=1;PROFILE.gs+=ACH[k][2];saveProfile();const a=ACH[k];notify('ACHIEVEMENT UNLOCKED',`${a[0]}|${a[1]}`,'ach','✦',`+${a[2]} G`);S.ach();if(ST.G)setTimeout(()=>bark('s_ach','sach',22),450);}
const bannerQ=[];
let bannerBusy=false;
export function banner(kick,title,sub,color){bannerQ.push({kick,title,sub,color});pumpBanner();}
function pumpBanner(){if(bannerBusy||!bannerQ.length)return;bannerBusy=true;const b=bannerQ.shift(),el=$('#banner');el.style.setProperty('--bc',b.color||'#f2c14e');el.querySelector('.bn-k').textContent=b.kick;el.querySelector('.bn-t').textContent=b.title;el.querySelector('.bn-s').textContent=b.sub||'';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');setTimeout(()=>{el.classList.remove('on');bannerBusy=false;pumpBanner();},2850);}
export function addFeed(html,cls=''){const f=$('#feed');const d=document.createElement('div');d.className='fd '+cls;d.innerHTML=html;f.appendChild(d);while(f.children.length>6)f.firstChild.remove();setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),700);},5200);}
export function popAt(x,y,txt,cls=''){const p=document.createElement('div');p.className='pop '+cls;p.textContent=txt;p.style.left=x+'px';p.style.top=y+'px';$('#hud').appendChild(p);p.addEventListener('animationend',()=>p.remove());}
export function combo(name,n){const c=$('#combo');c.innerHTML=`${esc(name)}<small>${n} TILES</small>`;c.classList.remove('on');void c.offsetWidth;c.classList.add('on');}
