/**
 * chapters.js: the campaign, one Chapter per entry.
 *
 * Adding a chapter: write its Tileset, Scenery and MusicTheme subclasses, add an entry here, and give it chatter lines
 * in data/chatter.js. Don't import this module from game.js, field.js or anything under render/: the sceneries and
 * tilesets below must be loaded before this list is built, which an import cycle back to here would prevent.
 */
import {ArcticScenery} from '../render/scenery/arctic-scenery.js';
import {BackyardScenery} from '../render/scenery/backyard-scenery.js';
import {BattlefieldScenery} from '../render/scenery/battlefield-scenery.js';
import {ClubScenery} from '../render/scenery/club-scenery.js';
import {DesertScenery} from '../render/scenery/desert-scenery.js';
import {PathosScenery} from '../render/scenery/pathos-scenery.js';
import {BulkheadTileset} from '../render/tilesets/bulkhead-tileset.js';
import {DanceFloorTileset} from '../render/tilesets/dance-floor-tileset.js';
import {IceTileset} from '../render/tilesets/ice-tileset.js';
import {LawnTileset} from '../render/tilesets/lawn-tileset.js';
import {SandstoneTileset} from '../render/tilesets/sandstone-tileset.js';
import {SteelTileset} from '../render/tilesets/steel-tileset.js';
import {Chapter} from './chapter.js';


/** Every chapter in campaign order. */
export const CHAPTERS = [
	new Chapter({
		id: 'battle',
		name: 'Sector B-4',
		chapterLabel: 'CHAPTER ONE',
		operation: 'Operation: Clean Sweep',
		localTime: '06:42 LOCAL',
		questGiver: 'CMDR. REYES',
		description: 'Command has ordered you to clear Sector B-4 before the season ends. The season ends in 3 days, 14 hours. A glowing marker will tell you where to click, so you never have to think.',
		announcerLine: 'a_ch1',
		openingLine: 'r_start',
		victoryLines: ['r_win', 'd_win'],
		achievement: null,
		musicTheme: 'game',
		tileset: new SteelTileset(),
		sceneryClass: BattlefieldScenery,
		screenClass: '',
		isClub: false,
		floods: false,
	}),
	new Chapter({
		id: 'desert',
		name: 'The Dune Sea',
		chapterLabel: 'CHAPTER TWO',
		operation: 'Operation: Desert Sweep',
		localTime: '12:14 LOCAL · 44 °C',
		questGiver: 'CMDR. REYES',
		description: 'Someone has mined the Dune Sea. Possibly Dr. Kova. Clear it before the sandstorm, or during the sandstorm. Command is flexible.',
		announcerLine: 'a_ch2',
		openingLine: 'rd_start',
		victoryLines: ['rd_win', 'r_win2'],
		achievement: 'ch2',
		musicTheme: 'desert',
		tileset: new SandstoneTileset(),
		sceneryClass: DesertScenery,
		screenClass: '',
		isClub: false,
		floods: false,
	}),
	new Chapter({
		id: 'club',
		name: 'Da Club',
		chapterLabel: 'CHAPTER THREE',
		operation: 'Operation: Get In Da Club',
		localTime: '01:30 LOCAL · 124 BPM',
		questGiver: 'BIG DEZ',
		description: 'You are finally in da club. The dance floor is mined. Big Dez would like it cleared before the drop.',
		announcerLine: 'a_ch3',
		openingLine: 'dc_start',
		victoryLines: ['dc_win', 'dj_4'],
		achievement: 'ch3',
		musicTheme: 'club',
		tileset: new DanceFloorTileset(),
		sceneryClass: ClubScenery,
		screenClass: 'is-club-chapter',
		isClub: true,
		floods: false,
	}),
	new Chapter({
		id: 'arctic',
		name: 'Station Nord-7',
		chapterLabel: 'CHAPTER FOUR',
		operation: 'Operation: Cold Sweep',
		localTime: '22:05 LOCAL · −40 °C',
		questGiver: 'PROF. LINDQVIST',
		description: 'A research station in the Arctic has found mines under the ice. The professor would like them removed so she can get back to studying ice.',
		announcerLine: 'a_ch4',
		openingLine: 'ra_start',
		victoryLines: ['ra_win2', 'r_win2'],
		achievement: 'ch4',
		musicTheme: 'arctic',
		tileset: new IceTileset(),
		sceneryClass: ArcticScenery,
		screenClass: '',
		isClub: false,
		floods: false,
	}),
	new Chapter({
		id: 'pathos',
		name: 'Pathos-4',
		chapterLabel: 'CHAPTER FIVE',
		operation: 'Operation: Deep Sweep',
		localTime: '−300 M · HULL INTEGRITY 40%',
		questGiver: 'CMDR. REYES',
		description: 'An underwater research base is flooding, and it is full of mines. Clear it before the water reaches the ceiling. Or after. Command is not your mother.',
		announcerLine: 'a_ch5p',
		openingLine: 'rp_start',
		victoryLines: ['rp_win', 'hc_win'],
		achievement: 'chP',
		musicTheme: 'pathos',
		tileset: new BulkheadTileset(),
		sceneryClass: PathosScenery,
		screenClass: 'is-pathos-chapter',
		isClub: false,
		floods: true,
	}),
	new Chapter({
		id: 'home',
		name: "Mom's Backyard",
		chapterLabel: 'CHAPTER SIX',
		operation: 'Operation: Come Home',
		localTime: '18:30 LOCAL · DINNER SOON',
		questGiver: 'MOM',
		description: 'You finally came home. Your father was gardening. With mines. Clear the lawn before dinner gets cold.',
		announcerLine: 'a_ch6',
		openingLine: 'mh_start',
		victoryLines: ['mh_win', 'wh_2'],
		achievement: 'ch5',
		musicTheme: 'home',
		tileset: new LawnTileset(),
		sceneryClass: BackyardScenery,
		screenClass: '',
		isClub: false,
		floods: false,
	}),
];


/** The chapter of field number `fieldNumber` (1-based). Numbers past the last chapter wrap around for New Game+. */
export function ChapterForNumber(fieldNumber) {
	return CHAPTERS[(fieldNumber - 1) % CHAPTERS.length];
}
