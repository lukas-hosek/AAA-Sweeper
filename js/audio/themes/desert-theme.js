/**
 * desert-theme.js: The Dune Sea. An oud melody in the Hijaz mode over a D drone, goblet drum, and a ney now and then.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


// Oud melody, one row per 16-step bar (MIDI notes, 0 = rest), D Hijaz
const HIJAZ_MELODY = [
	[62, 0, 63, 66, 67, 0, 66, 63, 62, 0, 0, 63, 66, 67, 69, 0],
	[70, 0, 69, 67, 66, 0, 67, 66, 63, 0, 62, 0, 63, 66, 63, 0],
	[62, 0, 63, 66, 67, 0, 66, 63, 62, 0, 0, 63, 66, 67, 69, 0],
	[74, 72, 70, 69, 70, 69, 67, 66, 67, 66, 63, 66, 62, 0, 0, 0],
];


/** 92 BPM, 4 steps per beat, a 4-bar loop; the braam and the ney alternate between passes. */
export class DesertTheme extends MusicTheme {
	constructor() {
		super('desert', 92, 4);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 16) % 4;
		const stepInBar = step % 16;
		const pass = Math.floor(step / 64);
		if (stepInBar === 0) {
			// D and A drone
			engine.PlayTone('sawtooth', MidiToFrequency(38), time, this.stepSeconds * 16, 0.05, engine.duckBus, {
				attack: 0.4, release: 0.6, lowpass: 320,
			});
			engine.PlayTone('sawtooth', MidiToFrequency(45), time, this.stepSeconds * 16, 0.035, engine.duckBus, {
				attack: 0.4, release: 0.6, lowpass: 380,
			});
			if (bar === 0 && pass % 2 === 1) {
				instruments.Braam(38, time, 0.13);
			}
			if (bar === 2 && pass % 2 === 0) {
				instruments.Ney(74, time + this.stepSeconds * 2, this.stepSeconds * 10);
			}
		}
		const melodyNote = HIJAZ_MELODY[bar][stepInBar];
		if (melodyNote > 0) {
			instruments.Oud(MidiToFrequency(melodyNote), time, 0.075);
		}
		if (stepInBar === 0 || stepInBar === 8) {
			instruments.Doum(time, stepInBar === 0 ? 0.5 : 0.4);
		}
		if (stepInBar === 2 || stepInBar === 6 || stepInBar === 12) {
			instruments.Tek(time, 0.2);
		}
		if (stepInBar === 14 || stepInBar === 15) {
			instruments.Tek(time, 0.07);
		}
	}
}
