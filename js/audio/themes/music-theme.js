/**
 * music-theme.js: the base class of the music themes.
 */
import {MidiToFrequency} from '../../core/math.js';
import {audioEngine} from '../audio-engine.js';


/** Semitones above the root for the chord qualities the themes use. */
export const CHORD_INTERVALS = Object.freeze({
	maj7: [0, 4, 7, 11],
	m7: [0, 3, 7, 10],
	'7': [0, 4, 7, 10],
});


/**
 * One piece of music, played step by step by the MusicSequencer: PlayStep(step, time) schedules whatever
 * sounds on step number `step` (counting from 0) at audio time `time`. Themes loop forever; each subclass
 * derives its bar, beat and variation from the step number.
 */
export class MusicTheme {
	name;            // Theme id, as used by chapters and the sequencer
	stepSeconds;     // Length of one sequencer step


	constructor(name, beatsPerMinute, stepsPerBeat) {
		this.name = name;
		this.stepSeconds = 60 / beatsPerMinute / stepsPerBeat;
	}


	/** Schedules the notes of one step. Overridden by every theme. */
	PlayStep(step, time) {
	}


	/** Major or minor ('m') triad on a MIDI root note. */
	static Triad(rootNote, quality) {
		return [rootNote, rootNote + (quality === 'm' ? 3 : 4), rootNote + 7];
	}


	/** A sustained sine bass note, an octave below the root, for `steps` steps. */
	PlayBass(rootNote, time, steps, volume, options) {
		const engine = audioEngine;
		engine.PlayTone('sine', MidiToFrequency(rootNote - 12), time, this.stepSeconds * steps, volume, engine.duckBus, options);
	}
}
