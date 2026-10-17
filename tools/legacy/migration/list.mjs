import fs from 'fs';import {parse} from '@babel/parser';
const js=fs.readFileSync('parts/game.js','utf8');
const ast=parse(js,{sourceType:'module',attachComment:true});
let sec='head';
const lineOf=p=>js.slice(0,p).split('\n').length;
for(const s of ast.program.body){
  for(const c of s.leadingComments||[]){const m=c.value.match(/=+\s*(.+?)\s*=+/);if(m)sec=m[1];}
  let names=[];
  if(s.type==='VariableDeclaration')names=s.declarations.map(d=>d.id.name||'(pattern)');
  else if(s.type==='FunctionDeclaration')names=[s.id.name];
  else if(s.type==='ClassDeclaration')names=[s.id.name];
  else names=['<'+s.type+'> '+js.slice(s.start,Math.min(s.end,s.start+70)).replace(/\n/g,' ')];
  console.log(lineOf(s.start)+'\t'+sec+'\t'+(s.kind||'')+'\t'+names.join(','));
}
