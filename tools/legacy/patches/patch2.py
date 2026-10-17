import sys
P = '/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/template.html'
s = open(P).read()

def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        print('ANCHOR FAIL', n, repr(a[:120])); sys.exit(1)
    s = s.replace(a, b)

def between(start, end, new):
    """replace s[start : index(end)] with new (end marker kept)"""
    global s
    i = s.find(start); j = s.find(end, i + 1)
    if i < 0 or j < 0 or s.count(start) != 1:
        print('BETWEEN FAIL', i, j, repr(start[:80])); sys.exit(1)
    s = s[:i] + new + s[j:]

# ---------------- CSS
rep("#game.club #fx-vig{background:radial-gradient(ellipse at 50% 46%,transparent 40%,rgba(70,0,110,.65) 100%)}",
    "#game.club #fx-vig,#game.clubfield #fx-vig{background:radial-gradient(ellipse at 50% 46%,transparent 40%,rgba(70,0,110,.65) 100%)}\n#blood{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;display:block}")

# ---------------- HTML
rep('<div id="fx-vig"></div><div id="fx-dmg"></div><div id="fx-grain"></div>',
    '<div id="fx-vig"></div><canvas id="blood"></canvas><div id="fx-dmg"></div><div id="fx-grain"></div>')
rep('<div class="q-title">Operation: Clean Sweep</div>', '<div class="q-title" id="q-title">Operation: Clean Sweep</div>')
rep('<span class="mm-lab">SECTOR B-4</span>', '<span class="mm-lab" id="mm-lab">SECTOR B-4</span>')
rep('<button data-d="back">BACK</button>\n    </nav>', '<button data-d="back">BACK</button>\n    </nav>\n    <nav id="chapmenu" class="menu" hidden></nav>')
rep("BIG DEZ'S CLUB NOW OPEN 24/7", "CHAPTER THREE: DA CLUB · BIG DEZ SAYS COME THROUGH &nbsp;✦&nbsp; NEW: MOM'S BACKYARD (FREE, LIKE MOM'S LOVE)")

# ---------------- data
rep("  sys:{name:'SYSTEM',tag:'',color:'#8fd3ff',radio:false},",
    "  dj:{name:'DJ Detonator',tag:'PA SYSTEM · DA CLUB',chan:69,color:'#ff5cf0',radio:true,pa:true},\n  prof:{name:'Prof. Lindqvist',tag:'STATION NORD-7',chan:9,color:'#9ff3ff',radio:true},\n  sys:{name:'SYSTEM',tag:'',color:'#8fd3ff',radio:false},")
rep("const PREFIX={r:'reyes',k:'kova',d:'dez',q:'qm',m:'mom',j:'jenkins',w:'whisper',s:'sys',a:'announcer'};",
    "const PREFIX={r:'reyes',k:'kova',d:'dez',q:'qm',m:'mom',j:'jenkins',w:'whisper',s:'sys',a:'announcer'};\nconst whoOf=id=>(VOICES[id]&&VOICES[id].w)||PREFIX[id[0]];\nconst lineText=id=>SUBS[id]||(VOICES[id]&&VOICES[id].t)||'';")
rep("obj:()=>G&&G.clubDone?'The club came to you':'Get in da club · 2,400 km'",
    "obj:()=>G&&G.theme.bg==='club'?'You are in da club':G&&G.clubDone?'The club came to you':'Get in da club · 2,400 km'")
rep("obj:()=>'Call Mom back',brg:312", "obj:()=>G&&G.theme.bg==='home'?'Visit in person instead':'Call Mom back',brg:312")
rep("obj:()=>'Find the source of the voice · ???',brg:0,dist:'???',act:'TRACK'},\n};",
    "obj:()=>'Find the source of the voice · ???',brg:0,dist:'???',act:'TRACK'},\n"
    "  prof:{name:'Ice Core Samples',giver:'Prof. Lindqvist',who:'prof',desc:'The professor needs ice core samples. She also needs you to not explode near the ice core samples.',obj:()=>'Collect ice core samples (0/12) · Not implemented',brg:200,dist:'1.1 km',act:'TRACK'},\n"
    "  dinner:{name:'Dinner Is Ready',giver:'Mom',who:'mom',desc:'Mom made your favourite. It will be ready when the lawn is clear.',obj:()=>G&&G.won?'Go inside':'Clear the lawn before dinner gets cold',brg:15,dist:'12 m',act:'TRACK'},\n};")
rep("const QUEST_ON_LINE={k_1:'kova',d_1:'club',m_1:'mom',q_1:'qm',w_1:'whisper'};",
    "const QUEST_ON_LINE={k_1:'kova',d_1:'club',m_1:'mom',q_1:'qm',w_1:'whisper',kd_1:'kova',dd_1:'club',md_1:'mom',qd_1:'qm',wd_1:'whisper',kc_1:'kova',mc_1:'mom',qc_1:'qm',wc_1:'whisper',pa_1:'prof',ka_1:'kova',ma_1:'mom',qa_1:'qm',da_1:'club',wa_1:'whisper',mh_1:'dinner',kh_1:'kova',qh_1:'qm',wh_1:'whisper',dh_1:'club'};")
rep("win:['Clean Sweep','Clear the field.',50],",
    "win:['Clean Sweep','Clear the field.',50], ch2:['Sand Between Your Toes','Clear the Dune Sea.',25], ch3:['VIP','Clear Da Club.',25], ch4:['Cold Feet','Clear Station Nord-7.',25], ch5:['Home Sweet Mine',\"Clear Mom's Backyard.\",50], timesaver:['Time Is Money','Buy the Time Saver Pack.',5],")
rep("  'Lore fragments are hidden under safe tiles. There are 400 of them. There are 5 of them in this field.',",
    "  'Lore fragments are hidden under safe tiles. There are 400 of them. There are 5 of them in this field.',\n  'Each chapter has its own tiles, its own music, and its own people who will not stop calling you.',\n  'Blood on the screen means you are hurt. Wait for it to fade. Do not wipe your monitor.',\n  'Health does not regenerate faster at home. Mom says it does.',")
rep("  \"Graffiti on a crate: 'THE MARKER KNOWS.'\",",
    "  \"Graffiti on a crate: 'THE MARKER KNOWS.'\",\n  \"Postcard from the Dune Sea: 'The camels say hi. The mines do not.'\",\n  \"VIP wristband, slightly singed. Printed on the back: 'NO MINES ON THE DANCE FLOOR (AGAIN)'.\",\n  \"Field note, Station Nord-7: 'Day 41. The mines have started to hum. I hum back.'\",\n  \"Recipe card in Mom's handwriting: 'Casserole. Serves 4, or 1 sweeper.'\",")
rep("const NUMCOL=['','#55a8ff','#3fe08b','#ff4f60','#a08bff','#ff9b3d','#2fe6d6','#f4f4f4','#a2a9ae'];",
r"""const NUMCOL=['','#55a8ff','#3fe08b','#ff4f60','#a08bff','#ff9b3d','#2fe6d6','#f4f4f4','#a2a9ae'];
const FIELDS=[
  {bg:'battle',name:'Sector B-4',ch:'CHAPTER ONE',op:'Operation: Clean Sweep',time:'06:42 LOCAL',vo:'a_ch1',start:'r_start',win:['r_win','d_win'],giver:'CMDR. REYES',desc:'Command has ordered you to clear Sector B-4 before the season ends. The season ends in 3 days, 14 hours. A glowing marker will tell you where to click, so you never have to think.'},
  {bg:'desert',name:'The Dune Sea',ch:'CHAPTER TWO',op:'Operation: Desert Sweep',time:'12:14 LOCAL · 44 °C',vo:'a_ch2',start:'rd_start',win:['rd_win','r_win2'],giver:'CMDR. REYES',desc:'Someone has mined the Dune Sea. Possibly Dr. Kova. Clear it before the sandstorm, or during the sandstorm. Command is flexible.'},
  {bg:'club',name:'Da Club',ch:'CHAPTER THREE',op:'Operation: Get In Da Club',time:'01:30 LOCAL · 124 BPM',vo:'a_ch3',start:'dc_start',win:['dc_win','dj_4'],giver:'BIG DEZ',desc:'You are finally in da club. The dance floor is mined. Big Dez would like it cleared before the drop.'},
  {bg:'arctic',name:'Station Nord-7',ch:'CHAPTER FOUR',op:'Operation: Cold Sweep',time:'22:05 LOCAL · −40 °C',vo:'a_ch4',start:'ra_start',win:['ra_win','r_win2'],giver:'PROF. LINDQVIST',desc:'A research station in the Arctic has found mines under the ice. The professor would like them removed so she can get back to studying ice.'},
  {bg:'home',name:"Mom's Backyard",ch:'CHAPTER FIVE',op:'Operation: Come Home',time:'18:30 LOCAL · DINNER SOON',vo:'a_ch5',start:'mh_start',win:['mh_win','wh_2'],giver:'MOM',desc:'You finally came home. Your father was gardening. With mines. Clear the lawn before dinner gets cold.'},
];
const FI=f=>FIELDS[(f-1)%FIELDS.length];
const CHAT={
  battle:{open:['k_1','d_1'],fav:['dez','kova'],arcs:{kova:['k_1','k_2','k_3','k_4','k_5'],dez:['d_1','d_2','d_3','d_4','d_5'],mom:['m_1','m_2','m_3'],qm:['q_1','q_2','q_3','q_4'],jenkins:['j_2','j_3','j_4'],whisper:['w_1','w_2','w_3'],reyes:['r_copy','r_intel','r_push']}},
  desert:{open:['kd_1','dd_1'],fav:['reyes','jenkins'],arcs:{reyes:['rd_1','rd_2','rd_3'],jenkins:['jd_1','jd_2','jd_3'],kova:['kd_1','kd_2'],dez:['dd_1','dd_2'],mom:['md_1','md_2'],qm:['qd_1','qd_2'],whisper:['wd_1','wd_2']}},
  club:{open:['dj_1','mc_1'],fav:['dez','dj'],arcs:{dez:['dc_1','dc_2','dc_3','dc_4'],dj:['dj_1','dj_2','dj_3','dj_5'],reyes:['rc_1','rc_2'],kova:['kc_1','kc_2'],jenkins:['jc_1','jc_2'],mom:['mc_1','mc_2'],qm:['qc_1'],whisper:['wc_1']}},
  arctic:{open:['pa_1','da_1'],fav:['prof'],arcs:{prof:['pa_1','pa_2','pa_3','pa_4'],reyes:['ra_1','ra_2'],jenkins:['ja_1','ja_2'],kova:['ka_1'],mom:['ma_1'],qm:['qa_1'],dez:['da_1'],whisper:['wa_1']}},
  home:{open:['mh_1','rh_1'],fav:['mom'],arcs:{mom:['mh_1','mh_2','mh_3','mh_4'],reyes:['rh_1','rh_2'],dez:['dh_1'],kova:['kh_1'],jenkins:['jh_1'],qm:['qh_1'],whisper:['wh_1']}},
};
const SHARED=['rg_1','rg_2','jg_1','jg_2','kg_1','qg_1','mg_1','dg_1','wg_1'];
const REPEATS=['r_copy','r_push','j_2','q_4','k_2','d_2','m_2','w_2','j_3','q_2','r_intel','d_3','k_4','m_3','j_4','q_3','d_4','rd_1','jd_3','dc_2','dj_2','pa_2','ja_1','mh_3','kg_1','jg_1','qd_2','rg_2','dg_1'];
const PIN=new Set(['r_hit1','r_hit2','r_hit3','r_hit4','r_hit5','j_hit','r_flag','r_flag2','r_flag3','r_area','r_area2','j_area','r_idle','r_idle2','j_idle','j_low','s_crit','s_ach','s_level','s_quest','s_save','s_drop','s_obj','s_skill','s_season','s_store','s_chal','s_check','r_dead','k_dead','j_lore','r_lore','j_1','j_respawn','m_4','r_half','a_complete']);
const HIJAZ=[[62,0,63,66,67,0,66,63,62,0,0,63,66,67,69,0],[70,0,69,67,66,0,67,66,63,0,62,0,63,66,63,0],[62,0,63,66,67,0,66,63,62,0,0,63,66,67,69,0],[74,72,70,69,70,69,67,66,67,66,63,66,62,0,0,0]];""")
rep("grain:true,sway:true,muted:false},store.get('settings',{}));", "grain:true,sway:true,muted:false,blood:true},store.get('settings',{}));")
rep("ach:{},gs:0,lore:0},store.get('profile',{}));", "ach:{},gs:0,lore:0,maxField:1},store.get('profile',{}));")

# ---------------- audio
rep("const A={ctx:null,buffers:{},pending:{}};", "const A={ctx:null,buffers:{},pending:{},lru:[]};")
rep("A.master=ctx.createGain(); A.master.gain.value=settings.muted?0:settings.master; A.master.connect(comp);",
    "A.master=ctx.createGain(); A.master.gain.value=settings.muted?0:settings.master; A.comp=comp; A.muf=ctx.createBiquadFilter(); A.muf.type='lowpass'; A.muf.frequency.value=20000; A.master.connect(A.muf); A.muf.connect(comp);")
rep("  decodeAll();\n}", "  predecode(['a_title',...PIN]);\n}")
rep("const ok=b=>{if(done)return;done=true;A.buffers[id]=b;res(b);};", "const ok=b=>{if(done)return;done=true;A.buffers[id]=b;touchBuf(id);res(b);};")
rep("async function decodeAll(){for(const id of ['a_title','r_start','k_1','d_1',...Object.keys(VOICES)])await decodeOne(id);}",
r"""function touchBuf(id){const i=A.lru.indexOf(id);if(i>=0)A.lru.splice(i,1);A.lru.push(id);let guard=0;while(A.lru.length>34&&guard++<60){const old=A.lru.find(x=>!PIN.has(x)&&!VM.active.some(v=>v.id===x)&&x!==VM.queued);if(!old)break;A.lru.splice(A.lru.indexOf(old),1);delete A.buffers[old];delete A.pending[old];}}
async function predecode(ids){for(const id of ids)if(id&&VOICES[id])await decodeOne(id);}
function shellshock(){if(!A.ctx)return;const t=A.ctx.currentTime,f=A.muf.frequency;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setValueAtTime(300,t+.06);f.exponentialRampToValueAtTime(19000,t+2.9);
  const o=A.ctx.createOscillator(),g=A.ctx.createGain();o.type='sine';o.frequency.value=3900;const v=settings.muted?0:.03*settings.master;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+2.7);o.connect(g);g.connect(A.comp);o.start(t);o.stop(t+2.8);}""")
rep("function stab(notes,t,vol){for(const m of notes)osc('sawtooth',n2f(m),t,.12,vol,A.duck,{lp:2600,lp2:600,rel:.06,send:A.sendM});}",
r"""function stab(notes,t,vol){for(const m of notes)osc('sawtooth',n2f(m),t,.12,vol,A.duck,{lp:2600,lp2:600,rel:.06,send:A.sendM});}
function oud(f,t,vol){osc('triangle',f*1.014,t,.16,vol,A.duck,{glide:f,gt:.03,rel:.12,send:A.sendM});osc('sawtooth',f,t,.07,vol*.35,A.duck,{lp:2600,lp2:500,rel:.05});}
function doum(t,vol){osc('sine',105,t,.2,vol,A.duck,{glide:58,gt:.15,rel:.08,send:A.sendM});nz(t,.03,vol*.4,A.duck,{type:'lowpass',f:500});}
function tek(t,vol){nz(t,.025,vol,A.duck,{type:'bandpass',f:3400,q:2.2});osc('triangle',780,t,.015,vol*.25,A.duck,{rel:.01});}
function ney(m,t,dur){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(n2f(m),t);o.frequency.setTargetAtTime(n2f(m-2),t+dur*.55,.08);l.frequency.value=5.2;lg.gain.value=n2f(m)*.012;l.connect(lg);lg.connect(o.frequency);
  env(g,t,.35,.05,dur,.4);o.connect(g);g.connect(A.duck);g.connect(A.sendM);o.start(t);o.stop(t+dur+3);l.start(t);l.stop(t+dur+3);nz(t,dur,.01,A.duck,{type:'bandpass',f:1600,q:.8,a:.3,rel:.3});}""")
rep("const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2};", "const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4};")
rep("    if(st===3||st===10)stab(tr.map(m=>m+12),t,.05);\n  }else if(mode==='win'){",
r"""    if(st===3||st===10)stab(tr.map(m=>m+12),t,.05);
    const b8=Math.floor(s/16)%8;if(b8>=4){const arp=[0,7,12,16,12,7,3,7];osc('square',n2f(tr[0]+24+arp[st%8]),t,.06,.022,A.duck,{lp:3200,rel:.03,send:A.sendM});}
    if(b8===7&&st===0)nz(t,STEP.club*16,.07,A.duck,{type:'bandpass',f:300,f2:6000,q:2,a:STEP.club*14,rel:.05});
  }else if(mode==='desert'){const bar=Math.floor(s/16)%4,st=s%16;
    if(st===0){osc('sawtooth',n2f(38),t,STEP.desert*16,.05,A.duck,{a:.4,rel:.6,lp:320});osc('sawtooth',n2f(45),t,STEP.desert*16,.035,A.duck,{a:.4,rel:.6,lp:380});
      if(bar===0&&Math.floor(s/64)%2===1)braam(38,t,.13);if(bar===2&&Math.floor(s/64)%2===0)ney(74,t+STEP.desert*2,STEP.desert*10);}
    const m=HIJAZ[bar][st];if(m>0)oud(n2f(m),t,.075);
    if(st===0||st===8)doum(t,st===0?.5:.4);if(st===2||st===6||st===12)tek(t,.2);if(st===14||st===15)tek(t,.07);
  }else if(mode==='win'){""")

# ---------------- voices / chatter
rep("const VM={active:[],next:9,opening:[],arcs:{},last:null,cds:{},rep:[]};", "const VM={active:[],next:9,opening:[],arcs:{},last:null,cds:{},rep:[],queued:null,shared:null,fav:[]};")
between("function initChatter(){", "function say(id,o={}){",
r"""function initChatter(theme){const C=CHAT[theme]||CHAT.battle;VM.arcs={};for(const k in C.arcs)VM.arcs[k]=[...C.arcs[k]];VM.opening=[...C.open];VM.fav=C.fav||[];VM.last=null;VM.rep=[];VM.cds={};VM.next=9;VM.queued=null;}
function chatterGap(){const m={off:[1e9,1e9],normal:[11,19],constant:[3.5,7],unbearable:[.5,1.6]}[settings.chatter]||[4,7];return rand(m[0],m[1]);}
function nextChatter(){
  if(VM.opening.length){const id=VM.opening.shift();const who=whoOf(id);const arc=VM.arcs[who];if(arc&&arc[0]===id)arc.shift();VM.last=who;return id;}
  let keys=Object.keys(VM.arcs).filter(k=>VM.arcs[k].length);
  if(keys.length>1)keys=keys.filter(k=>k!==VM.last);
  if(keys.length){const w=keys.map(k=>VM.fav.includes(k)?2.2:k==='whisper'?.6:1);let r=Math.random()*w.reduce((a,b)=>a+b,0),k=keys[0];for(let i=0;i<keys.length;i++){r-=w[i];if(r<=0){k=keys[i];break;}}VM.last=k;return VM.arcs[k].shift();}
  if(VM.shared&&VM.shared.length){const id=VM.shared.shift();VM.last=whoOf(id);return id;}
  if(!VM.rep.length)VM.rep=shuffle([...REPEATS]);
  return VM.rep.shift();
}
""")
rep("const who=PREFIX[id[0]],ch=CHAR[who],buf=A.buffers[id];", "const who=whoOf(id),ch=CHAR[who],buf=A.buffers[id];")
rep("  const c=A.ctx,tn=c.currentTime;\n  if(ch.radio){const ra=radioActive();", "  const c=A.ctx,tn=c.currentTime;touchBuf(id);\n  if(ch.radio){const ra=radioActive();")
rep("if(ch.eerie){const dl=c.createDelay(1);dl.delayTime.value=.24;const fb=c.createGain();fb.gain.value=.4;",
    "if(ch.eerie||ch.pa){const dl=c.createDelay(1);dl.delayTime.value=ch.pa?.13:.24;const fb=c.createGain();fb.gain.value=ch.pa?.3:.4;")
rep("function onLineEnd(id){if(G.over)return;const q=QUEST_ON_LINE[id];if(q)addSide(q);if(id==='d_5')startClub();if(id==='q_1'||id==='q_4')setTimeout(()=>notify('LIMITED TIME OFFER','Premium flag skins are in the store. Press B.','info','%'),600);}",
    "function onLineEnd(id){if(G.over)return;const q=QUEST_ON_LINE[id];if(q)addSide(q);if(id==='d_5'&&G.theme.bg!=='club')startClub();if(whoOf(id)==='qm'&&Math.random()<.5){setTimeout(()=>notify('LIMITED TIME OFFER','Premium flag skins are in the store. Press B.','info','%'),600);sched(1.3,()=>bark('s_store','sstore',60));}}")
rep("<span class=\"sub-sys\">[SYSTEM]</span> ${esc(SUBS[id])}", "<span class=\"sub-sys\">[SYSTEM]</span> ${esc(lineText(id))}")
rep("${esc(ch.name)}:</b> ${esc(SUBS[id]||'')}", "${esc(ch.name)}:</b> ${esc(lineText(id))}")

# ---------------- title menus
rep("stopAllVoices();show('title');$('#toasts').classList.remove('mid');sizeAll();$('#ld').hidden=true;$('#press').hidden=!!fromGame;$('#mainmenu').hidden=!fromGame;$('#diffmenu').hidden=true;",
    "stopAllVoices();show('title');$('#toasts').classList.remove('mid');sizeAll();$('#ld').hidden=true;$('#press').hidden=!!fromGame;$('#mainmenu').hidden=!fromGame;$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;")
rep("$('#mainmenu').hidden=false;$('#diffmenu').hidden=true;S.whoosh();", "$('#mainmenu').hidden=false;$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;S.whoosh();")
rep("loadGame(d);});\n['#mainmenu','#diffmenu','#pause .menu']",
r"""showChapters(d);});
let chapDiff='normal';
function showChapters(d){menuState='chap';chapDiff=d;const m=PROFILE.maxField||1,nav=$('#chapmenu');
  nav.innerHTML=`<div class="menu-h">SELECT CHAPTER · ${DIFFS[d].label.toUpperCase()}</div>`+FIELDS.map((f,i)=>{const n=i+1,lock=n>m;return `<button data-c="${n}" class="${lock?'locked':''}">${n}. ${esc(f.name.toUpperCase())}<small>${lock?'Locked · Clear the previous chapter':esc(f.op)}</small></button>`;}).join('')+(m<FIELDS.length?`<button data-c="pack">TIME SAVER PACK<small class="hot">Unlock every chapter now · €4.99</small></button>`:'')+`<button data-c="back">BACK</button>`;
  $('#diffmenu').hidden=true;nav.hidden=false;focusFirst('#chapmenu');}
$('#chapmenu').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.ui();const c=b.dataset.c;
  if(c==='back'){menuState='diff';$('#chapmenu').hidden=true;$('#diffmenu').hidden=false;focusFirst('#diffmenu');return;}
  if(c==='pack'){PROFILE.maxField=FIELDS.length;saveProfile();S.coin();unlock('timesaver');notify('PURCHASE COMPLETE','€0.00 charged|Every chapter unlocked. Your time is valuable. Ours is not.','ach','⏱');showChapters(chapDiff);return;}
  const n=+c;if(n>(PROFILE.maxField||1)){S.denied();notify('CHAPTER LOCKED','Clear the previous chapter, or buy the Time Saver Pack.','info','!');return;}loadGame(chapDiff,n);});
['#mainmenu','#diffmenu','#chapmenu','#pause .menu']""")
rep("async function loadGame(d){\n  if(ldBusy)return;ldBusy=true;menuState='load';$('#diffmenu').hidden=true;",
    "async function loadGame(d,field){\n  if(ldBusy)return;ldBusy=true;menuState='load';$('#diffmenu').hidden=true;$('#chapmenu').hidden=true;")
rep("$('#ld-st').textContent='Press any key to continue';await sleep(250);startGame(d);", "$('#ld-st').textContent='Press any key to continue';await sleep(250);startGame(d,false,field||1);")
rep("if(e.key==='Escape'&&menuState==='diff'){showMain();return;}",
    "if(e.key==='Escape'&&menuState==='diff'){showMain();return;}if(e.key==='Escape'&&menuState==='chap'){menuState='diff';$('#chapmenu').hidden=true;$('#diffmenu').hidden=false;focusFirst('#diffmenu');return;}")
rep("const nav=cur==='title'?($('#mainmenu').hidden?$('#diffmenu'):$('#mainmenu')):$('#pause .menu');",
    "const nav=cur==='title'?(!$('#mainmenu').hidden?$('#mainmenu'):!$('#diffmenu').hidden?$('#diffmenu'):$('#chapmenu')):$('#pause .menu');")

# ---------------- game state & events
rep("function newField(dkey){const d=DIFFS[dkey],n=d.cols*d.rows;\n  G={dkey,", "function newField(dkey,field){field=field||1;const d=DIFFS[dkey],n=d.cols*d.rows;\n  G={dkey,field,theme:FI(field),tileset:(field-1)%3,nextNag:70,chal:false,")
rep("if(wasTarget){G.follows++;gainXP(15);addFeed('<b>OBJECTIVE COMPLETE</b> · Click the next glowing tile','gold');if(G.follows===10)unlock('follow');}",
    "if(wasTarget){G.follows++;gainXP(15);addFeed('<b>OBJECTIVE COMPLETE</b> · Click the next glowing tile','gold');if(G.follows===10)unlock('follow');if(Math.random()<.25)bark('s_obj','sobj',45);}")
rep("bark('r_area','area',25,{});", "bark(pick(['r_area','r_area2','j_area']),'area',25,{});")
rep("  if(G.opened>=10)unlock('ten');\n", "  if(G.opened>=10)unlock('ten');\n  if(G.opened>=50&&!G.chal){G.chal=true;PROFILE.coins+=100;G.coinsEarned+=100;notify('DAILY CHALLENGE COMPLETE','Reveal 50 tiles|+100 Sweep Coins','ach','✓');sched(.8,()=>bark('s_chal','schal',60));}\n")
rep("if(G.flags===1)bark('r_flag','flag',40,{});else if(Math.random()<.2)bark('r_flag','flag',40,{chatter:true});",
    "if(G.flags===1)bark(pick(['r_flag','r_flag2','r_flag3']),'flag',40,{});else if(Math.random()<.22)bark(pick(['r_flag','r_flag2','r_flag3']),'flag',40,{chatter:true});")
rep("  const dmg=Math.round(60*(PROFILE.perks.thick?.75:1));", "  bloodHit(p.x,p.y);shellshock();\n  const dmg=Math.round(60*(PROFILE.perks.thick?.75:1));")
rep("sched(.35,()=>bark(pick(['r_hit1','r_hit2','r_hit3']),'hit',7,{}));", "sched(.35,()=>bark(pick(['r_hit1','r_hit2','r_hit3','r_hit4','r_hit5','j_hit']),'hit',7,{}));")
rep("if(PROFILE.lore===1||G.loreFound===1)bark('j_lore','jlore',999,{});", "if(PROFILE.lore===1||G.loreFound===1)bark(pick(['j_lore','r_lore']),'jlore',999,{});")
rep("S.level();if(G){bark('s_level','slevel',30);", "S.level();if(G){bark('s_level','slevel',30);if((PROFILE.lvl-1)%2===0)sched(1.6,()=>bark('s_season','sseason',25));")
rep("$('#game').classList.remove('club');if(!G.over)musicStart('game');", "$('#game').classList.remove('club');if(!G.over)musicStart(fieldMusic());")
rep("G.dead=false;G.hp=100;G.hpTrail=100;G.lastHit=-99;$('#game').classList.remove('dying');",
    "G.dead=false;G.hp=100;G.hpTrail=100;G.lastHit=-99;$('#game').classList.remove('dying');say('s_check');sched(1.4,()=>bark('j_respawn','jresp',120,{}));")
between("async function win(){", "function showResults(){",
r"""async function win(){
  G.won=true;G.over=true;G.target=-1;for(let i=0;i<G.n;i++)if(G.mine[i]&&G.st[i]===0){G.st[i]=2;G.flags++;}
  const f=G.field;PROFILE.maxField=Math.max(PROFILE.maxField||1,Math.min(FIELDS.length,f+1));saveProfile();
  updateHUD();unlock('win');const ck=[null,'ch2','ch3','ch4','ch5'][(f-1)%5];if(ck)unlock(ck);musicStart('win');$('#letterbox').classList.add('on');stopAllVoices();
  for(let k=0;k<7;k++)setTimeout(()=>{if(!G)return;const x=BX+rand(0,BW),y=BY+rand(0,BH*.7);for(let j=0;j<46;j++){const a=rand(0,6.283),v=rand(80,320);emit({t:'confetti',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,g:260,drag:1.2,life:rand(1.2,2.4),s:rand(3,6),h:rand(0,360),r:rand(0,6)});}S.ach();},k*380);
  banner('FIELD CLEARED',G.theme.op.toUpperCase(),'Mission complete');setTimeout(()=>say('a_complete'),300);setTimeout(()=>{if(G&&G.won)say(G.theme.win[0]);},2000);
  await sleep(5600);if(!G||!G.won)return;showResults();setTimeout(()=>{if(G&&G.won)say(G.theme.win[1]);},2400);
}
""")
rep("$('#rs').innerHTML=`<div class=\"rs-k\">MISSION COMPLETE · ${DIFFS[G.dkey].label.toUpperCase()}</div><h2>Operation: Clean Sweep</h2>",
    "const nx=FI(G.field+1);$('#rs').innerHTML=`<div class=\"rs-k\">MISSION COMPLETE · CHAPTER ${G.field} · ${DIFFS[G.dkey].label.toUpperCase()}</div><h2>${esc(G.theme.op)}</h2>")
rep("<div class=\"rs-btns\"><button class=\"pbtn\" data-r=\"again\">NEW GAME+</button><button class=\"pbtn alt\" data-r=\"dlc\">BUY DLC: MINES OF THE NORTH · €24.99</button><button class=\"pbtn alt\" data-r=\"title\">MAIN MENU</button></div>\n  <div class=\"rs-f\">Next field (2 of 87) unlocks with the Season Pass · Post-credits scene available after 48 minutes of credits</div>`;",
    "<div class=\"rs-btns\"><button class=\"pbtn\" data-r=\"next\">NEXT: ${esc(nx.name.toUpperCase())} →</button><button class=\"pbtn alt\" data-r=\"again\">REPLAY CHAPTER</button><button class=\"pbtn alt\" data-r=\"dlc\">BUY DLC: MINES OF THE NORTH · €24.99</button><button class=\"pbtn alt\" data-r=\"title\">MAIN MENU</button></div>\n  <div class=\"rs-f\">Chapter ${G.field+1} of 87 unlocked · Post-credits scene available after 48 minutes of credits</div>`;")
rep("if(b.dataset.r==='again'){$('#results').hidden=true;startGame(G.dkey,true);}",
    "if(b.dataset.r==='next'){$('#results').hidden=true;startGame(G.dkey,true,G.field+1);}else if(b.dataset.r==='again'){$('#results').hidden=true;startGame(G.dkey,true,G.field);}")
between("async function startGame(dkey,quick){", "function chooseLayout(){",
r"""async function startGame(dkey,quick,field){
  field=field||1;
  await fadeTo(1,quick?400:600);
  closeOverlays();stopAllVoices();newField(dkey,field);initChatter(G.theme.bg);if(field===1||!VM.shared)VM.shared=shuffle([...SHARED]);
  BL.s.length=0;BL.ind.length=0;BL.on=false;
  $('#feed').innerHTML='';$('#subs').innerHTML='';$('#game').className='screen'+(G.theme.bg==='club'?' clubfield':'');$('#letterbox').classList.remove('on');$('#radio').hidden=true;$('#radio').classList.remove('on');$('#tip').hidden=true;$('#autosave').hidden=true;$('#respects').hidden=true;$('#blood').style.opacity=0;
  $('#fx-grain').classList.toggle('off',!settings.grain);P.length=0;
  $('#mm-lab').textContent=G.theme.name.toUpperCase();$('#q-title').textContent=G.theme.op;
  if(G.theme.bg==='club'){G.clubDone=true;G.side.push('club');G.tracked='club';}
  show('game');layout();updateHUD();musicStart(fieldMusic());if(document.fonts&&document.fonts.load)document.fonts.load('600 40px Teko').then(()=>{if(G)buildSprites();},()=>{});
  predecode([G.theme.vo,G.theme.start,...CHAT[G.theme.bg].open,...G.theme.win]).then(()=>{if(G&&!VM.queued){VM.queued=nextChatter();decodeOne(VM.queued);}});
  await fadeTo(0,900);
  const loop=Math.floor((field-1)/FIELDS.length),ch=$('#chapter');ch.querySelector('.ch-k').textContent=G.theme.ch+(loop?` · NEW GAME${'+'.repeat(loop)}`:'');ch.querySelector('.ch-t').textContent=G.theme.name.toUpperCase();ch.querySelector('.ch-s').textContent=`${G.theme.time} · ${DIFFS[dkey].label.toUpperCase()} · ${G.theme.op.toUpperCase()}`;ch.classList.add('on');setTimeout(()=>ch.classList.remove('on'),3600);
  sched(.4,()=>say(G.theme.vo));sched(3.3,()=>bark(G.theme.start,'start',0,{}));
}
function fieldMusic(){return['game','desert','club'][((G?G.field:1)-1)%3];}
""")
rep("sizeCanvas($('#compassCv'));sizeCanvas($('#mm'));buildSprites();", "sizeCanvas($('#compassCv'));sizeCanvas($('#mm'));sizeCanvas($('#blood'));buildSprites();")

# ---------------- sprites
rep("function craterSprite(s){const c=openTile(s),g=c.getContext('2d');", "function craterSprite(s,ts){const c=ts===1?openSand(s):ts===2?openClub(s):openTile(s),g=c.getContext('2d');")
rep("function buildSprites(){const s=Math.max(8,Math.round(T*dpr));SPR.s=s;SPR.hid=plate(s,false);SPR.hov=plate(s,true);SPR.open=openTile(s);SPR.num=[null];for(let n=1;n<=8;n++)SPR.num.push(numSprite(s,n));SPR.crater=craterSprite(s);}",
r"""function speck(g,s,n,a,b){for(let k=0;k<n;k++){g.fillStyle=Math.random()<.5?a:b;g.fillRect(Math.random()*s,Math.random()*s,1,1);}}
function bevel(g,s,b,lite,dark){g.fillStyle=lite;g.beginPath();g.moveTo(0,0);g.lineTo(s,0);g.lineTo(s-b,b);g.lineTo(b,b);g.lineTo(b,s-b);g.lineTo(0,s);g.closePath();g.fill();g.fillStyle=dark;g.beginPath();g.moveTo(s,s);g.lineTo(0,s);g.lineTo(b,s-b);g.lineTo(s-b,s-b);g.lineTo(s-b,b);g.lineTo(s,0);g.closePath();g.fill();}
function plateSand(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#f8e0ae':'#e8c993');gr.addColorStop(.55,hover?'#e0bd84':'#cda46c');gr.addColorStop(1,hover?'#ba915b':'#a37b48');g.fillStyle=gr;g.fillRect(0,0,s,s);
  speck(g,s,s*s/8,'rgba(255,246,222,.22)','rgba(96,58,22,.2)');bevel(g,s,b,'rgba(255,244,214,.5)','rgba(84,50,18,.55)');
  if(Math.random()<.55){g.strokeStyle='rgba(96,58,26,.5)';g.lineWidth=Math.max(.7,s*.025);g.beginPath();let x=rand(b,s-b),y=b;g.moveTo(x,y);for(let k=0;k<3;k++){x+=rand(-s*.15,s*.15);y+=rand(s*.12,s*.28);g.lineTo(x,y);}g.stroke();}
  if(Math.random()<.3){g.globalCompositeOperation='destination-out';const k=s*.14,cn=Math.floor(Math.random()*4),px=cn%2?s:0,py=cn>1?s:0,dx=cn%2?-k:k,dy=cn>1?-k:k;g.beginPath();g.moveTo(px,py);g.lineTo(px+dx,py);g.lineTo(px,py+dy);g.closePath();g.fill();g.globalCompositeOperation='source-over';}
  g.strokeStyle='rgba(70,40,12,.55)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
function openSand(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#6f4f30');gr.addColorStop(1,'#4a321e');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/10,'rgba(255,220,170,.12)','rgba(0,0,0,.15)');
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(30,15,5,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(255,220,170,.08)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
function plateClub(s,hover){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,hover?'#2e2446':'#1b1429');gr.addColorStop(1,hover?'#181029':'#0a0712');g.fillStyle=gr;g.fillRect(0,0,s,s);
  const i=Math.max(1,s*.08);g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=Math.max(1,s*.03);g.strokeRect(i,i,s-2*i,s-2*i);
  const gl=g.createLinearGradient(0,0,s*.6,s*.6);gl.addColorStop(0,'rgba(255,255,255,.24)');gl.addColorStop(.5,'rgba(255,255,255,.05)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.beginPath();g.moveTo(0,0);g.lineTo(s,0);g.lineTo(0,s);g.closePath();g.fill();
  g.strokeStyle='rgba(0,0,0,.85)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
function openClub(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'#150d24');gr.addColorStop(1,'#08050f');g.fillStyle=gr;g.fillRect(0,0,s,s);g.strokeStyle='rgba(255,90,230,.12)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);return c;}
function buildSprites(){const s=Math.max(8,Math.round(T*dpr));SPR.s=s;const ts=G?G.tileset:0;
  if(ts===1){SPR.hid=plateSand(s,false);SPR.hov=plateSand(s,true);SPR.open=openSand(s);}
  else if(ts===2){SPR.hid=plateClub(s,false);SPR.hov=plateClub(s,true);SPR.open=openClub(s);}
  else{SPR.hid=plate(s,false);SPR.hov=plate(s,true);SPR.open=openTile(s);}
  SPR.num=[null];for(let n=1;n<=8;n++)SPR.num.push(numSprite(s,n));SPR.crater=craterSprite(s,ts);}""")

# ---------------- scenery (full replacement)
between("/* ================= scenery ================= */", "function drawTitle(t,dt){",
r"""/* ================= scenery ================= */
const SC={key:'',w:0,h:0,st:null,fog:null,parts:[],x:{}};
function bake(w,h,fn){const c=document.createElement('canvas');c.width=Math.ceil(w*dpr);c.height=Math.ceil(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);fn(g);return c;}
function ensureScenery(th,w,h){const key=th+':'+w+'x'+h+'@'+dpr;if(SC.key===key)return;SC.key=key;SC.w=w;SC.h=h;SC.x={};SC.parts=[];if(!SC.fog)buildFog();(BUILD[th]||BUILD.battle)(w,h);}
function jag(g,w,h,base,amp,step,col){g.fillStyle=col;g.beginPath();g.moveTo(0,h);let y=base;for(let x=0;x<=w+step;x+=step){y=clamp(y+rand(-amp,amp),base-amp*3,base+amp*2);g.lineTo(x,y);}g.lineTo(w,h);g.closePath();g.fill();}
function buildFog(){const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');for(let k=0;k<80;k++){const x=rand(0,1024),y=rand(60,200),r=rand(40,130);for(const ox of[-1024,0,1024]){const gr=g.createRadialGradient(x+ox,y,0,x+ox,y,r);gr.addColorStop(0,'rgba(200,175,160,.075)');gr.addColorStop(1,'rgba(200,175,160,0)');g.fillStyle=gr;g.fillRect(x+ox-r,y-r,2*r,2*r);}}SC.fog=c;}
function drawFog(g,w,t,y,hh,alpha){const fw=Math.max(w,1024),o1=(t*14)%fw,o2=(t*7)%fw;g.globalAlpha=alpha;for(let x=-o1;x<w;x+=fw)g.drawImage(SC.fog,x,y,fw,hh);g.globalAlpha=alpha*.7;for(let x=o2-fw;x<w;x+=fw)g.drawImage(SC.fog,x,y+hh*.38,fw,hh*.8);g.globalAlpha=1;}
function sunFlare(g,w,h,sx,sy,k,warm){g.globalCompositeOperation='lighter';let gr=g.createRadialGradient(sx,sy,0,sx,sy,70*k);gr.addColorStop(0,`rgba(255,245,220,${.9*k})`);gr.addColorStop(.25,warm?'rgba(255,190,120,.35)':'rgba(255,245,215,.32)');gr.addColorStop(1,'rgba(255,150,80,0)');g.fillStyle=gr;g.fillRect(sx-70*k,sy-70*k,140*k,140*k);
  g.save();g.translate(sx,sy);g.scale(1,.022);gr=g.createRadialGradient(0,0,0,0,0,w*.62);gr.addColorStop(0,`rgba(140,200,255,${.5*k})`);gr.addColorStop(1,'rgba(80,140,255,0)');g.fillStyle=gr;g.fillRect(-w*.62,-w*.62,w*1.24,w*1.24);g.restore();
  const dx=w/2-sx,dy=h/2-sy;for(const[m,r,col]of[[.35,26,'120,170,255'],[.72,14,'255,180,120'],[1.18,46,'120,255,200'],[1.55,22,'190,140,255']]){const x=sx+dx*m,y=sy+dy*m;gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${.07*k})`);gr.addColorStop(.7,`rgba(${col},${.05*k})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
  g.globalCompositeOperation='source-over';}
function birdV(g,x,y,f){g.beginPath();g.moveTo(x-7,y-f);g.quadraticCurveTo(x-3,y-2,x,y);g.quadraticCurveTo(x+3,y-2,x+7,y-f);g.stroke();}
const BUILD={},DRAW={};
function ember(init){return{x:rand(-60,SC.w),y:init?rand(0,SC.h):SC.h+10,vx:rand(6,30),vy:-rand(14,46),s:rand(.6,2.2),f:rand(0,6.28),hue:rand(18,42)};}
BUILD.battle=(w,h)=>{const hz=h*.64;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#071018');sky.addColorStop(.55,'#192530');sky.addColorStop(1,'#5c3b25');g.fillStyle=sky;g.fillRect(0,0,w,hz+2);
  const sx=w*.84,sy=hz-h*.04;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.6);gr.addColorStop(0,'rgba(255,175,95,.55)');gr.addColorStop(.16,'rgba(225,105,50,.24)');gr.addColorStop(1,'rgba(120,40,20,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  jag(g,w,h,hz-46,9,18,'rgba(70,56,56,.5)');jag(g,w,h,hz-18,7,14,'rgba(38,33,36,.9)');
  g.fillStyle='#17161a';for(let k=0;k<8;k++){const bx=rand(0,w),bw=rand(18,64),bh=rand(18,90);g.beginPath();g.moveTo(bx,hz+8);g.lineTo(bx,hz-bh);let x=bx;while(x<bx+bw){x+=rand(3,9);g.lineTo(Math.min(x,bx+bw),hz-bh+rand(-12,10));}g.lineTo(bx+bw,hz+8);g.closePath();g.fill();
    g.fillStyle='rgba(255,170,90,.18)';for(let wy=hz-bh+14;wy<hz;wy+=10)for(let wx=bx+4;wx<bx+bw-4;wx+=9)if(Math.random()<.12)g.fillRect(wx,wy,3,4);g.fillStyle='#17161a';}
  const tx=w*.16,th=h*.3;g.strokeStyle='#121114';g.lineWidth=1.3;g.beginPath();g.moveTo(tx-15,hz);g.lineTo(tx,hz-th);g.lineTo(tx+15,hz);for(let k=1;k<10;k++){const yy=hz-th*k/10,ww=15*(1-k/10),wn=15*(1-(k+1)/10);g.moveTo(tx-ww,yy);g.lineTo(tx+wn,yy-th/10);g.moveTo(tx+ww,yy);g.lineTo(tx-wn,yy-th/10);}g.stroke();SC.x.tower={x:tx,y:hz-th};
  jag(g,w,h,hz+14,6,10,'#0b0b0e');const gg=g.createLinearGradient(0,hz,0,h);gg.addColorStop(0,'#0d0c0f');gg.addColorStop(1,'#040405');g.fillStyle=gg;g.fillRect(0,hz+34,w,h);});
  SC.parts=Array.from({length:Math.round(clamp(w*h/12000,30,140))},()=>ember(true));};
DRAW.battle=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.64,tw=SC.x.tower;if(tw&&Math.sin(t*3)>.2){g.fillStyle='rgba(255,40,40,.9)';g.beginPath();g.arc(tw.x,tw.y,2.2,0,6.283);g.fill();}
  drawFog(g,w,t,hz-h*.2,h*.4,1);sunFlare(g,w,h,w*.84,hz-h*.04,1,true);
  g.globalCompositeOperation='lighter';for(const e of SC.parts){e.x+=e.vx*dt;e.y+=e.vy*dt;e.f+=dt*6;if(e.y<-10||e.x>w+20)Object.assign(e,ember(false));const a=.45+.45*Math.sin(e.f);g.fillStyle=`hsla(${e.hue},100%,62%,${a})`;g.fillRect(e.x,e.y,e.s,e.s);}g.globalCompositeOperation='source-over';};

function archGate(g,x,b,wd,ht){const p=wd*.22;g.beginPath();g.moveTo(x,b);g.lineTo(x,b-ht);g.lineTo(x+wd,b-ht);g.lineTo(x+wd,b);g.lineTo(x+wd-p,b);g.lineTo(x+wd-p,b-ht*.55);g.arc(x+wd/2,b-ht*.55,(wd-2*p)/2,0,Math.PI,true);g.lineTo(x+p,b);g.closePath();g.fill();}
function palm(g,x,b,hgt,lean,col){g.strokeStyle=col;g.lineCap='round';g.lineWidth=Math.max(2,hgt*.045);const tx=x+lean,ty=b-hgt;g.beginPath();g.moveTo(x,b);g.quadraticCurveTo(x+lean*.15,b-hgt*.5,tx,ty);g.stroke();g.lineWidth=Math.max(1.4,hgt*.028);
  for(let k=0;k<8;k++){const a=-Math.PI/2+(k-3.5)*.42,l=hgt*rand(.32,.46),ex=tx+Math.cos(a)*l*1.1,ey=ty+Math.sin(a)*l*.5+l*.38;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*l*.6,ty+Math.sin(a)*l*.6-l*.12,ex,ey);g.stroke();}}
BUILD.desert=(w,h)=>{const hz=h*.6;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#2a5784');sky.addColorStop(.55,'#86aec6');sky.addColorStop(1,'#f2d7a6');g.fillStyle=sky;g.fillRect(0,0,w,h);
  const sx=w*.7,sy=h*.15;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.5);gr.addColorStop(0,'rgba(255,250,225,.75)');gr.addColorStop(.12,'rgba(255,236,190,.3)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(183,139,104,.55)';for(let k=0;k<4;k++){const mx=rand(-60,w),mw=rand(120,320),mh=rand(35,90),sl=rand(15,40);g.beginPath();g.moveTo(mx,hz+4);g.lineTo(mx+sl,hz-mh);g.lineTo(mx+mw-sl,hz-mh+rand(-6,6));g.lineTo(mx+mw,hz+4);g.closePath();g.fill();}
  g.fillStyle='rgba(160,116,76,.92)';const rb=hz+6,rx=w*.16;archGate(g,rx,rb,70,92);for(let k=0;k<5;k++){const cx=rx+100+k*24,ch=rand(22,72);g.fillRect(cx,rb-ch,10,ch);g.fillRect(cx-3,rb-ch-4,16,5);}
  const dx=w*.7;g.fillRect(dx,rb-40,64,40);g.beginPath();g.ellipse(dx+32,rb-40,27,25,0,Math.PI,0);g.fill();g.fillRect(dx+30,rb-74,4,12);g.fillRect(dx+80,rb-60,12,60);g.beginPath();g.moveTo(dx+80,rb-60);g.lineTo(dx+86,rb-74);g.lineTo(dx+92,rb-60);g.fill();
  const dune=(base,amp,wl,c1,c2)=>{const ph=rand(0,6),yAt=x=>base+Math.sin(x/wl+ph)*amp+Math.sin(x/(wl*.37)+ph*2)*amp*.35;g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+8;x+=8)g.lineTo(x,yAt(x));g.lineTo(w,h);g.closePath();const gg=g.createLinearGradient(0,base-amp,0,base+amp*3+40);gg.addColorStop(0,c1);gg.addColorStop(1,c2);g.fillStyle=gg;g.fill();
    g.strokeStyle='rgba(255,244,215,.35)';g.lineWidth=1.2;g.beginPath();for(let x=0;x<=w+8;x+=8){const y=yAt(x);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();};
  dune(hz+6,10,160,'#e8c995','#d2a86f');palm(g,w*.05,hz+12,70,8,'rgba(70,56,36,.85)');palm(g,w*.09,hz+16,52,-6,'rgba(70,56,36,.85)');palm(g,w*.94,hz+10,64,-10,'rgba(70,56,36,.85)');
  dune(hz+40,16,220,'#e2b97f','#c1915a');dune(hz+92,22,300,'#d7a96c','#a8773f');dune(hz+172,30,380,'#c89255','#8a5a2c');
  g.strokeStyle='rgba(110,70,35,.13)';g.lineWidth=1;for(let k=0;k<60;k++){const x=rand(0,w),y=rand(hz+110,h);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+20,y-4,x+44,y+1);g.stroke();}});
  SC.parts=Array.from({length:Math.round(clamp(w*h/9000,40,200))},()=>({x:rand(0,w),y:rand(h*.3,h),vx:rand(140,380),vy:rand(-8,8),s:rand(.6,1.8),a:rand(.2,.6)}));
  SC.x.birds=[{cx:w*.2,cy:h*.2,r:46,ph:0},{cx:w*.24,cy:h*.24,r:30,ph:2}];};
DRAW.desert=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.6;
  for(let y=Math.floor(hz-36);y<hz+16;y+=4){const dx=Math.sin(y*.35+t*4)*1.3;g.drawImage(SC.st,0,y*dpr,SC.st.width,4*dpr,dx,y,w,4);}
  sunFlare(g,w,h,w*.7,h*.15,.9,false);
  g.strokeStyle='rgba(40,30,25,.75)';g.lineWidth=1.6;for(const b of SC.x.birds){const a=t*.4+b.ph;birdV(g,b.cx+Math.cos(a)*b.r*1.6,b.cy+Math.sin(a)*b.r*.5,Math.sin(t*6+b.ph)*3);}
  const storm=Math.pow(Math.max(0,Math.sin(t*.07)),6);
  for(const p of SC.parts){p.x+=p.vx*dt*(1+storm*1.6);p.y+=p.vy*dt;if(p.x>w+10){p.x=-10;p.y=rand(h*.3,h);}g.fillStyle=`rgba(236,206,156,${clamp(p.a*(.5+storm),0,1)})`;g.fillRect(p.x,p.y,p.s*3,p.s);}
  if(storm>.02){g.fillStyle=`rgba(214,170,110,${storm*.38})`;g.fillRect(0,0,w,h);}};

function neon(g,txt,x,y,sz,col,t){const fl=Math.sin(t*23)>.96?.3:1;g.font=`700 ${Math.round(sz)}px Audiowide,"Chakra Petch",sans-serif`;g.textAlign='center';g.shadowColor=`rgba(${col},1)`;g.shadowBlur=18;g.fillStyle=`rgba(${col},${.85*fl})`;g.fillText(txt,x,y);g.shadowBlur=6;g.fillStyle=`rgba(255,255,255,${.7*fl})`;g.fillText(txt,x,y);g.shadowBlur=0;}
BUILD.club=(w,h)=>{const fl=h*.72;SC.st=bake(w,h,g=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0a0513');gr.addColorStop(.7,'#160b28');gr.addColorStop(.72,'#05030a');gr.addColorStop(1,'#0c0716');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.045)';for(let y=20;y<fl-20;y+=14)for(let x=10;x<w;x+=14)g.fillRect(x,y,3,3);
  const spk=(x,y,sw,sh)=>{g.fillStyle='#0b0a10';g.fillRect(x,y,sw,sh);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,sw-1,sh-1);const n=Math.max(1,Math.floor(sh/(sw*.9)));for(let k=0;k<n;k++){const cy=y+sw*.5+k*sw*.9;g.fillStyle='#16141c';g.beginPath();g.arc(x+sw/2,cy,sw*.36,0,6.283);g.fill();g.strokeStyle='rgba(255,255,255,.1)';g.stroke();g.fillStyle='#050408';g.beginPath();g.arc(x+sw/2,cy,sw*.14,0,6.283);g.fill();}};
  const sw=Math.max(50,w*.05);spk(w*.02,fl-sw*3.6,sw,sw*3.6);spk(w*.02+sw+4,fl-sw*2.7,sw,sw*2.7);spk(w*.98-sw,fl-sw*3.6,sw,sw*3.6);spk(w*.98-2*sw-4,fl-sw*2.7,sw,sw*2.7);
  g.fillStyle='rgba(255,255,255,.06)';g.fillRect(0,fl,w,1);});
  SC.x.crowd=[];const n=Math.round(w/26);for(let k=0;k<=n;k++)SC.x.crowd.push({x:(k+rand(-.3,.3))*26,y:h-rand(0,26),s:rand(.8,1.25),ph:rand(0,1),arms:Math.random()<.3});
  SC.parts=Array.from({length:44},()=>({a:Math.random(),y:rand(h*.05,h*.95),r:rand(1.5,3.5)}));};
DRAW.club=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const b=t*124/60,ph=b%1,pulse=Math.exp(-ph*5),bar=Math.floor(b/4),fl=h*.72;
  g.globalCompositeOperation='lighter';
  for(let k=0;k<4;k++){const hue=(t*30+k*90)%360,x=w*(.5+.42*Math.sin(t*.23+k*1.7)),y=fl*(.45+.3*Math.sin(t*.31+k)),r=Math.max(w,h)*.32;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`hsla(${hue},100%,55%,${.1+.08*pulse})`);gr.addColorStop(1,`hsla(${hue},100%,55%,0)`);g.fillStyle=gr;g.fillRect(0,0,w,fl);}
  const em=[[w*.14,h*.04],[w*.86,h*.04]],col=bar%2?'60,255,110':'255,60,240';
  for(let e=0;e<2;e++)for(let k=0;k<5;k++){const base=e?Math.PI*.62:Math.PI*.38,a=base+(k-2)*.12+Math.sin(t*.9+k+e*2)*.45*(e?-1:1),L=h*1.6,x2=em[e][0]+Math.cos(a)*L,y2=em[e][1]+Math.sin(a)*L;g.beginPath();g.moveTo(em[e][0],em[e][1]);g.lineTo(x2,y2);g.strokeStyle=`rgba(${col},.08)`;g.lineWidth=8;g.stroke();g.strokeStyle=`rgba(${col},${.35+.3*pulse})`;g.lineWidth=1.4;g.stroke();}
  for(const p of SC.parts){const x=((p.a+t*.035)%1)*w;g.fillStyle=`rgba(255,255,255,${.12+.1*Math.sin(t*3+p.y)})`;g.beginPath();g.arc(x,p.y,p.r,0,6.283);g.fill();}
  g.globalCompositeOperation='source-over';
  const mbx=w/2,mby=22;g.strokeStyle='rgba(200,200,220,.5)';g.lineWidth=1;g.beginPath();g.moveTo(mbx,0);g.lineTo(mbx,mby-12);g.stroke();const mg=g.createRadialGradient(mbx-4,mby-4,1,mbx,mby,13);mg.addColorStop(0,'#fff');mg.addColorStop(.4,'#a9a9bd');mg.addColorStop(1,'#3a3a4a');g.fillStyle=mg;g.beginPath();g.arc(mbx,mby,13,0,6.283);g.fill();
  neon(g,'DA CLUB',w*.1,h*.44,Math.max(24,w*.027),'255,70,200',t);neon(g,'VIP',w*.9,h*.3,Math.max(20,w*.02),'80,230,255',t+1.3);
  const bw2=Math.min(180,w*.14),bx=w*.82-bw2/2,by=fl-60,bob=pulse*4;g.fillStyle='#050308';g.beginPath();g.arc(bx+bw2/2,by-26+bob,13,0,6.283);g.fill();g.fillRect(bx+bw2/2-22,by-14+bob,44,30);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;g.beginPath();g.arc(bx+bw2/2,by-28+bob,15,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.fillStyle='#0e0a16';g.fillRect(bx,by,bw2,60);g.fillStyle=`rgba(255,70,200,${.5+.4*pulse})`;g.fillRect(bx,by,bw2,3);g.font=`700 ${Math.max(9,Math.round(bw2*.09))}px "Chakra Petch",sans-serif`;g.textAlign='center';g.fillStyle=`rgba(255,160,235,${.6+.3*pulse})`;g.fillText('DJ DETONATOR',bx+bw2/2,by+32);
  const hc=(t*40)%360,cg=g.createLinearGradient(0,h*.82,0,h);cg.addColorStop(0,`hsla(${hc},90%,50%,0)`);cg.addColorStop(1,`hsla(${hc},90%,50%,.25)`);g.fillStyle=cg;g.fillRect(0,h*.82,w,h*.18);
  g.fillStyle='#030106';g.strokeStyle='#030106';for(const p of SC.x.crowd){const s=p.s,bp=Math.abs(Math.sin((b+p.ph)*Math.PI))*6*s,x=p.x,y=p.y-bp;g.beginPath();g.ellipse(x,y+8*s,15*s,12*s,0,Math.PI,0);g.fill();g.fillRect(x-15*s,y+8*s,30*s,44);g.beginPath();g.arc(x,y-8*s,8*s,0,6.283);g.fill();if(p.arms){g.lineWidth=4*s;g.beginPath();g.moveTo(x-10*s,y);g.lineTo(x-14*s,y-24*s-bp);g.moveTo(x+10*s,y);g.lineTo(x+14*s,y-24*s-bp);g.stroke();}}
  if(Math.floor(b)%16===15&&ph<.12){g.fillStyle='rgba(255,255,255,.14)';g.fillRect(0,0,w,h);}};

BUILD.arctic=(w,h)=>{const hz=h*.62;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#01040b');sky.addColorStop(.55,'#071a2e');sky.addColorStop(1,'#173a55');g.fillStyle=sky;g.fillRect(0,0,w,h);
  for(let k=0;k<Math.round(w*h/2600);k++){g.fillStyle=`rgba(255,255,255,${rand(.15,.8)})`;const s=Math.random()<.08?1.6:1;g.fillRect(rand(0,w),rand(0,hz*.95),s,s);}
  const mtn=(base,amp,step,col,snow)=>{const pts=[];let y=base;for(let x=0;x<=w+step;x+=step){y=clamp(y+rand(-amp,amp),base-amp*4,base+amp);pts.push([x,y]);}g.fillStyle=col;g.beginPath();g.moveTo(0,h);for(const[x,yy]of pts)g.lineTo(x,yy);g.lineTo(w,h);g.closePath();g.fill();g.strokeStyle=snow;g.lineWidth=2.2;g.beginPath();pts.forEach(([x,yy],i)=>i?g.lineTo(x,yy):g.moveTo(x,yy));g.stroke();};
  mtn(hz-40,16,22,'#1c3246','rgba(220,236,248,.45)');mtn(hz-8,10,16,'#2a465e','rgba(230,242,252,.55)');
  const ice=g.createLinearGradient(0,hz,0,h);ice.addColorStop(0,'#a9c7dc');ice.addColorStop(1,'#56778f');g.fillStyle=ice;g.fillRect(0,hz+10,w,h);
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;for(let k=0;k<26;k++){let x=rand(0,w),y=rand(hz+20,h);g.beginPath();g.moveTo(x,y);for(let j=0;j<4;j++){x+=rand(-40,40);y+=rand(-6,10);g.lineTo(x,y);}g.stroke();}
  const sx=w*.84,sb=hz+16;g.fillStyle='#c6d3dc';g.beginPath();g.arc(sx,sb,34,Math.PI,0);g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(sx,sb);g.arc(sx,sb,34,Math.PI*1.5,0);g.closePath();g.fill();
  g.fillStyle='#8fa3b1';g.fillRect(sx+40,sb-26,70,22);g.fillRect(sx-110,sb-22,64,18);g.fillStyle='#3b4a55';for(const xx of[sx+44,sx+104,sx-106,sx-52])g.fillRect(xx,sb-4,3,8);
  g.fillStyle='#ffd27a';for(let k=0;k<5;k++)g.fillRect(sx+46+k*12,sb-20,6,5);for(let k=0;k<4;k++)g.fillRect(sx-104+k*14,sb-17,6,5);
  g.strokeStyle='#5d6f7c';g.lineWidth=1.5;g.beginPath();g.moveTo(sx+75,sb-26);g.lineTo(sx+75,sb-120);g.stroke();for(let k=1;k<6;k++){g.beginPath();g.moveTo(sx+69,sb-26-k*17);g.lineTo(sx+81,sb-26-k*17);g.stroke();}SC.x.mast={x:sx+75,y:sb-120};});
  const strip=document.createElement('canvas');strip.width=4;strip.height=256;const sg=strip.getContext('2d'),ag=sg.createLinearGradient(0,256,0,0);ag.addColorStop(0,'rgba(90,255,170,0)');ag.addColorStop(.12,'rgba(90,255,170,.9)');ag.addColorStop(.45,'rgba(60,220,200,.45)');ag.addColorStop(.8,'rgba(150,90,255,.25)');ag.addColorStop(1,'rgba(150,90,255,0)');sg.fillStyle=ag;sg.fillRect(0,0,4,256);SC.x.aur=strip;
  SC.parts=Array.from({length:Math.round(clamp(w*h/8000,50,220))},()=>({x:rand(0,w),y:rand(0,h),vy:rand(18,55),s:rand(1,2.6),ph:rand(0,6)}));};
DRAW.arctic=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.62;g.globalCompositeOperation='lighter';
  for(let c=0;c<3;c++){const base=h*(.2+c*.06),ph=c*2.1;for(let x=0;x<w;x+=5){const y0=base+Math.sin(x*.004+t*.15+ph)*40+Math.sin(x*.011-t*.3+ph)*14,len=90+60*Math.sin(x*.007+t*.4+ph);g.globalAlpha=clamp(.16+.12*Math.sin(x*.02+t*.8+ph),0,1)*(c===1?.8:1);g.drawImage(SC.x.aur,x,y0-len,6,len+10);}}
  g.globalAlpha=1;if(SC.x.mast&&Math.sin(t*2.5)>.3){g.fillStyle='rgba(255,50,50,.9)';g.beginPath();g.arc(SC.x.mast.x,SC.x.mast.y,2,0,6.283);g.fill();}
  const sp=(t%17)/17;if(sp<.06){const p=sp/.06,x=w*(.1+.5*p),y=h*(.08+.12*p),gr=g.createLinearGradient(x,y,x-60,y-18);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x-60,y-18);g.stroke();}
  g.globalCompositeOperation='source-over';
  const mist=g.createLinearGradient(0,hz-60,0,hz+80);mist.addColorStop(0,'rgba(200,225,245,0)');mist.addColorStop(.5,'rgba(200,225,245,.16)');mist.addColorStop(1,'rgba(200,225,245,0)');g.fillStyle=mist;g.fillRect(0,hz-60,w,140);
  g.fillStyle='#fff';for(const p of SC.parts){p.y+=p.vy*dt;p.x+=Math.sin(t+p.ph)*.4;if(p.y>h+4){p.y=-4;p.x=rand(0,w);}g.globalAlpha=.45+.4*Math.abs(Math.sin(p.ph));g.fillRect(p.x,p.y,p.s,p.s);}g.globalAlpha=1;};

BUILD.home=(w,h)=>{const hz=h*.6;SC.st=bake(w,h,g=>{
  const sky=g.createLinearGradient(0,0,0,hz);sky.addColorStop(0,'#5f7fb5');sky.addColorStop(.6,'#e9a978');sky.addColorStop(1,'#ffd08e');g.fillStyle=sky;g.fillRect(0,0,w,h);
  const sx=w*.14,sy=hz-24;const gr=g.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.55);gr.addColorStop(0,'rgba(255,230,170,.8)');gr.addColorStop(.12,'rgba(255,190,120,.35)');gr.addColorStop(1,'rgba(255,160,90,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,220,200,.25)';for(let k=0;k<6;k++){g.beginPath();g.ellipse(rand(0,w),rand(h*.08,h*.35),rand(60,160),rand(6,14),0,0,6.283);g.fill();}
  g.fillStyle='rgba(84,92,80,.75)';for(let x=-20;x<w+20;x+=rand(18,34)){g.beginPath();g.arc(x,hz-rand(4,22),rand(14,26),0,6.283);g.fill();}g.fillRect(0,hz-10,w,14);
  const house=(x,b,hw,hh,col,lit)=>{g.fillStyle=col;g.fillRect(x,b-hh,hw,hh);g.beginPath();g.moveTo(x-6,b-hh);g.lineTo(x+hw/2,b-hh-hw*.42);g.lineTo(x+hw+6,b-hh);g.closePath();g.fill();g.fillRect(x+hw*.7,b-hh-hw*.42,hw*.1,hw*.3);if(lit){g.fillStyle='#ffd27a';for(let k=0;k<3;k++)if(Math.random()<.7)g.fillRect(x+hw*(.15+k*.27),b-hh*.7,hw*.13,hh*.22);}};
  for(let k=0;k<8;k++){const hw=rand(60,110);house(rand(-30,w),hz+4,hw,rand(40,62),'#3c3344',Math.random()<.6);}
  const mw=Math.min(240,w*.18),mx=w*.8-mw/2,mb=hz+30;house(mx,mb,mw,mw*.5,'#4a3a42',false);g.fillStyle='#ffdc8a';g.fillRect(mx+mw*.62,mb-mw*.36,mw*.16,mw*.14);g.fillStyle='#2a1f24';g.fillRect(mx+mw*.42,mb-mw*.3,mw*.14,mw*.3);SC.x.tv={x:mx+mw*.12,y:mb-mw*.36,w:mw*.16,h:mw*.14};
  g.fillStyle='#2b2422';g.fillRect(w*.07,hz-30,10,70);g.fillStyle='#2d4628';for(let k=0;k<14;k++){g.beginPath();g.arc(w*.07+5+rand(-46,46),hz-60+rand(-40,26),rand(18,32),0,6.283);g.fill();}
  const lw=g.createLinearGradient(0,hz+30,0,h);lw.addColorStop(0,'#6b9447');lw.addColorStop(1,'#2c4c22');g.fillStyle=lw;g.fillRect(0,hz+30,w,h);g.fillStyle='rgba(255,255,255,.05)';for(let x=0;x<w;x+=80)g.fillRect(x,hz+30,40,h);
  const fy=hz+30;g.fillStyle='#efe8d8';g.fillRect(0,fy-26,w,4);g.fillRect(0,fy-12,w,4);for(let x=4;x<w;x+=16){g.fillStyle='#efe8d8';g.beginPath();g.moveTo(x,fy);g.lineTo(x,fy-34);g.lineTo(x+5,fy-40);g.lineTo(x+10,fy-34);g.lineTo(x+10,fy);g.closePath();g.fill();g.fillStyle='rgba(120,90,70,.25)';g.fillRect(x+7,fy-34,3,34);}
  for(let x=10;x<w;x+=rand(10,22)){g.fillStyle='#2f5a24';g.fillRect(x,fy+4,1.5,10);g.fillStyle=pick(['#ff4d6d','#ffd23f','#ff8fab','#ffffff']);g.beginPath();g.arc(x+.7,fy+4,3.2,0,6.283);g.fill();}
  const gx=w*.3,gy=fy+22;g.fillStyle='#d64545';g.beginPath();g.moveTo(gx-6,gy-10);g.lineTo(gx,gy-26);g.lineTo(gx+6,gy-10);g.closePath();g.fill();g.fillStyle='#f3d3b5';g.fillRect(gx-4,gy-10,8,6);g.fillStyle='#fff';g.beginPath();g.moveTo(gx-5,gy-5);g.lineTo(gx,gy+4);g.lineTo(gx+5,gy-5);g.closePath();g.fill();g.fillStyle='#3b6fd6';g.fillRect(gx-5,gy-1,10,10);});
  SC.parts=Array.from({length:60},()=>({x:rand(0,w),y:rand(h*.3,h),vx:rand(-8,8),vy:rand(-6,6),ph:rand(0,6)}));};
DRAW.home=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const hz=h*.6;sunFlare(g,w,h,w*.14,hz-24,.8,true);
  const tv=SC.x.tv;if(tv){g.fillStyle=`rgba(120,170,255,${.35+.3*Math.abs(Math.sin(t*7)*Math.sin(t*2.3))})`;g.fillRect(tv.x,tv.y,tv.w,tv.h);}
  for(let k=0;k<10;k++){const p=(t*.18+k/10)%1,x=w*.22+Math.sin(p*6+k)*8*p+p*30,y=hz+40-p*160,r=6+p*26;g.fillStyle=`rgba(230,225,220,${.18*(1-p)})`;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();}
  g.globalCompositeOperation='lighter';for(const p of SC.parts){p.x+=p.vx*dt+Math.sin(t+p.ph)*.2;p.y+=p.vy*dt+Math.cos(t*.8+p.ph)*.2;if(p.x<0)p.x+=w;if(p.x>w)p.x-=w;if(p.y<h*.25)p.y=h;if(p.y>h)p.y=h*.25;g.fillStyle=`rgba(255,235,150,${.25+.25*Math.sin(t*2+p.ph)})`;g.beginPath();g.arc(p.x,p.y,1.6,0,6.283);g.fill();}g.globalCompositeOperation='source-over';
  const bp=(t%23)/23;if(bp<.35){const p=bp/.35;g.strokeStyle='rgba(40,30,40,.7)';g.lineWidth=1.4;for(let k=0;k<3;k++)birdV(g,w*(-.05+1.1*p)-k*18,h*.18+k*8+Math.sin(p*20+k)*3,Math.sin(t*8+k)*3);}};
function drawBackground(g,w,h,t,dt,th){th=th||'battle';ensureScenery(th,w,h);(DRAW[th]||DRAW.battle)(g,w,h,t,dt);}
""")
rep("drawBackground(g,W,H,t,dt);const v=g.createRadialGradient(W/2,H*.42", "drawBackground(g,W,H,t,dt,'battle');const v=g.createRadialGradient(W/2,H*.42")

# ---------------- blood
rep("/* ================= particles ================= */",
r"""/* ================= blood ================= */
const BL={s:[],ind:[],on:false};
function bloodHit(sx,sy){if(!settings.blood)return;const m=Math.min(W,H),n=4+Math.floor(Math.random()*4);
  for(let k=0;k<n;k++){const side=Math.floor(Math.random()*4),ins=rand(-.04,.16)*m;let x,y;if(side===0){x=rand(0,W);y=ins;}else if(side===1){x=W-ins;y=rand(0,H);}else if(side===2){x=rand(0,W);y=H-ins;}else{x=ins;y=rand(0,H);}BL.s.push(makeSplat(x,y,rand(.05,.14)*m));}
  if(Math.random()<.7)BL.s.push(makeSplat(rand(W*.25,W*.75),rand(H*.2,H*.8),rand(.025,.05)*m));
  while(BL.s.length>30)BL.s.shift();BL.ind.push({a:Math.atan2(sy-H/2,sx-W/2),t0:now()});BL.on=true;}
function makeSplat(x,y,r){const S=Math.ceil(r*4.4),c=document.createElement('canvas');c.width=c.height=Math.ceil(S*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);const cx=S/2,cy=S/2;
  const blob=(bx,by,br,n,jit)=>{g.beginPath();for(let k=0;k<=n;k++){const a=k/n*6.283,rr=br*(1+rand(-jit,jit)),px=bx+Math.cos(a)*rr,py=by+Math.sin(a)*rr;k?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();};
  g.fillStyle='rgba(92,0,0,.9)';const ns=4+Math.floor(Math.random()*6);for(let k=0;k<ns;k++){const a=rand(0,6.283),l=rand(r*.9,r*2),w=rand(r*.06,r*.16);g.save();g.translate(cx,cy);g.rotate(a);g.beginPath();g.ellipse(l*.55,0,l*.55,w,0,0,6.283);g.fill();g.restore();}
  const gr=g.createRadialGradient(cx-r*.2,cy-r*.2,r*.1,cx,cy,r*1.15);gr.addColorStop(0,'rgba(140,8,8,.96)');gr.addColorStop(.7,'rgba(98,0,0,.96)');gr.addColorStop(1,'rgba(58,0,0,.96)');g.fillStyle=gr;blob(cx,cy,r,18,.28);
  g.fillStyle='rgba(120,4,4,.9)';blob(cx+r*.1,cy+r*.05,r*.55,12,.3);
  g.fillStyle='rgba(100,0,0,.92)';const nd=8+Math.floor(Math.random()*10);for(let k=0;k<nd;k++){const a=rand(0,6.283),d=rand(r*1.05,r*2),rr=rand(r*.03,r*.14);g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,rr,0,6.283);g.fill();}
  g.fillStyle='rgba(255,190,190,.11)';g.beginPath();g.ellipse(cx-r*.3,cy-r*.35,r*.35,r*.16,-.5,0,6.283);g.fill();
  const drips=[];const nk=1+Math.floor(Math.random()*3);for(let k=0;k<nk;k++)drips.push({ox:rand(-r*.6,r*.6),len:0,max:rand(r*.8,r*3.2),sp:rand(10,34),w:rand(r*.07,r*.15)});
  return{x,y,r,S,img:c,drips};}
function drawBlood(dt){if(!BL.on||!G)return;const c=$('#blood'),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  if(G.hp>=99.5&&!BL.ind.length&&!G.dead){BL.s.length=0;BL.on=false;c.style.opacity=0;return;}
  c.style.opacity=1;g.globalAlpha=G.dead?1:clamp((100-G.hp)/50,0,1);
  for(const s of BL.s){g.drawImage(s.img,s.x-s.S/2,s.y-s.S/2,s.S,s.S);g.fillStyle='rgba(88,0,0,.92)';for(const d of s.drips){if(d.len<d.max)d.len=Math.min(d.max,d.len+d.sp*dt*(1-d.len/d.max*.7));const x=s.x+d.ox,y=s.y+s.r*.4;g.fillRect(x-d.w/2,y,d.w,d.len);g.beginPath();g.arc(x,y+d.len,d.w*.75,0,6.283);g.fill();}}
  g.globalAlpha=1;const tn=now(),m=Math.min(W,H);BL.ind=BL.ind.filter(i=>tn-i.t0<1.8);
  for(const i of BL.ind){const a=1-(tn-i.t0)/1.8;g.strokeStyle=`rgba(230,30,30,${a*.85})`;g.lineWidth=12;g.lineCap='round';g.shadowColor='rgba(255,0,0,.8)';g.shadowBlur=16;g.beginPath();g.arc(W/2,H/2,m*.3,i.a-.32,i.a+.32);g.stroke();g.shadowBlur=0;}}

/* ================= particles ================= */""")

# ---------------- drawGame changes
rep("const g=ctx;g.setTransform(dpr,0,0,dpr,0,0);drawBackground(g,W,H,t,dt);", "const g=ctx;g.setTransform(dpr,0,0,dpr,0,0);drawBackground(g,W,H,t,dt,G.theme.bg);")
rep("const fg=g.createLinearGradient(0,BY-pad,0,BY+BH+pad);fg.addColorStop(0,'#323b43');fg.addColorStop(1,'#14191e');g.fillStyle=fg;g.fill();g.restore();",
    "const FR=[['#323b43','#14191e'],['#8a6a44','#46301c'],['#1d1428','#07040c']][G.tileset];const fg=g.createLinearGradient(0,BY-pad,0,BY+BH+pad);fg.addColorStop(0,FR[0]);fg.addColorStop(1,FR[1]);g.fillStyle=fg;g.fill();g.restore();\n  if(G.tileset===2){g.save();const nc=`hsl(${(t*60)%360},100%,62%)`;g.strokeStyle=nc;g.lineWidth=2;g.shadowColor=nc;g.shadowBlur=16;rr(g,BX-pad+3,BY-pad+3,BW+pad*2-6,BH+pad*2-6,pad*.5);g.stroke();g.restore();}")
rep("g.fillStyle='#596570';for(const[x,y]of[[BX-pad/2,BY-pad/2],[BX+BW+pad/2,BY-pad/2],[BX-pad/2,BY+BH+pad/2],[BX+BW+pad/2,BY+BH+pad/2]]){g.beginPath();g.arc(x,y,Math.max(1.5,pad*.16),0,6.283);g.fill();}",
    "if(G.tileset!==2){g.fillStyle=G.tileset===1?'#c49a62':'#596570';for(const[x,y]of[[BX-pad/2,BY-pad/2],[BX+BW+pad/2,BY-pad/2],[BX-pad/2,BY+BH+pad/2],[BX+BW+pad/2,BY+BH+pad/2]]){g.beginPath();g.arc(x,y,Math.max(1.5,pad*.16),0,6.283);g.fill();}}")
rep("if(BY-pad-8>0)g.fillText(`SECTOR B-4  //  FIELD 01 OF 87  //  ${G.cols}×${G.rows}`,BX-pad,BY-pad-8);",
    "if(BY-pad-8>0)g.fillText(`${G.theme.name.toUpperCase()}  //  FIELD ${String(G.field).padStart(2,'0')} OF 87  //  ${G.cols}×${G.rows}`,BX-pad,BY-pad-8);")
rep("  g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.globalCompositeOperation='lighter';",
    "  if(G.tileset===2){const bb=t*124/60,pulse=Math.exp(-(bb%1)*5),ins=T*.14;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<G.n;i++){const s=G.st[i],c=i%G.cols,r=(i/G.cols)|0,hue=(c*28+r*46+t*70)%360;if(s===0||s===2){g.fillStyle=`hsla(${hue},100%,58%,${.14+.2*pulse})`;g.fillRect(BX+c*T+ins,BY+r*T+ins,T-2*ins,T-2*ins);}else if(s===1&&tn>=G.revAt[i]){g.fillStyle=`hsla(${hue},100%,58%,${.03+.05*pulse})`;g.fillRect(BX+c*T,BY+r*T,T,T);}}g.restore();}\n  g.save();g.beginPath();g.rect(BX,BY,BW,BH);g.clip();g.globalCompositeOperation='lighter';")
rep("  drawCompass(t);drawMinimap(t);drawWave();", "  drawCompass(t);drawMinimap(t);drawWave();drawBlood(dt);")

# ---------------- gameUpdate
rep("if(!G.over&&!G.dead&&settings.chatter!=='off'&&!radioActive().length&&G.clock>=VM.next){const id=nextChatter();if(id&&bark(id,null,0,{chatter:true}))VM.next=G.clock+60;else VM.next=G.clock+1;}",
    "if(!G.over&&!G.dead&&settings.chatter!=='off'&&!radioActive().length&&G.clock>=VM.next){const id=VM.queued||nextChatter();VM.queued=null;if(id&&VOICES[id]&&bark(id,null,0,{chatter:true})){VM.next=G.clock+60;VM.queued=nextChatter();decodeOne(VM.queued);}else VM.next=G.clock+1;}")
rep("if(idle>13&&G.idle===0){G.idle=1;bark('r_idle','idle',30,{});}if(idle>20&&G.idle===1){G.idle=2;unlock('idle');}}",
    "if(idle>13&&G.idle===0){G.idle=1;bark(pick(['r_idle','r_idle2','j_idle']),'idle',30,{});}if(idle>20&&G.idle===1){G.idle=2;unlock('idle');}}\n  if(PROFILE.skill>0&&G.started&&!G.over&&!G.dead&&G.clock>=G.nextNag){G.nextNag=G.clock+80;bark('s_skill','sskill',70);}")

# ---------------- panels
rep("h+=`<div class=\"pn-h\">Main quest</div><div class=\"grid\"><div class=\"qc main\"><span class=\"qk\">MAIN · CMDR. REYES</span><span class=\"qn\">Operation: Clean Sweep</span><span class=\"qd\">Command has ordered you to clear Sector B-4 before the season ends. The season ends in 3 days, 14 hours. A glowing marker will tell you where to click, so you never have to think.</span>",
    "h+=`<div class=\"pn-h\">Main quest · ${esc(G.theme.ch)}</div><div class=\"grid\"><div class=\"qc main\"><span class=\"qk\">MAIN · ${esc(G.theme.giver)}</span><span class=\"qn\">${esc(G.theme.op)}</span><span class=\"qd\">${esc(G.theme.desc)}</span>")
rep("$('#pz-s').textContent=`Sector B-4 · ${DIFFS[G.dkey].label} · ${$('#timer').textContent}`;", "$('#pz-s').textContent=`${G.theme.name} · ${DIFFS[G.dkey].label} · ${$('#timer').textContent}`;")
rep("else if(p==='restart'){$('#pause').hidden=true;startGame(G.dkey,true);}", "else if(p==='restart'){$('#pause').hidden=true;startGame(G.dkey,true,G.field);}")
rep("<label for=\"s-mb\">Motion blur</label>",
    "<label for=\"s-blood\">Blood</label><select id=\"s-blood\" data-set=\"blood\"><option value=\"1\" ${settings.blood?'selected':''}>On (cinematic)</option><option value=\"0\" ${settings.blood?'':'selected'}>Off</option></select>\n      <label for=\"s-mb\">Motion blur</label>")
rep("saveSettings();setVol();$('#fx-grain').classList.toggle('off',!settings.grain);",
    "saveSettings();setVol();$('#fx-grain').classList.toggle('off',!settings.grain);if(k==='blood'&&!settings.blood){BL.s.length=0;BL.ind.length=0;BL.on=false;$('#blood').style.opacity=0;}")

open(P, 'w').write(s)
print('patched OK')
