# Performance Tuning Guide

Learn how to optimize CRT Spaceship for different devices and use cases.

## Current Performance Profile

### Baseline Performance
- **Target FPS**: 60
- **Typical FPS**: 58-60 on modern hardware
- **Mobile FPS**: 45-60 on mid-range devices
- **RAM Usage**: ~50-100 MB
- **CPU Usage**: ~15-25% single core

## Performance Bottlenecks

### Identified Bottlenecks

1. **Canvas Rendering** (60% of frame time)
   - Drawing particles
   - Drawing enemies
   - Shadow blur effects

2. **Collision Detection** (20% of frame time)
   - Nested loops for bullet-enemy checks
   - No spatial partitioning

3. **Particle Updates** (15% of frame time)
   - Distance calculations
   - Interaction physics

4. **Other** (5% of frame time)
   - Input handling
   - Audio generation

## Optimization Techniques

### 1. Reduce Particle Count

**Current**:
```javascript
const count = Math.min((width * height) / 4000, 200);
```

**Optimized for Low-End**:
```javascript
const count = Math.min((width * height) / 6000, 100);
```

**Impact**: 
- ✅ Reduces draw calls
- ✅ Fewer physics calculations
- ❌ Less visual density

### 2. Disable Shadow Blur

**Current**:
```javascript
ctx.shadowBlur = 10;
ctx.shadowColor = '#39ff14';
ctx.fillRect(x, y, width, height);
ctx.shadowBlur = 0;
```

**Optimized**:
```javascript
// Remove shadowBlur lines
ctx.fillRect(x, y, width, height);
```

**Impact**:
- ✅ Significant performance boost (5-10 FPS)
- ❌ Less glowy aesthetic

### 3. Spatial Partitioning for Collisions

**Current** (O(n*m) - bullets × enemies):
```javascript
enemies.forEach(e => {
    bullets.forEach(b => {
        // Check collision
    });
});
```

**Optimized** (Grid-based):
```javascript
// Divide screen into grid cells
const grid = new Map();

// Insert entities into grid cells
bullets.forEach(b => {
    const cellKey = getCellKey(b.x, b.y);
    if (!grid.has(cellKey)) grid.set(cellKey, []);
    grid.get(cellKey).push(b);
});

// Only check entities in same/nearby cells
enemies.forEach(e => {
    const cellKey = getCellKey(e.x, e.y);
    const nearby = grid.get(cellKey) || [];
    nearby.forEach(b => {
        // Check collision
    });
});
```

**Impact**:
- ✅ O(n+m) instead of O(n*m)
- ✅ Scales better with more entities
- ⚠️ Adds code complexity

### 4. Object Pooling for Bullets/Enemies

**Current**:
```javascript
bullets.push(new Bullet(x, y));
```

**Optimized**:
```javascript
class BulletPool {
    constructor(size) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Bullet(0, 0));
        }
        this.available = [...this.pool];
    }
    
    get(x, y) {
        if (this.available.length === 0) {
            return new Bullet(x, y); // Fallback
        }
        const bullet = this.available.pop();
        bullet.x = x;
        bullet.y = y;
        bullet.active = true;
        return bullet;
    }
    
    release(bullet) {
        bullet.active = false;
        this.available.push(bullet);
    }
}
```

**Impact**:
- ✅ Reduces garbage collection
- ✅ More consistent frame times
- ⚠️ Requires pool management

### 5. Reduce Canvas Filter Effects

**Current**:
```css
canvas {
    filter: blur(0.5px) contrast(1.2) brightness(1.1);
}
```

**Optimized**:
```css
canvas {
    filter: none;
    /* or just contrast if blur is too expensive */
    filter: contrast(1.2);
}
```

**Impact**:
- ✅ GPU performance improvement
- ❌ Less CRT aesthetic

### 6. Conditional Scanline Rendering

**Current**: Always rendered via CSS

**Optimized**: Toggle based on performance
```javascript
// Detect low FPS
if (currentFPS < 45) {
    document.querySelector('.scanlines').style.display = 'none';
    document.querySelector('.flicker').style.display = 'none';
}
```

**Impact**:
- ✅ Improves frame rate on weak GPUs
- ❌ Loses CRT look

### 7. Limit Enemy Count

**Add a cap**:
```javascript
const MAX_ENEMIES = 15;

if (gameActive && 
    Math.random() < 0.015 * wave && 
    enemies.length < MAX_ENEMIES) {
    enemies.push(new Enemy());
}
```

**Impact**:
- ✅ Prevents performance degradation at high waves
- ⚠️ Changes game balance

### 8. Use OffscreenCanvas for Sprites

**Concept**: Pre-render enemy sprites
```javascript
const spriteCache = new OffscreenCanvas(30, 30);
const spriteCtx = spriteCache.getContext('2d');

// Render sprite once
spriteCtx.fillStyle = '#39ff14';
// ... draw sprite pattern

// In draw loop:
ctx.drawImage(spriteCache, enemy.x, enemy.y);
```

**Impact**:
- ✅ Faster rendering (blit vs draw)
- ⚠️ More memory usage
- ⚠️ Browser compatibility (newer browsers only)

## Platform-Specific Optimizations

### Mobile Devices

1. **Reduce Resolution**:
```javascript
const scaleFactor = 0.75; // 75% resolution
canvas.width = width * scaleFactor;
canvas.height = height * scaleFactor;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(scaleFactor, scaleFactor);
```

2. **Disable Particle Interaction**:
```javascript
// Skip repulsion physics on mobile
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
if (!isMobile) {
    particles.forEach(p => p.update(input.x, input.y, input.isDown));
} else {
    particles.forEach(p => p.update(0, 0, false));
}
```

3. **Lower Audio Quality**:
```javascript
// Use shorter/simpler sounds on mobile
if (isMobile) {
    osc.stop(this.ctx.currentTime + 0.1); // Shorter
} else {
    osc.stop(this.ctx.currentTime + 0.2);
}
```

### Desktop Browsers

1. **Enable Hardware Acceleration**:
```css
canvas {
    transform: translateZ(0);
    will-change: transform;
}
```

2. **Use Larger Particle Count**:
```javascript
const count = Math.min((width * height) / 3000, 300);
```

3. **Higher Audio Fidelity**:
```javascript
// Use more complex filters/oscillators
const filter2 = this.ctx.createBiquadFilter();
filter2.type = 'highpass';
// ... chain multiple effects
```

## Performance Monitoring

### Add Detailed FPS Tracker

```javascript
const fpsHistory = [];
let minFPS = Infinity;
let maxFPS = 0;

function updateFPS(fps) {
    fpsHistory.push(fps);
    if (fpsHistory.length > 60) fpsHistory.shift();
    
    minFPS = Math.min(minFPS, fps);
    maxFPS = Math.max(maxFPS, fps);
    
    const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
    
    console.log(`FPS - Current: ${fps}, Avg: ${avgFPS.toFixed(1)}, Min: ${minFPS}, Max: ${maxFPS}`);
}
```

### Add Performance Metrics

```javascript
const perfStart = performance.now();

// ... game logic ...

const perfEnd = performance.now();
const frameTime = perfEnd - perfStart;

if (frameTime > 16.67) { // Slower than 60 FPS
    console.warn(`Slow frame: ${frameTime.toFixed(2)}ms`);
}
```

### Profile Individual Systems

```javascript
performance.mark('particles-start');
particles.forEach(p => p.update());
performance.mark('particles-end');
performance.measure('particles', 'particles-start', 'particles-end');

const measure = performance.getEntriesByName('particles')[0];
console.log(`Particles took: ${measure.duration.toFixed(2)}ms`);
```

## Browser-Specific Issues

### Safari/iOS
- **Issue**: Lower canvas performance
- **Fix**: Reduce canvas size, disable filters
- **Issue**: Audio latency
- **Fix**: Use shorter sound effects

### Firefox
- **Issue**: Shadow blur slower than Chrome
- **Fix**: Disable or reduce blur radius

### Edge
- **Issue**: Generally good performance
- **Optimization**: Can use more effects

## Recommended Settings by Device

### High-End Desktop (RTX 3060+, i7+)
- Particles: 300
- Shadow Blur: Enabled
- Filters: All enabled
- Scanlines: Full opacity
- Target FPS: 120 (if using high refresh monitor)

### Mid-Range Desktop/Laptop
- Particles: 200 (default)
- Shadow Blur: Enabled
- Filters: Enabled
- Scanlines: Enabled
- Target FPS: 60

### Low-End Desktop/Older Laptops
- Particles: 100
- Shadow Blur: Disabled
- Filters: Contrast only
- Scanlines: Reduced opacity or disabled
- Target FPS: 60

### High-End Mobile (iPhone 13+, Flagship Android)
- Particles: 100
- Shadow Blur: Enabled
- Filters: Enabled
- Scanlines: Enabled
- Target FPS: 60

### Mid-Range Mobile
- Particles: 50
- Shadow Blur: Disabled
- Filters: Contrast only
- Scanlines: Disabled
- Target FPS: 45-60

### Low-End Mobile
- Particles: 30
- Shadow Blur: Disabled
- Filters: Disabled
- Scanlines: Disabled
- Reduce canvas resolution by 0.75x
- Target FPS: 30

## Automatic Performance Scaling

### Adaptive Quality System

```javascript
let qualityLevel = 'high';
const fpsHistory = [];

function checkPerformance() {
    const avgFPS = fpsHistory.reduce((a,b) => a+b, 0) / fpsHistory.length;
    
    if (avgFPS < 30 && qualityLevel !== 'low') {
        qualityLevel = 'low';
        applyLowSettings();
    } else if (avgFPS > 55 && qualityLevel !== 'high') {
        qualityLevel = 'high';
        applyHighSettings();
    }
}

// Check every 5 seconds
setInterval(checkPerformance, 5000);
```

## Memory Optimization

### Prevent Memory Leaks

1. **Clean up event listeners**:
```javascript
window.removeEventListener('resize', resize);
```

2. **Clear unused arrays**:
```javascript
bullets.length = 0; // Fast clear
```

3. **Nullify references**:
```javascript
AudioEngine.ctx = null;
```

## Testing Performance

### How to Test

1. **Open DevTools** (F12)
2. **Go to Performance tab**
3. **Record** gameplay session (10-30 seconds)
4. **Stop recording**
5. **Analyze**:
   - Look for frame drops
   - Check main thread activity
   - Identify expensive functions

### Metrics to Watch

- **Frame Rate**: Should stay near 60 FPS
- **Frame Time**: Should be under 16.67ms
- **Scripting Time**: Should be under 5ms
- **Rendering Time**: Should be under 10ms
- **Memory**: Should stay relatively stable

---

[← Back to Code Architecture](Code-Architecture) | [Next: Adding Features →](Adding-Features)
