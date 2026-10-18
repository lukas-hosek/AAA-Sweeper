/**
 * keyboard-input.js: the keyboard on every screen: skipping the intro and credits, the title menus, the pause menu
 * and panels, and playing the board with a cursor.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {soundEffects} from '../../audio/sound-effects.js';
import {FindAllElements, FindElement} from '../../core/dom.js';
import {Clamp} from '../../core/math.js';
import {creditsScene} from '../../scenes/credits/credits-scene.js';
import {introScene} from '../../scenes/intro-scene.js';
import {TITLE_MENU, titleScene} from '../../scenes/title-scene.js';
import {panel} from '../../ui/panel/tabbed-panel.js';
import {pauseMenu} from '../../ui/pause-menu.js';
import {screens} from '../../ui/screen-manager.js';
import {game} from '../game.js';
import {playerActions} from '../player-actions.js';


const SKIP_CODES = ['Space', 'Enter', 'Escape'];        // Held to skip the intro
const FAST_FORWARD_CODES = ['Space', 'Enter'];          // Held to speed up the credits
const PANEL_KEYS = {j: 'quests', k: 'skills', b: 'store'};


// Cursor movement by key (lower case): arrows and WASD
const CURSOR_MOVES = {
	arrowleft: [-1, 0],
	arrowright: [1, 0],
	arrowup: [0, -1],
	arrowdown: [0, 1],
	a: [-1, 0],
	d: [1, 0],
	w: [0, -1],
	s: [0, 1],
};


/**
 * Routes each key to the screen that is showing. On the board, the arrows (or WASD) move a cursor that starts on the
 * quest marker, Space or Enter reveals and X or Q flags; J, K and B open the panels, F pays respects, M mutes.
 */
export class KeyboardInput {
	#controller;                // The InputController: the keyboard cursor flag and muting


	constructor(controller) {
		this.#controller = controller;
	}


	Init() {
		addEventListener('keydown', event => this.#OnKeyDown(event));
		addEventListener('keyup', event => this.#OnKeyUp(event));
	}


	#OnKeyDown(event) {
		if (creditsScene.isRolling) {
			this.#OnCreditsKeyDown(event);
		} else if (screens.current === 'intro') {
			if (SKIP_CODES.includes(event.code)) {
				event.preventDefault();
				audioEngine.Init();
				introScene.HoldStart();
			}
		} else if (screens.current === 'title') {
			this.#OnTitleKeyDown(event);
		} else if (screens.current === 'game' && game.field) {
			this.#OnGameKeyDown(event);
		}
	}


	#OnKeyUp(event) {
		if (creditsScene.isRolling && FAST_FORWARD_CODES.includes(event.code)) {
			creditsScene.isFastForward = false;
		}
		if (screens.current === 'intro' && SKIP_CODES.includes(event.code)) {
			introScene.HoldEnd();
		}
	}


	/** Space or Enter fast-forwards while held, Escape skips. */
	#OnCreditsKeyDown(event) {
		if (FAST_FORWARD_CODES.includes(event.code)) {
			event.preventDefault();
			creditsScene.isFastForward = true;
		} else if (event.key === 'Escape') {
			event.preventDefault();
			creditsScene.Skip();
		}
	}


	/** Any key gets past "press any key"; Escape steps back through the menus; the arrows move the focus. */
	#OnTitleKeyDown(event) {
		audioEngine.Init();
		if (!FindElement('#panel').hidden) {
			if (event.key === 'Escape') {
				panel.Close();
			}
			return;
		}
		if (titleScene.menuState === TITLE_MENU.PRESS_ANY_KEY) {
			event.preventDefault();
			titleScene.ShowMainMenu();
			return;
		}
		if (event.key === 'Escape' && titleScene.menuState === TITLE_MENU.DIFFICULTY) {
			titleScene.ShowMainMenu();
			return;
		}
		if (event.key === 'Escape' && titleScene.menuState === TITLE_MENU.CHAPTER) {
			titleScene.ShowDifficultyMenu();
			return;
		}
		this.#NavigateMenuByArrows(event);
	}


	/** Panels and the pause menu take the keys first; otherwise the board shortcuts and the cursor. */
	#OnGameKeyDown(event) {
		if (!FindElement('#panel').hidden) {
			if (event.key === 'Escape') {
				event.preventDefault();
				panel.Close();
			}
			return;
		}
		if (!FindElement('#pause-menu').hidden) {
			if (event.key === 'Escape') {
				event.preventDefault();
				pauseMenu.Resume();
			} else {
				this.#NavigateMenuByArrows(event);
			}
			return;
		}
		if (!FindElement('#results-screen').hidden || !FindElement('#death-screen').hidden) {
			return;
		}
		const key = event.key.toLowerCase();
		if (key === 'escape') {
			event.preventDefault();
			pauseMenu.Open();
		} else if (PANEL_KEYS[key]) {
			panel.Open(PANEL_KEYS[key]);
		} else if (key === 'f') {
			playerActions.PayRespects();
		} else if (key === 'm') {
			this.#controller.ToggleMute();
		} else if (CURSOR_MOVES[key]) {
			event.preventDefault();
			this.#MoveCursor(CURSOR_MOVES[key]);
		} else if (this.#controller.keyboardCursorActive && game.field.keyboardCursorTile >= 0) {
			this.#ActOnCursor(event, key);
		}
	}


	/**
	 * The first press only shows the cursor (on the quest marker, or the middle of the board); later presses move it
	 * by one tile, stopping at the edges.
	 */
	#MoveCursor([dx, dy]) {
		const field = game.field;
		if (field.keyboardCursorTile < 0) {
			field.keyboardCursorTile = field.questTarget >= 0 ? field.questTarget : Math.floor(field.tileCount / 2);
		}
		if (this.#controller.keyboardCursorActive) {
			const column = Clamp(field.Column(field.keyboardCursorTile) + dx, 0, field.columns - 1);
			const row = Clamp(field.Row(field.keyboardCursorTile) + dy, 0, field.rows - 1);
			field.keyboardCursorTile = row * field.columns + column;
		}
		this.#controller.keyboardCursorActive = true;
		field.hoveredTile = field.keyboardCursorTile;
		field.pointerInCanvas = false;
		soundEffects.MenuHover();
	}


	/** Space or Enter reveals the tile under the cursor, X or Q flags it. */
	#ActOnCursor(event, key) {
		const tile = game.field.keyboardCursorTile;
		if (key === ' ' || key === 'enter') {
			event.preventDefault();
			playerActions.Reveal(tile);
		} else if (key === 'x' || key === 'q') {
			event.preventDefault();
			playerActions.Flag(tile);
		}
	}


	/** Up and down arrows move the focus through the visible menu's buttons, wrapping around. */
	#NavigateMenuByArrows(event) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
			return;
		}
		event.preventDefault();
		const buttons = FindAllElements('button', this.#VisibleMenu());
		const current = buttons.indexOf(document.activeElement);
		const step = event.key === 'ArrowDown' ? 1 : -1;
		const next = buttons[(current + step + buttons.length) % buttons.length];
		if (next) {
			next.focus();
			soundEffects.MenuHover();
		}
	}


	/** The menu the arrows move through: the shown title menu, or the pause menu in game. */
	#VisibleMenu() {
		if (screens.current !== 'title') {
			return FindElement('#pause-menu .menu');
		}
		for (const selector of ['#main-menu', '#difficulty-menu']) {
			if (!FindElement(selector).hidden) {
				return FindElement(selector);
			}
		}
		return FindElement('#chapter-menu');
	}
}
