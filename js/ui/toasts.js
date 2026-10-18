/**
 * toasts.js: the toast notifications in the corner, shown one after another.
 */
import {EscapeHtml, FindElement} from '../core/dom.js';


const DISPLAY_MS = 3200;
const LEAVE_MS = 400;           // Matches the CSS slide-out of .toast.is-leaving


/** One toast at a time; the rest wait in a queue, so a burst of unlocks plays out one by one. */
export class ToastQueue {
	#waiting = [];              // Toasts not shown yet, oldest first
	#isShowing = false;


	/**
	 * Queues a toast: a small `kicker` line, a `title` and an optional `description`. Rewards (achievements, purchases,
	 * lore) are gold, everything else is blue. `gamerscore` adds a "+10 G" style badge on the right.
	 */
	Show({kicker, title, description = '', isReward = false, icon = 'i', gamerscore = ''}) {
		this.#waiting.push({kicker, title, description, isReward, icon, gamerscore});
		this.#ShowNext();
	}


	#ShowNext() {
		if (this.#isShowing || !this.#waiting.length) {
			return;
		}
		this.#isShowing = true;
		const toast = this.#waiting.shift();
		const element = document.createElement('div');
		element.className = 'toast ' + (toast.isReward ? 'is-achievement' : 'is-info');
		const description = toast.description ? `<span class="toast-description">${EscapeHtml(toast.description)}</span>` : '';
		const gamerscore = toast.gamerscore ? `<span class="gamerscore">${EscapeHtml(toast.gamerscore)}</span>` : '';
		element.innerHTML = `<div class="badge-icon">${EscapeHtml(toast.icon)}</div>`
			+ `<div class="toast-text"><span class="toast-kicker">${EscapeHtml(toast.kicker)}</span>`
			+ `<span class="toast-name">${EscapeHtml(toast.title)}</span>${description}</div>${gamerscore}`;
		FindElement('#toast-stack').appendChild(element);
		setTimeout(() => {
			element.classList.add('is-leaving');
			setTimeout(() => {
				element.remove();
				this.#isShowing = false;
				this.#ShowNext();
			}, LEAVE_MS);
		}, DISPLAY_MS);
	}
}


export const toasts = new ToastQueue();
