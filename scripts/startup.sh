#!/usr/bin/env bash
# Start the development web server (tools/serve.py) in the background on http://localhost:8080,
# unless it is already running. Safe to run repeatedly. Stop it with scripts/shutdown.sh.
#   scripts/startup.sh
#   PORT=8000 scripts/startup.sh        # another port
#   HOST=0.0.0.0 scripts/startup.sh     # also reachable from other devices on the LAN (phone testing)
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=${PORT:-8080}; HOST=${HOST:-127.0.0.1}
URL="http://localhost:$PORT/"; LOG=out/server.log

ours() { curl -sI --max-time 2 "$URL" 2>/dev/null | grep -qi '^x-served-by: *aaa-sweeper'; }

if ours; then echo "dev server already running: $URL"; exit 0; fi
if curl -s -o /dev/null --max-time 2 "$URL"; then   # something else answers on this port
  echo "port $PORT is used by another program. Stop it, or use another port: PORT=8081 $0" >&2; exit 1
fi

mkdir -p out
setsid nohup python3 tools/serve.py --host "$HOST" --port "$PORT" >"$LOG" 2>&1 </dev/null &
for _ in $(seq 50); do
  if ours; then echo "dev server running: $URL  (log: $LOG, stop: scripts/shutdown.sh)"; exit 0; fi
  sleep 0.1
done
echo "dev server did not start, see $LOG:" >&2; tail -5 "$LOG" >&2; exit 1
