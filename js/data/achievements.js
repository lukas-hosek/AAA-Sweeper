/**
 * achievements.js: every achievement, keyed by the id that achievements.Unlock() takes (ui/achievements.js).
 */


export const ACHIEVEMENTS = {
	first: {name: 'First Click', description: 'Click a tile. Any tile.', gamerscore: 5},
	ten: {name: 'Baby Steps', description: 'Reveal 10 tiles.', gamerscore: 10},
	cascade: {name: 'Area Denial', description: 'Clear 20 or more tiles with one click.', gamerscore: 15},
	ouch: {name: 'Ouch', description: 'Step on a mine. On purpose, we assume.', gamerscore: 10},
	respects: {name: 'Paying Respects', description: 'Press F.', gamerscore: 5},
	quest: {name: 'Required Reading', description: 'Open the quest log.', gamerscore: 5},
	follow: {name: 'Follow the Leader', description: 'Click the quest marker 10 times.', gamerscore: 15},
	rebel: {name: 'Independent Thinker', description: 'Click a tile the quest marker did not ask for.', gamerscore: 20},
	lore: {name: 'Lore Enjoyer', description: 'Find a lore fragment.', gamerscore: 10},
	whale: {name: 'Whale Watching', description: 'Buy something in the store.', gamerscore: 10},
	club: {name: 'Club Kid', description: 'The club came to you.', gamerscore: 25},
	dead: {name: 'Death Is Temporary', description: 'Die. Respawn. Carry on.', gamerscore: 10},
	idle: {name: 'Patience Is a Virtue', description: 'Do nothing for 20 seconds.', gamerscore: 5},
	listener: {name: 'Loyal Listener', description: 'Receive 10 radio transmissions.', gamerscore: 15},
	skill: {name: 'Build Crafting', description: 'Spend a skill point.', gamerscore: 5},
	crate: {name: 'Loot Goblin', description: 'Open a supply drop.', gamerscore: 10},
	win: {name: 'Clean Sweep', description: 'Clear the field.', gamerscore: 50},
	ch2: {name: 'Sand Between Your Toes', description: 'Clear the Dune Sea.', gamerscore: 25},
	ch3: {name: 'VIP', description: 'Clear Da Club.', gamerscore: 25},
	ch4: {name: 'Cold Feet', description: 'Clear Station Nord-7.', gamerscore: 25},
	ch5: {name: 'Home Sweet Mine', description: "Clear Mom's Backyard.", gamerscore: 50},
	timesaver: {name: 'Time Is Money', description: 'Buy the Time Saver Pack.', gamerscore: 5},
	credits: {name: 'Credits Enjoyer', description: 'Watch all 1,412 credits.', gamerscore: 50},
	skipcred: {name: 'Ungrateful', description: 'Skip the credits.', gamerscore: 0},
	chP: {name: 'Pressure Test', description: 'Clear Pathos-4.', gamerscore: 25},
	dryrun: {name: 'Dry Run', description: 'Clear Pathos-4 before it floods.', gamerscore: 25},
	breath: {name: 'Breathtaking', description: 'Clear Pathos-4 while holding your breath.', gamerscore: 25},
};
