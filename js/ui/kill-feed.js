/**
 * kill-feed.js: the shooter-style event feed in the corner ("SWEEPER ▸ REVEALED C4 ×12 +120").
 */
import {FindElement} from '../core/dom.js';


const MAX_LINES = 6;
const DISPLAY_MS = 5200;
const LEAVE_MS = 700;           // Matches the CSS fade of .feed-line.is-leaving


/** A short list of recent events, newest at the bottom; each line fades out after a few seconds. */
export class KillFeed {
	/** Adds a line. `html` is trusted markup; `style` adds an is-<style> class ('gold' for objectives and lore). */
	Add(html, style = '') {
		const feed = FindElement('#kill-feed');
		const line = document.createElement('div');
		line.className = 'feed-line' + (style ? ' is-' + style : '');
		line.innerHTML = html;
		feed.appendChild(line);
		while (feed.children.length > MAX_LINES) {
			feed.firstChild.remove();
		}
		setTimeout(() => {
			line.classList.add('is-leaving');
			setTimeout(() => line.remove(), LEAVE_MS);
		}, DISPLAY_MS);
	}


	/** Empties the feed (a new chapter starts). */
	Clear() {
		FindElement('#kill-feed').innerHTML = '';
	}
}


export const killFeed = new KillFeed();
