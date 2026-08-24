#!/usr/bin/env bash
# Flatpak entrypoint: serve packaged game files and open the default browser.
set -euo pipefail

GAME_ROOT="${FLATPAK_GAME_ROOT:-/app/share/crt-spaceship}"
PORT="${CRT_SPACESHIP_PORT:-8765}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}/"

if [[ ! -f "${GAME_ROOT}/index.html" ]]; then
  echo "CRT Spaceship: game files not found at ${GAME_ROOT}" >&2
  exit 1
fi

cd "${GAME_ROOT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Prefer python3 from the freedesktop runtime
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "${PORT}" --bind "${HOST}" >/dev/null 2>&1 &
  SERVER_PID=$!
else
  echo "CRT Spaceship: python3 is required to serve the game." >&2
  exit 1
fi

# Give the server a moment
sleep 0.3

# Portal-friendly open
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${URL}" >/dev/null 2>&1 || true
elif command -v gio >/dev/null 2>&1; then
  gio open "${URL}" >/dev/null 2>&1 || true
fi

echo "CRT Spaceship running at ${URL}"
echo "Press Ctrl+C to stop."

# Keep flatpak "running" while server lives
wait "${SERVER_PID}"
