/**
 * concept-art-gallery.js: the concept art beside the credits roll, cross-fading from one sheet to the next.
 */
import {EscapeHtml, FindElement} from '../../core/dom.js';
import {CastSheet} from './concept-art/cast-sheet.js';
import {MarkerSheet} from './concept-art/marker-sheet.js';
import {MineSheet} from './concept-art/mine-sheet.js';
import {SceneryStudySheet} from './concept-art/scenery-study-sheet.js';
import {TileSheet} from './concept-art/tile-sheet.js';


/**
 * Ten sheets, painted when shown at the frame's current size. Two canvases take turns: the new sheet fades in on
 * one while the old one fades out on the other.
 */
export class ConceptArtGallery {
	#sheets = [
		new SceneryStudySheet('battle', 'SECTOR B-4 · KEY ART', 'sectorB4_keyart_v3_FINAL.png', [
			{x: 0.05, y: 0.12, text: 'more fog?'},
			{x: 0.55, y: 0.2, text: 'sun too nice', arrowTo: [0.83, 0.57]},
			{x: 0.06, y: 0.5, text: 'tower = iconic', arrowTo: [0.16, 0.38]},
		], 'Sector B-4, key art'),
		new CastSheet('Cast, character sheet'),
		new SceneryStudySheet('desert', 'THE DUNE SEA · EXPLORATION', 'dunesea_explore_v7.png', [
			{x: 0.05, y: 0.12, text: 'is this too much sand'},
			{x: 0.55, y: 0.07, text: 'vultures stay', arrowTo: [0.24, 0.22]},
			{x: 0.08, y: 0.88, text: 'camels (cut for budget)'},
		], 'The Dune Sea, early exploration'),
		new MineSheet('The mine, iterations'),
		new SceneryStudySheet('club', 'DA CLUB · LIGHTING PASS', 'daclub_lighting_v12_dezapproved.png', [
			{x: 0.3, y: 0.16, text: 'MORE LASERS'},
			{x: 0.55, y: 0.42, text: 'Dez wants bigger sign', arrowTo: [0.12, 0.45]},
			{x: 0.34, y: 0.9, text: 'bouncer cut for budget'},
		], 'Da Club, lighting pass'),
		new MarkerSheet('Quest marker, readability study'),
		new SceneryStudySheet('arctic', 'STATION NORD-7 · MOOD', 'nord7_mood_v2.png', [
			{x: 0.05, y: 0.1, text: 'aurora = free bloom'},
			{x: 0.5, y: 0.5, text: 'polar bear (DLC)', arrowTo: [0.8, 0.66]},
		], 'Station Nord-7, mood'),
		new TileSheet('Tiles, material study'),
		new SceneryStudySheet('pathos', 'PATHOS-4 · FLOOD STUDY', 'pathos4_flood_v4_wet.png', [
			{x: 0.05, y: 0.24, text: 'wetter'},
			{x: 0.5, y: 0.08, text: 'fish = free content', arrowTo: [0.9, 0.42]},
			{x: 0.08, y: 0.93, text: 'water level: rising (good)'},
		], 'Pathos-4, flood study'),
		new SceneryStudySheet('home', "MOM'S BACKYARD · FINAL", 'momsyard_final_FINAL_final2.png', [
			{x: 0.18, y: 0.68, text: 'gnome is canon', arrowTo: [0.3, 0.84]},
			{x: 0.45, y: 0.1, text: 'tulips: do NOT step'},
			{x: 0.55, y: 0.36, text: 'TV always on', arrowTo: [0.73, 0.52]},
		], "Mom's Backyard, final"),
	];
	#canvasIndex = 0;                   // Which of the two canvases shows the current sheet


	get count() {
		return this.#sheets.length;
	}


	/** Paints sheet `index` and fades it in over the previous one. */
	Show(index) {
		const frame = FindElement('#credits-frame');
		const width = frame.clientWidth;
		const height = frame.clientHeight;
		if (!width || !height) {
			return;
		}
		const canvases = [FindElement('#credits-art-first'), FindElement('#credits-art-second')];
		const next = canvases[this.#canvasIndex ^ 1];
		const current = canvases[this.#canvasIndex];
		this.#canvasIndex ^= 1;
		const sheet = this.#sheets[index];
		let painted;
		try {
			painted = sheet.Paint(width, height);
		} catch (error) {
			// A broken sheet must not stop the credits
			console.error(error);
			return;
		}
		next.width = painted.width;
		next.height = painted.height;
		next.getContext('2d').drawImage(painted, 0, 0);
		// Restart the fade-in: remove the class, force a layout, add it again
		next.classList.remove('is-active');
		void next.offsetWidth;
		next.classList.add('is-active');
		current.classList.remove('is-active');
		FindElement('#credits-caption').innerHTML = `<b>CONCEPT ART</b> · ${EscapeHtml(sheet.caption)} · <span>Claude</span>`;
	}
}


export const conceptArt = new ConceptArtGallery();
