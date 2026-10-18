/**
 * pointer-input.js: mouse, touch and pen on the board.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {camera} from '../../render/camera.js';
import {gameRenderer} from '../../render/game-renderer.js';
import {game} from '../game.js';
import {TILE} from '../minefield.js';
import {playerActions} from '../player-actions.js';


const LONG_PRESS_MS = 430;          // Touch: holding this long flags the tile
const TOUCH_SLOP = 12;              // Touch: moving further than this (CSS pixels) cancels the press
const LONG_PRESS_VIBRATION_MS = 25;
const MOUSE_BUTTON = {PRIMARY: 0, MIDDLE: 1, SECONDARY: 2};


/**
 * Mouse: left click reveals on release (the tile looks pressed meanwhile), right click flags, middle click chords.
 * Touch and pen: a tap reveals (or flags in flag mode), a long press flags. A reveal only happens when the press is
 * released over the tile it started on, as in classic Minesweeper.
 */
export class PointerInput {
	#controller;                // The InputController: flag mode and the keyboard cursor
	#pendingPress = null;       // A press waiting for its release: {tile, isMouse, startX, startY, isLongPress, timer}


	constructor(controller) {
		this.#controller = controller;
	}


	/** Wires the board canvas. The release is caught on the window, in case it happens off the canvas. */
	Init() {
		const canvas = gameRenderer.canvas;
		canvas.addEventListener('pointerdown', event => this.#OnPointerDown(event));
		canvas.addEventListener('pointermove', event => this.#OnPointerMove(event));
		canvas.addEventListener('pointerleave', event => this.#OnPointerLeave(event));
		addEventListener('pointerup', event => this.#OnPointerUp(event));
		canvas.addEventListener('contextmenu', event => event.preventDefault());
	}


	/** Forgets the press in progress, so its release does nothing. */
	CancelPress() {
		if (this.#pendingPress) {
			clearTimeout(this.#pendingPress.timer);
		}
		this.#pendingPress = null;
		if (game.field) {
			game.field.pressedTile = -1;
		}
	}


	#OnPointerDown(event) {
		// The first click anywhere is the user gesture that may start audio
		audioEngine.Init();
		if (!playerActions.canAct) {
			return;
		}
		const field = game.field;
		const tile = camera.TileAtScreen(event.clientX, event.clientY);
		this.#TrackPointer(field, event);
		field.pointerIsTouch = event.pointerType !== 'mouse';
		this.#controller.keyboardCursorActive = false;
		if (event.pointerType === 'mouse') {
			this.#OnMouseDown(field, event, tile);
			return;
		}
		this.#pendingPress = {tile, isMouse: false, startX: event.clientX, startY: event.clientY, isLongPress: false, timer: 0};
		field.hoveredTile = tile;
		this.#pendingPress.timer = setTimeout(() => this.#OnLongPress(), LONG_PRESS_MS);
	}


	/** Right button flags at once, middle button chords at once, left button waits for the release. */
	#OnMouseDown(field, event, tile) {
		if (event.button === MOUSE_BUTTON.SECONDARY) {
			event.preventDefault();
			playerActions.Flag(tile);
		} else if (event.button === MOUSE_BUTTON.MIDDLE) {
			event.preventDefault();
			if (tile >= 0 && field.tileStates[tile] === TILE.OPEN) {
				playerActions.Chord(tile);
			}
		} else if (event.button === MOUSE_BUTTON.PRIMARY) {
			this.#pendingPress = {tile, isMouse: true, startX: 0, startY: 0, isLongPress: false, timer: 0};
			field.pressedTile = tile >= 0 && field.tileStates[tile] === TILE.HIDDEN ? tile : -1;
		}
	}


	/** Touch held long enough: flag the tile, with a little buzz where supported. The release then does nothing. */
	#OnLongPress() {
		const press = this.#pendingPress;
		if (!press || press.tile < 0) {
			return;
		}
		press.isLongPress = true;
		playerActions.Flag(press.tile);
		try {
			if (navigator.vibrate) {
				navigator.vibrate(LONG_PRESS_VIBRATION_MS);
			}
		} catch {
			// Some browsers refuse vibration without a user gesture they recognise; it's only a nicety
		}
	}


	/** Hover follows the mouse; a held tile only looks pressed while the pointer is on it; touch moves cancel. */
	#OnPointerMove(event) {
		const field = game.field;
		if (!field) {
			return;
		}
		this.#TrackPointer(field, event);
		const tile = camera.TileAtScreen(event.clientX, event.clientY);
		if (tile !== field.hoveredTile && event.pointerType === 'mouse') {
			field.hoveredTile = tile;
		}
		const press = this.#pendingPress;
		if (press && press.isMouse) {
			field.pressedTile = tile === press.tile && tile >= 0 && field.tileStates[tile] === TILE.HIDDEN ? tile : -1;
		}
		// A finger that moves is scrolling or dragging, not tapping
		if (press && !press.isMouse && Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > TOUCH_SLOP) {
			clearTimeout(press.timer);
			this.#pendingPress = null;
		}
	}


	#OnPointerLeave(event) {
		const field = game.field;
		if (!field) {
			return;
		}
		if (event.pointerType === 'mouse') {
			field.pointerInCanvas = false;
			field.hoveredTile = -1;
		}
	}


	/** Completes a press released over the tile it started on: reveal, or flag for touch in flag mode. */
	#OnPointerUp(event) {
		const press = this.#pendingPress;
		const field = game.field;
		if (!press || !field) {
			return;
		}
		this.#pendingPress = null;
		field.pressedTile = -1;
		clearTimeout(press.timer);
		if (press.isLongPress) {
			return;
		}
		const tile = camera.TileAtScreen(event.clientX, event.clientY);
		if (tile < 0 || tile !== press.tile) {
			return;
		}
		if (!press.isMouse && this.#controller.flagMode) {
			playerActions.Flag(tile);
		} else {
			playerActions.Reveal(tile);
		}
	}


	/** Remembers where the pointer is, for the quest marker's off-board arrow and the hover effects. */
	#TrackPointer(field, event) {
		field.pointerX = event.clientX;
		field.pointerY = event.clientY;
		field.pointerInCanvas = true;
	}
}
