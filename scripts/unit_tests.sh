#!/usr/bin/env bash
# Unit tests of the pure game modules (tools/browser/unit/*.test.js) in headless Chromium. Must end with "all good".
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -x .venv/bin/python ]] || { echo "no .venv: run scripts/setup.sh first" >&2; exit 1; }
exec .venv/bin/python tools/browser/unit_tests.py "$@"
