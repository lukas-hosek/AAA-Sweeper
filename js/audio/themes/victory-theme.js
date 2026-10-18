/**
 * victory-theme.js: the fanfare after a cleared field (theme id 'win').
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[41, 'M'], [48, 'M'], [50, 'm'], [46, 'M']];


/** 76 BPM, 2 steps per beat, a 4-bar loop of pads, taiko and a bright arpeggio. */
export class VictoryTheme extends MusicTheme {
	constructor() {
		super('win', 76, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 8) % 4;
		const stepInBar = step % 8;
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar === 0) {
			instruments.Pad(MusicTheme.Triad(root + 12, quality), time, this.stepSeconds * 8, 0.05);
			this.PlayBass(root, time, 8, 0.12, {attack: 0.5, release: 0.8});
			instruments.Taiko(time, 0.4);
		}
		engine.PlayTone('triangle', MidiToFrequency(chord[stepInBar % 3] + 36), time, 0.12, 0.03, engine.duckBus, {
			send: engine.musicReverbSend, release: 0.3,
		});
	}
}
