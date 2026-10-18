/**
 * pause-menu.js: the pause menu, and pausing the field.
 */
import {audioEngine} from '../audio/audio-engine.js';
import {soundEffects} from '../audio/sound-effects.js';
import {FindElement, FocusFirstButton} from '../core/dom.js';
import {profile} from '../core/player-profile.js';
import {DIFFICULTIES} from '../data/difficulties.js';
import {game} from '../game/game.js';
import {input} from '../game/input/input-controller.js';
import {mission} from '../game/mission.js';
import {desktopScene} from '../scenes/desktop/desktop-scene.js';
import {titleScene} from '../scenes/title-scene.js';
import {PANEL_RETURN, panel} from './panel/tabbed-panel.js';


/**
 * Pausing stops the field clock (and everything on it), cancels a press in progress and lowers the music. The menu
 * opens the panel tabs, restarts the chapter, or leaves for the title screen or the desktop.
 */
export class PauseMenu {
	#element = FindElement('#pause-menu');


	/** Wires the menu buttons and their hover sound. */
	Init() {
		this.#element.addEventListener('click', event => this.#OnClick(event));
		FindElement('#pause-menu .menu').addEventListener('pointerover', event => {
			if (event.target.closest('button')) {
				soundEffects.MenuHover();
			}
		});
	}


	get isOpen() {
		return !this.#element.hidden;
	}


	/** Pauses and shows the menu, with the chapter, difficulty, mission time and unspent skill points. */
	Open() {
		const field = game.field;
		if (!field || field.isOver || field.isDead) {
			return;
		}
		this.SetPaused(true);
		const difficulty = DIFFICULTIES[field.difficultyKey].label;
		FindElement('#pause-status').textContent = `${field.chapter.name} · ${difficulty} · ${FindElement('#mission-timer').textContent}`;
		const points = profile.skillPoints;
		FindElement('#pause-skill-points').textContent = points ? `${points} unspent point${points > 1 ? 's' : ''}` : 'No unspent points';
		this.#element.hidden = false;
		soundEffects.MenuSelect();
		FocusFirstButton('#pause-menu .menu');
	}


	/** Closes the menu and unpauses. */
	Resume() {
		this.#element.hidden = true;
		this.SetPaused(false);
		soundEffects.MenuSelect();
	}


	/** Pauses or unpauses the current field (the panel pauses it too). */
	SetPaused(isPaused) {
		const field = game.field;
		if (!field) {
			return;
		}
		field.isPaused = isPaused;
		input.CancelPress();
		// The music volume depends on the pause state
		audioEngine.ApplyVolumes();
	}


	#OnClick(event) {
		const button = event.target.closest('[data-pause-item]');
		if (!button) {
			return;
		}
		const item = button.dataset.pauseItem;
		soundEffects.MenuSelect();
		if (item === 'resume') {
			this.Resume();
		} else if (['quests', 'skills', 'store', 'achievements', 'settings'].includes(item)) {
			panel.Open(item, PANEL_RETURN.PAUSE);
		} else if (item === 'restart') {
			this.#element.hidden = true;
			mission.Start(game.field.difficultyKey, true, game.field.fieldNumber);
		} else if (item === 'title') {
			this.#element.hidden = true;
			game.EndField();
			titleScene.Show(true);
		} else if (item === 'desktop') {
			desktopScene.ReturnFromGame();
		}
	}
}


export const pauseMenu = new PauseMenu();
