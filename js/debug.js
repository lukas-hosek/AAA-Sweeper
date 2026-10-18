/**
 * debug.js: test and tooling hooks, loaded only when the URL contains ?debug (see main.js).
 * Used by tools/browser/*.py (smoke test, golden comparison, screenshots) and tools/ost/*.py (soundtrack export).
 * Everything the tools need goes through window.testHooks and window.musicExporter, so the tools never touch internals.
 */
import {audioEngine} from './audio/audio-engine.js';
import {chatter} from './audio/chatter-scheduler.js';
import {music} from './audio/music-sequencer.js';
import {soundEffects} from './audio/sound-effects.js';
import {voiceBank} from './audio/voice-bank.js';
import {voices} from './audio/voice-manager.js';
import {FindElement} from './core/dom.js';
import {profile} from './core/player-profile.js';
import {VOICE_LINES} from './data/voice-manifest.js';
import {CHAPTERS} from './game/chapters.js';
import {clubNight} from './game/events/club-night.js';
import {game} from './game/game.js';
import {TILE} from './game/minefield.js';
import {mission} from './game/mission.js';
import {playerActions} from './game/player-actions.js';
import {progression} from './game/progression.js';
import {layout} from './render/layout.js';
import {creditsScene} from './scenes/credits/credits-scene.js';
import {introScene} from './scenes/intro-scene.js';
import {titleScene} from './scenes/title-scene.js';
import {panel} from './ui/panel/tabbed-panel.js';
import {pauseMenu} from './ui/pause-menu.js';
import {screens} from './ui/screen-manager.js';


const SAMPLE_RATE = 48000;                 // Offline renders run at 48 kHz, like the soundtrack export
const SOUND_EFFECT_SECONDS = 4;            // Long enough for the longest effect (the intro stings) to ring out


/** @type {Array<[string, () => void]>} Every sound effect in a fixed order, so golden fingerprints stay comparable */
const SOUND_EFFECTS = [
	['ui', () => soundEffects.MenuSelect()],
	['hover', () => soundEffects.MenuHover()],
	['reveal-1', () => soundEffects.Reveal(1)],
	['reveal-12', () => soundEffects.Reveal(12)],
	['flag', () => soundEffects.Flag()],
	['unflag', () => soundEffects.Unflag()],
	['denied', () => soundEffects.Denied()],
	['boom', () => soundEffects.Explosion()],
	['heart', () => soundEffects.Heartbeat()],
	['level', () => soundEffects.LevelUp()],
	['achievement', () => soundEffects.Achievement()],
	['coin', () => soundEffects.Coin()],
	['whoosh', () => soundEffects.Whoosh()],
	['quest', () => soundEffects.NewQuest()],
	['lore', () => soundEffects.LoreFound()],
	['respects', () => soundEffects.Respects()],
	['tune', () => soundEffects.FlagTune()],
	['ding', () => soundEffects.Ding()],
	['countdown-tick', () => soundEffects.CountdownTick()],
	['bubble', () => soundEffects.Bubbles()],
	['flood', () => soundEffects.Flood()],
	['crate', () => soundEffects.CrateThud()],
	['sting-engine', () => soundEffects.IntroSting('engine')],
	['sting-physics', () => soundEffects.IntroSting('physics')],
	['sting-blink', () => soundEffects.IntroSting('blink')],
	['sting-ice', () => soundEffects.IntroSting('ice')],
	['sting-megalith', () => soundEffects.IntroSting('megalith')],
];


// Overlay names used by the tools, mapped to their elements
const OVERLAY_SELECTORS = {pause: '#pause-menu', panel: '#panel', death: '#death-screen', results: '#results-screen'};


/** SHA-256 of the raw samples of every channel, as hex. Bit-identical audio gives an identical fingerprint. */
async function FingerprintAudioBuffer(audioBuffer) {
	const channelBytes = audioBuffer.length * 4;
	const allSamples = new Uint8Array(channelBytes * audioBuffer.numberOfChannels);
	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		const samples = audioBuffer.getChannelData(channel);
		allSamples.set(new Uint8Array(samples.buffer, samples.byteOffset, channelBytes), channel * channelBytes);
	}
	const digest = await crypto.subtle.digest('SHA-256', allSamples);
	return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}


/**
 * RMS loudness of every 20 ms window, per channel, rounded to 6 decimals.
 * Chromium's convolver reverb renders its tail on a background thread, so reverberant audio is not bit-identical
 * between runs; the golden comparison compares these envelopes with a small tolerance instead.
 */
function EnvelopeOfAudioBuffer(audioBuffer) {
	const windowLength = Math.round(audioBuffer.sampleRate * 0.02);
	const envelope = [];
	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		const samples = audioBuffer.getChannelData(channel);
		for (let start = 0; start < samples.length; start += windowLength) {
			let sumOfSquares = 0;
			const end = Math.min(samples.length, start + windowLength);
			for (let i = start; i < end; i++) {
				sumOfSquares += samples[i] * samples[i];
			}
			envelope.push(Math.round(Math.sqrt(sumOfSquares / (end - start)) * 1e6) / 1e6);
		}
	}
	return envelope;
}


/** Largest absolute sample over all channels. */
function PeakOfAudioBuffer(audioBuffer) {
	let peak = 0;
	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		for (const sample of audioBuffer.getChannelData(channel)) {
			peak = Math.max(peak, Math.abs(sample));
		}
	}
	return peak;
}


/** Offline music rendering: WAV downloads for the soundtrack export and fingerprints for the golden comparison. */
class MusicExporter {
	/**
	 * Renders one theme and triggers a download of `<theme>.wav` (24-bit stereo, peak-normalised to -1 dBFS).
	 * Returns {peak, gainDb, sec}.
	 */
	async Render(theme, stepCount, fadeSeconds = 10) {
		const audioBuffer = await this.#RenderTheme(theme, stepCount, fadeSeconds);
		const peak = PeakOfAudioBuffer(audioBuffer);
		const gain = peak > 0 ? Math.pow(10, -1 / 20) / peak : 1;
		this.#DownloadWav(audioBuffer, gain, theme + '.wav');
		return {peak, gainDb: 20 * Math.log10(gain), sec: audioBuffer.length / SAMPLE_RATE};
	}


	/** Renders `stepCount` steps of a theme without fade and returns {fingerprint, peak, envelope}. */
	async Fingerprint(theme, stepCount) {
		const audioBuffer = await this.#RenderTheme(theme, stepCount, 0);
		return {
			fingerprint: await FingerprintAudioBuffer(audioBuffer),
			peak: PeakOfAudioBuffer(audioBuffer),
			envelope: EnvelopeOfAudioBuffer(audioBuffer),
		};
	}


	/** Runs the game's own theme and instruments into an OfflineAudioContext. */
	async #RenderTheme(themeName, stepCount, fadeSeconds) {
		const theme = music.Theme(themeName);
		const stepSeconds = theme.stepSeconds;
		const musicSeconds = stepCount * stepSeconds;
		const totalSeconds = musicSeconds + fadeSeconds + 0.3;
		const offlineContext = new OfflineAudioContext(2, Math.ceil(totalSeconds * SAMPLE_RATE), SAMPLE_RATE);

		// In-game music volume (0.5) times master volume (0.9)
		audioEngine.BeginOfflineRender(offlineContext, 0.45);
		try {
			// The fade sits between the music bus and the master bus, so music keeps playing while it fades
			const fade = offlineContext.createGain();
			audioEngine.musicBus.disconnect();
			audioEngine.musicBus.connect(fade);
			fade.connect(audioEngine.master);
			fade.gain.setValueAtTime(1, 0);
			fade.gain.setValueAtTime(1, musicSeconds);
			fade.gain.linearRampToValueAtTime(0, musicSeconds + fadeSeconds);

			const scheduledSteps = Math.ceil((musicSeconds + fadeSeconds) / stepSeconds);
			for (let step = 0; step < scheduledSteps; step++) {
				theme.PlayStep(step, 0.05 + step * stepSeconds);
			}
			return await offlineContext.startRendering();
		} finally {
			audioEngine.EndOfflineRender();
		}
	}


	/** Encodes 24-bit little-endian PCM and clicks a temporary download link. */
	#DownloadWav(audioBuffer, gain, fileName) {
		const left = audioBuffer.getChannelData(0);
		const right = audioBuffer.getChannelData(1);
		const frameCount = left.length;
		const bytes = new Uint8Array(44 + frameCount * 6);
		const view = new DataView(bytes.buffer);
		const writeText = (offset, text) => {
			for (let i = 0; i < text.length; i++) {
				bytes[offset + i] = text.charCodeAt(i);
			}
		};

		writeText(0, 'RIFF');
		view.setUint32(4, 36 + frameCount * 6, true);
		writeText(8, 'WAVEfmt ');
		view.setUint32(16, 16, true);              // Format chunk size
		view.setUint16(20, 1, true);               // PCM
		view.setUint16(22, 2, true);               // Stereo
		view.setUint32(24, SAMPLE_RATE, true);
		view.setUint32(28, SAMPLE_RATE * 6, true); // Bytes per second
		view.setUint16(32, 6, true);               // Bytes per frame
		view.setUint16(34, 24, true);              // Bits per sample
		writeText(36, 'data');
		view.setUint32(40, frameCount * 6, true);

		let offset = 44;
		for (let i = 0; i < frameCount; i++) {
			for (const channel of [left, right]) {
				const value = Math.round(Math.max(-1, Math.min(1, channel[i] * gain)) * 8388607);
				bytes[offset++] = value & 255;
				bytes[offset++] = (value >> 8) & 255;
				bytes[offset++] = (value >> 16) & 255;
			}
		}

		const url = URL.createObjectURL(new Blob([bytes], {type: 'audio/wav'}));
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		link.remove();
	}
}


/** The test API: every method returns plain data, so the Python tools stay independent of the game's internals. */
class TestHooks {
	/** Creates or resumes the AudioContext (normally that needs a user gesture). */
	InitAudio() {
		audioEngine.Init();
	}


	/** Name of the music theme that is playing, or 'none'. */
	CurrentMusicTheme() {
		return music.currentThemeName;
	}


	/** Seconds per sequencer step of a music theme. */
	MusicStepSeconds(theme) {
		return music.Theme(theme).stepSeconds;
	}


	/** Name of the visible screen: desktop, intro, title or game. */
	CurrentScreen() {
		return screens.current;
	}


	/** Plays the middleware intro, skipping the desktop launcher. */
	PlayIntro() {
		screens.Show('intro');
		introScene.Play();
	}


	/** Shows the title screen, skipping the desktop and intro. */
	ShowTitle() {
		titleScene.Show(false);
	}


	/** Starts a chapter. Difficulty: story, normal or veteran. Chapters above 6 are New Game+. */
	StartChapter(difficulty = 'normal', chapterNumber = 1) {
		mission.Start(difficulty, true, chapterNumber);
	}


	/** Snapshot of the current field, or null outside a game. */
	FieldStatus() {
		const field = game.field;
		if (!field) {
			return null;
		}
		return {
			chapterName: field.chapter.name,
			scenery: field.chapter.id,
			musicTheme: field.chapter.musicTheme,
			tilesetName: field.chapter.tileset.constructor.name,
			columns: field.columns,
			rows: field.rows,
			mineCount: field.mineCount,
			openedCount: field.openedCount,
			flagCount: field.flagCount,
			mineHits: field.mineHits,
			deaths: field.deaths,
			hitPoints: field.health,
			questTarget: field.questTarget,
			isStarted: field.minesPlanted,
			isPaused: field.isPaused,
			isDead: field.isDead,
			isOver: field.isOver,
			isWon: field.isWon,
			isFlooded: field.isFlooded,
		};
	}


	/** Board rectangle and tile size in CSS pixels, plus the HUD layout name (wide, mid or narrow). */
	BoardRect() {
		const board = layout.board;
		return {x: board.x, y: board.y, width: board.width, height: board.height, tileSize: board.tileSize, layout: layout.kind};
	}


	/** Centre of a tile in CSS pixels, without the camera offset. */
	TileCenter(tileIndex) {
		const field = game.field;
		const board = layout.board;
		return {
			x: board.x + (field.Column(tileIndex) + 0.5) * board.tileSize,
			y: board.y + (field.Row(tileIndex) + 0.5) * board.tileSize,
		};
	}


	/** Indices of hidden tiles without a mine (empty before the first click, when no mines are planted yet). */
	HiddenSafeTiles() {
		const field = game.field;
		const tiles = [];
		for (let i = 0; i < field.tileCount && field.minesPlanted; i++) {
			if (field.IsHiddenSafe(i)) {
				tiles.push(i);
			}
		}
		return tiles;
	}


	/** Indices of hidden, unflagged mines. */
	HiddenMineTiles() {
		const field = game.field;
		const tiles = [];
		for (let i = 0; i < field.tileCount; i++) {
			if (field.tileStates[i] === TILE.HIDDEN && field.isMine[i]) {
				tiles.push(i);
			}
		}
		return tiles;
	}


	/** Reveals a tile through the normal player action (a revealed number chords). */
	RevealTile(tileIndex) {
		playerActions.Reveal(tileIndex);
	}


	/** Flags or unflags a tile through the normal player action. */
	FlagTile(tileIndex) {
		playerActions.Flag(tileIndex);
	}


	/**
	 * Finds an open number tile that can be chorded once its hidden mines are flagged.
	 * Returns {numberTile, minesToFlag} or null.
	 */
	FindChordCandidate() {
		const field = game.field;
		for (let i = 0; i < field.tileCount; i++) {
			if (field.tileStates[i] !== TILE.OPEN || field.adjacentMines[i] === 0) {
				continue;
			}
			const minesToFlag = [];
			let hiddenSafeCount = 0;
			field.ForEachNeighbor(i, neighbour => {
				if (field.tileStates[neighbour] === TILE.HIDDEN && field.isMine[neighbour]) {
					minesToFlag.push(neighbour);
				} else if (field.tileStates[neighbour] === TILE.HIDDEN) {
					hiddenSafeCount++;
				}
			});
			if (hiddenSafeCount > 0 && minesToFlag.length > 0) {
				return {numberTile: i, minesToFlag};
			}
		}
		return null;
	}


	/** Reveals every remaining safe tile, which wins the chapter. */
	RevealAllSafeTiles() {
		for (const tileIndex of this.HiddenSafeTiles()) {
			const field = game.field;
			if (field && !field.isWon && field.tileStates[tileIndex] === TILE.HIDDEN) {
				playerActions.Reveal(tileIndex);
			}
		}
	}


	/** Steps on the first hidden mine (blood and damage tests). Returns its index. */
	StepOnMine() {
		const [mineIndex] = this.HiddenMineTiles();
		playerActions.Reveal(mineIndex);
		return mineIndex;
	}


	/** Sets the player's health, e.g. 100 before StepOnMine() to survive it, or 1 to die from it. */
	SetHitPoints(hitPoints) {
		game.field.health = hitPoints;
	}


	/** Pathos-4 only: moves the flood timer so the base floods in `secondsLeft`. */
	FloodIn(secondsLeft = 1) {
		const field = game.field;
		field.clock = field.floodStartTime + field.floodDuration - secondsLeft;
	}


	/** Pathos-4 only: sets the breath meter as log10 of the percentage (2 = 100 %, -12 = 1e-12 %). */
	SetBreath(log10Percent) {
		game.field.breathLog10 = log10Percent;
	}


	/** Makes the next supply drop arrive on the next frame. */
	SpawnSupplyDrop() {
		game.field.nextCrateTime = 0;
	}


	/** Hands out a side quest, as if its radio line had just finished. */
	GiveSideQuest(questId) {
		progression.AddSideQuest(questId);
	}


	/** Tile of the supply crate on the board, or -1. */
	SupplyCrateTile() {
		return game.field && game.field.supplyCrate ? game.field.supplyCrate.tile : -1;
	}


	/** Changes the radio chatter setting through the settings panel's select (the panel must be open). */
	ChangeChatterSetting(value) {
		const select = FindElement('[data-setting="chatter"]');
		select.value = value;
		select.dispatchEvent(new Event('input', {bubbles: true}));
	}


	/** Starts the club event, as if Big Dez had brought the club to the player. */
	StartClubNight() {
		clubNight.Start();
	}


	/** Opens the pause menu. */
	OpenPauseMenu() {
		pauseMenu.Open();
	}


	/** Closes the pause menu and resumes the game. */
	ResumeGame() {
		pauseMenu.Resume();
	}


	/** Opens a panel tab: quests, skills, store, achievements or settings. */
	OpenPanel(tab) {
		panel.Open(tab);
	}


	/** Closes the panel, returning to wherever it was opened from. */
	ClosePanel() {
		panel.Close();
	}


	/** Names of the visible overlays: pause, panel, death, results. */
	VisibleOverlays() {
		return Object.keys(OVERLAY_SELECTORS).filter(name => !document.querySelector(OVERLAY_SELECTORS[name]).hidden);
	}


	/** Clicks the BUY button of a store item in the open store panel. Returns false if it is not shown. */
	BuyStoreItem(itemId) {
		const button = FindElement(`#panel [data-buy="${itemId}"]`);
		if (!button) {
			return false;
		}
		button.click();
		return true;
	}


	/** Snapshot of the persistent player profile. */
	ProfileStatus() {
		return {
			level: profile.level,
			xp: profile.xp,
			coins: profile.coins,
			skillPoints: profile.skillPoints,
			equippedSkin: profile.equippedSkin,
			loreFound: profile.loreFound,
		};
	}


	/** Clicks the first visible, enabled button whose text starts with `text` (case-insensitive). Returns false if none. */
	ClickButton(text) {
		const wanted = text.toUpperCase();
		for (const button of document.querySelectorAll('button')) {
			const isVisible = button.offsetParent !== null;
			if (isVisible && !button.disabled && button.textContent.trim().toUpperCase().startsWith(wanted)) {
				button.click();
				return true;
			}
		}
		return false;
	}


	/** Rolls the credits from the title screen. */
	RollCredits() {
		creditsScene.Start('title');
	}


	/** Skips the rest of the credits, as Esc does. */
	SkipCredits() {
		creditsScene.Skip();
	}


	/** Snapshot of the credits roll. */
	CreditsStatus() {
		const roll = creditsScene.roll;
		return {
			isRolling: creditsScene.isRolling,
			scrollPosition: roll.scrollPosition,
			positionCount: roll.rowOffsets.length,
			listHeight: roll.listHeight,
		};
	}


	/** Number of decoded voice lines in the cache (proves that MP3 loading and decoding work). */
	DecodedVoiceCount() {
		return voiceBank.decodedCount;
	}


	/** Takes the next chatter line id from the scheduler. */
	NextChatterLine() {
		return chatter.NextLine();
	}


	/** Plays a voice line now. Returns whether it started or was queued. */
	Say(voiceId) {
		return voices.Say(voiceId);
	}


	/** Number of voice lines playing and the id of the queued chatter line. */
	VoiceStatus() {
		return {activeCount: voices.activeCount, queuedLine: chatter.queuedLine};
	}


	/** Manifest entry of a voice line: speaker, subtitle and duration, or null if unknown. */
	VoiceLine(voiceId) {
		const entry = VOICE_LINES[voiceId];
		return entry ? {speaker: entry.speaker, subtitle: entry.subtitle, duration: entry.duration} : null;
	}


	/** All chapters with their scenery, music theme and tileset. */
	Chapters() {
		return CHAPTERS.map((chapter, i) => ({
			number: i + 1,
			name: chapter.name,
			scenery: chapter.id,
			musicTheme: chapter.musicTheme,
			tilesetName: chapter.tileset.constructor.name,
		}));
	}


	/** Names of all sound effects in fingerprint order. */
	SoundEffectNames() {
		return SOUND_EFFECTS.map(([name]) => name);
	}


	/** Renders one sound effect offline and returns {fingerprint, peak, envelope}. */
	async SoundEffectFingerprint(name) {
		const [, play] = SOUND_EFFECTS.find(([effectName]) => effectName === name);
		const offlineContext = new OfflineAudioContext(2, SOUND_EFFECT_SECONDS * SAMPLE_RATE, SAMPLE_RATE);
		audioEngine.BeginOfflineRender(offlineContext, 1);
		let audioBuffer;
		try {
			play();
			audioBuffer = await offlineContext.startRendering();
		} finally {
			audioEngine.EndOfflineRender();
		}
		return {
			fingerprint: await FingerprintAudioBuffer(audioBuffer),
			peak: PeakOfAudioBuffer(audioBuffer),
			envelope: EnvelopeOfAudioBuffer(audioBuffer),
		};
	}


	/** Renders every sound effect offline and returns {name: {fingerprint, peak, envelope}}. */
	async SoundEffectFingerprints() {
		const fingerprints = {};
		for (const [name] of SOUND_EFFECTS) {
			fingerprints[name] = await this.SoundEffectFingerprint(name);
		}
		return fingerprints;
	}
}


// The tools wait for testHooksReady (tools/lib/env.py open_game)
Object.assign(window, {testHooks: new TestHooks(), musicExporter: new MusicExporter(), testHooksReady: true});
