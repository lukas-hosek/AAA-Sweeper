#!/usr/bin/env bash
# Stop the development web server started by scripts/startup.sh (any port).
# Only servers started from this project folder are stopped.
set -euo pipefail
cd "$(dirname "$0")/.."

pids=()
for p in $(pgrep -f '(^|/)python[0-9.]* tools/serve\.py' || true); do
  [[ $(readlink "/proc/$p/cwd" 2>/dev/null) == "$PWD" ]] && pids+=("$p")
done
if (( ${#pids[@]} == 0 )); then echo "dev server not running"; exit 0; fi

kill "${pids[@]}" 2>/dev/null || true
for _ in $(seq 50); do
  alive=0; for p in "${pids[@]}"; do kill -0 "$p" 2>/dev/null && alive=1; done
  (( alive )) || { echo "dev server stopped (pid ${pids[*]})"; exit 0; }
  sleep 0.1
done
echo "dev server did not stop (pid ${pids[*]})" >&2; exit 1
