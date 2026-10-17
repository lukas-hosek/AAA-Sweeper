#!/usr/bin/env bash
# Generate ("bake") voice lines with Kokoro TTS: tools/tts/lines.py -> assets/voices/<id>.mp3 + js/data/voice-manifest.js.
#   scripts/bake_voices.sh                  # lines that have no MP3 yet
#   scripts/bake_voices.sh pa_25 hc_4       # (re)generate specific ids
#   scripts/bake_voices.sh --force          # regenerate all lines (several minutes)
#   scripts/bake_voices.sh --check          # lines.py / MP3 / manifest consistency, no TTS
#   scripts/bake_voices.sh --say prof "Testing, one two."   # preview into out/tts/preview.mp3
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -x .venv/bin/python ]] || { echo "no .venv: run scripts/setup.sh first" >&2; exit 1; }
if [[ " $* " != *" --check "* ]] && [[ ! -f tools/tts/models/kokoro-v1.0.int8.onnx || ! -f tools/tts/models/voices-v1.0.bin ]]; then
  bash tools/tts/download_models.sh
fi
exec .venv/bin/python tools/tts/generate_voices.py "$@"
