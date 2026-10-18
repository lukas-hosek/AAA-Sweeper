/**
 * mission.js: starting a chapter, and the per-frame simulation while it is played.
 */
import {audioEngine} from '../audio/audio-engine.js';
import {chatter} from '../audio/chatter-scheduler.js';
import {music} from '../audio/music-sequencer.js';
import {soundEffects} from '../audio/sound-effects.js';
import {voiceBank} from '../audio/voice-bank.js';
import {voices} from '../audio/voice-manager.js';
import {FindElement} from '../core/dom.js';
import {profile} from '../core/player-profile.js';
import {random} from '../core/random.js';
import {settings} from '../core/settings.js';
import {NowSeconds} from '../core/time.js';
import {CHAPTER_CHATTER} from '../data/chatter.js';
import {DIFFICULTIES} from '../data/difficulties.js';
import {TUNING} from '../data/tuning.js';
import {VOICE_LINES} from '../data/voice-manifest.js';
import {blood} from '../render/blood-overlay.js';
import {camera} from '../render/camera.js';
import {layout} from '../render/layout.js';
import {particles} from '../render/particles.js';
import {sprites} from '../render/sprite-cache.js';
import {hud} from '../ui/hud.js';
import {killFeed} from '../ui/kill-feed.js';
import {screens} from '../ui/screen-manager.js';
import {CHAPTERS, ChapterForNumber} from './chapters.js';
import {clubNight} from './events/club-night.js';
import {fieldEvents} from './events/field-events.js';
import {supplyDrop} from './events/supply-drop.js';
import {flood} from './flood-controller.js';
import {game} from './game.js';
import {TILE} from './minefield.js';
import {progression} from './progression.js';


const CHAPTER_CARD_MS = 3600;                // How long the chapter title card stays up
const SCREEN_SHAKE_DECAY = 45;               // Per second
const DAMAGE_FLASH_DECAY = 2.2;              // Per second
const CRATER_SMOKE_INTERVAL = 0.22;          // Seconds between smoke puffs from the craters
const MAX_SMOKING_CRATERS = 12;              // Only the first few craters smoke, to bound the particle count


/**
 * A mission is one chapter being played. Start() sets up the screen, the field and the audio behind a fade;
 * Update() advances everything that runs on the field clock, in a fixed order, every frame.
 */
export class Mission {
	/** Starts field `fieldNumber` (1-based; past the last chapter is New Game+). `isQuick` shortens the fade-out. */
	async Start(difficultyKey, isQuick, fieldNumber = 1) {
		await screens.FadeTo(1, isQuick ? 400 : 600);
		screens.CloseOverlays();
		voices.StopAll();
		audioEngine.Unmuffle();
		const field = game.BeginField(difficultyKey, ChapterForNumber(fieldNumber), fieldNumber);
		const chapter = field.chapter;
		chatter.BeginChapter(chapter.id);
		voices.ResetForChapter();
		if (fieldNumber === 1 || !chatter.hasSharedLines) {
			chatter.ShuffleSharedLines();
		}
		blood.Clear();
		this.#ResetGameScreen(field);
		if (chapter.isClub) {
			// In the club chapter, Big Dez's side quest is already done: you're in da club
			field.clubVisited = true;
			field.sideQuests.push('club');
			field.trackedSideQuest = 'club';
		}
		screens.Show('game');
		layout.Apply();
		hud.Refresh();
		music.Start(chapter.musicTheme);
		// The tile numbers use Teko: rebuild the sprites once it has loaded, in case it wasn't yet
		if (document.fonts && document.fonts.load) {
			document.fonts.load('600 40px Teko').then(() => {
				if (game.field) {
					sprites.Build();
				}
			}, () => {});
		}
		const chatterLines = CHAPTER_CHATTER[chapter.id].openingLines;
		const firstLines = [chapter.announcerLine, chapter.openingLine, ...chatterLines, ...chapter.victoryLines];
		voiceBank.Predecode(firstLines).then(() => {
			if (game.field && !chatter.queuedLine) {
				chatter.queuedLine = chatter.NextLine();
				voiceBank.Decode(chatter.queuedLine);
			}
		});
		await screens.FadeTo(0, 900);
		if (game.field !== field) {
			return;    // Left or restarted during the fade
		}
		this.#ShowChapterCard(field);
		game.Schedule(0.4, () => voices.Say(chapter.announcerLine));
		game.Schedule(3.3, () => voices.Bark(chapter.openingLine, 'start', 0, {}));
	}


	/** Advances the current field by one frame. The order matters for the golden tests: it fixes the random draws. */
	Update(time, deltaTime) {
		const field = game.field;
		if (!field) {
			return;
		}
		this.#UpdateRevealEffects(field);
		field.screenShake = Math.max(0, field.screenShake - deltaTime * SCREEN_SHAKE_DECAY);
		field.damageFlash = Math.max(0, field.damageFlash - deltaTime * DAMAGE_FLASH_DECAY);
		if (field.isPaused) {
			hud.UpdateFrame();
			return;
		}
		field.clock += deltaTime;
		if (field.minesPlanted && !field.isOver && !field.isDead) {
			field.missionSeconds += deltaTime;
		}
		this.#RunScheduled(field);
		this.#UpdateHealth(field, deltaTime);
		this.#PlayDueChatter(field);
		fieldEvents.Update(field);
		supplyDrop.Update(field);
		flood.Update(field, deltaTime);
		clubNight.Update(field, deltaTime);
		this.#EmitCraterSmoke(field);
		FindElement('#respects-button').hidden = !(field.clock < field.respectsPromptUntil);
		hud.UpdateFrame();
	}


	/** Clears what the previous field left on screen and sets up the HUD for this chapter. */
	#ResetGameScreen(field) {
		const chapter = field.chapter;
		killFeed.Clear();
		FindElement('#subtitles').innerHTML = '';
		FindElement('#game').className = 'screen' + (chapter.screenClass ? ' ' + chapter.screenClass : '');
		FindElement('#letterbox').classList.remove('is-active');
		const radioPanelElement = FindElement('#radio-panel');
		radioPanelElement.hidden = true;
		radioPanelElement.classList.remove('is-active');
		FindElement('#tip-box').hidden = true;
		FindElement('#autosave-indicator').hidden = true;
		FindElement('#respects-button').hidden = true;
		FindElement('#blood-canvas').style.opacity = '0';
		FindElement('#film-grain').classList.toggle('is-off', !settings.filmGrain);
		particles.Clear();
		FindElement('#minimap-label').textContent = chapter.name.toUpperCase();
		FindElement('#quest-title').textContent = chapter.operation;
	}


	/** The big chapter title card, with a New Game+ mark from the second time round. */
	#ShowChapterCard(field) {
		const chapter = field.chapter;
		const newGamePlusLevel = Math.floor((field.fieldNumber - 1) / CHAPTERS.length);
		const card = FindElement('#chapter-card');
		const difficulty = DIFFICULTIES[field.difficultyKey].label.toUpperCase();
		const newGamePlus = newGamePlusLevel ? ` · NEW GAME${'+'.repeat(newGamePlusLevel)}` : '';
		card.querySelector('.chapter-kicker').textContent = chapter.chapterLabel + newGamePlus;
		card.querySelector('.chapter-title').textContent = chapter.name.toUpperCase();
		card.querySelector('.chapter-subtitle').textContent = `${chapter.localTime} · ${difficulty} · ${chapter.operation.toUpperCase()}`;
		card.classList.add('is-active');
		setTimeout(() => card.classList.remove('is-active'), CHAPTER_CARD_MS);
	}


	/** Revealed tiles kick up dust once their ripple-delayed reveal shows, and give up any lore hidden under them. */
	#UpdateRevealEffects(field) {
		if (!field.revealEffects.length) {
			return;
		}
		const now = NowSeconds();
		const tileSize = layout.board.tileSize;
		const waiting = [];
		for (const effect of field.revealEffects) {
			if (now < effect.time) {
				waiting.push(effect);
				continue;
			}
			const center = camera.TileCenter(effect.tile);
			for (let k = 0; k < 2; k++) {
				particles.Emit({
					type: 'dust',
					x: center.x + random.Range(-tileSize * 0.4, tileSize * 0.4),
					y: center.y + random.Range(-tileSize * 0.4, tileSize * 0.4),
					velocityX: random.Range(-20, 20),
					velocityY: random.Range(-50, -15),
					gravity: -10,
					drag: 1,
					life: random.Range(0.3, 0.7),
					size: random.Range(1, 2.2),
				});
			}
			if (field.loreTiles.has(effect.tile)) {
				progression.CollectLore(effect.tile);
			}
		}
		field.revealEffects = waiting;
	}


	/** Runs the callbacks whose time has come (newest first). A failing callback is reported but doesn't stop the frame. */
	#RunScheduled(field) {
		for (let k = field.scheduled.length - 1; k >= 0; k--) {
			const entry = field.scheduled[k];
			if (entry.time <= field.clock) {
				field.scheduled.splice(k, 1);
				try {
					entry.callback();
				} catch (error) {
					console.error(error);
				}
			}
		}
	}


	/** Regeneration after a short delay, the trailing damage bar, and the low-health heartbeat and warning. */
	#UpdateHealth(field, deltaTime) {
		const health = TUNING.health;
		const regenDelay = profile.perks.wind ? health.secondWindRegenDelay : health.regenDelay;
		if (!field.isDead && field.clock - field.lastHitTime > regenDelay && field.health < 100) {
			field.health = Math.min(100, field.health + health.regenPerSecond * deltaTime);
		}
		if (field.healthTrail > field.health) {
			if (field.clock - field.lastHitTime > health.trailDelay) {
				field.healthTrail = Math.max(field.health, field.healthTrail - health.trailDrainPerSecond * deltaTime);
			}
		} else {
			field.healthTrail = field.health;
		}
		const isLow = field.health < health.lowThreshold && !field.isOver && !field.isDead;
		FindElement('#game').classList.toggle('is-low-health', isLow);
		if (isLow) {
			if (field.clock >= field.nextHeartbeatTime) {
				soundEffects.Heartbeat();
				field.nextHeartbeatTime = field.clock + health.heartbeatInterval;
			}
			if (!field.lowHealthWarned) {
				field.lowHealthWarned = true;
				voices.Say('s_crit');
				game.Schedule(1.7, () => voices.Bark('j_low', 'jlow', 25, {}));
			}
		} else if (field.health > health.lowWarningResetAbove) {
			field.lowHealthWarned = false;
		}
	}


	/** Plays the next ambient radio line when it is due and the radio is free, and decodes the one after it. */
	#PlayDueChatter(field) {
		const canChatter = !field.isOver && !field.isDead && settings.chatter !== 'off' && !voices.ActiveRadioVoices().length;
		if (!canChatter || field.clock < chatter.nextTime) {
			return;
		}
		const voiceId = chatter.queuedLine || chatter.NextLine();
		chatter.queuedLine = null;
		if (voiceId && VOICE_LINES[voiceId] && voices.Bark(voiceId, null, 0, {isChatter: true})) {
			chatter.nextTime = field.clock + TUNING.chatter.interval;
			chatter.queuedLine = chatter.NextLine();
			voiceBank.Decode(chatter.queuedLine);
		} else {
			chatter.nextTime = field.clock + TUNING.chatter.retryAfter;
		}
	}


	/** Smoke rising from the craters, a puff from about every other one each interval. */
	#EmitCraterSmoke(field) {
		if (field.clock < field.nextCraterSmokeTime) {
			return;
		}
		field.nextCraterSmokeTime = field.clock + CRATER_SMOKE_INTERVAL;
		const tileSize = layout.board.tileSize;
		let craters = 0;
		for (let i = 0; i < field.tileCount && craters < MAX_SMOKING_CRATERS; i++) {
			if (field.tileStates[i] !== TILE.EXPLODED) {
				continue;
			}
			craters++;
			if (random.Next() < 0.5) {
				const center = camera.TileCenter(i);
				particles.Emit({
					type: 'smoke',
					x: center.x + random.Range(-3, 3),
					y: center.y,
					velocityX: random.Range(-6, 6),
					velocityY: -random.Range(14, 30),
					gravity: -4,
					drag: 0.3,
					life: random.Range(1.5, 2.6),
					size: tileSize * 0.18,
					color: 45,
				});
			}
		}
	}
}


export const mission = new Mission();
