/**
 * main.js: the entry point (index.html loads it as a module). Initialises every module in a fixed order, then runs
 * the frame loop.
 */
import {voiceBank} from './audio/voice-bank.js';
import {canvasFonts} from './core/canvas-fonts.js';
import {FindElement} from './core/dom.js';
import {random} from './core/random.js';
import {settings} from './core/settings.js';
import {game} from './game/game.js';
import {input} from './game/input/input-controller.js';
import {missionOutcome} from './game/mission-outcome.js';
import {mission} from './game/mission.js';
import {gameRenderer} from './render/game-renderer.js';
import {layout} from './render/layout.js';
import {scenery} from './render/scenery/scenery-renderer.js';
import {sprites} from './render/sprite-cache.js';
import {creditsScene} from './scenes/credits/credits-scene.js';
import {desktopScene} from './scenes/desktop/desktop-scene.js';
import {introScene} from './scenes/intro-scene.js';
import {titleScene} from './scenes/title-scene.js';
import {panel} from './ui/panel/tabbed-panel.js';
import {pauseMenu} from './ui/pause-menu.js';
import {screens} from './ui/screen-manager.js';


const FILM_GRAIN_SIZE = 160;            // The grain texture tiles across the screen
const MAX_FRAME_SECONDS = 0.05;         // Longer frames (a background tab, a breakpoint) don't jump the simulation


/**
 * Every module has created its singleton by the time this runs, but none has touched another module yet: that all
 * happens in the Init() calls below, in this order. The frame loop then draws whichever screen is showing.
 */
class Application {
	#lastTimestamp = 0;                 // requestAnimationFrame time of the previous frame (ms)


	Start() {
		this.#ApplySeedParameter();
		this.#MakeFilmGrain();
		FindElement('#film-grain').classList.toggle('is-off', !settings.filmGrain);
		// Canvas text can only use fonts that have loaded; anything baked before that is rebuilt once they have
		canvasFonts.Preload().then(() => scenery.OnCanvasFontsLoaded());
		voiceBank.Init();
		layout.Init();
		sprites.Init();
		missionOutcome.Init();
		input.Init();
		pauseMenu.Init();
		panel.Init();
		desktopScene.Init();
		introScene.Init();
		titleScene.Init();
		creditsScene.Init();
		requestAnimationFrame(timestamp => this.#Frame(timestamp));
		FindElement('#game-launch-icon').focus({preventScroll: true});
		// The test and tooling hooks (window.testHooks, window.musicExporter) only load with ?debug in the URL
		if (new URLSearchParams(location.search).has('debug')) {
			import('./debug.js');
		}
	}


	/** ?seed=N makes every random draw reproducible, so a board can be replayed for a bug report. */
	#ApplySeedParameter() {
		const seed = new URLSearchParams(location.search).get('seed');
		if (seed !== null && seed !== '') {
			random.Seed(Number(seed));
		}
	}


	/** One frame: the title backdrop, or the game simulation and its drawing. The credits and desktop are DOM only. */
	#Frame(timestamp) {
		const time = timestamp / 1000;
		const deltaTime = Math.min(MAX_FRAME_SECONDS, Math.max(0, (timestamp - this.#lastTimestamp) / 1000));
		this.#lastTimestamp = timestamp;
		try {
			const isCreditsShowing = creditsScene.isRolling && !FindElement('#credits').hidden;
			if (isCreditsShowing) {
				// The credits cover everything: nothing to draw underneath
			} else if (screens.current === 'title') {
				scenery.DrawTitleBackdrop(time, deltaTime);
			} else if (screens.current === 'game' && game.field) {
				mission.Update(time, deltaTime);
				// The update may have ended the field (quitting from a callback)
				if (game.field) {
					gameRenderer.Draw(time, deltaTime);
				}
			}
		} catch (error) {
			// Keep the loop alive: one broken frame must not freeze the game
			console.error(error);
		}
		requestAnimationFrame(nextTimestamp => this.#Frame(nextTimestamp));
	}


	/** A tile of random grey noise for the film grain overlay (CSS animates it). */
	#MakeFilmGrain() {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = FILM_GRAIN_SIZE;
		const context = canvas.getContext('2d');
		const image = context.createImageData(FILM_GRAIN_SIZE, FILM_GRAIN_SIZE);
		for (let k = 0; k < image.data.length; k += 4) {
			const value = random.Next() * 255 | 0;
			image.data[k] = image.data[k + 1] = image.data[k + 2] = value;
			image.data[k + 3] = 255;
		}
		context.putImageData(image, 0, 0);
		FindElement('#film-grain').style.backgroundImage = `url(${canvas.toDataURL()})`;
	}
}


new Application().Start();
