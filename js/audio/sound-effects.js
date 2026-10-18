/**
 * sound-effects.js: every procedural sound effect (UI, reveal, flag, explosion, intro stings, flood...).
 */
import {MidiToFrequency} from '../core/math.js';
import {random} from '../core/random.js';
import {audioEngine} from './audio-engine.js';
import {instruments} from './instruments.js';


const REVEAL_CHIME_INTERVALS = [0, 4, 7, 12, 16, 19];    // Major arpeggio over a big reveal
const LEVEL_UP_NOTES = [60, 64, 67, 72, 76, 79];
const LORE_INTERVALS = [0, 3, 7, 10, 12, 15, 19, 22];
const RESPECTS_CHORD = [48, 55, 60, 64, 67];
const FLAG_TUNE_NOTES = [72, 76, 79, 84, 79, 84];       // The Musical Flag skin's jingle


/** All sound effects. Each one is silent when audio is not running. Pitches stay within the music keys. */
export class SoundEffects {
	/** Short blip for menu selections and button presses. */
	MenuSelect() {
		if (!this.#IsReady()) {
			return;
		}
		audioEngine.PlayTone('sine', 2300, this.#Now(), 0.02, 0.05, audioEngine.effectsBus, {release: 0.02});
	}


	/** Very short tick when a menu entry gets focus. */
	MenuHover() {
		if (!this.#IsReady()) {
			return;
		}
		audioEngine.PlayTone('sine', 1500, this.#Now(), 0.012, 0.025, audioEngine.effectsBus, {release: 0.01});
	}


	/** Rising chirp for revealed tiles; bigger reveals rise further and add a whoosh and an arpeggio. */
	Reveal(tileCount) {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		const size = Math.min(tileCount, 40);
		engine.PlayTone('triangle', 480 + size * 10, time, 0.05, 0.2, engine.effectsBus, {glideTo: 900 + size * 22, release: 0.05});
		if (tileCount >= 6) {
			engine.PlayNoise(time, 0.45, 0.15, engine.effectsBus, {
				filterType: 'bandpass', frequency: 400, frequencyEnd: 5000, resonance: 0.9, attack: 0.06, release: 0.15,
			});
			REVEAL_CHIME_INTERVALS.forEach((interval, i) => {
				const frequency = MidiToFrequency(76 + interval);
				engine.PlayTone('sine', frequency, time + 0.035 * i, 0.07, 0.05, engine.effectsBus, {
					send: engine.effectsReverbSend, release: 0.1,
				});
			});
		}
	}


	/** Thud of a flag planted in the ground. */
	Flag() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('sine', 170, time, 0.06, 0.45, engine.effectsBus, {glideTo: 60, release: 0.05});
		engine.PlayNoise(time + 0.01, 0.08, 0.2, engine.effectsBus, {filterType: 'bandpass', frequency: 1100, resonance: 1.4});
	}


	/** Softer thud when a flag is pulled out. */
	Unflag() {
		if (!this.#IsReady()) {
			return;
		}
		audioEngine.PlayTone('sine', 320, this.#Now(), 0.05, 0.22, audioEngine.effectsBus, {glideTo: 140, release: 0.04});
	}


	/** Two low buzzes: not allowed. */
	Denied() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('square', 160, time, 0.09, 0.07, engine.effectsBus, {lowpass: 900});
		engine.PlayTone('square', 120, time + 0.1, 0.12, 0.07, engine.effectsBus, {lowpass: 900});
	}


	/** A mine explodes: saturated rumble, a sub drop and falling debris. */
	Explosion() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const context = engine.context;
		const time = this.#Now();
		const distortion = context.createWaveShaper();
		distortion.curve = engine.boomCurve;
		const gain = context.createGain();
		gain.gain.value = 0.8;
		distortion.connect(gain);
		gain.connect(engine.effectsBus);
		gain.connect(engine.effectsReverbSend);
		engine.PlayNoise(time, 1.3, 1, distortion, {
			filterType: 'lowpass', frequency: 5000, frequencyEnd: 110, resonance: 0.7, release: 0.45,
		});
		engine.PlayTone('sine', 95, time, 0.6, 1, distortion, {glideTo: 28, release: 0.35});
		engine.PlayTone('triangle', 52, time, 0.9, 0.6, engine.effectsBus, {glideTo: 24, release: 0.4});
		for (let i = 0; i < 12; i++) {
			const debrisTime = time + 0.2 + random.Next() * 1.3;
			const debrisVolume = 0.08 + random.Next() * 0.1;
			engine.PlayNoise(debrisTime, 0.015, debrisVolume, engine.effectsBus, {filterType: 'highpass', frequency: 2500});
		}
	}


	/** One low-health heartbeat (two beats). */
	Heartbeat() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('sine', 64, time, 0.08, 0.6, engine.effectsBus, {glideTo: 40, release: 0.06});
		engine.PlayTone('sine', 58, time + 0.19, 0.08, 0.42, engine.effectsBus, {glideTo: 38, release: 0.06});
	}


	/** Rising major arpeggio. */
	LevelUp() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		LEVEL_UP_NOTES.forEach((note, i) => {
			engine.PlayTone('triangle', MidiToFrequency(note + 12), time + i * 0.065, 0.16, 0.13, engine.effectsBus, {
				release: 0.15, send: engine.effectsReverbSend,
			});
		});
	}


	/** The console-style achievement chime. */
	Achievement() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('sine', MidiToFrequency(81), time, 0.1, 0.18, engine.effectsBus, {release: 0.2, send: engine.effectsReverbSend});
		engine.PlayTone('sine', MidiToFrequency(88), time + 0.11, 0.28, 0.17, engine.effectsBus, {
			release: 0.35, send: engine.effectsReverbSend,
		});
		engine.PlayTone('sine', MidiToFrequency(93), time + 0.11, 0.28, 0.05, engine.effectsBus, {release: 0.35});
	}


	/** Two-note coin pickup. */
	Coin() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('square', MidiToFrequency(83), time, 0.06, 0.06, engine.effectsBus, {lowpass: 5000});
		engine.PlayTone('square', MidiToFrequency(88), time + 0.07, 0.2, 0.06, engine.effectsBus, {lowpass: 5000, release: 0.1});
	}


	/** Filtered noise sweeping up: menus opening, banners, supply drops. */
	Whoosh() {
		if (!this.#IsReady()) {
			return;
		}
		audioEngine.PlayNoise(this.#Now(), 0.55, 0.22, audioEngine.effectsBus, {
			filterType: 'bandpass', frequency: 250, frequencyEnd: 3800, resonance: 1.3, attack: 0.25, release: 0.12,
		});
	}


	/** A whoosh and two notes: a new quest was added. */
	NewQuest() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		this.Whoosh();
		engine.PlayTone('triangle', MidiToFrequency(69), time + 0.15, 0.2, 0.14, engine.effectsBus, {
			send: engine.effectsReverbSend, release: 0.2,
		});
		engine.PlayTone('triangle', MidiToFrequency(76), time + 0.32, 0.4, 0.14, engine.effectsBus, {
			send: engine.effectsReverbSend, release: 0.4,
		});
	}


	/** Sparkling arpeggio for a lore fragment. */
	LoreFound() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		LORE_INTERVALS.forEach((interval, i) => {
			engine.PlayTone('sine', MidiToFrequency(84 + interval), time + i * 0.05, 0.25, 0.05, engine.effectsBus, {
				send: engine.effectsReverbSend, release: 0.3,
			});
		});
	}


	/** A solemn swelling chord: F was pressed. */
	Respects() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		for (const note of RESPECTS_CHORD) {
			engine.PlayTone('sawtooth', MidiToFrequency(note), time, 1.4, 0.035, engine.effectsBus, {
				attack: 0.25, release: 0.5, lowpass: 1400, send: engine.effectsReverbSend,
			});
		}
	}


	/** The Musical Flag's jingle (it cannot be turned off, as advertised). */
	FlagTune() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		FLAG_TUNE_NOTES.forEach((note, i) => {
			engine.PlayTone('square', MidiToFrequency(note), time + i * 0.09, 0.07, 0.05, engine.effectsBus, {
				lowpass: 3000, release: 0.03,
			});
		});
	}


	/** The desktop message box chime. */
	Ding() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayTone('sine', MidiToFrequency(84), time, 0.4, 0.12, engine.effectsBus, {release: 0.4});
		engine.PlayTone('sine', MidiToFrequency(91), time, 0.3, 0.05, engine.effectsBus, {release: 0.3});
	}


	/** Unpitched click for the last ten seconds of the Pathos-4 countdown (pitched ticks clashed with the music). */
	CountdownTick() {
		if (!this.#IsReady()) {
			return;
		}
		audioEngine.PlayNoise(this.#Now(), 0.025, 0.12, audioEngine.effectsBus, {
			filterType: 'highpass', frequency: 2800, resonance: 0.5, release: 0.02,
		});
	}


	/** Three quick bubbles rising. */
	Bubbles() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		for (let i = 0; i < 3; i++) {
			const frequency = random.Range(300, 500);
			const glideTo = random.Range(900, 1400);
			engine.PlayTone('sine', frequency, time + i * 0.07, 0.06, 0.04, engine.effectsBus, {
				glideTo, glideSeconds: 0.06, release: 0.04,
			});
		}
	}


	/** The base floods: a long rush of water, a deep swell and many bubbles. */
	Flood() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayNoise(time, 3, 0.5, engine.effectsBus, {
			filterType: 'lowpass', frequency: 2500, frequencyEnd: 200, resonance: 0.6, attack: 0.3, release: 1,
			send: engine.effectsReverbSend,
		});
		engine.PlayTone('sine', 45, time, 3, 0.5, engine.effectsBus, {attack: 0.4, release: 1});
		for (let i = 0; i < 14; i++) {
			const frequency = random.Range(250, 600);
			const bubbleTime = time + 0.3 + random.Next() * 2.5;
			const glideTo = random.Range(900, 1500);
			engine.PlayTone('sine', frequency, bubbleTime, 0.06, 0.05, engine.effectsBus, {glideTo, glideSeconds: 0.06, release: 0.04});
		}
	}


	/** A supply crate hits the ground (also when it is opened). */
	CrateThud() {
		if (!this.#IsReady()) {
			return;
		}
		const engine = audioEngine;
		const time = this.#Now();
		engine.PlayNoise(time, 0.25, 0.4, engine.effectsBus, {filterType: 'lowpass', frequency: 900});
		engine.PlayTone('sine', 120, time, 0.18, 0.5, engine.effectsBus, {glideTo: 60});
	}


	/** The sound logo of one intro card: engine, physics, blink, ice or megalith (data-sting in index.html). */
	IntroSting(logo) {
		if (!this.#IsReady()) {
			return;
		}
		const time = this.#Now() + 0.05;
		if (logo === 'engine') {
			this.#EngineSting(time);
		} else if (logo === 'physics') {
			this.#PhysicsSting(time);
		} else if (logo === 'blink') {
			this.#BlinkSting(time);
		} else if (logo === 'ice') {
			this.#IceSting(time);
		} else if (logo === 'megalith') {
			this.#MegalithSting(time);
		}
	}


	/** Low hum swelling up, then two bright pings as the logo completes. */
	#EngineSting(time) {
		const engine = audioEngine;
		engine.PlayTone('sine', 55, time, 1.8, 0.55, engine.effectsBus, {attack: 0.5, release: 0.9});
		engine.PlayNoise(time, 1.2, 0.12, engine.effectsBus, {
			filterType: 'bandpass', frequency: 200, frequencyEnd: 2400, resonance: 0.8, attack: 0.9, release: 0.4,
		});
		engine.PlayTone('sine', MidiToFrequency(93), time + 0.9, 0.6, 0.06, engine.effectsBus, {
			send: engine.effectsReverbSend, release: 0.8,
		});
		engine.PlayTone('sine', MidiToFrequency(100), time + 0.95, 0.6, 0.04, engine.effectsBus, {
			send: engine.effectsReverbSend, release: 0.8,
		});
	}


	/** Six letters clattering down, then the last one toppling over. */
	#PhysicsSting(time) {
		const engine = audioEngine;
		for (let i = 0; i < 6; i++) {
			const impactTime = time + i * 0.12 + 0.52;
			const clatter = 1200 + random.Next() * 2500;
			engine.PlayNoise(impactTime, 0.05, 0.35, engine.effectsBus, {filterType: 'bandpass', frequency: clatter, resonance: 1.5});
			engine.PlayTone('square', 90 + random.Next() * 120, impactTime, 0.05, 0.12, engine.effectsBus, {lowpass: 1200, glideTo: 50});
		}
		const toppleTime = time + 0.6 + 1.25 + 0.42;
		engine.PlayNoise(toppleTime, 0.12, 0.45, engine.effectsBus, {filterType: 'bandpass', frequency: 700, resonance: 1});
		engine.PlayTone('sine', 130, toppleTime, 0.2, 0.4, engine.effectsBus, {glideTo: 50});
	}


	/** Two eyelid clicks over a soft chord. */
	#BlinkSting(time) {
		const engine = audioEngine;
		engine.PlayNoise(time + 0.95, 0.012, 0.3, engine.effectsBus, {filterType: 'highpass', frequency: 3000});
		engine.PlayNoise(time + 1.15, 0.012, 0.25, engine.effectsBus, {filterType: 'highpass', frequency: 3000});
		for (const note of [57, 64, 69, 72]) {
			engine.PlayTone('sawtooth', MidiToFrequency(note), time, 1.8, 0.025, engine.effectsBus, {
				attack: 0.8, release: 0.7, lowpass: 1800, send: engine.effectsReverbSend,
			});
		}
	}


	/** Glassy random high notes and two crackles of ice. */
	#IceSting(time) {
		const engine = audioEngine;
		for (let i = 0; i < 14; i++) {
			const frequency = MidiToFrequency(88 + Math.floor(random.Next() * 14));
			engine.PlayTone('sine', frequency, time + random.Next() * 0.9, 0.3, 0.035, engine.effectsBus, {
				send: engine.effectsReverbSend, release: 0.5,
			});
		}
		engine.PlayNoise(time + 0.1, 0.08, 0.25, engine.effectsBus, {filterType: 'highpass', frequency: 4000});
		engine.PlayNoise(time + 0.25, 0.05, 0.18, engine.effectsBus, {filterType: 'highpass', frequency: 5000});
	}


	/** A taiko hit under a dark, slow chord. */
	#MegalithSting(time) {
		const engine = audioEngine;
		instruments.Taiko(time, 0.9, engine.effectsBus);
		for (const note of [38, 45, 50, 53]) {
			engine.PlayTone('sawtooth', MidiToFrequency(note), time, 2.2, 0.03, engine.effectsBus, {
				attack: 0.9, release: 1, lowpass: 900, send: engine.effectsReverbSend,
			});
		}
	}


	/** True when audio is running. */
	#IsReady() {
		return Boolean(audioEngine.context);
	}


	/** The audio clock. */
	#Now() {
		return audioEngine.context.currentTime;
	}
}


export const soundEffects = new SoundEffects();
