# Testing and debugging

The game is verified by **driving it in headless Chromium**: a smoke test that plays every screen, a golden comparison that proves a change didn't alter what you see or hear, and unit tests of the Minesweeper rules. Static checks come on top: **Biome** for correctness and naming, a **style check** for the house formatting rules, and **type checking** in VS Code.

The tools work the same for a person and for Claude Code. They run with the project's Python virtual environment (`.venv`, created by `scripts/setup.sh`); the scripts in `scripts/` call `.venv/bin/python` for you. Every browser tool starts its own private copy of the dev server on a free port, so it neither needs nor disturbs the server on :8080.


## Smoke test

```bash
scripts/smoke.sh              # desktop 1440×900
scripts/smoke.sh --mobile     # 390×844 touch phone, DPR 2
scripts/smoke.sh --full       # also click the desktop icon and sit through launcher + intro (~25 s more)
scripts/smoke.sh --url http://localhost:8080/   # test the running dev server instead
```

It takes about 1.5 minutes. `tools/browser/smoke.py` runs these steps:
1. Boots to the desktop, plays the intro (and skips it by holding a key), shows the title screen and checks the title music.
2. **For each of the 6 chapters:** starts it, checks the chapter name, tileset and music theme, clicks the always-safe centre tile plus a few random ones, and takes a screenshot.
3. **Systems:** keyboard cursor, reveal and flag; pause and resume; every panel tab; a store purchase; stepping on a mine (blood); death and the checkpoint; a win and the results screen; voice lines decoding; the Pathos-4 flood and breath readout.
4. **Credits:** rolls them and checks that 1,412 positions are laid out and the credits music plays.

The test fails on any uncaught exception, `console.error`, or HTTP ≥ 400 response. The server answers 404 for anything outside `index.html`, `css/`, `js/` and `assets/`, so a reference to a file that wouldn't be deployed fails here too. Screenshots go to `out/smoke/<viewport>/`.

**Run it after every change.** Then open a few screenshots and look at them. Layout bugs (overlapping HUD panels, text running off screen) don't throw errors.


## Golden comparison

```bash
scripts/golden.sh record                       # play every scenario and store the results as the baseline
scripts/golden.sh compare                      # play them again and compare with the baseline
scripts/golden.sh compare --only title,ch3     # selected scenarios (scripts/golden.sh list shows them)
scripts/golden.sh compare --coverage           # also list game functions that never ran
scripts/golden.sh record --only x --source DIR # record from another copy of the game
```

`tools/browser/golden.py` plays fixed scenarios under a seeded `Math.random` and Playwright's fake clock, so every run produces the same screenshots and audio: the desktop and launcher, the title menus, every chapter, New Game+, the HUD systems, the layouts, the credits, and offline renders of every music theme and sound effect.
- **Screenshots** must match exactly. A few anti-aliased pixels may differ between runs; those are warnings. A real difference writes a diff image (changed pixels in red) to `out/golden/diff/`.
- **Audio** is compared by its 20 ms loudness envelope, because Chromium's reverb tails are not bit-identical between runs.

Use it around refactoring: record before, compare after. A change that is *meant* to alter the output fails the comparison; re-record the affected scenarios with `--only` once you have looked at the diff images. The baseline lives in `out/golden/baseline/` and is not committed.

The order of random draws matters to it: `Mission.Update` and the renderers draw random numbers in a fixed order, and code that adds or removes a draw shifts everything after it.


## Unit tests

```bash
scripts/unit_tests.sh
```

`tools/browser/unit_tests.py` runs `tools/browser/unit/*.test.js` in headless Chromium. Each test file exports `TESTS = {name: check => {...}}` and imports game modules by absolute path (`/js/game/minefield.js`). `minefield.test.js` checks the fairness rules over thousands of seeded boards:
- the first click is always safe, and so is its neighbourhood when there is room
- the mine count is exact and the neighbour counts are correct
- flood fill opens empty regions and their border
- chording only works when the flags match
- the quest marker always points at a hidden safe tile
- a board is cleared exactly when every safe tile is open
- New Game+ wraps around the chapters


## Lint (Biome)

```bash
biome lint            # js/, css/ and the unit tests, configured in biome.json
```

Biome checks **correctness and naming**; it reports and never changes files. The configuration keeps the correctness and suspicious rule groups, plus `useNamingConvention` for the house naming rules (`PascalCase` classes, functions and methods; `camelCase` variables, properties, getters and parameters; `CONSTANT_CASE` constants). The rules that matter most:
- **`noUndeclaredVariables`:** a missing `import` or a typo in a name. In ES modules this otherwise shows up only at runtime, when that code path runs.
- **`noUnusedImports`:** leftovers after a change.

The code is clean, so any finding is new. Fix findings by hand. **Never** run `biome format`, `biome check --write` or `biome lint --write`: the Biome formatter would rewrite the code in its own style (it collapses the double blank lines between methods, for example).


## Style check

```bash
scripts/check_style.sh                      # js/, css/, index.html and the unit tests
scripts/check_style.sh js/game/field.js     # selected files
```

`tools/check_style.py` checks what Biome can't:
- tab indentation, no trailing whitespace, at most 140 columns (long strings excepted)
- K&R braces, braces around every control statement, one statement per line
- two blank lines around top-level items and between methods, at most one inside a function
- no names of two characters or fewer, except loop counters and vector components
- **load order:** no `extends` or load-time `new` of a class imported from the same import cycle (see ARCHITECTURE.md §3)


## Type checking

`jsconfig.json` turns on `checkJs`, so VS Code's built-in TypeScript checks every file as you edit and shows problems in the Problems panel. The target is zero errors; the faded "declared but never read" hints are fine. Where inference needs help, the code uses JSDoc (`/** @type {string} */`).

If VS Code shows errors that make no sense (a missing export that clearly exists), its TypeScript server has missed a change made outside the editor: run **TypeScript: Restart TS Server** from the command palette.


## Screenshots of a specific state

```bash
.venv/bin/python tools/browser/screenshot.py --screen desktop
.venv/bin/python tools/browser/screenshot.py --screen title --mobile
.venv/bin/python tools/browser/screenshot.py --chapter 3 --clicks 8
.venv/bin/python tools/browser/screenshot.py --chapter 1 --boom                 # blood overlay
.venv/bin/python tools/browser/screenshot.py --chapter 5 --flood --breath -11.5 # Pathos-4 underwater, tiny breath value
.venv/bin/python tools/browser/screenshot.py --chapter 2 --diff veteran --size 1280x720 --out out/v.png
.venv/bin/python tools/browser/screenshot.py --screen credits --wait 20000
```

Output goes to `out/shots/` by default. Add `--url http://localhost:8080/` to shoot the running dev server.

**Viewports worth checking:**

| Viewport | Layout | Notes |
|---|---|---|
| 1440×900 | wide | Default |
| 1920×1080 | wide | |
| 1000×760 | mid | |
| 390×844 `--mobile` | narrow | |
| 30×16 boards (`--diff veteran`) | — | Stress the layout |


## Test hooks (`?debug`)

Open the game with `?debug` in the URL (e.g. `http://localhost:8080/?debug`) and `js/debug.js` installs `window.testHooks`. Every hook returns plain data, so the Python tools never touch the game's internals.

| Group | Hooks |
|---|---|
| Screens | `CurrentScreen()`, `PlayIntro()`, `ShowTitle()`, `StartChapter(difficulty, n)` (7+ is New Game+), `RollCredits()`, `SkipCredits()`, `CreditsStatus()` |
| Field | `FieldStatus()` (chapter, board size, counts, health, flags of the flow), `BoardRect()`, `TileCenter(i)`, `HiddenSafeTiles()`, `HiddenMineTiles()`, `Chapters()` |
| Actions | `RevealTile(i)`, `FlagTile(i)`, `FindChordCandidate()`, `RevealAllSafeTiles()`, `StepOnMine()`, `SetHitPoints(hp)` |
| Events | `FloodIn(seconds)`, `SetBreath(log10Percent)`, `SpawnSupplyDrop()`, `SupplyCrateTile()`, `GiveSideQuest(id)`, `StartClubNight()` |
| Menus | `OpenPauseMenu()`, `ResumeGame()`, `OpenPanel(tab)`, `ClosePanel()`, `VisibleOverlays()`, `BuyStoreItem(id)`, `ChangeChatterSetting(value)`, `ClickButton(text)`, `ProfileStatus()` |
| Audio | `InitAudio()`, `CurrentMusicTheme()`, `MusicStepSeconds(theme)`, `Say(id)`, `NextChatterLine()`, `VoiceStatus()`, `VoiceLine(id)`, `DecodedVoiceCount()`, `SoundEffectNames()`, `SoundEffectFingerprint(name)` |

`window.musicExporter.Render(theme, steps, fadeSeconds)` renders a theme offline to a WAV download (used by `tools/ost/render_ost.py`); `Fingerprint(theme, steps)` is used by the golden comparison.

From the browser devtools console you can call these directly, e.g. `testHooks.StartChapter('veteran', 5); setTimeout(() => testHooks.FloodIn(3), 3000)`.

From a script, `tools/lib/env.py` provides helpers for Python Playwright (sync API):

| Helper | Purpose |
|---|---|
| `serve_game(url=None, snapshot=False, source=None)` | Context manager yielding the game URL: a private server on a free port (optionally serving a snapshot or another copy of the game), or `url` if given |
| `launch(p)` | Headless Chromium with autoplay allowed |
| `new_page(browser, width, height, mobile)` | New page; collects errors in `page.errors` |
| `open_game(page, url)` | Load with `?debug` and wait for `window.testHooksReady` |
| `t(page, expr)` | Evaluate a hook expression |
| `args()` | The tools' tiny command-line parser (`--key value`, `--flag`) |

Use them for one-off investigations: copy `tools/browser/screenshot.py` and adapt it. Run it with `.venv/bin/python`.


## Debugging tips

- **Errors inside the frame loop** are caught and logged with `console.error` (see `Application.#Frame` in `main.js`), so the game keeps running. Watch the console, or the smoke test's "page errors". Errors in scheduled callbacks (barks and other delayed effects) are logged the same way.
- **The modules are served as they are, unbundled,** so stack traces point at the real file and line.
- **`file://` does not work** (ES modules need http). Use `scripts/startup.sh` and http://localhost:8080.
- **Debugging in VS Code:** the launch configuration *Play in Chromium (debugger)* opens the game with breakpoints working in `js/` (see SETUP.md §5).
- **No sound before a click:** this is the browser's autoplay policy, not a bug. In headless tests the launch flag `--autoplay-policy=no-user-gesture-required` plus `testHooks.InitAudio()` handles it.
- **Reproducible boards:** add `?seed=123` to the URL and every random draw (mines, scenery, chatter order) repeats exactly.
- **Timing-dependent features** (chatter, supply drops, tips) run on `field.clock`, the game time, which stops while paused. To test them faster, use the hooks (`SpawnSupplyDrop()`, `FloodIn(3)`) instead of waiting.
- **Audio verification** without hearing:
  - **State:** `testHooks.CurrentMusicTheme()`, `testHooks.DecodedVoiceCount()`.
  - **Rendered music:** `.venv/bin/python tools/ost/render_ost.py <theme>`, then `ffmpeg -i out/ost/wav/<theme>.wav -af ebur128 -f null -` for loudness, and `ffmpeg -i ... -lavfi showspectrumpic=s=1200x400:legend=0 spec.png` for a spectrogram picture.
- **Comparing with the original:** `reference/triple-a-sweeper-v11.html` is the last single-file version before the split into modules (voices embedded), and opens directly in a browser. Use it to check whether a regression is new.


## Environment notes

- **Playwright** is pinned in `requirements.txt` (1.63.0) and uses its own Chromium build in `~/.cache/ms-playwright/` (`.venv/bin/playwright install chromium`, done by `scripts/setup.sh`). To use another browser binary, set `CHROME_PATH=/path/to/chrome`.
- Running as root (containers) adds `--no-sandbox` automatically.
- The fonts are self-hosted in `assets/fonts/`, so screenshots render identically offline.
