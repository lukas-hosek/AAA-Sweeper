/**
 * quest-log-tab.js: the quest log: the main quest, the side quests handed out so far, and the lore found.
 */
import {soundEffects} from '../../audio/sound-effects.js';
import {EscapeHtml} from '../../core/dom.js';
import {profile} from '../../core/player-profile.js';
import {CHARACTERS} from '../../data/characters.js';
import {SIDE_QUESTS} from '../../data/side-quests.js';
import {LORE_FRAGMENTS} from '../../data/texts.js';
import {game} from '../../game/game.js';
import {achievements} from '../achievements.js';
import {hud} from '../hud.js';
import {toasts} from '../toasts.js';
import {PanelTab} from './panel-tab.js';


const ADVERTISED_LORE_FRAGMENTS = 400;


/** Side quests have one action button each: track it, call Mom (no signal), or open the store. */
export class QuestLogTab extends PanelTab {
	constructor(panel) {
		super(panel, 'quests', 'QUEST LOG');
	}


	Markup() {
		const field = game.field;
		if (!field) {
			return '<div class="panel-heading">No active operation</div>'
				+ '<p class="panel-text">Start a New Game to receive quests. Quests are where the game tells you what to do.</p>';
		}
		return this.#MainQuestMarkup(field) + this.#SideQuestsMarkup(field) + this.#LoreMarkup();
	}


	/** Opening the quest log is an achievement. */
	OnShow() {
		achievements.Unlock('quest');
	}


	/** A side quest's button: it becomes the tracked quest, whatever the button said. */
	OnClick(button) {
		const questId = button.dataset.quest;
		if (!questId) {
			return;
		}
		const quest = SIDE_QUESTS[questId];
		soundEffects.MenuSelect();
		if (quest.actionLabel === 'CALL') {
			toasts.Show({
				kicker: 'CALL FAILED',
				title: 'No signal in the minefield.',
				description: 'Mom has been notified that you tried.',
				icon: '✆',
			});
		} else if (quest.actionLabel === 'OPEN STORE') {
			this.panel.SwitchTo('store');
		}
		game.field.trackedSideQuest = questId;
		hud.Refresh();
		this.panel.Render();
	}


	#MainQuestMarkup(field) {
		const chapter = field.chapter;
		const safeTiles = field.tileCount - field.mineCount;
		return `<div class="panel-heading">Main quest · ${EscapeHtml(chapter.chapterLabel)}</div>
			<div class="card-grid">
				<div class="panel-card is-main">
					<span class="card-kicker">MAIN · ${EscapeHtml(chapter.questGiver)}</span>
					<span class="card-name">${EscapeHtml(chapter.operation)}</span>
					<span class="card-description">${EscapeHtml(chapter.description)}</span>
					<ul>`
			+ `<li>Reveal the safe tiles: ${field.openedCount}/${safeTiles}</li>`
			+ `<li>Flag the mines (optional): ${field.flagCount}/${field.mineCount}</li>`
			+ `<li>Follow the quest marker: ${field.markersFollowed} times</li>`
			+ `<li>Survive: ${field.deaths} deaths</li>`
			+ `</ul>
				</div>
			</div>`;
	}


	#SideQuestsMarkup(field) {
		const heading = '<div class="panel-heading" style="margin-top:20px">Side quests</div>';
		if (!field.sideQuests.length) {
			return heading + '<p class="panel-text">No side quests yet. Keep your radio on. Someone will call. Someone always calls.</p>';
		}
		const cards = field.sideQuests.map(questId => this.#SideQuestCard(field, questId)).join('');
		return `${heading}<div class="card-grid">${cards}</div>`;
	}


	/** One side quest. The club quest is done once the club has come; its button disappears then. */
	#SideQuestCard(field, questId) {
		const quest = SIDE_QUESTS[questId];
		const isDone = questId === 'club' && field.clubVisited;
		const isTracked = field.trackedSideQuest === questId;
		let button = '';
		if (!isDone) {
			const label = isTracked && quest.actionLabel === 'TRACK' ? 'TRACKED' : EscapeHtml(quest.actionLabel);
			button = `<button class="panel-button ${isTracked ? '' : 'is-secondary'}" data-quest="${questId}">${label}</button>`;
		}
		return `<div class="panel-card" style="--card-color:${CHARACTERS[quest.speaker].color}">
				<span class="card-kicker">SIDE · ${EscapeHtml(quest.giver.toUpperCase())}</span>
				<span class="card-name">${EscapeHtml(quest.name)}</span>
				<span class="card-description">${EscapeHtml(quest.description)}</span>
				<span class="card-objective ${isDone ? 'is-done' : ''}">${isDone ? '✓ ' : '◆ '}${EscapeHtml(quest.Objective(field))}</span>
				${button}
			</div>`;
	}


	/** Every fragment found so far (they repeat after the last one, so the list stops there). */
	#LoreMarkup() {
		const heading = `<div class="panel-heading" style="margin-top:20px">Lore fragments · ${profile.loreFound}/${ADVERTISED_LORE_FRAGMENTS}</div>`;
		if (!profile.loreFound) {
			return heading + '<p class="panel-text">Lore fragments hide under safe tiles. '
				+ 'The minimap marks them with a question mark, which defeats the purpose.</p>';
		}
		const found = LORE_FRAGMENTS.slice(0, Math.min(profile.loreFound, LORE_FRAGMENTS.length));
		return `${heading}<ul class="lore-list">${found.map(fragment => `<li>${EscapeHtml(fragment)}</li>`).join('')}</ul>`;
	}
}
