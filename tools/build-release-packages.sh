#!/usr/bin/env bash
# Build portable release archives for CRT Spaceship.
# Does not modify game physics/UI — copies runtime files only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(python3 -c "import json; print(json.load(open('version.json'))['version'])" 2>/dev/null || echo '1.0.0')"
DIST="${ROOT}/dist"
STAGE="${DIST}/_stage"
rm -rf "${DIST}"
mkdir -p "${STAGE}/game" "${DIST}"

echo "==> Building CRT Spaceship release packages v${VERSION}"

# --- Core game payload (identical across desktop packages) ---
copy_game_payload() {
  local dest="$1"
  mkdir -p "${dest}"
  cp -a index.html "${dest}/"
  cp -a site.webmanifest "${dest}/"
  cp -a version.json "${dest}/"
  cp -a LICENSE "${dest}/"
  cp -a NOTICE "${dest}/"
  mkdir -p "${dest}/js"
  cp -a js/telemetry.js "${dest}/js/"
  # empty marker so GitHub Pages-style static hosts behave if re-hosted
  : > "${dest}/.nojekyll"
}

copy_game_payload "${STAGE}/game"

# Shared HOW-TO for archives
write_play_readme() {
  local path="$1"
  local platform_title="$2"
  local run_hint="$3"
  cat > "${path}" << EOF
# CRT Spaceship — ${platform_title} package

Version: ${VERSION}
License: Apache License 2.0 (see LICENSE and NOTICE)

## Play online (no download needed)

https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/

## Run this package offline / locally

${run_hint}

Then open the URL shown (usually http://localhost:8080/) in your browser.

You can also double-click \`index.html\` in many browsers. A local HTTP server
is more reliable for Web Audio and optional version.json loading.

## Controls

- **Mouse / touch:** move ship, click/tap to fire
- **Keyboard:** ← → move | Shift fire | Shift+A auto-fire | M mute | Space pause | Enter start

## Contents

- index.html — game (Canvas + Web Audio)
- js/telemetry.js — optional local diagnostics (localStorage only)
- site.webmanifest — Add to Home Screen metadata
- LICENSE / NOTICE — Apache-2.0

No installer, no admin rights, no native binary required.
EOF
}

# ---------- Windows portable zip ----------
WIN_DIR="${STAGE}/CRT-Spaceship-Windows-x64"
mkdir -p "${WIN_DIR}"
copy_game_payload "${WIN_DIR}"
write_play_readme "${WIN_DIR}/README.txt" "Windows (portable)" \
"1. Unzip this folder anywhere (no install).
2. Double-click \`Play-CRT-Spaceship.bat\`
   — or open a terminal in this folder and run:
     py -3 -m http.server 8080
     (or: python -m http.server 8080)"

cat > "${WIN_DIR}/Play-CRT-Spaceship.bat" << 'EOF'
@echo off
setlocal
cd /d "%~dp0"
echo.
echo  CRT Spaceship — starting local server on http://127.0.0.1:8080/
echo  Close this window to stop the server.
echo.

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" "http://127.0.0.1:8080/"
  py -3 -m http.server 8080
  goto :eof
)

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" "http://127.0.0.1:8080/"
  python -m http.server 8080
  goto :eof
)

where py >nul 2>&1
where python >nul 2>&1
echo Python was not found. Opening index.html directly...
start "" "%~dp0index.html"
echo.
echo Tip: Install Python from https://www.python.org/ or open index.html in Chrome/Edge.
pause
EOF

# PowerShell launcher alternative (no Python required to open file)
cat > "${WIN_DIR}/Play-CRT-Spaceship.ps1" << 'EOF'
Set-Location $PSScriptRoot
$url = "http://127.0.0.1:8080/"
$py = Get-Command py -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue
if ($py) {
  Start-Process $url
  & py -3 -m http.server 8080
} elseif ($python) {
  Start-Process $url
  & python -m http.server 8080
} else {
  Invoke-Item (Join-Path $PSScriptRoot "index.html")
  Write-Host "Opened index.html (install Python for a local server)."
}
EOF

( cd "${STAGE}" && zip -qr "${DIST}/CRT-Spaceship-Windows-x64.zip" "CRT-Spaceship-Windows-x64" )
echo "  wrote dist/CRT-Spaceship-Windows-x64.zip"

# ---------- macOS portable tar.gz ----------
MAC_DIR="${STAGE}/CRT-Spaceship-macOS-universal"
mkdir -p "${MAC_DIR}"
copy_game_payload "${MAC_DIR}"
write_play_readme "${MAC_DIR}/README.txt" "macOS (portable)" \
"1. Unzip/untar this folder anywhere.
2. Double-click \`Play-CRT-Spaceship.command\` (allow in System Settings if prompted)
   — or in Terminal:
     cd /path/to/this/folder
     python3 -m http.server 8080
     open http://127.0.0.1:8080/"

cat > "${MAC_DIR}/Play-CRT-Spaceship.command" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo ""
echo " CRT Spaceship — http://127.0.0.1:8080/"
echo " Close this window or press Ctrl+C to stop."
echo ""
open "http://127.0.0.1:8080/" 2>/dev/null || true
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server 8080
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server 8080
else
  open "index.html"
  echo "Python not found; opened index.html directly."
  read -r -p "Press Enter to close..."
fi
EOF
chmod +x "${MAC_DIR}/Play-CRT-Spaceship.command"

tar -C "${STAGE}" -czf "${DIST}/CRT-Spaceship-macOS-universal.tar.gz" "CRT-Spaceship-macOS-universal"
echo "  wrote dist/CRT-Spaceship-macOS-universal.tar.gz"

# ---------- Linux portable tar.gz ----------
LIN_DIR="${STAGE}/CRT-Spaceship-Linux-x64"
mkdir -p "${LIN_DIR}"
copy_game_payload "${LIN_DIR}"
write_play_readme "${LIN_DIR}/README.txt" "Linux (portable)" \
"1. Extract: tar -xzf CRT-Spaceship-Linux-x64.tar.gz
2. Run: ./Play-CRT-Spaceship.sh
   — or: python3 -m http.server 8080
3. Open http://127.0.0.1:8080/ in Firefox or Chromium.

Flatpak: see packaging/flatpak/ in the source repository."

cat > "${LIN_DIR}/Play-CRT-Spaceship.sh" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(readlink -f "$0" 2>/dev/null || realpath "$0" 2>/dev/null || echo "$0")")"
PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}/"
echo ""
echo " CRT Spaceship — ${URL}"
echo " Press Ctrl+C to stop the server."
echo ""
# Best-effort browser open
if command -v xdg-open >/dev/null 2>&1; then
  (sleep 0.4; xdg-open "${URL}") >/dev/null 2>&1 &
elif command -v sensible-browser >/dev/null 2>&1; then
  (sleep 0.4; sensible-browser "${URL}") >/dev/null 2>&1 &
fi
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "${PORT}" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "${PORT}" --bind 127.0.0.1
else
  echo "python3 not found. Open index.html in a browser:"
  echo "  ${PWD}/index.html"
  exit 1
fi
EOF
chmod +x "${LIN_DIR}/Play-CRT-Spaceship.sh"

# Optional .desktop for local use (not installed system-wide)
cat > "${LIN_DIR}/crt-spaceship.desktop" << EOF
[Desktop Entry]
Type=Application
Name=CRT Spaceship
Comment=Retro CRT terminal space shooter
Exec=sh -c 'cd "%k" && ./Play-CRT-Spaceship.sh'
Terminal=true
Categories=Game;ArcadeGame;
StartupNotify=false
EOF

tar -C "${STAGE}" -czf "${DIST}/CRT-Spaceship-Linux-x64.tar.gz" "CRT-Spaceship-Linux-x64"
echo "  wrote dist/CRT-Spaceship-Linux-x64.tar.gz"

# ---------- Web / universal zip (also used as Android & iOS "package") ----------
WEB_DIR="${STAGE}/CRT-Spaceship-Web"
mkdir -p "${WEB_DIR}"
copy_game_payload "${WEB_DIR}"
cat > "${WEB_DIR}/README.txt" << EOF
# CRT Spaceship — Web package (all platforms)

Version: ${VERSION}
License: Apache License 2.0

This archive is the complete game. Host it on any static file server, or open
index.html locally.

## Android

1. Prefer the live site: https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/
2. Chrome menu → "Add to Home screen" / "Install app"
3. Or host this folder on your LAN and open it in Chrome

There is no signed Play Store APK in this release (would require Android SDK
signing keys). A Trusted Web Activity (TWA) is optional for store packaging;
see packaging/android/ in the source repo.

## iOS / iPadOS

1. Open https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/ in Safari
2. Share → Add to Home Screen
3. No App Store IPA is provided (Apple signing + developer account required)

## Desktop

Use the Windows / macOS / Linux archives for convenience launchers, or serve
this folder with any static server.
EOF

( cd "${STAGE}" && zip -qr "${DIST}/CRT-Spaceship-Web.zip" "CRT-Spaceship-Web" )
echo "  wrote dist/CRT-Spaceship-Web.zip"

# Android-oriented zip (same payload + Android instructions only)
AND_DIR="${STAGE}/CRT-Spaceship-Android-Web"
mkdir -p "${AND_DIR}"
copy_game_payload "${AND_DIR}"
cp "${WEB_DIR}/README.txt" "${AND_DIR}/README.txt"
cat > "${AND_DIR}/ANDROID.txt" << 'EOF'
CRT Spaceship on Android
========================

Recommended: open the GitHub Pages URL in Chrome and use Add to Home screen.

This package is a standard web app (HTML/JS). It is NOT a signed APK.

Why no APK here?
- Publishing an APK/AAB needs the Android SDK, a keystore, and Play policy review.
- Wrapping this game in a WebView/TWA does not change gameplay; it only adds
  signing and store metadata complexity.

Optional advanced path (maintainers): see packaging/android/README.md in the
source repository for TWA notes.
EOF
( cd "${STAGE}" && zip -qr "${DIST}/CRT-Spaceship-Android-Web.zip" "CRT-Spaceship-Android-Web" )
echo "  wrote dist/CRT-Spaceship-Android-Web.zip"

# iOS-oriented zip
IOS_DIR="${STAGE}/CRT-Spaceship-iOS-Web"
mkdir -p "${IOS_DIR}"
copy_game_payload "${IOS_DIR}"
cat > "${IOS_DIR}/README.txt" << 'EOF'
CRT Spaceship on iOS / iPadOS
=============================

1. Open Safari (required for Add to Home Screen):
   https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/

2. Tap Share → Add to Home Screen

3. Launch the icon for a fullscreen-style web app experience

This package contains the same web files for offline/LAN hosting. It is NOT
an App Store IPA. Building a native IPA requires an Apple Developer account,
Xcode, and code signing — out of scope for this HTML5 game release.
EOF
( cd "${STAGE}" && zip -qr "${DIST}/CRT-Spaceship-iOS-Web.zip" "CRT-Spaceship-iOS-Web" )
echo "  wrote dist/CRT-Spaceship-iOS-Web.zip"

# ---------- checksums ----------
(
  cd "${DIST}"
  rm -rf _stage
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum CRT-Spaceship-*.zip CRT-Spaceship-*.tar.gz > SHA256SUMS.txt
  else
    shasum -a 256 CRT-Spaceship-*.zip CRT-Spaceship-*.tar.gz > SHA256SUMS.txt
  fi
)

echo "==> Done. Artifacts in dist/"
ls -lh "${DIST}"
