/**
 * supply-drop.js: supply crates that fall onto open tiles and hold coins and loot.
 */
import {soundEffects} from '../../audio/sound-effects.js';
import {voices} from '../../audio/voice-manager.js';
import {FULL_TURN} from '../../core/math.js';
import {profile} from '../../core/player-profile.js';
import {random} from '../../core/random.js';
import {NowSeconds} from '../../core/time.js';
import {LOOT_TABLE} from '../../data/store.js';
import {TUNING} from '../../data/tuning.js';
import {camera} from '../../render/camera.js';
import {layout} from '../../render/layout.js';
import {particles} from '../../render/particles.js';
import {achievements} from '../../ui/achievements.js';
import {banners} from '../../ui/banners.js';
import {callouts} from '../../ui/callouts.js';
import {hud} from '../../ui/hud.js';
import {killFeed} from '../../ui/kill-feed.js';
import {game} from '../game.js';
import {TILE} from '../minefield.js';


// Chance of rolling each LOOT_TABLE entry or a more common one: 35 %, 25 %, 20 %, 12 %, 6 % and 2 %
const LOOT_CUMULATIVE_CHANCES = [0.35, 0.6, 0.8, 0.92, 0.98, 1];


/**
 * Every minute or so a crate is announced, falls onto a random open tile and lands with a thud. Clicking it pays out
 * coins and a loot item (which can't be used). Left alone, it is "looted by another player" in a single-player game.
 */
export class SupplyDrop {
	/** Drops a crate when one is due, lands a falling crate, and expires an ignored one. Called every unpaused frame. */
	Update(field) {
		const isDue = field.minesPlanted && !field.isOver && !field.supplyCrate && field.clock >= field.nextCrateTime;
		if (isDue) {
			this.#Drop(field);
		}
		const crate = field.supplyCrate;
		if (!crate) {
			return;
		}
		const age = field.clock - crate.spawnTime;
		if (!crate.hasLanded && age > TUNING.supplyDrop.fallDuration) {
			this.#Land(crate);
		}
		if (age > TUNING.supplyDrop.lifetime) {
			field.supplyCrate = null;
			field.nextCrateTime = field.clock + TUNING.supplyDrop.respawnAfterExpiry * this.#RespawnFactor();
			killFeed.Add('Supply drop was looted by another player. (This is a single-player game.)');
		}
	}


	/** Opens the landed crate (the player clicked its tile): sparkles, coins and a loot roll. */
	Open() {
		const field = game.field;
		const crate = field.supplyCrate;
		field.supplyCrate = null;
		field.nextCrateTime = field.clock + TUNING.supplyDrop.respawnAfterOpening * this.#RespawnFactor();
		const position = camera.TileToScreen(crate.tile);
		soundEffects.CrateThud();
		soundEffects.Coin();
		for (let k = 0; k < 30; k++) {
			const angle = random.Range(0, FULL_TURN);
			const speed = random.Range(60, 220);
			particles.Emit({
				type: 'glint',
				x: position.x - camera.x,
				y: position.y - camera.y,
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed - 60,
				gravity: 120,
				drag: 1.5,
				life: random.Range(0.5, 1),
				size: random.Range(2, 4),
			});
		}
		const coins = Math.round(random.Range(TUNING.coins.crateMinimum, TUNING.coins.crateMaximum));
		profile.coins += coins;
		field.coinsEarned += coins;
		callouts.PopAt(position.x, position.y - layout.board.tileSize * 0.4, `+${coins} COINS`, 'big');
		this.RollLoot();
		achievements.Unlock('crate');
		profile.Save();
		hud.Refresh();
	}


	/** Rolls a loot item and announces it. Also bought as loot boxes in the store. */
	RollLoot() {
		const roll = random.Next();
		const item = LOOT_TABLE[LOOT_CUMULATIVE_CHANCES.findIndex(chance => roll < chance)];
		banners.Show(item.rarity.toUpperCase() + ' ITEM', item.name, 'Equip it in a menu that does not exist yet', item.color);
	}


	/** Announces a crate over a random open tile, or tries again soon if too few tiles are open yet. */
	#Drop(field) {
		const now = NowSeconds();
		const landingTiles = [];
		for (let i = 0; i < field.tileCount; i++) {
			// Only tiles whose reveal animation has finished
			if (field.tileStates[i] === TILE.OPEN && now > field.revealTimes[i]) {
				landingTiles.push(i);
			}
		}
		if (landingTiles.length < TUNING.supplyDrop.minimumOpenTiles) {
			field.nextCrateTime = field.clock + TUNING.supplyDrop.retryAfter;
			return;
		}
		field.supplyCrate = {tile: random.Pick(landingTiles), spawnTime: field.clock, hasLanded: false};
		voices.Bark('s_drop', 'sdrop', 40);
		banners.Show('SUPPLY DROP INCOMING', 'Marked on your minimap', 'Click the crate to open it', '#6fb6ff');
		soundEffects.Whoosh();
	}


	/** The crate hits the ground: a thud and a cloud of dust. */
	#Land(crate) {
		crate.hasLanded = true;
		soundEffects.CrateThud();
		const position = camera.TileToScreen(crate.tile);
		const tileSize = layout.board.tileSize;
		for (let k = 0; k < 14; k++) {
			particles.Emit({
				type: 'dust',
				x: position.x - camera.x + random.Range(-tileSize * 0.5, tileSize * 0.5),
				y: position.y - camera.y + tileSize * 0.3,
				velocityX: random.Range(-80, 80),
				velocityY: random.Range(-40, -5),
				gravity: 60,
				drag: 2,
				life: random.Range(0.4, 0.8),
				size: random.Range(1.5, 3),
				color: '210,200,180',
			});
		}
	}


	/** Perk "Lucky Find" makes crates come back sooner. */
	#RespawnFactor() {
		return profile.perks.lucky ? TUNING.supplyDrop.luckyFactor : 1;
	}
}


export const supplyDrop = new SupplyDrop();
