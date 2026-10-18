/**
 * music-sequencer.js: plays the music themes with a look-ahead step scheduler.
 */
import {audioEngine} from './audio-engine.js';
import {ArcticTheme} from './themes/arctic-theme.js';
import {BattleTheme} from './themes/battle-theme.js';
import {ClubTheme} from './themes/club-theme.js';
import {CreditsTheme} from './themes/credits-theme.js';
import {DesertTheme} from './themes/desert-theme.js';
import {HomeTheme} from './themes/home-theme.js';
import {PathosTheme} from './themes/pathos-theme.js';
import {TitleTheme} from './themes/title-theme.js';
import {VictoryTheme} from './themes/victory-theme.js';


const TICK_MILLISECONDS = 40;      // How often the scheduler wakes up
const LOOK_AHEAD_SECONDS = 0.3;    // Steps due within this window are scheduled on the audio clock
const MAX_STEPS_PER_TICK = 48;     // Safety limit after the page was in the background
const START_DELAY_SECONDS = 0.08;  // The first step of a new theme
const NO_THEME = 'none';


/**
 * Schedules the steps of the current theme ahead of time on the audio clock, so timing stays exact
 * even though the JavaScript timer that drives it is not. Switching themes restarts at step 0.
 */
export class MusicSequencer {
	#themes = {};                     // Theme name -> MusicTheme
	#currentThemeName = NO_THEME;
	#step = 0;                        // Next step to schedule
	#nextStepTime = 0;                // Audio clock time of that step
	#timer = null;                    // setInterval handle, created on the first Start()


	constructor() {
		const themes = [
			new TitleTheme(), new BattleTheme(), new ClubTheme(), new VictoryTheme(), new DesertTheme(),
			new CreditsTheme(), new ArcticTheme(), new HomeTheme(), new PathosTheme(),
		];
		for (const theme of themes) {
			this.#themes[theme.name] = theme;
		}
	}


	/** Name of the theme playing, or 'none'. */
	get currentThemeName() {
		return this.#currentThemeName;
	}


	/** A theme by name, or undefined. */
	Theme(name) {
		return this.#themes[name];
	}


	/** Starts a theme from its first step (silently ignored until audio runs). */
	Start(themeName) {
		if (!audioEngine.context) {
			return;
		}
		this.#currentThemeName = themeName;
		this.#step = 0;
		this.#nextStepTime = audioEngine.context.currentTime + START_DELAY_SECONDS;
		if (!this.#timer) {
			this.#timer = setInterval(() => this.#Tick(), TICK_MILLISECONDS);
		}
	}


	/** Stops scheduling new steps; notes already scheduled ring out. */
	Stop() {
		this.#currentThemeName = NO_THEME;
	}


	/** Schedules every step that falls into the look-ahead window. */
	#Tick() {
		const theme = this.#themes[this.#currentThemeName];
		const context = audioEngine.context;
		if (!context || !theme) {
			return;
		}
		// After a stall (background tab), skip ahead instead of playing all missed steps at once
		if (this.#nextStepTime < context.currentTime - 0.05) {
			this.#nextStepTime = context.currentTime + 0.05;
		}
		let scheduled = 0;
		while (this.#nextStepTime < context.currentTime + LOOK_AHEAD_SECONDS && scheduled++ < MAX_STEPS_PER_TICK) {
			theme.PlayStep(this.#step, this.#nextStepTime);
			this.#nextStepTime += theme.stepSeconds;
			this.#step++;
		}
	}
}


export const music = new MusicSequencer();
