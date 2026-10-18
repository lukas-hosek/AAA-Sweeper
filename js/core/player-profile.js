/**
 * player-profile.js: persistent progression, saved in localStorage. A field in progress is never saved.
 */
import {localStore} from './local-store.js';


const STORAGE_KEY = 'profile';
const FORMAT_VERSION = 3;    // Bumped when the stored fields change; saves of another version are discarded
const PREMIUM_SKINS = ['gold', 'chrome', 'tune'];


/** Everything the player keeps between runs: level, coins, perks, cosmetics, achievements, lore, chapters. */
export class PlayerProfile {
	xp = 0;                      // XP collected towards the next level
	level = 1;
	coins = 250;                 // Sweep Coins
	skillPoints = 0;             // Unspent skill points
	perks = {};                  // Perk id -> 1 once unlocked
	ownedSkins = {red: true};    // Flag skin id -> true once bought
	equippedSkin = 'red';
	xpBoostUntil = 0;            // Date.now() time when the XP booster runs out
	achievements = {};           // Achievement id -> 1 once unlocked
	gamerscore = 0;
	loreFound = 0;               // Lore fragments found over all runs
	highestChapter = 1;          // Highest chapter unlocked in chapter select


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


	/** How many of the three premium flag skins the player owns (Quartermaster side quest). */
	CountPremiumSkins() {
		return PREMIUM_SKINS.filter(skin => this.ownedSkins[skin]).length;
	}
}


export const profile = new PlayerProfile();
// Loaded right away: other modules read the profile while the page starts up
profile.Load();
