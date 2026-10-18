/**
 * local-store.js: JSON values in localStorage under the game's key prefix.
 */


/**
 * Reads and writes JSON values in localStorage.
 * Every access is wrapped in try/catch, so the game still runs when storage is blocked (private windows, policies).
 */
export class LocalStore {
	#keyPrefix;    // Prepended to every key, so the game's entries are recognisable


	constructor(keyPrefix) {
		this.#keyPrefix = keyPrefix;
	}


	/** The stored value of `key`, or `fallback` if there is none or storage is unavailable. */
	Load(key, fallback) {
		try {
			const text = localStorage.getItem(this.#keyPrefix + key);
			return text == null ? fallback : JSON.parse(text);
		} catch {
			return fallback;
		}
	}


	/** Stores `value` under `key`. Silently does nothing when storage is unavailable. */
	Save(key, value) {
		try {
			localStorage.setItem(this.#keyPrefix + key, JSON.stringify(value));
		} catch {
			// Storage blocked or full: the game keeps running without saving
		}
	}
}


export const localStore = new LocalStore('aaasweep.');
