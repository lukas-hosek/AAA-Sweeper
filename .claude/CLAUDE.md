# Triple A Sweeper

Classic Minesweeper parodying AAA-game tropes:
- a Win98 desktop and launcher, middleware intro and title screen
- six chapters with procedural scenery, tilesets and synthesised music
- 197 TTS radio voice lines, quest marker, regenerating health, XP and store
- a flooding underwater level (Pathos-4) and 1,412 credits that all read "Claude"

The game is **plain JavaScript ES modules + CSS + one `index.html`: no framework, no runtime dependencies, no build step.** All graphics are procedural (Canvas 2D), and all music and sound effects are synthesised live (Web Audio). The only binary assets are the voice MP3s, the fonts and the favicon, all in `assets/`.

The owner is a graphics/rendering engineer, not a web developer. Explain web-specific things briefly when they matter.

## Tooling

- **No Node.js, npm or npx.** The owner doesn't use them. Don't suggest installing them or any npm package.
- **The tools are Python and shell scripts, plus the standalone Biome binary.**
  - Python packages are pinned in `requirements.txt` and live in `.venv/`.
  - Run Python tools with `.venv/bin/python`; no activation is needed.
  - `tools/serve.py` and `tools/ost/encode_ost.py` use only the standard library.
- **Installed on this machine:**
  - Python 3.12
  - Playwright 1.63.0 with its own Chromium in `~/.cache/ms-playwright/`
  - Kokoro TTS (`kokoro-onnx` 0.6.1, model in `tools/tts/models/`)
  - ffmpeg
  - Biome 2.5.15 (`~/.local/bin/biome`)
  - system Chromium (`/usr/bin/chromium`, used for VS Code debugging)
  - `scripts/setup.sh` recreates the Python side if needed.

```bash
scripts/startup.sh              # dev server at http://localhost:8080 in the background (no-op if already running)
scripts/shutdown.sh             # stop the dev server (only when the owner asks, see below)
scripts/smoke.sh                # headless play-through of every screen and chapter; must end with "all good"
scripts/smoke.sh --mobile       # same at 390x844 touch
biome lint                      # correctness check of js/ and css/; must report nothing
.venv/bin/python tools/browser/screenshot.py --chapter 5 --flood   # screenshot any state (options in the file header)
scripts/bake_voices.sh <ids>    # TTS voice lines -> assets/voices/<id>.mp3 + manifest (--check, --force, --say)
scripts/export_ost.sh [themes]  # soundtrack: cover, WAV render, MP3/FLAC, zips -> out/ost/
scripts/setup.sh                # (re)create .venv, Playwright's Chromium, TTS model files
```

Generated output goes to `out/` (screenshots, soundtrack, TTS previews, server log). It is gitignored.

## Dev server

- **Keep it running.** The owner plays the game at http://localhost:8080 (add `?debug` for the `__t` test hooks).
  - If it isn't running, start it with `scripts/startup.sh`.
  - **Don't stop or restart it** unless the owner asks.
  - Edits don't need a restart: the server sends no-cache headers, so a browser refresh loads the current files.
- **The tests don't use it.** The browser tools start their own private server on a free port. `--url http://localhost:8080/` makes them use the running one.
- **It serves only `index.html`, `css/`, `js/` and `assets/`** and answers 404 for everything else. Game code that refers to another folder is a bug.
- **Hosting** the game means copying those four items.

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
assets/           fonts/ (self-hosted woff2), voices/ (<id>.mp3, committed), favicon.svg
scripts/          setup, startup, shutdown, smoke, bake_voices, export_ost (bash wrappers)
tools/            serve.py, lib/env.py (Playwright helpers), browser/ (smoke, screenshot), ost/, tts/, legacy/
docs/             GAME_DESIGN, ARCHITECTURE, AUDIO, MUSIC, VOICES, TESTING, SETUP (+ images/)
reference/        original single-file game (v11) + history/ snapshots; read-only
requirements.txt  pinned Python packages;  biome.json  lint config;  .vscode/  tasks, launch, settings
```

Read the matching doc before larger work:
- `docs/ARCHITECTURE.md`: modules, `ST`, rendering, layout, serving, and recipes for chapters, tilesets and achievements
- `docs/AUDIO.md` and `docs/MUSIC.md`: sound
- `docs/VOICES.md`: TTS lines
- `docs/GAME_DESIGN.md`: tone, cast, systems
- `docs/TESTING.md`: hooks, tools, lint

## Git: non-destructive commands only

The owner stages, commits, merges and pushes.
- **Allowed:** read-only commands such as `git status`, `diff`, `log`, `show`, `blame`, `grep` and `ls-files`.
- **Not allowed:** `add`, `commit`, `push`, `pull`, `merge`, `rebase`, `reset`, `checkout`/`restore` of files, `stash`, `clean`, `tag`, and deleting branches.
- **Moving or deleting files:** use plain `mv`/`rm`, not `git mv`/`git rm`.
- **When done:** tell the owner which files changed.

## Biome: correctness checks, never formatting

- **Config:** `biome lint` uses `biome.json`.
  - It checks `js/**` and `css/**`.
  - It keeps the correctness and suspicious rule groups.
  - The style and complexity groups are off, because they fight the compact code. The formatter and import sorting are off too.
- **Valuable rule:** `noUndeclaredVariables` catches missing imports and typos, which in ES modules otherwise fail only at runtime when that path executes.
- **Clean baseline:** the code currently has zero diagnostics, so every finding is new. Fix findings by hand, in the surrounding style.
- **Never run** `biome format`, `biome check --write`, `biome lint --write`/`--fix` or `biome migrate --write`, and never reformat existing code.
- If a rule flags an intentional house idiom, ask the owner before changing `biome.json`.

## Testing with Playwright

- **Python Playwright, sync API.** The helpers are in `tools/lib/env.py`: `serve_game`, `launch`, `new_page` (collects errors in `page.errors`), `open_game` (loads with `?debug`) and `t(page, expr)`. For a one-off investigation, copy `tools/browser/screenshot.py`.
- **Failures:** the smoke test fails on uncaught exceptions, `console.error` and HTTP ≥ 400.
- **Look at the screenshots** in `out/smoke/`, or take targeted ones. Layout problems don't throw errors.
- **Audio** in headless runs: Chromium is launched with an autoplay flag, and `__t.audio()` creates the AudioContext. Verify sound through state (`__t.mus()`, `__t.voicesLoaded()`). For music changes, render with `.venv/bin/python tools/ost/render_ost.py <theme>` and inspect loudness and a spectrogram with ffmpeg (docs/TESTING.md).

## Voice lines (Kokoro TTS)

1. Add the line to the newest batch in `tools/tts/lines.py`. Spell names out for TTS ("Pathos four"), and put the display subtitle in the 4th tuple field.
2. `scripts/bake_voices.sh <id>` writes `assets/voices/<id>.mp3` and the manifest entry. It takes about a second per line on the CPU.
3. Wire it into `CHAT` / `SHARED` / `REPEATS` / `PIN` / `QUEST_ON_LINE` / `bark()` in `js/data/dialogue.js` or the game code. Batch-1 subtitles live in `SUBS`.
4. Check with `scripts/bake_voices.sh --check`, `biome lint` and `scripts/smoke.sh`.

Baked MP3s are committed by the owner; the model files are not. The radio effects (filtering, saturation, echo, squelch) are applied live in `js/audio/voices.js`, not baked into the MP3s.

## Rules that bite

- **Shared mutable state lives on `ST`** (`js/core/shared.js`):
  - `ST.G` (current field), `ST.T`, `ST.BX/BY/BW/BH`, `ST.W/H/dpr`, `ST.LK`, `ST.flagMode`, `ST.kbdOn`, `ST.press`, `ST.menuState`, `ST.O2K`.
  - ES imports are read-only. A module-level `let` that another module must reassign goes on `ST`.
  - Mutating exported objects (`settings`, `PROFILE`, `A`, `VM`...) is fine.
- **Load order:** don't add load-time code that reads a `const`/`let` from a module that `main.js` imports later (TDZ). Calling imported `function`s is fine.
- **Audio:**
  - It needs a user gesture.
  - Every audio path checks `A.ctx`.
  - In headless runs, call `__t.audio()`.
  - Never block gameplay on audio.
- **Minesweeper must stay fair and fully playable.** AAA jokes may decorate the puzzle but never break it: the first click is safe, and the quest marker always points at a safe tile.
- **Pitched sound effects must not clash with the chapter's music key.** The Pathos-4 klaxon was removed for this reason; prefer unpitched sounds there.
- **Writing:** UI copy and voice lines are deadpan parody (GAME_DESIGN.md §9). Never name real brands, games or people.
- **Style:**
  - The code is intentionally compact (it came from a single-file original); match the surrounding style.
  - No new runtime dependencies, and no build step.
  - Keep everything procedural unless asked otherwise.
- **Layouts:** there are three HUD layouts (wide ≥1180 px, mid ≥900, narrow), plus extra top space on Pathos-4. Check desktop and `--mobile` after UI changes.

## Workflow

1. Make the change in `js/` / `css/` / `index.html` (or `tools/tts/lines.py` for dialogue).
2. Run `biome lint`; it must report nothing.
3. Run `scripts/smoke.sh` (plus `--mobile` for UI work). It must pass with no page errors.
4. **Look at the screenshots.**
5. For audio, check state via hooks; for music, render and inspect.
6. Summarise for the owner what changed, what you verified, and which files to commit.

## Reference material (read-only: don't edit, don't run)

- **`reference/`:**
  - `triple-a-sweeper-v11.html` is the last single-file version, with the voices embedded. It opens directly in a browser, so you can compare behaviour and check whether a regression is new.
  - `reference/history/` holds the single-file source at each milestone (v1–v7).
- **`tools/legacy/`:** the original one-off scripts from building the single-file game. They include the TTS batch scripts, the feature patch scripts, the Python Playwright tests and the AST splitter (`migration/split.mjs`) that produced `js/`.
  - **Search them** to see how a feature was originally built or tested.
  - **Don't run them:** they contain absolute paths from another machine.
  - **Outdated pointers:** their README's "Now …" entries name files that no longer exist (`tools/build/`, `*.mjs`). The current tools are in `tools/` and `scripts/`.
- **`.claude/CLAUDE-orig.md`:** the previous version of this file, from the npm era. Kept for the owner's reference; it is outdated, so don't follow it.
