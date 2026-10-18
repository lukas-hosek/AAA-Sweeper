/**
 * instruments.js: the synthesised instruments the music themes play.
 */
import {MidiToFrequency} from '../core/math.js';
import {random} from '../core/random.js';
import {audioEngine} from './audio-engine.js';


/**
 * Drums, pads, plucks and melodic instruments, all built from oscillators and noise.
 * Every instrument plays into the ducked music bus (unless a destination is given) and the music reverbs.
 * Times are on the audio clock; volumes are linear gains.
 */
export class Instruments {
	/** Deep drum hit with a short noise attack. */
	Taiko(time, volume, destination) {
		const engine = audioEngine;
		const output = destination || engine.duckBus;
		engine.PlayTone('sine', 115, time, 0.42, volume, output, {glideTo: 46, release: 0.12, send: engine.musicReverbSend});
		engine.PlayNoise(time, 0.06, volume * 0.45, output, {filterType: 'lowpass', frequency: 700, send: engine.musicReverbSend});
	}


	/** Warm detuned saw pad holding a chord of MIDI notes. */
	Pad(notes, time, duration, volume) {
		const engine = audioEngine;
		const context = engine.context;
		const filter = context.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.value = 760;
		const gain = context.createGain();
		engine.ApplyEnvelope(gain, time, 0.6, volume, duration, 0.7);
		filter.connect(gain);
		gain.connect(engine.duckBus);
		gain.connect(engine.musicReverbSend);
		for (const note of notes) {
			// Two oscillators per note, 9 cents either side, for the chorus width
			for (const detune of [-9, 9]) {
				const oscillator = context.createOscillator();
				oscillator.type = 'sawtooth';
				oscillator.frequency.value = MidiToFrequency(note);
				oscillator.detune.value = detune;
				oscillator.connect(filter);
				oscillator.start(time);
				oscillator.stop(time + duration + 5);
			}
		}
	}


	/** Short plucked saw with a closing filter. */
	Pluck(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('sawtooth', frequency, time, 0.09, volume, engine.duckBus, {
			lowpass: 2600, lowpassEnd: 380, resonance: 3, release: 0.06, send: engine.musicReverbSend,
		});
	}


	/** The trailer "braam": a distorted brass-like blast on a root note, its octaves and fifth. */
	Braam(rootNote, time, volume) {
		const engine = audioEngine;
		const context = engine.context;
		const filter = context.createBiquadFilter();
		filter.type = 'lowpass';
		filter.Q.value = 2;
		filter.frequency.setValueAtTime(110, time);
		filter.frequency.exponentialRampToValueAtTime(1700, time + 0.55);
		filter.frequency.exponentialRampToValueAtTime(260, time + 2.6);
		const distortion = context.createWaveShaper();
		distortion.curve = engine.boomCurve;
		const gain = context.createGain();
		engine.ApplyEnvelope(gain, time, 0.06, volume, 2.1, 0.8);
		filter.connect(distortion);
		distortion.connect(gain);
		gain.connect(engine.duckBus);
		gain.connect(engine.musicReverbSend);
		for (const note of [rootNote - 12, rootNote, rootNote + 7, rootNote - 24]) {
			for (const waveform of ['sawtooth', 'square']) {
				const oscillator = context.createOscillator();
				oscillator.type = waveform;
				oscillator.frequency.value = MidiToFrequency(note);
				oscillator.detune.value = random.Range(-12, 12);
				oscillator.connect(filter);
				oscillator.start(time);
				oscillator.stop(time + 6);
			}
		}
	}


	/** Club kick drum. */
	Kick(time, volume) {
		audioEngine.PlayTone('sine', 150, time, 0.28, volume, audioEngine.duckBus, {glideTo: 42, glideSeconds: 0.12, release: 0.08});
	}


	/** Hand clap: three quick noise bursts and a tail. */
	Clap(time, volume) {
		const engine = audioEngine;
		for (let i = 0; i < 3; i++) {
			engine.PlayNoise(time + i * 0.011, 0.008, volume, engine.duckBus, {filterType: 'bandpass', frequency: 1500, resonance: 1.1});
		}
		engine.PlayNoise(time + 0.033, 0.1, volume * 0.7, engine.duckBus, {
			filterType: 'bandpass', frequency: 1300, resonance: 1, send: engine.musicReverbSend,
		});
	}


	/** Hi-hat, closed or open. */
	HiHat(time, volume, isOpen) {
		audioEngine.PlayNoise(time, isOpen ? 0.07 : 0.02, volume, audioEngine.duckBus, {filterType: 'highpass', frequency: 7600});
	}


	/** Short saw chord stab. */
	Stab(notes, time, volume) {
		const engine = audioEngine;
		for (const note of notes) {
			engine.PlayTone('sawtooth', MidiToFrequency(note), time, 0.12, volume, engine.duckBus, {
				lowpass: 2600, lowpassEnd: 600, release: 0.06, send: engine.musicReverbSend,
			});
		}
	}


	/** Oud: a plucked note that slides into pitch, with a buzzy body. */
	Oud(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('triangle', frequency * 1.014, time, 0.16, volume, engine.duckBus, {
			glideTo: frequency, glideSeconds: 0.03, release: 0.12, send: engine.musicReverbSend,
		});
		engine.PlayTone('sawtooth', frequency, time, 0.07, volume * 0.35, engine.duckBus, {lowpass: 2600, lowpassEnd: 500, release: 0.05});
	}


	/** Doum: the deep stroke of a goblet drum. */
	Doum(time, volume) {
		const engine = audioEngine;
		engine.PlayTone('sine', 105, time, 0.2, volume, engine.duckBus, {
			glideTo: 58, glideSeconds: 0.15, release: 0.08, send: engine.musicReverbSend,
		});
		engine.PlayNoise(time, 0.03, volume * 0.4, engine.duckBus, {filterType: 'lowpass', frequency: 500});
	}


	/** Tek: the dry rim stroke of a goblet drum. */
	Tek(time, volume) {
		const engine = audioEngine;
		engine.PlayNoise(time, 0.025, volume, engine.duckBus, {filterType: 'bandpass', frequency: 3400, resonance: 2.2});
		engine.PlayTone('triangle', 780, time, 0.015, volume * 0.25, engine.duckBus, {release: 0.01});
	}


	/** Ney flute: a breathy sine with vibrato that bends down a whole tone halfway through. */
	Ney(note, time, duration) {
		const engine = audioEngine;
		const context = engine.context;
		const oscillator = context.createOscillator();
		const vibrato = context.createOscillator();
		const vibratoDepth = context.createGain();
		const gain = context.createGain();
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(MidiToFrequency(note), time);
		oscillator.frequency.setTargetAtTime(MidiToFrequency(note - 2), time + duration * 0.55, 0.08);
		vibrato.frequency.value = 5.2;
		vibratoDepth.gain.value = MidiToFrequency(note) * 0.012;
		vibrato.connect(vibratoDepth);
		vibratoDepth.connect(oscillator.frequency);
		engine.ApplyEnvelope(gain, time, 0.35, 0.05, duration, 0.4);
		oscillator.connect(gain);
		gain.connect(engine.duckBus);
		gain.connect(engine.musicReverbSend);
		oscillator.start(time);
		oscillator.stop(time + duration + 3);
		vibrato.start(time);
		vibrato.stop(time + duration + 3);
		// The breath
		engine.PlayNoise(time, duration, 0.01, engine.duckBus, {
			filterType: 'bandpass', frequency: 1600, resonance: 0.8, attack: 0.3, release: 0.3,
		});
	}


	/** Flute: sine plus a quiet triangle, vibrato growing over the note, breath noise, in the long reverb. */
	Flute(frequency, time, duration, volume) {
		const engine = audioEngine;
		const context = engine.context;
		const oscillator = context.createOscillator();
		const overtone = context.createOscillator();
		const vibrato = context.createOscillator();
		const vibratoDepth = context.createGain();
		const gain = context.createGain();
		const overtoneGain = context.createGain();
		oscillator.type = 'sine';
		overtone.type = 'triangle';
		oscillator.frequency.value = frequency;
		overtone.frequency.value = frequency;
		vibrato.frequency.value = 4.8;
		vibratoDepth.gain.setValueAtTime(0, time);
		vibratoDepth.gain.linearRampToValueAtTime(frequency * 0.012, time + duration * 0.6);
		vibrato.connect(vibratoDepth);
		vibratoDepth.connect(oscillator.frequency);
		vibratoDepth.connect(overtone.frequency);
		overtoneGain.gain.value = 0.25;
		overtone.connect(overtoneGain);
		overtoneGain.connect(gain);
		oscillator.connect(gain);
		engine.ApplyEnvelope(gain, time, 0.18, volume, duration, 0.35);
		gain.connect(engine.duckBus);
		gain.connect(engine.longReverbSend);
		oscillator.start(time);
		overtone.start(time);
		vibrato.start(time);
		const stopTime = time + duration + 3;
		oscillator.stop(stopTime);
		overtone.stop(stopTime);
		vibrato.stop(stopTime);
		engine.PlayNoise(time, duration, volume * 0.18, engine.duckBus, {
			filterType: 'bandpass', frequency: frequency * 1.5, resonance: 2, attack: 0.1, release: 0.3, send: engine.longReverbSend,
		});
	}


	/** Ocarina: a pure sine with gentle vibrato and a faint third harmonic. */
	Ocarina(frequency, time, duration, volume) {
		const engine = audioEngine;
		const context = engine.context;
		const oscillator = context.createOscillator();
		const vibrato = context.createOscillator();
		const vibratoDepth = context.createGain();
		const gain = context.createGain();
		oscillator.type = 'sine';
		oscillator.frequency.value = frequency;
		vibrato.frequency.value = 5.6;
		vibratoDepth.gain.setValueAtTime(0, time);
		vibratoDepth.gain.linearRampToValueAtTime(frequency * 0.008, time + duration * 0.5);
		vibrato.connect(vibratoDepth);
		vibratoDepth.connect(oscillator.frequency);
		engine.ApplyEnvelope(gain, time, 0.07, volume, duration, 0.3);
		oscillator.connect(gain);
		gain.connect(engine.duckBus);
		gain.connect(engine.longReverbSend);
		oscillator.start(time);
		vibrato.start(time);
		oscillator.stop(time + duration + 3);
		vibrato.stop(time + duration + 3);
		engine.PlayTone('sine', frequency * 3, time, duration, volume * 0.06, engine.duckBus, {attack: 0.07, release: 0.2});
	}


	/** Harp: a plucked triangle with its octave, in the long reverb. */
	Harp(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('triangle', frequency, time, 0.02, volume, engine.duckBus, {release: 0.9, send: engine.longReverbSend});
		engine.PlayTone('sine', frequency * 2, time, 0.01, volume * 0.3, engine.duckBus, {release: 0.4, send: engine.longReverbSend});
	}


	/** Bell: sine partials at inharmonic ratios. */
	Bell(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('sine', frequency, time, 0.02, volume, engine.duckBus, {release: 0.7, send: engine.musicReverbSend});
		engine.PlayTone('sine', frequency * 2.76, time, 0.01, volume * 0.35, engine.duckBus, {release: 0.25, send: engine.musicReverbSend});
		engine.PlayTone('sine', frequency * 5.4, time, 0.01, volume * 0.12, engine.duckBus, {release: 0.12});
	}


	/** Soft sine pad with slow attack and release. */
	SoftPad(notes, time, duration, volume) {
		const engine = audioEngine;
		for (const note of notes) {
			engine.PlayTone('sine', MidiToFrequency(note), time, duration, volume, engine.duckBus, {
				attack: duration * 0.4, release: duration * 0.35, send: engine.musicReverbSend,
			});
			engine.PlayTone('triangle', MidiToFrequency(note) * 1.003, time, duration, volume * 0.35, engine.duckBus, {
				attack: duration * 0.4, release: duration * 0.35,
			});
		}
	}


	/** Electric piano: sine with a bell-like octave and a slightly detuned triangle. */
	ElectricPiano(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('sine', frequency, time, 0.03, volume, engine.duckBus, {release: 0.45, send: engine.musicReverbSend});
		engine.PlayTone('sine', frequency * 2, time, 0.02, volume * 0.25, engine.duckBus, {release: 0.2});
		engine.PlayTone('triangle', frequency * 1.002, time, 0.02, volume * 0.3, engine.duckBus, {release: 0.3});
	}


	/** Whistling: a sine that scoops up into pitch, with vibrato. */
	Whistle(frequency, time, duration, volume) {
		const engine = audioEngine;
		const context = engine.context;
		const oscillator = context.createOscillator();
		const vibrato = context.createOscillator();
		const vibratoDepth = context.createGain();
		const gain = context.createGain();
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency * 0.97, time);
		oscillator.frequency.exponentialRampToValueAtTime(frequency, time + 0.06);
		vibrato.frequency.value = 5.5;
		vibratoDepth.gain.value = frequency * 0.008;
		vibrato.connect(vibratoDepth);
		vibratoDepth.connect(oscillator.frequency);
		engine.ApplyEnvelope(gain, time, 0.04, volume, duration, 0.12);
		oscillator.connect(gain);
		gain.connect(engine.duckBus);
		gain.connect(engine.musicReverbSend);
		oscillator.start(time);
		oscillator.stop(time + duration + 1);
		vibrato.start(time);
		vibrato.stop(time + duration + 1);
	}


	/** Piano: triangle with its octave. */
	Piano(frequency, time, volume) {
		const engine = audioEngine;
		engine.PlayTone('triangle', frequency, time, 0.03, volume, engine.duckBus, {release: 0.55, send: engine.musicReverbSend});
		engine.PlayTone('sine', frequency * 2, time, 0.02, volume * 0.3, engine.duckBus, {release: 0.3});
	}
}


export const instruments = new Instruments();
