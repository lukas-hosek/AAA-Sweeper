/**
 * settings.js: the player's options, saved in localStorage.
 */
import {localStore} from './local-store.js';


const STORAGE_KEY = 'settings';
const FORMAT_VERSION = 3;    // Bumped when the stored fields change; saves of another version are discarded


/** Audio, subtitle, chatter and graphics options. The settings panel edits these fields by name. */
export class Settings {
	masterVolume = 0.9;      // 0..1
	musicVolume = 0.5;       // 0..1
	voiceVolume = 1;         // 0..1
	effectsVolume = 0.8;     // 0..1, sound effects
	muted = false;           // Master mute (M key, HUD button)
	subtitles = true;        // Subtitles for voice lines
	chatter = 'normal';      // Radio chatter frequency: off | normal | constant | unbearable
	filmGrain = true;        // Animated film grain over the game
	cameraSway = true;       // Gentle camera drift over the board
	blood = true;            // Blood splats when hurt


	/** Replaces the defaults with the stored values, if a save of the current format exists. */
	Load() {
		const stored = localStore.Load(STORAGE_KEY, null);
		if (!stored || stored.formatVersion !== FORMAT_VERSION) {
			return;
		}
		for (const name of Object.keys(this)) {
			if (name in stored) {
				this[name] = stored[name];
			}
		}
	}


	/** Writes all fields to localStorage. */
	Save() {
		localStore.Save(STORAGE_KEY, {...this, formatVersion: FORMAT_VERSION});
	}
}


export const settings = new Settings();
// Loaded right away: other modules read the settings while the page starts up
settings.Load();
