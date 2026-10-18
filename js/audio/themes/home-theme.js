/**
 * home-theme.js: Mom's Backyard. A lazy swung lo-fi groove in F with electric piano and, every other pass, whistling.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {CHORD_INTERVALS, MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One seventh chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[41, 'maj7'], [38, 'm7'], [43, 'm7'], [36, '7']];


// Whistled melody, one row per bar, 0 = rest
const WHISTLE_MELODY = [
	[77, 0, 76, 77, 0, 72, 0, 0],
	[74, 0, 72, 74, 0, 69, 0, 0],
	[70, 0, 72, 74, 0, 77, 0, 76],
	[74, 0, 72, 0, 70, 0, 0, 0],
];


const SWING = 0.22;    // Off-beat steps are late by this fraction of a step


/** 88 BPM, 2 steps per beat, a 4-bar loop. */
export class HomeTheme extends MusicTheme {
	constructor() {
		super('home', 88, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 8) % 4;
		const stepInBar = step % 8;
		const [root, quality] = PROGRESSION[bar];
		const chord = CHORD_INTERVALS[quality].map(interval => root + 24 + interval);
		const swungTime = time + ((stepInBar & 1) ? this.stepSeconds * SWING : 0);
		// Soft kick
		if (stepInBar === 0 || stepInBar === 4) {
			engine.PlayTone('sine', 110, swungTime, 0.18, 0.32, engine.duckBus, {glideTo: 50, glideSeconds: 0.1, release: 0.06});
		}
		// Walking bass: root, fifth, octave, fifth
		if (stepInBar % 2 === 0) {
			const bassNote = [root, root + 7, root + 12, root + 7][stepInBar / 2];
			engine.PlayTone('triangle', MidiToFrequency(bassNote), swungTime, this.stepSeconds * 1.6, 0.12, engine.duckBus, {
				lowpass: 900, release: 0.12,
			});
		}
		// Shaker
		engine.PlayNoise(swungTime, 0.04, (stepInBar & 1) ? 0.022 : 0.035, engine.duckBus, {
			filterType: 'bandpass', frequency: 6000, resonance: 0.8,
		});
		if (stepInBar === 2 || stepInBar === 6 || (stepInBar === 7 && bar === 3)) {
			for (const note of chord) {
				instruments.ElectricPiano(MidiToFrequency(note), swungTime, 0.032);
			}
		}
		if (Math.floor(step / 32) % 2 === 1) {
			const whistleNote = WHISTLE_MELODY[bar][stepInBar];
			if (whistleNote) {
				instruments.Whistle(MidiToFrequency(whistleNote), swungTime, this.stepSeconds * 1.7, 0.04);
			}
		}
	}
}
