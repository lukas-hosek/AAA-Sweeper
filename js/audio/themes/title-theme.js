/**
 * title-theme.js: the title screen music. D minor, slow and epic: pads, taiko and a twinkling arpeggio.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[38, 'm'], [34, 'M'], [41, 'M'], [36, 'M']];


/** 72 BPM, 2 steps per beat, a 4-bar loop. */
export class TitleTheme extends MusicTheme {
	constructor() {
		super('title', 72, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 8) % 4;
		const stepInBar = step % 8;
		const [root, quality] = PROGRESSION[bar];
		if (stepInBar === 0) {
			instruments.Pad(MusicTheme.Triad(root + 12, quality), time, this.stepSeconds * 8, 0.045);
			this.PlayBass(root, time, 8, 0.13, {attack: 0.8, release: 0.8});
			instruments.Taiko(time, 0.5);
		}
		if (stepInBar === 5 || stepInBar === 6) {
			instruments.Taiko(time, 0.25);
		}
		// Off-beat sparkle high above, walking up the chord
		if (stepInBar % 2 === 1) {
			const sparkleChord = MusicTheme.Triad(root + 36, quality);
			const note = sparkleChord[(step >> 1) % 3];
			engine.PlayTone('sine', MidiToFrequency(note), time, 0.08, 0.025, engine.duckBus, {send: engine.musicReverbSend, release: 0.4});
		}
	}
}
