/**
 * audio-engine.js: the Web Audio graph (buses, reverbs, muffle filter, compressor) and the low-level voice builders
 * every sound is made of: PlayTone, PlayNoise and ApplyEnvelope.
 */
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {game} from '../game/game.js';


const OPEN_MUFFLE_FREQUENCY = 19000;    // Muffle cutoff when nothing is muffled
const SHELLSHOCK_FREQUENCY = 300;       // Muffle cutoff right after an explosion
const SHELLSHOCK_SECONDS = 2.9;         // Recovery from SHELLSHOCK_FREQUENCY back to the base cutoff
const PAUSED_MUSIC_FACTOR = 0.45;       // Music is quieter while the game is paused


// Engine members that an offline render replaces for its duration
const OFFLINE_MEMBERS = [
	'context', 'master', 'compressor', 'muffle', 'muffleBaseFrequency', 'musicBus', 'duckBus', 'effectsBus', 'voiceBus', 'noiseBuffer',
	'musicReverb', 'musicReverbSend', 'effectsReverb', 'effectsReverbSend', 'longReverb', 'longReverbSend', 'boomCurve', 'radioCurve',
];


/**
 * The audio graph:
 *   music voices → duckBus → musicBus ┐
 *   sound effects → effectsBus ────────┼→ master → muffle (lowpass) → compressor → speakers
 *   voice lines → voiceBus ────────────┘   (voiceBus also feeds voiceAnalyser, the radio waveform)
 * duckBus dips the music under radio lines. Three reverbs: music (2.8 s), effects (1.7 s) and a long one (6.5 s).
 * Every caller checks `context` first: without audio (no user gesture yet, or no Web Audio) the game runs silent.
 */
export class AudioEngine {
	context = null;                                // AudioContext (or OfflineAudioContext while rendering offline), null until Init()
	master = null;                                 // Master volume (and mute)
	muffle = null;                                 // Lowpass for shell shock and underwater
	muffleBaseFrequency = OPEN_MUFFLE_FREQUENCY;   // Cutoff the muffle returns to after shell shock
	compressor = null;
	musicBus = null;                               // Music volume
	duckBus = null;                                // Inside the music bus: dips while radio voices play
	effectsBus = null;                             // Sound effects volume
	voiceBus = null;                               // Voice lines volume
	voiceAnalyser = null;                          // Taps the voice bus for the radio waveform
	noiseBuffer = null;                            // 2 s of white noise shared by every noise voice
	musicReverb = null;
	musicReverbSend = null;
	effectsReverb = null;
	effectsReverbSend = null;
	longReverb = null;                             // Big space for flutes, harps and the deep pathos tones
	longReverbSend = null;
	radioCurve = null;                             // Soft saturation for radio voices
	boomCurve = null;                              // Hard saturation for explosions and the braam
	#liveMembers = null;                           // The live graph while an offline render borrows the engine
	#startCallbacks = [];                          // Run once the live context exists (see WhenStarted)


	/** Creates the audio graph, or resumes it. Browsers only allow this after a user gesture. */
	Init() {
		if (this.context) {
			if (this.context.state === 'suspended') {
				this.context.resume();
			}
			return;
		}
		const contextConstructor = window.AudioContext || window['webkitAudioContext'];
		if (!contextConstructor) {
			return;
		}
		let context;
		try {
			context = new contextConstructor();
		} catch {
			return;
		}
		this.context = context;
		this.#BuildGraph(context, {
			destination: context.destination,
			masterGain: settings.muted ? 0 : settings.masterVolume,
			musicGain: settings.musicVolume,
			effectsGain: settings.effectsVolume,
			voiceGain: settings.voiceVolume,
			withAnalyser: true,
		});
		for (const callback of this.#startCallbacks) {
			callback();
		}
	}


	/**
	 * Runs `callback` once audio has started (right away if it already has). Lets higher layers prepare audio
	 * without the engine importing them.
	 */
	WhenStarted(callback) {
		if (this.context && !this.#liveMembers) {
			callback();
		} else {
			this.#startCallbacks.push(callback);
		}
	}


	/**
	 * Points the engine at an OfflineAudioContext (soundtrack export, golden audio checks).
	 * The graph is rebuilt inside it at full volume, except `musicGain` on the music bus. EndOfflineRender() restores it.
	 */
	BeginOfflineRender(offlineContext, musicGain) {
		this.#liveMembers = {};
		for (const member of OFFLINE_MEMBERS) {
			this.#liveMembers[member] = this[member];
		}
		this.context = offlineContext;
		this.#BuildGraph(offlineContext, {
			destination: offlineContext.destination,
			masterGain: 1,
			musicGain,
			effectsGain: 1,
			voiceGain: 1,
			withAnalyser: false,
		});
		// Offline renders skip the muffle filter
		this.master.disconnect();
		this.master.connect(this.compressor);
		this.muffle = this.master;
	}


	/** Puts the live graph back after BeginOfflineRender(). */
	EndOfflineRender() {
		for (const member of OFFLINE_MEMBERS) {
			this[member] = this.#liveMembers[member];
		}
		this.#liveMembers = null;
	}


	/** A stereo impulse response of decaying noise, for the convolution reverbs. */
	MakeImpulseResponse(seconds) {
		const context = this.context;
		const length = Math.floor(context.sampleRate * seconds);
		const buffer = context.createBuffer(2, length, context.sampleRate);
		for (let channel = 0; channel < 2; channel++) {
			const samples = buffer.getChannelData(channel);
			for (let i = 0; i < length; i++) {
				samples[i] = (random.Next() * 2 - 1) * Math.pow(1 - i / length, 3.4);
			}
		}
		return buffer;
	}


	/** A tanh saturation curve for a WaveShaperNode; higher `drive` distorts more. */
	MakeSaturationCurve(drive) {
		const size = 1024;
		const curve = new Float32Array(size);
		for (let i = 0; i < size; i++) {
			const x = i / (size - 1) * 2 - 1;
			curve[i] = Math.tanh(drive * x) / Math.tanh(drive);
		}
		return curve;
	}


	/** The muffled, ringing ears after an explosion: everything goes dull and a high tone fades out. */
	Shellshock() {
		if (!this.context) {
			return;
		}
		const now = this.context.currentTime;
		const cutoff = this.muffle.frequency;
		cutoff.cancelScheduledValues(now);
		cutoff.setValueAtTime(cutoff.value, now);
		cutoff.setValueAtTime(SHELLSHOCK_FREQUENCY, now + 0.06);
		cutoff.exponentialRampToValueAtTime(this.muffleBaseFrequency || OPEN_MUFFLE_FREQUENCY, now + SHELLSHOCK_SECONDS);

		// The tinnitus tone bypasses the muffle, straight into the compressor
		const tone = this.context.createOscillator();
		const gain = this.context.createGain();
		tone.type = 'sine';
		tone.frequency.value = 3900;
		const volume = settings.muted ? 0 : 0.03 * settings.masterVolume;
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(volume, now + 0.12);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);
		tone.connect(gain);
		gain.connect(this.compressor);
		tone.start(now);
		tone.stop(now + 2.8);
	}


	/** Moves the muffle filter to a new resting cutoff (underwater), smoothly. */
	MuffleTo(frequency, smoothingSeconds) {
		if (!this.context) {
			return;
		}
		this.muffleBaseFrequency = frequency;
		const cutoff = this.muffle.frequency;
		const now = this.context.currentTime;
		cutoff.cancelScheduledValues(now);
		cutoff.setValueAtTime(cutoff.value, now);
		cutoff.setTargetAtTime(frequency, now, smoothingSeconds);
	}


	/** Opens the muffle filter again (leaving the water, leaving the game). */
	Unmuffle() {
		this.MuffleTo(OPEN_MUFFLE_FREQUENCY, 0.25);
	}


	/** Applies the volume settings (and mute, and the quieter music while paused) to the buses. */
	ApplyVolumes() {
		if (!this.context) {
			return;
		}
		const now = this.context.currentTime;
		const pauseFactor = game.field && game.field.isPaused ? PAUSED_MUSIC_FACTOR : 1;
		this.master.gain.setTargetAtTime(settings.muted ? 0 : settings.masterVolume, now, 0.05);
		this.musicBus.gain.setTargetAtTime(settings.musicVolume * pauseFactor, now, 0.1);
		this.effectsBus.gain.setTargetAtTime(settings.effectsVolume, now, 0.05);
		this.voiceBus.gain.setTargetAtTime(settings.voiceVolume, now, 0.05);
	}


	/** Attack-hold-release envelope on a gain node: linear attack to `peak`, hold until `duration`, exponential-ish release. */
	ApplyEnvelope(gainNode, time, attack, peak, duration, release) {
		const holdEnd = time + Math.max(attack, duration);
		gainNode.gain.setValueAtTime(0, time);
		gainNode.gain.linearRampToValueAtTime(peak, time + attack);
		gainNode.gain.setValueAtTime(peak, holdEnd);
		gainNode.gain.setTargetAtTime(0, holdEnd, release);
	}


	/**
	 * Plays one oscillator note with an envelope. Returns its gain node.
	 * options: glideTo (Hz) over glideSeconds (default: the duration), detune (cents), attack (default 0.005 s),
	 * release (default 0.05 s), lowpass (Hz) sweeping to lowpassEnd, resonance (filter Q, default 1), send (extra destination).
	 */
	PlayTone(waveform, frequency, time, duration, volume, destination, options = {}) {
		const context = this.context;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = waveform;
		oscillator.frequency.setValueAtTime(frequency, time);
		if (options.glideTo) {
			oscillator.frequency.exponentialRampToValueAtTime(options.glideTo, time + (options.glideSeconds || duration));
		}
		if (options.detune) {
			oscillator.detune.value = options.detune;
		}
		const release = options.release ?? 0.05;
		this.ApplyEnvelope(gain, time, options.attack ?? 0.005, volume, duration, release);
		let last = oscillator;
		if (options.lowpass) {
			const filter = context.createBiquadFilter();
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(options.lowpass, time);
			if (options.lowpassEnd) {
				filter.frequency.exponentialRampToValueAtTime(options.lowpassEnd, time + duration);
			}
			filter.Q.value = options.resonance ?? 1;
			oscillator.connect(filter);
			last = filter;
		}
		last.connect(gain);
		gain.connect(destination);
		if (options.send) {
			gain.connect(options.send);
		}
		oscillator.start(time);
		// Stop once the release tail has decayed (setTargetAtTime never quite reaches zero)
		oscillator.stop(time + duration + release * 7 + 0.05);
		return gain;
	}


	/**
	 * Plays filtered white noise with an envelope. Returns its gain node.
	 * options: filterType (default bandpass), frequency (default 1000 Hz) sweeping to frequencyEnd, resonance (Q, default 1),
	 * attack (default 0.002 s), release (default 0.05 s), send (extra destination).
	 */
	PlayNoise(time, duration, volume, destination, options = {}) {
		const context = this.context;
		const source = context.createBufferSource();
		const filter = context.createBiquadFilter();
		const gain = context.createGain();
		source.buffer = this.noiseBuffer;
		source.loop = true;
		filter.type = options.filterType || 'bandpass';
		filter.frequency.setValueAtTime(options.frequency || 1000, time);
		if (options.frequencyEnd) {
			filter.frequency.exponentialRampToValueAtTime(options.frequencyEnd, time + duration);
		}
		filter.Q.value = options.resonance ?? 1;
		const release = options.release ?? 0.05;
		this.ApplyEnvelope(gain, time, options.attack ?? 0.002, volume, duration, release);
		source.connect(filter);
		filter.connect(gain);
		gain.connect(destination);
		if (options.send) {
			gain.connect(options.send);
		}
		// A random start point, so repeated noise hits don't sound identical
		source.start(time, random.Next() * 1.5);
		source.stop(time + duration + release * 7 + 0.05);
		return gain;
	}


	/** Creates every bus, the noise buffer, the reverbs and the saturation curves inside `context`. */
	#BuildGraph(context, levels) {
		const compressor = context.createDynamicsCompressor();
		compressor.threshold.value = -12;
		compressor.knee.value = 8;
		compressor.ratio.value = 4;
		compressor.attack.value = 0.004;
		compressor.release.value = 0.25;
		compressor.connect(levels.destination);
		this.compressor = compressor;

		this.master = context.createGain();
		this.master.gain.value = levels.masterGain;
		this.muffle = context.createBiquadFilter();
		this.muffle.type = 'lowpass';
		this.muffle.frequency.value = 20000;
		this.master.connect(this.muffle);
		this.muffle.connect(compressor);

		this.musicBus = this.#CreateBus(context, levels.musicGain, this.master);
		this.duckBus = this.#CreateBus(context, 1, this.musicBus);
		this.effectsBus = this.#CreateBus(context, levels.effectsGain, this.master);
		this.voiceBus = this.#CreateBus(context, levels.voiceGain, this.master);
		if (levels.withAnalyser) {
			this.voiceAnalyser = context.createAnalyser();
			this.voiceAnalyser.fftSize = 512;
			this.voiceBus.connect(this.voiceAnalyser);
		}

		const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
		const noise = noiseBuffer.getChannelData(0);
		for (let i = 0; i < noise.length; i++) {
			noise[i] = random.Next() * 2 - 1;
		}
		this.noiseBuffer = noiseBuffer;

		[this.musicReverb, this.musicReverbSend] = this.#CreateReverb(context, 2.8, 0.55, this.duckBus);
		[this.effectsReverb, this.effectsReverbSend] = this.#CreateReverb(context, 1.7, 0.5, this.effectsBus);
		[this.longReverb, this.longReverbSend] = this.#CreateReverb(context, 6.5, 0.85, this.duckBus);
		this.muffleBaseFrequency = OPEN_MUFFLE_FREQUENCY;
		this.radioCurve = this.MakeSaturationCurve(2.4);
		this.boomCurve = this.MakeSaturationCurve(5);
	}


	/** A gain node feeding `output`. */
	#CreateBus(context, gain, output) {
		const bus = context.createGain();
		bus.gain.value = gain;
		bus.connect(output);
		return bus;
	}


	/** A convolution reverb into `output`, and the send gain that feeds it. Returns [reverb, send]. */
	#CreateReverb(context, seconds, sendGain, output) {
		const reverb = context.createConvolver();
		reverb.buffer = this.MakeImpulseResponse(seconds);
		reverb.connect(output);
		const send = context.createGain();
		send.gain.value = sendGain;
		send.connect(reverb);
		return [reverb, send];
	}
}


export const audioEngine = new AudioEngine();
