/**
 * voice-bank.js: loads, decodes and caches the voice-line MP3s (assets/voices/<id>.mp3, made by tools/tts/).
 */
import {PINNED_LINES} from '../data/chatter.js';
import {VOICE_LINES} from '../data/voice-manifest.js';
import {audioEngine} from './audio-engine.js';
import {chatter} from './chatter-scheduler.js';
import {voices} from './voice-manager.js';


const CACHE_SIZE = 52;    // Decoded lines kept in memory; pinned, playing and queued lines are never dropped


/** Decoded voice lines, fetched on demand, with a least-recently-used cache. */
export class VoiceBank {
	#buffers = new Map();     // Voice id -> decoded AudioBuffer
	#pending = new Map();     // Voice id -> promise of its AudioBuffer (or null if loading failed)
	#recentlyUsed = [];       // Voice ids, least recently used first


	/** The title voice and the short reaction lines must be ready the moment they are needed: decode them early. */
	Init() {
		audioEngine.WhenStarted(() => this.Predecode(['a_title', ...PINNED_LINES]));
	}


	/** Number of decoded lines in the cache. */
	get decodedCount() {
		return this.#buffers.size;
	}


	/** The decoded buffer of a line, or undefined if it is not decoded yet. */
	Buffer(voiceId) {
		return this.#buffers.get(voiceId);
	}


	/** Where a line's audio file is served from. */
	Url(voiceId) {
		return `assets/voices/${voiceId}.mp3`;
	}


	/** Loads and decodes a line (once). Resolves to its AudioBuffer, or null if it is unknown or fails to load. */
	Decode(voiceId) {
		if (this.#buffers.has(voiceId)) {
			return Promise.resolve(this.#buffers.get(voiceId));
		}
		if (this.#pending.has(voiceId)) {
			return this.#pending.get(voiceId);
		}
		if (!VOICE_LINES[voiceId] || !audioEngine.context) {
			return Promise.resolve(null);
		}
		const promise = new Promise(resolve => {
			// Old browsers report decoding through callbacks, new ones through the promise; take whichever comes first
			let settled = false;
			const succeed = buffer => {
				if (!settled) {
					settled = true;
					this.#buffers.set(voiceId, buffer);
					this.MarkUsed(voiceId);
					resolve(buffer);
				}
			};
			const fail = () => {
				if (!settled) {
					settled = true;
					resolve(null);
				}
			};
			this.#Fetch(voiceId).then(data => {
				const decoding = audioEngine.context.decodeAudioData(data, succeed, fail);
				if (decoding && decoding.then) {
					decoding.then(succeed, fail);
				}
			}).catch(fail);
		});
		this.#pending.set(voiceId, promise);
		return promise;
	}


	/** Marks a line as just used, and drops the least recently used lines beyond the cache size. */
	MarkUsed(voiceId) {
		const index = this.#recentlyUsed.indexOf(voiceId);
		if (index >= 0) {
			this.#recentlyUsed.splice(index, 1);
		}
		this.#recentlyUsed.push(voiceId);
		let guard = 0;
		while (this.#recentlyUsed.length > CACHE_SIZE && guard++ < 80) {
			const evictable = this.#recentlyUsed.find(id => !PINNED_LINES.has(id) && !voices.IsPlaying(id) && id !== chatter.queuedLine);
			if (!evictable) {
				break;
			}
			this.#recentlyUsed.splice(this.#recentlyUsed.indexOf(evictable), 1);
			this.#buffers.delete(evictable);
			this.#pending.delete(evictable);
		}
	}


	/** Decodes lines one after another (unknown ids are skipped). */
	async Predecode(voiceIds) {
		for (const voiceId of voiceIds) {
			if (voiceId && VOICE_LINES[voiceId]) {
				await this.Decode(voiceId);
			}
		}
	}


	/** The raw MP3 data of a line. */
	async #Fetch(voiceId) {
		const response = await fetch(this.Url(voiceId));
		if (!response.ok) {
			throw new Error('voice ' + voiceId + ': HTTP ' + response.status);
		}
		return response.arrayBuffer();
	}
}


export const voiceBank = new VoiceBank();
