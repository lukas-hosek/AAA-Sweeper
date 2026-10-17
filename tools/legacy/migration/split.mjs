// AST-driven splitter: parts/game.js -> out/js/**/*.js (ES modules)
import fs from 'fs'; import path from 'path';
import {parse} from '@babel/parser'; import _traverse from '@babel/traverse'; import MagicString from 'magic-string';
const traverse=_traverse.default;
const OUT=process.argv[2]||'out/js';
const js=fs.readFileSync('parts/game.js','utf8');
const ast=parse(js,{sourceType:'module',attachComment:false});
const body=ast.program.body;

// ---- module assignment ----
const SECTION_DEFAULT={'head':'data/voice-manifest','data':'data/content','utils / storage':'core/storage','audio':'audio/engine','voices / radio':'audio/voices','screens / fade':'ui/screens',
 'desktop':'scenes/desktop','intro':'scenes/intro','title':'scenes/title','notifications':'ui/notify','game state':'game/rules','start / layout':'render/layout','sprites':'render/sprites',
 'scenery':'render/scenery','blood':'render/blood','particles':'render/particles','game update & draw':'render/draw-game','HUD':'ui/hud','input':'game/input','pause / panels':'ui/panels','credits':'scenes/credits','boot':'main'};
const BYNAME={};const put=(m,names)=>names.split(/[\s,]+/).filter(Boolean).forEach(n=>BYNAME[n]=m);
put('data/voice-manifest','VOICES');
put('data/dialogue','CHAR PREFIX whoOf lineText SUBS QUEST_ON_LINE CHAT SHARED REPEATS PIN');
put('data/fields','FIELDS FI');
put('core/util','$ $$ clamp rand pick now sleep esc n2f shuffle tween RM');
put('core/storage','store _st settings PROFILE saveSettings saveProfile ownedSkins');
put('audio/engine','A audioInit makeIR curve shellshock setVol env osc nz unmuffle');
put('audio/voice-bank','b64ToBuf decodeOne touchBuf predecode');
put('audio/sfx','S');
put('audio/instruments','taiko pad pluck braam kick clap hat stab oud doum tek ney flute ocarina harp bell softpad epiano whistle piano');
put('audio/music','triad PROG STEP ARCPAT HOMEMEL CH7 PMEL OMEL CRMEL HIJAZ MUS musicStart musicStop musicTick musicStep');
put('audio/voices','squelch hiss');
put('ui/radio','radioHideT radioColor showRadio hideRadioSoon hexMix drawPortrait');
put('game/state','LK O2K G T BX BY BW BH W H dpr flagMode kbdOn CAM SPR P cv ctx newField idx forN colName label tileCenter sched');
put('game/pathos','bubbleAt O2F o2Set o2Off fmtBreath floodNow makeCaustics drawUnderwater');
put('game/events','startClub endClub showTip autosave spawnCrate openCrate lootRoll');
put('game/outcome','die showDeath win showResults');
put('game/start','startGame fieldMusic');
put('game/update','gameUpdate');
put('render/hud-canvas','bearingTo drawCompass drawMinimap waveData drawWave');
put('scenes/concept-art','mkc paper hand arrowTo tape sheetHead INK_R INK_B sceneArt castSheet mineSheet markerSheet tileSheet ART artFlip showArt');


const DOC={
 'data/dialogue':'Characters (radio cast), subtitle text for the first voice batch, per-chapter chatter arcs, quest-on-line triggers, pinned voice ids.',
 'data/content':'Static game content: side quests, achievements, tips, lore, quotes, ranks, perks, store items, flag skins, loot, difficulties, number colours.',
 'data/fields':'The campaign: one entry per chapter (scenery, tileset, music theme, voice ids, texts). FI(n) wraps around for New Game+.',
 'core/util':'Tiny helpers: DOM queries, maths, random, timing, HTML escaping, MIDI note to frequency.',
 'core/storage':'localStorage wrapper plus the persistent settings and player PROFILE objects.',
 'audio/engine':'Web Audio graph (master, buses, reverbs, muffle filter, compressor) and the low-level voice builders osc(), nz(), env().',
 'audio/voice-bank':'Loads, decodes and caches the voice-line MP3s (LRU cache with pinned ids).',
 'audio/sfx':'All procedural sound effects (UI, reveal, flag, explosion, intro stings, flood...). Object S.',
 'audio/instruments':'Synthesised instruments used by the music: drums, pads, plucks, braam, oud, ney, flute, ocarina, harp, bells, e-piano, whistle, piano.',
 'audio/music':'Music data (progressions, melodies, tempos) and the look-ahead step scheduler. musicStep() composes every theme.',
 'audio/voices':'Voice manager: radio chain, chatter scheduling (arcs, weights, queueing), barks with cooldowns, subtitles hook.',
 'ui/radio':'Incoming-transmission panel and the procedurally drawn character portraits.',
 'ui/screens':'Screen switching (desktop / intro / title / game) and the full-screen fade.',
 'scenes/desktop':'The fake Windows 98 desktop: icons, windows, Start menu, patch notes, launcher progress bars.',
 'scenes/intro':'Middleware logo intro with hold-to-skip.',
 'scenes/title':'Title screen, main menu, difficulty and chapter select, loading screen.',
 'ui/notify':'Toasts, achievements, centre banners, kill-feed lines, floating +XP pops, combo text.',
 'game/state':'Shared game state: the field object (ST.G), board geometry, camera, sprite cache, particle list, canvas. newField().',
 'game/rules':'Minesweeper rules plus the AAA layer: planting, flood fill, chording, flags, damage, quest marker, XP, levels, lore, side quests.',
 'game/pathos':'Pathos-4 specifics: flood, breath readout (asymptotic), underwater muffle, caustics and light rays.',
 'game/events':'Timed events: the club, tips, autosave, supply drops and loot.',
 'game/outcome':'Death and checkpoint, victory, results screen.',
 'game/start':'startGame(): resets everything and enters a chapter.',
 'game/update':'gameUpdate(): per-frame simulation (health regen, timers, chatter, scheduled events, Pathos-4 flooding...).',
 'render/layout':'Responsive layout: picks wide / mid / narrow HUD layout and sizes the board and canvases.',
 'render/sprites':'Procedural tile sprites for all six tilesets, numbers, mines, craters.',
 'render/scenery':'Procedural backgrounds per chapter (bake once, animate per frame) and the title-screen backdrop.',
 'render/blood':'Damage overlay: blood splats, drips and hit-direction arcs.',
 'render/particles':'Particle system (sparks, smoke, dust, glints, rings, chunks, confetti, bubbles) and explosions.',
 'render/draw-game':'Draws the board, flags, crate, quest marker beam and trail.',
 'render/hud-canvas':'Canvas-drawn HUD parts: compass, minimap with radar, radio waveform.',
 'ui/hud':'DOM HUD updates (quest list, XP, health, mines counter, prompts).',
 'game/input':'Mouse, touch and keyboard input for the board, HUD buttons and menus.',
 'ui/panels':'Pause menu and the tabbed panel (quest log, skills, store, achievements, settings).',
 'scenes/credits':'End credits: 1,412 rows of Claude, cards, auto-scroll, fast-forward and skip.',
 'scenes/concept-art':'Procedurally drawn concept-art sheets shown during the credits.',
 'main':'Entry point: imports every module in the original order, then starts the render loop.',
};
let sec='head';const stmts=[];
const lineOf=p=>js.slice(0,p).split('\n').length;
let prevEnd=0;
for(const s of body){
  const between=js.slice(prevEnd,s.start);
  for(const m of between.matchAll(/\/\*\s*=+\s*(.+?)\s*=+\s*\*\//g))sec=m[1];
  let names=[];
  if(s.type==='VariableDeclaration')names=s.declarations.map(d=>d.id.name);
  else if(s.type==='FunctionDeclaration'||s.type==='ClassDeclaration')names=[s.id.name];
  let mod=SECTION_DEFAULT[sec];
  if(names.length&&BYNAME[names[0]])mod=BYNAME[names[0]];
  if(names.some(n=>BYNAME[n]&&BYNAME[n]!==mod))throw new Error('mixed decl '+names);
  const txt=js.slice(s.start,s.end);
  if(s.type==='ExpressionStatement'&&txt.startsWith("$('#results').addEventListener"))mod='game/outcome';
  stmts.push({node:s,sec,mod,names,lead:prevEnd,line:lineOf(s.start)});prevEnd=s.end;
}
const tail=js.slice(prevEnd);

// ---- scope analysis ----
const topIndex=new Map();body.forEach((s,i)=>topIndex.set(s,i));
const stmtOf=p=>{let q=p;while(q.parentPath&&!q.parentPath.isProgram())q=q.parentPath;return topIndex.get(q.node);};
let progScope;traverse(ast,{Program(p){progScope=p.scope;p.stop();}});
const bindings=progScope.bindings;
const home={};for(const st of stmts)for(const n of st.names)home[n]=st.mod;
const shared=new Set();
for(const [name,b] of Object.entries(bindings)){
  for(const v of b.constantViolations){const m=stmts[stmtOf(v)].mod;if(m!==home[name])shared.add(name);}
}
// identifier occurrences (refs + writes) per binding
const occ={};
const addOcc=(name,idPath,kind)=>{(occ[name]=occ[name]||[]).push({p:idPath,kind});};
const patIds=(node,out)=>{if(!node)return;switch(node.type){case'Identifier':out.push(node);break;case'ArrayPattern':node.elements.forEach(e=>patIds(e,out));break;case'ObjectPattern':node.properties.forEach(pp=>patIds(pp.type==='RestElement'?pp.argument:pp.value,out));break;case'AssignmentPattern':patIds(node.left,out);break;case'RestElement':patIds(node.argument,out);break;}};
const refs={}; // module -> Set(names) used
for(const [name,b] of Object.entries(bindings)){
  for(const r of b.referencePaths){const m=stmts[stmtOf(r)].mod;(refs[m]=refs[m]||new Set()).add(name);addOcc(name,r,'ref');}
  for(const v of b.constantViolations){const m=stmts[stmtOf(v)].mod;(refs[m]=refs[m]||new Set()).add(name);
    const ids=[];const n=v.node;
    if(n.type==='AssignmentExpression')patIds(n.left,ids);else if(n.type==='UpdateExpression')patIds(n.argument,ids);else if(n.type==='ForOfStatement'||n.type==='ForInStatement')patIds(n.left,ids);else if(n.type==='VariableDeclarator'){}else throw new Error('violation type '+n.type);
    for(const id of ids)if(id.name===name)addOcc(name,{node:id,parent:null},'write');}
}
// ---- edits ----
const ms=new MagicString(js);
for(const name of shared){for(const o of occ[name]||[]){const id=o.p.node;const par=o.p.parent;
  if(par&&par.type==='ObjectProperty'&&par.shorthand&&par.value===id){ms.overwrite(id.start,id.end,`${name}:ST.${name}`);}
  else ms.overwrite(id.start,id.end,'ST.'+name);}}
// exports + shared declarations
const exported=new Set();
for(const [m,set] of Object.entries(refs))for(const n of set)if(home[n]&&home[n]!==m&&!shared.has(n))exported.add(n);
// names used by hand-written modules (js/debug.js) must be exported too
for(const n of ['makeIR','curve','MUS','STEP','musicStep','A','audioInit','VM','nextChatter','say','FIELDS','startGame','actReveal','startCredits','CR','toTitle','cur'])exported.add(n);
for(const st of stmts){const s=st.node;
  if(s.type==='VariableDeclaration'&&s.declarations.some(d=>shared.has(d.id.name))){
    const keep=[],sh=[];
    for(const d of s.declarations){const init=d.init?ms.slice(d.init.start,d.init.end):'undefined';if(shared.has(d.id.name))sh.push(`ST.${d.id.name}=${init};`);else keep.push(`${d.id.name}${d.init?'='+init:''}`);}
    const exp=s.declarations.some(d=>!shared.has(d.id.name)&&exported.has(d.id.name));
    ms.overwrite(s.start,s.end,(keep.length?`${exp?'export ':''}${s.kind} ${keep.join(',')};`:'')+sh.join(''));
  }else if(st.names.length&&st.names.some(n=>exported.has(n))){ms.prependLeft(s.start,'export ');}
}
// ---- emit modules ----
const mods={};for(const st of stmts){(mods[st.mod]=mods[st.mod]||[]).push(st);}
const relp=(from,to)=>{let r=path.relative(path.dirname(from),to);if(!r.startsWith('.'))r='./'+r;return r+'.js';};
const order=[];for(const st of stmts)if(!order.includes(st.mod))order.push(st.mod);
const report=[];const graph={'core/shared':[],'data/voice-manifest':[]};
for(const m of order){
  if(m==='data/voice-manifest')continue;
  const used=refs[m]||new Set();const imp={};let needST=false;
  for(const n of used){if(shared.has(n)){needST=true;continue;}const h=home[n];if(!h||h===m)continue;(imp[h]=imp[h]||[]).push(n);}
  let head='';
  if(needST)head+=`import {ST} from '${relp(m,'core/shared')}';\n`;
  if(m==='main'){for(const h of order){if(h==='main')continue;head+=imp[h]?`import {${imp[h].sort().join(',')}} from '${relp(m,h)}';\n`:`import '${relp(m,h)}';\n`;}}
  else for(const h of order.filter(x=>imp[x]))head+=`import {${imp[h].sort().join(',')}} from '${relp(m,h)}';\n`;
  graph[m]=[...(needST?['core/shared']:[]),...(m==='main'?order.filter(h=>h!=='main'):order.filter(x=>imp[x]))];
  let txt='';for(const st of mods[m]){let t=ms.slice(st.lead,st.node.end);t=t.replace(/^\n+/,'');txt+=t+'\n';}
  if(m==='main')txt+=tail.replace(/^\n+/,'');
  const file=path.join(OUT,m+'.js');fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,'// '+m+'.js — '+(DOC[m]||'')+'\n'+head+(head?'\n':'')+txt);
  report.push(`${m}: ${mods[m].length} stmts, imports from ${Object.keys(imp).length} modules${needST?' +ST':''}`);
}
fs.mkdirSync(path.join(OUT,'core'),{recursive:true});
fs.writeFileSync(path.join(OUT,'core/shared.js'),`// Mutable game-wide variables that are reassigned from more than one module.\n// ES module imports are read-only bindings, so these live on one shared object instead.\nexport const ST={};\n`);
fs.writeFileSync('report.json',JSON.stringify({shared:[...shared].sort(),order,home},null,1));
console.log(report.join('\n'));console.log('SHARED',[...shared].join(' '));

// ---- evaluation-order hazard check ----
const evalOrder=[];const state={};
const visit=m=>{state[m]='v';for(const d of graph[m]||[])if(!state[d])visit(d);state[m]='d';evalOrder.push(m);};
visit('main');
const pos=Object.fromEntries(evalOrder.map((m,i)=>[m,i]));
const isFn=n=>['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression','ObjectMethod','ClassMethod'].includes(n.type);
// refs inside a node executed at eval time (skip nested functions unless IIFE)
const evalRefs=(nodePath,acc,seenFns)=>{
  nodePath.traverse({
    Function(fp){const par=fp.parentPath;if(par.isCallExpression()&&par.node.callee===fp.node){return;} fp.skip();},
    Identifier(ip){if(!ip.isReferencedIdentifier())return;const b=ip.scope.getBinding(ip.node.name);if(!b||b.scope!==progScope)return;acc.add(ip.node.name);
      const par=ip.parentPath;if(par.isCallExpression()&&par.node.callee===ip.node){const name=ip.node.name;if(seenFns.has(name))return;seenFns.add(name);
        const bp=b.path;let fnPath=null;if(bp.isFunctionDeclaration())fnPath=bp;else if(bp.isVariableDeclarator()&&bp.node.init&&isFn(bp.node.init))fnPath=bp.get('init');
        if(fnPath)evalRefs(fnPath.get('body'),acc,seenFns);}}
  });
};
const progPath=[];traverse(ast,{Program(p){progPath.push(p);p.stop();}});
const tops=progPath[0].get('body');
const hazards=[];
tops.forEach((tp,i)=>{const m=stmts[i].mod;if(tp.isFunctionDeclaration())return;const acc=new Set();
  if(tp.isVariableDeclaration()){tp.get('declarations').forEach(d=>{if(d.node.init&&!isFn(d.node.init))evalRefs(d,acc,new Set());});}
  else evalRefs(tp,acc,new Set());
  for(const n of acc){const h=home[n];if(!h)continue;const b=bindings[n];if(b.kind==='hoisted')continue;
    if(h===m){const di=stmts.findIndex(st=>st.names.includes(n));if(di>i)hazards.push(`${m}:${stmts[i].line} uses ${n} declared later in same module`);continue;}
    if(pos[h]>pos[m])hazards.push(`${m} (line ${stmts[i].line}) uses ${n} from ${h} which evaluates later`);}
});
console.log('EVAL ORDER',evalOrder.join(' > '));
console.log('HAZARDS',hazards.length?'\n'+hazards.join('\n'):'none');
