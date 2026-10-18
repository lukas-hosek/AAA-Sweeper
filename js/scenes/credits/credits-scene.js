/**
 * credits-scene.js: the end credits: title cards, the 1,412-position roll with concept art, and the ending.
 */
import {audioEngine} from '../../audio/audio-engine.js';
import {instruments} from '../../audio/instruments.js';
import {music} from '../../audio/music-sequencer.js';
import {soundEffects} from '../../audio/sound-effects.js';
import {voices} from '../../audio/voice-manager.js';
import {EscapeHtml, FindElement} from '../../core/dom.js';
import {CHARACTERS} from '../../data/characters.js';
import {END_CARDS, OPENING_CARDS, SEQUEL_CARD, TOTAL_POSITIONS} from '../../data/credits-text.js';
import {SubtitleOf} from '../../data/subtitles.js';
import {VOICE_LINES} from '../../data/voice-manifest.js';
import {CHAPTERS} from '../../game/chapters.js';
import {game} from '../../game/game.js';
import {missionOutcome} from '../../game/mission-outcome.js';
import {achievements} from '../../ui/achievements.js';
import {oxygenReadout} from '../../ui/oxygen-readout.js';
import {screens} from '../../ui/screen-manager.js';
import {titleScene} from '../title-scene.js';
import {CreditsRoll} from './credits-roll.js';


const CARD_MS = 3600;                   // Default time a title card stays
const CARD_GAP_MS = 1000;               // Between title cards
const WAIT_STEP_MS = 50;
const FAST_FORWARD_FACTOR = 5;          // Waits run this much faster while fast-forwarding
const BRAAM_NOTE = 41;
const PLAYER_TILE_PIXELS = 220;
const FAREWELL_LINE = 'd_win';          // Big Dez says goodbye to the player
const UNKNOWN_VOICE_SECONDS = 3;


/**
 * The credits can be watched from the title menu or are earned by clearing the last chapter (they then return to the
 * results screen). Holding Space, Enter or the pointer fast-forwards; the SKIP button or Escape jumps to the ending.
 * Every step checks a token, so skipping or restarting abandons the sequence that was running.
 */
export class CreditsScene {
	isRolling = false;                  // The credits are on screen: keys and pointer go to them
	isFastForward = false;
	wasSkipped = false;                 // The results screen remarks on it
	roll = new CreditsRoll();
	#returnTo = 'title';                // 'title', or 'game' for the results screen
	#token = 0;                         // Incremented to abandon the running sequence


	/** Wires the SKIP button and fast-forwarding by holding the pointer. */
	Init() {
		FindElement('#credits-skip').addEventListener('click', event => {
			event.stopPropagation();
			soundEffects.MenuSelect();
			this.Skip();
		});
		FindElement('#credits').addEventListener('pointerdown', event => {
			if (!event.target.closest('button')) {
				this.isFastForward = true;
			}
		});
		addEventListener('pointerup', () => {
			this.isFastForward = false;
		});
		addEventListener('pointercancel', () => {
			this.isFastForward = false;
		});
	}


	/** Rolls the credits from the start. `returnTo`: 'title', or 'game' to show the final results afterwards. */
	async Start(returnTo) {
		oxygenReadout.Hide(true);
		this.#returnTo = returnTo;
		this.isRolling = true;
		this.isFastForward = false;
		this.wasSkipped = false;
		const token = ++this.#token;
		// The concept art notes are handwritten
		if (document.fonts && document.fonts.load) {
			document.fonts.load('700 24px Caveat').catch(() => {});
		}
		this.roll.Stop();
		voices.StopAll();
		audioEngine.Unmuffle();
		screens.CloseOverlays();
		await screens.FadeTo(1, 800);
		if (token !== this.#token) {
			return;
		}
		FindElement('#credits').hidden = false;
		FindElement('#credits-stage').hidden = true;
		FindElement('#credits-ui').hidden = false;
		FindElement('#credits-cards').innerHTML = '';
		FindElement('#credits-count').textContent = `POSITIONS CREDITED 0000 / ${TOTAL_POSITIONS.toLocaleString('en-US')}`;
		music.Start('credits');
		await screens.FadeTo(0, 900);
		if (!await this.#PlayCards(OPENING_CARDS, token)) {
			return;
		}
		this.roll.Build();
		FindElement('#credits-cards').innerHTML = '';
		FindElement('#credits-stage').hidden = false;
		// Two frames, so the list is laid out before the roll measures it
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
		if (token !== this.#token) {
			return;
		}
		await this.roll.Play(() => this.isFastForward);
		if (token !== this.#token) {
			return;
		}
		if (!this.wasSkipped) {
			achievements.Unlock('credits');
		}
		await this.#PlayEnding(token);
	}


	/** Jumps to the ending (an achievement of its own). */
	Skip() {
		if (!this.isRolling) {
			return;
		}
		this.wasSkipped = true;
		achievements.Unlock('skipcred');
		const token = ++this.#token;
		this.roll.Stop();
		this.isFastForward = false;
		voices.StopAll();
		FindElement('#credits-stage').hidden = true;
		FindElement('#credits-cards').innerHTML = '';
		this.#PlayEnding(token);
	}


	/** Waits `milliseconds` (faster while fast-forwarding), or until the sequence is abandoned. */
	#Wait(milliseconds, token) {
		return new Promise(resolve => {
			let elapsed = 0;
			const timer = setInterval(() => {
				elapsed += WAIT_STEP_MS * (this.isFastForward ? FAST_FORWARD_FACTOR : 1);
				if (token !== this.#token || elapsed >= milliseconds) {
					clearInterval(timer);
					resolve();
				}
			}, WAIT_STEP_MS);
		});
	}


	/** Shows title cards one after another. Resolves to false if the sequence was abandoned meanwhile. */
	async #PlayCards(cards, token) {
		const box = FindElement('#credits-cards');
		for (const card of cards) {
			if (token !== this.#token) {
				return false;
			}
			box.innerHTML = `<div class="credits-card">${card.html}</div>`;
			const element = box.firstElementChild;
			// Force a layout so the fade-in transition runs
			void element.offsetWidth;
			element.classList.add('is-active');
			if (card.braam && audioEngine.context) {
				instruments.Braam(BRAAM_NOTE, audioEngine.context.currentTime + 0.05, 0.26);
			}
			await this.#Wait(card.ms || CARD_MS, token);
			if (token !== this.#token) {
				return false;
			}
			element.classList.remove('is-active');
			await this.#Wait(CARD_GAP_MS, token);
		}
		return token === this.#token;
	}


	/** "THE END", then the player's own credit (a tile, and Big Dez saying goodbye), then the sequel tease. */
	async #PlayEnding(token) {
		FindElement('#credits-stage').hidden = true;
		if (!await this.#PlayCards(END_CARDS, token)) {
			return;
		}
		FindElement('#credits-ui').hidden = true;
		const card = this.#ShowPlayerCredit();
		music.Stop();
		await this.#Wait(1800, token);
		if (token !== this.#token) {
			return;
		}
		voices.Say(FAREWELL_LINE);
		const subtitle = `<b style="color:${CHARACTERS.dez.color}">Big Dez:</b> ${EscapeHtml(SubtitleOf(FAREWELL_LINE))}`;
		FindElement('#player-credit-subtitle').innerHTML = subtitle;
		const line = VOICE_LINES[FAREWELL_LINE];
		await this.#Wait(((line && line.duration) || UNKNOWN_VOICE_SECONDS) * 1000 + 1500, token);
		if (token !== this.#token) {
			return;
		}
		card.classList.remove('is-active');
		await this.#Wait(900, token);
		if (token !== this.#token) {
			return;
		}
		music.Start('credits');
		if (!await this.#PlayCards([SEQUEL_CARD], token)) {
			return;
		}
		this.#Finish();
	}


	/** The last credit goes to the player: a single hidden tile with the quest marker over it. Returns the card. */
	#ShowPlayerCredit() {
		const box = FindElement('#credits-cards');
		box.innerHTML = '<div class="credits-card player-credit"><div class="player-credit-marker"></div>'
			+ `<canvas id="player-credit-tile" width="${PLAYER_TILE_PIXELS}" height="${PLAYER_TILE_PIXELS}"></canvas>`
			+ '<p class="player-credit-subtitle" id="player-credit-subtitle"></p></div>';
		const tile = CHAPTERS[0].tileset.DrawHidden(PLAYER_TILE_PIXELS, false, false);
		FindElement('#player-credit-tile').getContext('2d').drawImage(tile, 0, 0);
		const card = box.firstElementChild;
		void card.offsetWidth;
		card.classList.add('is-active');
		return card;
	}


	/** Leaves the credits: to the final results after the campaign, otherwise to the title menu. */
	#Finish() {
		this.isRolling = false;
		this.isFastForward = false;
		this.roll.Stop();
		(async () => {
			await screens.FadeTo(1, 700);
			FindElement('#credits').hidden = true;
			FindElement('#credits-cards').innerHTML = '';
			if (this.#returnTo === 'game' && game.field) {
				music.Start('win');
				missionOutcome.ShowResults(true);
				await screens.FadeTo(0, 700);
			} else {
				game.EndField();
				titleScene.Show(true);
			}
		})();
	}
}


export const creditsScene = new CreditsScene();
