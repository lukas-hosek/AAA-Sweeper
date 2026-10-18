/**
 * input-controller.js: player input: owns the input modes, wires the HUD buttons, and hands the board's pointer and
 * keyboard events to PointerInput and KeyboardInput.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {soundEffects} from '../../audio/sound-effects.js';
import {FindElement} from '../../core/dom.js';
import {settings} from '../../core/settings.js';
import {hud} from '../../ui/hud.js';
import {panel} from '../../ui/panel/tabbed-panel.js';
import {pauseMenu} from '../../ui/pause-menu.js';
import {screens} from '../../ui/screen-manager.js';
import {game} from '../game.js';
import {playerActions} from '../player-actions.js';
import {KeyboardInput} from './keyboard-input.js';
import {PointerInput} from './pointer-input.js';


/** The input modes everyone else reads, plus the HUD buttons and pausing when the tab is hidden. */
export class InputController {
	flagMode = false;                       // Touch taps flag instead of reveal (the FLAG MODE button)
	keyboardCursorActive = false;           // The keyboard cursor is showing; any pointer press hides it again
	#pointer = null;                        // PointerInput, created in Init()
	#keyboard = null;                       // KeyboardInput, created in Init()


	/** Wires the board, the keyboard and the HUD buttons. */
	Init() {
		this.#pointer = new PointerInput(this);
		this.#keyboard = new KeyboardInput(this);
		this.#pointer.Init();
		this.#keyboard.Init();
		FindElement('#mute-button').addEventListener('click', () => this.ToggleMute());
		FindElement('#menu-button').addEventListener('click', () => pauseMenu.Open());
		FindElement('#flag-mode-button').addEventListener('click', () => this.#ToggleFlagMode());
		FindElement('#skill-nag').addEventListener('click', () => panel.Open('skills'));
		FindElement('#respects-button').addEventListener('click', () => playerActions.PayRespects());
		document.addEventListener('visibilitychange', () => this.#PauseWhenHidden());
	}


	/** Forgets a press on the board that hasn't been released yet (pausing must not reveal on release). */
	CancelPress() {
		this.#pointer.CancelPress();
	}


	/** Sound on or off (the HUD button and the M key). */
	ToggleMute() {
		settings.muted = !settings.muted;
		settings.Save();
		audioEngine.ApplyVolumes();
		hud.Refresh();
	}


	/** Flag mode on or off: on touch screens, taps then flag instead of revealing. */
	#ToggleFlagMode() {
		this.flagMode = !this.flagMode;
		soundEffects.MenuSelect();
		hud.Refresh();
	}


	/** Switching tabs or windows mid-game opens the pause menu. */
	#PauseWhenHidden() {
		const field = game.field;
		const canPause = field && !field.isOver && !field.isPaused && FindElement('#death-screen').hidden;
		if (document.hidden && screens.current === 'game' && canPause) {
			pauseMenu.Open();
		}
	}
}


export const input = new InputController();
