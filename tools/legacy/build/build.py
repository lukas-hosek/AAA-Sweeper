import json, sys
D = '/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
s = open(D + 'template.html').read()
v = {}
for k, x in json.load(open(D + 'tts/voices.json')).items():
    v[k] = {'d': x['d'], 'b64': x['b64']}
for k, x in json.load(open(D + 'tts/voices2.json')).items():
    v[k] = {'d': x['d'], 'w': x['w'], 't': x['t'], 'b64': x['b64']}
import os
for fn in ('voices3.json', 'voices4.json'):
    if os.path.exists(D + 'tts/' + fn):
        for k, x in json.load(open(D + 'tts/' + fn)).items():
            v[k] = {'d': x['d'], 'w': x['w'], 't': x['t'], 'b64': x['b64']}
assert s.count('/*__VOICES__*/{}') == 1
out = s.replace('/*__VOICES__*/{}', json.dumps(v, separators=(',', ':'), ensure_ascii=False))
open('/home/claude/tripple-a-sweeper.html', 'w').write(out)
# test copy: real phone viewport + debug hooks
t = out.replace('<title>Triple A Sweeper</title>', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Triple A Sweeper</title>', 1)
hook = "window.__t={audio:()=>audioInit(),mus:()=>MUS.mode,credits:()=>startCredits('title'),cr:()=>({on:CR.on,y:CR.y,n:CR.offs.length,listH:CR.listH}),start:(d,f)=>startGame(d,true,f),G:()=>G,nc:()=>nextChatter(),say:(id)=>say(id),VM:()=>VM,V:(k)=>VOICES[k]&&{w:VOICES[k].w,t:VOICES[k].t},boom:()=>{for(let i=0;i<G.n;i++)if(G.mine[i]&&G.st[i]===0){actReveal(i);return i;}}};\nrequestAnimationFrame(tick);\n$('#aaa-icon')"
assert t.count("requestAnimationFrame(tick);\n$('#aaa-icon')") == 1
t = t.replace("requestAnimationFrame(tick);\n$('#aaa-icon')", hook)
open(D + 'test.html', 'w').write(t)
print('voices', len(v), 'page MB', round(len(out) / 1e6, 2))
