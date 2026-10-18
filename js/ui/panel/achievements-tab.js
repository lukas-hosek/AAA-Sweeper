/**
 * achievements-tab.js: every achievement, locked or unlocked, with the gamerscore.
 */
import {EscapeHtml} from '../../core/dom.js';
import {profile} from '../../core/player-profile.js';
import {ACHIEVEMENTS} from '../../data/achievements.js';
import {PanelTab} from './panel-tab.js';


/** Read only. Locked achievements still show their names and descriptions, so the player knows what to grind. */
export class AchievementsTab extends PanelTab {
	constructor(panel) {
		super(panel, 'achievements', 'ACHIEVEMENTS');
	}


	Markup() {
		const ids = Object.keys(ACHIEVEMENTS);
		const unlockedCount = ids.filter(id => profile.achievements[id]).length;
		const badges = ids.map(id => {
			const achievement = ACHIEVEMENTS[id];
			const isUnlocked = profile.achievements[id];
			return `<div class="achievement ${isUnlocked ? '' : 'is-locked'}">
					<div class="badge-icon">${isUnlocked ? '✦' : '?'}</div>
					<div><b>${EscapeHtml(achievement.name)}</b><span>${EscapeHtml(achievement.description)}</span></div>
					<span class="gamerscore">${achievement.gamerscore} G</span>
				</div>`;
		}).join('');
		return `<div class="panel-heading">${unlockedCount}/${ids.length} unlocked · ${profile.gamerscore} G</div>
			<div class="card-grid">${badges}</div>`;
	}
}
