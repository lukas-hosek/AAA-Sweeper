#!/usr/bin/env bash
# Downloads the Kokoro TTS model files used for every voice line (about 120 MB) into tools/tts/models/.
# These are the exact files the shipped lines were generated with (kokoro-onnx release "model-files-v1.0").
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p models
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
fetch() {  # name sha256
  if [ -f "models/$1" ] && echo "$2  models/$1" | sha256sum -c --quiet - 2>/dev/null; then echo "ok        models/$1"; return; fi
  echo "download  $BASE/$1"
  curl -L --fail --progress-bar -o "models/$1.part" "$BASE/$1"
  echo "$2  models/$1.part" | sha256sum -c --quiet - || { echo "checksum mismatch for $1" >&2; exit 1; }
  mv "models/$1.part" "models/$1"
}
fetch kokoro-v1.0.int8.onnx 6e742170d309016e5891a994e1ce1559c702a2ccd0075e67ef7157974f6406cb
fetch voices-v1.0.bin       bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
echo "models ready in tools/tts/models/"
