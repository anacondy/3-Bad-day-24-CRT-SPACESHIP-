#!/usr/bin/env bash
# Copy runtime game files into packaging/flatpak/game-src for flatpak-builder.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$(cd "$(dirname "$0")" && pwd)/game-src"
rm -rf "${DEST}"
mkdir -p "${DEST}/js"
cp -a "${ROOT}/index.html" "${DEST}/"
cp -a "${ROOT}/site.webmanifest" "${DEST}/"
cp -a "${ROOT}/version.json" "${DEST}/"
cp -a "${ROOT}/LICENSE" "${DEST}/"
cp -a "${ROOT}/NOTICE" "${DEST}/"
cp -a "${ROOT}/js/telemetry.js" "${DEST}/js/"
: > "${DEST}/.nojekyll"
echo "Synced game runtime → ${DEST}"
ls -la "${DEST}" "${DEST}/js"
