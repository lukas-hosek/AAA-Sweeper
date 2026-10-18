/**
 * mission-outcome.js: how a field ends: death and checkpoint, victory, the results screen, and the credits after
 * the last chapter.
 */
import {music} from '../audio/music-sequencer.js';
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {EscapeHtml, FindAllElements, FindElement} from '../core/dom.js';
import {FULL_TURN} from '../core/math.js';
import {profile} from '../core/player-profile.js';
import {random} from '../core/random.js';
import {FormatMinutesSeconds, Sleep, Tween} from '../core/time.js';
import {DIFFICULTIES} from '../data/difficulties.js';
import {DEATH_QUOTES} from '../data/texts.js';
import {VOICE_LINES} from '../data/voice-manifest.js';
import {layout} from '../render/layout.js';
import {particles} from '../render/particles.js';
import {creditsScene} from '../scenes/credits/credits-scene.js';
import {titleScene} from '../scenes/title-scene.js';
import {achievements} from '../ui/achievements.js';
import {banners} from '../ui/banners.js';
import {hud} from '../ui/hud.js';
import {killFeed} from '../ui/kill-feed.js';
import {toasts} from '../ui/toasts.js';
import {CHAPTERS, ChapterForNumber} from './chapters.js';
import {game} from './game.js';
import {TILE} from './minefield.js';
import {mission} from './mission.js';


const ADVERTISED_CHAPTERS = 87;              // "Chapter 7 of 87 unlocked"
const UNKNOWN_VOICE_SECONDS = 5;             // Assumed length of a victory line missing from the manifest


/**
 * Dying is a short cutscene and a checkpoint that keeps all progress. Winning flags the remaining mines, throws
 * confetti and plays the victory lines; then the results screen follows, or the credits after the last chapter.
 */
export class MissionOutcome {
	/** Wires the results screen's star rating and buttons. */
	Init() {
		FindElement('#results-screen').addEventListener('click', event => this.#OnResultsClick(event));
	}


	/** Health reached zero: the death cutscene, then the checkpoint. */
	Die() {
		const field = game.field;
		field.isDead = true;
		field.deaths++;
		FindElement('#game').classList.add('is-dying');
		achievements.Unlock('dead');
		voices.Bark('r_dead', 'dead', 0, {});
		game.Schedule(2.6, () => voices.Bark('k_dead', 'kdead', 90, {}));
		setTimeout(() => this.#ShowDeathScreen(), 900);
	}


	/** Every safe tile is open: celebrate, then the results screen (or, after the last chapter, the credits). */
	async Win() {
		const field = game.field;
		field.isWon = true;
		field.isOver = true;
		field.questTarget = -1;
		// Flag the remaining mines, as classic Minesweeper does
		for (let i = 0; i < field.tileCount; i++) {
			if (field.isMine[i] && field.tileStates[i] === TILE.HIDDEN) {
				field.tileStates[i] = TILE.FLAGGED;
				field.flagCount++;
			}
		}
		profile.highestChapter = Math.max(profile.highestChapter || 1, Math.min(CHAPTERS.length, field.fieldNumber + 1));
		profile.Save();
		hud.Refresh();
		achievements.Unlock('win');
		if (field.chapter.achievement) {
			achievements.Unlock(field.chapter.achievement);
		}
		if (field.chapter.floods) {
			achievements.Unlock(field.isFlooded ? 'breath' : 'dryrun');
		}
		music.Start('win');
		FindElement('#letterbox').classList.add('is-active');
		voices.StopAll();
		this.#LaunchConfetti();
		banners.Show('FIELD CLEARED', field.chapter.operation.toUpperCase(), 'Mission complete');
		const [firstVictoryLine, secondVictoryLine] = field.chapter.victoryLines;
		setTimeout(() => voices.Say('a_complete'), 300);
		setTimeout(() => {
			if (this.#IsCelebrating(field)) {
				voices.Say(firstVictoryLine);
			}
		}, 2000);

		if (field.fieldNumber >= CHAPTERS.length) {
			// The last chapter: both victory lines in full, then the credits
			await Sleep(2600 + this.#VoiceSeconds(firstVictoryLine) * 1000);
			if (!this.#IsCelebrating(field)) {
				return;
			}
			voices.Say(secondVictoryLine);
			await Sleep((this.#VoiceSeconds(secondVictoryLine) + 1.4) * 1000);
			if (!this.#IsCelebrating(field)) {
				return;
			}
			FindElement('#letterbox').classList.remove('is-active');
			creditsScene.Start('game');
			return;
		}
		await Sleep(5600);
		if (!this.#IsCelebrating(field)) {
			return;
		}
		this.ShowResults(false);
		setTimeout(() => {
			if (this.#IsCelebrating(field)) {
				voices.Say(secondVictoryLine);
			}
		}, 2400);
	}


	/** The results screen for the current field; `isFinal` after the credits of the last chapter. */
	ShowResults(isFinal) {
		const field = game.field;
		const difficulty = DIFFICULTIES[field.difficultyKey].label.toUpperCase();
		const kicker = isFinal ? 'CAMPAIGN COMPLETE' : 'MISSION COMPLETE · CHAPTER ' + field.fieldNumber;
		const title = isFinal ? 'Triple A Sweeper' : EscapeHtml(field.chapter.operation);
		const stars = [1, 2, 3, 4, 5].map(count => `<button data-stars="${count}" aria-label="${count} stars">★</button>`).join('');
		FindElement('#results-content').innerHTML = `
			<div class="results-kicker">${kicker} · ${difficulty}</div>
			<h2>${title}</h2>
			<div class="results-grid">
				<div class="results-rank">${this.#Rank(field)}</div>
				<dl>${this.#StatisticsMarkup(field)}</dl>
			</div>
			<div class="results-rating">Rate this mission <span class="rating-stars">${stars}</span></div>
			<div class="results-buttons">${this.#ButtonsMarkup(field, isFinal)}</div>
			<div class="results-footer">${this.#FooterText(field, isFinal)}</div>`;
		FindElement('#results-screen').hidden = false;
		FindElement('#letterbox').classList.remove('is-active');
	}


	/** The death screen: a quote, a fake checkpoint load, and back into the same field with full health. */
	async #ShowDeathScreen() {
		if (!game.field) {
			return;
		}
		const screen = FindElement('#death-screen');
		const status = FindElement('#death-status');
		const barFill = FindElement('#death-bar-fill');
		const quote = random.Pick(DEATH_QUOTES);
		FindElement('#death-quote').innerHTML = `“${EscapeHtml(quote.text)}”<cite>${EscapeHtml(quote.source)}</cite>`;
		barFill.style.width = '0';
		status.textContent = '';
		screen.hidden = false;
		await Sleep(2400);
		if (!game.field) {
			return;
		}
		status.textContent = 'Loading last checkpoint…';
		await Tween(2000, progress => {
			barFill.style.width = (progress * 100) + '%';
		});
		status.textContent = 'Checkpoint restored. Your progress was kept, because we respect your time.';
		await Sleep(1500);
		if (!game.field) {
			return;
		}
		screen.hidden = true;
		this.#Respawn(game.field);
	}


	/** Back on your feet where you fell. Nothing on the board is reset. */
	#Respawn(field) {
		field.isDead = false;
		field.health = 100;
		field.healthTrail = 100;
		field.lastHitTime = -99;
		FindElement('#game').classList.remove('is-dying');
		voices.Say('s_check');
		game.Schedule(1.4, () => voices.Bark('j_respawn', 'jresp', 120, {}));
		killFeed.Add('<b>CHECKPOINT RESTORED</b> · Respawn tokens: ∞ (Premium)', 'gold');
	}


	/** Seven bursts of confetti over the board, one every 380 ms, each with a fanfare. */
	#LaunchConfetti() {
		for (let k = 0; k < 7; k++) {
			setTimeout(() => {
				if (!game.field) {
					return;
				}
				const board = layout.board;
				const x = board.x + random.Range(0, board.width);
				const y = board.y + random.Range(0, board.height * 0.7);
				for (let j = 0; j < 46; j++) {
					const angle = random.Range(0, FULL_TURN);
					const speed = random.Range(80, 320);
					particles.Emit({
						type: 'confetti',
						x,
						y,
						velocityX: Math.cos(angle) * speed,
						velocityY: Math.sin(angle) * speed - 120,
						gravity: 260,
						drag: 1.2,
						life: random.Range(1.2, 2.4),
						size: random.Range(3, 6),
						hue: random.Range(0, 360),
						rotation: random.Range(0, 6),
					});
				}
				soundEffects.Achievement();
			}, k * 380);
		}
	}


	/** True while `field` is still the current field and won (the player may have moved on meanwhile). */
	#IsCelebrating(field) {
		return game.field === field && field.isWon;
	}


	/** Length of a voice line in seconds. */
	#VoiceSeconds(voiceId) {
		const line = VOICE_LINES[voiceId];
		return line ? line.duration : UNKNOWN_VOICE_SECONDS;
	}


	/** S for no hits and no deaths, then A, B and C by the number of mines stepped on. */
	#Rank(field) {
		if (field.mineHits === 0 && field.deaths === 0) {
			return 'S';
		}
		if (field.mineHits <= 1) {
			return 'A';
		}
		return field.mineHits <= 3 ? 'B' : 'C';
	}


	/** The statistics list: <dt>/<dd> pairs. */
	#StatisticsMarkup(field) {
		const statistics = [
			['Mission time', FormatMinutesSeconds(field.missionSeconds)],
			['Tiles revealed', field.openedCount],
			['Mines stepped on', field.mineHits],
			['Deaths', field.deaths],
			['Quest markers followed', field.markersFollowed],
			['Radio transmissions endured', field.transmissionsHeard],
			['Respects paid', field.respectsPaid],
			['XP earned', field.xpEarned.toLocaleString('en-US')],
		];
		return statistics.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('');
	}


	/** Next chapter or replay; after the campaign, play again or rewatch the credits. Always the DLC and the menu. */
	#ButtonsMarkup(field, isFinal) {
		const button = (action, label, isSecondary) => {
			const classes = isSecondary ? 'panel-button is-secondary' : 'panel-button';
			return `<button class="${classes}" data-results-action="${action}">${label}</button>`;
		};
		const nextChapter = ChapterForNumber(field.fieldNumber + 1);
		const choices = isFinal
			? button('restart1', 'PLAY AGAIN FROM CHAPTER 1', false) + button('credits', 'WATCH THE CREDITS AGAIN', true)
			: button('next', `NEXT: ${EscapeHtml(nextChapter.name.toUpperCase())} →`, false) + button('again', 'REPLAY CHAPTER', true);
		return choices + button('dlc', 'BUY DLC: MINES OF THE NORTH · €24.99', true) + button('title', 'MAIN MENU', true);
	}


	/** The small print under the buttons. */
	#FooterText(field, isFinal) {
		if (isFinal) {
			const watched = creditsScene.wasSkipped ? 'some' : 'all';
			return `Chapters 6–${ADVERTISED_CHAPTERS} coming as DLC · You watched ${watched} of the credits`;
		}
		return `Chapter ${field.fieldNumber + 1} of ${ADVERTISED_CHAPTERS} unlocked · Credits roll after Chapter ${CHAPTERS.length}`;
	}


	/** The star rating (acknowledged, then ignored) and the buttons. */
	#OnResultsClick(event) {
		const star = event.target.closest('[data-stars]');
		if (star) {
			for (const button of FindAllElements('.rating-stars button')) {
				button.classList.toggle('is-active', Number(button.dataset.stars) <= Number(star.dataset.stars));
			}
			toasts.Show({kicker: 'THANK YOU', title: 'Your feedback has been received and ignored.', icon: '★'});
			return;
		}
		const button = event.target.closest('[data-results-action]');
		if (!button) {
			return;
		}
		soundEffects.MenuSelect();
		const field = game.field;
		const action = button.dataset.resultsAction;
		if (action === 'dlc') {
			soundEffects.Denied();
			toasts.Show({kicker: 'DLC UNAVAILABLE', title: 'Mines of the North is still being made by 2,800 people.', icon: '!'});
			return;
		}
		FindElement('#results-screen').hidden = true;
		if (action === 'next') {
			mission.Start(field.difficultyKey, true, field.fieldNumber + 1);
		} else if (action === 'again') {
			mission.Start(field.difficultyKey, true, field.fieldNumber);
		} else if (action === 'restart1') {
			mission.Start(field.difficultyKey, true, 1);
		} else if (action === 'credits') {
			creditsScene.Start('game');
		} else if (action === 'title') {
			game.EndField();
			titleScene.Show(true);
		}
	}
}


export const missionOutcome = new MissionOutcome();
