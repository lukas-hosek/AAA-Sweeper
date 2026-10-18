/**
 * texts.js: tips, loading messages, lore fragments, death quotes and rank titles.
 */


// Gameplay tips: shown in the tip box during play and on the loading screen
export const GAMEPLAY_TIPS = [
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


// Status lines of the loading bar
export const LOADING_MESSAGES = [
	'Downloading more RAM',
	'Reticulating mines',
	'Streaming 8K tile textures',
	'Compiling shaders (again)',
	'Placing quest markers',
	'Waking up Big Dez',
	'Calibrating regenerating health',
	'Verifying you are not a robot',
];


// Lore fragments, in the order they are found (the counter claims 400)
export const LORE_FRAGMENTS = [
	'Journal, day 3: the numbers never lie. The numbers do, however, occasionally exaggerate.',
	'Requisition form 4471: one (1) flag, red. DENIED. Reason: flags are premium now.',
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


// Quotes on the death screen
export const DEATH_QUOTES = [
	{text: 'The mine does not hate you. The mine simply is.', source: 'Field Manual 7-B, chapter "Feelings"'},
	{
		text: 'Every square you leave unflagged is a square that will betray you.',
		source: 'Gen. Ada Whitlock, Mine War I',
	},
	{text: 'I clicked, therefore I was.', source: 'Unknown Sweeper'},
	{text: 'Regenerating health is a privilege, not a right.', source: 'Megalith Interactive Terms of Service, §14.2'},
	{text: 'Courage is clicking a fifty-fifty and not telling anyone.', source: 'Sgt. Ilya Brandt'},
];


// Rank title per level (the last one repeats beyond)
export const RANK_TITLES = [
	'RECRUIT',
	'PRIVATE',
	'SPECIALIST',
	'CORPORAL',
	'SERGEANT',
	'STAFF SERGEANT',
	'LIEUTENANT',
	'CAPTAIN',
	'MAJOR',
	'COLONEL',
	'MINE GENERAL',
	'SWEEPLORD',
];


/** The rank title shown for a level (1-based). */
export function RankTitle(level) {
	return RANK_TITLES[Math.min(RANK_TITLES.length - 1, level - 1)];
}
