#!/usr/bin/env bash
# Set up the Python tooling: .venv with the pinned packages from requirements.txt, Playwright's own Chromium
# (~650 MB in ~/.cache/ms-playwright) and the Kokoro TTS model files (~120 MB, checksummed). Safe to re-run.
# System packages come first (see docs/SETUP.md): sudo apt install git curl python3-venv ffmpeg
set -euo pipefail
cd "$(dirname "$0")/.."

missing=()
python3 -c 'import ensurepip' 2>/dev/null || missing+=(python3-venv)
command -v ffmpeg >/dev/null || missing+=(ffmpeg)
command -v curl >/dev/null || missing+=(curl)
if (( ${#missing[@]} )); then echo "missing system packages, install them with: sudo apt install ${missing[*]}" >&2; exit 1; fi
command -v biome >/dev/null || echo "note: biome (JS/CSS lint) is not on PATH; see docs/SETUP.md"

[[ -x .venv/bin/python ]] || { echo "creating .venv"; python3 -m venv .venv; }
.venv/bin/python -m pip install --quiet -r requirements.txt
.venv/bin/playwright install chromium
bash tools/tts/download_models.sh
echo "setup complete. Start the game with scripts/startup.sh and open http://localhost:8080/"
