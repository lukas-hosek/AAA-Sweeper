/**
 * battle-theme.js: the default in-game music (theme id 'game'), used by Sector B-4. Driving D minor plucks over taiko.
 */
import {MidiToFrequency} from '../../core/math.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 16-step bar: [MIDI root, quality] */
const PROGRESSION = [[38, 'm'], [38, 'm'], [34, 'M'], [36, 'M']];

// Which chord tone the pluck plays on each step of a bar
const PLUCK_PATTERN = [0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 1, 2, 1];


/** 100 BPM, 4 steps per beat. A braam lands on every second pass of the 4-bar loop. */
export class BattleTheme extends MusicTheme {
	constructor() {
		super('game', 100, 4);
	}


	PlayStep(step, time) {
		const bar = Math.floor(step / 16) % 4;
		const stepInBar = step % 16;
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar === 0) {
			instruments.Pad(MusicTheme.Triad(root + 12, quality), time, this.stepSeconds * 16, 0.03);
			this.PlayBass(root, time, 16, 0.1, {attack: 0.3, release: 0.6});
			if (bar === 0 && Math.floor(step / 64) % 2 === 1) {
				instruments.Braam(root, time, 0.16);
			}
		}
		// The last quarter of the loop climbs an octave
		const octaveLift = bar === 3 && stepInBar > 11 ? 12 : 0;
		instruments.Pluck(MidiToFrequency(chord[PLUCK_PATTERN[stepInBar]] + 24 + octaveLift), time, 0.05);
		if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) {
			instruments.Taiko(time, stepInBar === 0 ? 0.55 : 0.3);
		}
		if (stepInBar === 4 || stepInBar === 12) {
			instruments.HiHat(time, 0.04, false);
		}
	}
}
