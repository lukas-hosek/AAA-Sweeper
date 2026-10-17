import json, subprocess, base64, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.int8.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))

VOICE = {
    'reyes':   ('am_onyx', 1.0),
    'kova':    ('af_bella', 1.0),
    'dez':     ('am_puck', 1.12),
    'qm':      ('bm_george', 1.05),
    'mom':     ('af_heart', 1.0),
    'jenkins': ('am_liam', 1.15),
    'whisper': ('bm_lewis', 0.8),
    'sys':     ('af_nova', 0.95),
    'announcer': ('am_fenrir', 0.82),
}

# id, character, tts text (display subtitles live in the page)
LINES = [
    ('r_start','reyes',"Sweeper, this is Overlord. The field is hot. Follow the marker, and nobody else has to die."),
    ('r_copy','reyes',"Sweeper, do you copy? Click the glowing tile. The one with the big arrow over it."),
    ('r_intel','reyes',"Intel says this field is full of mines. That's why they call it a minefield."),
    ('r_hit1','reyes',"Sweeper's hit! Get to cover and let your health regenerate!"),
    ('r_hit2','reyes',"Take cover! Just stand still for a bit. Your body can heal from anything."),
    ('r_hit3','reyes',"Was that a mine? Sweeper, the marker was literally right next to it."),
    ('r_area','reyes',"Good effect on target! Area cleared!"),
    ('r_idle','reyes',"Sweeper, why have you stopped? The marker is right there. It's glowing."),
    ('r_flag','reyes',"Mine marked. Good eye, Sweeper."),
    ('r_win','reyes',"Field is clear! Outstanding work, Sweeper. Now get back to base. We've got another field. And forty more after that."),
    ('r_dead','reyes',"Sweeper's down! Sweeper's down! Somebody reload the checkpoint!"),
    ('r_push','reyes',"Keep pushing, Sweeper! Those tiles won't reveal themselves!"),
    ('r_half','reyes',"You're halfway there, Sweeper. I've seen men give up at halfway. Don't be those men."),

    ('k_1','kova',"Hey! I'm sorry for double crossing you. When you have time, come by my office and I'll upgrade that minesweeping neural interface for you."),
    ('k_2','kova',"Sweeper, it's Mirela. I know you're still mad. The upgrade offer stands. No strings attached. Mostly."),
    ('k_3','kova',"Okay, full disclosure. The neural interface upgrade has a small subscription fee. Nine ninety nine a month."),
    ('k_4','kova',"I may have also planted some of these mines. In my defense, it was a very confusing week."),
    ('k_5','kova',"The upgrade is ready. It shows you which tiles are safe. Oh. You already have that. Never mind."),
    ('k_dead','kova',"Don't worry, Sweeper. I can rebuild you. Better. Faster. With a monthly subscription."),

    ('d_1','dez',"Yoo, Sweeper, where you been? Get yo ass in da club immediately!"),
    ('d_2','dez',"Sweeper! The club is open, the DJ is waiting, and you're out there clicking squares? Come on, man!"),
    ('d_3','dez',"Bro. I put you on the guest list three times. Three times! The bouncer thinks you're a myth."),
    ('d_4','dez',"Okay. I'm not mad. I'm just saying. The club is very sad without you."),
    ('d_5','dez',"That's it. If you won't come to the club, the club is coming to you! Drop it!"),
    ('d_win','dez',"Yo, you done? You done? Club. Now. I'm sending a car."),

    ('q_1','qm',"Sweeper, Quartermaster here. New flag skins have just arrived. Gold, chrome, and one that plays a little tune."),
    ('q_2','qm',"A reminder that your premium battle pass expires in four hours. No pressure. Some pressure."),
    ('q_3','qm',"Those mines won't flag themselves. Unless you buy the auto flag bundle. Twelve ninety nine."),
    ('q_4','qm',"Limited time offer, Sweeper. Buy one flag, get one flag. That's two flags."),

    ('m_1','mom',"Hi sweetie, it's mom. I don't really understand your job, but please don't step on anything."),
    ('m_2','mom',"Your cousin's wedding is on Saturday, and you still haven't answered the invitation. Also, are you eating?"),
    ('m_3','mom',"Your father wants to know if minesweeping comes with a pension plan."),
    ('m_4','mom',"I saw on the news there was an explosion. Was that you? Call me back."),

    ('j_1','jenkins',"Whoa, nice click, Sweeper! I couldn't have clicked that better myself!"),
    ('j_2','jenkins',"I've marked the safe tile on your HUD. And on your compass. And on the minimap. And in the sky."),
    ('j_3','jenkins',"I'll hold this position! I'm just gonna stand here, actually. Holding."),
    ('j_lore','jenkins',"Ooh, a collectible! That's one of four hundred!"),
    ('j_low','jenkins',"Sweeper, you're bleeding pixels! Stay away from the mines!"),
    ('j_4','jenkins',"Follow me, Sweeper! Actually, you follow the marker. I'll follow you."),

    ('w_1','whisper',"The mines were here before us, Sweeper. They will be here after."),
    ('w_2','whisper',"Every number tells a story. Most of those stories are about mines."),
    ('w_3','whisper',"You think you're clearing the field. But the field is clearing you."),

    ('s_quest','sys',"New quest available."),
    ('s_ach','sys',"Achievement unlocked."),
    ('s_save','sys',"Autosave complete."),
    ('s_crit','sys',"Warning. Health critical."),
    ('s_level','sys',"Level up."),
    ('s_drop','sys',"Supply drop incoming."),

    ('a_title','announcer',"Triple A Sweeper. Remastered. Definitive. Game of the Year Edition."),
    ('a_complete','announcer',"Mission complete."),
]

only = set(sys.argv[1:])
out = {}
outpath = os.path.join(HERE, 'voices.json')
if os.path.exists(outpath):
    out = json.load(open(outpath))
for lid, ch, text in LINES:
    if only and lid not in only: continue
    if lid in out and not only: continue
    v, sp = VOICE[ch]
    s, sr = k.create(text, voice=v, speed=sp, lang='en-gb' if v.startswith('b') else 'en-us')
    s = np.concatenate([s, np.zeros(int(sr*0.12), dtype=s.dtype)])
    wav = os.path.join(HERE, f'{lid}.wav'); mp3 = os.path.join(HERE, f'{lid}.mp3')
    sf.write(wav, s, sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wav,'-ac','1','-ar','24000','-b:a','40k',mp3], check=True)
    out[lid] = {'d': round(len(s)/sr, 2), 'b64': base64.b64encode(open(mp3,'rb').read()).decode()}
    print(lid, out[lid]['d'], len(out[lid]['b64']), flush=True)
    json.dump(out, open(outpath,'w'))
tot = sum(len(v['b64']) for v in out.values())
print('lines', len(out), 'total b64 bytes', tot)
