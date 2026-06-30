#!/usr/bin/env bash
# Role-aware entrypoint. Select the role with HARAKA_ROLE:
#   combined (default) — admin API + a single Haraka on 25+587 (config/)
#   admin              — admin API/UI only (port 3001)
#   inbound            — Haraka MTA on :25      (-c /app/inbound)
#   outbound           — Haraka MSA on :587     (-c /app/outbound)
set -euo pipefail

HARAKA_ROOT="/app"
ROLE="${HARAKA_ROLE:-combined}"

run_admin() {
  echo "[entrypoint] admin API on ${HOST:-0.0.0.0}:${PORT:-3001}"
  cd "${HARAKA_ROOT}/admin/server"
  exec bun run src/index.ts
}

run_haraka() {
  local cfg="$1"
  local logfile="${HARAKA_LOG_FILE:-/app/logs/haraka.log}"
  mkdir -p "$(dirname "${logfile}")"
  echo "[entrypoint] Haraka -c ${cfg} (logging to ${logfile})"
  cd "${HARAKA_ROOT}"
  # Tee Haraka's output to the shared log file (tailed by the admin API for the
  # live system-log view) as well as container stdout (docker logs).
  exec node node_modules/Haraka/bin/haraka -c "${cfg}" > >(tee -a "${logfile}") 2>&1
}

case "${ROLE}" in
  admin)    run_admin ;;
  inbound)  run_haraka "${HARAKA_ROOT}/inbound" ;;
  outbound) run_haraka "${HARAKA_ROOT}/outbound" ;;
  combined)
    echo "[entrypoint] combined mode: admin API + single Haraka (config/)"
    (
      cd "${HARAKA_ROOT}/admin/server"
      exec bun run src/index.ts
    ) &
    admin_pid=$!

    (
      cd "${HARAKA_ROOT}"
      logfile="${HARAKA_LOG_FILE:-/app/logs/haraka.log}"
      mkdir -p "$(dirname "${logfile}")"
      exec node node_modules/Haraka/bin/haraka -c "${HARAKA_ROOT}" > >(tee -a "${logfile}") 2>&1
    ) &
    haraka_pid=$!

    shutdown() {
      echo "[entrypoint] received signal, shutting down…"
      kill -TERM "${admin_pid}" "${haraka_pid}" 2>/dev/null || true
      wait
    }
    trap shutdown TERM INT

    wait -n "${admin_pid}" "${haraka_pid}"
    echo "[entrypoint] a service exited; stopping container"
    shutdown
    exit 1
    ;;
  *)
    echo "[entrypoint] unknown HARAKA_ROLE='${ROLE}' (use combined|admin|inbound|outbound)" >&2
    exit 2
    ;;
esac
