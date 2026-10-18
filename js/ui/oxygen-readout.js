/**
 * oxygen-readout.js: the big Pathos-4 readout above the board: the flood countdown, then the breath percentage.
 */
import {FindElement} from '../core/dom.js';


const MINIMUM_FONT_SIZE = 14;      // Shrinking to fit stops here (CSS pixels)
const TOASTS_GAP = 8;              // The toasts move down to stay this far below the readout


/**
 * A DOM element rather than canvas text, so the digits stay crisp and CSS can animate the alarm. The board renderer
 * places it every frame; it only touches the DOM when something changed, and shrinks the font until the text fits.
 */
export class OxygenReadout {
	#element = FindElement('#oxygen-readout');
	#shownKey = '';                // Everything last shown, to skip identical updates ('' while hidden)
	#placementKey = '';            // Position, requested font size and width limit that #fontSize was fitted for
	#fontSize = 0;                 // Current font size, possibly shrunk below the requested one


	/** Shows `html` with its top centre at x, y (CSS pixels) in up to `fontSize` px, shrunk to fit `maxWidth`. */
	Show(html, stateClasses, x, y, fontSize, maxWidth) {
		const shownKey = html + '|' + stateClasses + '|' + x + '|' + y + '|' + fontSize + '|' + maxWidth;
		if (shownKey === this.#shownKey) {
			return;
		}
		this.#shownKey = shownKey;
		// A new placement starts over from the requested size; otherwise the fitted size stays, so the text doesn't jump
		const placementKey = x + '|' + y + '|' + fontSize + '|' + maxWidth;
		if (placementKey !== this.#placementKey) {
			this.#placementKey = placementKey;
			this.#fontSize = fontSize;
		}
		const element = this.#element;
		element.className = 'is-active ' + stateClasses;
		element.style.fontSize = this.#fontSize + 'px';
		element.innerHTML = html;
		element.style.left = x + 'px';
		element.style.top = y + 'px';
		const width = element.offsetWidth;
		if (width > maxWidth) {
			this.#fontSize = Math.max(MINIMUM_FONT_SIZE, Math.floor(this.#fontSize * maxWidth / width));
			element.style.fontSize = this.#fontSize + 'px';
		}
		FindElement('#toast-stack').style.top = Math.round(element.getBoundingClientRect().bottom + TOASTS_GAP) + 'px';
	}


	/** Hides the readout and puts the toasts back. Skips the DOM if it is already hidden, unless `force`. */
	Hide(force = false) {
		if (!this.#shownKey && !force) {
			return;
		}
		this.#shownKey = '';
		this.#placementKey = '';
		this.#element.className = '';
		FindElement('#toast-stack').style.top = '';
	}


	/**
	 * The breath percentage as HTML. It halves forever and never reaches zero (that's the joke), so it shows whole
	 * percent down to 10 %, then ever more decimals, then scientific notation below a millionth of a percent.
	 */
	FormatBreath(breathLog10) {
		const percent = Math.pow(10, breathLog10);
		if (breathLog10 >= 1) {
			return Math.round(percent) + '%';
		}
		if (breathLog10 >= -6) {
			return percent.toFixed(Math.min(9, 2 - Math.floor(breathLog10))) + '%';
		}
		const exponent = Math.floor(breathLog10);
		const mantissa = Math.min(9.99, Math.pow(10, breathLog10 - exponent));
		return `${mantissa.toFixed(2)}×10<sup>−${-exponent}</sup>%`;
	}
}


export const oxygenReadout = new OxygenReadout();
