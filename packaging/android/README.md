# Android packaging notes — CRT Spaceship

## Realistic player path (recommended)

1. Open https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/ in **Chrome**
2. Menu → **Add to Home screen** / **Install app** (uses `site.webmanifest`)
3. Play offline-capable from the home-screen icon (network only needed for fonts)

Release asset: **`CRT-Spaceship-Android-Web.zip`** — same web files + instructions.

## Why there is no signed APK in GitHub Releases

| Requirement | Status |
|-------------|--------|
| Android SDK / Gradle project | Not in this repo (would be a large wrapper) |
| Signing keystore | Must **not** be committed; owner-only secret |
| Play App Signing | Owner Google Play Console account |
| Store listing, privacy policy | Owner responsibility |
| TWA (Trusted Web Activity) | Optional; still needs the above |

Shipping an unsigned APK is not useful for normal players. A CI-built APK
without the owner’s keystore cannot be updated on Play.

## Optional TWA path (maintainers only)

If you later want a Play Store listing that wraps the **already-hosted** PWA:

1. Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) against the
   live HTTPS origin (GitHub Pages URL).
2. Point `start_url` / `scope` at the Pages site (Digital Asset Links required).
3. Build a release AAB, sign with your keystore, upload to Play Console.

Do **not** embed secrets in this repository. Do **not** change game physics/UI
for packaging.

## Security

- No extra Android permissions are required for the pure web path
- Game telemetry stays in browser `localStorage` (see root `PLATFORM.md`)
