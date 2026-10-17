// game/state.js — Shared game state: the field object (ST.G), board geometry, camera, sprite cache, particle list, canvas. newField().
import {ST} from '../core/shared.js';
import {DIFFS} from '../data/content.js';
import {FI} from '../data/fields.js';
import {$} from '../core/util.js';

/* ================= game state ================= */
ST.LK='wide';ST.O2K='';ST.G=null;ST.T=32;ST.BX=0;ST.BY=0;ST.BW=0;ST.BH=0;ST.W=innerWidth;ST.H=innerHeight;ST.dpr=Math.min(2,devicePixelRatio||1);ST.flagMode=false;ST.kbdOn=false;
export const CAM={x:0,y:0},SPR={},P=[];
export const cv=$('#cv'),ctx=cv.getContext('2d');
export function newField(dkey,field){field=field||1;const d=DIFFS[dkey],n=d.cols*d.rows;
  ST.G={dkey,field,theme:FI(field),tileset:FI(field).ts,floodStart:3,floodTotal:{story:90,normal:210,veteran:420}[dkey]||210,floodP:0,flooded:false,breath:100,bLog:2,nextKlax:4,lastTick:-1,nextBub:0,nextNag:70,chal:false,cols:d.cols,rows:d.rows,mines:d.mines,n,mine:new Uint8Array(n),cnt:new Uint8Array(n),st:new Uint8Array(n),revAt:new Float64Array(n),ever:new Uint8Array(n),lore:new Set(),loreFound:0,
    started:false,over:false,won:false,dead:false,paused:false,opened:0,flags:0,booms:0,hp:100,hpTrail:100,lastHit:-99,flash:0,target:Math.floor(d.rows/2)*d.cols+Math.floor(d.cols/2),lastClick:-1,
    follows:0,rebels:0,respects:0,trans:0,deaths:0,elapsed:0,clock:0,hover:-1,pressed:-1,kbd:-1,mx:-1,my:-1,inCv:false,shake:0,revealQ:[],crate:null,nextCrate:40,nextSave:24,nextTip:5,tipsShown:0,
    club:0,clubDone:false,lastAction:0,idle:0,half:false,lowWarned:false,nextHeart:0,xpEarned:0,side:[],tracked:null,sched:[],momBoom:false,respectsUntil:0,nextSmoke:0,coinsEarned:0};}
export const idx=(c,r)=>r*ST.G.cols+c;
export function forN(i,f){const c=i%ST.G.cols,r=(i/ST.G.cols)|0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const cc=c+dc,rr=r+dr;if(cc>=0&&rr>=0&&cc<ST.G.cols&&rr<ST.G.rows)f(rr*ST.G.cols+cc);}}
function colName(c){let s='';c++;while(c>0){const m=(c-1)%26;s=String.fromCharCode(65+m)+s;c=Math.floor((c-1)/26);}return s;}
export const label=i=>colName(i%ST.G.cols)+((i/ST.G.cols|0)+1);
export function tileCenter(i){return{x:ST.BX+((i%ST.G.cols)+.5)*ST.T+CAM.x,y:ST.BY+(((i/ST.G.cols)|0)+.5)*ST.T+CAM.y};}
export function sched(sec,fn){if(ST.G)ST.G.sched.push({at:ST.G.clock+sec,fn});}
