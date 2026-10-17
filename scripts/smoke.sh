#!/usr/bin/env bash
# Headless play-through of every screen and chapter (tools/browser/smoke.py). Must end with "all good".
# Starts its own server on a free port; the dev server on :8080 is not needed. Screenshots: out/smoke/.
#   scripts/smoke.sh              # desktop 1440x900
#   scripts/smoke.sh --mobile     # 390x844 touch phone
#   scripts/smoke.sh --full       # also click the desktop icon and sit through launcher + intro
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -x .venv/bin/python ]] || { echo "no .venv: run scripts/setup.sh first" >&2; exit 1; }
exec .venv/bin/python tools/browser/smoke.py "$@"
