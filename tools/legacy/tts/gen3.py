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

# id, who, tts text, display text (None = same as tts)
L = [
 ('rp_start','reyes',"Sweeper, Overlord. Pathos four. Three hundred meters below the surface. The base is flooding, so this one's on a timer. No pressure. A lot of pressure, actually. Water pressure.","Sweeper, Overlord. Pathos-4. 300 meters below the surface. The base is flooding, so this one's on a timer. No pressure. A lot of pressure, actually. Water pressure."),
 ('rp_1','reyes',"Sweeper, the water is rising. Click faster. Or click at the same speed, but with more urgency.",None),
 ('rp_2','reyes',"Thirty seconds, Sweeper! Take a deep breath. Seriously. Take a big one.",None),
 ('rp_flood','reyes',"Sweeper, the base is fully flooded. From now on, you'll have to hold your breath. Command believes in you. Command is on dry land.",None),
 ('rp_3','reyes',"Status report. You are underwater. The mines are underwater. Everything is underwater. Carry on.",None),
 ('rp_win','reyes',"Pathos sector cleared! Get to the surface, Sweeper. Decompress slowly. Then report to your mother's house.",None),
 ('hc_1','halcyon',"Welcome to Pathos four. Hull integrity is at forty percent. Please enjoy your stay.","Welcome to Pathos-4. Hull integrity is at 40%. Please enjoy your stay."),
 ('hc_2','halcyon',"Reminder. The emergency exits are also flooded.",None),
 ('hc_3','halcyon',"This station is rated for three hundred meters. We are currently at three hundred and one meters.","This station is rated for 300 meters. We are currently at 301 meters."),
 ('hc_flood','halcyon',"Flooding complete. Thank you for your patience. Oxygen is now a matter of personal preference.",None),
 ('hc_win','halcyon',"Thank you for visiting Pathos four. Please rate your stay. Five stars is the only option.","Thank you for visiting Pathos-4. Please rate your stay. Five stars is the only option."),
 ('jp_1','jenkins',"Sweeper, there's water in my helmet. Is that normal? Tell me that's normal.",None),
 ('jp_2','jenkins',"I saw a fish out the window. It had a quest marker.",None),
 ('jp_3','jenkins',"I've been holding my breath for two minutes. I think I'm getting really good at this.",None),
 ('kp_1','kova',"Mirela here. Good news. The neural interface is waterproof. Well, water resistant. It's damp tolerant.",None),
 ('kp_2','kova',"Small confession. I designed this base. The leak is a feature. It's called immersion.",None),
 ('dp_1','dez',"Sweeper! You're underwater? Bro! Underwater rave. Next weekend. Bring the fish.",None),
 ('mp_1','mom',"Sweetie, are you near water? You know you can't swim very well. Remember the lake?",None),
 ('mp_2','mom',"Your voice sounds bubbly. Are you holding your breath? Breathe, honey. Breathe.",None),
 ('qp_1','qm',"Quartermaster here. Waterproof flags now in stock. They also float, which makes them terrible flags.",None),
 ('wp_1','whisper',"Down here, Sweeper, the mines dream of the surface.",None),
 ('wp_2','whisper',"The deep keeps every secret. Except the quest marker. The marker tells everyone.",None),
 ('s_breach','sys',"Warning. Hull breach detected.",None),
 ('s_flood','sys',"Flooding imminent.",None),
 ('a_ch5p','announcer',"Chapter five. Pathos four.","Chapter Five. Pathos-4."),
 ('a_ch6','announcer',"Chapter six. Mom's Backyard.",None),
 ('ra_win2','reyes',"Arctic sector cleared. Outstanding. Get warm, Sweeper. Not too warm, though. Your next stop is three hundred meters underwater.","Arctic sector cleared. Outstanding. Get warm, Sweeper. Not too warm, though. Your next stop is 300 meters underwater."),
]

outpath = os.path.join(HERE, 'voices3.json')
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
