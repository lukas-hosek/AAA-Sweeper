/**
 * tuning.js: the gameplay numbers in one place, so balancing doesn't mean hunting through the code.
 * Times are in seconds of game time (paused time doesn't count) unless the name says otherwise.
 */


export const TUNING = {
	health: {
		mineDamage: 60,                     // HP lost per mine (health is 0..100)
		thickSkinDamageFactor: 0.75,        // Perk "Thick Skin"
		regenDelay: 3,                      // Regeneration starts this long after the last hit
		secondWindRegenDelay: 1.5,          // ... or this long with the perk "Second Wind"
		regenPerSecond: 24,
		trailDelay: 0.6,                    // The red trail behind the health bar waits this long, then drains
		trailDrainPerSecond: 55,
		lowThreshold: 40,                   // Below this: heartbeat, red vignette and a warning
		lowWarningResetAbove: 75,           // The warning can play again once health is back above this
		heartbeatInterval: 0.85,
		respectsPromptDuration: 6,          // The "Press F" button shows this long after a hit
	},

	xp: {
		perRevealedTile: 10,
		chordBonus: 25,                     // Per chord that opens anything
		questMarker: 15,                    // Revealing the tile the marker points at
		firstFlagOnTile: 5,                 // Paid once per tile
		areaCleared: 250,                   // A single reveal of areaClearedTiles or more
		areaClearedTiles: 20,
		loreFragment: 50,
		clubArrival: 500,
		scholarFactor: 1.25,                // Perk "Mine Scholar"
		boostFactor: 2,                     // The XP boost from the store
		levelBase: 200,                     // XP needed to finish level L: levelBase + levelStep * L
		levelStep: 140,
	},

	coins: {
		perLevelUp: 100,
		dailyChallenge: 100,                // The "daily challenge": reveal dailyChallengeTiles in one field
		dailyChallengeTiles: 50,
		crateMinimum: 60,                   // A supply crate holds a random amount in this range
		crateMaximum: 180,
	},

	supplyDrop: {
		firstAfter: 40,
		retryAfter: 8,                      // Not enough open tiles to land on yet
		minimumOpenTiles: 3,
		fallDuration: 2,                    // From the announcement to the landing thud
		lifetime: 38,                       // Unopened crates are "looted by another player" after this
		respawnAfterExpiry: 60,
		respawnAfterOpening: 64,
		luckyFactor: 0.5,                   // Perk "Lucky Find" scales both respawn delays
	},

	club: {
		duration: 24,                       // How long the club stays once it has arrived
	},

	tips: {
		firstAfter: 5,
		quickCount: 3,                      // The first few tips come quickly ...
		quickInterval: 11,
		minimumInterval: 28,                // ... the rest at random intervals in this range
		maximumInterval: 44,
	},

	autosave: {
		firstAfter: 24,
		minimumInterval: 26,
		maximumInterval: 40,
	},

	idle: {
		barkAfter: 13,                      // Someone on the radio wonders if you're still there
		achievementAfter: 20,
	},

	chatter: {
		interval: 60,                       // Between ambient radio lines
		retryAfter: 1,                      // When the line wasn't ready or the radio was busy
	},

	skillNag: {
		firstAfter: 70,                     // While skill points are unspent
		interval: 80,
	},

	flood: {
		durationByDifficulty: {story: 90, normal: 210, veteran: 420},    // Countdown until Pathos-4 floods
		countdownStartsAt: 3,               // Clock time the countdown starts
		breachBarkAfter: 12,                // Seconds into the countdown
		warningBefore: 30,                  // Seconds left when the warning banner shows and bubbles start
		tickingBefore: 10,                  // Seconds left when the countdown ticks every second
		breathHalfLife: 40,                 // Underwater, remaining breath halves this often (and never runs out)
	},
};
