// scenes/concept-art.js — Procedurally drawn concept-art sheets shown during the credits.
import {ST} from '../core/shared.js';
import {CHAR} from '../data/dialogue.js';
import {$,esc,rand} from '../core/util.js';
import {drawPortrait} from '../ui/radio.js';
import {numSprite,openClub,openIce,openLawn,openSand,openSub,openTile,plate,plateClub,plateIce,plateLawn,plateSand,plateSub} from '../render/sprites.js';
import {DRAW,SC,ensureScenery} from '../render/scenery.js';

/* concept art */
function mkc(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*ST.dpr));c.height=Math.max(1,Math.round(h*ST.dpr));const g=c.getContext('2d');g.setTransform(ST.dpr,0,0,ST.dpr,0,0);return[c,g];}
function paper(g,w,h){g.fillStyle='#ece3cf';g.fillRect(0,0,w,h);for(let k=0;k<w*h/90;k++){g.fillStyle=Math.random()<.5?'rgba(120,100,70,.06)':'rgba(255,255,255,.12)';g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}
  const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(90,70,40,.22)');g.fillStyle=v;g.fillRect(0,0,w,h);}
function hand(g,txt,x,y,sz,col,rot){g.save();g.translate(x,y);g.rotate(rot||0);g.font=`700 ${Math.round(sz)}px Caveat,"Comic Sans MS",cursive`;g.fillStyle=col;g.textAlign='left';g.fillText(txt,0,0);g.restore();}
function arrowTo(g,x1,y1,x2,y2,col){g.strokeStyle=col;g.lineWidth=2;g.lineCap='round';const mx=(x1+x2)/2+(y2-y1)*.25,my=(y1+y2)/2-(x2-x1)*.25;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx,my,x2,y2);g.stroke();const a=Math.atan2(y2-my,x2-mx);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-Math.cos(a-.5)*10,y2-Math.sin(a-.5)*10);g.moveTo(x2,y2);g.lineTo(x2-Math.cos(a+.5)*10,y2-Math.sin(a+.5)*10);g.stroke();}
function tape(g,x,y,rot){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle='rgba(235,225,190,.78)';g.fillRect(-34,-10,68,20);g.restore();}
function sheetHead(g,w,h,title,sub){g.fillStyle='#2b2620';g.font=`700 ${Math.round(h*.045)}px "Chakra Petch",sans-serif`;g.textAlign='left';g.fillText(title,w*.05,h*.1);g.font=`500 ${Math.round(h*.026)}px "Chakra Petch",sans-serif`;g.fillStyle='#6d6250';g.fillText(sub,w*.05,h*.15);g.textAlign='right';g.fillText('TRIPLE A SWEEPER · CONCEPT · CONFIDENTIAL',w*.95,h*.95);g.textAlign='left';}
const INK_R='#b8322a',INK_B='#2a4d9b';
function sceneArt(theme,title,file,notes){return(w,h)=>{const[c,g]=mkc(w,h);paper(g,w,h);
  const m=Math.round(Math.min(w,h)*.06),iw=w-2*m,ih=h-2*m-Math.round(h*.06);
  const save={key:SC.key,w:SC.w,h:SC.h,st:SC.st,parts:SC.parts,x:SC.x};SC.key='';ensureScenery(theme,iw,ih);const[sc,sg]=mkc(iw,ih);DRAW[theme](sg,iw,ih,7.3,.016);Object.assign(SC,save);
  g.drawImage(sc,m,m,iw,ih);g.globalCompositeOperation='saturation';g.fillStyle='rgba(128,128,128,.4)';g.fillRect(m,m,iw,ih);g.globalCompositeOperation='color';g.fillStyle='rgba(150,115,70,.14)';g.fillRect(m,m,iw,ih);g.globalCompositeOperation='source-over';
  for(let k=0;k<650;k++){const x=m+Math.random()*iw,y=m+Math.random()*ih,l=rand(6,22),a=-.5+rand(-.2,.2);g.strokeStyle=Math.random()<.5?'rgba(255,250,235,.06)':'rgba(30,20,10,.06)';g.lineWidth=rand(1.5,5);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  g.strokeStyle='rgba(50,40,30,.55)';g.lineWidth=1;g.strokeRect(m+.5,m+.5,iw,ih);g.strokeRect(m-2.5,m-1.5,iw+4,ih+3);tape(g,m+24,m,-.2);tape(g,w-m-24,m,.18);
  const fs=Math.max(12,Math.min(w,h)*.05);notes.forEach((n,i)=>{const nx=m+iw*n[0],ny=m+ih*n[1],col=i%2?INK_B:INK_R;g.save();g.fillStyle='rgba(236,227,207,.7)';g.font=`700 ${Math.round(fs)}px Caveat,cursive`;const tw=g.measureText(n[2]).width;g.fillRect(nx-6,ny-fs*.85,tw+12,fs*1.15);g.restore();hand(g,n[2],nx,ny,fs,col,rand(-.05,.05));if(n[3])arrowTo(g,nx+fs*.6,ny+fs*.35,m+iw*n[3][0],m+ih*n[3][1],col);});
  g.font=`600 ${Math.round(h*.028)}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.textAlign='left';g.fillText(title,m,h-m*.55);g.textAlign='right';g.fillStyle='#7a6d58';g.fillText(file,w-m,h-m*.55);g.textAlign='left';return c;};}
function castSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'CAST · CHARACTER SHEET','Radio portraits, final pass');
  const who=[['reyes','gruff but fair'],['kova','sorry (not sorry)'],['dez','LOUDER'],['qm','sells flags'],['mom','always calling'],['jenkins','helmet 2 sizes too big'],['dj','never slows down'],['prof','studies ice']];
  const cols=4,gx=w*.05,gy=h*.21,cw=(w*.9)/cols,ch=(h*.68)/2,ps=Math.min(cw*.6,ch*.58);const pc=document.createElement('canvas');pc.width=pc.height=168;
  who.forEach(([k,nt],i)=>{const x=gx+(i%cols)*cw+cw/2,y=gy+Math.floor(i/cols)*ch;drawPortrait(k,pc);g.save();g.translate(x,y+ps/2);g.rotate(rand(-.05,.05));g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.25)';g.shadowBlur=8;g.fillRect(-ps/2-6,-ps/2-6,ps+12,ps+12);g.shadowBlur=0;g.drawImage(pc,-ps/2,-ps/2,ps,ps);g.restore();
    g.font=`600 ${Math.round(Math.max(10,ch*.07))}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.textAlign='center';g.fillText(CHAR[k].name.toUpperCase(),x,y+ps+ch*.12);g.textAlign='left';hand(g,nt,x-ps*.5,y+ps+ch*.24,Math.max(11,ch*.1),i%2?INK_B:INK_R,-.03);});return c;}
function mineSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'THE MINE · ITERATIONS','Exploration, weeks 1–14');
  const nt=['too friendly','too round','meh','spiky enough?','more spikes','scarier','hedgehog?','same as v3?','APPROVED'];
  for(let i=0;i<9;i++){const x=w*(.2+.3*(i%3)),y=h*(.32+.22*Math.floor(i/3)),r=Math.min(w,h)*.04*(1+(i%3)*.1),n=4+i;
    g.strokeStyle='#15181b';g.lineWidth=Math.max(2,r*.28);g.lineCap='round';for(let k=0;k<n;k++){const a=k*2*Math.PI/n;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r*1.6,y+Math.sin(a)*r*1.6);g.stroke();}
    g.fillStyle='#1b1f23';g.beginPath();g.arc(x,y,r*(i===1?1.3:1),0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(x-r*.38,y-r*.38,r*.2,0,6.283);g.fill();
    if(i===0){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(x,y+r*.05,r*.45,.25,Math.PI-.25);g.stroke();g.fillStyle='#fff';g.fillRect(x-r*.35,y-r*.3,3,3);g.fillRect(x+r*.25,y-r*.3,3,3);}
    hand(g,`v${i+1} · ${nt[i]}`,x-r*1.9,y+r*2.5,Math.max(11,Math.min(w*.024,h*.042)),i===8?INK_R:'#5a5040',0);
    if(i===8){g.strokeStyle=INK_R;g.lineWidth=3;g.beginPath();g.ellipse(x,y,r*2.5,r*2.2,.1,0,6.283);g.stroke();}
    if(i<2){g.strokeStyle=INK_R;g.lineWidth=2.5;g.beginPath();g.moveTo(x-r*2,y-r*2);g.lineTo(x+r*2,y+r*2);g.stroke();}}return c;}
function markerSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'QUEST MARKER · READABILITY STUDY','Playtest feedback: "I still could not find it"');
  const lab=['v1 subtle','v2','v3 visible','v4 very visible','v5 shouting','v6 MAXIMUM'],sz=[.012,.02,.032,.05,.075,.11];
  for(let i=0;i<6;i++){const x=w*(.1+.16*i),by=h*.72,d=Math.min(w,h)*sz[i]*2.2;g.fillStyle='#b7a98d';g.fillRect(x-w*.05,by,w*.1,h*.06);g.strokeStyle='rgba(60,50,40,.4)';g.strokeRect(x-w*.05+.5,by+.5,w*.1,h*.06);
    if(i===5){const gr=g.createLinearGradient(0,by,0,h*.17);gr.addColorStop(0,'rgba(255,190,60,.6)');gr.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=gr;g.fillRect(x-d*.35,h*.17,d*.7,by-h*.17);}
    const y=by-d*1.1-h*.03;g.fillStyle='#f2b43a';g.strokeStyle='#5a3b00';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-d);g.lineTo(x+d*.72,y);g.lineTo(x,y+d);g.lineTo(x-d*.72,y);g.closePath();g.fill();g.stroke();
    hand(g,lab[i],x-w*.055,h*.85,Math.max(10,Math.min(w*.02,h*.034)),i===5?INK_R:'#5a5040',0);if(i<5){g.strokeStyle=INK_R;g.lineWidth=2;g.beginPath();g.moveTo(x-w*.045,h*.87);g.lineTo(x+w*.045,h*.83);g.stroke();}}
  hand(g,'shipped ✓',w*.84,h*.93,Math.max(16,h*.042),INK_R,-.05);return c;}
function tileSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'TILES · MATERIAL STUDY','Six materials, one hitbox');
  const s=Math.round(Math.min(w*.1,h*.15)),S=Math.max(8,Math.round(s*ST.dpr));const num=numSprite(S,3);
  const sets=[[plate(S,false),openTile(S),'Steel','approved'],[plateSand(S,false),openSand(S),'Sandstone','more sand'],[plateClub(S,false),openClub(S),'Dance floor','BRIGHTER??'],[plateIce(S,false),openIce(S),'Ice','too slippery'],[plateSub(S,false),openSub(S),'Bulkhead','leaks (on purpose)'],[plateLawn(S,false,false),openLawn(S),'Lawn','Dad approved']];
  sets.forEach((st,i)=>{const x=w*(.06+.31*(i%3)),y=h*(.21+.37*Math.floor(i/3));g.drawImage(st[0],x,y,s,s);g.drawImage(st[1],x+s+6,y,s,s);g.drawImage(num,x+s+6,y,s,s);
    if(i===2){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,80,220,.4)';g.fillRect(x+s*.14,y+s*.14,s*.72,s*.72);g.globalCompositeOperation='source-over';}
    g.font=`600 ${Math.round(Math.max(9,h*.03))}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.fillText(st[2].toUpperCase(),x,y+s+h*.055);hand(g,st[3],x,y+s+h*.115,Math.max(11,Math.min(w*.022,h*.04)),i%2?INK_B:INK_R,-.04);});return c;}
export const ART=[
  {make:sceneArt('battle','SECTOR B-4 · KEY ART','sectorB4_keyart_v3_FINAL.png',[[.05,.12,'more fog?'],[.55,.2,'sun too nice',[.83,.57]],[.06,.5,'tower = iconic',[.16,.38]]]),cap:'Sector B-4, key art'},
  {make:castSheet,cap:'Cast, character sheet'},
  {make:sceneArt('desert','THE DUNE SEA · EXPLORATION','dunesea_explore_v7.png',[[.05,.12,'is this too much sand'],[.55,.07,'vultures stay',[.24,.22]],[.08,.88,'camels (cut for budget)']]),cap:'The Dune Sea, early exploration'},
  {make:mineSheet,cap:'The mine, iterations'},
  {make:sceneArt('club','DA CLUB · LIGHTING PASS','daclub_lighting_v12_dezapproved.png',[[.3,.16,'MORE LASERS'],[.55,.42,'Dez wants bigger sign',[.12,.45]],[.34,.9,'bouncer cut for budget']]),cap:'Da Club, lighting pass'},
  {make:markerSheet,cap:'Quest marker, readability study'},
  {make:sceneArt('arctic','STATION NORD-7 · MOOD','nord7_mood_v2.png',[[.05,.1,'aurora = free bloom'],[.5,.5,'polar bear (DLC)',[.8,.66]]]),cap:'Station Nord-7, mood'},
  {make:tileSheet,cap:'Tiles, material study'},
  {make:sceneArt('pathos','PATHOS-4 · FLOOD STUDY','pathos4_flood_v4_wet.png',[[.05,.24,'wetter'],[.5,.08,'fish = free content',[.9,.42]],[.08,.93,'water level: rising (good)']]),cap:'Pathos-4, flood study'},
  {make:sceneArt('home',"MOM'S BACKYARD · FINAL",'momsyard_final_FINAL_final2.png',[[.18,.68,'gnome is canon',[.3,.84]],[.45,.1,'tulips: do NOT step'],[.55,.36,'TV always on',[.73,.52]]]),cap:"Mom's Backyard, final"},
];
let artFlip=0;
export function showArt(i){const fr=$('#cr-frame'),w=fr.clientWidth,h=fr.clientHeight;if(!w||!h)return;const cv2=[$('#cr-a'),$('#cr-b')],nx=cv2[artFlip^1],cu=cv2[artFlip];artFlip^=1;let src;try{src=ART[i].make(w,h);}catch(e){console.error(e);return;}
  nx.width=src.width;nx.height=src.height;nx.getContext('2d').drawImage(src,0,0);nx.classList.remove('on');void nx.offsetWidth;nx.classList.add('on');cu.classList.remove('on');
  $('#cr-cap').innerHTML=`<b>CONCEPT ART</b> · ${esc(ART[i].cap)} · <span>Claude</span>`;}
