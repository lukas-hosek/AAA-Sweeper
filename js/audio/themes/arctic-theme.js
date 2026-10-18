/**
 * arctic-theme.js: Station Nord-7. Cold E minor pads, wind and a music-box bell melody.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[40, 'm'], [36, 'M'], [45, 'm'], [47, 'm']];


/**
 * Bell patterns, one per pass, 32 steps each: -1 = rest, 0..2 = chord tone two octaves up, 3..5 = the same an octave higher.
 */
const BELL_PATTERNS = [
	[0, -1, 2, -1, 1, -1, -1, 4, 0, -1, 2, -1, 4, -1, 3, -1, 1, -1, 2, -1, 0, -1, -1, 5, 2, -1, 1, -1, 0, -1, -1, -1],
	[3, -1, -1, 2, -1, 1, -1, -1, 4, -1, -1, 3, -1, 2, -1, -1, 5, -1, 4, -1, 3, -1, 2, -1, 1, -1, -1, -1, 0, -1, -1, -1],
];


/** 66 BPM, 2 steps per beat, a 4-bar loop alternating the two bell patterns. */
export class ArcticTheme extends MusicTheme {
	constructor() {
		super('arctic', 66, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 8) % 4;
		const stepInBar = step % 8;
		const pass = Math.floor(step / 32);
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar === 0) {
			instruments.SoftPad(chord.map(note => note + 12), time, this.stepSeconds * 8, 0.026);
			this.PlayBass(root, time, 8, 0.09, {attack: 1.2, release: 1});
			// Wind
			engine.PlayNoise(time, this.stepSeconds * 8, 0.028, engine.duckBus, {
				filterType: 'bandpass', frequency: 450, frequencyEnd: 1500, resonance: 1.6, attack: this.stepSeconds * 4, release: 1,
			});
			if (bar === 0 && pass % 2 === 1) {
				instruments.Taiko(time, 0.22);
			}
		}
		const bellTone = BELL_PATTERNS[pass % 2][bar * 8 + stepInBar];
		if (bellTone >= 0) {
			instruments.Bell(MidiToFrequency(chord[bellTone % 3] + 36 + (bellTone >= 3 ? 12 : 0)), time, 0.05);
		}
		if (bar === 3 && stepInBar === 5) {
			instruments.Bell(MidiToFrequency(chord[2] + 48), time, 0.028);
		}
	}
}
