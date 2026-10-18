/**
 * flood-controller.js: Pathos-4: the flood countdown, the flooding itself, and breathing underwater afterwards.
 */
import {audioEngine} from '../audio/audio-engine.js';
import {chatter} from '../audio/chatter-scheduler.js';
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {FindElement, PREFERS_REDUCED_MOTION} from '../core/dom.js';
import {Clamp} from '../core/math.js';
import {random} from '../core/random.js';
import {TUNING} from '../data/tuning.js';
import {camera} from '../render/camera.js';
import {layout} from '../render/layout.js';
import {particles} from '../render/particles.js';
import {banners} from '../ui/banners.js';
import {hud} from '../ui/hud.js';
import {game} from './game.js';


const LOG10_OF_2 = 0.30103;
const UNDERWATER_CUTOFF_HZ = 1200;           // Everything sounds muffled once flooded
const FLOOD_CHATTER_LINES = ['rp_3', 'jp_3', 'mp_2'];
const FLOOD_CHATTER_PAUSE = 14;              // Seconds of quiet after the flood before ambient chatter resumes


/**
 * Counts down from the start of the chapter. On the way: a breach bark, a 30-second warning, ticks in the last ten
 * seconds and rising bubbles. At zero the base floods for good: the sound muffles and the breath meter takes over.
 * Breath then halves every 40 seconds. It never runs out; the readout just needs more decimals.
 */
export class FloodController {
	/** Advances the countdown, or breathing once flooded. Called every unpaused frame. */
	Update(field, deltaTime) {
		if (!field.chapter.floods || field.isOver) {
			return;
		}
		const elapsed = field.clock - field.floodStartTime;
		field.floodProgress = Clamp(elapsed / field.floodDuration, 0, 1);
		if (field.isFlooded) {
			this.#UpdateUnderwater(field, deltaTime);
		} else {
			this.#UpdateCountdown(field, deltaTime, elapsed);
		}
	}


	/** Floods the base now (the countdown reached zero, or a test hook). */
	Flood() {
		const field = game.field;
		field.isFlooded = true;
		field.floodProgress = 1;
		FindElement('#game').classList.add('is-flooded');
		soundEffects.Flood();
		audioEngine.MuffleTo(UNDERWATER_CUTOFF_HZ, 0.9);
		banners.Show('BASE FLOODED', 'HOLD YOUR BREATH', 'Breath meter enabled', '#6fe3d6');
		game.Schedule(1.6, () => voices.Bark('rp_flood', 'rpflood', 999, {}));
		game.Schedule(10, () => voices.Bark('hc_flood', 'hcflood', 999, {}));
		chatter.QueueOpeningLines(FLOOD_CHATTER_LINES);
		chatter.nextTime = Math.max(chatter.nextTime, field.clock + FLOOD_CHATTER_PAUSE);
		field.screenShake = PREFERS_REDUCED_MOTION ? 2 : 8;
		const viewport = layout.viewport;
		for (let k = 0; k < 120; k++) {
			const x = random.Range(0, viewport.width) - camera.x;
			const y = viewport.height + random.Range(0, 80);
			particles.EmitBubble(x, y, random.Range(2, 7));
		}
		hud.Refresh();
	}


	/** Before the flood: barks, the warning, the last-ten-seconds ticks and bubbles rising past the board. */
	#UpdateCountdown(field, deltaTime, elapsed) {
		const flood = TUNING.flood;
		const secondsLeft = field.floodDuration - elapsed;
		if (elapsed >= flood.breachBarkAfter && !field.breachAnnounced) {
			field.breachAnnounced = true;
			voices.Bark('s_breach', 'sbreach', 999, {});
		}
		if (secondsLeft <= flood.warningBefore && !field.floodWarningGiven) {
			field.floodWarningGiven = true;
			voices.Say('s_flood');
			game.Schedule(1.2, () => voices.Bark('rp_2', 'rp2', 999, {}));
			banners.Show('FLOODING IMMINENT', '30 SECONDS', 'Take a deep breath', '#ff6b4a');
		}
		if (secondsLeft <= flood.tickingBefore && secondsLeft > 0) {
			const second = Math.ceil(secondsLeft);
			if (second !== field.lastCountdownSecond) {
				field.lastCountdownSecond = second;
				soundEffects.CountdownTick();
			}
		}
		if (secondsLeft <= flood.warningBefore && random.Next() < deltaTime * 8) {
			const board = layout.board;
			const x = board.x + random.Range(0, board.width);
			const y = board.y + board.height + random.Range(0, 20);
			particles.EmitBubble(x, y);
		}
		if (secondsLeft <= 0) {
			this.Flood();
		}
	}


	/** After the flood: breath drains (by halves), bubbles rise from the bottom of the screen and burble now and then. */
	#UpdateUnderwater(field, deltaTime) {
		field.breathLog10 -= deltaTime * LOG10_OF_2 / TUNING.flood.breathHalfLife;
		const viewport = layout.viewport;
		if (random.Next() < deltaTime * 10) {
			particles.EmitBubble(random.Range(0, viewport.width) - camera.x, viewport.height + 10);
		}
		if (field.clock >= field.nextBubbleTime) {
			field.nextBubbleTime = field.clock + random.Range(2, 5);
			soundEffects.Bubbles();
		}
	}
}


export const flood = new FloodController();
