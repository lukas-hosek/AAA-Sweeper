D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
t=open(D+'test.html').read()
hook=r"""window.__title=()=>toTitle(false);
window.__render=async(mode,nSteps,fadeSec)=>{
  const sr=48000,sd=STEP[mode],musicDur=nSteps*sd,total=musicDur+fadeSec+.3;
  const oc=new OfflineAudioContext(2,Math.ceil(total*sr),sr);
  const keys=['ctx','duck','sendM','sendL','revM','revL','noise','boomCurve','radioCurve'];const save={};for(const k of keys)save[k]=A[k];
  A.ctx=oc;
  const comp=oc.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.25;comp.connect(oc.destination);
  const fade=oc.createGain();fade.gain.setValueAtTime(1,0);fade.gain.setValueAtTime(1,musicDur);fade.gain.linearRampToValueAtTime(0,musicDur+fadeSec);fade.connect(comp);
  const mus=oc.createGain();mus.gain.value=.45;mus.connect(fade);
  A.duck=oc.createGain();A.duck.connect(mus);
  const nb=oc.createBuffer(1,sr*2,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;A.noise=nb;
  A.revM=oc.createConvolver();A.revM.buffer=makeIR(2.8);A.revM.connect(A.duck);A.sendM=oc.createGain();A.sendM.gain.value=.55;A.sendM.connect(A.revM);
  A.revL=oc.createConvolver();A.revL.buffer=makeIR(6.5);A.revL.connect(A.duck);A.sendL=oc.createGain();A.sendL.gain.value=.85;A.sendL.connect(A.revL);
  A.boomCurve=curve(5);A.radioCurve=curve(2.4);
  const n=Math.ceil((musicDur+fadeSec)/sd);for(let s=0;s<n;s++)musicStep(mode,s,.05+s*sd);
  const buf=await oc.startRendering();
  for(const k of keys)A[k]=save[k];
  const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0;for(let i=0;i<L.length;i++){const a=Math.abs(L[i]),b=Math.abs(R[i]);if(a>pk)pk=a;if(b>pk)pk=b;}
  const gain=pk>0?Math.pow(10,-1/20)/pk:1,N=L.length,bytes=new Uint8Array(44+N*6),dv=new DataView(bytes.buffer);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)bytes[o+i]=s.charCodeAt(i);};
  ws(0,'RIFF');dv.setUint32(4,36+N*6,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*6,true);dv.setUint16(32,6,true);dv.setUint16(34,24,true);ws(36,'data');dv.setUint32(40,N*6,true);
  let o=44;for(let i=0;i<N;i++){for(const ch of [L,R]){let v=Math.round(Math.max(-1,Math.min(1,ch[i]*gain))*8388607);bytes[o++]=v&255;bytes[o++]=(v>>8)&255;bytes[o++]=(v>>16)&255;}}
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));const a=document.createElement('a');a.href=url;a.download=mode+'.wav';document.body.appendChild(a);a.click();
  return {peak:pk,gainDb:20*Math.log10(gain),sec:N/sr};
};
requestAnimationFrame(tick);"""
assert t.count("requestAnimationFrame(tick);")>=1
i=t.index("window.__t=");j=t.index("requestAnimationFrame(tick);",i)
t=t[:j]+hook+t[j+len("requestAnimationFrame(tick);"):]
open(D+'ost/render.html','w').write(t)
print('ok')
