# Engine architecture

Triple A Sweeper is plain JavaScript in the browser:
- **No runtime dependencies:** no framework, no game engine, no images, no music files.
- **Drawing:** everything visual is drawn procedurally with Canvas 2D, CSS and inline SVG.
- **Sound:** all music and sound effects are synthesised live with the Web Audio API.
- **Voices:** the only recorded assets are the 197 voice lines (MP3), generated offline with a TTS model.

```
index.html            markup for every screen + <link>s to css/ + <script type="module" src="js/main.js">
css/                  stylesheets, in cascade order (see index.html); colour and z-index tokens in base.css
js/                   ES modules (below)
assets/fonts/         self-hosted web fonts (woff2, OFL licences)
assets/voices/        197 voice MP3s, fetched at runtime by id
assets/icons.svg      the SVG icon sprite (<use href="assets/icons.svg#icon-mine">)
assets/favicon.svg
```

These four items (`index.html`, `css/`, `js/`, `assets/`) are the whole game. There is no build step (§12).

The code came from a single 265 KB HTML file that was split into modules and then rewritten class by class. The coding rules are in `.claude/CLAUDE.md`: K&R braces, tabs, classes with commented members, `PascalCase` methods, `camelCase` variables, `#private` members, `CONSTANT_CASE` constants.


## 1. Module map

Each file holds one main class, named after the file (`AudioEngine` in `audio-engine.js`), and usually exports one instance of it as a **singleton** in `camelCase` (`export const audioEngine = new AudioEngine()`). Families of related classes share a base class in a subfolder.

**`core/`**: helpers with no game knowledge.

| File | Exports | Purpose |
|---|---|---|
| `dom.js` | `FindElement`, `FindAllElements`, `EscapeHtml`, `FocusFirstButton`, `PREFERS_REDUCED_MOTION` | DOM shortcuts |
| `math.js` | `Clamp`, `MidiToFrequency`, `FULL_TURN` | Numeric helpers |
| `random.js` | `random` (`Random`) | The only source of randomness: `Next`, `Range`, `Chance`, `Pick`, `Shuffle`, `Seed` |
| `time.js` | `NowSeconds`, `Sleep`, `Tween`, `FormatMinutesSeconds` | Timing helpers |
| `local-store.js` | `localStore` | JSON in `localStorage` under the `aaasweep.` prefix, failure-tolerant |
| `settings.js` | `settings` (`Settings`) | Volumes, subtitles, chatter, film grain, camera sway, blood |
| `player-profile.js` | `profile` (`PlayerProfile`) | XP, level, coins, perks, skins, achievements, lore, unlocked chapters |
| `canvas-fonts.js` | `canvasFonts` | Loads the web fonts canvas code draws with |

**`data/`**: tables and text, no logic beyond small lookups.

| File | Contents |
|---|---|
| `voice-manifest.js` | **Generated** by `tools/tts/generate_voices.py`. `VOICE_LINES[id] = {duration, speaker, subtitle}` |
| `characters.js` | `CHARACTERS` (the radio cast), `SpeakerOf(voiceId)` |
| `subtitles.js` | Batch-1 subtitles, `SubtitleOf(voiceId)` |
| `chatter.js` | `CHAPTER_CHATTER`, `SHARED_CHATTER`, `REPEATABLE_LINES`, `PINNED_LINES`, `SIDE_QUEST_AFTER_LINE` |
| `achievements.js`, `side-quests.js`, `store.js`, `difficulties.js` | Achievements, side quests, perks/skins/store/loot, board sizes |
| `texts.js` | Tips, loading messages, lore, death quotes, rank titles (`RankTitle(level)`) |
| `tuning.js` | `TUNING`: every gameplay number (damage, regeneration, XP, timers, flood) |
| `credits-text.js`, `desktop-text.js` | The credits and the desktop's patch notes and message boxes |

**`audio/`** (see [AUDIO.md](AUDIO.md) and [MUSIC.md](MUSIC.md))

| File | Singleton | Purpose |
|---|---|---|
| `audio-engine.js` | `audioEngine` | The Web Audio graph, reverbs, muffle filter; `PlayTone`, `PlayNoise`, `Shellshock`, offline rendering |
| `sound-effects.js` | `soundEffects` | Every sound effect as a method |
| `instruments.js` | `instruments` | Synthesised instruments for the music |
| `music-sequencer.js` | `music` | Look-ahead step scheduler: `Start(themeName)`, `Stop()` |
| `themes/` | | `MusicTheme` base class and one subclass per theme (`PlayStep(step, time)`) |
| `voice-bank.js` | `voiceBank` | Fetches, decodes and LRU-caches the voice MP3s |
| `voice-manager.js` | `voices` | Radio filter chain, ducking, `Say`, `Bark` (cooldowns), subtitles |
| `chatter-scheduler.js` | `chatter` | Which ambient radio line plays next |

**`game/`**

| File | Exports | Purpose |
|---|---|---|
| `minefield.js` | `Minefield`, `TILE` | The pure Minesweeper board and rules: planting, flood fill, chording, quest-marker choice. No DOM or audio; unit-tested |
| `field.js` | `Field` | `extends Minefield`: one run of one chapter with all the AAA state (health, timers, flood, club, crate...) |
| `game.js` | `game` | Owns `game.field`, the field being played (or `null`) |
| `chapter.js`, `chapters.js` | `Chapter`, `CHAPTERS`, `ChapterForNumber` | The chapter registry (§6) |
| `mission.js` | `mission` | `Start(difficulty, isQuick, fieldNumber)` and the per-frame `Update` (§7) |
| `player-actions.js` | `playerActions` | `Reveal`, `Flag`, `Chord`, `PayRespects`, mine hits; `canAct` |
| `progression.js` | `progression` | XP and levels, lore fragments, side quests |
| `flood-controller.js` | `flood` | Pathos-4: countdown, flooding, breathing |
| `events/` | `clubNight`, `supplyDrop`, `fieldEvents` | The club arriving, supply crates and loot, idle barks, nags, tips, fake autosaves |
| `mission-outcome.js` | `missionOutcome` | Death and checkpoint, victory, results screen |
| `input/` | `input` | `InputController` (flag mode, keyboard cursor, HUD buttons) with `PointerInput` and `KeyboardInput` |

**`render/`**

| File | Singleton | Purpose |
|---|---|---|
| `layout.js` | `layout` | `Viewport`, `BoardGeometry` and the wide/mid/narrow layout choice (`LAYOUT_KIND`) |
| `camera.js` | `camera` | Board offset (sway and shake); `TileCenter`, `TileToScreen`, `TileAtScreen` |
| `game-renderer.js` | `gameRenderer` | One frame of the game screen, back to front (§8) |
| `board-renderer.js` | `boardRenderer` | Frame, captions, tiles, flags, light effects, supply crate |
| `sprite-cache.js` | `sprites` | Pre-painted tile sprites for the current tileset and tile size |
| `tilesets/` | | `Tileset` base class and six subclasses |
| `scenery/` | `scenery` | `Scenery` base class, six chapter backgrounds, and `SceneryRenderer` (caching, title backdrop) |
| `particles.js` | `particles` | `ParticleSystem` with one `Particle` subclass per kind |
| `blood-overlay.js`, `underwater.js`, `quest-marker.js` | | Blood splats, Pathos-4 caustics, the quest marker and its trail |
| `hud/` | `compass`, `minimap`, `radioWaveform` | The canvas parts of the HUD |

**`ui/`**

| File | Singleton | Purpose |
|---|---|---|
| `screen-manager.js` | `screens` | `current` screen, `Show(id)`, `FadeTo(opacity, ms)`, `CloseOverlays()` |
| `hud.js` | `hud` | DOM HUD: `Refresh()` after events, `UpdateFrame()` every frame |
| `toasts.js`, `banners.js`, `kill-feed.js`, `callouts.js` | `toasts`, `banners`, `killFeed`, `callouts` | Notifications (§9) |
| `achievements.js` | `achievements` | `Unlock(id)` |
| `radio-panel.js`, `portrait-painter.js` | `radioPanel`, `portraitPainter` | The transmission panel and the procedural portraits |
| `oxygen-readout.js` | `oxygenReadout` | The big Pathos-4 countdown / breath readout |
| `pause-menu.js` | `pauseMenu` | Pause menu; `SetPaused` |
| `panel/` | `panel` | `TabbedPanel` and its `PanelTab` subclasses: quest log, skills, store, achievements, settings |

**`scenes/`**

| File | Singleton | Purpose |
|---|---|---|
| `desktop/` | `desktopScene` | The Win98 desktop: `DesktopWindow`, `StartMenu`, the launcher, `ReturnFromGame()` |
| `intro-scene.js` | `introScene` | Middleware logo cards, hold to skip |
| `title-scene.js` | `titleScene` | Title, menus (`menuState`, `TITLE_MENU`), chapter select, loading |
| `credits/` | `creditsScene` | Title cards, `CreditsRoll` (1,412 rows), `ConceptArtGallery` and its `ConceptArtSheet` subclasses |

**`js/` itself:** `main.js` (`Application`: init order and frame loop) and `debug.js` (`window.testHooks`, `window.musicExporter`; loaded only with `?debug`).


## 2. Boot, Init() and the frame loop

1. `index.html` holds the markup of every screen. Screens are `<section class="screen">`: `#desktop`, `#intro`, `#title`, `#game`. Overlays: `#pause-menu`, `#panel`, `#death-screen`, `#results-screen`, `#credits`. Global layers: `#toast-stack`, `#banner`, `#letterbox`, `#fade-layer`.
2. Loading `main.js` evaluates every module. **Constructors only set their own fields and look up DOM nodes**; no module calls into another while loading.
3. `Application.Start()` then:
   - applies `?seed=N` (§10)
   - paints the film-grain texture
   - calls every `Init()` in a fixed order: `voiceBank`, `layout`, `sprites`, `missionOutcome`, `input`, `pauseMenu`, `panel`, `desktopScene`, `introScene`, `titleScene`, `creditsScene`. `Init()` methods wire event listeners and do the cross-module setup.
   - starts the frame loop, and imports `debug.js` when the URL has `?debug`.
4. **Each frame** (`Application.#Frame`):
   - **title:** `scenery.DrawTitleBackdrop(time, deltaTime)`
   - **game:** `mission.Update(time, deltaTime)`, then `gameRenderer.Draw(time, deltaTime)`; `deltaTime` is clamped to 50 ms
   - **credits, desktop, intro:** DOM and CSS (the credits roll runs its own `requestAnimationFrame`)
   - Errors are caught and logged, so one broken frame doesn't stop the loop.
5. **Screen changes:** `screens.Show(id)` hides the other screens; `screens.FadeTo(opacity, ms)` returns a promise, so transitions read `await screens.FadeTo(1, 600); ...; await screens.FadeTo(0, 900)`.
6. **Audio starts on the first click** (the desktop icon), because browsers block audio before a user gesture. Every audio path checks `audioEngine.context` first, so the game runs silently without audio. Higher layers that need to prepare audio register with `audioEngine.WhenStarted(callback)`.


## 3. Load order and import cycles

ES modules may import each other in cycles, and this code base has one large cycle (the game, UI and scenes call each other). That is harmless as long as **no code that runs while a module loads uses something from another module of the same cycle**. Two things do run at load time:
- `class X extends Y`: `Y` must already be evaluated.
- `new X()` at module level or in a class field initialiser, e.g. a singleton holding another class's instance.

If such a module is entered from the "wrong" side of a cycle, the browser throws a `ReferenceError` (temporal dead zone), depending only on import order. The structure prevents this:
- **Base classes stay out of cycles.** `Scenery`, `Tileset`, `MusicTheme`, `ConceptArtSheet`, `PanelTab` and `Minefield` only import downwards (core, data, `layout`, `audioEngine`). `layout.js` finds `#game-canvas` itself rather than importing the renderer, and `audioEngine` doesn't import the voice bank (`WhenStarted` instead).
- **`game.js` and `field.js` are leaf state modules.** `Field` receives its `Chapter` from `Mission.Start`, because `chapters.js` imports every scenery and tileset class.
- **Objects that belong to another module of the cycle are created in `Init()`**, not in field initialisers: `InputController` creates `PointerInput` and `KeyboardInput` there, `TabbedPanel` its tabs.

`scripts/check_style.sh` reports any `extends` or load-time `new` of a class imported from the same import cycle.


## 4. State ownership

Every piece of mutable state has one owner that writes it; everyone else reads it.

| State | Owner | Members |
|---|---|---|
| The field being played | `game` | `game.field` (a `Field`), `BeginField`, `EndField`, `Schedule(seconds, callback)` |
| Viewport, board rectangle, layout | `layout` | `viewport.{width, height, pixelRatio}`, `board.{tileSize, x, y, width, height}`, `kind` |
| Camera offset | `camera` | `x`, `y` (set by `gameRenderer` every frame) |
| Input modes | `input` | `flagMode`, `keyboardCursorActive`; `CancelPress()` |
| Current screen | `screens` | `current` |
| Title menu | `titleScene` | `menuState` (one of `TITLE_MENU`) |
| Credits | `creditsScene` | `isRolling`, `isFastForward`, `wasSkipped`, `roll` |
| Saved progress and options | `profile`, `settings` | see §11 |


## 5. The field: `Minefield` and `Field`

`Minefield` is the pure board: `columns`, `rows`, `mineCount`, `tileCount`, and typed arrays `isMine`, `adjacentMines`, `tileStates` (`TILE.HIDDEN`, `OPEN`, `FLAGGED`, `EXPLODED`). Its methods: `PlantMines` (first click and its neighbours stay safe), `FloodOpen`, `ChordTargets`, `IsHiddenSafe`, `NearestSafeTile`, `IsCleared`, `TileLabel`. The fairness rules are unit-tested (`scripts/unit_tests.sh`).

`Field extends Minefield` and adds everything else about one run, every member declared and commented in `field.js`:
- **chapter and flow:** `chapter`, `difficultyKey`, `fieldNumber`, `isOver`, `isWon`, `isDead`, `isPaused`, `clock` (seconds of unpaused game time), `missionSeconds`, `scheduled`
- **player:** `health`, `healthTrail`, `lastHitTime`, `damageFlash`, `mineHits`, `deaths`
- **quest marker and statistics:** `questTarget`, `markersFollowed`, `respectsPaid`, `xpEarned`...
- **timed events:** `next…Time` members, `supplyCrate`, `clubSecondsLeft`, `sideQuests`
- **Pathos-4:** `floodStartTime`, `floodDuration`, `floodProgress`, `isFlooded`, `breathLog10`
- **pointer and effects:** `hoveredTile`, `pressedTile`, `keyboardCursorTile`, `revealTimes`, `revealEffects`, `screenShake`

`Field` overrides `PlantMines` (to hide lore fragments) and `FloodOpen` (to time the reveal ripple). A new `Field` is created on every chapter start and dropped when the player leaves.


## 6. Chapters

`game/chapters.js` builds one `Chapter` per chapter. Each holds its texts and voice ids, and direct references to how it looks and sounds:

| Member | Example |
|---|---|
| `id` | `'battle'`: picks the chatter lines (`CHAPTER_CHATTER[id]`) |
| `name`, `chapterLabel`, `operation`, `localTime`, `questGiver`, `description` | Display texts |
| `announcerLine`, `openingLine`, `victoryLines` | Voice ids |
| `achievement` | Unlocked by clearing it |
| `musicTheme` | Theme name for `music.Start()` |
| `tileset` | A `Tileset` instance |
| `sceneryClass` | A `Scenery` subclass; `CreateScenery()` makes a fresh one |
| `screenClass`, `isClub`, `floods` | Behaviour flags: club lighting, Da Club's quest, Pathos-4's flood |

`ChapterForNumber(n)` wraps around for New Game+ (field 7 is chapter 1 again).


## 7. Game flow

**`Mission.Start`** fades out, resets the screen, creates the `Field`, starts the chapter's music and chatter, predecodes the first voice lines, fades in and shows the chapter card.

**`Mission.Update`** runs every frame, in a fixed order (the golden tests depend on the order of random draws):
1. reveal effects (dust, lore pickup), screen shake and damage flash decay
2. if paused: only the HUD frame update
3. `clock`, mission timer, scheduled callbacks
4. health regeneration, the trailing bar, low-health heartbeat
5. ambient chatter
6. `fieldEvents` (idle, skill nag, halfway, autosave, tips), `supplyDrop`, `flood`, `clubNight`
7. crater smoke, the respects prompt, `hud.UpdateFrame()`

**Player actions** (`playerActions`) apply the Minesweeper move through `Field`, then the AAA reactions (XP, combos, kill feed, barks, achievements). After every action the quest marker moves on if its tile was taken, and the win is checked. Mine hits call `missionOutcome.Die()` at zero health; clearing the board calls `missionOutcome.Win()`.


## 8. Rendering

### Layers (back to front inside `#game`)
1. `#game-canvas`, sized to the viewport times the pixel ratio. `GameRenderer.Draw` paints:
   - the chapter scenery
   - translated by the camera: the board (`boardRenderer`), the supply crate, particles, the quest marker and trail
   - the club light beams and the Pathos-4 underwater effects
2. CSS layers: `#vignette`, `#underwater-tint`, `#blood-canvas`, `#damage-flash`, `#film-grain`
3. `#hud`, the DOM HUD, with small canvases: `#compass-canvas`, `#minimap-canvas`, `#portrait-canvas`, `#radio-waveform`
4. Global layers above everything: toasts, banner, letterbox, fade

### Post-processing is mostly CSS
State classes on `#game`: `is-low-health` (desaturate), `is-dying` (greyscale and blur), `is-flooded`, `is-club-night`, `is-club-chapter`, `is-pathos-chapter`, and `layout-wide` / `layout-mid` / `layout-narrow`.

### Layout
`Layout.Apply()` tries the three HUD layouts and keeps the one with the biggest tiles:
- **wide** (≥1180 px): HUD panels at the sides
- **mid** (≥900 px): panels above and below
- **narrow**: phones; stacked panels

Pathos-4 reserves extra space at the top for its readout. Apply runs on start and on resize, and rebuilds the sprites for the new tile size.

### Tilesets and sprites
- **Tilesets:** `Tileset` subclasses paint the hidden (and hovered) and open tiles, a frame accent and animated board decorations: steel, sandstone, dance floor, ice, lawn, bulkhead.
- **Sprites:** `SpriteCache.Build()` pre-paints them for the current field's tileset and tile size. Textured tilesets get several hidden variants, picked per tile so the texture doesn't repeat visibly. The lawn's columns alternate light and dark (mowing stripes).
- **Numbers** are drawn with the Teko font.

### Scenery
Each `Scenery` subclass bakes its static parts once in `Prepare(width, height)`, then `Draw()` paints the bake plus animated layers: embers, fog, sun flare, birds, heat shimmer, aurora, snow, club lights on the beat, fish, rising water. `SceneryRenderer` keeps one built instance and rebuilds it from a fresh one when the class, size or pixel ratio changes.

### Particles, blood
- **Particles:** `particles.Emit({type, x, y, velocityX, velocityY, gravity, drag, life, size, color...})` creates a `Particle` subclass by `type`. `Explode(x, y)` makes the mine blast; `EmitBubble` makes the Pathos-4 bubbles.
- **Blood:** `blood.Hit(x, y)` adds a splat and a hit-direction arc. Splats fade as health regenerates.

### Canvas fonts
Canvas text can only use web fonts that have finished loading. `canvasFonts.Preload()` loads them at boot, and anything baked before that is rebuilt once they arrive.


## 9. UI

- **HUD:** `hud.Refresh()` rewrites the slow-changing parts after events (counters, XP, objectives, buttons); `hud.UpdateFrame()` updates health and the mission timer every frame. The canvas widgets draw in `GameRenderer.Draw`.
- **Notifications are queued, so they never pile up illegibly:**
  - `toasts.Show({kicker, title, description, isReward, icon, gamerscore})`: one at a time, 3.2 s each
  - `banners.Show(kicker, title, subtitle, color)`: centre banners, 2.85 s each
  - `killFeed.Add(html, style)`: at most 6 lines
  - `callouts.PopAt(x, y, text, style)`: floating "+XP" text; `callouts.ShowCombo(name, count)`
  - `achievements.Unlock(id)`: once per profile, with a toast, a fanfare, gamerscore and a radio comment
- **Panel:** `panel.Open(tabId, returnTo)` pauses the field and shows a `PanelTab`. The active tab draws the body (`Markup()`) and handles its clicks (`OnClick`) and form input (`OnInput`).


## 10. Input

- **Pointer** (`PointerInput`):
  - Mouse: left click reveals on release, right click flags, middle click chords. Clicking an open number chords too.
  - Touch: a tap reveals (or flags in flag mode); a long press flags.
- **Keyboard** (`KeyboardInput`) routes keys to the screen that is showing:

  | Key | Action |
  |---|---|
  | Arrows / WASD | Move the cursor (it starts on the quest marker) |
  | Space / Enter | Reveal |
  | X / Q | Flag |
  | F | Pay respects |
  | M | Mute |
  | J / K / B | Quest log / skills / store |
  | Esc | Pause; back in menus and panels |

  Menus support the arrow keys. In the credits, Space or Enter fast-forwards and Esc skips. In the intro, holding Space, Enter or Esc skips.
- **Pausing:** the game pauses when the tab is hidden.
- **Reproducible boards:** `?seed=N` makes `random` a seeded generator, so a board can be replayed for a bug report.


## 11. Persistence

- **Storage:** `localStorage` keys are prefixed `aaasweep.`. Every access is wrapped in try/catch, so the game also works with storage blocked.
- **Format version:** each saved object carries a `formatVersion`. A save of another version is ignored, and the defaults apply.
- **Settings** (`aaasweep.settings`): `masterVolume`, `musicVolume`, `voiceVolume`, `effectsVolume` (0–1), `muted`, `subtitles`, `chatter` (`off`, `normal`, `constant` or `unbearable`), `filmGrain`, `cameraSway`, `blood`.
- **Profile** (`aaasweep.profile`): `xp`, `level`, `coins`, `skillPoints`, `perks`, `ownedSkins`, `equippedSkin`, `xpBoostUntil`, `achievements`, `gamerscore`, `loreFound`, `highestChapter`.
- A field in progress is not saved.


## 12. Serving and hosting

There is **no build step**. The browser loads the source files directly: `index.html` links the stylesheets and loads `js/main.js` as an ES module, which imports the rest.

- **Development:** `scripts/startup.sh` runs `tools/serve.py`, a standard-library web server, in the background on http://localhost:8080.
  - It serves only `index.html`, `css/`, `js/` and `assets/`, and answers 404 for anything else.
  - It sends `Cache-Control: no-store`, so a refresh always loads the current files.
- **Why a server at all:** browsers load ES modules only over `http://`, so opening `index.html` from disk (`file://`) shows a blank page.
- **Hosting:** copy `index.html`, `css/`, `js/` and `assets/` to any static web host. All paths are relative.


## 13. Recipes

**Add a chapter**
1. **Tileset:** write a `Tileset` subclass in `render/tilesets/`:
   - `DrawHidden(size, isHovered, isDarkStripe)` and `DrawOpen(size)`
   - optionally `DrawFrameAccent` and `DrawBoardDecorations` (animated extras on the board)
   - and the members `frameColors`, `rivetColor`, `variantCount`, `hasColumnStripes`
2. **Scenery:** write a `Scenery` subclass in `render/scenery/` (`Build` bakes the static picture, `Draw` adds the animated layers).
3. **Music:** write a `MusicTheme` subclass in `audio/themes/` and register it in `MusicSequencer`'s constructor (see [MUSIC.md](MUSIC.md#7-adding-a-theme)).
4. **Registry:** add a `Chapter` to `CHAPTERS` in `game/chapters.js`, with the texts, voice ids, `tileset: new MyTileset()`, `sceneryClass: MyScenery` and `musicTheme`.
5. **Chatter:** add `CHAPTER_CHATTER.<id>` in `data/chatter.js`, and generate the lines (see [VOICES.md](VOICES.md)).
6. Check it: `biome lint`, `scripts/check_style.sh`, `scripts/smoke.sh` and `scripts/smoke.sh --mobile`. Then look at the screenshots, in all three layouts if the HUD changed.

**Add a sound effect:** add a method to `SoundEffects` (`audio/sound-effects.js`) built from `audioEngine.PlayTone` and `PlayNoise`, sending to `audioEngine.effectsBus` (and `effectsReverbSend` for reverb). Add it to `SOUND_EFFECTS` in `debug.js`, so the golden comparison fingerprints it.

**Add an achievement:** add it to `ACHIEVEMENTS` in `data/achievements.js` (`{name, description, gamerscore}`), and call `achievements.Unlock('id')` where it happens.

**Add a panel tab:** write a `PanelTab` subclass in `ui/panel/` (`Markup`, and `OnClick`/`OnInput` if it is interactive), and add it to the list in `TabbedPanel.Init()`.

**Change a gameplay number:** `data/tuning.js`.

**Add a voice line:** see [VOICES.md](VOICES.md#adding-a-line).
