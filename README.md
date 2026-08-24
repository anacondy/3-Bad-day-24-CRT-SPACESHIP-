# 🚀 CRT Spaceship - Retro Terminal Space Shooter

**🎮 [PLAY THE GAME HERE](https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/)**

An endless retro-style space shooter game with authentic CRT terminal aesthetics. Navigate your spaceship through waves of enemies in this fast-paced, nostalgic gaming experience.

## 📦 Download and Run

Play instantly in the browser (no install):  
**https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/**

Or download a **portable package** (no full clone required):

- **Preferred:** **[GitHub Release v1.0.0-packaging](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/tag/v1.0.0-packaging)** (public — Win / macOS / Linux / Web / Android / iOS packages)
- **All releases:** https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases
- **In-repo copies:** [`release-assets/`](release-assets/) (same files; useful offline from a clone)

| Asset | Platform | How to run |
|-------|----------|------------|
| [CRT-Spaceship-Windows-x64.zip](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-Windows-x64.zip) | Windows | Unzip → double-click `Play-CRT-Spaceship.bat` |
| [CRT-Spaceship-macOS-universal.tar.gz](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-macOS-universal.tar.gz) | macOS | Extract → double-click `Play-CRT-Spaceship.command` |
| [CRT-Spaceship-Linux-x64.tar.gz](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-Linux-x64.tar.gz) | Linux | Extract → `./Play-CRT-Spaceship.sh` |
| [CRT-Spaceship-Android-Web.zip](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-Android-Web.zip) | Android | Open site in Chrome → **Add to Home screen** (zip = web files + guide) |
| [CRT-Spaceship-iOS-Web.zip](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-iOS-Web.zip) | iOS / iPadOS | Open site in **Safari** → Share → **Add to Home Screen** |
| [CRT-Spaceship-Web.zip](https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/releases/download/v1.0.0-packaging/CRT-Spaceship-Web.zip) | Any OS | Universal static web payload |

Build packages from source:

```bash
./tools/build-release-packages.sh
# outputs under dist/ + SHA256SUMS.txt
# optional: cp -a dist/* release-assets/
```
### Windows

1. Download `CRT-Spaceship-Windows-x64.zip` from Releases  
2. Unzip anywhere  
3. Run `Play-CRT-Spaceship.bat` (uses Python’s HTTP server if available, otherwise opens `index.html`)  
4. Click **INITIALIZE SYSTEM**

### macOS

1. Download `CRT-Spaceship-macOS-universal.tar.gz`  
2. Extract and run `Play-CRT-Spaceship.command` (allow in System Settings if macOS blocks it)  
3. Or: `python3 -m http.server 8080` then open http://127.0.0.1:8080/

### Linux

1. Download `CRT-Spaceship-Linux-x64.tar.gz`  
2. `tar -xzf CRT-Spaceship-Linux-x64.tar.gz && cd CRT-Spaceship-Linux-x64 && ./Play-CRT-Spaceship.sh`  
3. **Flatpak (optional):** metadata is in [`packaging/flatpak/`](packaging/flatpak/) — not on Flathub yet; see that folder’s README

### Android

- Best: open the [live game](https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP-/) in Chrome → **Install app** / **Add to Home screen**  
- No signed Play Store APK is shipped (requires the owner’s keystore). See [`packaging/android/`](packaging/android/)

### iOS / iPadOS

- Open the live game in **Safari** → Share → **Add to Home Screen**  
- No App Store IPA (Apple Developer signing required). The iOS zip is documentation + web files only.

### License

**Apache License 2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

## 📸 Screenshots

### Start Screen
![Start Screen](https://github.com/user-attachments/assets/1952f0a1-51d2-4c15-aeab-f6f3cf011171)

### Gameplay
![Gameplay](https://github.com/user-attachments/assets/47d1fe31-8825-4b42-84f6-7182e42a6c8e)

### In Action
![In Action](https://github.com/user-attachments/assets/5356add5-1e76-447a-9a20-69955a3a3b3a)

## ✨ Features

### Core Gameplay
- **Endless Gameplay**: Survive waves of increasingly difficult enemies
- **Wave-based Difficulty**: Enemy speed and spawn rate increase with each wave
- **Score System**: Track your performance with real-time scoring
- **Smooth Controls**: Mouse/touch-based movement with automatic firing
- **Interactive Particles**: Dynamic dust particles that react to player input

### Visual Effects
- **Authentic CRT Aesthetic**: 
  - Scanline overlay for classic CRT monitor effect
  - Screen curvature vignette
  - Phosphor green color scheme (#39ff14)
  - Screen flicker animation
  - Retro pixel-perfect rendering
- **VT323 Monospace Font**: Period-appropriate terminal font
- **Particle System**: Ambient dust particles with touch/mouse repulsion
- **Explosion Effects**: Visual feedback for destroyed enemies
- **Glow Effects**: Atmospheric glowing bullets and sprites

### Audio
- **Procedural Sound Effects** (Web Audio API):
  - Shoot sounds (frequency sweep)
  - Explosion sounds (filtered noise)
  - Background ambience (60Hz hum)
- **No External Audio Files**: All sounds generated in real-time

### Performance
- **Optimized Rendering**: Smooth 60 FPS gameplay
- **Responsive Design**: Works on desktop and mobile devices
- **No Dependencies**: Pure HTML5 Canvas and vanilla JavaScript
- **Fast Loading**: Single-file architecture, loads instantly
- **Mobile Optimized**: Touch controls with prevented zooming/scrolling

## 🎯 How to Play

1. **Click/Tap** "INITIALIZE SYSTEM" to start the game
2. **Move** your mouse or finger to control the spaceship
3. **Shoot** by clicking/tapping anywhere on the screen
4. **Avoid** letting enemies reach the bottom
5. **Score** 100 points for each destroyed enemy
6. **Progress** through waves as your score increases (every 1000 points)

## 🚀 Deployment

### GitHub Pages (Recommended)

The game is automatically deployed to GitHub Pages via GitHub Actions.

**Manual Setup:**
1. Go to repository Settings
2. Navigate to Pages section
3. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: main (or your preferred branch)
   - Folder: / (root)
4. Click Save
5. Your game will be available at: `https://[username].github.io/[repository-name]/`

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to deploy your game

### Netlify

1. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=.
   ```

2. **Via Netlify Dashboard:**
   - Go to https://app.netlify.com
   - Drag and drop your repository folder
   - Your site will be live instantly

### AWS S3 + CloudFront

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-game-bucket
   ```

2. **Enable Static Website Hosting:**
   ```bash
   aws s3 website s3://your-game-bucket --index-document index.html
   ```

3. **Upload Files:**
   ```bash
   aws s3 sync . s3://your-game-bucket --exclude ".git/*"
   ```

4. **Set Public Access:**
   ```bash
   aws s3api put-bucket-policy --bucket your-game-bucket --policy file://policy.json
   ```

   **policy.json:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::your-game-bucket/*"
     }]
   }
   ```

5. **Optional - CloudFront CDN:**
   - Create CloudFront distribution pointing to your S3 bucket
   - Enable HTTPS
   - Set default root object to `index.html`

### Google Cloud Platform (Firebase Hosting)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json:**
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

### Azure Static Web Apps

1. **Install Azure CLI:**
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login:**
   ```bash
   az login
   ```

3. **Create Static Web App:**
   ```bash
   az staticwebapp create \
     --name crt-spaceship \
     --resource-group YourResourceGroup \
     --source . \
     --location "eastus2" \
     --branch main
   ```

### Heroku

1. **Create a Simple Server:**
   
   Create `package.json`:
   ```json
   {
     "name": "crt-spaceship",
     "version": "1.0.0",
     "scripts": {
       "start": "node server.js"
     },
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

   Create `server.js`:
   ```javascript
   const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(express.static('.'));
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

2. **Deploy to Heroku:**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Local Development

Simply open `index.html` in any modern web browser, or use a local server:

**Python:**
```bash
python3 -m http.server 8080
```

**Node.js:**
```bash
npx http-server
```

**PHP:**
```bash
php -S localhost:8080
```

Then open: http://localhost:8080

## 🛠️ Technical Details

### Architecture
- **Single HTML File**: All code contained in `index.html`
- **No Build Process**: No compilation or transpilation needed
- **No Dependencies**: Zero external libraries or frameworks
- **Pure JavaScript**: ES6+ features for modern browsers
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **Web Audio API**: Real-time procedural audio generation

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Cross-Platform Support

This is a **static browser game** (no native binaries). It is intended to run on:

| Platform | Run method |
|----------|------------|
| Windows | Edge / Chrome / Firefox — local server or GitHub Pages |
| macOS | Safari 14+ / Chrome / Firefox |
| Linux | Chromium / Firefox |
| Android | Chrome Mobile (web or Add to Home screen) |
| iOS / iPadOS | Mobile Safari (web or Add to Home Screen) |

Full platform notes (viewport/orientation, input matrix, security, test steps): **[PLATFORM.md](PLATFORM.md)**

**Quick platform smoke test** (Node 18+, optional Puppeteer for headless runtime):

```bash
node tools/platform-smoke.js
# optional runtime:
# npm install --no-save puppeteer && node tools/platform-smoke.js
```

### Performance Optimizations
- **Efficient Particle System**: Object pooling for particles
- **RequestAnimationFrame**: Smooth 60 FPS rendering
- **Canvas Optimizations**: Minimal state changes, batch rendering
- **Event Delegation**: Efficient input handling
- **No Memory Leaks**: Proper cleanup of inactive entities

## 📖 Code Structure

```javascript
// Main Systems
- AudioEngine: Procedural sound generation
- ParticleSystem: Ambient dust with interaction physics
- GameLoop: Core game logic and rendering

// Game Entities
- Player: Triangle spaceship with smooth interpolated movement
- Bullets: Projectile system with collision detection
- Enemies: Wave-based spawning with pixel art sprites
- Explosions: Particle-based explosion effects

// Visual Effects
- CRT Filter: Scanlines, vignette, flicker
- Glow Effects: Shadow blur on sprites
- Particle Repulsion: Interactive dust physics
```

## 🐛 Troubleshooting

### Audio Not Working
- Ensure you've clicked "INITIALIZE SYSTEM" (audio requires user interaction)
- Check browser permissions for audio playback
- Try refreshing the page

### Performance Issues
- Close other browser tabs
- Update your graphics drivers
- Try a different browser
- Disable browser extensions

### Controls Not Responding
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page
- Test with different input methods (mouse vs touch)

## 📝 License

**Apache License 2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

## 🐧 Flatpak status

Flatpak **metadata is prepared** under [`packaging/flatpak/`](packaging/flatpak/) (`io.github.anacondy.CRTSpaceship`).

- Local build instructions: [`packaging/flatpak/README.md`](packaging/flatpak/README.md)  
- **Not published on Flathub yet** — submission still needs maintainer review, screenshot URLs, and a Flathub app repo (documented in that README).

## 🤖 Automated workflows

| Workflow | Role |
|----------|------|
| [deploy.yml](.github/workflows/deploy.yml) | Deploy site to GitHub Pages on push to `main` |
| [packaging/github-workflows/game-update.yml](packaging/github-workflows/game-update.yml) | **Fixed** report-only analysis (manual). Copy → `.github/workflows/` |
| [packaging/github-workflows/release.yml](packaging/github-workflows/release.yml) | Build portable zip/tar.gz on version tags. Copy → `.github/workflows/` |

### Branch spam (fixed — maintainer install step required)

An older `.github/workflows/game-update.yml` ran every 3 days, always rewrote `version.json`, and opened a PR on a **new** branch `auto-update/<run_id>` each time. That produced **~92** leftover `auto-update/*` branches.

**Stop new spam (do this after merge):**

1. **Actions → Game Update & Debug Analysis → Disable workflow** (immediate), and/or  
2. Copy the fixed files from [`packaging/github-workflows/`](packaging/github-workflows/) into `.github/workflows/` (see [BRANCH_CLEANUP.md](BRANCH_CLEANUP.md)).

Historical branches are **not** mass-deleted here — cleanup commands are in **[BRANCH_CLEANUP.md](BRANCH_CLEANUP.md)**.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📚 Wiki

For more detailed information, check out the [Wiki](../../wiki) including:
- Game Mechanics Deep Dive
- Code Architecture
- Performance Tuning Guide
- Adding New Features
- Custom Sound Effects

Platform / packaging docs in-repo:
- [PLATFORM.md](PLATFORM.md) — browser platform matrix  
- [BRANCH_CLEANUP.md](BRANCH_CLEANUP.md) — auto-update branch cleanup  
- [packaging/flatpak/README.md](packaging/flatpak/README.md) — Flatpak / Flathub  

## 👏 Credits

Created with ❤️ using pure HTML5, Canvas, and Web Audio API

---

**Enjoy the retro gaming experience! 🎮👾**
