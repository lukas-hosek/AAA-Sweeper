/**
 * tabbed-panel.js: the full-screen panel with its tab bar: quest log, skills, store, achievements and settings.
 */
import {soundEffects} from '../../audio/sound-effects.js';
import {FindElement, FocusFirstButton} from '../../core/dom.js';
import {game} from '../../game/game.js';
import {pauseMenu} from '../pause-menu.js';
import {screens} from '../screen-manager.js';
import {AchievementsTab} from './achievements-tab.js';
import {QuestLogTab} from './quest-log-tab.js';
import {SettingsTab} from './settings-tab.js';
import {SkillsTab} from './skills-tab.js';
import {StoreTab} from './store-tab.js';


/** Where closing the panel goes back to. */
export const PANEL_RETURN = Object.freeze({
	GAME: 'game',
	PAUSE: 'pause',
	TITLE: 'title',
});


/**
 * Opens from the title menu, the pause menu or straight from the game (keys J, K and B, the skill nag). In a game
 * the field stays paused while it is open. The active tab draws the body and handles its clicks and form input.
 */
export class TabbedPanel {
	#tabs = [];                         // PanelTab per tab, in tab-bar order (created in Init)
	#activeTab = null;
	/** @type {string} */
	#returnTo = PANEL_RETURN.GAME;      // Where Close() goes back to: one of PANEL_RETURN
	#element = FindElement('#panel');


	/** Creates the tabs and wires the tab bar and the body. */
	Init() {
		this.#tabs = [new QuestLogTab(this), new SkillsTab(this), new StoreTab(this), new AchievementsTab(this), new SettingsTab(this)];
		this.#activeTab = this.#tabs[0];
		FindElement('#panel-tabs').addEventListener('click', event => this.#OnTabBarClick(event));
		FindElement('#panel-body').addEventListener('click', event => {
			const button = event.target.closest('button');
			if (button) {
				this.#activeTab.OnClick(button);
			}
		});
		FindElement('#panel-body').addEventListener('input', event => this.#activeTab.OnInput(event.target));
	}


	get isOpen() {
		return !this.#element.hidden;
	}


	/** Opens on a tab. `returnTo` (a PANEL_RETURN) defaults to wherever it was opened from. */
	Open(tabId, returnTo) {
		this.SwitchTo(tabId);
		this.#returnTo = returnTo || this.#CurrentPlace();
		if (screens.current === 'game' && game.field) {
			pauseMenu.SetPaused(true);
		}
		FindElement('#pause-menu').hidden = true;
		this.Render();
		this.#element.hidden = false;
		this.#activeTab.OnShow();
		soundEffects.MenuSelect();
	}


	/** Closes the panel and goes back: to the pause menu, into the game, or to the title menu. */
	Close() {
		this.#element.hidden = true;
		soundEffects.MenuSelect();
		if (this.#returnTo === PANEL_RETURN.PAUSE && game.field) {
			pauseMenu.Open();
		} else if (this.#returnTo === PANEL_RETURN.GAME && game.field) {
			pauseMenu.SetPaused(false);
		} else if (screens.current === 'title') {
			FocusFirstButton('#main-menu');
		}
	}


	/** Makes a tab the active one, without drawing it. */
	SwitchTo(tabId) {
		this.#activeTab = this.#tabs.find(tab => tab.id === tabId) || this.#tabs[0];
	}


	/** Redraws the tab bar and the active tab's body. */
	Render() {
		const tabButtons = this.#tabs.map(tab =>
			`<button data-tab="${tab.id}" class="${tab === this.#activeTab ? 'is-active' : ''}">${tab.label}</button>`).join('');
		FindElement('#panel-tabs').innerHTML = tabButtons + '<button class="close-button" data-close="1">BACK [ESC]</button>';
		FindElement('#panel-body').innerHTML = this.#activeTab.Markup();
	}


	/** Where the panel was opened from: the title menu, the pause menu, or the running game. */
	#CurrentPlace() {
		if (screens.current !== 'game') {
			return PANEL_RETURN.TITLE;
		}
		return FindElement('#pause-menu').hidden ? PANEL_RETURN.GAME : PANEL_RETURN.PAUSE;
	}


	#OnTabBarClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		if (button.dataset.close) {
			this.Close();
			return;
		}
		this.SwitchTo(button.dataset.tab);
		soundEffects.MenuSelect();
		this.Render();
		this.#activeTab.OnShow();
	}
}


export const panel = new TabbedPanel();
