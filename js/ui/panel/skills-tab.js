/**
 * skills-tab.js: the skill tree, five perks bought with the skill points from levelling up.
 */
import {soundEffects} from '../../audio/sound-effects.js';
import {EscapeHtml} from '../../core/dom.js';
import {profile} from '../../core/player-profile.js';
import {PERKS} from '../../data/store.js';
import {achievements} from '../achievements.js';
import {hud} from '../hud.js';
import {PanelTab} from './panel-tab.js';


/** Each perk costs one point and stays unlocked on the profile. */
export class SkillsTab extends PanelTab {
	constructor(panel) {
		super(panel, 'skills', 'SKILLS');
	}


	Markup() {
		const cards = PERKS.map(perk => {
			const disabled = profile.skillPoints < 1 ? 'disabled' : '';
			const action = profile.perks[perk.id]
				? '<span class="card-objective is-done">✓ UNLOCKED</span>'
				: `<button class="panel-button" data-perk="${perk.id}" ${disabled}>UNLOCK · 1 POINT</button>`;
			return `<div class="panel-card">
					<span class="card-kicker">PERK</span>
					<span class="card-name">${EscapeHtml(perk.name)}</span>
					<span class="card-description">${EscapeHtml(perk.description)}</span>
					${action}
				</div>`;
		}).join('');
		return `<div class="panel-heading">Skill points available: ${profile.skillPoints}</div>
			<p class="panel-text">Earn skill points by levelling up. Level up by clicking tiles. Click tiles by following the marker.</p>
			<div class="card-grid">${cards}</div>`;
	}


	/** Unlocks a perk for a skill point. */
	OnClick(button) {
		const perkId = button.dataset.perk;
		if (!perkId || profile.skillPoints < 1) {
			return;
		}
		profile.skillPoints--;
		profile.perks[perkId] = 1;
		profile.Save();
		soundEffects.LevelUp();
		achievements.Unlock('skill');
		hud.Refresh();
		this.panel.Render();
	}
}
