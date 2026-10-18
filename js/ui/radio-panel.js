/**
 * radio-panel.js: the "incoming transmission" panel: who is talking, on which channel, with their portrait.
 */
import {voices} from '../audio/voice-manager.js';
import {FindElement} from '../core/dom.js';
import {CHARACTERS} from '../data/characters.js';
import {portraitPainter} from './portrait-painter.js';


const HIDE_DELAY_MS = 700;          // The panel lingers a little after the last radio voice ends
const SLIDE_OUT_MS = 300;           // Matches the CSS transition of #radio-panel


/** Slides in for each radio speaker and out once nobody is on the radio any more. */
export class RadioPanel {
	color = '#f4b740';              // Colour of the current speaker; the waveform is drawn in it
	#element = FindElement('#radio-panel');
	#hideTimer = 0;                 // Pending HideSoon(), cancelled when someone else starts talking


	/** Shows a speaker (a CHARACTERS id): name, channel, portrait, and the panel tinted in their colour. */
	Show(speakerId) {
		clearTimeout(this.#hideTimer);
		const character = CHARACTERS[speakerId];
		this.color = character.color;
		this.#element.style.setProperty('--radio-color', character.color);
		FindElement('#radio-name').textContent = character.name;
		FindElement('#radio-tag').textContent = `CH ${character.channel} · ${character.tag}`;
		portraitPainter.Paint(speakerId);
		this.#element.hidden = false;
		// Unhide first and add the class a frame later, so the slide-in transition runs
		requestAnimationFrame(() => this.#element.classList.add('is-active'));
	}


	/** Slides the panel out shortly, unless another radio voice has started by then. */
	HideSoon() {
		clearTimeout(this.#hideTimer);
		this.#hideTimer = setTimeout(() => {
			this.#element.classList.remove('is-active');
			setTimeout(() => {
				if (!voices.ActiveRadioVoices().length) {
					this.#element.hidden = true;
				}
			}, SLIDE_OUT_MS);
		}, HIDE_DELAY_MS);
	}
}


export const radioPanel = new RadioPanel();
