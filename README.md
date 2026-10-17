# Triple A Sweeper

**Remastered · Definitive · Game of the Year Edition**

Classic Minesweeper, rebuilt as a big-budget action game. It boots into a fake Windows 98 desktop, sits through a launcher and four middleware logos, and then gives you a fully working minesweeper buried under every AAA trope:
- a pulsating quest marker that always points at a safe tile
- regenerating health and nonstop voiced radio chatter
- a battle pass, a store selling flag skins, achievements and lore fragments (13 of "400")
- six cinematic chapters, including a flooding underwater base where you hold your breath (asymptotically)
- 1,412 end credits, every one of them "Claude"

All graphics are procedural (Canvas 2D), all music and sound effects are synthesised live in the browser (Web Audio API), and the 197 voice lines were generated with the open Kokoro TTS model. No game engine, no framework, no image files.

![Pathos-4, flooded](docs/images/ch5-pathos4-flooded.jpg)

## Quick start

The game is plain HTML, CSS and JavaScript modules with no build step. The tools around it (dev server, browser tests, voice generation, soundtrack export) are Python. There is no Node.js or npm. New to web development? Read **[docs/SETUP.md](docs/SETUP.md)** first.

```bash
sudo apt install git curl python3-venv ffmpeg   # system packages (Ubuntu / Debian / Mint)
scripts/setup.sh                                # .venv with pinned packages, Playwright's Chromium, TTS model
scripts/startup.sh                              # dev server: play at http://localhost:8080 (F5 reloads)
scripts/smoke.sh                                # headless play-through test, must end with "all good"
scripts/shutdown.sh                             # stop the dev server
```

To put the game on a web server, copy `index.html`, `css/`, `js/` and `assets/`.

## Documentation

| Doc | Contents |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Installing the tools on Linux: Python venv, Playwright, Kokoro TTS, ffmpeg, Biome, VS Code, Claude Code |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | The original brief, how it grew, chapters, systems, cast, tone |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Module map, game loop, shared state, rendering, layout, serving, recipes |
| [docs/AUDIO.md](docs/AUDIO.md) | Audio graph, sound effects, radio voice chain, chatter manager |
| [docs/MUSIC.md](docs/MUSIC.md) | Step sequencer, the nine themes, instruments, soundtrack export |
| [docs/VOICES.md](docs/VOICES.md) | Kokoro TTS pipeline, cast voices, adding lines |
| [docs/TESTING.md](docs/TESTING.md) | Smoke tests, screenshots, Biome lint, `?debug` hooks, debugging tips |
| [.claude/CLAUDE.md](.claude/CLAUDE.md) | Project brief for Claude Code |

## Layout

```
index.html  css/  js/          the game (ES modules)
assets/                        fonts (SIL OFL), 197 voice lines (MP3), favicon
scripts/                       setup, dev server start/stop, smoke test, voice baking, soundtrack export
tools/                         dev server, browser tests, soundtrack export, TTS generator (+ legacy scripts)
reference/                     the original single-file game and its history
docs/                          documentation and screenshots
```

## Credits

Game Director, Lead Programmer, Composer, Sound Designer, Concept Artist, Writer, Voice Director and 1,405 other positions: Claude. Voices: Kokoro TTS. Fonts: Audiowide, Caveat, Chakra Petch, Cinzel, Michroma, Russo One, Teko (SIL Open Font License). The person who typed "Tripple-A": special thanks.
