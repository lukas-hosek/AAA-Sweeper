/**
 * voice-manager.js: plays voice lines: the radio filter chain, ducking, bark cooldowns, subtitles,
 * and what happens when a line ends (side quests, the club arriving).
 */
import {EscapeHtml, FindElement} from '../core/dom.js';
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {NowSeconds} from '../core/time.js';
import {CHARACTERS, SpeakerOf} from '../data/characters.js';
import {SIDE_QUEST_AFTER_LINE} from '../data/chatter.js';
import {SubtitleOf} from '../data/subtitles.js';
import {VOICE_LINES} from '../data/voice-manifest.js';
import {clubNight} from '../game/events/club-night.js';
import {game} from '../game/game.js';
import {progression} from '../game/progression.js';
import {achievements} from '../ui/achievements.js';
import {radioPanel} from '../ui/radio-panel.js';
import {screens} from '../ui/screen-manager.js';
import {toasts} from '../ui/toasts.js';
import {audioEngine} from './audio-engine.js';
import {chatter} from './chatter-scheduler.js';
import {voiceBank} from './voice-bank.js';


const RADIO_LEAD_SECONDS = 0.17;        // Radio lines start after the opening squelch
const MAX_RADIO_VOICES = 2;             // A third radio line cuts off the oldest
const WAITING_LINE_LIFETIME = 6;        // Held-back lines older than this are dropped
const MAX_SUBTITLES = 3;


/** A voice line that is playing. */
class PlayingVoice {
	voiceId;              // Voice line id
	speaker;              // CHARACTERS id
	isRadio;              // Played through the radio chain
	source;               // AudioBufferSourceNode
	gain;                 // Its gain node (lowered while another radio line plays)
	isDone = false;       // Finished or stopped
	subtitle = null;      // Its subtitle element, if subtitles are on


	constructor(voiceId, speaker, isRadio, source, gain) {
		this.voiceId = voiceId;
		this.speaker = speaker;
		this.isRadio = isRadio;
		this.source = source;
		this.gain = gain;
	}
}


/**
 * Plays voice lines. Radio characters go through a band-pass, saturation and (for the eerie and PA voices) an echo,
 * with squelch clicks and hiss, and the music ducks under them. Barks are one-off reaction lines with cooldowns.
 * On the calm chatter settings (off, normal) lines don't overlap: a second line waits until the first is done.
 */
export class VoiceManager {
	#active = [];         // PlayingVoice objects
	#cooldowns = {};      // Bark cooldown key -> field clock time it expires
	#waiting = [];        // Lines held back while another plays: {voiceId, options, time}


	/** Forgets cooldowns and held-back lines when a new field starts. */
	ResetForChapter() {
		this.#cooldowns = {};
		this.#waiting = [];
	}


	/** The radio voices playing (the radio panel shows the newest one). */
	ActiveRadioVoices() {
		return this.#active.filter(voice => voice.isRadio);
	}


	/** True while a line is playing (the voice bank keeps it in memory). */
	IsPlaying(voiceId) {
		return this.#active.some(voice => voice.voiceId === voiceId);
	}


	/** Number of lines playing. */
	get activeCount() {
		return this.#active.length;
	}


	/**
	 * Plays a voice line now, or as soon as it is decoded. Returns false if it was refused (chatter never
	 * interrupts radio talk), true if it plays or was held back.
	 * options.isChatter marks background chatter, which gives way to everything else.
	 */
	Say(voiceId, options = {}) {
		if (!audioEngine.context || !VOICE_LINES[voiceId]) {
			return false;
		}
		const speaker = SpeakerOf(voiceId);
		const character = CHARACTERS[speaker];
		const buffer = voiceBank.Buffer(voiceId);
		if (this.#IsCalmChatter() && this.#active.length && speaker !== 'announcer') {
			if (options.isChatter) {
				return false;
			}
			this.#waiting.push({voiceId, options, time: NowSeconds()});
			return true;
		}
		if (!buffer) {
			// Play it once decoded; by then it is no longer background chatter
			voiceBank.Decode(voiceId).then(decoded => {
				if (decoded) {
					this.Say(voiceId, {...options, isChatter: false});
				}
			});
			return true;
		}
		const context = audioEngine.context;
		const now = context.currentTime;
		voiceBank.MarkUsed(voiceId);
		if (character.isRadio) {
			const radioVoices = this.ActiveRadioVoices();
			if (options.isChatter && radioVoices.length) {
				return false;
			}
			if (radioVoices.length >= MAX_RADIO_VOICES) {
				this.#Stop(radioVoices[0]);
			}
			// Lines that keep playing duck under the new one
			for (const voice of this.ActiveRadioVoices()) {
				voice.gain.gain.setTargetAtTime(0.32, now, 0.06);
			}
		}
		const startTime = now + (character.isRadio ? RADIO_LEAD_SECONDS : 0.02);
		const duration = buffer.duration;
		const source = context.createBufferSource();
		source.buffer = buffer;
		const gain = context.createGain();
		gain.gain.value = character.isRadio ? 1.1 : 0.95;
		if (character.isRadio) {
			this.#ConnectRadioFilters(source, gain, character);
			this.#PlaySquelch(now, true);
			this.#PlaySquelch(startTime + duration - 0.05, false);
			this.#PlayHiss(startTime, duration);
			audioEngine.duckBus.gain.setTargetAtTime(0.36, now, 0.12);
		} else {
			source.connect(gain);
		}
		gain.connect(audioEngine.voiceBus);
		source.start(startTime);

		const voice = new PlayingVoice(voiceId, speaker, character.isRadio, source, gain);
		if (settings.subtitles && !character.hideSubtitles && screens.current === 'game') {
			voice.subtitle = this.#AddSubtitle(speaker, voiceId);
		}
		this.#active.push(voice);
		source.onended = () => this.#Finish(voice);
		if (character.isRadio) {
			radioPanel.Show(speaker);
			if (game.field) {
				game.field.transmissionsHeard++;
				if (game.field.transmissionsHeard >= 10) {
					achievements.Unlock('listener');
				}
			}
		}
		return true;
	}


	/**
	 * Plays a reaction line unless its cooldown is running. `cooldownKey` groups lines that share a cooldown
	 * (null for none); the cooldown is `cooldownSeconds` of field clock time. Returns whether the line plays.
	 */
	Bark(voiceId, cooldownKey, cooldownSeconds, options = {}) {
		const field = game.field;
		if (!field) {
			return this.Say(voiceId, options);
		}
		if (cooldownKey && (this.#cooldowns[cooldownKey] ?? -1e9) > field.clock) {
			return false;
		}
		const playing = this.Say(voiceId, options);
		if (playing && cooldownKey) {
			this.#cooldowns[cooldownKey] = field.clock + cooldownSeconds;
		}
		return playing;
	}


	/** Stops every line and drops the held-back ones. */
	StopAll() {
		this.#waiting = [];
		for (const voice of [...this.#active]) {
			this.#Stop(voice);
		}
		this.#waiting = [];
	}


	/** Band-pass, presence boost, saturation and (eerie or PA voices) an echo: source → filters → output. */
	#ConnectRadioFilters(source, output, character) {
		const context = audioEngine.context;
		const highpass = context.createBiquadFilter();
		highpass.type = 'highpass';
		highpass.frequency.value = character.isPhone ? 450 : 300;
		const presence = context.createBiquadFilter();
		presence.type = 'peaking';
		presence.frequency.value = 1700;
		presence.Q.value = 0.9;
		presence.gain.value = 6;
		const drive = context.createGain();
		drive.gain.value = 1.7;
		const saturation = context.createWaveShaper();
		saturation.curve = audioEngine.radioCurve;
		saturation.oversample = '2x';
		const lowpass = context.createBiquadFilter();
		lowpass.type = 'lowpass';
		lowpass.frequency.value = character.isPhone ? 3400 : 3100;
		source.connect(highpass);
		highpass.connect(presence);
		presence.connect(drive);
		drive.connect(saturation);
		saturation.connect(lowpass);
		lowpass.connect(output);
		if (character.isEerie || character.isPublicAddress) {
			const delay = context.createDelay(1);
			delay.delayTime.value = character.isPublicAddress ? 0.13 : 0.24;
			const feedback = context.createGain();
			feedback.gain.value = character.isPublicAddress ? 0.3 : 0.4;
			lowpass.connect(delay);
			delay.connect(feedback);
			feedback.connect(delay);
			delay.connect(output);
		}
	}


	/** The click and beep of a radio channel opening or closing. */
	#PlaySquelch(time, isOpening) {
		const engine = audioEngine;
		engine.PlayNoise(time, isOpening ? 0.12 : 0.16, 0.18, engine.voiceBus, {
			filterType: 'bandpass', frequency: isOpening ? 1900 : 1500, resonance: 0.7, attack: 0.004, release: 0.03,
		});
		if (isOpening) {
			engine.PlayTone('sine', 1350, time + 0.1, 0.05, 0.06, engine.voiceBus, {release: 0.01});
		} else {
			engine.PlayTone('sine', 900, time + 0.12, 0.04, 0.05, engine.voiceBus, {release: 0.01});
		}
	}


	/** Faint radio hiss under a line. */
	#PlayHiss(time, duration) {
		audioEngine.PlayNoise(time, duration, 0.012, audioEngine.voiceBus, {
			filterType: 'highpass', frequency: 2500, attack: 0.05, release: 0.05,
		});
	}


	/** Cleans up after a line: subtitle, ducking, radio panel, line-end events, and the next held-back line. */
	#Finish(voice) {
		if (voice.isDone) {
			return;
		}
		voice.isDone = true;
		this.#active = this.#active.filter(other => other !== voice);
		if (voice.subtitle) {
			const subtitle = voice.subtitle;
			subtitle.classList.add('is-leaving');
			setTimeout(() => subtitle.remove(), 400);
		}
		if (voice.isRadio) {
			const radioVoices = this.ActiveRadioVoices();
			if (!radioVoices.length) {
				if (audioEngine.context) {
					audioEngine.duckBus.gain.setTargetAtTime(1, audioEngine.context.currentTime + 0.2, 0.4);
				}
				radioPanel.HideSoon();
				if (game.field) {
					chatter.nextTime = game.field.clock + chatter.Gap();
				}
			} else {
				for (const other of radioVoices) {
					other.gain.gain.setTargetAtTime(1.1, audioEngine.context.currentTime, 0.1);
				}
				radioPanel.Show(radioVoices[radioVoices.length - 1].speaker);
			}
		}
		if (game.field && screens.current === 'game') {
			this.#OnLineEnd(voice.voiceId);
		}
		if (!this.#active.length && this.#waiting.length) {
			const now = NowSeconds();
			this.#waiting = this.#waiting.filter(waiting => now - waiting.time < WAITING_LINE_LIFETIME);
			const next = this.#waiting.shift();
			if (next) {
				// A short breath between lines; if something else started meanwhile, keep waiting
				setTimeout(() => {
					if (!this.#active.length) {
						this.Say(next.voiceId, next.options);
					} else {
						this.#waiting.unshift(next);
					}
				}, 450);
			}
		}
	}


	/** Stops a line right away. */
	#Stop(voice) {
		try {
			voice.source.onended = null;
			voice.source.stop();
		} catch {
			// Already stopped
		}
		this.#Finish(voice);
	}


	/** Story beats triggered by the end of a line: side quests, the club arriving, store nagging. */
	#OnLineEnd(voiceId) {
		const field = game.field;
		if (field.isOver) {
			return;
		}
		const sideQuest = SIDE_QUEST_AFTER_LINE[voiceId];
		if (sideQuest) {
			progression.AddSideQuest(sideQuest);
		}
		// Big Dez's last call: if you won't come to the club, the club comes to you
		if (voiceId === 'd_5' && !field.chapter.isClub) {
			clubNight.Start();
		}
		if (SpeakerOf(voiceId) === 'qm' && random.Next() < 0.5) {
			const offer = {kicker: 'LIMITED TIME OFFER', title: 'Premium flag skins are in the store. Press B.', icon: '%'};
			setTimeout(() => toasts.Show(offer), 600);
			game.Schedule(1.3, () => this.Bark('s_store', 'sstore', 60));
		}
	}


	/** Adds a subtitle line (at most three are shown). */
	#AddSubtitle(speaker, voiceId) {
		const character = CHARACTERS[speaker];
		const box = FindElement('#subtitles');
		const line = document.createElement('p');
		line.className = 'subtitle' + (speaker === 'sys' ? ' is-system' : '');
		const text = EscapeHtml(SubtitleOf(voiceId));
		line.innerHTML = speaker === 'sys'
			? `<span class="subtitle-system-tag">[SYSTEM]</span> ${text}`
			: `<b style="color:${character.color}">${EscapeHtml(character.name)}:</b> ${text}`;
		box.appendChild(line);
		while (box.children.length > MAX_SUBTITLES) {
			box.firstChild.remove();
		}
		return line;
	}


	/** On the off and normal chatter settings, lines never overlap. */
	#IsCalmChatter() {
		return settings.chatter === 'normal' || settings.chatter === 'off';
	}
}


export const voices = new VoiceManager();
