# Visual Effects Guide

Understanding the CRT aesthetic and visual effects in the game.

## CRT Aesthetic Overview

The game recreates the look of a vintage **CRT (Cathode Ray Tube)** terminal display with phosphor green monochrome graphics.

## Visual Effect Layers

### Layer Stack (Front to Back)

```
┌─────────────────────────────────┐
│ Vignette (Z-11)                 │ ← Darkens edges
├─────────────────────────────────┤
│ Scanlines (Z-10)                │ ← Horizontal lines
├─────────────────────────────────┤
│ Flicker (Z-9)                   │ ← Subtle animation
├─────────────────────────────────┤
│ Canvas (Z-0)                    │ ← Game rendering
│   - Particles                   │
│   - Player                      │
│   - Bullets                     │
│   - Enemies                     │
│   - Explosions                  │
└─────────────────────────────────┘
```

## Individual Effects

### 1. Scanlines

**Purpose**: Mimic horizontal scan lines of CRT displays

**Implementation**:
```css
.scanlines {
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0) 50%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.2)
    );
    background-size: 100% 4px;
}
```

**How It Works**:
- Creates repeating gradient every 4 pixels
- Top half: Transparent
- Bottom half: 20% black
- Result: Thin dark lines across screen

**Customization**:
```css
/* Thicker scanlines (8px) */
background-size: 100% 8px;

/* More visible */
rgba(0, 0, 0, 0.4) /* instead of 0.2 */

/* Different pattern (dotted) */
background: radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px);
background-size: 4px 4px;
```

### 2. Vignette

**Purpose**: Darkens edges to simulate CRT screen curvature and light falloff

**Implementation**:
```css
.vignette {
    background: radial-gradient(
        circle,
        rgba(0, 0, 0, 0) 60%,
        rgba(0, 0, 0, 0.6) 90%,
        rgba(0, 0, 0, 1) 100%
    );
    box-shadow: inset 0 0 5rem rgba(0,0,0,0.7);
}
```

**How It Works**:
- Radial gradient from center (clear) to edges (black)
- Inner box-shadow adds depth
- Creates "rounded screen" illusion

**Customization**:
```css
/* Stronger vignette */
rgba(0, 0, 0, 0) 50%,
rgba(0, 0, 0, 0.8) 85%,

/* Color tint (green) */
rgba(0, 50, 0, 0.5) 90%,

/* No vignette */
background: none;
box-shadow: none;
```

### 3. Screen Flicker

**Purpose**: Subtle animation mimicking power fluctuation

**Implementation**:
```css
.flicker {
    background: rgba(57, 255, 20, 0.02);
    animation: flickerAnim 0.15s infinite;
}

@keyframes flickerAnim {
    0% { opacity: 0.01; }
    50% { opacity: 0.05; }
    100% { opacity: 0.01; }
}
```

**How It Works**:
- Very subtle green tint
- Opacity oscillates rapidly
- Creates "alive" feeling

**Customization**:
```css
/* Slower flicker */
animation: flickerAnim 0.5s infinite;

/* Random flicker */
@keyframes randomFlicker {
    0%, 100% { opacity: 0.01; }
    10% { opacity: 0.08; }
    20% { opacity: 0.02; }
    30% { opacity: 0.06; }
    /* etc... */
}

/* No flicker */
animation: none;
```

### 4. Canvas Filter

**Purpose**: Adds blur, contrast, and brightness to simulate phosphor bloom

**Implementation**:
```css
canvas {
    filter: blur(0.5px) contrast(1.2) brightness(1.1);
}
```

**Effects**:
- **Blur**: Simulates phosphor glow/bloom
- **Contrast**: Makes pixels pop against black
- **Brightness**: Enhances visibility

**Customization**:
```css
/* Sharper (less CRT-like) */
filter: contrast(1.3) brightness(1.1);

/* More bloom */
filter: blur(1px) contrast(1.3) brightness(1.2);

/* No filter (best performance) */
filter: none;
```

### 5. Phosphor Glow

**Purpose**: Create glowing effect around bright elements

**Implementation** (in JavaScript):
```javascript
ctx.shadowBlur = 10;
ctx.shadowColor = '#39ff14';
ctx.fillRect(x, y, width, height);
ctx.shadowBlur = 0;
```

**How It Works**:
- Sets shadow blur before drawing
- Shadow color matches element color
- Creates soft glow around pixels

**Performance Impact**: Moderate (5-10% slower)

**Alternatives**:
```javascript
// Multiple passes for stronger glow
ctx.shadowBlur = 5;
ctx.fillRect(x, y, w, h);
ctx.shadowBlur = 15;
ctx.fillRect(x, y, w, h);
ctx.shadowBlur = 0;

// Color variation
ctx.shadowColor = 'white'; // Brighter core
```

## Color Scheme

### Primary Color: Phosphor Green

**Hex**: `#39ff14`
**RGB**: `rgb(57, 255, 20)`
**HSL**: `hsl(108, 100%, 54%)`

**Why This Color?**
- Classic monochrome terminal color
- High visibility against black
- Nostalgic/retro feel
- Good for eyes (green is easier on eyes than white)

### Variations

**Dim Green** (for less important elements):
```css
--phosphor-dim: #1b8a0a;
```

**White** (for explosions):
```css
color: #ffffff;
/* Creates flash effect */
```

### Alternative Color Schemes

**Amber Terminal**:
```css
--phosphor-main: #ffb000;
--phosphor-dim: #aa7700;
--bg-color: #1a0f00;
```

**Blue Terminal**:
```css
--phosphor-main: #00ffff;
--phosphor-dim: #0088aa;
--bg-color: #000a0f;
```

**Classic White**:
```css
--phosphor-main: #ffffff;
--phosphor-dim: #888888;
--bg-color: #000000;
```

## Particle Effects

### Background Dust

**Rendering**:
```javascript
ctx.fillStyle = `rgba(57, 255, 20, ${this.alpha})`;
ctx.fillRect(this.x, this.y, this.size, this.size);
```

**Properties**:
- Variable size (0.5-2.5 pixels)
- Variable alpha (0.1-0.6)
- Drift movement
- Interactive physics

**Visual Effect**: Creates depth and atmosphere

### Explosion Particles

**Rendering**:
```javascript
ctx.globalAlpha = particle.life;
ctx.fillStyle = '#fff';
ctx.fillRect(x, y, 4, 4);
ctx.globalAlpha = 1;
```

**Properties**:
- White color (contrast against green)
- Fading alpha (based on life remaining)
- Radiating outward
- Square pixels (4x4)

**Visual Effect**: Satisfying destruction feedback

## Sprite Rendering

### Enemy Sprites

**Pixel Grid**:
```javascript
const shape = [
    [1,0,1,1,0,1],
    [0,1,1,1,1,0],
    [1,1,0,0,1,1],
    [1,0,1,1,0,1]
];
```

**Rendering**:
```javascript
for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
        if (shape[r][c]) {
            ctx.fillRect(
                x + c * pixelSize,
                y + r * pixelSize,
                pixelSize,
                pixelSize
            );
        }
    }
}
```

**Effect**: Retro pixel-art aesthetic

**Custom Sprites**:
```javascript
// Invader style
const invader = [
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1],
    [0,0,0,1,1,0,1,1,0,0,0]
];

// Ship with detail
const ship = [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1]
];
```

## Screen Curve Simulation

### CSS Transform (Not Currently Used)

Could add for more authenticity:
```css
#crt-container {
    transform: perspective(1000px) rotateX(2deg);
    border-radius: 20px;
    overflow: hidden;
}

canvas {
    transform: scaleY(0.98); /* Slight vertical compression */
}
```

**Effect**: Simulates curved CRT glass

## Animation Techniques

### Text Blinking

**Implementation**:
```css
.blink {
    animation: blinker 1s linear infinite;
}

@keyframes blinker {
    50% { opacity: 0; }
}
```

**Used For**: "PRESS START TO INITIALIZE" text

### Glow Pulse

**Not currently used, but could add**:
```css
@keyframes glowPulse {
    0%, 100% { 
        text-shadow: 0 0 10px #39ff14;
    }
    50% { 
        text-shadow: 0 0 20px #39ff14, 0 0 30px #39ff14;
    }
}

h1 {
    animation: glowPulse 2s infinite;
}
```

## Performance vs. Quality

### High Quality (Default)
- All effects enabled
- Canvas filters
- Shadow blur
- Full particle count

### Medium Quality
- Scanlines and vignette only
- No canvas filter
- No shadow blur
- Reduced particles

### Low Quality
- No overlays
- No filters
- No glow effects
- Minimal particles
- Best performance

### Toggle Quality

```javascript
function setQuality(level) {
    const scanlines = document.querySelector('.scanlines');
    const vignette = document.querySelector('.vignette');
    const flicker = document.querySelector('.flicker');
    const canvas = document.querySelector('canvas');
    
    if (level === 'low') {
        scanlines.style.display = 'none';
        vignette.style.display = 'none';
        flicker.style.display = 'none';
        canvas.style.filter = 'none';
    } else if (level === 'medium') {
        scanlines.style.display = 'block';
        vignette.style.display = 'block';
        flicker.style.display = 'none';
        canvas.style.filter = 'contrast(1.2)';
    } else {
        scanlines.style.display = 'block';
        vignette.style.display = 'block';
        flicker.style.display = 'block';
        canvas.style.filter = 'blur(0.5px) contrast(1.2) brightness(1.1)';
    }
}
```

## Advanced Effects

### Chromatic Aberration

```css
canvas {
    filter: 
        drop-shadow(2px 0 0 red)
        drop-shadow(-2px 0 0 cyan);
}
```

### Screen Distortion

```javascript
// In rendering loop
const distortion = Math.sin(Date.now() * 0.001) * 2;
ctx.setTransform(1, distortion * 0.001, 0, 1, 0, 0);
// ... render
ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
```

### Burn-In Effect

```javascript
// Add ghost image that fades slowly
const burnInCanvas = document.createElement('canvas');
// Copy previous frame at low opacity
// Overlay with current frame
```

---

[← Back to Sound Effects](Sound-Effects) | [Next: Deployment Guide →](Deployment-Guide)
