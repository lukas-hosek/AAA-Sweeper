// audio/sfx.js — All procedural sound effects (UI, reveal, flag, explosion, intro stings, flood...). Object S.
import {n2f,rand} from '../core/util.js';
import {A,nz,osc} from './engine.js';
import {taiko} from './instruments.js';

export const S={
  ok(){return !!A.ctx;},
  t(){return A.ctx.currentTime;},
  ui(){if(!this.ok())return;osc('sine',2300,this.t(),.02,.05,A.sfx,{rel:.02});},
  hover(){if(!this.ok())return;osc('sine',1500,this.t(),.012,.025,A.sfx,{rel:.01});},
  click(){if(!this.ok())return;const t=this.t();osc('square',1800,t,.01,.04,A.sfx,{rel:.01,lp:4000});},
  reveal(n){if(!this.ok())return;const t=this.t(),k=Math.min(n,40);osc('triangle',480+k*10,t,.05,.2,A.sfx,{glide:900+k*22,rel:.05});
    if(n>=6){nz(t,.45,.15,A.sfx,{type:'bandpass',f:400,f2:5000,q:.9,a:.06,rel:.15});for(let i=0;i<6;i++)osc('sine',n2f(76+[0,4,7,12,16,19][i]),t+.035*i,.07,.05,A.sfx,{send:A.sendS,rel:.1});}},
  flag(){if(!this.ok())return;const t=this.t();osc('sine',170,t,.06,.45,A.sfx,{glide:60,rel:.05});nz(t+.01,.08,.2,A.sfx,{type:'bandpass',f:1100,q:1.4});},
  unflag(){if(!this.ok())return;const t=this.t();osc('sine',320,t,.05,.22,A.sfx,{glide:140,rel:.04});},
  denied(){if(!this.ok())return;const t=this.t();osc('square',160,t,.09,.07,A.sfx,{lp:900});osc('square',120,t+.1,.12,.07,A.sfx,{lp:900});},
  boom(){if(!this.ok())return;const t=this.t(),c=A.ctx,ws=c.createWaveShaper();ws.curve=A.boomCurve;const g=c.createGain();g.gain.value=.8;ws.connect(g);g.connect(A.sfx);g.connect(A.sendS);
    nz(t,1.3,1,ws,{type:'lowpass',f:5000,f2:110,q:.7,rel:.45});osc('sine',95,t,.6,1,ws,{glide:28,rel:.35});osc('triangle',52,t,.9,.6,A.sfx,{glide:24,rel:.4});
    for(let i=0;i<12;i++)nz(t+.2+Math.random()*1.3,.015,.08+Math.random()*.1,A.sfx,{type:'highpass',f:2500});},
  heart(){if(!this.ok())return;const t=this.t();osc('sine',64,t,.08,.6,A.sfx,{glide:40,rel:.06});osc('sine',58,t+.19,.08,.42,A.sfx,{glide:38,rel:.06});},
  level(){if(!this.ok())return;const t=this.t();[60,64,67,72,76,79].forEach((m,i)=>{osc('triangle',n2f(m+12),t+i*.065,.16,.13,A.sfx,{rel:.15,send:A.sendS});});},
  ach(){if(!this.ok())return;const t=this.t();osc('sine',n2f(81),t,.1,.18,A.sfx,{rel:.2,send:A.sendS});osc('sine',n2f(88),t+.11,.28,.17,A.sfx,{rel:.35,send:A.sendS});osc('sine',n2f(93),t+.11,.28,.05,A.sfx,{rel:.35});},
  coin(){if(!this.ok())return;const t=this.t();osc('square',n2f(83),t,.06,.06,A.sfx,{lp:5000});osc('square',n2f(88),t+.07,.2,.06,A.sfx,{lp:5000,rel:.1});},
  whoosh(){if(!this.ok())return;nz(this.t(),.55,.22,A.sfx,{type:'bandpass',f:250,f2:3800,q:1.3,a:.25,rel:.12});},
  quest(){if(!this.ok())return;const t=this.t();this.whoosh();osc('triangle',n2f(69),t+.15,.2,.14,A.sfx,{send:A.sendS,rel:.2});osc('triangle',n2f(76),t+.32,.4,.14,A.sfx,{send:A.sendS,rel:.4});},
  lore(){if(!this.ok())return;const t=this.t();for(let i=0;i<8;i++)osc('sine',n2f(84+[0,3,7,10,12,15,19,22][i]),t+i*.05,.25,.05,A.sfx,{send:A.sendS,rel:.3});},
  respects(){if(!this.ok())return;const t=this.t();[48,55,60,64,67].forEach(m=>{osc('sawtooth',n2f(m),t,1.4,.035,A.sfx,{a:.25,rel:.5,lp:1400,send:A.sendS});});},
  tune(){if(!this.ok())return;const t=this.t();[72,76,79,84,79,84].forEach((m,i)=>osc('square',n2f(m),t+i*.09,.07,.05,A.sfx,{lp:3000,rel:.03}));},
  ding(){if(!this.ok())return;const t=this.t();osc('sine',n2f(84),t,.4,.12,A.sfx,{rel:.4});osc('sine',n2f(91),t,.3,.05,A.sfx,{rel:.3});},
  klaxon(){if(!this.ok())return;const t=this.t();osc('square',620,t,.35,.032,A.sfx,{lp:1400,rel:.05});osc('square',480,t+.38,.35,.032,A.sfx,{lp:1400,rel:.05});},
  tick(){if(!this.ok())return;osc('sine',1500,this.t(),.04,.08,A.sfx,{rel:.03});},
  ctick(){if(!this.ok())return;nz(this.t(),.025,.12,A.sfx,{type:'highpass',f:2800,q:.5,rel:.02});},
  bubble(){if(!this.ok())return;const t=this.t();for(let i=0;i<3;i++)osc('sine',rand(300,500),t+i*.07,.06,.04,A.sfx,{glide:rand(900,1400),gt:.06,rel:.04});},
  flood(){if(!this.ok())return;const t=this.t();nz(t,3,.5,A.sfx,{type:'lowpass',f:2500,f2:200,q:.6,a:.3,rel:1,send:A.sendS});osc('sine',45,t,3,.5,A.sfx,{a:.4,rel:1});for(let i=0;i<14;i++)osc('sine',rand(250,600),t+.3+Math.random()*2.5,.06,.05,A.sfx,{glide:rand(900,1500),gt:.06,rel:.04});},
  crate(){if(!this.ok())return;const t=this.t();nz(t,.25,.4,A.sfx,{type:'lowpass',f:900});osc('sine',120,t,.18,.5,A.sfx,{glide:60});},
  sting(kind){if(!this.ok())return;const t=this.t()+.05;
    if(kind==='engine'){osc('sine',55,t,1.8,.55,A.sfx,{a:.5,rel:.9});nz(t,1.2,.12,A.sfx,{type:'bandpass',f:200,f2:2400,q:.8,a:.9,rel:.4});osc('sine',n2f(93),t+.9,.6,.06,A.sfx,{send:A.sendS,rel:.8});osc('sine',n2f(100),t+.95,.6,.04,A.sfx,{send:A.sendS,rel:.8});}
    else if(kind==='physics'){for(let i=0;i<6;i++){const tt=t+i*.12+.52;nz(tt,.05,.35,A.sfx,{type:'bandpass',f:1200+Math.random()*2500,q:1.5});osc('square',90+Math.random()*120,tt,.05,.12,A.sfx,{lp:1200,glide:50});}
      const tt=t+.6+1.25+.42;nz(tt,.12,.45,A.sfx,{type:'bandpass',f:700,q:1});osc('sine',130,tt,.2,.4,A.sfx,{glide:50});}
    else if(kind==='blink'){nz(t+.95,.012,.3,A.sfx,{type:'highpass',f:3000});nz(t+1.15,.012,.25,A.sfx,{type:'highpass',f:3000});[57,64,69,72].forEach((m,i)=>osc('sawtooth',n2f(m),t,1.8,.025,A.sfx,{a:.8,rel:.7,lp:1800,send:A.sendS}));}
    else if(kind==='ice'){for(let i=0;i<14;i++)osc('sine',n2f(88+Math.floor(Math.random()*14)),t+Math.random()*.9,.3,.035,A.sfx,{send:A.sendS,rel:.5});nz(t+.1,.08,.25,A.sfx,{type:'highpass',f:4000});nz(t+.25,.05,.18,A.sfx,{type:'highpass',f:5000});}
    else if(kind==='megalith'){taiko(t,.9,A.sfx);[38,45,50,53].forEach(m=>osc('sawtooth',n2f(m),t,2.2,.03,A.sfx,{a:.9,rel:1,lp:900,send:A.sendS}));}
  },
};
