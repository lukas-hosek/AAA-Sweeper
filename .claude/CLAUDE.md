# Triple A Sweeper

Classic Minesweeper parodying AAA-game tropes:
- a Win98 desktop and launcher, middleware intro and title screen
- six chapters with procedural scenery, tilesets and synthesised music
- 197 TTS radio voice lines, quest marker, regenerating health, XP and store
- a flooding underwater level (Pathos-4) and 1,412 credits that all read "Claude"
- but underneath it, it is still a fully working Minesweeper game

The game is **plain JavaScript ES modules + CSS + one `index.html`: no framework, no runtime dependencies, no build step.** All graphics are procedural (Canvas 2D), and all music and sound effects are synthesised live (Web Audio). The only binary assets are the voice MP3s, the fonts and the favicon, all in `assets/`.

The owner is a graphics/rendering engineer, not a web developer. Explain web-specific things briefly when they matter.

## Tooling

- **No Node.js, npm or npx.** The owner doesn't use them. Don't suggest installing them or any npm package.
- **The tools are Python and shell scripts, plus the standalone Biome binary.**
  - Python packages are pinned in `requirements.txt` and live in `.venv/`.
  - Run Python tools with `.venv/bin/python`; no activation is needed.
  - `tools/serve.py`, `tools/check_style.py` and `tools/ost/encode_ost.py` use only the standard library.
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
biome lint                      # correctness and naming check of js/ and css/; must report nothing
scripts/check_style.sh          # formatting, blank lines, short names, load order; must say "style ok"
scripts/unit_tests.sh           # Minesweeper fairness unit tests
scripts/golden.sh compare       # screenshots and audio against a recorded baseline (record one before refactoring)
.venv/bin/python tools/browser/screenshot.py --chapter 5 --flood   # screenshot any state (options in the file header)
scripts/bake_voices.sh <ids>    # TTS voice lines -> assets/voices/<id>.mp3 + manifest (--check, --force, --say)
scripts/export_ost.sh [themes]  # soundtrack: cover, WAV render, MP3/FLAC, zips -> out/ost/
scripts/setup.sh                # (re)create .venv, Playwright's Chromium, TTS model files
```

Generated output goes to `out/` (screenshots, golden baselines, soundtrack, TTS previews, server log). It is gitignored.

## Dev server

- **Keep it running.** The owner plays the game at http://localhost:8080 (add `?debug` for the `window.testHooks` test hooks, `?seed=N` for a reproducible board).
  - If it isn't running, start it with `scripts/startup.sh`.
  - **Don't stop or restart it** unless the owner asks.
  - Edits don't need a restart: the server sends no-cache headers, so a browser refresh loads the current files.
- **The tests don't use it.** The browser tools start their own private server on a free port. `--url http://localhost:8080/` makes them use the running one.
- **It serves only `index.html`, `css/`, `js/` and `assets/`** and answers 404 for everything else. Game code that refers to another folder is a bug.
- **Hosting** the game means copying those four items.

## Layout

```
index.html        all screen markup; links css/*.css in cascade order; loads js/main.js
css/              base (tokens), desktop, intro, title, game, hud, overlays, credits, layouts (+ fonts.css)
js/main.js        Application: Init() order, frame loop, ?seed
js/core/          dom, math, random, time, local-store, settings, player-profile, canvas-fonts
js/data/          tables and text: characters, subtitles, chatter, achievements, side quests, store, texts,
                  difficulties, tuning (TUNING), credits-text, desktop-text, voice-manifest.js (GENERATED, do not edit)
js/audio/         audio-engine, sound-effects, instruments, music-sequencer + themes/, voice-bank, voice-manager, chatter-scheduler
js/game/          minefield, field, game, chapter + chapters (registry), mission, player-actions, progression,
                  flood-controller, mission-outcome, events/, input/
js/render/        layout, camera, game-renderer, board-renderer, sprite-cache, tilesets/, scenery/, particles,
                  blood-overlay, underwater, quest-marker, hud/ (compass, minimap, radio waveform)
js/ui/            screen-manager, hud, toasts, banners, kill-feed, callouts, achievements, radio-panel,
                  portrait-painter, oxygen-readout, pause-menu, panel/ (tabbed panel and its tabs)
js/scenes/        desktop/, intro-scene, title-scene, credits/ (roll, concept art)
js/debug.js       window.testHooks + window.musicExporter; loaded only with ?debug
assets/           fonts/ (self-hosted woff2), voices/ (<id>.mp3, committed), icons.svg, favicon.svg
scripts/          setup, startup, shutdown, smoke, golden, unit_tests, check_style, bake_voices, export_ost (bash wrappers)
tools/            serve.py, check_style.py, lib/env.py (Playwright helpers), browser/ (smoke, golden, unit tests,
                  screenshot), ost/, tts/, legacy/
docs/             GAME_DESIGN, ARCHITECTURE, AUDIO, MUSIC, VOICES, TESTING, SETUP (+ images/),
                  characters/ (one file per speaker), levels/ (one file per chapter)
reference/        original single-file game (v11) + history/ snapshots; read-only
requirements.txt  pinned Python packages;  biome.json  lint config;  jsconfig.json  type checking;  .vscode/  tasks, launch, settings
```

Read the matching doc before larger work:
- `docs/ARCHITECTURE.md`: module map, Init() order, load order, state ownership, chapters, rendering, and recipes for chapters, tilesets, themes, sound effects, achievements and panel tabs
- `docs/AUDIO.md` and `docs/MUSIC.md`: sound
- `docs/VOICES.md`: TTS lines
- `docs/GAME_DESIGN.md`: tone, cast, systems
- `docs/TESTING.md`: smoke, golden, unit tests, lint, style check, type checking, hooks
- `docs/characters/`: one file per character: personality, quirks, story arc, where they appear, their event barks and shared lines
- `docs/levels/`: one file per chapter: original prompt, artistic intention, mechanics, cast and the full text of its unique voice lines

**Keep `docs/characters/` and `docs/levels/` up to date.** Any change to a voice line, a speaker, a chapter, chatter wiring (`js/data/chatter.js`), victory or opening lines, or a side quest must update the matching files in the same change. A new speaker or chapter gets a new file and a row in that folder's README. Quote lines by their subtitle text.

## Git: non-destructive commands only

The owner commits, merges and pushes.
- **Allowed:** read-only commands such as `git status`, `diff`, `log`, `show`, `blame`, `grep` and `ls-files`.
- **Allowed only when the owner asks:** `git add` (staging). It isn't destructive, but don't stage anything on your own initiative.
- **Not allowed:** `commit`, `push`, `pull`, `merge`, `rebase`, `reset`, `checkout`/`restore` of files, `stash`, `clean`, `tag`, and deleting branches.
- **Moving or deleting files:** use plain `mv`/`rm`. `git mv` and `git rm` also stage the change, so the same rule as `git add` applies to them.
- **When done:** tell the owner which files changed.

## Biome: checks, never formatting

- **Config:** `biome lint` uses `biome.json`.
  - It checks `js/**`, `css/**` and the unit tests.
  - It keeps the correctness and suspicious rule groups, plus `useNamingConvention` for the naming rules below.
  - The rest of the style group and the complexity group are off. The formatter and import sorting are off too.
- **Valuable rule:** `noUndeclaredVariables` catches missing imports and typos, which in ES modules otherwise fail only at runtime when that path executes.
- **Clean baseline:** the code has zero diagnostics, so every finding is new. Fix findings by hand.
- **Never run** `biome format`, `biome check --write`, `biome lint --write`/`--fix` or `biome migrate --write`. The Biome formatter would rewrite the code in its own style (it collapses the double blank lines, for example).
- If a rule flags an intentional house idiom, ask the owner before changing `biome.json`.

## Testing with Playwright

- **Python Playwright, sync API.** The helpers are in `tools/lib/env.py`: `serve_game`, `launch`, `new_page` (collects errors in `page.errors`), `open_game` (loads with `?debug`) and `t(page, expr)`. For a one-off investigation, copy `tools/browser/screenshot.py`.
- **Failures:** the smoke test fails on uncaught exceptions, `console.error` and HTTP ≥ 400.
- **Look at the screenshots** in `out/smoke/`, or take targeted ones. Layout problems don't throw errors.
- **Refactoring:** record a golden baseline first (`scripts/golden.sh record`), compare after. It catches visual and audio changes that the smoke test can't. `--coverage` lists functions no scenario ran.
- **Audio** in headless runs: Chromium is launched with an autoplay flag, and `testHooks.InitAudio()` creates the AudioContext. Verify sound through state (`testHooks.CurrentMusicTheme()`, `testHooks.DecodedVoiceCount()`). For music changes, render with `.venv/bin/python tools/ost/render_ost.py <theme>` and inspect loudness and a spectrogram with ffmpeg (docs/TESTING.md).

## Voice lines (Kokoro TTS)

1. Add the line to the newest batch in `tools/tts/lines.py`. Spell names out for TTS ("Pathos four"), and put the display subtitle in the 4th tuple field.
2. `scripts/bake_voices.sh <id>` writes `assets/voices/<id>.mp3` and the manifest entry. It takes about a second per line on the CPU.
3. Wire it in: `CHAPTER_CHATTER` / `SHARED_CHATTER` / `REPEATABLE_LINES` / `PINNED_LINES` / `SIDE_QUEST_AFTER_LINE` in `js/data/chatter.js`, or `voices.Bark()` in the game code. Batch-1 subtitles live in `js/data/subtitles.js`.
4. Document it in `docs/levels/<chapter>.md` (chapter lines) or `docs/characters/<speaker>.md` (barks, shared lines), and update the speaker's arc if the line moves their story.
5. Check with `scripts/bake_voices.sh --check`, `biome lint` and `scripts/smoke.sh`.

Baked MP3s are committed by the owner; the model files are not. The radio effects (filtering, saturation, echo, squelch) are applied live in `js/audio/voice-manager.js`, not baked into the MP3s.

## Rules that bite

- **Init() order, not load order:** constructors only set their own fields and look up DOM nodes. Event wiring and anything that calls another module goes into an `Init()` method, called from `Application.Start()` in `main.js`.
- **Load order:** never `extends` or `new` (at module level, in a field initialiser or in a singleton's constructor) a class imported from a module in the same import cycle; whether it exists yet then depends on which module loads first. Base classes import only downwards, and `game.js`/`field.js` stay leaf state modules. `scripts/check_style.sh` reports violations (ARCHITECTURE.md §3).
- **One owner per piece of state** (ARCHITECTURE.md §4). ES imports are read-only, so state that others change lives on the owning singleton (`game.field`, `layout.board`, `input.flagMode`...), never in a module-level `let`.
- **Randomness:** draw every random number through `random` (`js/core/random.js`), never `Math.random`, so `?seed=N` and the golden comparison stay reproducible. Keep the order of draws in per-frame code stable unless the change is intended.
- **Gameplay numbers** go into `TUNING` (`js/data/tuning.js`), not inline.
- **Audio:**
  - It needs a user gesture.
  - Every audio path checks `audioEngine.context`.
  - In headless runs, call `testHooks.InitAudio()`.
  - Never block gameplay on audio.
- **Minesweeper must stay fair and fully playable.** AAA jokes may decorate the puzzle but never break it: the first click is safe, and the quest marker always points at a safe tile. `scripts/unit_tests.sh` checks this.
- **Pitched sound effects must not clash with the chapter's music key.** The Pathos-4 klaxon was removed for this reason; prefer unpitched sounds there.
- **Writing:** UI copy and voice lines are deadpan parody (GAME_DESIGN.md §9). Never name real brands, games or people.
- **No new runtime dependencies, and no build step.** Keep everything procedural unless asked otherwise.
- **Layouts:** there are three HUD layouts (wide ≥1180 px, mid ≥900, narrow), plus extra top space on Pathos-4. Check desktop and `--mobile` after UI changes.

## Workflow

1. Make the change in `js/` / `css/` / `index.html` (or `tools/tts/lines.py` for dialogue).
2. Run `biome lint` and `scripts/check_style.sh`; both must report nothing. VS Code's Problems panel (type checking) should show no errors.
3. Run `scripts/smoke.sh` (plus `--mobile` for UI work). It must pass with no page errors. Run `scripts/unit_tests.sh` after touching the Minesweeper rules, and `scripts/golden.sh compare` after a refactor.
4. **Look at the screenshots.**
5. For audio, check state via hooks; for music, render and inspect.
6. If the change touched characters, chapters or voice lines, update `docs/characters/` and `docs/levels/`.
7. Summarise for the owner what changed, what you verified, and which files to commit.

## Reference material (read-only: don't edit, don't run)

- **`reference/`:**
  - `triple-a-sweeper-v11.html` is the last single-file version, with the voices embedded. It opens directly in a browser, so you can compare behaviour and check whether a regression is new.
  - `reference/history/` holds the single-file source at each milestone (v1–v7).
- **`tools/legacy/`:** the original one-off scripts from building the single-file game. They include the TTS batch scripts, the feature patch scripts, the Python Playwright tests and the AST splitter (`migration/split.mjs`) that produced the first version of `js/`.
  - **Search them** to see how a feature was originally built or tested.
  - **Don't run them:** they contain absolute paths from another machine.
  - **Outdated pointers:** their README's "Now …" entries name files that no longer exist (`tools/build/`, `*.mjs`). The current tools are in `tools/` and `scripts/`.
- **`.claude/CLAUDE-orig.md`:** the previous version of this file, from the npm era. Kept for the owner's reference; it is outdated, so don't follow it.

## JS Coding Rules

- K&R style brackets.
- Use tabs instead of spaces. 1 tab = 4 spaces.
- Separator between classes / methods / other top-level structures: **2 empty lines**.
- Use `class`, `extends` - classes explicitly and fully declared. User is a C++ programmer and likes this style.
- **No terse variable / class / method names**. Naming a variable `i` or `x` is only acceptable when the variable is a loop counter or a vector component. Names should be self-documenting.
- Class declarations should be commented - ideally a single line comment for every member.
- Function and method bodies should be commented. Always explain **why**, not **how**. Comments should be **short**. Obvious stuff does not need to be commented.
- Prefer methods placed inside classes to free functions. Only use free functions if the function does not logically belong to any existing class (don't create classes with just static methods just for the sake of fulfilling this rule).

### Naming conventions

- variableName (lower case camel)
- #privateVariableName - native JS convention, use privates whenever applicable
- ClassName (upper case camel)
- MethodName, FunctionName (upper case camel)
- CONSTANT_NAME (upper snake case for true constants)

### Conventions settled during the rewrite

- **Acronyms stay in capitals:** `HUD`, `XP`, `UI`, `SFX` are never written as words (`hud.Refresh()`, `XPForLevel()`, `earnedXP`). Only at the start of a camelCase name are they all lower case (`hudPanel`, `xpBar`).
- **Getters and setters** are `camelCase` (they read like properties: `playerActions.canAct`). Private methods are `#PascalCase`.
- **Singletons:** a module's one instance is exported in `camelCase` (`export const audioEngine = new AudioEngine()`).
- **Data tables** are `CONSTANT_CASE` with `camelCase` keys (`TUNING.health.mineDamage`). Frozen enums use `CONSTANT_CASE` keys (`TILE.HIDDEN`, `LAYOUT_KIND.WIDE`). Tables keyed by voice ids keep the ids (`a_ch1`).
- **Short names:** besides loop counters (`i`, `j`, `k`) and components (`x`, `y`, `dx`, `r`, `g`, `b`, `a`...), only `id`, `xp` and `_` (an unused parameter). Spell out the rest: `context`, not `ctx`; `deltaTime`, not `dt`.
- **Comments:** `/** one line */` above every class and method (VS Code shows it on hover), a trailing `//` comment on class members, short `//` "why" comments in bodies.
- **Files:** one main class per file, named after it in kebab-case (`AudioEngine` → `audio-engine.js`). Families of related classes go in a subfolder with their base class. Each file starts with a `/** file.js: purpose */` header, then imports sorted by path, constants, the class, and the singleton export.
- **Formatting:** braces always, even around a one-line `if`; one statement per line; at most 140 columns; a single blank line at most inside functions. Fields at the top of a class, without blank lines between them.
- **DOM:** ids, classes and data attributes are kebab-case (`#game-canvas`, `.hud-panel`, `data-pause-item`). State classes start with `is-` (`is-active`, `is-flooded`).
- **Types:** `jsconfig.json` turns on VS Code's type checking for every file. Add JSDoc (`/** @type {string} */`) only where inference needs help. If VS Code shows impossible errors, run "TypeScript: Restart TS Server".
