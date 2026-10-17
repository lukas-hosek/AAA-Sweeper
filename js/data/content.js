// data/content.js — Static game content: side quests, achievements, tips, lore, quotes, ranks, perks, store items, flag skins, loot, difficulties, number colours.
import {ST} from '../core/shared.js';
import {ownedSkins} from '../core/storage.js';

export const SIDE={
  kova:{name:'Neural Interface Upgrade',giver:'Dr. Mirela Kova',who:'kova',desc:"Dr. Kova double-crossed you. Now she wants to upgrade the neural interface in your head. She says she's sorry.",obj:()=>'Visit Dr. Kova’s office · 3.2 km',brg:251,dist:'3.2 km',act:'TRACK'},
  club:{name:'Get Yo Ass In Da Club',giver:'Big Dez',who:'dez',desc:'Big Dez needs you in the club. Immediately. He has been very clear about this.',obj:()=>ST.G&&ST.G.theme.bg==='club'?'You are in da club':ST.G&&ST.G.clubDone?'The club came to you':'Get in da club · 2,400 km',brg:137,dist:'2,400 km',act:'TRACK'},
  mom:{name:'Call Your Mother',giver:'Mom',who:'mom',desc:"She's worried. She's always worried. It's been eleven days.",obj:()=>ST.G&&ST.G.theme.bg==='home'?'Visit in person instead':'Call Mom back',brg:312,dist:'HOME',act:'CALL'},
  qm:{name:'Premium Flag Collector',giver:'Quartermaster Pryce',who:'qm',desc:'Own every premium flag skin. For morale.',obj:()=>`Own premium flags (${ownedSkins()}/3)`,brg:40,dist:'800 m',act:'OPEN STORE'},
  whisper:{name:'Whispers in the Field',giver:'???',who:'whisper',desc:'Someone is speaking on an encrypted channel. The signal seems to come from under the tiles.',obj:()=>'Find the source of the voice · ???',brg:0,dist:'???',act:'TRACK'},
  prof:{name:'Ice Core Samples',giver:'Prof. Lindqvist',who:'prof',desc:'The professor needs ice core samples. She also needs you to not explode near the ice core samples.',obj:()=>'Collect ice core samples (0/12) · Not implemented',brg:200,dist:'1.1 km',act:'TRACK'},
  dinner:{name:'Dinner Is Ready',giver:'Mom',who:'mom',desc:'Mom made your favourite. It will be ready when the lawn is clear.',obj:()=>ST.G&&ST.G.won?'Go inside':'Clear the lawn before dinner gets cold',brg:15,dist:'12 m',act:'TRACK'},
  halcyon:{name:'Rate Your Stay',giver:'HALCYON',who:'halcyon',desc:'The station AI would like you to rate your stay at Pathos-4. Before you drown, ideally.',obj:()=>'Leave a 5-star review · Not implemented',brg:270,dist:'300 m ↑',act:'TRACK'},
};
export const ACH={
  first:['First Click','Click a tile. Any tile.',5], ten:['Baby Steps','Reveal 10 tiles.',10], cascade:['Area Denial','Clear 20 or more tiles with one click.',15],
  ouch:['Ouch','Step on a mine. On purpose, we assume.',10], respects:['Paying Respects','Press F.',5], quest:['Required Reading','Open the quest log.',5],
  follow:['Follow the Leader','Click the quest marker 10 times.',15], rebel:['Independent Thinker','Click a tile the quest marker did not ask for.',20],
  lore:['Lore Enjoyer','Find a lore fragment.',10], whale:['Whale Watching','Buy something in the store.',10], club:['Club Kid','The club came to you.',25],
  dead:['Death Is Temporary','Die. Respawn. Carry on.',10], idle:['Patience Is a Virtue','Do nothing for 20 seconds.',5], listener:['Loyal Listener','Receive 10 radio transmissions.',15],
  skill:['Build Crafting','Spend a skill point.',5], crate:['Loot Goblin','Open a supply drop.',10], win:['Clean Sweep','Clear the field.',50], ch2:['Sand Between Your Toes','Clear the Dune Sea.',25], ch3:['VIP','Clear Da Club.',25], ch4:['Cold Feet','Clear Station Nord-7.',25], ch5:['Home Sweet Mine',"Clear Mom's Backyard.",50], timesaver:['Time Is Money','Buy the Time Saver Pack.',5], credits:['Credits Enjoyer','Watch all 1,412 credits.',50], skipcred:['Ungrateful','Skip the credits.',0], chP:['Pressure Test','Clear Pathos-4.',25], dryrun:['Dry Run','Clear Pathos-4 before it floods.',25], breath:['Breathtaking','Clear Pathos-4 while holding your breath.',25],
};
export const TIPS=[
  'Numbers show how many mines touch a tile. The mines are the dangerous part.',
  'Right-click to plant a flag. On a touch screen, press and hold, or turn on Flag Mode.',
  'Health regenerates when you are not exploding.',
  'The quest marker marks the quest.',
  'Click a number whose mines are all flagged to clear its neighbours in one go.',
  'You can open the quest log to view your quests. [J]',
  'Unspent skill points are skill points you have not spent. [K]',
  'Premium flags have the same hitbox as regular flags. They just feel better.',
  'Press F to pay respects.',
  'Avoid mines.',
  'Supply drops land on cleared tiles. Click the crate before another player loots it.',
  'Lore fragments are hidden under safe tiles. There are 400 of them. There are 5 of them in this field.',
  'Each chapter has its own tiles, its own music, and its own people who will not stop calling you.',
  'Blood on the screen means you are hurt. Wait for it to fade. Do not wipe your monitor.',
  'Health does not regenerate faster at home. Mom says it does.',
  'When the base floods, hold your breath. You do not need to actually hold your breath.',
];
export const LOADING=['Downloading more RAM','Reticulating mines','Streaming 8K tile textures','Compiling shaders (again)','Placing quest markers','Waking up Big Dez','Calibrating regenerating health','Verifying you are not a robot'];
export const LORE=[
  "Journal, day 3: the numbers never lie. The numbers do, however, occasionally exaggerate.",
  "Requisition form 4471: one (1) flag, red. DENIED. Reason: flags are premium now.",
  "Half a postcard: 'Wish you were here. Watch your step.'",
  "Sticky note: 'If it says 1 and there's already a flag next to it, the rest is fine. Probably.'",
  "Audio log transcript: '...a club? In a minefield? Dez, no.'",
  "Torn page: 'In the beginning there was a nine by nine grid, and it was good.'",
  "Receipt: Neurotech Labs, 'interface upgrade (trial)', 9.99, recurring.",
  "Graffiti on a crate: 'THE MARKER KNOWS.'",
  "Postcard from the Dune Sea: 'The camels say hi. The mines do not.'",
  "VIP wristband, slightly singed. Printed on the back: 'NO MINES ON THE DANCE FLOOR (AGAIN)'.",
  "Field note, Station Nord-7: 'Day 41. The mines have started to hum. I hum back.'",
  "Recipe card in Mom's handwriting: 'Casserole. Serves 4, or 1 sweeper.'",
  "Maintenance log, Pathos-4: 'Leak in section C. Logged it. Leak is now in sections C through Z.'",
];
export const QUOTES=[
  ['The mine does not hate you. The mine simply is.','Field Manual 7-B, chapter "Feelings"'],
  ['Every square you leave unflagged is a square that will betray you.','Gen. Ada Whitlock, Mine War I'],
  ['I clicked, therefore I was.','Unknown Sweeper'],
  ['Regenerating health is a privilege, not a right.','Megalith Interactive Terms of Service, §14.2'],
  ['Courage is clicking a fifty-fifty and not telling anyone.','Sgt. Ilya Brandt'],
];
export const RANKS=['RECRUIT','PRIVATE','SPECIALIST','CORPORAL','SERGEANT','STAFF SERGEANT','LIEUTENANT','CAPTAIN','MAJOR','COLONEL','MINE GENERAL','SWEEPLORD'];
export const PERKS=[
  {id:'thick',name:'Thick Skin',desc:'Mines deal 25% less damage.'},
  {id:'wind',name:'Second Wind',desc:'Health starts regenerating 1.5 s sooner.'},
  {id:'scholar',name:'Mine Scholar',desc:'+25% XP from all sources.'},
  {id:'beacon',name:'Bigger Marker',desc:'The quest marker is 50% larger. You asked for this.'},
  {id:'lucky',name:'Lucky Find',desc:'Supply drops arrive twice as often.'},
];
export const SKINS={red:{name:'Standard Flag',a:'#ff4a4a',b:'#a5111b'},gold:{name:'Golden Flag',a:'#fff0a0',b:'#c38b16'},chrome:{name:'Chrome Flag',a:'#ffffff',b:'#6f7d88'},tune:{name:'Musical Flag',a:'#9b8bff',b:'#20c7d8'}};
export const STORE=[
  {id:'gold',name:'Golden Flag',desc:'Flags, but gold. Identical hitbox.',price:300,type:'skin'},
  {id:'chrome',name:'Chrome Flag',desc:'Reflects the mines. Path-traced, allegedly.',price:300,type:'skin'},
  {id:'tune',name:'Musical Flag',desc:'Plays a little tune when planted. You cannot turn it off.',price:450,type:'skin'},
  {id:'xp2',name:'XP Booster ×2',desc:'Double XP for 5 minutes. Stacks with nothing.',price:200,type:'boost'},
  {id:'crate',name:'Supply Crate',desc:'Contains one random item. Odds disclosed on request. Do not request.',price:150,type:'crate'},
  {id:'coins',name:'1,000 Sweep Coins',desc:'Real-money bundle. Best value!*',price:'€9.99',type:'iap'},
];
export const LOOT=[['Common','#b9c4cb','Spray: "Nice Sweep"'],['Common','#b9c4cb','Emote: Thoughtful Click'],['Uncommon','#7dff9b','Banner: Sector B-4 Survivor'],['Rare','#6fb6ff','Title: The Unexploded'],['Epic','#c48bff','Voice line: Big Dez says your name (wrong)'],['Legendary','#ffcf5a','Golden Shovel (cosmetic, invisible)']];
export const DIFFS={story:{cols:9,rows:9,mines:10,label:'Story'},normal:{cols:16,rows:16,mines:40,label:'Normal'},veteran:{cols:30,rows:16,mines:99,label:'Veteran'}};
export const NUMCOL=['','#55a8ff','#3fe08b','#ff4f60','#a08bff','#ff9b3d','#2fe6d6','#f4f4f4','#a2a9ae'];
