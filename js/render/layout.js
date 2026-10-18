/**
 * layout.js: the responsive layout: picks the wide, mid or narrow HUD layout and places the board.
 */
import {FindElement} from '../core/dom.js';
import {Clamp} from '../core/math.js';
import {game} from '../game/game.js';
import {screens} from '../ui/screen-manager.js';
import {sprites} from './sprite-cache.js';


/** The three HUD layouts; layouts.css styles each through a layout-<kind> class on #game. */
export const LAYOUT_KIND = Object.freeze({
	WIDE: 'wide',        // ≥ 1180 px: HUD panels at the sides of the board
	MID: 'mid',          // ≥ 900 px: panels above and below
	NARROW: 'narrow',    // Phones: compact stacked panels
});


const MIN_TILE_SIZE = 10;
const MAX_TILE_SIZE = 52;


// Space each layout keeps free around the board for the HUD, in CSS pixels
const LAYOUT_MARGINS = {
	[LAYOUT_KIND.WIDE]: {top: 86, bottom: 132, side: 310, minimumWidth: 1180},
	[LAYOUT_KIND.MID]: {top: 176, bottom: 140, side: 16, minimumWidth: 900},
	[LAYOUT_KIND.NARROW]: {top: 134, bottom: 236, side: 12, minimumWidth: 0},
};


// Pathos-4 shows a big flood countdown above the board
const PATHOS_EXTRA_TOP = {[LAYOUT_KIND.WIDE]: 56, [LAYOUT_KIND.MID]: 110, [LAYOUT_KIND.NARROW]: 40};


/** Size of the browser viewport in CSS pixels, and the pixel ratio used for canvases. */
export class Viewport {
	width = innerWidth;
	height = innerHeight;
	pixelRatio = Math.min(2, devicePixelRatio || 1);    // Capped at 2: sharper is not worth the fill rate


	/** Re-reads the viewport size and pixel ratio. */
	Refresh() {
		this.width = innerWidth;
		this.height = innerHeight;
		this.pixelRatio = Math.min(2, devicePixelRatio || 1);
	}
}


/** Where the board sits on screen, in CSS pixels (before the camera offset). */
export class BoardGeometry {
	tileSize = 32;
	x = 0;           // Left edge
	y = 0;           // Top edge
	width = 0;
	height = 0;
}


/** Chooses the HUD layout that gives the biggest tiles, places the board and sizes the canvases to match. */
export class Layout {
	viewport = new Viewport();         // Window size and pixel ratio
	board = new BoardGeometry();       // Where the board sits and how big its tiles are
	/** @type {string} */
	kind = LAYOUT_KIND.WIDE;           // One of LAYOUT_KIND, chosen by Apply()


	/** Follows window resizes. */
	Init() {
		addEventListener('resize', () => this.Resize());
	}


	/** Lays out the game screen for the current field and viewport, then rebuilds the tile sprites for the new size. */
	Apply() {
		this.viewport.Refresh();
		this.#SizeCanvas(FindElement('#game-canvas'));
		const field = game.field;
		if (!field) {
			return;
		}
		const {kind, margins, tileSize} = this.#ChooseLayout(field);
		FindElement('#toast-stack').classList.toggle('is-lowered', kind === LAYOUT_KIND.MID);
		const gameScreen = FindElement('#game');
		gameScreen.classList.remove('layout-wide', 'layout-mid', 'layout-narrow');
		gameScreen.classList.add('layout-' + kind);

		this.kind = kind;
		const board = this.board;
		board.tileSize = Clamp(tileSize, MIN_TILE_SIZE, MAX_TILE_SIZE);
		board.width = board.tileSize * field.columns;
		board.height = board.tileSize * field.rows;
		board.x = Math.round((this.viewport.width - board.width) / 2);
		// Centred in the space between the HUD margins, but never above the top margin
		const freeHeight = this.viewport.height - margins.top - margins.bottom - board.height;
		board.y = Math.round(margins.top + Math.max(0, freeHeight / 2));

		this.#SizeCanvas(FindElement('#compass-canvas'));
		this.#SizeCanvas(FindElement('#minimap-canvas'));
		this.#SizeCanvas(FindElement('#blood-canvas'));
		sprites.Build();
	}


	/** Adapts the visible screen to a new window size. */
	Resize() {
		this.viewport.Refresh();
		if (screens.current === 'title') {
			this.#SizeCanvas(FindElement('#title-canvas'));
		}
		if (screens.current === 'game') {
			this.Apply();
		}
	}


	/**
	 * Tries every layout the viewport allows and keeps the one with the biggest tiles.
	 * A later (more compact) layout only wins if its tiles are more than one pixel bigger.
	 */
	#ChooseLayout(field) {
		const viewport = this.viewport;
		let best = null;
		for (const kind of Object.values(LAYOUT_KIND)) {
			const margins = {...LAYOUT_MARGINS[kind]};
			// The narrow layout is only offered when the mid one is not
			const allowed = kind === LAYOUT_KIND.NARROW
				? viewport.width < LAYOUT_MARGINS[LAYOUT_KIND.MID].minimumWidth
				: viewport.width >= margins.minimumWidth;
			if (!allowed) {
				continue;
			}
			if (field.chapter.floods) {
				margins.top += PATHOS_EXTRA_TOP[kind];
			}
			const tileSize = Math.floor(Math.min(
				(viewport.width - 2 * margins.side) / field.columns,
				(viewport.height - margins.top - margins.bottom) / field.rows,
			));
			if (!best || tileSize > best.tileSize + 1) {
				best = {kind, margins, tileSize};
			}
		}
		return best;
	}


	/** Matches a canvas's pixel size to its CSS size times the pixel ratio (the whole viewport if it has no CSS size). */
	#SizeCanvas(canvas) {
		const rect = canvas.getBoundingClientRect();
		const ratio = this.viewport.pixelRatio;
		const width = Math.max(1, Math.round((rect.width || innerWidth) * ratio));
		const height = Math.max(1, Math.round((rect.height || innerHeight) * ratio));
		if (canvas.width !== width) {
			canvas.width = width;
		}
		if (canvas.height !== height) {
			canvas.height = height;
		}
	}
}


export const layout = new Layout();
