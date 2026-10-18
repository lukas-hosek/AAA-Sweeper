/**
 * screen-manager.js: which full-screen view is showing (desktop, intro, title, game), and the fade between them.
 */
import {FindAllElements, FindElement} from '../core/dom.js';
import {Sleep} from '../core/time.js';


const OVERLAY_SELECTORS = ['#pause-menu', '#panel', '#death-screen', '#results-screen'];


/** Every screen is a .screen element; exactly one is shown at a time. */
export class ScreenManager {
	#current = 'desktop';           // Id of the screen element shown


	/** Id of the screen shown: 'desktop', 'intro', 'title' or 'game'. */
	get current() {
		return this.#current;
	}


	/** Shows the screen with this element id and hides the others. */
	Show(screenId) {
		this.#current = screenId;
		for (const screen of FindAllElements('.screen')) {
			screen.hidden = screen.id !== screenId;
		}
	}


	/**
	 * Fades the black layer over everything to `opacity` (1 = black) in `milliseconds`. It blocks input while not
	 * fully transparent. Resolves when the fade is done.
	 */
	FadeTo(opacity, milliseconds) {
		const layer = FindElement('#fade-layer');
		layer.style.transition = `opacity ${milliseconds}ms`;
		layer.classList.toggle('is-blocking', opacity > 0);
		// Force a style flush, so the new transition time applies to this change
		void layer.offsetWidth;
		layer.style.opacity = String(opacity);
		return Sleep(milliseconds);
	}


	/** Hides the pause menu, the panel and the death and results screens. */
	CloseOverlays() {
		for (const selector of OVERLAY_SELECTORS) {
			FindElement(selector).hidden = true;
		}
	}
}


export const screens = new ScreenManager();
