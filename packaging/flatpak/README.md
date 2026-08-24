# Flatpak packaging — CRT Spaceship

App ID: **`io.github.anacondy.CRTSpaceship`**

This directory prepares the HTML5 game for Linux distribution via Flatpak / Flathub.
The game files themselves are **not** modified.

## Layout

| Path | Purpose |
|------|---------|
| `io.github.anacondy.CRTSpaceship.yml` | flatpak-builder manifest |
| `io.github.anacondy.CRTSpaceship.desktop` | Desktop entry |
| `io.github.anacondy.CRTSpaceship.metainfo.xml` | AppStream metadata |
| `launcher/crt-spaceship.sh` | Starts a localhost static server + opens browser |
| `icons/*.svg` | App icon |
| `game-src/` | **Generated** copy of runtime game files (see sync step) |
| `sync-game-src.sh` | Copies `index.html`, `js/`, etc. into `game-src/` |

## Sync game files into the Flatpak source dir

From the repository root:

```bash
./packaging/flatpak/sync-game-src.sh
```

## Local build & install (Linux + flatpak-builder)

```bash
# Install deps (Debian/Ubuntu example)
# sudo apt install flatpak flatpak-builder
# flatpak install -y flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08

./packaging/flatpak/sync-game-src.sh

cd packaging/flatpak
flatpak-builder --user --install --force-clean build-dir \
  io.github.anacondy.CRTSpaceship.yml

flatpak run io.github.anacondy.CRTSpaceship
```

## What still is required for Flathub

Flatpak **metadata is ready**; Flathub publication is a separate maintainer process:

1. **Fork** [flathub/flathub](https://github.com/flathub/flathub) and open a
   pull request adding this app (Flathub’s current “new app” workflow).
2. Host the app manifest in a dedicated Flathub repo  
   `flathub/io.github.anacondy.CRTSpaceship` (created after acceptance).
3. Prefer building from a **git tag** or release tarball URL rather than a
   random branch (reproducible builds).
4. Replace the placeholder **screenshot** URL in the metainfo with permanent
   HTTPS images (1280×720+ recommended) that Flathub can fetch.
5. Run quality checks:
   ```bash
   flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest \
     io.github.anacondy.CRTSpaceship.yml
   appstreamcli validate io.github.anacondy.CRTSpaceship.metainfo.xml
   ```
6. Confirm license is **Apache-2.0** (already set in metainfo + LICENSE).
7. Decide network permission: currently allowed for optional Google Fonts;
   gameplay works offline if you drop `--share=network` later.

### Not done automatically here

- Flathub maintainer approval
- Automated CI on Flathub’s builders
- Shipping a Chromium **inside** the Flatpak (we open the host browser instead —
  smaller, simpler, no Electron)

## Alternative: pure web package

Players who do not use Flatpak can download **CRT-Spaceship-Linux-x64.tar.gz**
from GitHub Releases and run `./Play-CRT-Spaceship.sh`.
