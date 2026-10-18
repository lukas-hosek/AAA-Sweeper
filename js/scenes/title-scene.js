/**
 * title-scene.js: the title screen: "press any key", the main menu, difficulty and chapter select, and loading.
 */
import {audioEngine} from '../audio/audio-engine.js';
import {instruments} from '../audio/instruments.js';
import {music} from '../audio/music-sequencer.js';
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {EscapeHtml, FindElement, FocusFirstButton} from '../core/dom.js';
import {profile} from '../core/player-profile.js';
import {random} from '../core/random.js';
import {Sleep, Tween} from '../core/time.js';
import {DIFFICULTIES} from '../data/difficulties.js';
import {GAMEPLAY_TIPS, LOADING_MESSAGES} from '../data/texts.js';
import {CHAPTERS} from '../game/chapters.js';
import {mission} from '../game/mission.js';
import {layout} from '../render/layout.js';
import {achievements} from '../ui/achievements.js';
import {oxygenReadout} from '../ui/oxygen-readout.js';
import {PANEL_RETURN, panel} from '../ui/panel/tabbed-panel.js';
import {screens} from '../ui/screen-manager.js';
import {toasts} from '../ui/toasts.js';
import {creditsScene} from './credits/credits-scene.js';
import {desktopScene} from './desktop/desktop-scene.js';


const TITLE_BRAAM_NOTE = 38;
const LOADING_MS = 2600;


/** Which part of the title screen has the keyboard. */
export const TITLE_MENU = Object.freeze({
	PRESS_ANY_KEY: 'press-any-key',
	MAIN: 'main',
	DIFFICULTY: 'difficulty',
	CHAPTER: 'chapter',
	LOADING: 'loading',
});


/**
 * The title shows over the battlefield backdrop with the title theme. After the intro it waits for any key; coming
 * back from a game it opens straight on the main menu. Chapters unlock one by one, or all at once for €0.00.
 */
export class TitleScene {
	/** @type {string} */
	menuState = TITLE_MENU.PRESS_ANY_KEY;   // One of TITLE_MENU
	#isLoading = false;                     // A chapter is loading: further menu clicks are ignored
	#chosenDifficulty = 'normal';           // Difficulty picked before the chapter menu


	/** Wires the menus, "press any key" for pointers, and the hover sound. */
	Init() {
		FindElement('#title').addEventListener('pointerdown', event => {
			audioEngine.Init();
			if (this.menuState === TITLE_MENU.PRESS_ANY_KEY && !event.target.closest('button')) {
				event.preventDefault();
				this.ShowMainMenu();
			}
		});
		FindElement('#main-menu').addEventListener('click', event => this.#OnMainMenuClick(event));
		FindElement('#difficulty-menu').addEventListener('click', event => this.#OnDifficultyClick(event));
		FindElement('#chapter-menu').addEventListener('click', event => this.#OnChapterClick(event));
		for (const selector of ['#main-menu', '#difficulty-menu', '#chapter-menu']) {
			FindElement(selector).addEventListener('pointerover', event => {
				if (event.target.closest('button')) {
					soundEffects.MenuHover();
				}
			});
		}
	}


	/** Fades to the title screen. After the intro it plays the braam and the title voice; from a game, the menu is open. */
	async Show(isFromGame) {
		await screens.FadeTo(1, isFromGame ? 600 : 400);
		voices.StopAll();
		audioEngine.Unmuffle();
		screens.Show('title');
		FindElement('#toast-stack').classList.remove('is-lowered');
		oxygenReadout.Hide(true);
		layout.Resize();
		FindElement('#loading').hidden = true;
		FindElement('#press-any-key').hidden = Boolean(isFromGame);
		FindElement('#main-menu').hidden = !isFromGame;
		FindElement('#difficulty-menu').hidden = true;
		FindElement('#chapter-menu').hidden = true;
		this.menuState = isFromGame ? TITLE_MENU.MAIN : TITLE_MENU.PRESS_ANY_KEY;
		this.#isLoading = false;
		music.Start('title');
		if (!isFromGame && audioEngine.context) {
			instruments.Braam(TITLE_BRAAM_NOTE, audioEngine.context.currentTime + 0.15, 0.42);
			setTimeout(() => {
				if (screens.current === 'title') {
					voices.Say('a_title');
				}
			}, 1300);
		}
		await screens.FadeTo(0, isFromGame ? 700 : 900);
		if (isFromGame) {
			FocusFirstButton('#main-menu');
		}
	}


	/** Past "press any key": the main menu. Also Escape from the difficulty menu. */
	ShowMainMenu() {
		this.menuState = TITLE_MENU.MAIN;
		FindElement('#press-any-key').hidden = true;
		FindElement('#main-menu').hidden = false;
		FindElement('#difficulty-menu').hidden = true;
		FindElement('#chapter-menu').hidden = true;
		soundEffects.Whoosh();
		FocusFirstButton('#main-menu');
	}


	/** NEW GAME: the difficulty menu. Also BACK (or Escape) from the chapter menu. */
	ShowDifficultyMenu() {
		this.menuState = TITLE_MENU.DIFFICULTY;
		FindElement('#main-menu').hidden = true;
		FindElement('#chapter-menu').hidden = true;
		FindElement('#difficulty-menu').hidden = false;
		FocusFirstButton('#difficulty-menu');
	}


	/** The chapter menu: unlocked chapters, locked ones, and the Time Saver Pack while anything is locked. */
	#ShowChapterMenu(difficultyKey) {
		this.menuState = TITLE_MENU.CHAPTER;
		this.#chosenDifficulty = difficultyKey;
		const highestUnlocked = profile.highestChapter || 1;
		const chapterButtons = CHAPTERS.map((chapter, index) => {
			const number = index + 1;
			const isLocked = number > highestUnlocked;
			const detail = isLocked ? 'Locked · Clear the previous chapter' : EscapeHtml(chapter.operation);
			return `<button data-chapter="${number}" class="${isLocked ? 'is-locked' : ''}">`
				+ `${number}. ${EscapeHtml(chapter.name.toUpperCase())}<small>${detail}</small></button>`;
		}).join('');
		const pack = highestUnlocked < CHAPTERS.length
			? '<button data-chapter="pack">TIME SAVER PACK<small class="highlight">Unlock every chapter now · €4.99</small></button>'
			: '';
		const menu = FindElement('#chapter-menu');
		menu.innerHTML = `<div class="menu-heading">SELECT CHAPTER · ${DIFFICULTIES[difficultyKey].label.toUpperCase()}</div>`
			+ chapterButtons + pack + '<button data-chapter="back">BACK</button>';
		FindElement('#difficulty-menu').hidden = true;
		menu.hidden = false;
		FocusFirstButton('#chapter-menu');
	}


	#OnMainMenuClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		soundEffects.MenuSelect();
		const item = button.dataset.menuItem;
		if (item === 'new') {
			this.ShowDifficultyMenu();
		} else if (item === 'continue') {
			soundEffects.Denied();
			toasts.Show({
				kicker: 'CLOUD SAVES+ REQUIRED',
				title: 'Continue is available with a Cloud Saves+ subscription. Or start a New Game.',
				icon: '!',
			});
		} else if (item === 'credits') {
			creditsScene.Start('title');
		} else if (item === 'store' || item === 'settings') {
			panel.Open(item, PANEL_RETURN.TITLE);
		} else if (item === 'quit') {
			desktopScene.ReturnFromGame();
		}
	}


	#OnDifficultyClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		soundEffects.MenuSelect();
		const difficulty = button.dataset.difficulty;
		if (difficulty === 'back') {
			this.ShowMainMenu();
		} else if (difficulty === 'realism') {
			soundEffects.Denied();
			toasts.Show({
				kicker: 'SEASON PASS REQUIRED',
				title: 'Realism mode unlocks with the Season Pass. The Season Pass unlocks with money.',
				icon: '!',
			});
		} else {
			this.#ShowChapterMenu(difficulty);
		}
	}


	#OnChapterClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		soundEffects.MenuSelect();
		const choice = button.dataset.chapter;
		if (choice === 'back') {
			this.ShowDifficultyMenu();
			return;
		}
		if (choice === 'pack') {
			profile.highestChapter = CHAPTERS.length;
			profile.Save();
			soundEffects.Coin();
			achievements.Unlock('timesaver');
			toasts.Show({
				kicker: 'PURCHASE COMPLETE',
				title: '€0.00 charged',
				description: 'Every chapter unlocked. Your time is valuable. Ours is not.',
				isReward: true,
				icon: '⏱',
			});
			this.#ShowChapterMenu(this.#chosenDifficulty);
			return;
		}
		const fieldNumber = Number(choice);
		if (fieldNumber > (profile.highestChapter || 1)) {
			soundEffects.Denied();
			toasts.Show({kicker: 'CHAPTER LOCKED', title: 'Clear the previous chapter, or buy the Time Saver Pack.', icon: '!'});
			return;
		}
		this.#LoadChapter(this.#chosenDifficulty, fieldNumber);
	}


	/** The loading screen: a tip, a progress bar with silly status messages, then the chapter starts. */
	async #LoadChapter(difficultyKey, fieldNumber) {
		if (this.#isLoading) {
			return;
		}
		this.#isLoading = true;
		this.menuState = TITLE_MENU.LOADING;
		FindElement('#difficulty-menu').hidden = true;
		FindElement('#chapter-menu').hidden = true;
		FindElement('#loading').hidden = false;
		FindElement('#loading-tip-text').textContent = random.Pick(GAMEPLAY_TIPS);
		const messages = random.Shuffle([...LOADING_MESSAGES]);
		const status = FindElement('#loading-status');
		await Tween(LOADING_MS, progress => {
			FindElement('#loading-bar-fill').style.width = (progress * 100) + '%';
			status.textContent = messages[Math.min(messages.length - 1, Math.floor(progress * 4))] + '…';
		});
		status.textContent = 'Press any key to continue';
		await Sleep(250);
		mission.Start(difficultyKey, false, fieldNumber || 1);
	}
}


export const titleScene = new TitleScene();
