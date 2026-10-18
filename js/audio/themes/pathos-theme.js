/**
 * pathos-theme.js: Pathos-4, the flooding underwater base. Slow F major with harp arpeggios, flute and ocarina
 * taking turns on the melody, rumbling water and an occasional whale-like call, all in the long reverb.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';
import {instruments} from '../instruments.js';
import {MusicTheme} from './music-theme.js';


/** @type {Array<[number, string]>} One chord per 8-step bar: [MIDI root, quality] */
const PROGRESSION = [[41, 'M'], [43, 'M'], [45, 'm'], [43, 'M']];

// Flute melody (even passes) and ocarina melody (odd passes, an octave up), one row per bar, 0 = rest
const FLUTE_MELODY = [[77, 0, 0, 76, 72, 0, 0, 0], [74, 0, 71, 0, 74, 76, 0, 0], [76, 0, 72, 0, 69, 0, 0, 71], [74, 0, 0, 0, 0, 0, 0, 0]];
const OCARINA_MELODY = [[0, 0, 65, 0, 0, 67, 0, 0], [0, 0, 71, 0, 0, 69, 0, 0], [0, 0, 69, 0, 0, 64, 0, 0], [0, 0, 67, 0, 0, 0, 0, 0]];

// Harp: index into [root, third, fifth, octave] on each step
const HARP_PATTERN = [0, 1, 2, 3, 2, 1, 0, 1];


/** 62 BPM, 2 steps per beat; a pass is 4 bars, and the whale call comes every fourth pass. */
export class PathosTheme extends MusicTheme {
	constructor() {
		super('pathos', 62, 2);
	}


	PlayStep(step, time) {
		const engine = audioEngine;
		const bar = Math.floor(step / 8) % 4;
		const stepInBar = step % 8;
		const pass = Math.floor(step / 32);
		const [root, quality] = PROGRESSION[bar];
		const chord = MusicTheme.Triad(root, quality);
		if (stepInBar === 0) {
			// The first bar adds a sixth on top, the others an octave
			const padNotes = [...chord.map(note => note + 12), bar === 0 ? root + 18 : root + 24];
			instruments.SoftPad(padNotes, time, this.stepSeconds * 8, 0.022);
			this.PlayBass(root, time, 8, 0.08, {attack: 1.5, release: 1.2, send: engine.longReverbSend});
			if (bar % 2 === 0) {
				engine.PlayNoise(time, this.stepSeconds * 16, 0.02, engine.duckBus, {
					filterType: 'lowpass', frequency: 380, resonance: 0.7, attack: this.stepSeconds * 6, release: 1.5,
				});
			}
			if (bar === 0 && pass % 4 === 3) {
				this.#PlayWhaleCall(time);
			}
		}
		const harpNotes = [chord[0] + 24, chord[1] + 24, chord[2] + 24, chord[0] + 36];
		instruments.Harp(MidiToFrequency(harpNotes[HARP_PATTERN[stepInBar]]), time, 0.03);
		const fluteNote = FLUTE_MELODY[bar][stepInBar];
		if (fluteNote && pass % 2 === 0) {
			// Notes followed by a rest ring longer
			const length = FLUTE_MELODY[bar][stepInBar + 1] === 0 ? 2.6 : 1.6;
			instruments.Flute(MidiToFrequency(fluteNote), time, this.stepSeconds * length, 0.05);
		}
		const ocarinaNote = OCARINA_MELODY[bar][stepInBar];
		if (ocarinaNote && pass % 2 === 1) {
			instruments.Ocarina(MidiToFrequency(ocarinaNote + 12), time, this.stepSeconds * 2.4, 0.05);
		}
	}


	/** A slow sine that dips and rises, deep in the long reverb. */
	#PlayWhaleCall(time) {
		const engine = audioEngine;
		const context = engine.context;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(230, time);
		oscillator.frequency.exponentialRampToValueAtTime(150, time + 1.6);
		oscillator.frequency.exponentialRampToValueAtTime(270, time + 3.2);
		engine.ApplyEnvelope(gain, time, 0.6, 0.02, 2.8, 0.6);
		oscillator.connect(gain);
		gain.connect(engine.longReverbSend);
		gain.connect(engine.duckBus);
		oscillator.start(time);
		oscillator.stop(time + 7);
	}
}
