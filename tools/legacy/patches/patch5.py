import sys
P = '/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/template.html'
s = open(P).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        print('ANCHOR FAIL', n, repr(a[:140])); sys.exit(1)
    s = s.replace(a, b)
def between(start, end, new):
    global s
    i = s.find(start); j = s.find(end, i + 1)
    if i < 0 or j < 0 or s.count(start) != 1:
        print('BETWEEN FAIL', i, j, repr(start[:80])); sys.exit(1)
    s = s[:i] + new + s[j:]

# ---------- CSS / HTML
rep("#fx-vig,#fx-dmg,#fx-grain{position:absolute;pointer-events:none}", "#fx-vig,#fx-dmg,#fx-grain,#fx-water{position:absolute;pointer-events:none}")
rep("#game.dying #cv{filter:grayscale(1) brightness(.5) blur(2px)}",
    "#game.dying #cv{filter:grayscale(1) brightness(.5) blur(2px)}\n"
    "#fx-water{inset:0;opacity:0;transition:opacity 2.5s ease;background:radial-gradient(ellipse at 50% -10%,rgba(140,230,255,.22),transparent 55%),linear-gradient(180deg,rgba(0,90,120,.2),rgba(0,30,60,.42))}\n"
    "#game.flooded #fx-water{opacity:1}\n#game.flooded #cv{filter:blur(1px) saturate(1.2) brightness(.92)}\n#game.flooded.lowhp #cv{filter:blur(1px) saturate(.3) brightness(.9)}\n"
    "#game.flooded #fx-vig{background:radial-gradient(ellipse at 50% 46%,transparent 40%,rgba(0,30,50,.78) 100%)}")
rep('<div id="fx-vig"></div><canvas id="blood"></canvas>', '<div id="fx-vig"></div><div id="fx-water"></div><canvas id="blood"></canvas>')

# ---------- data
rep("{bg:'battle',name:'Sector B-4',", "{bg:'battle',ts:0,mus:'game',ach:null,name:'Sector B-4',")
rep("{bg:'desert',name:'The Dune Sea',", "{bg:'desert',ts:1,mus:'desert',ach:'ch2',name:'The Dune Sea',")
rep("{bg:'club',name:'Da Club',", "{bg:'club',ts:2,mus:'club',ach:'ch3',name:'Da Club',")
rep("{bg:'arctic',name:'Station Nord-7',", "{bg:'arctic',ts:3,mus:'arctic',ach:'ch4',name:'Station Nord-7',")
rep("win:['ra_win','r_win2']", "win:['ra_win2','r_win2']")
rep("  {bg:'home',name:\"Mom's Backyard\",ch:'CHAPTER FIVE',",
    "  {bg:'pathos',ts:5,mus:'pathos',ach:'chP',name:'Pathos-4',ch:'CHAPTER FIVE',op:'Operation: Deep Sweep',time:'−300 M · HULL INTEGRITY 40%',vo:'a_ch5p',start:'rp_start',win:['rp_win','hc_win'],giver:'CMDR. REYES',desc:'An underwater research base is flooding, and it is full of mines. Clear it before the water reaches the ceiling. Or after. Command is not your mother.'},\n"
    "  {bg:'home',ts:4,mus:'home',ach:'ch5',name:\"Mom's Backyard\",ch:'CHAPTER SIX',")
rep("vo:'a_ch5',start:'mh_start'", "vo:'a_ch6',start:'mh_start'")
rep("skipcred:['Ungrateful','Skip the credits.',0],",
    "skipcred:['Ungrateful','Skip the credits.',0], chP:['Pressure Test','Clear Pathos-4.',25], dryrun:['Dry Run','Clear Pathos-4 before it floods.',25], breath:['Breathtaking','Clear Pathos-4 while holding your breath.',25],")
rep("  sys:{name:'SYSTEM',tag:'',color:'#8fd3ff',radio:false},",
    "  halcyon:{name:'HALCYON',tag:'PATHOS-4 STATION AI',chan:4,color:'#6fe3d6',radio:true,pa:true},\n  sys:{name:'SYSTEM',tag:'',color:'#8fd3ff',radio:false},")
rep("brg:15,dist:'12 m',act:'TRACK'},\n};",
    "brg:15,dist:'12 m',act:'TRACK'},\n  halcyon:{name:'Rate Your Stay',giver:'HALCYON',who:'halcyon',desc:'The station AI would like you to rate your stay at Pathos-4. Before you drown, ideally.',obj:()=>'Leave a 5-star review · Not implemented',brg:270,dist:'300 m ↑',act:'TRACK'},\n};")
rep("dh_1:'club'};", "dh_1:'club',kp_1:'kova',dp_1:'club',mp_1:'mom',qp_1:'qm',wp_1:'whisper',hc_1:'halcyon'};")
rep("  home:{open:['mh_1','rh_1'],",
    "  pathos:{open:['hc_1','jp_1'],fav:['halcyon','reyes'],arcs:{halcyon:['hc_1','hc_2','hc_3'],reyes:['rp_1'],jenkins:['jp_1','jp_2'],kova:['kp_1','kp_2'],dez:['dp_1'],mom:['mp_1'],qm:['qp_1'],whisper:['wp_1','wp_2']}},\n  home:{open:['mh_1','rh_1'],")
rep("'m_4','r_half','a_complete']);", "'m_4','r_half','a_complete','rp_2','rp_flood','hc_flood','s_flood','s_breach']);")
rep("  'Health does not regenerate faster at home. Mom says it does.',",
    "  'Health does not regenerate faster at home. Mom says it does.',\n  'When the base floods, hold your breath. You do not need to actually hold your breath.',")
rep("  \"Recipe card in Mom's handwriting: 'Casserole. Serves 4, or 1 sweeper.'\",",
    "  \"Recipe card in Mom's handwriting: 'Casserole. Serves 4, or 1 sweeper.'\",\n  \"Maintenance log, Pathos-4: 'Leak in section C. Logged it. Leak is now in sections C through Z.'\",")

# ---------- game state
rep("tileset:(field-1)%5,", "tileset:FI(field).ts,floodStart:3,floodTotal:{story:90,normal:210,veteran:420}[dkey]||210,floodP:0,flooded:false,breath:100,nextKlax:4,lastTick:-1,nextBub:0,")
rep("function fieldMusic(){return['game','desert','club','arctic','home'][((G?G.field:1)-1)%5];}", "function fieldMusic(){return G?G.theme.mus:'game';}")
rep("const ck=[null,'ch2','ch3','ch4','ch5'][(f-1)%5];if(ck)unlock(ck);", "if(G.theme.ach)unlock(G.theme.ach);if(G.theme.bg==='pathos')unlock(G.flooded?'breath':'dryrun');")
rep("closeOverlays();stopAllVoices();newField(dkey,field);", "closeOverlays();stopAllVoices();unmuffle();newField(dkey,field);")
rep("stopAllVoices();show('title');", "stopAllVoices();unmuffle();show('title');")
rep("musicStop();stopAllVoices();closeOverlays();G=null;show('desktop');", "musicStop();stopAllVoices();unmuffle();closeOverlays();G=null;show('desktop');")
rep("stopAllVoices();closeOverlays();await fadeTo(1,800);", "stopAllVoices();unmuffle();closeOverlays();await fadeTo(1,800);")
rep("  $('#q-obj').innerHTML=o.map", "  if(G.theme.bg==='pathos')o.splice(1,0,[G.flooded?'Hold your breath (indefinitely)':'Clear the base before it floods','',G.won&&!G.flooded]);\n  $('#q-obj').innerHTML=o.map")

# ---------- audio
rep("A.revS=ctx.createConvolver(); A.revS.buffer=makeIR(1.7); A.revS.connect(A.sfx); A.sendS=ctx.createGain(); A.sendS.gain.value=.5; A.sendS.connect(A.revS);",
    "A.revS=ctx.createConvolver(); A.revS.buffer=makeIR(1.7); A.revS.connect(A.sfx); A.sendS=ctx.createGain(); A.sendS.gain.value=.5; A.sendS.connect(A.revS);\n  A.revL=ctx.createConvolver(); A.revL.buffer=makeIR(6.5); A.revL.connect(A.duck); A.sendL=ctx.createGain(); A.sendL.gain.value=.85; A.sendL.connect(A.revL); A.mufBase=19000;")
rep("f.exponentialRampToValueAtTime(19000,t+2.9);", "f.exponentialRampToValueAtTime(A.mufBase||19000,t+2.9);")
rep("arctic:60/66/2,home:60/88/2};", "arctic:60/66/2,home:60/88/2,pathos:60/62/2};")
rep("const PROG={arctic:", "const PROG={pathos:[[41,'M'],[43,'M'],[45,'m'],[43,'M']],arctic:")
rep("const CH7={maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10]};", r"""const CH7={maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10]};
const PMEL=[[77,0,0,76,72,0,0,0],[74,0,71,0,74,76,0,0],[76,0,72,0,69,0,0,71],[74,0,0,0,0,0,0,0]];
const OMEL=[[0,0,65,0,0,67,0,0],[0,0,71,0,0,69,0,0],[0,0,69,0,0,64,0,0],[0,0,67,0,0,0,0,0]];
function flute(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),o2=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),g2=c.createGain();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f;l.frequency.value=4.8;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.012,t+dur*.6);l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);
  env(g,t,.18,vol,dur,.35);g.connect(A.duck);g.connect(A.sendL);o.start(t);o2.start(t);l.start(t);const st=t+dur+3;o.stop(st);o2.stop(st);l.stop(st);nz(t,dur,vol*.18,A.duck,{type:'bandpass',f:f*1.5,q:2,a:.1,rel:.3,send:A.sendL});}
function ocarina(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.value=f;l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.008,t+dur*.5);l.connect(lg);lg.connect(o.frequency);env(g,t,.07,vol,dur,.3);o.connect(g);g.connect(A.duck);g.connect(A.sendL);o.start(t);l.start(t);o.stop(t+dur+3);l.stop(t+dur+3);osc('sine',f*3,t,dur,vol*.06,A.duck,{a:.07,rel:.2});}
function harp(f,t,vol){osc('triangle',f,t,.02,vol,A.duck,{rel:.9,send:A.sendL});osc('sine',f*2,t,.01,vol*.3,A.duck,{rel:.4,send:A.sendL});}""")
rep("  }else if(mode==='arctic'){", r"""  }else if(mode==='pathos'){const bar=Math.floor(s/8)%4,st=s%8,ph=Math.floor(s/32),[r,q]=PROG.pathos[bar],tr=triad(r,q);
    if(st===0){softpad([...tr.map(m=>m+12),bar===0?r+18:r+24],t,STEP.pathos*8,.022);osc('sine',n2f(r-12),t,STEP.pathos*8,.08,A.duck,{a:1.5,rel:1.2,send:A.sendL});
      if(bar%2===0)nz(t,STEP.pathos*16,.02,A.duck,{type:'lowpass',f:380,q:.7,a:STEP.pathos*6,rel:1.5});
      if(bar===0&&ph%4===3){const c=A.ctx,o=c.createOscillator(),gg=c.createGain();o.type='sine';o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(150,t+1.6);o.frequency.exponentialRampToValueAtTime(270,t+3.2);env(gg,t,.6,.02,2.8,.6);o.connect(gg);gg.connect(A.sendL);gg.connect(A.duck);o.start(t);o.stop(t+7);}}
    const v4=[tr[0]+24,tr[1]+24,tr[2]+24,tr[0]+36],ap=[0,1,2,3,2,1,0,1];harp(n2f(v4[ap[st]]),t,.03);
    const m=PMEL[bar][st];if(m&&ph%2===0)flute(n2f(m),t,STEP.pathos*(PMEL[bar][st+1]===0?2.6:1.6),.05);
    const oc=OMEL[bar][st];if(oc&&ph%2===1)ocarina(n2f(oc+12),t,STEP.pathos*2.4,.05);
  }else if(mode==='arctic'){""")
rep("  crate(){if(!this.ok())return;", r"""  klaxon(){if(!this.ok())return;const t=this.t();osc('square',620,t,.35,.032,A.sfx,{lp:1400,rel:.05});osc('square',480,t+.38,.35,.032,A.sfx,{lp:1400,rel:.05});},
  tick(){if(!this.ok())return;osc('sine',1500,this.t(),.04,.08,A.sfx,{rel:.03});},
  bubble(){if(!this.ok())return;const t=this.t();for(let i=0;i<3;i++)osc('sine',rand(300,500),t+i*.07,.06,.04,A.sfx,{glide:rand(900,1400),gt:.06,rel:.04});},
  flood(){if(!this.ok())return;const t=this.t();nz(t,3,.5,A.sfx,{type:'lowpass',f:2500,f2:200,q:.6,a:.3,rel:1,send:A.sendS});osc('sine',45,t,3,.5,A.sfx,{a:.4,rel:1});for(let i=0;i<14;i++)osc('sine',rand(250,600),t+.3+Math.random()*2.5,.06,.05,A.sfx,{glide:rand(900,1500),gt:.06,rel:.04});},
  crate(){if(!this.ok())return;""")

# ---------- particles
rep("      case 'confetti':", "      case 'bubble':{g.globalCompositeOperation='source-over';p.x+=Math.sin(p.life*3+p.ph)*.4;g.strokeStyle=`rgba(200,245,255,${Math.min(1,a*1.4)*.55})`;g.lineWidth=1;g.beginPath();g.arc(p.x,p.y,p.s,0,6.283);g.stroke();g.fillStyle=`rgba(255,255,255,${a*.5})`;g.fillRect(p.x-p.s*.4,p.y-p.s*.45,Math.max(1,p.s*.35),Math.max(1,p.s*.35));break;}\n      case 'confetti':")
rep("  G.shake=RM?3:17;\n}", "  G.shake=RM?3:17;\n  if(G.flooded)for(let k=0;k<40;k++)bubbleAt(x+rand(-T,T),y+rand(-T,T),rand(2,6));\n}")

# ---------- flood logic
rep("function startClub(){", r"""function bubbleAt(x,y,sz){emit({t:'bubble',x,y,vx:rand(-10,10),vy:-rand(40,120),g:-20,drag:.4,life:rand(2,5),s:sz||rand(1.5,5),ph:rand(0,6)});}
function unmuffle(){if(!A.ctx)return;A.mufBase=19000;const f=A.muf.frequency,t=A.ctx.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setTargetAtTime(19000,t,.25);}
function floodNow(){G.flooded=true;G.floodP=1;$('#game').classList.add('flooded');S.flood();
  if(A.ctx){A.mufBase=1200;const f=A.muf.frequency,t=A.ctx.currentTime;f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);f.setTargetAtTime(1200,t,.9);}
  banner('BASE FLOODED','HOLD YOUR BREATH','Breath meter enabled','#6fe3d6');sched(1.6,()=>bark('rp_flood','rpflood',999,{}));sched(10,()=>bark('hc_flood','hcflood',999,{}));
  VM.opening.push('rp_3','jp_3','mp_2');VM.next=Math.max(VM.next,G.clock+14);G.shake=RM?2:8;for(let k=0;k<120;k++)bubbleAt(rand(0,W)-CAM.x,H+rand(0,80),rand(2,7));updateHUD();}
function makeCaustics(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),id=g.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N*6.283,v=y/N*6.283;let q=Math.sin(u*3+Math.sin(v*2)*1.5)+Math.sin(v*3+Math.sin(u*2+1)*1.5)+Math.sin((u+v)*2+Math.sin(u-v)*1.2);const val=Math.pow(1-Math.min(1,Math.abs(q)/1.2),4),k=(y*N+x)*4;id.data[k]=180*val;id.data[k+1]=240*val;id.data[k+2]=255*val;id.data[k+3]=255;}
  g.putImageData(id,0,0);SC.cau=c;return c;}
function drawUnderwater(g,t){g.save();g.globalCompositeOperation='lighter';const cs=SC.cau||makeCaustics();g.globalAlpha=.07;
  for(const[ox,oy,sp]of[[t*14,t*9,1],[-t*11,t*13,1.3]]){const s2=512*sp,x0=-(((ox%s2)+s2)%s2),y0=-(((oy%s2)+s2)%s2);for(let x=x0;x<W;x+=s2)for(let y=y0;y<H;y+=s2)g.drawImage(cs,x,y,s2,s2);}
  g.globalAlpha=1;for(let k=0;k<4;k++){const x=W*(.12+.26*k)+Math.sin(t*.2+k)*60,gr=g.createLinearGradient(x,0,x+W*.12,H);gr.addColorStop(0,'rgba(160,230,255,.1)');gr.addColorStop(1,'rgba(160,230,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x-30,0);g.lineTo(x+40,0);g.lineTo(x+W*.2,H);g.lineTo(x+W*.08,H);g.closePath();g.fill();}
  g.restore();}
function startClub(){""")
rep("  if(G.club>0){G.club-=dt;if(G.club<=0)endClub();}", r"""  if(G.theme.bg==='pathos'&&!G.over){const el=G.clock-G.floodStart;G.floodP=clamp(el/G.floodTotal,0,1);
    if(!G.flooded){const rem=G.floodTotal-el;
      if(el>=12&&!G.breachSaid){G.breachSaid=true;bark('s_breach','sbreach',999,{});}
      if(G.clock>=G.nextKlax&&el>0){G.nextKlax=G.clock+8;S.klaxon();}
      if(rem<=30&&!G.warn30){G.warn30=true;say('s_flood');sched(1.2,()=>bark('rp_2','rp2',999,{}));banner('FLOODING IMMINENT','30 SECONDS','Take a deep breath','#ff6b4a');}
      if(rem<=10&&rem>0){const sec=Math.ceil(rem);if(sec!==G.lastTick){G.lastTick=sec;S.tick();}}
      if(rem<=30&&Math.random()<dt*8)bubbleAt(BX+rand(0,BW),BY+BH+rand(0,20));
      if(rem<=0)floodNow();}
    else{G.breath=Math.max(0,G.breath-dt*4);if(G.breath===0&&!G.breathZero){G.breathZero=true;addFeed('<b>BREATH 0%</b> · Hold-your-breath assist enabled','gold');}
      if(Math.random()<dt*10)bubbleAt(rand(0,W)-CAM.x,H+10);if(G.clock>=G.nextBub){G.nextBub=G.clock+rand(2,5);S.bubble();}}}
  if(G.club>0){G.club-=dt;if(G.club<=0)endClub();}""")

# ---------- drawing
rep("if(settings.sway&&!RM){cx=Math.sin(t*.37)*1.5;cy=Math.cos(t*.29)*1.1;}", "if(settings.sway&&!RM){cx=Math.sin(t*.37)*1.5;cy=Math.cos(t*.29)*1.1;}if(G.flooded&&!RM){cx+=Math.sin(t*.55)*3.5;cy+=Math.cos(t*.42)*2.5;}")
rep("['#7a4e2c','#3f2614']][G.tileset];", "['#7a4e2c','#3f2614'],['#3f5f63','#14262a']][G.tileset];")
rep("['#596570','#c49a62','','#e6f4fb','#c7a27a'][G.tileset]", "['#596570','#c49a62','','#e6f4fb','#c7a27a','#9fc3c0'][G.tileset]")
rep("if(BY-pad-8>0)g.fillText(`${G.theme.name.toUpperCase()}", "if(BY-pad-8>0&&!(G.theme.bg==='pathos'&&BW<560))g.fillText(`${G.theme.name.toUpperCase()}")
rep("g.textAlign='right';if(BY-pad-8>0)g.fillText(G.over?'THREAT: CLEARED':`THREAT: ${G.mines} MINES`,BX+BW+pad,BY-pad-8);",
r"""g.textAlign='right';
  if(G.theme.bg==='pathos'&&!G.won){const rem=Math.max(0,G.floodTotal-(G.clock-G.floodStart)),big=BW>=560;let txt,col;
    if(!G.flooded){txt=`FLOODING IN ${String(Math.floor(rem/60)).padStart(2,'0')}:${String(Math.floor(rem%60)).padStart(2,'0')}`;col=rem<30?`rgb(255,${(80+90*Math.abs(Math.sin(t*6)))|0},70)`:'#ff8a5c';
      const gx=BX+BW+pad*.35,gw=Math.max(3,pad*.3);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(gx,BY,gw,BH);g.fillStyle='rgba(80,210,240,.8)';g.fillRect(gx,BY+BH*(1-G.floodP),gw,BH*G.floodP);}
    else{txt=G.breath>0?`UNDERWATER · BREATH ${Math.ceil(G.breath)}%`:(big?'BREATH 0% · YOU ARE FINE · THIS IS A VIDEO GAME':'BREATH 0% · YOU ARE FINE');col='#8ff0ff';}
    if(BY-pad-6>0){g.font=`600 ${big?22:16}px Teko, "Arial Narrow", sans-serif`;g.fillStyle=col;g.shadowColor=col;g.shadowBlur=10;g.fillText(txt,BX+BW+pad,BY-pad-6);g.shadowBlur=0;}}
  else if(BY-pad-8>0)g.fillText(G.over?'THREAT: CLEARED':`THREAT: ${G.mines} MINES`,BX+BW+pad,BY-pad-8);""")
rep("  drawCompass(t);drawMinimap(t);drawWave();drawBlood(dt);", "  if(G.flooded)drawUnderwater(g,t);\n  drawCompass(t);drawMinimap(t);drawWave();drawBlood(dt);")

# ---------- tileset
rep("const vh=i=>((i*2654435761)>>>0)%SPR.nv;", r"""function plateSub(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#77a3a2':'#5c8483');gr.addColorStop(.55,hover?'#517a79':'#3f6262');gr.addColorStop(1,hover?'#385857':'#2a4444');g.fillStyle=gr;g.fillRect(0,0,s,s);
  speck(g,s,s*s/14,'rgba(190,110,50,.35)','rgba(20,40,40,.3)');
  if(Math.random()<.6){const x=rand(s*.2,s*.8),rg=g.createLinearGradient(0,s*.15,0,s*.75);rg.addColorStop(0,'rgba(170,90,40,.5)');rg.addColorStop(1,'rgba(170,90,40,0)');g.fillStyle=rg;g.fillRect(x-s*.03,s*.15,s*.06,s*.6);}
  const al=g.createLinearGradient(0,s*.68,0,s);al.addColorStop(0,'rgba(60,140,80,0)');al.addColorStop(1,'rgba(60,140,80,.5)');g.fillStyle=al;g.fillRect(0,s*.68,s,s*.32);
  bevel(g,s,b,'rgba(200,240,235,.35)','rgba(5,20,22,.6)');
  for(const[x,y]of[[b*2,b*2],[s-b*2,b*2],[b*2,s-b*2],[s-b*2,s-b*2]]){g.fillStyle='rgba(15,30,30,.85)';g.beginPath();g.arc(x,y,Math.max(1,s*.045),0,6.283);g.fill();g.fillStyle='rgba(220,255,250,.35)';g.fillRect(x-s*.02,y-s*.025,Math.max(1,s*.02),Math.max(1,s*.02));}
  for(let k=0;k<3;k++)if(Math.random()<.7){g.fillStyle='rgba(220,255,255,.35)';g.beginPath();g.ellipse(rand(b*2,s-b*2),rand(b*2,s-b*2),s*.02,s*.03,0,0,6.283);g.fill();}
  g.strokeStyle='rgba(5,15,15,.7)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
function openSub(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#0a2c35');gr.addColorStop(1,'#04161c');g.fillStyle=gr;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(120,200,210,.08)';g.lineWidth=1;for(let k=-s;k<s;k+=Math.max(4,s/6)){g.beginPath();g.moveTo(k,s);g.lineTo(k+s,0);g.stroke();}
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(140,230,240,.1)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
const vh=i=>((i*2654435761)>>>0)%SPR.nv;""")
rep("ts===4?plateLawn(s,false,d):plate(s,false)", "ts===4?plateLawn(s,false,d):ts===5?plateSub(s,false):plate(s,false)")
rep("SPR.nv=(ts===1||ts===3||ts===4)?4:1;", "SPR.nv=(ts===1||ts===3||ts===4||ts===5)?4:1;")
rep("ts===4?plateLawn(s,true,false):plate(s,true)", "ts===4?plateLawn(s,true,false):ts===5?plateSub(s,true):plate(s,true)")
rep("ts===4?openLawn(s):openTile(s)", "ts===4?openLawn(s):ts===5?openSub(s):openTile(s)", 2)

# ---------- portrait
rep("g.fillStyle=bg;g.fillRect(0,0,84,84);",
    "g.fillStyle=bg;g.fillRect(0,0,84,84);\n  if(who==='halcyon'){g.strokeStyle=col;g.lineWidth=2;for(let k=0;k<3;k++){g.globalAlpha=.9-k*.25;g.beginPath();g.arc(42,42,12+k*9,0,6.283);g.stroke();}g.globalAlpha=1;g.fillStyle=col;g.shadowColor=col;g.shadowBlur=14;g.beginPath();g.arc(42,42,7,0,6.283);g.fill();g.shadowBlur=0;g.fillStyle='#fff';g.beginPath();g.arc(39,39,2,0,6.283);g.fill();return;}")

# ---------- scenery
rep("function drawBackground(g,w,h,t,dt,th){", r"""BUILD.pathos=(w,h)=>{SC.st=bake(w,h,g=>{
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0e1f25');gr.addColorStop(.6,'#0a171b');gr.addColorStop(1,'#050b0d');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(150,210,210,.06)';g.lineWidth=2;for(let x=60;x<w;x+=140){g.beginPath();g.moveTo(x,h*.13);g.lineTo(x,h*.86);g.stroke();}
  for(const y of[h*.13,h*.86]){g.fillStyle='rgba(150,210,210,.07)';g.fillRect(0,y,w,3);}
  const R=Math.max(34,Math.min(w,h)*.085);SC.x.ports=[[w*.07,h*.44],[w*.93,h*.44],[w*.07,h*.7],[w*.93,h*.7],[w*.3,h*.3],[w*.7,h*.3]].map(([x,y])=>({x,y,r:R}));
  for(const p of SC.x.ports){const ring=g.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,p.r*.2,p.x,p.y,p.r*1.25);ring.addColorStop(0,'#6d8c8f');ring.addColorStop(1,'#1d2d30');g.fillStyle=ring;g.beginPath();g.arc(p.x,p.y,p.r*1.22,0,6.283);g.fill();
    const gl=g.createLinearGradient(0,p.y-p.r,0,p.y+p.r);gl.addColorStop(0,'#0f4a6a');gl.addColorStop(1,'#03141f');g.fillStyle=gl;g.beginPath();g.arc(p.x,p.y,p.r,0,6.283);g.fill();
    g.fillStyle='#1a2629';for(let k=0;k<12;k++){const a=k/12*6.283;g.beginPath();g.arc(p.x+Math.cos(a)*p.r*1.11,p.y+Math.sin(a)*p.r*1.11,p.r*.045,0,6.283);g.fill();}}
  const pipe=(y,r)=>{const pg=g.createLinearGradient(0,y-r,0,y+r);pg.addColorStop(0,'#5d7376');pg.addColorStop(.5,'#2c3c3f');pg.addColorStop(1,'#141d1f');g.fillStyle=pg;g.fillRect(0,y-r,w,2*r);g.fillStyle='rgba(0,0,0,.4)';for(let x=80;x<w;x+=220)g.fillRect(x,y-r-2,10,2*r+4);};
  pipe(h*.05,10);pipe(h*.09,6);pipe(h*.93,9);
  g.strokeStyle='#a34a2a';g.lineWidth=3;for(const x of[w*.2,w*.8]){g.beginPath();g.arc(x,h*.05,14,0,6.283);g.stroke();g.beginPath();g.moveTo(x-14,h*.05);g.lineTo(x+14,h*.05);g.moveTo(x,h*.05-14);g.lineTo(x,h*.05+14);g.stroke();}
  const sy=h*.86;g.save();g.beginPath();g.rect(0,sy,w,10);g.clip();g.fillStyle='#c9a227';g.fillRect(0,sy,w,10);g.fillStyle='#1a1a1a';for(let x=-20;x<w+20;x+=24){g.beginPath();g.moveTo(x,sy+10);g.lineTo(x+12,sy);g.lineTo(x+24,sy);g.lineTo(x+12,sy+10);g.closePath();g.fill();}g.restore();
  g.strokeStyle='rgba(140,190,190,.08)';g.lineWidth=1;for(let x=0;x<w;x+=12){g.beginPath();g.moveTo(x,h*.87+4);g.lineTo(x+6,h);g.stroke();}
  g.font='700 13px "Chakra Petch",sans-serif';g.fillStyle='rgba(210,230,220,.32)';g.textAlign='left';g.fillText('PATHOS-4 · DECK C · −300 M',w*.03,h*.18);g.textAlign='right';g.fillText('WATERTIGHT DOOR 7 · KEEP CLOSED',w*.97,h*.18);g.textAlign='left';});
  SC.x.fish=Array.from({length:14},(_,i)=>({p:i%6,o:Math.random(),y:rand(-.6,.6),sp:rand(.03,.09)*(Math.random()<.5?1:-1),s:rand(.12,.28)}));
  SC.parts=Array.from({length:60},()=>({x:rand(0,w),y:rand(0,h),vy:-rand(15,45),s:rand(1,3.5),ph:rand(0,6)}));
  SC.x.drips=Array.from({length:10},()=>({x:rand(0,w),y:h*.1,v:0,wait:rand(0,4)}));if(!SC.cau)makeCaustics();};
DRAW.pathos=(g,w,h,t,dt)=>{g.drawImage(SC.st,0,0,w,h);const pth=G&&G.theme&&G.theme.bg==='pathos',p=pth?G.floodP:.35,fl=pth&&G.flooded;
  SC.x.ports.forEach((pt,pi)=>{g.save();g.beginPath();g.arc(pt.x,pt.y,pt.r,0,6.283);g.clip();
    for(const f of SC.x.fish){if(f.p!==pi)continue;f.o=(f.o+f.sp*dt+1)%1;const fx=pt.x-pt.r*1.4+f.o*pt.r*2.8,fy=pt.y+f.y*pt.r+Math.sin(t+f.o*9)*3,fs=pt.r*f.s,dir=Math.sign(f.sp);g.fillStyle='rgba(2,10,16,.75)';g.beginPath();g.ellipse(fx,fy,fs,fs*.45,0,0,6.283);g.fill();g.beginPath();g.moveTo(fx-dir*fs*.9,fy);g.lineTo(fx-dir*fs*1.5,fy-fs*.4);g.lineTo(fx-dir*fs*1.5,fy+fs*.4);g.closePath();g.fill();}
    g.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const a=t*.3+k*1.1+pi*2;g.fillStyle=`rgba(80,255,220,${.25+.2*Math.sin(t*2+k)})`;g.beginPath();g.arc(pt.x+Math.cos(a)*pt.r*.6,pt.y+Math.sin(a*1.3)*pt.r*.6,1.6,0,6.283);g.fill();}
    const sh=g.createLinearGradient(pt.x-pt.r,pt.y-pt.r,pt.x,pt.y);sh.addColorStop(0,'rgba(160,230,255,.18)');sh.addColorStop(1,'rgba(160,230,255,0)');g.fillStyle=sh;g.fillRect(pt.x-pt.r,pt.y-pt.r,pt.r*2,pt.r*2);g.restore();
    g.strokeStyle='rgba(220,250,255,.25)';g.lineWidth=2;g.beginPath();g.arc(pt.x,pt.y,pt.r*.82,Math.PI*1.1,Math.PI*1.45);g.stroke();});
  const wl=fl?-20:h*(1-.92*p);
  if(!fl){const a=(Math.sin(t*4)+1)/2;g.fillStyle=`rgba(255,30,20,${.04+.08*a})`;g.fillRect(0,0,w,h);g.fillStyle=`rgba(255,60,40,${.5+.5*a})`;g.beginPath();g.arc(w/2,h*.05,6,0,6.283);g.fill();
    g.fillStyle='rgba(170,230,255,.6)';for(const d of SC.x.drips){if(d.wait>0){d.wait-=dt;continue;}d.v+=500*dt;d.y+=d.v*dt;g.fillRect(d.x,d.y,1.5,5);if(d.y>wl){d.y=h*.1;d.v=0;d.wait=rand(1,5);d.x=rand(0,w);}}}
  const wy=x=>wl+Math.sin(x*.02+t*2)*4+Math.sin(x*.05-t*3)*2;
  g.save();g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+10;x+=10)g.lineTo(x,wy(x));g.lineTo(w,h);g.closePath();const wg=g.createLinearGradient(0,Math.max(0,wl),0,h);wg.addColorStop(0,'rgba(30,130,150,.38)');wg.addColorStop(1,'rgba(5,40,60,.62)');g.fillStyle=wg;g.fill();g.clip();
  g.globalCompositeOperation='lighter';g.globalAlpha=.08;const cs=SC.cau,s2=512,ox=((t*14)%s2+s2)%s2,oy=((t*6)%s2+s2)%s2;for(let x=-ox;x<w;x+=s2)for(let y=-oy;y<h;y+=s2)g.drawImage(cs,x,y,s2,s2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.strokeStyle='rgba(200,245,255,.45)';g.lineWidth=1;for(const b of SC.parts){b.y+=b.vy*dt;b.x+=Math.sin(t*2+b.ph)*.3;if(b.y<wl+4){b.y=h+5;b.x=rand(0,w);}g.beginPath();g.arc(b.x,b.y,b.s,0,6.283);g.stroke();}
  g.restore();
  if(!fl){g.strokeStyle='rgba(190,245,255,.55)';g.lineWidth=1.5;g.beginPath();for(let x=0;x<=w+10;x+=10){const y=wy(x);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}};
function drawBackground(g,w,h,t,dt,th){""")

# ---------- credits
rep("'Tile Artist, Lawn',", "'Tile Artist, Lawn','Tile Artist, Bulkhead','VFX Artist, Bubbles','VFX Artist, Caustics','Water Level Designer',")
rep("'Prof. Lindqvist','???'].map(c=>'Writer, '+c)", "'Prof. Lindqvist','HALCYON','???'].map(c=>'Writer, '+c)")
rep("  {make:tileSheet,cap:'Tiles, material study'},",
    "  {make:tileSheet,cap:'Tiles, material study'},\n  {make:sceneArt('pathos','PATHOS-4 · FLOOD STUDY','pathos4_flood_v4_wet.png',[[.05,.24,'wetter'],[.5,.08,'fish = free content',[.9,.42]],[.08,.93,'water level: rising (good)']]),cap:'Pathos-4, flood study'},")
between("function tileSheet(w,h){", "const ART=[",
r"""function tileSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'TILES · MATERIAL STUDY','Six materials, one hitbox');
  const s=Math.round(Math.min(w*.1,h*.15)),S=Math.max(8,Math.round(s*dpr));const num=numSprite(S,3);
  const sets=[[plate(S,false),openTile(S),'Steel','approved'],[plateSand(S,false),openSand(S),'Sandstone','more sand'],[plateClub(S,false),openClub(S),'Dance floor','BRIGHTER??'],[plateIce(S,false),openIce(S),'Ice','too slippery'],[plateSub(S,false),openSub(S),'Bulkhead','leaks (on purpose)'],[plateLawn(S,false,false),openLawn(S),'Lawn','Dad approved']];
  sets.forEach((st,i)=>{const x=w*(.06+.31*(i%3)),y=h*(.21+.37*Math.floor(i/3));g.drawImage(st[0],x,y,s,s);g.drawImage(st[1],x+s+6,y,s,s);g.drawImage(num,x+s+6,y,s,s);
    if(i===2){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,80,220,.4)';g.fillRect(x+s*.14,y+s*.14,s*.72,s*.72);g.globalCompositeOperation='source-over';}
    g.font=`600 ${Math.round(Math.max(9,h*.03))}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.fillText(st[2].toUpperCase(),x,y+s+h*.055);hand(g,st[3],x,y+s+h*.115,Math.max(11,Math.min(w*.022,h*.04)),i%2?INK_B:INK_R,-.04);});return c;}
""")

open(P, 'w').write(s)
print('patched OK')
