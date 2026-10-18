/**
 * game.js: the game session: owns the field being played.
 */
import {Field} from './field.js';


/** Owns the current Field. Every other module reads `game.field`; only Game creates and drops it. */
export class Game {
	field = null;    // The Field being played, or null outside a game


	/** Creates a fresh field for a chapter and makes it current. */
	BeginField(difficultyKey, chapter, fieldNumber) {
		this.field = new Field(difficultyKey, chapter, fieldNumber);
		return this.field;
	}


	/** Drops the current field (back to the title screen or the desktop). */
	EndField() {
		this.field = null;
	}


	/** Runs `callback` after `seconds` of game time, if a field is being played. */
	Schedule(seconds, callback) {
		if (this.field) {
			this.field.Schedule(seconds, callback);
		}
	}
}


export const game = new Game();
