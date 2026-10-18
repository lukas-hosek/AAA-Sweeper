/**
 * progression.js: XP and levels, lore fragments and side quests.
 */
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {FULL_TURN} from '../core/math.js';
import {profile} from '../core/player-profile.js';
import {random} from '../core/random.js';
import {CHARACTERS} from '../data/characters.js';
import {SIDE_QUESTS} from '../data/side-quests.js';
import {LORE_FRAGMENTS, RankTitle} from '../data/texts.js';
import {TUNING} from '../data/tuning.js';
import {camera} from '../render/camera.js';
import {layout} from '../render/layout.js';
import {particles} from '../render/particles.js';
import {achievements} from '../ui/achievements.js';
import {banners} from '../ui/banners.js';
import {callouts} from '../ui/callouts.js';
import {hud} from '../ui/hud.js';
import {killFeed} from '../ui/kill-feed.js';
import {toasts} from '../ui/toasts.js';
import {game} from './game.js';


const ADVERTISED_LORE_FRAGMENTS = 400;    // The quest log promises this many; LORE_FRAGMENTS has far fewer and repeats


/** The player's long-term growth. Everything here lands on the saved profile; the field keeps per-chapter tallies. */
export class Progression {
	/** XP needed to get from `level` to the next one. */
	XPForLevel(level) {
		return TUNING.xp.levelBase + TUNING.xp.levelStep * level;
	}


	/** Awards XP after perks and boosts, levelling up as often as it fills the bar. Returns the XP actually given. */
	GainXP(amount) {
		let factor = 1;
		if (profile.perks.scholar) {
			factor *= TUNING.xp.scholarFactor;
		}
		if (profile.xpBoostUntil > Date.now()) {
			factor *= TUNING.xp.boostFactor;
		}
		const awarded = Math.round(amount * factor);
		profile.xp += awarded;
		if (game.field) {
			game.field.xpEarned += awarded;
		}
		while (profile.xp >= this.XPForLevel(profile.level)) {
			profile.xp -= this.XPForLevel(profile.level);
			profile.level++;
			this.#LevelUp();
		}
		profile.Save();
		return awarded;
	}


	/** Picks up the lore fragment hidden under a revealed tile: sparkles, XP, a toast and the fragment's text. */
	CollectLore(tileIndex) {
		const field = game.field;
		field.loreTiles.delete(tileIndex);
		field.loreFoundHere++;
		profile.loreFound++;
		const position = camera.TileToScreen(tileIndex);
		soundEffects.LoreFound();
		for (let k = 0; k < 26; k++) {
			const angle = random.Range(0, FULL_TURN);
			const speed = random.Range(40, 170);
			particles.Emit({
				type: 'glint',
				x: position.x - camera.x,
				y: position.y - camera.y,
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed - 40,
				gravity: 40,
				drag: 2,
				life: random.Range(0.6, 1.2),
				size: random.Range(2, 4),
			});
		}
		const xp = this.GainXP(TUNING.xp.loreFragment);
		callouts.PopAt(position.x, position.y - layout.board.tileSize * 0.6, `LORE +${xp} XP`, 'big');
		const text = LORE_FRAGMENTS[(profile.loreFound - 1) % LORE_FRAGMENTS.length];
		toasts.Show({
			kicker: `LORE FRAGMENT ${profile.loreFound}/${ADVERTISED_LORE_FRAGMENTS}`,
			title: text,
			description: 'Added to your quest log',
			isReward: true,
			icon: '?',
		});
		achievements.Unlock('lore');
		if (profile.loreFound === 1 || field.loreFoundHere === 1) {
			voices.Bark(random.Pick(['j_lore', 'r_lore']), 'jlore', 999, {});
		}
		killFeed.Add(`<b>LORE FRAGMENT</b> FOUND AT ${field.TileLabel(tileIndex)}`, 'gold');
	}


	/** Hands out a side quest (once per field) and makes it the tracked one. */
	AddSideQuest(questId) {
		const field = game.field;
		if (!field || field.sideQuests.includes(questId)) {
			return;
		}
		field.sideQuests.push(questId);
		field.trackedSideQuest = questId;
		const quest = SIDE_QUESTS[questId];
		banners.Show('NEW QUEST', quest.name, `From ${quest.giver} · Added to your quest log`, CHARACTERS[quest.speaker].color);
		soundEffects.NewQuest();
		game.Schedule(0.5, () => voices.Bark('s_quest', 'squest', 8));
		hud.Refresh();
	}


	/** A skill point, coins, a banner and (in a field) the battle-pass barks. */
	#LevelUp() {
		profile.skillPoints++;
		profile.coins += TUNING.coins.perLevelUp;
		const field = game.field;
		if (field) {
			field.coinsEarned += TUNING.coins.perLevelUp;
		}
		banners.Show('LEVEL UP', `SWEEPER RANK ${profile.level}`, '+1 SKILL POINT · +100 SWEEP COINS');
		soundEffects.LevelUp();
		if (field) {
			voices.Bark('s_level', 'slevel', 30);
			// Every second level is a new battle-pass season tier
			if ((profile.level - 1) % 2 === 0) {
				game.Schedule(1.6, () => voices.Bark('s_season', 'sseason', 25));
			}
			killFeed.Add(`<b>LEVEL ${profile.level}</b> · ${RankTitle(profile.level)}`, 'gold');
		}
	}
}


export const progression = new Progression();
