import sys
P = '/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/template.html'
s = open(P).read()
def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    if n != cnt:
        print('ANCHOR FAIL', n, repr(a[:140])); sys.exit(1)
    s = s.replace(a, b)

# fonts
rep("family=Audiowide&family=Chakra+Petch", "family=Audiowide&family=Caveat:wght@600;700&family=Chakra+Petch")

# CSS
rep("/* layouts chosen by script */", r"""/* credits */
#credits{position:fixed;inset:0;z-index:38;background:radial-gradient(ellipse at 50% 40%,#11161b 0%,#050608 72%);color:var(--ink);overflow:hidden;font-family:var(--f-ui);-webkit-user-select:none;user-select:none;touch-action:none}
#cr-cards{position:absolute;inset:0;pointer-events:none}
.crc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:0 max(24px,env(safe-area-inset-right,0px)) 0 max(24px,env(safe-area-inset-left,0px));opacity:0;transform:scale(1.035);filter:blur(6px);transition:opacity 1s ease,transform 4.2s ease-out,filter 1s ease}
.crc.on{opacity:1;transform:none;filter:none}
.crc-k{font:600 clamp(11px,1.5vw,14px)/1.4 var(--f-ui);letter-spacing:.55em;margin-right:-.55em;color:#b39a69}
.crc-n{font:800 clamp(44px,9vw,110px)/1 var(--f-epic);letter-spacing:.12em;margin-right:-.12em;background:linear-gradient(180deg,#fff7e0 0%,#e9c77d 48%,#8a6227 70%,#d9b56a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-wrap:balance}
.crc-n.sm{font-size:clamp(26px,5vw,58px);line-height:1.1}
.crc-s{font:500 clamp(11px,1.5vw,15px)/1.7 var(--f-ui);letter-spacing:.14em;color:#c9d0d5;max-width:64ch;text-transform:uppercase;text-wrap:balance}
.crc-logo{display:flex;flex-direction:column;align-items:center;font-family:var(--f-epic);font-weight:800;line-height:.9;filter:drop-shadow(0 6px 24px rgba(0,0,0,.85))}
.crc-logo span{background:linear-gradient(180deg,#fff7e0 0%,#e9c77d 48%,#8a6227 70%,#d9b56a 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.crc-logo span:first-child{font-size:clamp(24px,4.6vw,56px);letter-spacing:.38em;margin-right:-.38em}
.crc-logo span:last-child{font-size:clamp(46px,11vw,140px);letter-spacing:.08em;margin-right:-.08em}
.pc-mk{width:24px;height:24px;background:#ffc94a;box-shadow:0 0 26px #ffc94a,0 0 60px rgba(255,201,74,.5);transform:rotate(45deg);animation:mkbob 1.3s ease-in-out infinite}
@keyframes mkbob{50%{transform:translateY(-10px) rotate(45deg)}}
.pc canvas{width:110px;height:110px;box-shadow:0 0 0 2px rgba(255,201,74,.4),0 0 40px rgba(255,190,60,.35)}
.pc-sub{margin:10px 0 0;max-width:46ch;font:500 16px/1.5 var(--f-ui);color:#f3f5f7;min-height:3em}
#cr-stage{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:4vw;align-items:center;padding:calc(6vh + env(safe-area-inset-top,0px)) max(4vw,16px,env(safe-area-inset-right,0px)) calc(9vh + env(safe-area-inset-bottom,0px)) max(4vw,16px,env(safe-area-inset-left,0px))}
.cr-art{min-width:0;display:flex;flex-direction:column;gap:12px}
.cr-frame{position:relative;width:100%;aspect-ratio:16/10;max-height:72vh;overflow:hidden;background:#1a1d20;box-shadow:0 30px 80px rgba(0,0,0,.6);outline:1px solid rgba(217,181,106,.25);outline-offset:8px}
.cr-frame canvas{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.4s ease;transform-origin:50% 50%}
.cr-frame canvas.on{opacity:1;animation:kb 11s ease-out forwards}
@keyframes kb{from{transform:scale(1.02)}to{transform:scale(1.09) translate(-1.2%,-.8%)}}
.cr-cap{font:500 11px/1.5 var(--f-ui);letter-spacing:.2em;color:#8f9aa1;text-transform:uppercase}
.cr-cap b{color:#d9b56a;font-weight:700}.cr-cap span{color:#e9eef2}
.cr-roll{position:relative;height:100%;min-width:0;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent)}
.cr-list{position:absolute;left:0;right:0;top:0;will-change:transform}
.cr-list h3{margin:64px 0 16px;text-align:center;font:600 clamp(14px,1.4vw,18px)/1.3 var(--f-epic);letter-spacing:.32em;color:#d9b56a;text-wrap:balance}
.cr-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;height:26px}
.cr-row span{text-align:right;font:500 11px/26px var(--f-ui);letter-spacing:.12em;color:#8f9aa1;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cr-row b{font:600 15px/26px var(--f-ui);letter-spacing:.08em;color:#f3f1ea}
.cr-note{margin:56px auto;max-width:44ch;text-align:center;font:italic 400 15px/1.6 Georgia,serif;color:#c7cfd4;text-wrap:balance}
.cr-big{margin:90px 0 40px;text-align:center;font:800 clamp(22px,2.6vw,36px)/1.25 var(--f-epic);letter-spacing:.1em;color:#f3e7c9}
#cr-ui{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom,0px));padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px));display:flex;align-items:center;gap:18px;font:600 10px var(--f-ui);letter-spacing:.18em;color:#76838b;flex-wrap:wrap}
#cr-count{font-variant-numeric:tabular-nums;color:#b8c2c8}
.cr-hint{margin-left:auto}
#cr-skip{flex:none}
@media (max-width:760px){#cr-stage{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);gap:16px;padding-top:calc(3vh + env(safe-area-inset-top,0px))}.cr-hint{display:none}#cr-skip{margin-left:auto}.cr-row span{font-size:10px}.cr-row b{font-size:13px}}

/* layouts chosen by script */""")

# HTML
rep('<div id="toasts"></div>', r"""<div id="credits" hidden>
  <div id="cr-cards"></div>
  <div id="cr-stage" hidden>
    <div class="cr-art"><div class="cr-frame" id="cr-frame"><canvas id="cr-a"></canvas><canvas id="cr-b"></canvas></div><div class="cr-cap" id="cr-cap"></div></div>
    <div class="cr-roll" id="cr-roll"><div class="cr-list" id="cr-list"></div></div>
  </div>
  <div id="cr-ui"><span id="cr-count">POSITIONS CREDITED 0000 / 1,412</span><span class="cr-hint">HOLD <kbd>SPACE</kbd> OR PRESS AND HOLD TO FAST-FORWARD</span><button id="cr-skip" class="hbtn">SKIP CREDITS</button></div>
</div>
<div id="toasts"></div>""")
rep('<button data-m="settings">SETTINGS</button>', '<button data-m="credits">CREDITS<small>1,412 people. Sort of.</small></button>\n      <button data-m="settings">SETTINGS</button>')

# data
rep("timesaver:['Time Is Money','Buy the Time Saver Pack.',5],",
    "timesaver:['Time Is Money','Buy the Time Saver Pack.',5], credits:['Credits Enjoyer','Watch all 1,412 credits.',50], skipcred:['Ungrateful','Skip the credits.',0],")

# portraits: target canvas + dj/prof
rep("function drawPortrait(who){\n  const c=$('#portrait'),g=c.getContext('2d'),S=c.width,col=CHAR[who].color;",
    "function drawPortrait(who,c){\n  c=c||$('#portrait');const g=c.getContext('2d'),S=c.width,col=CHAR[who].color;")
rep("g.fillRect(45,40,4,2);g.shadowBlur=0;}\n}",
    "g.fillRect(45,40,4,2);g.shadowBlur=0;}\n"
    "  if(who==='dj'){g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(42,38,18,Math.PI*1.08,Math.PI*1.92);g.stroke();g.fillStyle=col;g.fillRect(22,36,6,12);g.fillRect(56,36,6,12);}\n"
    "  if(who==='prof'){g.fillStyle='#1c2a33';g.beginPath();g.arc(42,32,16,Math.PI,0);g.fill();g.fillRect(26,28,32,6);g.fillStyle=col;g.beginPath();g.arc(42,14,3.5,0,6.283);g.fill();g.strokeStyle=col;g.lineWidth=1.4;g.beginPath();g.arc(36,41,4,0,6.283);g.moveTo(52,41);g.arc(48,41,4,0,6.283);g.stroke();}\n}")

# title menu handler
rep("  else if(m==='store')openPanel('store','title');", "  else if(m==='credits')startCredits('title');\n  else if(m==='store')openPanel('store','title');")

# music
rep("const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4};",
    "const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4,credits:60/68/2};\nconst CRMEL=[[69,0,72,0,77,0,76,74],[72,0,0,0,67,0,72,74],[74,0,77,0,76,0,74,72],[70,0,74,0,72,0,70,69],[69,0,72,0,77,0,79,81],[79,0,0,76,77,0,76,74],[74,0,77,0,82,0,81,79],[77,0,0,0,76,0,0,0]];\nfunction piano(f,t,vol){osc('triangle',f,t,.03,vol,A.duck,{rel:.55,send:A.sendM});osc('sine',f*2,t,.02,vol*.3,A.duck,{rel:.3});}")
rep("const PROG={title:", "const PROG={credits:[[41,'M'],[48,'M'],[50,'m'],[46,'M'],[41,'M'],[48,'M'],[46,'M'],[48,'M']],title:")
rep("  }else if(mode==='win'){",
r"""  }else if(mode==='credits'){const cyc=Math.floor(s/64)%3,bar=Math.floor(s/8)%8,st=s%8,[r,q]=PROG.credits[bar],tr=triad(r,q);
    if(st===0){pad(triad(r+12,q),t,STEP.credits*8,.04);osc('sine',n2f(r-12),t,STEP.credits*8,.11,A.duck,{a:.4,rel:.8});if(cyc>=1)taiko(t,cyc===2?.5:.28);if(cyc===2&&(bar===0||bar===4))braam(r,t,.12);}
    const m=CRMEL[bar][st];if(m){piano(n2f(m),t,.09);if(cyc===2)osc('sawtooth',n2f(m-12),t,STEP.credits*1.6,.025,A.duck,{a:.08,rel:.4,lp:1800,send:A.sendM});}
    if(cyc>=1){const arp=[0,1,2,1,0,1,2,1];piano(n2f(tr[arp[st]]+12),t,.035);}
  }else if(mode==='win'){""")

# win flow -> credits after final chapter
rep("  banner('FIELD CLEARED',G.theme.op.toUpperCase(),'Mission complete');setTimeout(()=>say('a_complete'),300);setTimeout(()=>{if(G&&G.won)say(G.theme.win[0]);},2000);\n  await sleep(5600);",
    "  banner('FIELD CLEARED',G.theme.op.toUpperCase(),'Mission complete');setTimeout(()=>say('a_complete'),300);setTimeout(()=>{if(G&&G.won)say(G.theme.win[0]);},2000);\n"
    "  if(f>=FIELDS.length){await sleep(2600+((VOICES[G.theme.win[0]]||{d:5}).d)*1000);if(!G||!G.won)return;say(G.theme.win[1]);await sleep(((VOICES[G.theme.win[1]]||{d:5}).d+1.4)*1000);if(!G||!G.won)return;$('#letterbox').classList.remove('on');startCredits('game');return;}\n"
    "  await sleep(5600);")

# results: final variant
rep("function showResults(){", "function showResults(final){")
rep("const nx=FI(G.field+1);$('#rs').innerHTML=`<div class=\"rs-k\">MISSION COMPLETE · CHAPTER ${G.field} · ${DIFFS[G.dkey].label.toUpperCase()}</div><h2>${esc(G.theme.op)}</h2>",
    "const nx=FI(G.field+1);$('#rs').innerHTML=`<div class=\"rs-k\">${final?'CAMPAIGN COMPLETE':'MISSION COMPLETE · CHAPTER '+G.field} · ${DIFFS[G.dkey].label.toUpperCase()}</div><h2>${final?'Triple A Sweeper':esc(G.theme.op)}</h2>")
rep("<div class=\"rs-btns\"><button class=\"pbtn\" data-r=\"next\">NEXT: ${esc(nx.name.toUpperCase())} →</button><button class=\"pbtn alt\" data-r=\"again\">REPLAY CHAPTER</button><button class=\"pbtn alt\" data-r=\"dlc\">BUY DLC: MINES OF THE NORTH · €24.99</button><button class=\"pbtn alt\" data-r=\"title\">MAIN MENU</button></div>\n  <div class=\"rs-f\">Chapter ${G.field+1} of 87 unlocked · Post-credits scene available after 48 minutes of credits</div>`;",
    "<div class=\"rs-btns\">${final?`<button class=\"pbtn\" data-r=\"restart1\">PLAY AGAIN FROM CHAPTER 1</button><button class=\"pbtn alt\" data-r=\"credits\">WATCH THE CREDITS AGAIN</button>`:`<button class=\"pbtn\" data-r=\"next\">NEXT: ${esc(nx.name.toUpperCase())} →</button><button class=\"pbtn alt\" data-r=\"again\">REPLAY CHAPTER</button>`}<button class=\"pbtn alt\" data-r=\"dlc\">BUY DLC: MINES OF THE NORTH · €24.99</button><button class=\"pbtn alt\" data-r=\"title\">MAIN MENU</button></div>\n  <div class=\"rs-f\">${final?`Chapters 6–87 coming as DLC · You watched ${CR.skipped?'some':'all'} of the credits`:`Chapter ${G.field+1} of 87 unlocked · Credits roll after Chapter ${FIELDS.length}`}</div>`;")
rep("if(b.dataset.r==='next'){$('#results').hidden=true;startGame(G.dkey,true,G.field+1);}",
    "if(b.dataset.r==='next'){$('#results').hidden=true;startGame(G.dkey,true,G.field+1);}else if(b.dataset.r==='restart1'){$('#results').hidden=true;startGame(G.dkey,true,1);}else if(b.dataset.r==='credits'){$('#results').hidden=true;startCredits('game');}")

# keyboard / pointer hooks for credits
rep("addEventListener('keydown',e=>{\n  if(cur==='intro')",
    "addEventListener('keydown',e=>{\n  if(CR.on){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();CR.fast=true;}else if(e.key==='Escape'){e.preventDefault();skipCredits();}return;}\n  if(cur==='intro')")
rep("addEventListener('keyup',e=>{if(cur==='intro'", "addEventListener('keyup',e=>{if(CR.on&&(e.code==='Space'||e.code==='Enter'))CR.fast=false;if(cur==='intro'")

# credits module before boot
rep("/* ================= boot ================= */", r"""/* ================= credits ================= */
const CR={on:false,from:'title',tok:0,raf:0,y:0,fast:false,skipped:false,offs:[],listH:0,rollH:0,artI:0,artT:0,lastTs:0,rollDone:null};
function creditsData(){
  const S=[],add=(h,roles)=>S.push({h,roles}),note=t=>S.push({note:t});
  add('DIRECTION',['Game Director','Creative Director','Associate Creative Director','Art Director','Audio Director','Narrative Director','Technical Director','Design Director','Director of Quest Marker Brightness','Director of Directing']);
  const feats=['Quest Markers','Regenerating Health','Radio Chatter','Supply Drops','The Battle Pass','Lore Fragments','The Minimap','The Compass','Flag Skins','Achievements','Autosave','The Club',"Mom's Calls",'Blood','The Launcher'];
  add('PRODUCTION',['Executive Producer','Senior Producer','Producer','Associate Producer','Assistant Producer','Production Coordinator','Production Manager','Release Manager','Scrum Master','Agile Coach','Jira Archaeologist','Meeting Scheduler','Producer of Producers',...feats.map(f=>'Associate Producer, '+f)]);
  add('GAME DESIGN',['Lead Game Designer','Principal Designer','Senior Systems Designer','Systems Designer','Combat Designer (Clicking)','Economy Designer','Progression Designer','Flag Designer','Quest Marker Designer','Mine Placement Designer (Random)','Difficulty Designer','Accessibility Designer',...FIELDS.map(f=>'Level Designer, '+f.name),...FIELDS.map(f=>'Associate Level Designer, '+f.name),...[1,2,3,4,5,6,7,8].map(n=>'Number Designer, The Number '+n)]);
  add('NARRATIVE',['Lead Writer','Senior Writer','Narrative Designer','Bark Writer','Barks-per-Minute Consultant','Lore Writer (5 of 400)','Subtitle Wrangler','Dialogue Coordinator','Story Consultant','Continuity Supervisor',...['Cmdr. Reyes','Dr. Mirela Kova','Big Dez','Quartermaster Pryce','Mom','Pvt. Jenkins','DJ Detonator','Prof. Lindqvist','???'].map(c=>'Writer, '+c)]);
  const artR=[];['Environment Artist','Concept Artist','Lighting Artist','Prop Artist'].forEach(r=>FIELDS.forEach(f=>['Lead ','Senior ',''].forEach(l=>artR.push(`${l}${r}, ${f.name}`))));
  add('ART',['Lead Artist','Principal Artist',...artR,'Tile Artist, Brushed Steel','Tile Artist, Sandstone','Tile Artist, Dance Floor','Number Glow Artist','VFX Artist, Explosions','VFX Artist, Blood','VFX Artist, Lens Flares','VFX Artist, Embers','VFX Artist, Sand','VFX Artist, Snow','VFX Artist, Lasers','Technical Artist','UI Artist','HUD Artist','Icon Artist','Font Picker','Film Grain Specialist','Bloom Consultant','Gnome Sculptor','Tulip Placement Artist']);
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
async function startCredits(from){
  CR.from=from;CR.on=true;CR.fast=false;CR.skipped=false;const tok=++CR.tok;cancelAnimationFrame(CR.raf);
  stopAllVoices();closeOverlays();await fadeTo(1,800);if(tok!==CR.tok)return;
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
  if(CR.from==='game'&&G){musicStart('win');showResults(true);await fadeTo(0,700);}else{G=null;toTitle(true);}})();}
function skipCredits(){if(!CR.on)return;CR.skipped=true;unlock('skipcred');const tok=++CR.tok;cancelAnimationFrame(CR.raf);CR.rollDone=null;CR.fast=false;stopAllVoices();$('#cr-stage').hidden=true;$('#cr-cards').innerHTML='';crEnd(tok);}
$('#cr-skip').addEventListener('click',e=>{e.stopPropagation();S.ui();skipCredits();});
$('#credits').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;CR.fast=true;});
addEventListener('pointerup',()=>{CR.fast=false;});addEventListener('pointercancel',()=>{CR.fast=false;});

/* concept art */
function mkc(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return[c,g];}
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
  const fs=Math.max(16,Math.min(w,h)*.05);notes.forEach((n,i)=>{const nx=m+iw*n[0],ny=m+ih*n[1],col=i%2?INK_B:INK_R;g.save();g.fillStyle='rgba(236,227,207,.7)';g.font=`700 ${Math.round(fs)}px Caveat,cursive`;const tw=g.measureText(n[2]).width;g.fillRect(nx-6,ny-fs*.85,tw+12,fs*1.15);g.restore();hand(g,n[2],nx,ny,fs,col,rand(-.05,.05));if(n[3])arrowTo(g,nx+fs*.6,ny+fs*.35,m+iw*n[3][0],m+ih*n[3][1],col);});
  g.font=`600 ${Math.round(h*.028)}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.textAlign='left';g.fillText(title,m,h-m*.55);g.textAlign='right';g.fillStyle='#7a6d58';g.fillText(file,w-m,h-m*.55);g.textAlign='left';return c;};}
function castSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'CAST · CHARACTER SHEET','Radio portraits, final pass');
  const who=[['reyes','gruff but fair'],['kova','sorry (not sorry)'],['dez','LOUDER'],['qm','sells flags'],['mom','always calling'],['jenkins','helmet 2 sizes too big'],['dj','never slows down'],['prof','studies ice']];
  const cols=4,gx=w*.05,gy=h*.21,cw=(w*.9)/cols,ch=(h*.68)/2,ps=Math.min(cw*.6,ch*.58);const pc=document.createElement('canvas');pc.width=pc.height=168;
  who.forEach(([k,nt],i)=>{const x=gx+(i%cols)*cw+cw/2,y=gy+Math.floor(i/cols)*ch;drawPortrait(k,pc);g.save();g.translate(x,y+ps/2);g.rotate(rand(-.05,.05));g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.25)';g.shadowBlur=8;g.fillRect(-ps/2-6,-ps/2-6,ps+12,ps+12);g.shadowBlur=0;g.drawImage(pc,-ps/2,-ps/2,ps,ps);g.restore();
    g.font=`600 ${Math.round(Math.max(10,ch*.07))}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.textAlign='center';g.fillText(CHAR[k].name.toUpperCase(),x,y+ps+ch*.12);g.textAlign='left';hand(g,nt,x-ps*.5,y+ps+ch*.24,Math.max(15,ch*.1),i%2?INK_B:INK_R,-.03);});return c;}
function mineSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'THE MINE · ITERATIONS','Exploration, weeks 1–14');
  const nt=['too friendly','too round','meh','spiky enough?','v5','scarier','v7','same as v3?','APPROVED'];
  for(let i=0;i<9;i++){const x=w*(.2+.3*(i%3)),y=h*(.32+.22*Math.floor(i/3)),r=Math.min(w,h)*.04*(1+(i%3)*.1),n=4+i;
    g.strokeStyle='#15181b';g.lineWidth=Math.max(2,r*.28);g.lineCap='round';for(let k=0;k<n;k++){const a=k*2*Math.PI/n;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r*1.6,y+Math.sin(a)*r*1.6);g.stroke();}
    g.fillStyle='#1b1f23';g.beginPath();g.arc(x,y,r*(i===1?1.3:1),0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(x-r*.38,y-r*.38,r*.2,0,6.283);g.fill();
    if(i===0){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(x,y+r*.05,r*.45,.25,Math.PI-.25);g.stroke();g.fillStyle='#fff';g.fillRect(x-r*.35,y-r*.3,3,3);g.fillRect(x+r*.25,y-r*.3,3,3);}
    hand(g,`v${i+1} · ${nt[i]}`,x-r*1.9,y+r*2.5,Math.max(15,h*.036),i===8?INK_R:'#5a5040',0);
    if(i===8){g.strokeStyle=INK_R;g.lineWidth=3;g.beginPath();g.ellipse(x,y,r*2.5,r*2.2,.1,0,6.283);g.stroke();}
    if(i<2){g.strokeStyle=INK_R;g.lineWidth=2.5;g.beginPath();g.moveTo(x-r*2,y-r*2);g.lineTo(x+r*2,y+r*2);g.stroke();}}return c;}
function markerSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'QUEST MARKER · READABILITY STUDY','Playtest feedback: "I still could not find it"');
  const lab=['v1 subtle','v2','v3 visible','v4 very visible','v5 shouting','v6 MAXIMUM'],sz=[.012,.02,.032,.05,.075,.11];
  for(let i=0;i<6;i++){const x=w*(.1+.16*i),by=h*.72,d=Math.min(w,h)*sz[i]*2.2;g.fillStyle='#b7a98d';g.fillRect(x-w*.05,by,w*.1,h*.06);g.strokeStyle='rgba(60,50,40,.4)';g.strokeRect(x-w*.05+.5,by+.5,w*.1,h*.06);
    if(i===5){const gr=g.createLinearGradient(0,by,0,h*.17);gr.addColorStop(0,'rgba(255,190,60,.6)');gr.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=gr;g.fillRect(x-d*.35,h*.17,d*.7,by-h*.17);}
    const y=by-d*1.1-h*.03;g.fillStyle='#f2b43a';g.strokeStyle='#5a3b00';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-d);g.lineTo(x+d*.72,y);g.lineTo(x,y+d);g.lineTo(x-d*.72,y);g.closePath();g.fill();g.stroke();
    hand(g,lab[i],x-w*.055,h*.85,Math.max(13,h*.034),i===5?INK_R:'#5a5040',0);if(i<5){g.strokeStyle=INK_R;g.lineWidth=2;g.beginPath();g.moveTo(x-w*.045,h*.87);g.lineTo(x+w*.045,h*.83);g.stroke();}}
  hand(g,'shipped ✓',w*.84,h*.93,Math.max(16,h*.042),INK_R,-.05);return c;}
function tileSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'TILES · MATERIAL STUDY','Three materials, one hitbox');
  const s=Math.round(Math.min(w*.13,h*.24)),S=Math.max(8,Math.round(s*dpr));const sets=[[plate(S,false),openTile(S),'Brushed steel','approved'],[plateSand(S,false),openSand(S),'Sandstone','needs more sand'],[plateClub(S,false),openClub(S),'Dance floor','BRIGHTER??']];const num=numSprite(S,3);
  sets.forEach((st,i)=>{const x=w*(.07+.31*i),y=h*.3;g.drawImage(st[0],x,y,s,s);g.drawImage(st[1],x+s+8,y,s,s);g.drawImage(num,x+s+8,y,s,s);
    if(i===2){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,80,220,.4)';g.fillRect(x+s*.14,y+s*.14,s*.72,s*.72);g.globalCompositeOperation='source-over';}
    g.font=`600 ${Math.round(h*.04)}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.fillText(st[2].toUpperCase(),x,y+s+h*.09);hand(g,st[3],x,y+s+h*.17,Math.max(16,h*.046),i===1?INK_B:INK_R,-.04);});return c;}
const ART=[
  {make:sceneArt('battle','SECTOR B-4 · KEY ART','sectorB4_keyart_v3_FINAL.png',[[.05,.12,'more fog?'],[.55,.2,'sun too nice',[.83,.57]],[.06,.5,'tower = iconic',[.16,.38]]]),cap:'Sector B-4, key art'},
  {make:castSheet,cap:'Cast, character sheet'},
  {make:sceneArt('desert','THE DUNE SEA · EXPLORATION','dunesea_explore_v7.png',[[.05,.12,'is this too much sand'],[.55,.07,'vultures stay',[.24,.22]],[.08,.88,'camels (cut for budget)']]),cap:'The Dune Sea, early exploration'},
  {make:mineSheet,cap:'The mine, iterations'},
  {make:sceneArt('club','DA CLUB · LIGHTING PASS','daclub_lighting_v12_dezapproved.png',[[.3,.16,'MORE LASERS'],[.55,.42,'Dez wants bigger sign',[.12,.45]],[.34,.9,'bouncer cut for budget']]),cap:'Da Club, lighting pass'},
  {make:markerSheet,cap:'Quest marker, readability study'},
  {make:sceneArt('arctic','STATION NORD-7 · MOOD','nord7_mood_v2.png',[[.05,.1,'aurora = free bloom'],[.5,.5,'polar bear (DLC)',[.8,.66]]]),cap:'Station Nord-7, mood'},
  {make:tileSheet,cap:'Tiles, material study'},
  {make:sceneArt('home',"MOM'S BACKYARD · FINAL",'momsyard_final_FINAL_final2.png',[[.18,.68,'gnome is canon',[.3,.84]],[.45,.1,'tulips: do NOT step'],[.55,.36,'TV always on',[.73,.52]]]),cap:"Mom's Backyard, final"},
];
let artFlip=0;
function showArt(i){const fr=$('#cr-frame'),w=fr.clientWidth,h=fr.clientHeight;if(!w||!h)return;const cv2=[$('#cr-a'),$('#cr-b')],nx=cv2[artFlip^1],cu=cv2[artFlip];artFlip^=1;let src;try{src=ART[i].make(w,h);}catch(e){console.error(e);return;}
  nx.width=src.width;nx.height=src.height;nx.getContext('2d').drawImage(src,0,0);nx.classList.remove('on');void nx.offsetWidth;nx.classList.add('on');cu.classList.remove('on');
  $('#cr-cap').innerHTML=`<b>CONCEPT ART</b> · ${esc(ART[i].cap)} · <span>Claude</span>`;}

/* ================= boot ================= */""")

open(P, 'w').write(s)
print('patched OK')
