# Triple A Sweeper

Classic Minesweeper parodying AAA-game tropes:
- a Win98 desktop and launcher, middleware intro and title screen
- six chapters with procedural scenery, tilesets and synthesised music
- 197 TTS radio voice lines, quest marker, regenerating health, XP and store
- a flooding underwater level (Pathos-4) and 1,412 credits that all read "Claude"

The game is **plain JavaScript ES modules + CSS, no framework, no runtime dependencies.** All graphics are procedural (Canvas 2D), all music and sound effects are synthesised live (Web Audio). The only binary assets are the voice MP3s and the fonts.

The owner is a graphics/rendering engineer, not a web developer. Explain web-specific things briefly when they matter.

## Commands

```bash
npm run dev                  # Vite dev server with live reload (http://localhost:5173, add ?debug for test hooks)
npm run smoke                # headless play-through of every screen and chapter; must end with "all good"
npm run smoke -- --mobile    # same at 390x844 touch
node tools/browser/screenshot.mjs --chapter 5 --flood       # screenshot any state (options listed in the file header)
npm run build                # single file dist/triple-a-sweeper.html (voices inlined); build:artifact / build:site
npm run smoke:single         # smoke-test the single-file build (run npm run build first)
source .venv/bin/activate && python3 tools/tts/generate_voices.py <ids>   # TTS voice lines
python3 tools/tts/generate_voices.py --check                              # lines.py / mp3 / manifest consistency
npm run ost:cover && npm run ost   # render + encode the soundtrack to out/ost/
```

Generated output goes to `out/` (tests, screenshots, soundtrack) and `dist/` (builds); both are gitignored.

## Layout

```
index.html        all screen markup; links css/*.css in cascade order; loads js/main.js
css/              base, desktop, intro, title, game, overlays, credits, layouts (+ fonts.css)
js/main.js        imports every module in a fixed order, runs the rAF loop
js/core/          shared.js (ST), util.js, storage.js
js/data/          dialogue.js, content.js, fields.js, voice-manifest.js (GENERATED, do not edit)
js/audio/         engine.js (graph), sfx.js, instruments.js, music.js (sequencer), voices.js (chatter/radio), voice-bank.js
js/game/          state.js (ST.G), rules.js, update.js, input.js, start.js, events.js, outcome.js, pathos.js
js/render/        layout.js, sprites.js, scenery.js, draw-game.js, hud-canvas.js, particles.js, blood.js
js/ui/            screens.js, hud.js, notify.js, panels.js, radio.js
js/scenes/        desktop.js, intro.js, title.js, credits.js, concept-art.js
js/debug.js       window.__t test hooks + window.__render (music export); loaded only with ?debug
public/voices/    <id>.mp3 voice lines (fetched at runtime)
assets/fonts/     self-hosted fonts (dev); single-file build links Google Fonts instead
tools/            browser/ (smoke, screenshot), build/, ost/, tts/, lib/env.mjs, legacy/ (old scripts, reference only)
reference/        original single-file game (v11) + history snapshots; read-only
docs/             GAME_DESIGN, ARCHITECTURE, AUDIO, MUSIC, VOICES, TESTING, SETUP
```

Read the matching doc before larger work:
- `docs/ARCHITECTURE.md`: modules, ST, rendering, layout, recipes for chapters, tilesets and achievements
- `docs/AUDIO.md` and `docs/MUSIC.md`: sound
- `docs/VOICES.md`: TTS lines
- `docs/GAME_DESIGN.md`: tone, cast, systems
- `docs/TESTING.md`: hooks and tools

## Rules that bite

- **Shared mutable state lives on `ST`** (`js/core/shared.js`): `ST.G` (current field), `ST.T`, `ST.BX/BY/BW/BH`, `ST.W/H/dpr`, `ST.LK`, `ST.flagMode`, `ST.kbdOn`, `ST.press`, `ST.menuState`, `ST.O2K`. ES imports are read-only. A module-level `let` that another module must reassign goes on `ST`. Mutating exported objects (`settings`, `PROFILE`, `A`, `VM`...) is fine.
- **Load order:** don't add load-time code that reads a `const`/`let` from a module `main.js` imports later (TDZ). Calling imported `function`s is fine.
- **Audio:** needs a user gesture. Every audio path checks `A.ctx`. In headless runs call `__t.audio()`. Never block gameplay on audio.
- **Minesweeper must stay fair and fully playable.** AAA jokes may decorate, never break the puzzle (first click safe, quest marker always safe).
- **Pitched sound effects must not clash with the chapter's music key.** The Pathos-4 klaxon was removed for this; prefer unpitched sounds there.
- **Writing:** UI copy and voice lines are deadpan parody (see GAME_DESIGN.md §9). Never name real brands, games or people.
- **Voice lines:** after adding one to `tools/tts/lines.py`, generate it, then wire it into `CHAT` / `SHARED` / `PIN` / `bark()` in `js/data/dialogue.js` or the game code. Batch-1 subtitles live in `SUBS`.
- **Style:** the code is intentionally compact (it came from a single-file original). Match the surrounding style. No new runtime dependencies. Keep everything procedural unless asked otherwise.
- **Layouts:** three HUD layouts (wide ≥1180 px, mid ≥900, narrow) plus Pathos-4 extra top space. Check desktop and `--mobile` after UI changes.
- `reference/` and `tools/legacy/` are historical. Don't edit them; don't run legacy scripts (they have absolute paths from another machine).

## Workflow

1. Make the change in `js/` / `css/` / `index.html` (or `tools/tts/lines.py` for dialogue).
2. Run `npm run smoke` (plus `-- --mobile` for UI work). It must pass with no page errors.
3. **Look at the screenshots** in `out/smoke/` or take targeted ones with `tools/browser/screenshot.mjs`. Layout problems don't throw errors.
4. For audio, check state via hooks (`__t.mus()`, `__t.voicesLoaded()`). For music changes, render with `node tools/ost/render-ost.mjs <theme>` and inspect loudness and spectrogram with ffmpeg.
5. If the change affects the shipped file, run `npm run build && npm run smoke:single`.
6. Summarise for the owner what changed and what you verified.

Python tools need the venv: `source .venv/bin/activate` (created per docs/SETUP.md). Playwright uses its own Chromium; set `CHROME_PATH` to override.
