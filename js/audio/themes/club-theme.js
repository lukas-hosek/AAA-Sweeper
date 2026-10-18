/**
 * club-theme.js: Da Club, four-on-the-floor in A minor at 124 BPM (the dance floor tiles pulse to it).
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 16-step bar: [MIDI root, quality] */
const PROGRESSION = [[45, 'm'], [41, 'M'], [48, 'M'], [43, 'M']];

// Semitones above the chord root for the arpeggio in the second half of the 8-bar cycle
const ARPEGGIO = [0, 7, 12, 16, 12, 7, 3, 7];


/** 124 BPM, 4 steps per beat. The arpeggio joins for the second half of each 8-bar cycle, a riser ends it. */
export class ClubTheme extends MusicTheme {
	constructor() {
		super('club', 124, 4);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 16) % 4;
		const stepInBar = step % 16;
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar % 4 === 0) {
			instruments.Kick(time, 0.8);
		}
		if (stepInBar === 4 || stepInBar === 12) {
			instruments.Clap(time, 0.28);
		}
		if (stepInBar % 4 === 2) {
			instruments.HiHat(time, 0.11, true);
		} else if (stepInBar % 2 === 1) {
			instruments.HiHat(time, 0.045, false);
		}
		// Off-beat resonant saw bass
		if (stepInBar % 4 === 2) {
			engine.PlayTone('sawtooth', MidiToFrequency(root - 12), time, this.stepSeconds * 1.5, 0.17, engine.duckBus, {
				lowpass: 560, resonance: 6, release: 0.04,
			});
		}
		if (stepInBar === 3 || stepInBar === 10) {
			instruments.Stab(chord.map(note => note + 12), time, 0.05);
		}
		const barInCycle = Math.floor(step / 16) % 8;
		if (barInCycle >= 4) {
			const note = chord[0] + 24 + ARPEGGIO[stepInBar % 8];
			engine.PlayTone('square', MidiToFrequency(note), time, 0.06, 0.022, engine.duckBus, {
				lowpass: 3200, release: 0.03, send: engine.musicReverbSend,
			});
		}
		// A noise riser over the last bar of the cycle
		if (barInCycle === 7 && stepInBar === 0) {
			engine.PlayNoise(time, this.stepSeconds * 16, 0.07, engine.duckBus, {
				filterType: 'bandpass', frequency: 300, frequencyEnd: 6000, resonance: 2, attack: this.stepSeconds * 14, release: 0.05,
			});
		}
	}
}
