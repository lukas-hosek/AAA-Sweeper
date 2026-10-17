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

# per-chapter tileset and music
rep("tileset:(field-1)%3,", "tileset:(field-1)%5,")
rep("function fieldMusic(){return['game','desert','club'][((G?G.field:1)-1)%3];}", "function fieldMusic(){return['game','desert','club','arctic','home'][((G?G.field:1)-1)%5];}")

# sprites
rep("function buildSprites(){", r"""function plateIce(s,hover){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.1));
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,hover?'#f4fcff':'#e0f2fb');gr.addColorStop(.5,hover?'#bde0f1':'#a6cee4');gr.addColorStop(1,hover?'#8ab8d4':'#719fbf');g.fillStyle=gr;g.fillRect(0,0,s,s);
  const rg=g.createRadialGradient(s*.55,s*.6,s*.05,s*.5,s*.5,s*.7);rg.addColorStop(0,'rgba(50,110,165,.28)');rg.addColorStop(1,'rgba(50,110,165,0)');g.fillStyle=rg;g.fillRect(0,0,s,s);
  speck(g,s,s*s/12,'rgba(255,255,255,.55)','rgba(255,255,255,.2)');
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=Math.max(.6,s*.018);for(let k=0;k<2;k++)if(Math.random()<.6){g.beginPath();let x=rand(0,s),y=rand(0,s);g.moveTo(x,y);for(let j=0;j<3;j++){x+=rand(-s*.25,s*.25);y+=rand(-s*.25,s*.25);g.lineTo(x,y);}g.stroke();}
  bevel(g,s,b,'rgba(255,255,255,.62)','rgba(30,70,105,.5)');
  const gl=g.createLinearGradient(0,0,s,s);gl.addColorStop(0,'rgba(255,255,255,.38)');gl.addColorStop(.35,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(20,50,80,.55)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
function openIce(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#143046');gr.addColorStop(1,'#0a1a29');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/16,'rgba(180,220,255,.12)','rgba(0,0,0,.12)');
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(200,235,255,.14)';g.fillRect(0,s-1,s,1);g.fillRect(s-1,0,1,s);return c;}
function plateLawn(s,hover,dark){const c=mk(s),g=c.getContext('2d'),b=Math.max(1,Math.round(s*.09));
  const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,hover?'#95d65e':dark?'#6aa83e':'#7cbc4b');gr.addColorStop(1,hover?'#60a038':dark?'#437a24':'#4f8a2b');g.fillStyle=gr;g.fillRect(0,0,s,s);
  for(let k=0;k<s*1.6;k++){const x=Math.random()*s,y=Math.random()*s,l=rand(s*.05,s*.14);g.strokeStyle=Math.random()<.5?'rgba(195,245,145,.32)':'rgba(25,65,18,.35)';g.lineWidth=Math.max(.6,s*.015);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-1.5,1.5),y-l);g.stroke();}
  if(Math.random()<.14){g.fillStyle=pick(['#ffffff','#ffd23f','#ff8fab']);g.beginPath();g.arc(rand(s*.2,s*.8),rand(s*.2,s*.8),Math.max(1,s*.045),0,6.283);g.fill();}
  bevel(g,s,b,'rgba(225,255,195,.35)','rgba(20,50,15,.5)');g.strokeStyle='rgba(15,40,10,.6)';g.lineWidth=1;g.strokeRect(.5,.5,s-1,s-1);return c;}
function openLawn(s){const c=mk(s),g=c.getContext('2d');const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,'#5a3d26');gr.addColorStop(1,'#3a2617');g.fillStyle=gr;g.fillRect(0,0,s,s);speck(g,s,s*s/9,'rgba(255,220,180,.1)','rgba(0,0,0,.2)');
  for(let k=0;k<Math.max(2,s/10);k++){g.fillStyle=Math.random()<.5?'rgba(150,130,110,.6)':'rgba(110,95,80,.6)';g.beginPath();g.ellipse(rand(0,s),rand(0,s),Math.max(.8,s*.03),Math.max(.6,s*.022),rand(0,3),0,6.283);g.fill();}
  const k=Math.max(1,Math.round(s*.06));g.fillStyle='rgba(20,10,5,.5)';g.fillRect(0,0,s,k);g.fillRect(0,0,k,s);g.fillStyle='rgba(120,190,80,.35)';g.fillRect(0,0,s,Math.max(1,s*.03));return c;}
function buildSprites(){""")
rep("  else{SPR.hid=plate(s,false);SPR.hov=plate(s,true);SPR.open=openTile(s);}\n  SPR.num=[null];",
    "  else if(ts===3){SPR.hid=plateIce(s,false);SPR.hov=plateIce(s,true);SPR.open=openIce(s);}\n  else if(ts===4){SPR.hid=plateLawn(s,false,false);SPR.hov=plateLawn(s,true,false);SPR.open=openLawn(s);}\n  else{SPR.hid=plate(s,false);SPR.hov=plate(s,true);SPR.open=openTile(s);}\n  SPR.hidB=ts===4?plateLawn(s,false,true):SPR.hid;\n  SPR.num=[null];")
rep("function craterSprite(s,ts){const c=ts===1?openSand(s):ts===2?openClub(s):openTile(s),g=c.getContext('2d');",
    "function craterSprite(s,ts){const c=ts===1?openSand(s):ts===2?openClub(s):ts===3?openIce(s):ts===4?openLawn(s):openTile(s),g=c.getContext('2d');")

# board drawing
rep("const FR=[['#323b43','#14191e'],['#8a6a44','#46301c'],['#1d1428','#07040c']][G.tileset];",
    "const FR=[['#323b43','#14191e'],['#8a6a44','#46301c'],['#1d1428','#07040c'],['#a9c6da','#4d6b82'],['#7a4e2c','#3f2614']][G.tileset];")
rep("if(G.tileset!==2){g.fillStyle=G.tileset===1?'#c49a62':'#596570';", "if(G.tileset!==2){g.fillStyle=['#596570','#c49a62','','#e6f4fb','#c7a27a'][G.tileset];")
rep("if(s===0){g.drawImage(i===G.pressed?SPR.open:(hovOK&&(i===G.hover||(kbdOn&&i===G.kbd)))?SPR.hov:SPR.hid,x,y,T,T);}",
    "if(s===0){g.drawImage(i===G.pressed?SPR.open:(hovOK&&(i===G.hover||(kbdOn&&i===G.kbd)))?SPR.hov:((c&1)?SPR.hidB:SPR.hid),x,y,T,T);}")
rep("else if(s===2){g.drawImage(hovOK&&i===G.hover?SPR.hov:SPR.hid,x,y,T,T);",
    "else if(s===2){g.drawImage(hovOK&&i===G.hover?SPR.hov:((c&1)?SPR.hidB:SPR.hid),x,y,T,T);")
rep("  if(G.tileset===2){const bb=t*124/60,",
    "  if(G.tileset===3){const fr=Math.floor(t*3);g.save();g.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const i=((fr*7919+k*104729)>>>0)%G.n;if(G.st[i]!==0)continue;const ph=(t*3)%1,a=Math.sin(ph*Math.PI),x=BX+((i%G.cols)+.25+((k*37)%50)/100)*T,y=BY+(((i/G.cols)|0)+.25+((k*53)%50)/100)*T,r=T*.16*a;g.strokeStyle=`rgba(255,255,255,${.9*a})`;g.lineWidth=1.2;g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);g.stroke();}g.restore();}\n"
    "  if(G.tileset===2){const bb=t*124/60,")

# music
rep("const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4,credits:60/68/2};",
r"""const STEP={title:60/72/2,game:60/100/4,club:60/124/4,win:60/76/2,desert:60/92/4,credits:60/68/2,arctic:60/66/2,home:60/88/2};
const ARCPAT=[[0,-1,2,-1,1,-1,-1,4,0,-1,2,-1,4,-1,3,-1,1,-1,2,-1,0,-1,-1,5,2,-1,1,-1,0,-1,-1,-1],[3,-1,-1,2,-1,1,-1,-1,4,-1,-1,3,-1,2,-1,-1,5,-1,4,-1,3,-1,2,-1,1,-1,-1,-1,0,-1,-1,-1]];
const HOMEMEL=[[77,0,76,77,0,72,0,0],[74,0,72,74,0,69,0,0],[70,0,72,74,0,77,0,76],[74,0,72,0,70,0,0,0]];
const CH7={maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10]};
function bell(f,t,vol){osc('sine',f,t,.02,vol,A.duck,{rel:.7,send:A.sendM});osc('sine',f*2.76,t,.01,vol*.35,A.duck,{rel:.25,send:A.sendM});osc('sine',f*5.4,t,.01,vol*.12,A.duck,{rel:.12});}
function softpad(notes,t,dur,vol){for(const m of notes){osc('sine',n2f(m),t,dur,vol,A.duck,{a:dur*.4,rel:dur*.35,send:A.sendM});osc('triangle',n2f(m)*1.003,t,dur,vol*.35,A.duck,{a:dur*.4,rel:dur*.35});}}
function epiano(f,t,vol){osc('sine',f,t,.03,vol,A.duck,{rel:.45,send:A.sendM});osc('sine',f*2,t,.02,vol*.25,A.duck,{rel:.2});osc('triangle',f*1.002,t,.02,vol*.3,A.duck,{rel:.3});}
function whistle(f,t,dur,vol){const c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f*.97,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);l.frequency.value=5.5;lg.gain.value=f*.008;l.connect(lg);lg.connect(o.frequency);env(g,t,.04,vol,dur,.12);o.connect(g);g.connect(A.duck);g.connect(A.sendM);o.start(t);o.stop(t+dur+1);l.start(t);l.stop(t+dur+1);}""")
rep("const PROG={credits:", "const PROG={arctic:[[40,'m'],[36,'M'],[45,'m'],[47,'m']],home:[[41,'maj7'],[38,'m7'],[43,'m7'],[36,'7']],credits:")
rep("  }else if(mode==='credits'){",
r"""  }else if(mode==='arctic'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.arctic[bar],tr=triad(r,q);
    if(st===0){softpad(tr.map(m=>m+12),t,STEP.arctic*8,.026);osc('sine',n2f(r-12),t,STEP.arctic*8,.09,A.duck,{a:1.2,rel:1});nz(t,STEP.arctic*8,.028,A.duck,{type:'bandpass',f:450,f2:1500,q:1.6,a:STEP.arctic*4,rel:1});if(bar===0&&Math.floor(s/32)%2===1)taiko(t,.22);}
    const p=ARCPAT[Math.floor(s/32)%2][bar*8+st];if(p>=0)bell(n2f(tr[p%3]+36+(p>=3?12:0)),t,.05);
    if(bar===3&&st===5)bell(n2f(tr[2]+48),t,.028);
  }else if(mode==='home'){const bar=Math.floor(s/8)%4,st=s%8,[r,q]=PROG.home[bar],ch=CH7[q].map(x=>r+24+x),tt=t+((st&1)?STEP.home*.22:0);
    if(st===0||st===4)osc('sine',110,tt,.18,.32,A.duck,{glide:50,gt:.1,rel:.06});
    if(st%2===0)osc('triangle',n2f([r,r+7,r+12,r+7][st/2]),tt,STEP.home*1.6,.12,A.duck,{lp:900,rel:.12});
    nz(tt,.04,(st&1)?.022:.035,A.duck,{type:'bandpass',f:6000,q:.8});
    if(st===2||st===6||(st===7&&bar===3))for(const m of ch)epiano(n2f(m),tt,.032);
    if(Math.floor(s/32)%2===1){const m=HOMEMEL[bar][st];if(m)whistle(n2f(m),tt,STEP.home*1.7,.04);}
  }else if(mode==='credits'){""")

# credits concept art & roles
rep("'Tile Artist, Dance Floor',", "'Tile Artist, Dance Floor','Tile Artist, Ice','Tile Artist, Lawn',")
between("function tileSheet(w,h){", "const ART=[",
r"""function tileSheet(w,h){const[c,g]=mkc(w,h);paper(g,w,h);sheetHead(g,w,h,'TILES · MATERIAL STUDY','Five materials, one hitbox');
  const s=Math.round(Math.min(w*.078,h*.2)),S=Math.max(8,Math.round(s*dpr));const num=numSprite(S,3);
  const sets=[[plate(S,false),openTile(S),'Steel','approved'],[plateSand(S,false),openSand(S),'Sandstone','more sand'],[plateClub(S,false),openClub(S),'Dance floor','BRIGHTER??'],[plateIce(S,false),openIce(S),'Ice','too slippery'],[plateLawn(S,false,false),openLawn(S),'Lawn','Dad approved']];
  sets.forEach((st,i)=>{const x=w*(.04+.192*i),y=h*.34;g.drawImage(st[0],x,y,s,s);g.drawImage(st[1],x+s+6,y,s,s);g.drawImage(num,x+s+6,y,s,s);
    if(i===2){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,80,220,.4)';g.fillRect(x+s*.14,y+s*.14,s*.72,s*.72);g.globalCompositeOperation='source-over';}
    g.font=`600 ${Math.round(Math.max(9,h*.034))}px "Chakra Petch",sans-serif`;g.fillStyle='#2b2620';g.fillText(st[2].toUpperCase(),x,y+s+h*.08);hand(g,st[3],x,y+s+h*.16,Math.max(11,Math.min(w*.022,h*.044)),i%2?INK_B:INK_R,-.04);});return c;}
""")

open(P, 'w').write(s)
print('patched OK')
