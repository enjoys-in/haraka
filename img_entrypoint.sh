#!/usr/bin/env bash
# Supervisor entrypoint: runs the Haraka SMTP server (Node) and the admin
# config API (Bun) side by side, and stops the container if either exits.
set -euo pipefail

HARAKA_ROOT="/app"

echo "[entrypoint] starting admin API (bun) on ${HOST:-0.0.0.0}:${PORT:-3001}…"
(
  cd "${HARAKA_ROOT}/admin/server"
  exec bun run src/index.ts
) &
admin_pid=$!

echo "[entrypoint] starting Haraka SMTP server (node)…"
(
  cd "${HARAKA_ROOT}"
  exec node node_modules/Haraka/bin/haraka -c "${HARAKA_ROOT}"
) &
haraka_pid=$!

shutdown() {
  echo "[entrypoint] received signal, shutting down…"
  kill -TERM "${admin_pid}" "${haraka_pid}" 2>/dev/null || true
  wait
}
trap shutdown TERM INT

# Exit as soon as either service stops, so the orchestrator can restart us.
wait -n "${admin_pid}" "${haraka_pid}"
echo "[entrypoint] a service exited; stopping container"
shutdown
exit 1
