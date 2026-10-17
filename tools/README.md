# Tools

Everyday use goes through the wrappers in `scripts/`, which run these tools with the right Python. The browser and TTS tools need the project venv (`.venv/bin/python`, created by `scripts/setup.sh`). `serve.py` and `encode_ost.py` use only the standard library.

| Folder | Script | What it does | Needs | Wrapper |
|---|---|---|---|---|
| `tools/` | `serve.py` | Dev web server: serves only `index.html`, `css/`, `js/`, `assets/` with caching off. `--host`, `--port` (default 127.0.0.1:8080) | Python | `scripts/startup.sh`, `scripts/shutdown.sh` |
| `lib/` | `env.py` | Shared helpers for the browser tools: private server on a free port, launch Chromium, open with `?debug`, collect errors, `t()` hook calls | Playwright | — |
| `browser/` | `smoke.py` | Headless play-through of every screen and chapter; fails on any JS error. `--mobile`, `--full`, `--url` | Playwright + Chromium | `scripts/smoke.sh` |
| | `screenshot.py` | Screenshot of any state (chapter, flood, blood, credits, phone size...). Options in its header | Playwright + Chromium | — |
| `ost/` | `make_cover.py` | Album cover from the title screen (`out/ost/cover.jpg`) | Playwright + Chromium | `scripts/export_ost.sh` |
| | `render_ost.py` | Renders music themes offline to 24-bit WAV (`out/ost/wav/`) | Playwright + Chromium | `scripts/export_ost.sh` |
| | `encode_ost.py` | Loudness to −16 LUFS, MP3 320 + FLAC 24-bit with tags and cover, zips | Python, ffmpeg | `scripts/export_ost.sh` |
| `tts/` | `generate_voices.py` | Kokoro TTS → `assets/voices/<id>.mp3` and `js/data/voice-manifest.js`. `--check`, `--force`, `--say` | venv, ffmpeg, model files | `scripts/bake_voices.sh` |
| | `lines.py` | Every voice line (source of truth), the cast → Kokoro voice map | — | — |
| | `download_models.sh` | Downloads and checksums the Kokoro model files into `tts/models/` | curl, sha256sum | `scripts/setup.sh` |
| `legacy/` | — | The original one-off scripts from building the single-file version. Reference only, not runnable; see its README | — | — |

The browser tools start their own server on a free port, so the dev server on :8080 isn't needed and isn't disturbed. Pass `--url http://localhost:8080/` to use the running one instead.

Python packages are pinned in `requirements.txt` at the project root.
