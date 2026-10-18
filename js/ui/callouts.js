/**
 * callouts.js: text that pops over the board: floating "+30 XP" numbers and the combo name of a big reveal.
 */
import {EscapeHtml, FindElement} from '../core/dom.js';


/** Both are CSS animations; this only places the text and restarts the animation. */
export class Callouts {
	/** Floats `text` up from a screen position (CSS pixels). `style` adds an is-<style> class ('big', 'negative'). */
	PopAt(x, y, text, style = '') {
		const popup = document.createElement('div');
		popup.className = 'xp-pop' + (style ? ' is-' + style : '');
		popup.textContent = text;
		popup.style.left = x + 'px';
		popup.style.top = y + 'px';
		FindElement('#hud').appendChild(popup);
		popup.addEventListener('animationend', () => popup.remove());
	}


	/** Shows a combo name ("MEGA SWEEP") with its tile count under the HUD. */
	ShowCombo(name, tileCount) {
		const element = FindElement('#combo-text');
		element.innerHTML = `${EscapeHtml(name)}<small>${tileCount} TILES</small>`;
		// Restart the CSS animation: remove the class, force a layout, add it again
		element.classList.remove('is-active');
		void element.offsetWidth;
		element.classList.add('is-active');
	}
}


export const callouts = new Callouts();
