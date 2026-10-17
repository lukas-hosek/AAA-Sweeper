// data/dialogue.js — Characters (radio cast), subtitle text for the first voice batch, per-chapter chatter arcs, quest-on-line triggers, pinned voice ids.
import {VOICES} from './voice-manifest.js';

/* ================= data ================= */
export const CHAR={
  reyes:{name:'Cmdr. Reyes',tag:'OVERLORD',chan:2,color:'#f4b740',radio:true},
  kova:{name:'Dr. Mirela Kova',tag:'NEUROTECH LABS',chan:7,color:'#ff6fb1',radio:true},
  dez:{name:'Big Dez',tag:'DA CLUB',chan:69,color:'#9bff4a',radio:true},
  qm:{name:'Quartermaster Pryce',tag:'SUPPLY',chan:4,color:'#4fd8ff',radio:true},
  mom:{name:'Mom',tag:'HOME · MOBILE',chan:1,color:'#ffb48a',radio:true,phone:true},
  jenkins:{name:'Pvt. Jenkins',tag:'SQUAD',chan:3,color:'#8fb8ff',radio:true},
  whisper:{name:'???',tag:'ENCRYPTED',chan:0,color:'#c9c9d6',radio:true,eerie:true},
  dj:{name:'DJ Detonator',tag:'PA SYSTEM · DA CLUB',chan:69,color:'#ff5cf0',radio:true,pa:true},
  prof:{name:'Prof. Lindqvist',tag:'STATION NORD-7',chan:9,color:'#9ff3ff',radio:true},
  halcyon:{name:'HALCYON',tag:'PATHOS-4 STATION AI',chan:4,color:'#6fe3d6',radio:true,pa:true},
  sys:{name:'SYSTEM',tag:'',color:'#8fd3ff',radio:false},
  announcer:{name:'',tag:'',color:'#fff',radio:false,nosub:true},
};
const PREFIX={r:'reyes',k:'kova',d:'dez',q:'qm',m:'mom',j:'jenkins',w:'whisper',s:'sys',a:'announcer'};
export const whoOf=id=>(VOICES[id]&&VOICES[id].w)||PREFIX[id[0]];
export const lineText=id=>SUBS[id]||(VOICES[id]&&VOICES[id].t)||'';
const SUBS={
  r_start:"Sweeper, this is Overlord. The field is hot. Follow the marker, and nobody else has to die.",
  r_copy:"Sweeper, do you copy? Click the glowing tile. The one with the big arrow over it.",
  r_intel:"Intel says this field is full of mines. That's why they call it a minefield.",
  r_hit1:"Sweeper's hit! Get to cover and let your health regenerate!",
  r_hit2:"Take cover! Just stand still for a bit. Your body can heal from anything.",
  r_hit3:"Was that a mine? Sweeper, the marker was literally right next to it.",
  r_area:"Good effect on target! Area cleared!",
  r_idle:"Sweeper, why have you stopped? The marker is right there. It's glowing.",
  r_flag:"Mine marked. Good eye, Sweeper.",
  r_win:"Field is clear! Outstanding work, Sweeper. Now get back to base. We've got another field. And forty more after that.",
  r_dead:"Sweeper's down! Sweeper's down! Somebody reload the checkpoint!",
  r_push:"Keep pushing, Sweeper! Those tiles won't reveal themselves!",
  r_half:"You're halfway there, Sweeper. I've seen men give up at halfway. Don't be those men.",
  k_1:"Hey! I'm sorry for double-crossing you. When you have time, come by my office and I'll upgrade that minesweeping neural interface for you.",
  k_2:"Sweeper, it's Mirela. I know you're still mad. The upgrade offer stands. No strings attached. Mostly.",
  k_3:"Okay, full disclosure. The neural interface upgrade has a small subscription fee. 9.99 a month.",
  k_4:"I may have also planted some of these mines. In my defense, it was a very confusing week.",
  k_5:"The upgrade is ready. It shows you which tiles are safe. Oh. You already have that. Never mind.",
  k_dead:"Don't worry, Sweeper. I can rebuild you. Better. Faster. With a monthly subscription.",
  d_1:"Yoo, Sweeper, where you been? Get yo ass in da club immediately!",
  d_2:"Sweeper! The club is open, the DJ is waiting, and you're out there clicking squares? Come on, man!",
  d_3:"Bro. I put you on the guest list three times. Three times! The bouncer thinks you're a myth.",
  d_4:"Okay. I'm not mad. I'm just saying. The club is very sad without you.",
  d_5:"That's it. If you won't come to the club, the club is coming to you! Drop it!",
  d_win:"Yo, you done? You done? Club. Now. I'm sending a car.",
  q_1:"Sweeper, Quartermaster here. New flag skins have just arrived. Gold, chrome, and one that plays a little tune.",
  q_2:"A reminder that your premium battle pass expires in four hours. No pressure. Some pressure.",
  q_3:"Those mines won't flag themselves. Unless you buy the auto-flag bundle. 12.99.",
  q_4:"Limited time offer, Sweeper. Buy one flag, get one flag. That's two flags.",
  m_1:"Hi sweetie, it's Mom. I don't really understand your job, but please don't step on anything.",
  m_2:"Your cousin's wedding is on Saturday, and you still haven't answered the invitation. Also, are you eating?",
  m_3:"Your father wants to know if minesweeping comes with a pension plan.",
  m_4:"I saw on the news there was an explosion. Was that you? Call me back.",
  j_1:"Whoa, nice click, Sweeper! I couldn't have clicked that better myself!",
  j_2:"I've marked the safe tile on your HUD. And on your compass. And on the minimap. And in the sky.",
  j_3:"I'll hold this position! ...I'm just gonna stand here, actually. Holding.",
  j_lore:"Ooh, a collectible! That's one of four hundred!",
  j_low:"Sweeper, you're bleeding pixels! Stay away from the mines!",
  j_4:"Follow me, Sweeper! Actually, you follow the marker. I'll follow you.",
  w_1:"The mines were here before us, Sweeper. They will be here after.",
  w_2:"Every number tells a story. Most of those stories are about mines.",
  w_3:"You think you're clearing the field. But the field is clearing you.",
  s_quest:"New quest available.", s_ach:"Achievement unlocked.", s_save:"Autosave complete.", s_crit:"Warning. Health critical.", s_level:"Level up.", s_drop:"Supply drop incoming.",
  a_title:"Triple A Sweeper. Remastered. Definitive. Game of the Year Edition.", a_complete:"Mission complete.",
};
export const QUEST_ON_LINE={k_1:'kova',d_1:'club',m_1:'mom',q_1:'qm',w_1:'whisper',kd_1:'kova',dd_1:'club',md_1:'mom',qd_1:'qm',wd_1:'whisper',kc_1:'kova',mc_1:'mom',qc_1:'qm',wc_1:'whisper',pa_1:'prof',ka_1:'kova',ma_1:'mom',qa_1:'qm',da_1:'club',wa_1:'whisper',mh_1:'dinner',kh_1:'kova',qh_1:'qm',wh_1:'whisper',dh_1:'club',kp_1:'kova',dp_1:'club',mp_1:'mom',qp_1:'qm',wp_1:'whisper',hc_1:'halcyon'};
export const CHAT={
  battle:{open:['k_1','d_1'],fav:['dez','kova'],arcs:{kova:['k_1','k_2','k_3','k_4','k_5'],dez:['d_1','d_2','d_3','d_4','d_5'],mom:['m_1','m_2','m_3'],qm:['q_1','q_2','q_3','q_4'],jenkins:['j_2','j_3','j_4'],whisper:['w_1','w_2','w_3'],reyes:['r_copy','r_intel','r_push']}},
  desert:{open:['kd_1','dd_1'],fav:['reyes','jenkins'],arcs:{reyes:['rd_1','rd_2','rd_3'],jenkins:['jd_1','jd_2','jd_3'],kova:['kd_1','kd_2'],dez:['dd_1','dd_2'],mom:['md_1','md_2'],qm:['qd_1','qd_2'],whisper:['wd_1','wd_2']}},
  club:{open:['dj_1','mc_1'],fav:['dez','dj'],arcs:{dez:['dc_1','dc_2','dc_3','dc_4'],dj:['dj_1','dj_2','dj_3','dj_5'],reyes:['rc_1','rc_2'],kova:['kc_1','kc_2'],jenkins:['jc_1','jc_2'],mom:['mc_1','mc_2'],qm:['qc_1'],whisper:['wc_1']}},
  arctic:{open:['pa_1','da_1'],fav:['prof'],favW:4,shuf:['prof'],arcs:{prof:['pa_1','pa_2','pa_3','pa_4','pa_5','pa_6','pa_7','pa_8','pa_9','pa_10','pa_11','pa_12','pa_13','pa_14','pa_15','pa_16','pa_17','pa_18','pa_19','pa_20','pa_21','pa_22','pa_23','pa_24'],reyes:['ra_1','ra_2'],jenkins:['ja_1','ja_2'],kova:['ka_1'],mom:['ma_1'],qm:['qa_1'],dez:['da_1'],whisper:['wa_1']}},
  pathos:{open:['hc_1','jp_1'],fav:['halcyon','reyes'],arcs:{halcyon:['hc_1','hc_2','hc_3'],reyes:['rp_1'],jenkins:['jp_1','jp_2'],kova:['kp_1','kp_2'],dez:['dp_1'],mom:['mp_1'],qm:['qp_1'],whisper:['wp_1','wp_2']}},
  home:{open:['mh_1','rh_1'],fav:['mom'],arcs:{mom:['mh_1','mh_2','mh_3','mh_4'],reyes:['rh_1','rh_2'],dez:['dh_1'],kova:['kh_1'],jenkins:['jh_1'],qm:['qh_1'],whisper:['wh_1']}},
};
export const SHARED=['rg_1','rg_2','jg_1','jg_2','kg_1','qg_1','mg_1','dg_1','wg_1'];
export const REPEATS=['r_copy','r_push','j_2','q_4','k_2','d_2','m_2','w_2','j_3','q_2','r_intel','d_3','k_4','m_3','j_4','q_3','d_4','rd_1','jd_3','dc_2','dj_2','pa_2','ja_1','mh_3','kg_1','jg_1','qd_2','rg_2','dg_1'];
export const PIN=new Set(['r_hit1','r_hit2','r_hit3','r_hit4','r_hit5','j_hit','r_flag','r_flag2','r_flag3','r_area','r_area2','j_area','r_idle','r_idle2','j_idle','j_low','s_crit','s_ach','s_level','s_quest','s_save','s_drop','s_obj','s_skill','s_season','s_store','s_chal','s_check','r_dead','k_dead','j_lore','r_lore','j_1','j_respawn','m_4','r_half','a_complete','rp_2','rp_flood','hc_flood','s_flood','s_breach']);
