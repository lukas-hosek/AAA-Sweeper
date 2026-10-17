import json, subprocess, base64, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.int8.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))

VOICE = {
    'reyes': ('am_onyx', 1.0), 'kova': ('af_bella', 1.0), 'dez': ('am_puck', 1.12), 'qm': ('bm_george', 1.05),
    'mom': ('af_heart', 1.0), 'jenkins': ('am_liam', 1.15), 'whisper': ('bm_lewis', 0.8), 'sys': ('af_nova', 0.95),
    'announcer': ('am_fenrir', 0.82), 'dj': ('am_michael', 1.12), 'prof': ('bf_alice', 0.98),
}

# id, who, tts text, display text (None = same as tts)
L = [
 # --- event variants (any chapter)
 ('r_hit4','reyes',"Contact! You stepped on a mine! Walk it off, Sweeper!",None),
 ('r_hit5','reyes',"That's going to leave a mark. Several marks, actually. Mostly crater.",None),
 ('j_hit','jenkins',"Sweeper! Are you okay? You look... exploded.",None),
 ('r_flag2','reyes',"Flag planted. Command will be very impressed. Or mildly impressed.",None),
 ('r_flag3','reyes',"Good flag. Real good flag. Textbook flag.",None),
 ('r_area2','reyes',"Huge area cleared! That's what I call a sweep!",None),
 ('j_area','jenkins',"Whoa! Did you see all those tiles go? That was beautiful, man!",None),
 ('r_idle2','reyes',"Sweeper, you've been staring at that grid for a while. Blink twice if you need help.",None),
 ('j_idle','jenkins',"Uh, Sweeper? Hello? Are we waiting for something? Should I wait too? I'll wait too.",None),
 ('r_win2','reyes',"Field clear. That's another one for the history books. Small history books. Pamphlets.",None),
 ('r_lore','reyes',"Is that a collectible? Sweeper, we do not have time for collectibles. Pick it up anyway.",None),
 ('j_respawn','jenkins',"You're back! I told everyone you'd respawn. Nobody believed me. Well, Kova did.",None),
 # --- system / announcer
 ('s_season','sys',"Season pass progress updated.",None),
 ('s_store','sys',"New items available in the store.",None),
 ('s_skill','sys',"You have unspent skill points.",None),
 ('s_check','sys',"Checkpoint reached.",None),
 ('s_obj','sys',"Objective updated.",None),
 ('s_chal','sys',"Daily challenge complete.",None),
 ('a_ch1','announcer',"Chapter one. Sector B four.","Chapter One. Sector B-4."),
 ('a_ch2','announcer',"Chapter two. The Dune Sea.",None),
 ('a_ch3','announcer',"Chapter three. Da Club.",None),
 ('a_ch4','announcer',"Chapter four. Station Nord Seven.","Chapter Four. Station Nord-7."),
 ('a_ch5','announcer',"Chapter five. Mom's Backyard.",None),
 # --- desert
 ('rd_start','reyes',"Sweeper, Overlord. Welcome to the Dune Sea. It's a hundred and twelve degrees, and the mines are hotter. Follow the marker.","Sweeper, Overlord. Welcome to the Dune Sea. It's 112 degrees, and the mines are hotter. Follow the marker."),
 ('rd_1','reyes',"The sand shifts every night, Sweeper. Which means the mines shift. Which means I have no idea what I'm talking about.",None),
 ('rd_2','reyes',"Drink water, Sweeper. Regenerating health doesn't work if you're dehydrated. It does, actually. But drink water.",None),
 ('rd_3','reyes',"Satellite shows a sandstorm moving in. Our recommendation is to keep clicking.",None),
 ('rd_win','reyes',"Desert sector cleared. Good work, Sweeper. Shake out your boots. We're moving you somewhere with a dress code.",None),
 ('jd_1','jenkins',"Sweeper, I've got sand in places I didn't know I had places.",None),
 ('jd_2','jenkins',"Is that an oasis? No, it's a mirage. No, wait, it's the quest marker.",None),
 ('jd_3','jenkins',"I tried to flag a mine and it turned out to be a camel. He was cool about it.",None),
 ('kd_1','kova',"Mirela again. I'm in the desert too. Small world. I followed you. For science.",None),
 ('kd_2','kova',"The neural interface now comes in a desert edition. It's beige. Same price.",None),
 ('dd_1','dez',"Sweeper, I can see you on my phone. You're in a desert. Why are you in a desert? The club is literally not in the desert.",None),
 ('dd_2','dez',"Okay, new plan. When you're done with the sand, we do a desert rave. I'm calling it Dune Bass.",None),
 ('md_1','mom',"Sweetie, are you wearing sunscreen? You burn so easily. Remember the beach in two thousand and nine?","Sweetie, are you wearing sunscreen? You burn so easily. Remember the beach in 2009?"),
 ('md_2','mom',"I sent you a care package. It has socks and a hat. I didn't know where to send it, so I sent it to the desert.",None),
 ('qd_1','qm',"Quartermaster here. Sand-proof flags now available. Regular flags are also sand-proof. But these ones say so.",None),
 ('qd_2','qm',"Desert camouflage flag skin, Sweeper. It's invisible against the sand. Great for when you want to lose your flags.",None),
 ('wd_1','whisper',"The sand remembers every step, Sweeper. Even the ones that went boom.",None),
 ('wd_2','whisper',"Beneath the dunes there are older fields. Fields beneath fields. It's fields all the way down.",None),
 # --- club
 ('dc_start','dez',"Yo! You made it! Sweeper is in da club! Everybody make some noise! Careful though. The dance floor is mined. Long story.","YO! YOU MADE IT! Sweeper is in da club! Everybody make some noise! Careful though. The dance floor is mined. Long story."),
 ('dc_1','dez',"Bro, this is the best night of my life. Also, don't step on the third tile from the bar. Trust me.",None),
 ('dc_2','dez',"You see that? The whole club is watching you sweep. They think it's a dance. Lean into it.",None),
 ('dc_3','dez',"The bouncer says sorry for not believing you exist. He's been crying. Big guy, big feelings.",None),
 ('dc_4','dez',"Okay, real talk. Who mined the dance floor? I'm not mad. I'm just asking. Doctor Kova, was it you?","Okay, real talk. Who mined the dance floor? I'm not mad. I'm just asking. Dr. Kova, was it you?"),
 ('dc_win','dez',"Floor's clear! Sweeper, you're a legend! VIP for life! The drinks are on Overlord!",None),
 ('dj_1','dj',"This one goes out to Sweeper, clicking tiles in the middle of the dance floor! Respect!",None),
 ('dj_2','dj',"Put your hands up! But not on the tiles! Seriously, keep your hands off the tiles!",None),
 ('dj_3','dj',"Request from table six: less explosions. Request denied!",None),
 ('dj_4','dj',"We're gonna slow it down now. Just kidding. We never slow it down.",None),
 ('dj_5','dj',"Shout out to Mom, who is apparently on the guest list. Hi, Mom!",None),
 ('rc_1','reyes',"Sweeper, Overlord. Our intel says you are in a nightclub. Is that correct? Are you on a mission, or on a night out?",None),
 ('rc_2','reyes',"Sweeper, the music on your channel is very loud. Please confirm the mines are still the priority. Also, what's this song?",None),
 ('kc_1','kova',"So, funny story. I may have mined the dance floor. I was aiming for the parking lot. Spatial reasoning is not my area.",None),
 ('kc_2','kova',"The neural interface has a party mode now. It makes the quest marker dance. Nine ninety nine.","The neural interface has a party mode now. It makes the quest marker dance. 9.99."),
 ('jc_1','jenkins',"Sweeper, I've been dancing for an hour. I think I'm better at this than at soldiering.",None),
 ('jc_2','jenkins',"A guy asked me if I'm a real soldier. I said I'm a squad member. He said, cool hat.",None),
 ('mc_1','mom',"Honey, are you at a club? It sounds like a club. Are you safe? Are you making friends?",None),
 ('mc_2','mom',"I'm here! Dez put me on the list. The music is very loud, and nobody here eats vegetables.",None),
 ('qc_1','qm',"Quartermaster here. Club exclusive glow-in-the-dark flags are available behind the bar. Cash only.",None),
 ('wc_1','whisper',"Even here, Sweeper. Even beneath the music. The mines are listening to the bass.",None),
 # --- arctic
 ('ra_start','reyes',"Sweeper, Overlord. Station Nord Seven. Minus forty degrees. The mines are frozen, and so is my coffee. Follow the marker.","Sweeper, Overlord. Station Nord-7. Minus 40 degrees. The mines are frozen, and so is my coffee. Follow the marker."),
 ('ra_1','reyes',"If your fingers freeze, Sweeper, click with your elbow. Command does not care how the tiles get clicked.",None),
 ('ra_2','reyes',"Polar bears in the area, Sweeper. They are not hostile. They are, however, extremely curious about flags.",None),
 ('ra_win','reyes',"Arctic sector cleared. Outstanding. Get warm, Sweeper. The next stop is classified. It's your mother's house.",None),
 ('pa_1','prof',"Hello, Sweeper. Professor Lindqvist, Station Nord Seven. I study ice. I did not ask for mines. Nobody asks for mines.","Hello, Sweeper. Professor Lindqvist, Station Nord-7. I study ice. I did not ask for mines. Nobody asks for mines."),
 ('pa_2','prof',"Fascinating. The mines appear to be hibernating. Please do not wake them. They are grumpy.",None),
 ('pa_3','prof',"The aurora tonight is spectacular. That green light is the solar wind. That orange light is the quest marker.",None),
 ('pa_4','prof',"My research shows that ninety percent of each mine is below the surface, like an iceberg. The other ten percent is also below the surface.","My research shows that 90% of each mine is below the surface, like an iceberg. The other 10% is also below the surface."),
 ('ja_1','jenkins',"Sweeper, I licked a flagpole. Now I live here.",None),
 ('ja_2','jenkins',"My regenerating health is regenerating very slowly. I think it's frozen too.",None),
 ('ka_1','kova',"It's Mirela. The interface now has a heated version. It's warm, and slightly on fire. Fixing that in a patch.",None),
 ('ma_1','mom',"Honey, I knitted you a scarf. It's on its way. It's very long. You can use it to mark the mines.",None),
 ('qa_1','qm',"Quartermaster here. Insulated flags in stock. They will never freeze. Unlike your bank account after buying them.",None),
 ('da_1','dez',"Sweeper, it's Dez. It's minus forty where you are? Perfect. I'm opening the club's ice bar. You're the ice.",None),
 ('wa_1','whisper',"In the cold, everything slows down, Sweeper. Even your heartbeat. Even the mines. Not your mother's calls, though.",None),
 # --- home
 ('mh_start','mom',"You're home! Oh, I'm so happy! Wipe your feet. Not there! There's a mine there. Your father was gardening.",None),
 ('mh_1','mom',"I made your favorite dinner. It will be ready when you clear the lawn. No pressure, sweetie.",None),
 ('mh_2','mom',"Your cousin is here. She got married. You missed it. She's not mad. She's a little mad.",None),
 ('mh_3','mom',"Don't step on my tulips. Or the mines. But mostly the tulips.",None),
 ('mh_4','mom',"Your old room is exactly how you left it. Except for the mines. Those are new.",None),
 ('mh_win','mom',"My baby cleared the whole yard! Come inside, dinner's getting cold. Bring your friend with the radio.",None),
 ('rh_1','reyes',"Sweeper, Overlord. I'm told this is your mother's backyard. I want you to treat it like any other warzone. With respect.",None),
 ('rh_2','reyes',"Your mother has offered Command a casserole. We have accepted. Morale is very high.",None),
 ('dh_1','dez',"Yo! Sweeper! Your mom invited me! This backyard is sick. We're doing the afterparty here.",None),
 ('kh_1','kova',"I'm sorry I mined your mother's garden. I thought it was a test site. It was a vegetable patch.",None),
 ('jh_1','jenkins',"Your mom gave me a sandwich. Sweeper. Your mom is the best commander I've ever had.",None),
 ('qh_1','qm',"Quartermaster here. Garden gnome flag skin available. It judges you silently.",None),
 ('wh_1','whisper',"You came home, Sweeper. But the field came with you. The field always comes with you.",None),
 ('wh_2','whisper',"I am not a ghost, Sweeper. I am not a spy. I am the minefield. I have always been the minefield.",None),
 # --- shared pool
 ('rg_1','reyes',"Sweeper, your performance review is next week. Topics include clicking, flagging, and your attitude towards Big Dez.",None),
 ('rg_2','reyes',"Remember, Sweeper. Every tile you clear today is a tile you don't have to clear tomorrow. Unless there's a sequel.",None),
 ('jg_1','jenkins',"Sweeper, do you ever think about how the numbers know? Like, how does the one know?",None),
 ('jg_2','jenkins',"I started a fan club for you. It's just me so far. I'm the president, the treasurer, and the snacks.",None),
 ('kg_1','kova',"Small update. The neural interface subscription now includes ads. They play directly in your dreams.",None),
 ('qg_1','qm',"Bundle alert, Sweeper. Five flags, a hat, and a sense of purpose. Forty nine ninety nine.","Bundle alert, Sweeper. Five flags, a hat, and a sense of purpose. 49.99."),
 ('mg_1','mom',"Sweetie, I joined a forum about minesweeping. Everyone there is very angry about the number eight.",None),
 ('dg_1','dez',"Sweeper! I made you a VIP card! It's laminated! You know how serious lamination is!",None),
 ('wg_1','whisper',"Do you hear it, Sweeper? Every click is a question. Every number is an answer. Every mine is rude.",None),
]

outpath = os.path.join(HERE, 'voices2.json')
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
