/**
 * field-events.js: the small recurring events of a field: idle barks, skill-point nags, the halfway call,
 * fake autosaves and loading-screen-style tips during play.
 */
import {voices} from '../../audio/voice-manager.js';
import {FindElement} from '../../core/dom.js';
import {profile} from '../../core/player-profile.js';
import {random} from '../../core/random.js';
import {GAMEPLAY_TIPS} from '../../data/texts.js';
import {TUNING} from '../../data/tuning.js';
import {achievements} from '../../ui/achievements.js';
import {game} from '../game.js';


const IDLE_BARKS = ['r_idle', 'r_idle2', 'j_idle'];
const TIP_DISPLAY_MS = 7000;            // Real time a tip stays up
const TIP_FADE_MS = 350;                // Matches the CSS transition of #tip-box
const AUTOSAVE_DISPLAY_MS = 2400;       // Real time the autosave spinner shows


/** Timers on the field clock that fire barks and HUD notices; none of them affects the board. */
export class FieldEvents {
	/** Fires whatever is due, always in the same order. Called every unpaused frame. */
	Update(field) {
		const isPlaying = field.minesPlanted && !field.isOver && !field.isDead;
		if (isPlaying) {
			this.#CheckIdle(field);
		}
		if (profile.skillPoints > 0 && isPlaying && field.clock >= field.nextSkillNagTime) {
			field.nextSkillNagTime = field.clock + TUNING.skillNag.interval;
			voices.Bark('s_skill', 'sskill', 70);
		}
		const isHalfway = field.openedCount >= (field.tileCount - field.mineCount) / 2;
		if (field.minesPlanted && !field.halfwayAnnounced && isHalfway && !field.isOver) {
			field.halfwayAnnounced = true;
			game.Schedule(1, () => voices.Bark('r_half', 'half', 999, {}));
		}
		if (!field.isOver && field.clock >= field.nextAutosaveTime) {
			field.nextAutosaveTime = field.clock + random.Range(TUNING.autosave.minimumInterval, TUNING.autosave.maximumInterval);
			this.#ShowAutosave();
		}
		if (!field.isOver && field.clock >= field.nextTipTime) {
			const tips = TUNING.tips;
			const interval = field.tipsShown < tips.quickCount
				? tips.quickInterval
				: random.Range(tips.minimumInterval, tips.maximumInterval);
			field.nextTipTime = field.clock + interval;
			this.#ShowTip(field);
		}
	}


	/** Nobody has clicked in a while: first the radio asks, a bit later there's an achievement for it. */
	#CheckIdle(field) {
		const idleSeconds = field.clock - field.lastActionTime;
		if (idleSeconds > TUNING.idle.barkAfter && field.idleStage === 0) {
			field.idleStage = 1;
			voices.Bark(random.Pick(IDLE_BARKS), 'idle', 30, {});
		}
		if (idleSeconds > TUNING.idle.achievementAfter && field.idleStage === 1) {
			field.idleStage = 2;
			achievements.Unlock('idle');
		}
	}


	/** Slides in the next gameplay tip for a few seconds. */
	#ShowTip(field) {
		const box = FindElement('#tip-box');
		FindElement('#tip-text').textContent = GAMEPLAY_TIPS[field.tipsShown % GAMEPLAY_TIPS.length];
		field.tipsShown++;
		box.hidden = false;
		// Unhide first and add the class a frame later, so the slide-in transition runs
		requestAnimationFrame(() => box.classList.add('is-active'));
		setTimeout(() => {
			box.classList.remove('is-active');
			setTimeout(() => {
				box.hidden = true;
			}, TIP_FADE_MS);
		}, TIP_DISPLAY_MS);
	}


	/** Shows the autosave spinner. Nothing is saved; sometimes someone on the radio is relieved anyway. */
	#ShowAutosave() {
		const indicator = FindElement('#autosave-indicator');
		indicator.hidden = false;
		setTimeout(() => {
			indicator.hidden = true;
			if (random.Next() < 0.4) {
				voices.Bark('s_save', 'ssave', 60);
			}
		}, AUTOSAVE_DISPLAY_MS);
	}
}


export const fieldEvents = new FieldEvents();
