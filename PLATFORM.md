# Platform Support — CRT Spaceship

This document describes how the game runs across desktop and mobile platforms.
It does **not** change gameplay, physics, visuals, or UI layout.

## What the game is

| Item | Detail |
|------|--------|
| Name | CRT Spaceship (Retro CRT Interactive Terminal) |
| Type | Browser-based endless space shooter |
| Stack | HTML5 Canvas 2D, vanilla JavaScript (ES6+), Web Audio API |
| Build | **None** — open `index.html` or serve the repo root as static files |
| Native shells | None (no Electron, Capacitor, Cordova, or app-store packages) |
| Dependencies | Zero npm packages. Optional Google Fonts (VT323) over HTTPS |

Primary entry: [`index.html`](index.html)  
Optional client telemetry: [`js/telemetry.js`](js/telemetry.js) (localStorage only)  
Version metadata: [`version.json`](version.json)  
Web app manifest: [`site.webmanifest`](site.webmanifest)

Live deploy (GitHub Pages): https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/

---

## Supported platforms

The game is a **static web app**. “Supported” means it is intended to run in a modern browser on that OS.

| Platform | How to run | Status |
|----------|------------|--------|
| **Windows** | Chrome, Edge, Firefox — open local file or any static host | Supported |
| **macOS** | Safari 14+, Chrome, Firefox | Supported |
| **Linux** | Chrome/Chromium, Firefox | Supported |
| **Android** | Chrome Mobile, Samsung Internet, Firefox — mobile web / “Add to Home screen” | Supported (mobile web) |
| **iOS / iPadOS** | Mobile Safari, or home-screen web app (standalone) | Supported (mobile web / WebView) |

There is **no** separate Windows `.exe`, macOS `.app`, Android APK/AAB, or iOS IPA in this repository. Packaging as a native wrapper is out of scope; the wiki notes Cordova/Capacitor would require a wrapper project.

### Browser baselines (from README)

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- iOS Safari, Chrome Mobile

Required APIs: Canvas 2D, `requestAnimationFrame`, Web Audio API (after a user gesture), ES6 classes/`const`/`let`.

---

## How to run / build on each platform

### Local (all desktop OS)

No install step beyond a browser.

```bash
# From the repository root
python3 -m http.server 8080
# or: npx --yes serve -l 8080
# or: npx --yes http-server -p 8080
```

Open: `http://localhost:8080/`

Opening `index.html` via `file://` usually works for gameplay, but:

- `fetch('version.json')` in telemetry may fail under `file://` (harmless; version falls back to `1.0.0`)
- Some browsers restrict Web Audio or fonts on `file://` — prefer a local HTTP server

### Windows

1. Install any modern browser (Edge is preinstalled).
2. Serve the folder (Python, Node, or VS Code Live Server) **or** double-click `index.html`.
3. Click **INITIALIZE SYSTEM** (required before audio).

Keyboard: `←` `→` move · `Shift` fire · `Shift+A` auto-fire · `M` mute · `Space` pause · `Enter` start.

### macOS

Same as Windows. Safari requires the start-button gesture before Web Audio unlocks (already handled by **INITIALIZE SYSTEM**).

### Linux

Same as Windows. If you only have a minimal environment, use Chromium or Firefox from your distro packages.

### Android

1. Deploy the static site (GitHub Pages, Netlify, etc.) **or** reach a machine on your LAN running a static server.
2. Open the URL in Chrome (or another modern browser).
3. Optional: browser menu → **Add to Home screen** / **Install app** (uses `site.webmanifest`).
4. Touch: drag to move ship, tap to shoot. `touch-action: none` and non-passive touch listeners reduce scroll/zoom interference.

No Play Store package is produced by this repo.

### iOS / iPadOS

1. Open the HTTPS URL in Safari (GitHub Pages is fine).
2. Tap **INITIALIZE SYSTEM** once (unlocks audio).
3. Optional: Share → **Add to Home Screen** for standalone display (`apple-mobile-web-app-capable`).
4. Touch controls match Android. Hardware keyboards (if attached) use the same PC key map.

No App Store package is produced by this repo. WKWebView embeds should load the same origin URL; allow inline scripts and the Google Fonts origins if CSP is enforced at the native layer.

---

## Screen size, orientation, and safe areas

| Behavior | Implementation |
|----------|----------------|
| Full-window canvas | `#crt-container` is `100vw` / `100vh` with `100dvw` / `100dvh` overrides where supported |
| Canvas buffer | Set to viewport width/height on resize (`canvas.width` / `canvas.height`) |
| Mobile browser chrome | `visualViewport` resize/scroll listeners (when available) keep the canvas matched to the visible area |
| Orientation | `orientation: any` in the manifest; `orientationchange` triggers delayed resize (iOS dimension lag) |
| Zoom / scroll | `user-scalable=no`, `touch-action: none`, `preventDefault` on touch move |
| Safe areas | `viewport-fit=cover`; game is intentionally edge-to-edge CRT (no extra letterboxing UI) |
| Player position | Bottom-anchored (`height - 80`); recentered on resize (original behavior) |

**Known mobile notes**

- iOS Safari dynamic toolbars historically broke plain `100vh`; `dvh` + `visualViewport` mitigate this without changing sprite sizes or speeds.
- Very small landscape phones may crowd the start overlay text; layout CSS was not redesigned (visual freeze rule).
- Notch / Dynamic Island: content can draw under the status bar in standalone mode by design (black CRT full bleed).

---

## Input matrix

| Input | Desktop | Mobile web |
|-------|---------|------------|
| Mouse move + click | Move + fire | N/A (or with mouse-capable tablet) |
| Touch drag + tap | N/A | Move + fire |
| Ghost mouse after touch | Suppressed (~700 ms) | Prevents double-shot on hybrid devices |
| Keyboard | Full PC controls | Works with hardware keyboard if present |
| Gamepad | Not implemented | Not implemented |

---

## Deployment configs in-repo

| Path | Role |
|------|------|
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | Deploys repo root to GitHub Pages on push to `main` |
| [`.github/workflows/game-update.yml`](.github/workflows/game-update.yml) | Scheduled telemetry analysis / screenshots (does not ship a binary) |
| [`.nojekyll`](.nojekyll) | Ensures GitHub Pages serves files without Jekyll filtering |
| [`site.webmanifest`](site.webmanifest) | PWA-lite install metadata |

Other hosts (Netlify, Vercel, S3, Firebase, etc.) are documented in the main [README.md](README.md). Point the host’s public directory at the repository root; default document `index.html`.

---

## How to test

### Automated smoke checks (this repo)

```bash
# Static analysis + headless browser smoke (requires Node 18+)
node tools/platform-smoke.js
```

The smoke script verifies:

1. Required files exist (`index.html`, `site.webmanifest`, `version.json`, `js/telemetry.js`)
2. Viewport / CSP / manifest meta tags are present
3. No obvious physics-constant edits are required for CI
4. With Puppeteer (optional), loads the page over HTTP, starts the game, and checks for page errors

### Manual checklist

1. **Desktop (Win/macOS/Linux):** start → move with mouse and arrows → fire → pause → mute → survive one wave.
2. **Mobile portrait:** start → drag ship → tap fire → rotate to landscape → confirm canvas still fills the screen and input tracks the finger.
3. **iOS audio:** lock device or switch apps, return, confirm ambience/SFx resume after unpause/foreground (user pause still mutes via existing pause path).
4. **Installability:** Android Chrome “Install app” / iOS “Add to Home Screen” launches standalone without browser chrome (where the OS allows).
5. **Offline font fallback:** block `fonts.googleapis.com` — game still runs with the monospace fallback stack.

### What this environment can and cannot prove

| Check | In CI / this sandbox |
|-------|----------------------|
| Static file presence & HTML wiring | Yes |
| HTTP load + start button + canvas present | Yes (headless Chromium when Puppeteer available) |
| Real iOS Safari / Android device | **No** — needs a physical device or cloud device lab |
| App Store / Play Store packages | N/A — not part of the project |
| Pixel-perfect visual regression | Not run (visual changes are out of scope) |

---

## Security notes (platform-relevant)

| Topic | Status |
|-------|--------|
| Secrets in repo | No API keys or cloud credentials in game code |
| Network | Gameplay needs no network. Google Fonts CSS is the only third-party load. Telemetry uses `fetch('version.json')` same-origin only |
| Storage | Telemetry writes obfuscated JSON to `localStorage` key `crt_spaceship_logs` |
| “Encryption” in telemetry | Client-side XOR + Base64 with a **public** key string — obfuscation only, not confidentiality. Do not treat logs as secure |
| CSP | Meta CSP restricts defaults to `'self'`, allows inline script/style (required for single-file game), and allows Google Fonts |
| Permissions | No camera, mic, geolocation, notifications, or persistent FS APIs requested |
| `eval` / remote code | Not used by game logic |
| XSS surface | No user-generated HTML rendering; score/UI use `innerText` |

---

## Known limitations

1. **Browser-only distribution** — not a native multi-platform binary.
2. **Google Fonts dependency** for the authentic VT323 look when online; offline uses generic monospace.
3. **Audio** requires a user gesture on autoplay-restricted browsers (start button).
4. **No gamepad API** wiring.
5. **Telemetry cannot be centrally collected** from browsers automatically; CI expects an optional `logs/telemetry.enc` file that is not produced by normal play without a custom export path.
6. **Landscape UI density** on very short viewports is unchanged by design.
7. **CSP `unsafe-inline`** is required because the game script and styles live inside `index.html`.

---

## After review — suggested next steps

1. Merge the open PR only after manual smoke on one desktop browser and one phone.
2. Confirm GitHub Pages still serves `index.html`, `site.webmanifest`, and `js/telemetry.js`.
3. Optionally run Lighthouse PWA checks (installability is best-effort with an SVG data-URI icon).
4. Do **not** change bullet speed, enemy speed, spawn rates, lerp factors, or CSS layout without a separate gameplay-approved change.
