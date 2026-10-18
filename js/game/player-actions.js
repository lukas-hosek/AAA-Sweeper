/**
 * player-actions.js: what the player does to the board: reveal, chord, flag, and stepping on mines.
 */
import {audioEngine} from '../audio/audio-engine.js';
import {soundEffects} from '../audio/sound-effects.js';
import {voices} from '../audio/voice-manager.js';
import {profile} from '../core/player-profile.js';
import {random} from '../core/random.js';
import {TUNING} from '../data/tuning.js';
import {blood} from '../render/blood-overlay.js';
import {camera} from '../render/camera.js';
import {layout} from '../render/layout.js';
import {particles} from '../render/particles.js';
import {achievements} from '../ui/achievements.js';
import {banners} from '../ui/banners.js';
import {callouts} from '../ui/callouts.js';
import {hud} from '../ui/hud.js';
import {killFeed} from '../ui/kill-feed.js';
import {toasts} from '../ui/toasts.js';
import {supplyDrop} from './events/supply-drop.js';
import {game} from './game.js';
import {TILE} from './minefield.js';
import {missionOutcome} from './mission-outcome.js';
import {progression} from './progression.js';


// Names of multi-tile reveals, biggest first: [minimum tiles, name]. Two to four tiles have their own names below.
const BIG_REVEAL_NAMES = [[60, 'SWEEPOCALYPSE'], [30, 'SWEEPTACULAR'], [15, 'MEGA SWEEP'], [5, 'MULTI-REVEAL']];
const SMALL_REVEAL_NAMES = {2: 'DOUBLE REVEAL', 3: 'TRIPLE REVEAL', 4: 'QUAD REVEAL'};
const FLAG_BARKS = ['r_flag', 'r_flag2', 'r_flag3'];
const HIT_BARKS = ['r_hit1', 'r_hit2', 'r_hit3', 'r_hit4', 'r_hit5', 'j_hit'];
const AREA_CLEARED_BARKS = ['r_area', 'r_area2', 'j_area'];


/**
 * The Minesweeper moves plus their AAA consequences: XP pop-ups, combos, kill-feed lines, barks, achievements,
 * damage. The rules themselves (planting, flood fill, chording) are in Minefield. After every action the quest
 * marker moves on if needed and the win is checked.
 */
export class PlayerActions {
	/** True while the board takes input: a field is running and isn't over, paused or between death and respawn. */
	get canAct() {
		const field = game.field;
		return Boolean(field) && !field.isOver && !field.isDead && !field.isPaused;
	}


	/** Reveals a tile (primary click). Plants the mines on the first one. Open tiles chord; the crate opens. */
	Reveal(tileIndex) {
		const field = game.field;
		if (!this.canAct || tileIndex < 0) {
			return;
		}
		if (field.supplyCrate && field.supplyCrate.hasLanded && field.supplyCrate.tile === tileIndex) {
			supplyDrop.Open();
			return;
		}
		const state = field.tileStates[tileIndex];
		if (state === TILE.FLAGGED || state === TILE.EXPLODED) {
			soundEffects.Denied();
			return;
		}
		if (state === TILE.OPEN) {
			this.Chord(tileIndex);
			return;
		}
		const wasTarget = tileIndex === field.questTarget;
		const hadTarget = field.questTarget >= 0;
		if (!field.minesPlanted) {
			field.PlantMines(tileIndex);
		}
		field.lastClickedTile = tileIndex;
		achievements.Unlock('first');
		if (field.isMine[tileIndex]) {
			this.#Detonate(tileIndex);
		} else {
			const opened = field.FloodOpen(tileIndex).map(entry => entry.tile);
			this.#OnTilesOpened(opened, tileIndex, wasTarget, hadTarget, false);
		}
		this.#AfterAction();
	}


	/** Chords an open number whose flags (and craters) match it: reveals all its other hidden neighbours. */
	Chord(tileIndex) {
		const field = game.field;
		const targets = field.ChordTargets(tileIndex);
		if (!targets) {
			soundEffects.Denied();
			return;
		}
		let opened = [];
		for (const target of targets) {
			// An earlier flood fill in this chord may have opened it already
			if (field.tileStates[target] !== TILE.HIDDEN) {
				continue;
			}
			if (field.isMine[target]) {
				this.#Detonate(target);
				if (field.isDead) {
					break;
				}
			} else {
				opened = opened.concat(field.FloodOpen(target).map(entry => entry.tile));
			}
		}
		field.lastClickedTile = tileIndex;
		if (opened.length) {
			this.#OnTilesOpened(opened, tileIndex, false, true, true);
		}
		this.#AfterAction();
	}


	/** Flags or unflags a hidden tile (secondary click, long press, flag mode). On an open number it chords. */
	Flag(tileIndex) {
		const field = game.field;
		if (!this.canAct || tileIndex < 0) {
			return;
		}
		const state = field.tileStates[tileIndex];
		if (state === TILE.HIDDEN) {
			this.#PlantFlag(tileIndex);
		} else if (state === TILE.FLAGGED) {
			field.tileStates[tileIndex] = TILE.HIDDEN;
			field.flagCount--;
			soundEffects.Unflag();
		} else if (state === TILE.OPEN) {
			this.Chord(tileIndex);
			return;
		}
		this.#AfterAction();
	}


	/** Press F. Better right after a mine hit, when the prompt is showing; it counts either way. */
	PayRespects() {
		const field = game.field;
		if (!field || field.isOver) {
			return;
		}
		field.respectsPaid++;
		soundEffects.Respects();
		achievements.Unlock('respects');
		const hadPrompt = field.clock < field.respectsPromptUntil;
		field.respectsPromptUntil = 0;
		callouts.ShowCombo(hadPrompt ? 'RESPECTS PAID' : 'RESPECTS PAID TO NO ONE', field.respectsPaid);
		killFeed.Add('SWEEPER <span style="color:#c9c9d6">F</span> PAID RESPECTS <em>+1 RESPECT</em>');
	}


	/** Puts a flag on a hidden tile, with a puff of dust, XP the first time on this tile, and a radio comment. */
	#PlantFlag(tileIndex) {
		const field = game.field;
		const tileSize = layout.board.tileSize;
		field.tileStates[tileIndex] = TILE.FLAGGED;
		field.flagCount++;
		soundEffects.Flag();
		if (profile.equippedSkin === 'tune') {
			soundEffects.FlagTune();
		}
		const position = camera.TileToScreen(tileIndex);
		for (let k = 0; k < 8; k++) {
			particles.Emit({
				type: 'dust',
				x: position.x - camera.x,
				y: position.y - camera.y + tileSize * 0.3,
				velocityX: random.Range(-60, 60),
				velocityY: random.Range(-50, -10),
				gravity: 120,
				drag: 2,
				life: random.Range(0.3, 0.6),
				size: random.Range(1, 2),
				color: '255,200,170',
			});
		}
		if (!field.everFlagged[tileIndex]) {
			field.everFlagged[tileIndex] = 1;
			const xp = progression.GainXP(TUNING.xp.firstFlagOnTile);
			callouts.PopAt(position.x, position.y - tileSize * 0.3, `+${xp} XP`);
		}
		killFeed.Add(`SWEEPER <span style="color:#ff6b6b">⚑</span> FLAGGED ${field.TileLabel(tileIndex)}`);
		if (field.flagCount === 1) {
			voices.Bark(random.Pick(FLAG_BARKS), 'flag', 40, {});
		} else if (random.Next() < 0.22) {
			voices.Bark(random.Pick(FLAG_BARKS), 'flag', 40, {isChatter: true});
		}
	}


	/** Rewards opening `opened` tiles from a click (or chord) on `tileIndex`: XP, quest marker, combos, barks. */
	#OnTilesOpened(opened, tileIndex, wasTarget, hadTarget, isChord) {
		const field = game.field;
		const count = opened.length;
		if (!count) {
			return;
		}
		soundEffects.Reveal(count);
		const position = camera.TileToScreen(tileIndex);
		const xp = progression.GainXP(TUNING.xp.perRevealedTile * count + (isChord ? TUNING.xp.chordBonus : 0));
		callouts.PopAt(position.x, position.y - layout.board.tileSize * 0.3, `+${xp} XP`, count >= 10 ? 'big' : '');
		if (wasTarget) {
			field.markersFollowed++;
			progression.GainXP(TUNING.xp.questMarker);
			killFeed.Add('<b>OBJECTIVE COMPLETE</b> · Click the next glowing tile', 'gold');
			if (field.markersFollowed === 10) {
				achievements.Unlock('follow');
			}
			if (random.Next() < 0.25) {
				voices.Bark('s_obj', 'sobj', 45);
			}
		} else if (hadTarget && !isChord && field.openedCount > count) {
			// The marker was showing and the player clicked somewhere else (the very first click doesn't count)
			field.markersIgnored++;
			achievements.Unlock('rebel');
		}
		if (count >= 2) {
			callouts.ShowCombo(this.#RevealName(count), count);
		}
		if (count >= TUNING.xp.areaClearedTiles) {
			achievements.Unlock('cascade');
			banners.Show('AREA CLEARED', `${count} TILES SECURED`, '+250 XP');
			progression.GainXP(TUNING.xp.areaCleared);
			voices.Bark(random.Pick(AREA_CLEARED_BARKS), 'area', 25, {});
		} else if (count <= 2 && random.Next() < 0.14) {
			voices.Bark('j_1', 'j1', 40, {isChatter: true});
		}
		if (field.openedCount >= 10) {
			achievements.Unlock('ten');
		}
		if (field.openedCount >= TUNING.coins.dailyChallengeTiles && !field.dailyChallengeDone) {
			field.dailyChallengeDone = true;
			profile.coins += TUNING.coins.dailyChallenge;
			field.coinsEarned += TUNING.coins.dailyChallenge;
			toasts.Show({
				kicker: 'DAILY CHALLENGE COMPLETE',
				title: 'Reveal 50 tiles',
				description: '+100 Sweep Coins',
				isReward: true,
				icon: '✓',
			});
			game.Schedule(0.8, () => voices.Bark('s_chal', 'schal', 60));
		}
		const verb = isChord ? 'CHORDED' : 'REVEALED';
		const multiplier = count > 1 ? ` ×${count}` : '';
		killFeed.Add(`SWEEPER <span style="color:#8fd3ff">▸</span> ${verb} ${field.TileLabel(tileIndex)}${multiplier}<em>+${xp}</em>`);
	}


	/** The combo name for revealing `count` tiles at once (2 or more). */
	#RevealName(count) {
		for (const [minimum, name] of BIG_REVEAL_NAMES) {
			if (count >= minimum) {
				return name;
			}
		}
		return SMALL_REVEAL_NAMES[count];
	}


	/** Stepped on a mine: crater, explosion, blood, shell shock and damage. Dies at zero health, otherwise a bark. */
	#Detonate(tileIndex) {
		const field = game.field;
		field.tileStates[tileIndex] = TILE.EXPLODED;
		field.mineHits++;
		const position = camera.TileToScreen(tileIndex);
		particles.Explode(position.x - camera.x, position.y - camera.y);
		soundEffects.Explosion();
		blood.Hit(position.x, position.y);
		audioEngine.Shellshock();
		const health = TUNING.health;
		const damage = Math.round(health.mineDamage * (profile.perks.thick ? health.thickSkinDamageFactor : 1));
		field.health -= damage;
		field.lastHitTime = field.clock;
		field.damageFlash = 1;
		callouts.PopAt(position.x, position.y, `−${damage} HP`, 'negative');
		killFeed.Add(`SWEEPER <span style="color:#ff9a3c">✸</span> MINE AT ${field.TileLabel(tileIndex)}<em class="is-negative">−${damage} HP</em>`);
		achievements.Unlock('ouch');
		field.respectsPromptUntil = field.clock + health.respectsPromptDuration;
		// Mom heard that. She calls, once, a little later
		if (!field.momHeardExplosion) {
			field.momHeardExplosion = true;
			game.Schedule(10, () => voices.Bark('m_4', 'm4', 999, {}));
		}
		if (field.health <= 0) {
			field.health = 0;
			missionOutcome.Die();
			return;
		}
		game.Schedule(0.35, () => voices.Bark(random.Pick(HIT_BARKS), 'hit', 7, {}));
	}


	/** Bookkeeping after every reveal, chord or flag: idle timer, quest marker, win check, HUD. */
	#AfterAction() {
		const field = game.field;
		if (!field) {
			return;
		}
		field.lastActionTime = field.clock;
		field.idleStage = 0;
		this.#MoveQuestMarker(field);
		if (field.IsCleared() && !field.isWon) {
			missionOutcome.Win();
		}
		hud.Refresh();
	}


	/** Keeps the quest marker on a hidden safe tile: if its tile was opened (or flagged), it moves to the nearest one. */
	#MoveQuestMarker(field) {
		if (!field.minesPlanted || field.isOver || field.IsHiddenSafe(field.questTarget)) {
			return;
		}
		field.questTarget = field.NearestSafeTile(field.lastClickedTile >= 0 ? field.lastClickedTile : 0);
	}
}


export const playerActions = new PlayerActions();
