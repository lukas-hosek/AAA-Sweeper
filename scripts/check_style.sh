#!/usr/bin/env bash
# House formatting rules that Biome doesn't check (tools/check_style.py): tabs, K&R braces, blank lines, short names.
#   scripts/check_style.sh                    # js/, css/, index.html and the JS unit tests
#   scripts/check_style.sh js/game/field.js   # selected files
set -euo pipefail
cd "$(dirname "$0")/.."
exec python3 tools/check_style.py "$@"
