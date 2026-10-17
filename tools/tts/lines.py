"""Every voice line in the game, grouped in the batches they were generated in.

Each entry is (id, speaker, text_for_tts) in batch 1, and (id, speaker, text_for_tts, subtitle_or_None)
in later batches. The TTS text spells numbers out ("forty thousand") so the voice reads them well;
the subtitle shows the written form ("40,000"). None means "same as the TTS text".

Batch 1 subtitles are NOT taken from here: they live in SUBS in js/data/dialogue.js (keep both in sync),
and its speaker comes from the id prefix (PREFIX in js/data/dialogue.js). Later batches store speaker and
subtitle in js/data/voice-manifest.js, written by generate_voices.py.

Id conventions: <speaker letter><chapter letter>_<n>. Speaker: r Reyes, k Kova, d Dez, q Quartermaster,
m Mom, j Jenkins, w whisper, s system, a announcer, dj DJ, p Prof. Lindqvist, hc HALCYON.
Chapter letter: none = Sector B-4, d = desert, c = club, a = arctic, p = Pathos-4, h = home, g = generic.
"""

# speaker -> (Kokoro voice, speed). Voices starting with "b" are British English, "a" American English.
VOICE = {
    'reyes': ('am_onyx', 1.0), 'kova': ('af_bella', 1.0), 'dez': ('am_puck', 1.12), 'qm': ('bm_george', 1.05),
    'mom': ('af_heart', 1.0), 'jenkins': ('am_liam', 1.15), 'whisper': ('bm_lewis', 0.8), 'sys': ('af_nova', 0.95),
    'announcer': ('am_fenrir', 0.82), 'dj': ('am_michael', 1.12), 'prof': ('bf_alice', 0.98), 'halcyon': ('af_sky', 0.92),
}

# ---- batch 1: the original cast (Sector B-4), 40 kbps
BATCH1 = [
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

# ---- batch 2: chapters 2-4, event variants, DJ, Prof. Lindqvist
BATCH2 = [
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

# ---- batch 3: Pathos-4 and HALCYON
BATCH3 = [
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

# ---- batch 4: 20 more Prof. Lindqvist lines (Station Nord-7 only)
BATCH4 = [
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


# batch settings: MP3 bitrate, and whether speaker + subtitle go into the manifest
BATCHES = [
    {'name': 'batch1', 'bitrate': '40k', 'manifest_text': False, 'lines': BATCH1},
    {'name': 'batch2', 'bitrate': '32k', 'manifest_text': True, 'lines': BATCH2},
    {'name': 'batch3', 'bitrate': '32k', 'manifest_text': True, 'lines': BATCH3},
    {'name': 'batch4', 'bitrate': '32k', 'manifest_text': True, 'lines': BATCH4},
]
