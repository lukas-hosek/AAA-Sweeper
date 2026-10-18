/**
 * banners.js: the big banner across the middle of the screen ("LEVEL UP", "AREA CLEARED", "NEW QUEST"...).
 */
import {FindElement} from '../core/dom.js';


const DISPLAY_MS = 2850;                // Matches the CSS animation of #banner.is-active
const DEFAULT_COLOR = '#f2c14e';


/** One banner at a time; the rest wait in a queue. */
export class BannerQueue {
	#waiting = [];                      // Banners not shown yet, oldest first
	#isShowing = false;


	/** Queues a banner: a small `kicker`, a big `title` and a `subtitle`, accented in `color` (gold by default). */
	Show(kicker, title, subtitle, color) {
		this.#waiting.push({kicker, title, subtitle, color});
		this.#ShowNext();
	}


	#ShowNext() {
		if (this.#isShowing || !this.#waiting.length) {
			return;
		}
		this.#isShowing = true;
		const banner = this.#waiting.shift();
		const element = FindElement('#banner');
		element.style.setProperty('--banner-color', banner.color || DEFAULT_COLOR);
		element.querySelector('.banner-kicker').textContent = banner.kicker;
		element.querySelector('.banner-title').textContent = banner.title;
		element.querySelector('.banner-subtitle').textContent = banner.subtitle || '';
		// Restart the CSS animation: remove the class, force a layout, add it again
		element.classList.remove('is-active');
		void element.offsetWidth;
		element.classList.add('is-active');
		setTimeout(() => {
			element.classList.remove('is-active');
			this.#isShowing = false;
			this.#ShowNext();
		}, DISPLAY_MS);
	}
}


export const banners = new BannerQueue();
