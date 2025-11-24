# Adding Features Guide

Learn how to extend CRT Spaceship with new features and mechanics.

## Before You Start

### Development Setup

1. **Code Editor**: VSCode, Sublime, or any editor
2. **Browser**: Chrome/Firefox with DevTools
3. **Local Server**: Python HTTP server or Live Server extension
4. **Version Control**: Git (recommended)

### Testing Workflow

1. Make changes to `index.html`
2. Save file
3. Refresh browser (F5)
4. Test in DevTools console
5. Check FPS and errors

## Easy Features to Add

### 1. Add Player Lives

**Location**: Global variables section

**Code**:
```javascript
// Add with other game state
let lives = 3;

// Add UI element in HTML
<div class="ui-stats">
    SYSTEM: ONLINE<br>
    LIVES: <span id="lives">3</span><br>
    <!-- existing stats -->
</div>

// Check collision with player
enemies.forEach(e => {
    if (e.y > player.y - 20 && 
        e.x > player.x - 20 && 
        e.x < player.x + 20) {
        
        e.active = false;
        lives--;
        document.getElementById('lives').innerText = lives;
        
        if (lives <= 0) {
            gameOver();
        }
    }
});

function gameOver() {
    gameActive = false;
    // Show game over screen
    alert('GAME OVER - Score: ' + score);
}
```

### 2. Add Power-Ups

**New Class**:
```javascript
class PowerUp {
    constructor() {
        this.x = Math.random() * (width - 20);
        this.y = -20;
        this.width = 20;
        this.height = 20;
        this.speed = 2;
        this.type = 'rapidfire'; // or 'shield', 'laser', etc.
        this.active = true;
    }
    
    update() {
        this.y += this.speed;
        if (this.y > height) this.active = false;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffff00'; // Yellow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Spawn occasionally
if (Math.random() < 0.001) {
    powerups.push(new PowerUp());
}

// Collision with player
powerups.forEach(p => {
    if (p.y > player.y - 20 &&
        p.x > player.x - 20 &&
        p.x < player.x + 20) {
        
        p.active = false;
        activatePowerUp(p.type);
    }
});

function activatePowerUp(type) {
    if (type === 'rapidfire') {
        // Allow multiple bullets
        rapidFireActive = true;
        setTimeout(() => {
            rapidFireActive = false;
        }, 5000); // 5 seconds
    }
}
```

### 3. Add High Score

**Using localStorage**:
```javascript
// Load high score
let highScore = parseInt(localStorage.getItem('crt_highscore') || '0');

// Add to UI
<div class="ui-score">
    SCORE: <span id="score">0000</span><br>
    BEST: <span id="highscore">0000</span><br>
    WAVE: <span id="wave">01</span>
</div>

// Update high score
if (score > highScore) {
    highScore = score;
    localStorage.setItem('crt_highscore', highScore.toString());
    document.getElementById('highscore').innerText = 
        highScore.toString().padStart(4, '0');
}
```

### 4. Add Pause Function

**Code**:
```javascript
let isPaused = false;

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        isPaused = !isPaused;
    }
});

// In game loop
function loop(timestamp) {
    if (isPaused) {
        // Show pause overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#39ff14';
        ctx.font = '48px VT323';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width/2, height/2);
        
        requestAnimationFrame(loop);
        return; // Skip game logic
    }
    
    // Normal game logic...
}
```

## Intermediate Features

### 1. Different Enemy Types

**Code**:
```javascript
class FastEnemy extends Enemy {
    constructor() {
        super();
        this.speed *= 2;
        this.color = '#ff3914'; // Red
        this.shape = [
            [0,1,0],
            [1,1,1],
            [1,0,1]
        ];
    }
}

class TankEnemy extends Enemy {
    constructor() {
        super();
        this.speed *= 0.5;
        this.width = 50;
        this.height = 50;
        this.health = 3; // Takes 3 hits
    }
}

// Spawn different types
if (Math.random() < 0.01) {
    if (Math.random() < 0.3) {
        enemies.push(new FastEnemy());
    } else if (Math.random() < 0.1) {
        enemies.push(new TankEnemy());
    } else {
        enemies.push(new Enemy());
    }
}
```

### 2. Enemy Shooting

**Code**:
```javascript
class ShootingEnemy extends Enemy {
    constructor() {
        super();
        this.lastShot = 0;
        this.shootInterval = 2000; // 2 seconds
    }
    
    update() {
        super.update();
        
        // Shoot at player
        if (Date.now() - this.lastShot > this.shootInterval) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width/2, 
                this.y + this.height
            ));
            this.lastShot = Date.now();
        }
    }
}

class EnemyBullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.active = true;
    }
    
    update() {
        this.y += this.speed; // Down
        if (this.y > height) this.active = false;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ff3914'; // Red
        ctx.fillRect(this.x-2, this.y, 4, 10);
    }
}

// Check collision with player
enemyBullets.forEach(b => {
    if (b.y > player.y - 20 &&
        b.x > player.x - 20 &&
        b.x < player.x + 20) {
        
        b.active = false;
        lives--;
    }
});
```

### 3. Boss Battles

**Code**:
```javascript
class Boss {
    constructor() {
        this.x = width / 2 - 75;
        this.y = -200;
        this.width = 150;
        this.height = 150;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 1;
        this.movingRight = true;
    }
    
    update() {
        // Enter screen
        if (this.y < 50) {
            this.y += this.speed;
        } else {
            // Move side to side
            if (this.movingRight) {
                this.x += 2;
                if (this.x > width - this.width - 50) {
                    this.movingRight = false;
                }
            } else {
                this.x -= 2;
                if (this.x < 50) {
                    this.movingRight = true;
                }
            }
        }
        
        // Shoot pattern
        if (Math.random() < 0.02) {
            this.shootPattern();
        }
    }
    
    shootPattern() {
        // Spread shot
        for (let i = -2; i <= 2; i++) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width/2 + i*20,
                this.y + this.height
            ));
        }
    }
    
    draw(ctx) {
        // Draw boss sprite
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Health bar
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 15, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight);
    }
}

// Spawn boss every 5 waves
if (score > wave * 1000 && wave % 5 === 0 && !bossActive) {
    boss = new Boss();
    bossActive = true;
}
```

### 4. Combo System

**Code**:
```javascript
let combo = 0;
let comboTimer = 0;
const COMBO_TIMEOUT = 2000; // 2 seconds

// On enemy kill
function onEnemyKilled() {
    combo++;
    comboTimer = Date.now();
    
    // Bonus points for combo
    const bonusScore = 100 * combo;
    score += bonusScore;
    
    // Show combo text
    showComboText(`${combo}x COMBO!`);
}

// In game loop
if (Date.now() - comboTimer > COMBO_TIMEOUT && combo > 0) {
    combo = 0; // Reset combo
}

// Draw combo meter
function drawComboMeter() {
    if (combo > 1) {
        ctx.font = '24px VT323';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO: ${combo}x`, width/2, 50);
    }
}
```

## Advanced Features

### 1. Particle Trail System

**Code**:
```javascript
class Trail {
    constructor(x, y, color) {
        this.particles = [];
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + (Math.random()-0.5)*10,
                y: y + (Math.random()-0.5)*10,
                vx: (Math.random()-0.5)*2,
                vy: (Math.random()-0.5)*2,
                life: 1.0,
                color: color
            });
        }
    }
    
    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
            ctx.globalAlpha = 1;
        });
    }
}

// Add trail to bullet
trails.push(new Trail(bullet.x, bullet.y, '#39ff14'));
```

### 2. Screen Shake

**Code**:
```javascript
let screenShake = 0;

function shakeScreen(intensity) {
    screenShake = intensity;
}

// In game loop (before drawing)
if (screenShake > 0) {
    const offsetX = (Math.random() - 0.5) * screenShake;
    const offsetY = (Math.random() - 0.5) * screenShake;
    ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
    screenShake *= 0.9; // Decay
} else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Trigger on explosion
AudioEngine.playExplosion();
shakeScreen(10); // Intensity 10
```

### 3. Achievements System

**Code**:
```javascript
const achievements = {
    firstKill: { unlocked: false, name: "First Blood" },
    wave5: { unlocked: false, name: "Wave Warrior" },
    score10k: { unlocked: false, name: "High Scorer" },
    combo10: { unlocked: false, name: "Combo Master" }
};

function checkAchievements() {
    if (score > 0 && !achievements.firstKill.unlocked) {
        unlockAchievement('firstKill');
    }
    if (wave >= 5 && !achievements.wave5.unlocked) {
        unlockAchievement('wave5');
    }
    // etc...
}

function unlockAchievement(id) {
    achievements[id].unlocked = true;
    
    // Save to localStorage
    localStorage.setItem('achievements', JSON.stringify(achievements));
    
    // Show notification
    showNotification(`Achievement Unlocked: ${achievements[id].name}`);
}
```

## Testing Your Features

### 1. Console Testing

```javascript
// Test in browser console
score = 10000; // Set score
wave = 10; // Set wave
lives = 0; // Trigger game over
AudioEngine.playShoot(); // Test sound
```

### 2. Debug Mode

```javascript
const DEBUG = true;

if (DEBUG) {
    // Draw hitboxes
    ctx.strokeStyle = '#ff0000';
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Show FPS graph
    // Log events
    console.log('Enemy spawned at', enemy.x, enemy.y);
}
```

### 3. Unit Testing (Advanced)

Not included by default, but you could add:
```javascript
function testCollisionDetection() {
    const bullet = { x: 100, y: 100, width: 4, height: 10 };
    const enemy = { x: 98, y: 95, width: 30, height: 30 };
    
    const collision = checkCollision(bullet, enemy);
    console.assert(collision === true, 'Collision should be detected');
}
```

## Best Practices

1. **Test Incrementally**: Add one feature, test, then commit
2. **Keep Backups**: Use Git or save copies
3. **Comment Your Code**: Explain complex logic
4. **Check Performance**: Monitor FPS after changes
5. **Mobile Test**: Test on actual mobile device

## Common Issues

**Problem**: New feature causes lag
- **Solution**: Profile with DevTools, optimize loops

**Problem**: Feature breaks existing gameplay
- **Solution**: Check for variable name conflicts, scope issues

**Problem**: Audio doesn't play
- **Solution**: Ensure AudioContext is initialized

---

[← Back to Visual Effects](Visual-Effects) | [Return to Home](Home)
