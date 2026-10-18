#!/usr/bin/env bash
# Golden comparison (tools/browser/golden.py): deterministic screenshots and audio fingerprints of fixed scenarios.
# Record a baseline before a refactor, compare after it. Output: out/golden/{baseline,current,diff}/.
#   scripts/golden.sh record                     # store the baseline
#   scripts/golden.sh compare                    # play again and compare (exit code 1 on any difference)
#   scripts/golden.sh compare --only title,ch3   # selected scenarios
#   scripts/golden.sh compare --coverage         # also list game functions that never ran
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -x .venv/bin/python ]] || { echo "no .venv: run scripts/setup.sh first" >&2; exit 1; }
exec .venv/bin/python tools/browser/golden.py "$@"
