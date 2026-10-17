#!/usr/bin/env bash
# Soundtrack export: album cover, offline render of the music themes to WAV, then loudness normalisation,
# MP3 320 + FLAC 24-bit with tags, and two zips. Everything goes to out/ost/ (not committed).
#   scripts/export_ost.sh                 # all nine themes
#   scripts/export_ost.sh pathos club     # selected themes (the encoder takes every WAV in out/ost/wav/)
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -x .venv/bin/python ]] || { echo "no .venv: run scripts/setup.sh first" >&2; exit 1; }
.venv/bin/python tools/ost/make_cover.py
.venv/bin/python tools/ost/render_ost.py "$@"
.venv/bin/python tools/ost/encode_ost.py
