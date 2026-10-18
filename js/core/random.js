/**
 * random.js: the single source of randomness for the whole game.
 */


/**
 * Random numbers for gameplay, visuals and audio.
 * It draws from Math.random until Seed() installs a reproducible generator (the ?seed=N URL parameter),
 * so a board and everything around it can be replayed for a bug report.
 */
export class Random {
	#seededNext = null;    // Seeded generator installed by Seed(), or null to use Math.random


	/** Uniform number in [0, 1). */
	Next() {
		return this.#seededNext ? this.#seededNext() : Math.random();
	}


	/** Uniform number in [min, max). */
	Range(min, max) {
		return min + this.Next() * (max - min);
	}


	/** True with the given probability (0..1). */
	Chance(probability) {
		return this.Next() < probability;
	}


	/** A random element of a non-empty array. */
	Pick(array) {
		return array[Math.floor(this.Next() * array.length)];
	}


	/** Shuffles an array in place (Fisher-Yates) and returns it. */
	Shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(this.Next() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}


	/** Switches to a reproducible sequence (mulberry32), seeded by a 32-bit integer. */
	Seed(seed) {
		let state = seed | 0;
		this.#seededNext = () => {
			state = (state + 0x6d2b79f5) | 0;
			let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
			mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
			return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
		};
	}
}


export const random = new Random();
