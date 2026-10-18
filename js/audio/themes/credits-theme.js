/**
 * credits-theme.js: the end credits. A piano melody in F that grows over three cycles: alone, with taiko and
 * arpeggios, then with braams and a doubled saw line.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[41, 'M'], [48, 'M'], [50, 'm'], [46, 'M'], [41, 'M'], [48, 'M'], [46, 'M'], [48, 'M']];


// Piano melody, one row per bar, 0 = rest
const MELODY = [
	[69, 0, 72, 0, 77, 0, 76, 74],
	[72, 0, 0, 0, 67, 0, 72, 74],
	[74, 0, 77, 0, 76, 0, 74, 72],
	[70, 0, 74, 0, 72, 0, 70, 69],
	[69, 0, 72, 0, 77, 0, 79, 81],
	[79, 0, 0, 76, 77, 0, 76, 74],
	[74, 0, 77, 0, 82, 0, 81, 79],
	[77, 0, 0, 0, 76, 0, 0, 0],
];


// Chord tone of the accompanying arpeggio on each step
const ARPEGGIO = [0, 1, 2, 1, 0, 1, 2, 1];


/** 68 BPM, 2 steps per beat, an 8-bar melody; a cycle is 64 steps and the arrangement grows over 3 cycles. */
export class CreditsTheme extends MusicTheme {
	constructor() {
		super('credits', 68, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const cycle = Math.floor(step / 64) % 3;
		const bar = Math.floor(step / 8) % 8;
		const stepInBar = step % 8;
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar === 0) {
			instruments.Pad(MusicTheme.Triad(root + 12, quality), time, this.stepSeconds * 8, 0.04);
			this.PlayBass(root, time, 8, 0.11, {attack: 0.4, release: 0.8});
			if (cycle >= 1) {
				instruments.Taiko(time, cycle === 2 ? 0.5 : 0.28);
			}
			if (cycle === 2 && (bar === 0 || bar === 4)) {
				instruments.Braam(root, time, 0.12);
			}
		}
		const melodyNote = MELODY[bar][stepInBar];
		if (melodyNote) {
			instruments.Piano(MidiToFrequency(melodyNote), time, 0.09);
			if (cycle === 2) {
				engine.PlayTone('sawtooth', MidiToFrequency(melodyNote - 12), time, this.stepSeconds * 1.6, 0.025, engine.duckBus, {
					attack: 0.08, release: 0.4, lowpass: 1800, send: engine.musicReverbSend,
				});
			}
		}
		if (cycle >= 1) {
			instruments.Piano(MidiToFrequency(chord[ARPEGGIO[stepInBar]] + 12), time, 0.035);
		}
	}
}
