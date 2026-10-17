import json, subprocess, base64, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.int8.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))

VOICE = {
    'reyes': ('am_onyx', 1.0), 'kova': ('af_bella', 1.0), 'dez': ('am_puck', 1.12), 'qm': ('bm_george', 1.05),
    'mom': ('af_heart', 1.0), 'jenkins': ('am_liam', 1.15), 'whisper': ('bm_lewis', 0.8), 'sys': ('af_nova', 0.95),
    'announcer': ('am_fenrir', 0.82), 'dj': ('am_michael', 1.12), 'prof': ('bf_alice', 0.98), 'halcyon': ('af_sky', 0.92),
}

L = [
 ('pa_5','prof',"I have been at this station for eleven winters. You are the first visitor who did not ask me if it is cold. Thank you. It is cold.",None),
 ('pa_6','prof',"Please do not lick the tiles. I know it is tempting. Private Jenkins tried. Private Jenkins is still attached to one.",None),
 ('pa_7','prof',"These ice cores are forty thousand years old. Every layer is one year. This layer here is the year someone buried mines in my glacier. A very bad year.","These ice cores are 40,000 years old. Every layer is one year. This layer here is the year someone buried mines in my glacier. A very bad year."),
 ('pa_8','prof',"Sweeper, a polar bear has been watching your progress on the station monitors. He seems very invested. Please do not disappoint him.",None),
 ('pa_9','prof',"I have named all the mines. That one is Ingrid. That one is also Ingrid. I ran out of names quite early.",None),
 ('pa_10','prof',"Your friend from the club called the station. He asked if we have a VIP section. We do. It is the only room with heating.",None),
 ('pa_11','prof',"In my field, we measure progress in millimetres per century. You are moving much faster than that. Honestly, it is a little upsetting.",None),
 ('pa_12','prof',"People say the Arctic is empty. It is not empty, Sweeper. It is full of silence. And, as of this week, mines.",None),
 ('pa_13','prof',"Your health is regenerating. Interesting. Up here, nothing regenerates. Except the paperwork.",None),
 ('pa_14','prof',"I applied for a grant to study the mines. It was rejected. The committee said the mines were not peer reviewed.",None),
 ('pa_15','prof',"I am told you have a skill tree. We have no trees up here. We have a skill lichen. It grows one point every forty years.",None),
 ('pa_16','prof',"Please be careful near the freezer behind you. My entire career is in that freezer. Also my lunch.",None),
 ('pa_17','prof',"It is now minus forty outside. That is the only temperature where Celsius and Fahrenheit agree. It is also where I stop agreeing with anyone.","It is now −40° outside. That is the only temperature where Celsius and Fahrenheit agree. It is also where I stop agreeing with anyone."),
 ('pa_18','prof',"Every ice crystal is unique. Every mine is identical. Scientifically, I find that deeply disappointing.",None),
 ('pa_19','prof',"Command says this is a stealth section. Sweeper, you are following a glowing orange quest marker. In the polar night. They can see you from orbit.",None),
 ('pa_20','prof',"The night here lasts four months. Please try to finish before sunrise. I have already scheduled the press release.",None),
 ('pa_21','prof',"I used to talk to the penguins out there. Then I remembered that penguins live at the other pole. I still do not know who I was talking to.",None),
 ('pa_22','prof',"The mines are rising through the permafrost as it thaws. So, in a way, this is a climate story. Please make a note of that in your quest log.",None),
 ('pa_23','prof',"If you find an ice core with a mine frozen inside it, do not sweep it. Bring it to me. That is not a hazard. That is a publication.",None),
 ('pa_24','prof',"Field notes, day four thousand and twelve. The Sweeper is still here. The mines are fewer. The coffee is frozen solid. Morale is excellent.","Field notes, day 4,012. The Sweeper is still here. The mines are fewer. The coffee is frozen solid. Morale is excellent."),
]
outpath = os.path.join(HERE, 'voices4.json')
out = json.load(open(outpath)) if os.path.exists(outpath) else {}
for lid, who, text, disp in L:
    if lid in out: continue
    v, sp = VOICE[who]
    s, sr = k.create(text, voice=v, speed=sp, lang='en-gb' if v.startswith('b') else 'en-us')
    s = np.concatenate([s, np.zeros(int(sr*0.12), dtype=s.dtype)])
    wav = os.path.join(HERE, f'{lid}.wav'); mp3 = os.path.join(HERE, f'{lid}.mp3')
    sf.write(wav, s, sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wav,'-ac','1','-ar','24000','-b:a','32k',mp3], check=True)
    out[lid] = {'d': round(len(s)/sr, 2), 'w': who, 't': disp or text, 'b64': base64.b64encode(open(mp3,'rb').read()).decode()}
    print(lid, out[lid]['d'], flush=True)
    json.dump(out, open(outpath,'w'))
print('lines', len(out), 'b64 bytes', sum(len(v['b64']) for v in out.values()))
