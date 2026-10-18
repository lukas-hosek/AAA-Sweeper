/**
 * store.js: perks, flag skins, store items and the loot table.
 */


// Perks bought with skill points. Their effects are checked by id where they apply.
export const PERKS = [
	{id: 'thick', name: 'Thick Skin', description: 'Mines deal 25% less damage.'},
	{id: 'wind', name: 'Second Wind', description: 'Health starts regenerating 1.5 s sooner.'},
	{id: 'scholar', name: 'Mine Scholar', description: '+25% XP from all sources.'},
	{id: 'beacon', name: 'Bigger Marker', description: 'The quest marker is 50% larger. You asked for this.'},
	{id: 'lucky', name: 'Lucky Find', description: 'Supply drops arrive twice as often.'},
];


// Flag skins: the flag drawn on flagged tiles, by skin id
export const FLAG_SKINS = {
	red: {name: 'Standard Flag', fillColor: '#ff4a4a', outlineColor: '#a5111b'},
	gold: {name: 'Golden Flag', fillColor: '#fff0a0', outlineColor: '#c38b16'},
	chrome: {name: 'Chrome Flag', fillColor: '#ffffff', outlineColor: '#6f7d88'},
	tune: {name: 'Musical Flag', fillColor: '#9b8bff', outlineColor: '#20c7d8'},
};


// Store items. type: skin (equippable flag), boost (double XP), crate (loot roll), iap (the joke 'real money' bundle)
export const STORE_ITEMS = [
	{id: 'gold', name: 'Golden Flag', description: 'Flags, but gold. Identical hitbox.', price: 300, type: 'skin'},
	{
		id: 'chrome',
		name: 'Chrome Flag',
		description: 'Reflects the mines. Path-traced, allegedly.',
		price: 300,
		type: 'skin',
	},
	{
		id: 'tune',
		name: 'Musical Flag',
		description: 'Plays a little tune when planted. You cannot turn it off.',
		price: 450,
		type: 'skin',
	},
	{
		id: 'xp2',
		name: 'XP Booster ×2',
		description: 'Double XP for 5 minutes. Stacks with nothing.',
		price: 200,
		type: 'boost',
	},
	{
		id: 'crate',
		name: 'Supply Crate',
		description: 'Contains one random item. Odds disclosed on request. Do not request.',
		price: 150,
		type: 'crate',
	},
	{
		id: 'coins',
		name: '1,000 Sweep Coins',
		description: 'Real-money bundle. Best value!*',
		price: '€9.99',
		type: 'iap',
	},
];


// Loot from supply crates, from most to least common (see FieldEvents for the odds)
export const LOOT_TABLE = [
	{rarity: 'Common', color: '#b9c4cb', name: 'Spray: "Nice Sweep"'},
	{rarity: 'Common', color: '#b9c4cb', name: 'Emote: Thoughtful Click'},
	{rarity: 'Uncommon', color: '#7dff9b', name: 'Banner: Sector B-4 Survivor'},
	{rarity: 'Rare', color: '#6fb6ff', name: 'Title: The Unexploded'},
	{rarity: 'Epic', color: '#c48bff', name: 'Voice line: Big Dez says your name (wrong)'},
	{rarity: 'Legendary', color: '#ffcf5a', name: 'Golden Shovel (cosmetic, invisible)'},
];
