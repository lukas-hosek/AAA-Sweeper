/**
 * field.js: one run of one chapter: the minefield plus all the AAA state around it.
 */
import {random} from '../core/random.js';
import {NowSeconds} from '../core/time.js';
import {DIFFICULTIES} from '../data/difficulties.js';
import {TUNING} from '../data/tuning.js';
import {Minefield} from './minefield.js';


const REVEAL_RIPPLE_SECONDS = 0.017;    // Delay per flood-fill step, so big reveals ripple outwards


/**
 * The board of the chapter being played, with health, timers, quest marker, side quests, supply crate,
 * club and flood state. Created by Game.BeginField() and dropped when the player leaves the chapter.
 * It doesn't import the chapter registry (see chapters.js): the chapter is handed in.
 * Times are on `clock`: seconds of unpaused game time since the field started.
 */
export class Field extends Minefield {
	// --- Chapter
	difficultyKey;                // story | normal | veteran
	fieldNumber;                  // 1-based; above the chapter count means New Game+
	chapter;                      // The Chapter being played (they repeat for New Game+)

	// --- Flow
	isOver = false;               // Cleared: no more input
	isWon = false;
	isDead = false;               // Between death and checkpoint restore
	isPaused = false;
	clock = 0;                    // Seconds of unpaused game time
	missionSeconds = 0;           // The mission timer: runs from the first click until the field is over
	scheduled = [];               // Callbacks waiting for a clock time: {time, callback}

	// --- Player
	health = 100;                 // 0..100, regenerates a few seconds after the last hit
	healthTrail = 100;            // The red bar that follows health down with a delay
	lastHitTime = -99;            // Clock time of the last mine hit
	damageFlash = 0;              // 1 right after a hit, fades to 0
	mineHits = 0;
	deaths = 0;
	everFlagged;                  // Uint8Array: 1 for tiles flagged at least once (flag XP is paid only once)

	// --- Quest marker and statistics
	questTarget;                  // Tile the quest marker points at (always hidden and safe), or -1
	lastClickedTile = -1;
	markersFollowed = 0;          // Reveals of the marked tile
	markersIgnored = 0;           // Reveals elsewhere while a marker was showing
	respectsPaid = 0;
	respectsPromptUntil = 0;      // The "Press F" prompt shows until this clock time
	transmissionsHeard = 0;       // Radio lines played
	xpEarned = 0;
	coinsEarned = 0;
	dailyChallengeDone = false;   // The fake daily challenge (reveal 50 tiles) paid out

	// --- Lore
	loreTiles = new Set();        // Safe tiles hiding a lore fragment
	loreFoundHere = 0;            // Fragments found in this field

	// --- Pointer and keyboard
	hoveredTile = -1;
	pressedTile = -1;             // Tile drawn pressed while the mouse button is down on it
	keyboardCursorTile = -1;      // Tile of the keyboard cursor, -1 until the keyboard is used
	pointerX = -1;                // Last pointer position in CSS pixels
	pointerY = -1;
	pointerInCanvas = false;
	pointerIsTouch = false;

	// --- Reveal effects
	revealTimes;                  // Float64Array: NowSeconds() time each tile was (or will appear) revealed
	revealEffects = [];           // Tiles waiting for their ripple-delayed dust: {tile, time}
	screenShake = 0;

	// --- Timed events (clock times)
	nextTipTime = TUNING.tips.firstAfter;
	tipsShown = 0;
	nextAutosaveTime = TUNING.autosave.firstAfter;
	nextCrateTime = TUNING.supplyDrop.firstAfter;
	supplyCrate = null;           // The supply drop on the board: {tile, spawnTime, hasLanded}, or null
	nextHeartbeatTime = 0;        // Low-health heartbeat sound
	nextSkillNagTime = TUNING.skillNag.firstAfter;    // Reminder about unspent skill points
	nextCraterSmokeTime = 0;
	lastActionTime = 0;           // Last reveal or flag, for the idle barks
	idleStage = 0;                // 0, then 1 after the first idle bark, 2 after the idle achievement

	// --- One-off barks and events
	halfwayAnnounced = false;
	lowHealthWarned = false;
	momHeardExplosion = false;    // Mom calls once, a while after the first explosion
	clubSecondsLeft = 0;          // The club event is running while this is above 0
	clubVisited = false;          // The club came (or the chapter is the club)
	sideQuests = [];              // Ids of the side quests handed out in this field
	trackedSideQuest = null;      // Id of the side quest shown in the HUD

	// --- Pathos-4 flood
	floodStartTime = TUNING.flood.countdownStartsAt;  // Clock time the flood countdown starts
	floodDuration;                // Seconds from the start of the countdown until the base floods
	floodProgress = 0;            // 0..1 of the countdown
	isFlooded = false;
	breathLog10 = 2;              // Remaining breath as log10 of the percentage: 2 = 100 %
	lastCountdownSecond = -1;     // Countdown tick sound: one per second in the last ten
	nextBubbleTime = 0;
	floodWarningGiven = false;    // The 30-seconds warning
	breachAnnounced = false;


	constructor(difficultyKey, chapter, fieldNumber) {
		const difficulty = DIFFICULTIES[difficultyKey];
		super(difficulty.columns, difficulty.rows, difficulty.mines);
		this.difficultyKey = difficultyKey;
		this.fieldNumber = fieldNumber;
		this.chapter = chapter;
		const floodDurations = TUNING.flood.durationByDifficulty;
		this.floodDuration = floodDurations[difficultyKey] || floodDurations.normal;
		this.everFlagged = new Uint8Array(this.tileCount);
		this.revealTimes = new Float64Array(this.tileCount);
		// Before the first click the marker points at the middle of the board
		this.questTarget = Math.floor(this.rows / 2) * this.columns + Math.floor(this.columns / 2);
	}


	/** Plants the mines (see Minefield), then hides lore fragments under a few safe tiles away from the first click. */
	PlantMines(safeTile) {
		const keptFree = super.PlantMines(safeTile);
		const candidates = [];
		for (let i = 0; i < this.tileCount; i++) {
			if (!this.isMine[i] && !keptFree.has(i)) {
				candidates.push(i);
			}
		}
		random.Shuffle(candidates);
		const loreCount = this.tileCount < 100 ? 3 : this.tileCount < 300 ? 5 : 6;
		for (let k = 0; k < loreCount && k < candidates.length; k++) {
			this.loreTiles.add(candidates[k]);
		}
		return keptFree;
	}


	/** Flood-opens like Minefield, and schedules each tile's reveal animation by its distance from the click. */
	FloodOpen(startTile) {
		const now = NowSeconds();
		const opened = super.FloodOpen(startTile);
		for (const {tile, distance} of opened) {
			const time = now + distance * REVEAL_RIPPLE_SECONDS;
			this.revealTimes[tile] = time;
			this.revealEffects.push({tile, time});
		}
		return opened;
	}


	/** Runs `callback` after `seconds` of game time (paused time does not count). */
	Schedule(seconds, callback) {
		this.scheduled.push({time: this.clock + seconds, callback});
	}
}
