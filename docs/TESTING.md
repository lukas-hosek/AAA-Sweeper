# Testing and debugging

The game has no unit tests. It is verified the way it was built: by **driving it in headless Chromium and looking at it**. The tools work the same for a person and for Claude Code.

## Smoke test

```bash
npm run smoke                 # desktop 1440×900, Vite dev server (source files)
npm run smoke -- --mobile     # 390×844 touch phone, DPR 2
npm run smoke -- --full       # also click the desktop icon and sit through launcher + intro (~25 s more)
npm run build && npm run smoke:single   # test the single-file build over file://
npm run build:site && npm run smoke:site   # test the multi-file site build
```

`tools/browser/smoke.mjs` runs these steps:
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

The test fails on any uncaught exception, `console.error`, or HTTP ≥ 400 response. Missing Google Fonts are tolerated offline, and so is a missing favicon. Screenshots are written to `out/smoke/<viewport>/`.

**Run it after every change.** Then open a few screenshots and look at them. Layout bugs (overlapping HUD panels, text running off screen) don't throw errors.

## Screenshots of a specific state

```bash
node tools/browser/screenshot.mjs --screen desktop
node tools/browser/screenshot.mjs --screen title --mobile
node tools/browser/screenshot.mjs --chapter 3 --clicks 8
node tools/browser/screenshot.mjs --chapter 1 --boom                 # blood overlay
node tools/browser/screenshot.mjs --chapter 5 --flood --breath -11.5 # Pathos-4 underwater, tiny breath value
node tools/browser/screenshot.mjs --chapter 2 --diff veteran --size 1280x720 --out out/v.png
node tools/browser/screenshot.mjs --screen credits --wait 20000
```

Output goes to `out/shots/` by default. Use `--target single` to shoot the built file.

**Viewports worth checking:**

| Viewport | Layout | Notes |
|---|---|---|
| 1440×900 | wide | Default |
| 1920×1080 | wide | |
| 1000×760 | mid | |
| 390×844 `--mobile` | narrow | |
| 30×16 boards (`--diff veteran`) | — | Stress the layout |

## Debug hooks (`?debug`)

Open the game with `?debug` in the URL (e.g. `http://localhost:5173/?debug`) and `js/debug.js` installs:

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

From a script, `tools/lib/env.mjs` provides helpers:

| Helper | Purpose |
|---|---|
| `startTarget('dev' \| 'single' \| 'site')` | Start or locate the game |
| `launch()` | Headless Chromium with autoplay allowed |
| `newPage(browser, {mobile})` | New page; collects errors |
| `openGame(page, url)` | Load with `?debug` and wait for the hooks |
| `t(page, expr)` | Evaluate a hook expression |

Use them for one-off investigations: copy `screenshot.mjs` and adapt it.

## Debugging tips

- **Errors inside the game loop** are caught and logged with `console.error` (see `tick` in `main.js`), so the game keeps running. Watch the console, or the smoke test's "page errors".
- **The dev server serves the modules unbundled,** so stack traces point at the real file and line.
- **`file://` does not work for the dev version** (ES modules need http). Use `npm run dev`, or build the single file.
- **No sound before a click:** this is the browser's autoplay policy, not a bug. In headless tests the launch flag `--autoplay-policy=no-user-gesture-required` plus `__t.audio()` handles it.
- **Timing-dependent features** (chatter, supply drops, tips) run on `ST.G.clock`, the game time, which stops while paused. To test them faster, set fields on `__t.G()` (e.g. `__t.G().nextCrate = 0`) instead of waiting.
- **Mine placement is random** (after the first click). To find a mine, look at `__t.G().mine`. To find a safe tile, read `__t.G().target` (the quest marker).
- **Audio verification** without hearing:
  - **State:** `__t.mus()`, `__t.voicesLoaded()`.
  - **Rendered music:** `node tools/ost/render-ost.mjs <theme>`, then `ffmpeg -i out/ost/wav/<theme>.wav -af ebur128 -f null -` for loudness, and `ffmpeg -i ... -lavfi showspectrumpic=s=1200x400:legend=0 spec.png` for a spectrogram picture.
- **Comparing with the original:** `reference/triple-a-sweeper-v11.html` is the last single-file version before the split, and opens directly in a browser. Use it to check that a regression is new.

## Environment notes

- Playwright uses its own Chromium (`npx playwright install chromium`). To use another browser binary, set `CHROME_PATH=/path/to/chrome`.
- Running as root (containers) adds `--no-sandbox` automatically.
- Offline, Google Fonts can't load in the single-file build, so text falls back to system fonts. The dev build self-hosts the fonts, so it always renders correctly.
