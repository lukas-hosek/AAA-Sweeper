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

New to web development? Read **[docs/SETUP.md](docs/SETUP.md)** first; it lists every tool and how to install it on Linux.

```bash
npm install
npx playwright install --with-deps chromium   # for tests and screenshots
npm run dev                                   # play at http://localhost:5173 with live reload
npm run smoke                                 # headless play-through test
npm run build                                 # dist/triple-a-sweeper.html: one self-contained file
```

## Documentation

| Doc | Contents |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Installing Node, Playwright, Python TTS, ffmpeg and Claude Code on Linux |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | The original brief, how it grew, chapters, systems, cast, tone |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Module map, game loop, shared state, rendering, layout, builds, recipes |
| [docs/AUDIO.md](docs/AUDIO.md) | Audio graph, sound effects, radio voice chain, chatter manager |
| [docs/MUSIC.md](docs/MUSIC.md) | Step sequencer, the nine themes, instruments, soundtrack export |
| [docs/VOICES.md](docs/VOICES.md) | Kokoro TTS pipeline, cast voices, adding lines |
| [docs/TESTING.md](docs/TESTING.md) | Smoke tests, screenshots, `?debug` hooks, debugging tips |
| [.claude/CLAUDE.md](.claude/CLAUDE.md) | Project brief for Claude Code |

## Layout

```
index.html  css/  js/          the game (ES modules)
public/voices/                 197 voice lines (MP3)
assets/fonts/                  self-hosted fonts (SIL OFL)
tools/                         build, browser tests, soundtrack export, TTS generator (+ legacy scripts)
reference/                     the original single-file game and its history
docs/                          documentation and screenshots
```

## Credits

Game Director, Lead Programmer, Composer, Sound Designer, Concept Artist, Writer, Voice Director and 1,405 other positions: Claude. Voices: Kokoro TTS. Fonts: Audiowide, Caveat, Chakra Petch, Cinzel, Michroma, Russo One, Teko (SIL Open Font License). The person who typed "Tripple-A": special thanks.
