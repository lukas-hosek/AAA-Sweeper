/**
 * credits-text.js: the text of the end credits: title cards, departments and roles, notes, and the closing text.
 * CreditsRoll (scenes/credits/credits-roll.js) expands the templates below into exactly TOTAL_POSITIONS rows.
 */


export const TOTAL_POSITIONS = 1412;       // Every one of them is Claude
export const STUDIO_NOTE_AFTER = 6;         // The crunch note follows the seventh studio
export const STUDIO_NOTE = 'Claude would like to thank Claude for their patience during crunch.';


// Title cards before the roll. `ms`: how long the card stays (default 3600); `braam`: with a movie-trailer braam.
export const OPENING_CARDS = [
	{
		html: '<div class="credits-card-logo"><span>TRIPLE A</span><span>SWEEPER</span></div>'
			+ '<div class="credits-card-subtitle">Remastered · Definitive · Game of the Year Edition</div>',
		ms: 4400,
		braam: true,
	},
	{html: '<div class="credits-card-kicker">A MEGALITH INTERACTIVE PRODUCTION</div><div class="credits-card-name is-small">A CLAUDE GAME</div>'},
	{html: '<div class="credits-card-kicker">DIRECTED BY</div><div class="credits-card-name">CLAUDE</div>', braam: true},
	{html: '<div class="credits-card-kicker">WRITTEN BY</div><div class="credits-card-name">CLAUDE</div>'},
	{
		html: '<div class="credits-card-kicker">ORIGINAL SCORE BY</div><div class="credits-card-name">CLAUDE</div>'
			+ '<div class="credits-card-subtitle">Performed live by the Web Audio API Philharmonic</div>',
	},
	{
		html: '<div class="credits-card-kicker">STARRING</div><div class="credits-card-name is-small">KOKORO TTS</div>'
			+ '<div class="credits-card-subtitle">as Cmdr. Reyes · Dr. Mirela Kova · Big Dez · Quartermaster Pryce · Mom · Pvt. Jenkins · '
			+ 'DJ Detonator · Prof. Lindqvist · ??? · and the System</div>',
		ms: 4800,
	},
	{
		html: '<div class="credits-card-kicker">CREATIVE DIRECTION</div>'
			+ '<div class="credits-card-name is-small">THE PERSON WHO TYPED “TRIPPLE-A”</div>',
		ms: 4200,
	},
];


// Title cards after the roll
export const END_CARDS = [
	{html: '<div class="credits-card-name is-small">THANK YOU FOR PLAYING</div>', ms: 3600},
	{html: '<div class="credits-card-name">THE END</div><div class="credits-card-subtitle">?</div>', ms: 3200, braam: true},
];


// The very last card, after Big Dez's goodbye
export const SEQUEL_CARD = {
	html: '<div class="credits-card-kicker">SWEEPER WILL RETURN IN</div><div class="credits-card-name is-small">TRIPLE A SWEEPER 2</div>'
		+ '<div class="credits-card-subtitle">Double Trouble · Triple Edition · Pre-order now and receive one (1) exclusive flag</div>',
	ms: 4600,
	braam: true,
};


// Features with an associate producer each
export const PRODUCED_FEATURES = [
	'Quest Markers', 'Regenerating Health', 'Radio Chatter', 'Supply Drops', 'The Battle Pass', 'Lore Fragments', 'The Minimap',
	'The Compass', 'Flag Skins', 'Achievements', 'Autosave', 'The Club', "Mom's Calls", 'Blood', 'The Launcher',
];


// Characters with a writer each
export const WRITTEN_CHARACTERS = [
	'Cmdr. Reyes', 'Dr. Mirela Kova', 'Big Dez', 'Quartermaster Pryce', 'Mom', 'Pvt. Jenkins', 'DJ Detonator', 'Prof. Lindqvist',
	'HALCYON', '???',
];


// Art roles credited per chapter, each as Lead, Senior and plain
export const CHAPTER_ART_ROLES = ['Environment Artist', 'Concept Artist', 'Lighting Artist', 'Prop Artist'];


// Engineering disciplines, each with a senior and a plain engineer
export const ENGINEERING_DISCIPLINES = [
	'Gameplay', 'Graphics', 'Rendering', 'Engine', 'Tools', 'UI', 'Audio', 'Physics', 'Build', 'Online', 'Save System', 'Performance',
];


// Languages, each with a translator, a reviewer and linguistic QA
export const LANGUAGES = [
	'Czech', 'German', 'French', 'Spanish', 'Italian', 'Polish', 'Portuguese (Brazil)', 'Japanese', 'Korean',
	'Chinese (Simplified)', 'Chinese (Traditional)', 'Russian', 'Turkish', 'Arabic', 'Dutch', 'Swedish', 'Finnish', 'Hungarian',
	'Ukrainian', 'Romanian', 'Greek', 'Thai', 'Vietnamese', 'Klingon',
];


// The QA studios at the end: each gets STUDIO_ROLES, then QA testers until the total is reached
export const STUDIOS = [
	'Montréal', 'Bucharest', 'Kyiv', 'Shanghai', 'Pune', 'Kraków', 'Austin', 'Cardiff', 'Manila', 'Lyon', 'Sofia',
	'Kuala Lumpur', 'Halifax', 'Osaka',
];


export const STUDIO_ROLES = ['Studio Head', 'Studio Producer', 'Lead Artist', 'Artist', 'Artist', 'Engineer', 'Engineer', 'Designer'];


export const QA_ROLES = [
	'QA Tester', 'QA Tester', 'Senior QA Tester', 'QA Analyst', 'Compliance Tester', 'Click Tester', 'Right-Click Tester',
	'Regression Tester', 'Mine Tester (Respawned)', 'QA Tester', 'Localization Tester', 'Performance Tester',
];


/**
 * The departments in order. `roles` may contain placeholders that CreditsRoll expands:
 * '{features}', '{chapter levels}', '{numbers}', '{characters}', '{chapter art}', '{engineering}', '{languages}'.
 * Entries with `note` are a line of text between departments.
 */
export const DEPARTMENTS = [
	{
		heading: 'DIRECTION',
		roles: [
			'Game Director', 'Creative Director', 'Associate Creative Director', 'Art Director', 'Audio Director',
			'Narrative Director', 'Technical Director', 'Design Director', 'Director of Quest Marker Brightness',
			'Director of Directing',
		],
	},
	{
		heading: 'PRODUCTION',
		roles: [
			'Executive Producer', 'Senior Producer', 'Producer', 'Associate Producer', 'Assistant Producer', 'Production Coordinator',
			'Production Manager', 'Release Manager', 'Scrum Master', 'Agile Coach', 'Jira Archaeologist', 'Meeting Scheduler',
			'Producer of Producers', '{features}',
		],
	},
	{
		heading: 'GAME DESIGN',
		roles: [
			'Lead Game Designer', 'Principal Designer', 'Senior Systems Designer', 'Systems Designer', 'Combat Designer (Clicking)',
			'Economy Designer', 'Progression Designer', 'Flag Designer', 'Quest Marker Designer',
			'Mine Placement Designer (Random)', 'Difficulty Designer', 'Accessibility Designer', '{chapter levels}', '{numbers}',
		],
	},
	{
		heading: 'NARRATIVE',
		roles: [
			'Lead Writer', 'Senior Writer', 'Narrative Designer', 'Bark Writer', 'Barks-per-Minute Consultant',
			'Lore Writer (5 of 400)', 'Subtitle Wrangler', 'Dialogue Coordinator', 'Story Consultant', 'Continuity Supervisor',
			'{characters}',
		],
	},
	{
		heading: 'ART',
		roles: [
			'Lead Artist', 'Principal Artist', '{chapter art}', 'Tile Artist, Brushed Steel', 'Tile Artist, Sandstone',
			'Tile Artist, Dance Floor', 'Tile Artist, Ice', 'Tile Artist, Lawn', 'Tile Artist, Bulkhead', 'VFX Artist, Bubbles',
			'VFX Artist, Caustics', 'Water Level Designer', 'Number Glow Artist', 'VFX Artist, Explosions', 'VFX Artist, Blood',
			'VFX Artist, Lens Flares', 'VFX Artist, Embers', 'VFX Artist, Sand', 'VFX Artist, Snow', 'VFX Artist, Lasers',
			'Technical Artist', 'UI Artist', 'HUD Artist', 'Icon Artist', 'Font Picker', 'Film Grain Specialist', 'Bloom Consultant',
			'Gnome Sculptor', 'Tulip Placement Artist',
		],
	},
	{
		heading: 'ANIMATION',
		roles: [
			'Animation Director', 'Lead Animator', 'Flag Wave Animator', 'Tile Pop Animator', 'Crowd Bobbing Animator',
			'Aurora Animator', 'Vulture Animator', 'Mirror Ball Rotation Animator', 'Mayhem Letter Drop Animator',
			'Mocap Performer (Index Finger)', 'Mocap Performer (Right Click)',
		],
	},
	{
		heading: 'ENGINEERING',
		roles: [
			'Lead Engineer', 'Principal Engineer', 'Chief Architect', '{engineering}', 'Flood Fill Engineer', 'Chord Click Engineer',
			'Shader Compiler Babysitter', 'Anti-Cheat Engineer (Single-Player)', 'Network Engineer (Offline Mode)',
			'Day-One Patch Engineer', 'Launcher-for-the-Launcher Engineer', 'Cloud Saves+ Engineer', 'localStorage Engineer',
			'Regenerating Health Engineer',
		],
	},
	{note: 'Statistically, about 2% of players are still watching at this point. Hello. You are the 2%.'},
	{
		heading: 'AUDIO',
		roles: [
			'Composer', 'Orchestrator', 'Music Supervisor', 'Lead Sound Designer', 'Sound Designer, Explosions',
			'Sound Designer, Radio Squelch', 'Sound Designer, Heartbeat', 'Sound Designer, Tinnitus', 'Foley Artist, Flag Cloth',
			'Foley Artist, Sand', 'Braam Technician', 'Mix Engineer', 'Mastering Engineer',
		],
	},
	{
		heading: 'VOICE & PERFORMANCE',
		roles: [
			'Voice Director', 'Casting Director', 'Dialogue Editor', 'Text-to-Speech Wrangler', 'Radio Filter Engineer',
			'Pronunciation Coach ("Nord Seven")', 'Line Producer',
		],
	},
	{heading: 'LOCALIZATION', roles: ['Localization Director', 'Localization Producer', '{languages}']},
	{note: 'Fun fact: every single name in these credits is Claude.'},
	{
		heading: 'USER RESEARCH',
		roles: [
			'User Research Lead', 'Playtest Coordinator', 'Eye-Tracking Analyst (Quest Marker)', 'Survey Author',
			'Focus Group Snack Coordinator',
		],
	},
	{
		heading: 'LIVE OPS & MONETIZATION',
		roles: [
			'Live Ops Director', 'Battle Pass Architect', 'Sweep Coin Economist', 'Store Curator', 'Time Saver Pack Ethicist',
			'Loot Odds Discloser (Undisclosed)', 'Limited Time Offer Timer Operator', 'Season 7 Showrunner', 'Daily Challenge Designer',
		],
	},
	{
		heading: 'MARKETING & COMMUNITY',
		roles: [
			'Brand Director', 'Brand Manager', 'Trailer Editor', '"Not Actual Gameplay" Disclaimer Placer', 'Community Manager',
			'Social Media Manager', 'Patch Notes Author', 'Influencer Relations', 'Discord Moderator', 'Reply Guy',
		],
	},
	{
		heading: 'LEGAL & BUSINESS',
		roles: [
			'General Counsel', 'Parody Clearance Counsel', 'EULA Author (74 pages)', 'Privacy Officer', 'Business Development',
			'Finance', 'Payroll (Unpaid)',
		],
	},
	{
		heading: 'OPERATIONS',
		roles: [
			'IT Manager', 'IT Support ("Have you tried restarting?")', 'Facilities', 'Office Plant Care', 'Barista',
			'Crunch Pizza Logistics', 'Chief Morale Officer',
		],
	},
	{heading: 'QUALITY ASSURANCE', roles: ['QA Director', 'QA Manager', 'QA Lead', 'Lead Mine Tester']},
];


// After the last row
export const CLOSING_HTML = '<h3>SPECIAL THANKS</h3>'
	+ '<p class="credits-note">The person who typed “Tripple-A”, without whom this game would have been called Minesweeper.</p>\n'
	+ '<p class="credits-note">Voices synthesized with Kokoro TTS, an open-weights speech model. Music, sound and tinnitus performed live '
	+ 'by the Web Audio API in your browser. Built with Canvas 2D and an unreasonable amount of HTML.</p>\n'
	+ '<h3>PRODUCTION BABIES</h3><p class="credits-note">Opus · Sonnet · Haiku</p>\n'
	+ '<h3>NO THANKS TO</h3><p class="credits-note">The mines.</p>\n'
	+ '<p class="credits-note">Unreality® Engine, Mayhem Physics, Blink Video and WWice™ are fictional, as is Megalith Interactive. '
	+ 'Big Dez is real in our hearts. No minesweepers were harmed in the making of this game. Several were exploded.</p>\n'
	+ '<div class="credits-big">1,412 POSITIONS<br>ONE CLAUDE</div>';
