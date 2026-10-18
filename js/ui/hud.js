/**
 * hud.js: the DOM part of the in-game HUD: counters, XP and season bars, quest objectives, health and timer.
 * (The canvas parts, compass, minimap and radio waveform, are in render/hud/.)
 */
import {EscapeHtml, FindElement} from '../core/dom.js';
import {profile} from '../core/player-profile.js';
import {settings} from '../core/settings.js';
import {FormatMinutesSeconds} from '../core/time.js';
import {CHARACTERS} from '../data/characters.js';
import {SIDE_QUESTS} from '../data/side-quests.js';
import {FLAG_SKINS} from '../data/store.js';
import {RankTitle} from '../data/texts.js';
import {game} from '../game/game.js';
import {input} from '../game/input/input-controller.js';
import {progression} from '../game/progression.js';


const ADVERTISED_LORE_FRAGMENTS = 400;
const LEVELS_PER_SEASON_TIER = 2;


/**
 * Refresh() rewrites everything that changes on game events (counters, XP, objectives, buttons); the game calls it
 * after each event. UpdateFrame() only does the health bar and the mission timer, which change every frame.
 */
export class Hud {
	/** Rewrites the HUD after something happened. Does nothing outside a game. */
	Refresh() {
		const field = game.field;
		if (!field) {
			return;
		}
		FindElement('#mines-left').textContent = String(field.mineCount - field.flagCount - field.mineHits);
		FindElement('#mines-total').textContent = String(field.mineCount);
		FindElement('#flag-count').textContent = String(field.flagCount);
		FindElement('#coin-count').textContent = profile.coins.toLocaleString('en-US');
		this.#RefreshProgression();
		FindElement('#xp-boost').hidden = !(profile.xpBoostUntil > Date.now());
		const skinName = profile.equippedSkin === 'red'
			? 'STANDARD-ISSUE FINGER'
			: (FLAG_SKINS[profile.equippedSkin].name + ' · PREMIUM').toUpperCase();
		FindElement('#equipped-item').textContent = skinName;
		FindElement('#quest-objectives').innerHTML = this.#ObjectivesMarkup(field);
		this.#RefreshSideQuest(field);
		FindElement('#mute-button').textContent = settings.muted ? 'SOUND OFF' : 'SOUND ON';
		const flagModeButton = FindElement('#flag-mode-button');
		flagModeButton.textContent = input.flagMode ? 'FLAG MODE: ON' : 'FLAG MODE: OFF';
		flagModeButton.classList.toggle('is-active', input.flagMode);
	}


	/** The health bar (with its trailing damage bar) and the mission timer. */
	UpdateFrame() {
		const field = game.field;
		const health = Math.max(0, field.health);
		FindElement('#health-fill').style.width = health + '%';
		FindElement('#health-trail').style.width = Math.max(health, field.healthTrail) + '%';
		FindElement('#health-value').textContent = String(Math.ceil(health));
		FindElement('#mission-timer').textContent = FormatMinutesSeconds(field.missionSeconds);
	}


	/** Level, rank, XP bar, unspent skill points, and the battle-pass season tier (a new one every two levels). */
	#RefreshProgression() {
		const level = profile.level;
		const levelProgress = profile.xp / progression.XPForLevel(level);
		FindElement('#level-badge').textContent = String(level);
		FindElement('#player-rank').textContent = RankTitle(level) + ' · RANK ' + level;
		FindElement('#xp-bar-fill').style.width = (levelProgress * 100) + '%';
		FindElement('#xp-text').textContent = `${profile.xp} / ${progression.XPForLevel(level)} XP`;
		const skillNag = FindElement('#skill-nag');
		skillNag.hidden = profile.skillPoints < 1;
		skillNag.textContent = `${profile.skillPoints} UNSPENT SKILL POINT${profile.skillPoints > 1 ? 'S' : ''}`;
		FindElement('#season-tier').textContent = String(1 + Math.floor((level - 1) / LEVELS_PER_SEASON_TIER));
		FindElement('#season-bar-fill').style.width = ((level - 1) % 2 * 50 + levelProgress * 50) + '%';
	}


	/** The main quest's objectives as list items: [label, progress, done]. Pathos-4 adds one about the flood. */
	#ObjectivesMarkup(field) {
		const safeTiles = field.tileCount - field.mineCount;
		const objectives = [
			['Reveal the safe tiles', `${field.openedCount}/${safeTiles}`, field.isWon],
			['Flag the mines (optional)', `${field.flagCount}/${field.mineCount}`, field.isWon],
			['Follow the quest marker', `${field.markersFollowed}`, field.markersFollowed >= 10],
			['Survive', field.deaths ? `${field.deaths} ✝` : '', field.isWon],
			['Find lore fragments', `${field.loreFoundHere}/${ADVERTISED_LORE_FRAGMENTS}`, false],
		];
		if (field.chapter.floods) {
			const label = field.isFlooded ? 'Hold your breath (indefinitely)' : 'Clear the base before it floods';
			objectives.splice(1, 0, [label, '', field.isWon && !field.isFlooded]);
		}
		return objectives.map(([label, progress, isDone]) =>
			`<li class="${isDone ? 'is-done' : ''}"><i></i><span>${EscapeHtml(label)}</span><b>${EscapeHtml(progress)}</b></li>`,
		).join('');
	}


	/** The tracked side quest under the main quest, in its giver's colour. */
	#RefreshSideQuest(field) {
		const element = FindElement('#side-quest');
		if (!field.trackedSideQuest) {
			element.hidden = true;
			return;
		}
		const quest = SIDE_QUESTS[field.trackedSideQuest];
		element.hidden = false;
		element.innerHTML = `<span class="side-quest-name" style="color:${CHARACTERS[quest.speaker].color}">◆ ${EscapeHtml(quest.name)}</span>`
			+ `<span class="side-quest-objective">${EscapeHtml(quest.Objective(field))}</span>`;
	}
}


export const hud = new Hud();
