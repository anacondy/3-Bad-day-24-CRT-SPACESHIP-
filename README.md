# 🚀 CRT Spaceship - Retro Terminal Space Shooter

**🎮 [PLAY THE GAME HERE](https://anacondy.github.io/3-Bad-day-24-CRT-SPACESHIP/)**

An endless retro-style space shooter game with authentic CRT terminal aesthetics. Navigate your spaceship through waves of enemies in this fast-paced, nostalgic gaming experience.

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

MIT License - See [LICENSE](LICENSE) file for details

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

## 👏 Credits

Created with ❤️ using pure HTML5, Canvas, and Web Audio API

---

**Enjoy the retro gaming experience! 🎮👾**
