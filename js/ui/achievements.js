/**
 * achievements.js: unlocking achievements (the list itself is data/achievements.js).
 */
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {profile} from '../core/player-profile.js';
import {ACHIEVEMENTS} from '../data/achievements.js';
import {game} from '../game/game.js';
import {toasts} from './toasts.js';


/** Unlocks each achievement once per profile, with gamerscore, a toast, a fanfare and (in game) a radio comment. */
export class Achievements {
	/** Unlocks an achievement by id; repeated or unknown ids do nothing. */
	Unlock(achievementId) {
		const achievement = ACHIEVEMENTS[achievementId];
		if (profile.achievements[achievementId] || !achievement) {
			return;
		}
		profile.achievements[achievementId] = 1;
		profile.gamerscore += achievement.gamerscore;
		profile.Save();
		toasts.Show({
			kicker: 'ACHIEVEMENT UNLOCKED',
			title: achievement.name,
			description: achievement.description,
			isReward: true,
			icon: '✦',
			gamerscore: `+${achievement.gamerscore} G`,
		});
		soundEffects.Achievement();
		if (game.field) {
			setTimeout(() => voices.Bark('s_ach', 'sach', 22), 450);
		}
	}
}


export const achievements = new Achievements();
