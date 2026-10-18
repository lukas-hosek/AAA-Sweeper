/**
 * intro-scene.js: the middleware logo intro, skipped by holding a key or the pointer.
 */
import {soundEffects} from '../audio/sound-effects.js';
import {FindAllElements, FindElement} from '../core/dom.js';
import {Sleep} from '../core/time.js';
import {screens} from '../ui/screen-manager.js';
import {titleScene} from './title-scene.js';


const FIRST_CARD_DELAY_MS = 900;
const DEFAULT_CARD_MS = 2300;           // Unless the card says otherwise in data-hold-ms
const CARD_GAP_MS = 900;
const HOLD_TO_SKIP_MS = 850;
const RING_CIRCUMFERENCE = 94.25;       // Of the skip ring's progress circle (r = 15): its full dash offset


/**
 * One logo card after another, each with its sting. Holding Space, Enter, Escape or the pointer fills the skip ring;
 * once full, the intro ends early. Either way it ends on the title screen.
 */
export class IntroScene {
	#token = 0;                         // Incremented to abandon a running Play()
	#isLeaving = false;                 // On the way to the title screen: no second exit
	#isHeld = false;                    // The skip button is held
	#holdStartTime = 0;
	#holdFrame = 0;                     // requestAnimationFrame handle of the skip ring


	/** Holding the pointer anywhere on the intro skips it, like a held key. */
	Init() {
		FindElement('#intro').addEventListener('pointerdown', event => {
			event.preventDefault();
			this.HoldStart();
		});
		addEventListener('pointerup', () => this.HoldEnd());
		addEventListener('pointercancel', () => this.HoldEnd());
	}


	/** Plays the logo cards, then shows the title screen. */
	async Play() {
		this.#isLeaving = false;
		const token = ++this.#token;
		const cards = FindAllElements('#intro .logo-card');
		for (const card of cards) {
			card.classList.remove('is-active');
		}
		FindElement('#skip-hint').classList.remove('is-holding');
		await Sleep(FIRST_CARD_DELAY_MS);
		for (const card of cards) {
			if (token !== this.#token) {
				return;
			}
			card.classList.add('is-active');
			soundEffects.IntroSting(card.dataset.sting);
			await Sleep(Number(card.dataset.holdMs) || DEFAULT_CARD_MS);
			if (token !== this.#token) {
				return;
			}
			card.classList.remove('is-active');
			await Sleep(CARD_GAP_MS);
		}
		if (token === this.#token && !this.#isLeaving) {
			this.#isLeaving = true;
			titleScene.Show(false);
		}
	}


	/** Starts filling the skip ring; when it is full, the intro ends. */
	HoldStart() {
		if (screens.current !== 'intro' || this.#isHeld || this.#isLeaving) {
			return;
		}
		this.#isHeld = true;
		this.#holdStartTime = performance.now();
		FindElement('#skip-hint').classList.add('is-holding');
		const ring = FindElement('#skip-ring-progress');
		const fill = () => {
			if (!this.#isHeld) {
				return;
			}
			const progress = Math.min(1, (performance.now() - this.#holdStartTime) / HOLD_TO_SKIP_MS);
			ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
			if (progress >= 1) {
				this.#isHeld = false;
				this.#token++;
				ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
				this.#isLeaving = true;
				titleScene.Show(false);
				return;
			}
			this.#holdFrame = requestAnimationFrame(fill);
		};
		fill();
	}


	/** Let go before the ring was full: empty it again. */
	HoldEnd() {
		if (!this.#isHeld) {
			return;
		}
		this.#isHeld = false;
		cancelAnimationFrame(this.#holdFrame);
		FindElement('#skip-ring-progress').style.strokeDashoffset = String(RING_CIRCUMFERENCE);
	}
}


export const introScene = new IntroScene();
