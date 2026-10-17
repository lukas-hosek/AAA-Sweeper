# Tools

| Folder | Script | What it does | Needs |
|---|---|---|---|
| `browser/` | `smoke.mjs` | Headless play-through of every screen and chapter; fails on any JS error. `--mobile`, `--full`, `--target dev\|single\|site` | Node, Playwright Chromium |
| | `screenshot.mjs` | Screenshot of any state (chapter, flood, blood, credits, phone size...). Options in its header | Node, Playwright Chromium |
| `build/` | `build-single.mjs` | One self-contained HTML file with JS bundled (esbuild), CSS and voices inlined. `--artifact`, `--minify` | Node |
| | `google-fonts.html` | The `<link>` tags the single file uses for fonts | — |
| `ost/` | `render-ost.mjs` | Renders every music theme offline to 24-bit WAV (`out/ost/wav/`) | Node, Playwright Chromium |
| | `encode_ost.py` | Loudness to −16 LUFS, MP3 320 + FLAC 24-bit with tags and cover, zips | Python 3, ffmpeg |
| | `make-cover.mjs` | Album cover from the title screen (`out/ost/cover.jpg`) | Node, Playwright Chromium |
| `tts/` | `generate_voices.py` | Kokoro TTS → `public/voices/<id>.mp3` and `js/data/voice-manifest.js`. `--check`, `--force`, `--say` | Python venv, ffmpeg, model files |
| | `lines.py` | Every voice line (source of truth), the cast → Kokoro voice map | — |
| | `download_models.sh` | Downloads and checksums the Kokoro model files into `tts/models/` | curl, sha256sum |
| | `requirements.txt` | Python packages for the venv | — |
| `lib/` | `env.mjs` | Shared helpers: start dev server / preview / file target, launch Chromium, open with `?debug`, collect errors | — |
| `legacy/` | — | The original one-off scripts from building the single-file version. Reference only, see its README | — |

All Node tools start their own Vite server on a free port; you don't need `npm run dev` running.
