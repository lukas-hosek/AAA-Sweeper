# Testing and debugging

The game has no unit tests. It is verified the way it was built: by **driving it in headless Chromium and looking at it**, plus a static **lint** of the JavaScript and CSS. The tools work the same for a person and for Claude Code. They run with the project's Python virtual environment (`.venv`, created by `scripts/setup.sh`); the scripts in `scripts/` call `.venv/bin/python` for you.

## Smoke test

```bash
scripts/smoke.sh              # desktop 1440×900
scripts/smoke.sh --mobile     # 390×844 touch phone, DPR 2
scripts/smoke.sh --full       # also click the desktop icon and sit through launcher + intro (~25 s more)
scripts/smoke.sh --url http://localhost:8080/   # test the running dev server instead
```

It takes about 1.5 minutes. It starts its own private copy of the dev server on a free port, so it doesn't need, and doesn't disturb, the server on :8080.

`tools/browser/smoke.py` runs these steps:
1. Boots to the desktop.
2. Opens the title screen and checks that the title music is playing.
3. **For each of the 6 chapters:**
   - starts it and checks the chapter name, tileset and music theme
   - clicks the centre tile (always safe) plus a few random tiles
   - takes a screenshot
4. **Extra checks:**
   - chapter 1: voice lines decode, and stepping on a mine causes damage (blood screenshot)
   - chapter 5: Pathos-4 floods when the timer runs out, and the breath readout renders
5. **Credits:** rolls them and checks that 1,412 positions are laid out and the credits music plays.

The test fails on any uncaught exception, `console.error`, or HTTP ≥ 400 response. The server answers 404 for anything outside `index.html`, `css/`, `js/` and `assets/`, so a reference to a file that wouldn't be deployed fails here too. Screenshots are written to `out/smoke/<viewport>/`.

**Run it after every change.** Then open a few screenshots and look at them. Layout bugs (overlapping HUD panels, text running off screen) don't throw errors.

## Lint (Biome)

```bash
biome lint            # js/ and css/, configured in biome.json
```

Biome checks **correctness only**; it reports and never changes files. The configuration keeps the correctness and suspicious rule groups and switches off the style and complexity groups, which would fight the intentionally compact code. The rules that matter most:
- **`noUndeclaredVariables`:** a missing `import` or a typo in a name. In ES modules this otherwise shows up only at runtime, when that code path runs.
- **`noUnusedVariables`, `noUnusedImports`:** leftovers after a change.

The code is clean (no diagnostics), so any finding is new. Fix findings by hand in the surrounding style. Don't use `biome format`, `biome check --write` or `biome lint --write`: the formatter is disabled in `biome.json`, and automatic fixes would rewrite code in Biome's style.

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

## Debug hooks (`?debug`)

Open the game with `?debug` in the URL (e.g. `http://localhost:8080/?debug`) and `js/debug.js` installs:

| Hook | What it does |
|---|---|
| `__t.audio()` | Create/resume the AudioContext (normally needs a click) |
| `__t.screen()` | Current screen: `desktop`, `intro`, `title`, `game` |
| `__t.title()` | Jump to the title screen |
| `__t.start(diff, n)` | Start chapter `n` (1–6, 7+ = New Game+) on `story`, `normal` or `veteran` |
| `__t.G()` | The live field object (`ST.G`): board arrays, hp, clock, flags... |
| `__t.board()` | Board rectangle, tile size and layout name |
| `__t.boom()` | Step on the first hidden mine |
| `__t.floodIn(s)` | Pathos-4: flood in `s` seconds |
| `__t.breath(L)` | Pathos-4: set breath to 10^L % |
| `__t.mus()` / `__t.step(theme)` | Current music theme; seconds per step |
| `__t.say(id)` | Play a voice line now |
| `__t.nc()` | Pop the next chatter line id |
| `__t.VM()` | Voice manager state |
| `__t.V(id)` | Manifest entry |
| `__t.voicesLoaded()` | Decoded buffers in the cache |
| `__t.credits()` / `__t.cr()` | Roll credits; credits state |
| `__t.chapters()` | Chapter list (name, scenery, music, tileset) |
| `window.__render(theme, steps, fade)` | Offline-render music to a WAV download (used by `tools/ost`) |

From the browser devtools console you can play with these directly, e.g. `__t.start('veteran', 5); setTimeout(() => __t.floodIn(3), 3000)`.

From a script, `tools/lib/env.py` provides helpers for Python Playwright (sync API):

| Helper | Purpose |
|---|---|
| `serve_game(url=None)` | Context manager yielding the game URL: a private server on a free port, or `url` if given |
| `launch(p)` | Headless Chromium with autoplay allowed |
| `new_page(browser, width, height, mobile)` | New page; collects errors in `page.errors` |
| `open_game(page, url)` | Load with `?debug` and wait for the hooks |
| `t(page, expr)` | Evaluate a hook expression |
| `args()` | The tools' tiny command-line parser (`--key value`, `--flag`) |

Use them for one-off investigations: copy `tools/browser/screenshot.py` and adapt it. Run it with `.venv/bin/python`.

## Debugging tips

- **Errors inside the game loop** are caught and logged with `console.error` (see `tick` in `main.js`), so the game keeps running. Watch the console, or the smoke test's "page errors".
- **The modules are served as they are, unbundled,** so stack traces point at the real file and line.
- **`file://` does not work** (ES modules need http). Use `scripts/startup.sh` and http://localhost:8080.
- **Debugging in VS Code:** the launch configuration *Play in Chromium (debugger)* opens the game with breakpoints working in `js/` (see SETUP.md §5).
- **No sound before a click:** this is the browser's autoplay policy, not a bug. In headless tests the launch flag `--autoplay-policy=no-user-gesture-required` plus `__t.audio()` handles it.
- **Timing-dependent features** (chatter, supply drops, tips) run on `ST.G.clock`, the game time, which stops while paused. To test them faster, set fields on `__t.G()` (e.g. `__t.G().nextCrate = 0`) instead of waiting.
- **Mine placement is random** (after the first click). To find a mine, look at `__t.G().mine`. To find a safe tile, read `__t.G().target` (the quest marker).
- **Audio verification** without hearing:
  - **State:** `__t.mus()`, `__t.voicesLoaded()`.
  - **Rendered music:** `.venv/bin/python tools/ost/render_ost.py <theme>`, then `ffmpeg -i out/ost/wav/<theme>.wav -af ebur128 -f null -` for loudness, and `ffmpeg -i ... -lavfi showspectrumpic=s=1200x400:legend=0 spec.png` for a spectrogram picture.
- **Comparing with the original:** `reference/triple-a-sweeper-v11.html` is the last single-file version before the split into modules (voices embedded), and opens directly in a browser. Use it to check that a regression is new.

## Environment notes

- **Playwright** is pinned in `requirements.txt` (1.63.0) and uses its own Chromium build in `~/.cache/ms-playwright/` (`.venv/bin/playwright install chromium`, done by `scripts/setup.sh`). To use another browser binary, set `CHROME_PATH=/path/to/chrome`.
- Running as root (containers) adds `--no-sandbox` automatically.
- The fonts are self-hosted in `assets/fonts/`, so screenshots render identically offline.
