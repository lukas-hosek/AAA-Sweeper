# Engine architecture

Triple A Sweeper is plain JavaScript in the browser:
- **No runtime dependencies:** no framework, no game engine, no images, no music files.
- **Drawing:** everything visual is drawn procedurally with Canvas 2D, CSS and inline SVG.
- **Sound:** all music and sound effects are synthesised live with the Web Audio API.
- **Voices:** the only recorded assets are the 197 voice lines (MP3), generated offline with a TTS model.

The code started life as one 265 KB HTML file. It was split mechanically into ES modules (see §9), so most functions keep their original, compact style.

```
index.html            markup for every screen + <link>s to css/ + <script type="module" src="js/main.js">
css/                  stylesheets (order matters, see index.html)
js/                   ES modules (below)
public/voices/        197 voice MP3s, fetched at runtime by id
public/favicon.svg
assets/fonts/         self-hosted Google Fonts (woff2, OFL licences)
```

## 1. Module map

| Folder | Module | Responsibility |
|---|---|---|
| `core/` | `shared.js` | `ST`: the shared mutable state object (§3) |
| | `util.js` | `$`, `$$`, `clamp`, `rand`, `pick`, `now`, `sleep`, `esc`, `n2f` (MIDI → Hz), `shuffle`, `tween`, `RM` (prefers-reduced-motion) |
| | `storage.js` | `store` (localStorage wrapper), `settings`, `PROFILE`, `saveSettings`, `saveProfile` |
| `data/` | `voice-manifest.js` | **Generated.** `VOICES[id] = {d, w?, t?}`: duration, speaker, subtitle |
| | `dialogue.js` | `CHAR` (cast), `SUBS` (batch-1 subtitles), `CHAT` (per-chapter chatter arcs), `SHARED`, `REPEATS`, `PIN`, `QUEST_ON_LINE`, `whoOf()`, `lineText()` |
| | `content.js` | Side quests, achievements, tips, lore, quotes, ranks, perks, skins, store, loot, difficulties, number colours |
| | `fields.js` | `FIELDS`: the six chapters. `FI(n)` wraps for New Game+ |
| `audio/` | `engine.js` | Web Audio graph, reverbs, the muffle filter, `osc()`, `nz()`, `env()`, `shellshock()`, `setVol()` |
| | `voice-bank.js` | Fetch/decode/LRU-cache voice MP3s |
| | `sfx.js` | `S`: every sound effect |
| | `instruments.js` | Synth instruments for the music |
| | `music.js` | Music data and the step sequencer (`musicStart`, `musicStep`) |
| | `voices.js` | Voice manager: radio chain, chatter scheduling, barks, subtitles |
| `ui/` | `screens.js` | `cur` (current screen), `show()`, `fadeTo()` |
| | `notify.js` | Toasts, achievements (`unlock`), banners, kill feed, +XP pops, combo text |
| | `radio.js` | Transmission panel, procedural character portraits |
| | `hud.js` | DOM HUD refresh (`updateHUD` on events, `updateHUDframe` every frame) |
| | `panels.js` | Pause menu; tabbed panel (quest log, skills, store, achievements, settings) |
| `scenes/` | `desktop.js` | Win98 desktop, windows, Start menu, launcher (`launch()`) |
| | `intro.js` | Middleware logo cards, hold to skip |
| | `title.js` | Title, menus, chapter select, loading screen, `toTitle()`, `quitDesktop()` |
| | `credits.js` | End credits (`startCredits`, `CR`) |
| | `concept-art.js` | Procedural concept-art sheets for the credits |
| `game/` | `state.js` | `newField()` builds `ST.G`; board helpers (`idx`, `forN`, `label`, `tileCenter`, `sched`); `CAM`, `SPR`, `P`, `cv`, `ctx` |
| | `rules.js` | Minesweeper rules and the AAA layer: `actReveal`, `actFlag`, `chord`, `detonate`, `pickTarget`, XP, lore, side quests |
| | `pathos.js` | Flood, breath readout (`o2Set`, `fmtBreath`), underwater muffle, caustics |
| | `events.js` | Club, tips, autosave, supply drops, loot |
| | `outcome.js` | Death/checkpoint, `win()`, results screen |
| | `start.js` | `startGame(difficulty, quick, field)` |
| | `update.js` | `gameUpdate(t, dt)`: per-frame simulation |
| | `input.js` | Pointer, touch and keyboard |
| `render/` | `layout.js` | Picks the wide/mid/narrow layout and sizes the board and canvases |
| | `sprites.js` | Procedural tile sprites for six tilesets |
| | `scenery.js` | Procedural chapter backgrounds and title backdrop |
| | `blood.js` | Blood overlay canvas |
| | `particles.js` | Particle system and explosions |
| | `draw-game.js` | `drawGame()`: background, board, marker, particles, post effects |
| | `hud-canvas.js` | Compass, minimap and radar, radio waveform |
| | `main.js` | Imports every module in a fixed order, starts the render loop |
| | `debug.js` | Test hooks (`window.__t`, `window.__render`), loaded only with `?debug` |

Every module starts with a one-line comment saying what it is for.

## 2. Boot and the main loop

1. `index.html` contains the markup for every screen. Screens are `<section class="screen">`: `#desktop`, `#intro`, `#title`, `#game`. There are also overlays (`#pause`, `#panel`, `#death`, `#results`, `#credits`) and global layers (`#toasts`, `#banner`, `#letterbox`, `#fade`).
2. `main.js` imports all modules. Their top-level code registers DOM event listeners and builds static data. It then generates the film-grain texture and starts `requestAnimationFrame(tick)`.
3. `tick` routes by screen:
   - **title:** `drawTitle()` (the animated backdrop)
   - **game:** `gameUpdate(t, dt)` then `drawGame(t, dt)`, with dt clamped to 50 ms
   - **credits:** run their own rAF loop (`crTick`)
   - **desktop/intro:** pure DOM/CSS
4. **Screen changes:** `show(id)` sets `cur` and hides the other screens. `fadeTo(opacity, ms)` drives the black `#fade` layer and returns a promise, so transitions read as `await fadeTo(1); ...; await fadeTo(0)`.
5. **Audio starts on the first click** (the desktop icon), because browsers block audio before a user gesture. Every audio call checks `A.ctx` first, so the game runs silently if audio is unavailable.

## 3. Shared mutable state: `ST`

ES module imports are read-only bindings, so a variable that several modules reassign cannot simply be exported. The fifteen variables reassigned from more than one module therefore live on one object, `ST` (`js/core/shared.js`):

| Field | Meaning |
|---|---|
| `ST.G` | The current field (game state object, see §4), or `null` outside a game |
| `ST.T` | Tile size in CSS px |
| `ST.BX, ST.BY, ST.BW, ST.BH` | Board rectangle in CSS px |
| `ST.W, ST.H, ST.dpr` | Viewport size and device pixel ratio (capped at 2) |
| `ST.LK` | Current layout: `'wide'`, `'mid'` or `'narrow'` |
| `ST.flagMode`, `ST.kbdOn` | Touch flag mode; keyboard cursor active |
| `ST.press` | Pointer press being tracked (long-press flag) |
| `ST.menuState` | Title menu state: `press`, `main`, `diff`, `chap`, `load` |
| `ST.O2K` | Cache key of the Pathos-4 readout (avoids DOM writes) |

Everything else is a normal `export`. Objects that are mutated but never reassigned (`settings`, `PROFILE`, `A`, `VM`, `CR`, `SC`, `BL`, `SPR`...) are exported directly.

**Rule:** if you add a module-level `let` that other modules need to *assign*, put it on `ST`. Reading an exported `let` from another module is fine, because live bindings update.

**Module evaluation order.** `main.js` imports the modules in the order the code had in the original single file. The split was checked with an AST tool so that no module's top-level code touches another module's not-yet-initialised `const`/`let`: there are no temporal-dead-zone hazards. When adding top-level code that *runs* at load time, using something imported from a module that `main.js` imports later is the one thing to watch. Calling imported `function` declarations is always safe.

## 4. The field object `ST.G`

`newField(difficulty, field)` in `game/state.js` creates it. Important members:

- **board:** `cols, rows, mines, n` and typed arrays.
  - `mine[i]`: 0 or 1
  - `cnt[i]`: neighbour count
  - `st[i]`: tile state, 0 = hidden, 1 = open, 2 = flagged, 3 = exploded crater
  - `revAt[i]`: reveal time for the ripple animation
  - `ever[i]`: flagged at least once (XP only once)
- **theme:** `theme` (the `FIELDS` entry), `tileset`, `field` (1-based; above 6 means New Game+).
- **flow:** `started, over, won, dead, paused`, `clock` (seconds of unpaused game time), `elapsed` (mission timer), `sched[]` (`sched(sec, fn)` runs `fn` at `clock + sec`).
- **player:** `hp`, `hpTrail` (the delayed red bar), `lastHit`, `booms`, `deaths`, `flags`, `opened`.
- **AAA state:**
  - `target`: the quest-marker tile
  - `follows`, `rebels`, `lore` (a Set of tile indices), `crate`, `club` (seconds left of the club), `side[]` and `tracked` (side quests)
  - `xpEarned`, `coinsEarned`, `trans` (radio transmissions heard)
  - `next*` timers for tips, saves, crates, nags and heartbeats
- **Pathos-4:** `floodStart`, `floodTotal`, `floodP` (0–1), `flooded`, `bLog` (log10 of breath percent), `breath`, `warn30`, `lastTick`.
- **input/view:** `hover`, `pressed`, `kbd`, `mx/my`, `shake`, `flash`, `revealQ` (tiles waiting for their ripple-delayed dust).

`ST.G` is replaced on every `startGame`, and set to `null` when you quit to title or desktop.

## 5. Rendering

### Canvases and layers (back to front inside `#game`)
1. `#cv`, the main canvas, sized `W×H×dpr`.
   - `drawGame` draws, in order: scenery background, board frame and bevel, tiles (sprites), flags, craters, numbers, supply crate, particles, quest marker beam, ring and trail, then the underwater caustics (Pathos-4, flooded).
   - The camera (`CAM`) adds sway and shake by translating the context.
2. CSS overlay `div`s:
   - `#fx-vig`: vignette
   - `#fx-water`: underwater tint
   - `#blood` (a canvas): blood splats and hit arcs
   - `#fx-dmg`: red damage flash
   - `#fx-grain`: animated film grain
3. `#hud`: DOM HUD. Inside it are small canvases: `#compassCv`, `#mm` (minimap), `#portrait` (radio portrait) and the waveform.
4. Global layers above everything: toasts, banner, letterbox, fade.

### Post-processing is mostly CSS
CSS filters on `#cv`:

| Class on `#game` | Effect |
|---|---|
| `.lowhp` | Desaturate |
| `.dying` | Greyscale and blur |
| `.flooded` | Blur, saturate, darken |
| `.club` / `.clubfield` | Club lighting |
| `.pathosfield` | Pathos-4 layout tweaks |
| `.L-wide` / `.L-mid` / `.L-narrow` | Current layout |

### Layout (`render/layout.js`)
`chooseLayout()` tries three HUD layouts and keeps the one with the largest tile size:
- **wide** (≥1180 px): HUD panels at the sides
- **mid** (≥900 px): panels top and bottom
- **narrow** (<900 px): phone; stacked panels, no tip box

Each layout reserves `top/bot/side` margins. Pathos-4 reserves extra top space for its big readout. Tiles are clamped to 10–52 px. `layout()` runs on start and on resize, and rebuilds sprites for the new tile size.

### Sprites (`render/sprites.js`)
- **Pre-rendering:** tiles are drawn once per tile size into offscreen canvases.
  - `SPR.var[column parity][variant]` holds hidden tiles. Tilesets 1, 3, 4 and 5 get 4 random variants, picked per tile by the hash `vh(i)`, so textures don't repeat visibly. Steel and the dance floor use one. Only the lawn differs by column parity (mowing stripes).
  - Adding a tileset means extending the `ts===…` chains in `buildSprites()`.
  - `SPR.hov` (hover), `SPR.open`, `SPR.num[n]`, `SPR.crater`.
- **Tilesets:**

  | # | Tileset |
  |---|---|
  | 0 | Brushed steel (Sector B-4) |
  | 1 | Sandstone |
  | 2 | Dance floor (glow overlay pulses to the beat) |
  | 3 | Ice (frost glints) |
  | 4 | Lawn (mowing stripes by column parity, flowers drawn per tile) |
  | 5 | Corroded bulkhead (rust, algae, rivets, condensation) |

- **Numbers:** drawn with the Teko font. Sprites are rebuilt when web fonts finish loading.

### Scenery (`render/scenery.js`)
- **Two functions per chapter:**
  - `BUILD[theme](w, h)` bakes the static parts into an offscreen canvas `SC.st`, cached by theme, size and dpr.
  - `DRAW[theme](g, w, h, t, dt)` draws that bake plus animated layers: embers, fog, sun flare, birds, heat shimmer, aurora, snow, club lights synced to 124 BPM, fish behind portholes, rising water.
- **Title backdrop:** `drawTitle` renders the title-screen backdrop.

### Particles (`render/particles.js`)
- **Pool:** one array `P` of plain objects `{t: type, x, y, vx, vy, g (gravity), drag, life, s (size), ...}`, created with `emit()`.
- **Types:** spark, smoke, dust, glint, flash, ring, chunk, confetti, bubble.
- **Explosions:** `explode(x, y)` makes the mine blast.

### Blood (`render/blood.js`)
- **Splats:** `BL` holds splats (pre-rendered at 1×, at most 18) with drips, plus hit-direction indicators.
- **Fade-out:** they fade as health regenerates. The `blood` setting turns them off.

## 6. HUD and notifications

- **DOM panels:**
  - `#quests`: main quest objectives and the tracked side quest
  - `#tr`: minimap, coins, season tier, mute and menu buttons
  - `#feed`: kill feed
  - `#radio`: transmission panel
  - `#subs`: subtitles, up to three lines
  - `#player`: level, XP, health with a trailing bar
  - `#ammo`: mines remaining, flags, timer, "equipped" item
  - `#prompts`: key hints
  - `#tip`, `#autosave`, `#combo`, `#chapter`, `#o2` (Pathos-4 readout)
- **Refresh:** `updateHUD()` rebuilds the slow-changing parts after events. `updateHUDframe()` updates per-frame values (timer, health, compass, minimap).
- **Notifications are queued so they never stack illegibly:**
  - `notify()`: toasts, one at a time, 3.2 s each
  - `banner()`: centre banners, 2.85 s each
  - `addFeed()`: kill feed, at most 6 lines
  - `popAt()`: floating +XP text
  - `unlock(id)`: grants an achievement once (toast, sound, Gamerscore, a voiced "Achievement unlocked")

## 7. Input (`game/input.js`)

- **Pointer:**
  - left click or tap reveals
  - right click flags
  - long-press (touch) flags
  - Flag Mode button for touch
  - clicking a revealed number chords
- **Keyboard:**

  | Key | Action |
  |---|---|
  | Arrows / WASD | Move the cursor |
  | Space / Enter | Reveal |
  | X / Q | Flag |
  | F | Pay respects |
  | M | Mute |
  | J / K / B | Quest log / skills / store |
  | Esc | Pause |

  Menus support arrow keys. In credits, Space/Enter fast-forwards and Esc skips. In the intro, Space/Enter/Esc held down skips.
- **Pausing:** the game pauses when the tab is hidden.

## 8. Persistence

- **Storage keys:** `localStorage` keys are prefixed `aaasweep.`. Every access is wrapped in try/catch, so the game works with storage blocked.
- **Settings** (`aaasweep.settings`): `master, music, voice, sfx` (0–1), `subs, grain, sway, blood, muted` (bool), `chatter` (`off|normal|constant|unbearable`), and `sv` (settings version; `sv:2` migrated the old default `constant` to `normal`).
- **Profile** (`aaasweep.profile`):
  - progression: `xp, lvl, coins, skill` (unspent points), `perks{}`
  - cosmetics: `owned{}` skins, `skin`, `boostUntil` (XP booster)
  - achievements: `ach{}`, `gs` (Gamerscore)
  - `lore` (fragments found), `maxField` (highest unlocked chapter)
- A field in progress is not saved.

## 9. Builds

| Command | Output | Use |
|---|---|---|
| `npm run dev` | Vite dev server, live reload | Development |
| `npm run build` | `dist/triple-a-sweeper.html`: one 6 MB file | Sharing; works from `file://` |
| `npm run build:artifact` | `dist/triple-a-sweeper.artifact.html` | Fragment format for a claude.ai Artifact (title first, no doctype/head) |
| `npm run build:site` | `dist/site/`: hashed JS/CSS, fonts, `voices/` | Any static web host (relative paths) |

`tools/build/build-single.mjs`:
1. Bundles `js/main.js` with esbuild into one IIFE.
2. Concatenates the CSS files in `index.html` order.
3. Replaces the self-hosted font CSS with the Google Fonts `<link>` (`tools/build/google-fonts.html`).
4. Inlines every voice MP3 as base64 into `window.__VOICE_B64`. `voice-bank.js` uses it when present, otherwise it `fetch`es `voices/<id>.mp3`.

**How the split was made.** `tools/legacy/migration/split.mjs` parses the original script with Babel and assigns each top-level statement to a module by section. It computes every cross-module reference to generate `import`/`export` lines, and moves cross-module-assigned variables onto `ST`. It also checks evaluation order for TDZ hazards. It is kept as a reference; the modules are now the source of truth.

## 10. Recipes

**Add a chapter**
1. Add an entry to `FIELDS` (`js/data/fields.js`): `bg` (scenery key), `ts` (tileset index), `mus` (music theme), `ach`, names and texts, `vo` (announcer line id), `start`, `win[2]`, `giver`.
2. Scenery: add `BUILD.<bg>` and `DRAW.<bg>` in `render/scenery.js`.
3. Tileset: add `plateX()`/`openX()` in `render/sprites.js` and wire them into the `ts===…` chains in `buildSprites()` (hidden, hover, open) and `craterSprite()`. Add a board-frame colour pair to `FR` and a corner-rivet colour in `render/draw-game.js`.
4. Music: see [MUSIC.md](MUSIC.md#7-adding-a-theme).
5. Chatter: add `CHAT.<bg>` in `data/dialogue.js` and generate the lines (see [VOICES.md](VOICES.md)).
6. If it changes the HUD, check all three layouts with `npm run smoke` and `--mobile`.

**Add a sound effect:** add a method to `S` in `audio/sfx.js` using `osc()`/`nz()`, sending to `A.sfx` (and `A.sendS` for reverb).

**Add an achievement:** add it to `ACH` in `data/content.js` as `[name, description, gamerscore]`, and call `unlock('key')` where it happens.

**Add a voice line:** see [VOICES.md](VOICES.md#adding-a-line).
