# Code Architecture

Understanding the structure and organization of the CRT Spaceship codebase.

## Architecture Overview

CRT Spaceship uses a **single-file architecture** - all HTML, CSS, and JavaScript are contained in `index.html`. This design choice provides:

- **Zero build process**: No compilation, bundling, or transpilation
- **Instant deployment**: Copy one file and you're done
- **Easy debugging**: All code in one place
- **No dependencies**: Pure vanilla JavaScript

## File Structure

```
index.html
├── HTML Structure
│   ├── Meta tags (viewport, charset)
│   ├── CRT Container
│   ├── Visual overlays (scanlines, vignette, flicker)
│   ├── UI elements (FPS, score, wave)
│   ├── Canvas element
│   └── Start overlay
├── CSS Styles
│   ├── CSS Variables (color scheme)
│   ├── CRT effects (scanlines, vignette, flicker)
│   ├── UI positioning
│   └── Animations
└── JavaScript
    ├── Core Systems
    ├── Game Entities
    ├── Input Handling
    └── Game Loop
```

## Core Systems

### 1. AudioEngine

**Purpose**: Generate procedural sound effects without external audio files.

**Key Methods**:
```javascript
AudioEngine.init()         // Initialize Web Audio API context
AudioEngine.playShoot()    // Generate shooting sound
AudioEngine.playExplosion() // Generate explosion sound
AudioEngine.playAmbience() // Background 60Hz hum
```

**Implementation Details**:
- Uses Web Audio API (`AudioContext`)
- **Shoot Sound**: Square wave oscillator with frequency sweep (800Hz → 100Hz)
- **Explosion**: White noise filtered through lowpass filter
- **Ambience**: Continuous 60Hz sine wave at low volume

**Why Procedural Audio?**
- No file loading delays
- Zero network requests
- Smaller file size
- Retro/arcade feel

### 2. Particle System

**Purpose**: Create ambient dust particles that react to user input.

**Class Structure**:
```javascript
class Particle {
    reset()    // Randomize position and velocity
    update()   // Physics simulation
    draw()     // Render to canvas
}
```

**Physics Simulation**:
1. **Ambient Drift**: Small random velocities
2. **Screen Wrapping**: Particles wrap around edges
3. **Interaction Physics**: 
   - Calculate distance from cursor/touch
   - Apply repulsion force (inverse square-like)
   - Gradually return to normal speed via friction

**Performance**:
- Dynamic particle count based on screen size
- Maximum 200 particles to prevent slowdown
- Object pooling (particles are reused, not destroyed)

### 3. Game Loop

**Purpose**: Central game logic and rendering coordinator.

**Structure**:
```javascript
function loop(timestamp) {
    // 1. Calculate delta time
    // 2. Update FPS display
    // 3. Clear canvas
    // 4. Update player position
    // 5. Spawn enemies
    // 6. Handle shooting
    // 7. Update all entities
    // 8. Collision detection
    // 9. Cleanup inactive entities
    // 10. Render everything
    // 11. Request next frame
}
```

**Timing**:
- Uses `requestAnimationFrame()` for smooth 60 FPS
- Delta time calculated but not used (fixed timestep)
- FPS counter updated periodically

## Game Entities

### Player

**Data Structure**:
```javascript
const player = {
    x: 0,           // Current X position
    y: 0,           // Current Y position (fixed)
    width: 40,      // Collision width
    height: 20,     // Collision height
    color: '#39ff14', // Phosphor green
    targetX: 0      // Where player is moving to
}
```

**Rendering**:
- Triangle shape using Canvas path
- Three vertices forming upward-pointing triangle
- No rotation (always faces up)

### Bullet

**Class**:
```javascript
class Bullet {
    constructor(x, y)
    update()  // Move upward
    draw()    // Render with glow
}
```

**Lifecycle**:
1. Created at player position on tap/click
2. Moves upward at constant speed
3. Marked inactive if goes off-screen
4. Removed from array when inactive

### Enemy

**Class**:
```javascript
class Enemy {
    constructor()
    update()  // Move downward
    draw()    // Render pixel sprite
}
```

**Sprite System**:
- Uses 2D array to define sprite shape
- Each cell is a pixel (1 = draw, 0 = skip)
- Pixel size calculated from enemy width
- All enemies use same sprite pattern

### Explosion

**Class**:
```javascript
class Explosion {
    constructor(x, y)
    update()  // Update all particles
    draw()    // Render with alpha fade
}
```

**Effect**:
- Creates 8 particles radiating outward
- Each particle has random velocity
- Alpha decreases over time
- Removed when all particles expire

## Input Handling

### Unified Input System

**Supports**:
- Mouse (desktop)
- Touch (mobile)

**State Object**:
```javascript
const input = {
    x: 0,          // Current X coordinate
    y: 0,          // Current Y coordinate
    isDown: false, // Is button/finger down?
    tapped: false  // Was there a tap/click?
}
```

**Event Handlers**:
- `handleInputStart()`: Mouse down / touch start
- `handleInputMove()`: Mouse move / touch move
- `handleInputEnd()`: Mouse up / touch end
- `updateInputCoords()`: Normalize coordinates

**Mobile Optimizations**:
- `touch-action: none` prevents zoom/scroll
- `passive: false` allows preventDefault
- Prevents default touch behaviors

## Rendering Pipeline

### Draw Order (Back to Front)

1. **Clear Canvas**: Full clear each frame
2. **Background Particles**: Ambient dust
3. **Player**: Triangle spaceship
4. **Bullets**: With glow effect
5. **Enemies**: Pixel sprites
6. **Explosions**: Alpha-blended particles
7. **Floor Line**: Bottom boundary

### Canvas Optimizations

**Techniques Used**:
- Batch same-color draws
- Minimize state changes
- Use `fillRect()` for pixels (faster than paths)
- Shadow blur only where needed
- Single canvas (no layering)

**Not Used** (but could improve performance):
- OffscreenCanvas for sprites
- WebGL rendering
- Dirty rectangle tracking
- Sprite atlasing

## CSS Effects Layer

### Overlay Stack (Z-Index)

```
├── Z-9:  Flicker overlay
├── Z-10: Scanlines
├── Z-11: Vignette
└── Z-12: UI elements (score, FPS)
```

### Filter Chain on Canvas

```css
filter: blur(0.5px) contrast(1.2) brightness(1.1);
```

**Effect**:
- Slight blur mimics phosphor bloom
- Increased contrast makes colors pop
- Brightness boost for visibility

## Initialization Sequence

1. **Page Load**:
   ```javascript
   resize()         // Set canvas size
   initParticles()  // Create particle pool
   // Game loop NOT started yet
   ```

2. **User Clicks Start**:
   ```javascript
   AudioEngine.init()      // Initialize audio (requires user gesture)
   startOverlay.hide()     // Hide start screen
   gameActive = true       // Enable game logic
   loop(timestamp)         // Start game loop
   ```

3. **Game Running**:
   - Loop runs continuously via `requestAnimationFrame()`
   - All systems active
   - Player can interact

## Memory Management

### Object Pooling
- **Particles**: Created once, reused forever
- **Bullets**: Created and destroyed dynamically
- **Enemies**: Created and destroyed dynamically
- **Explosions**: Created and destroyed dynamically

### Garbage Collection
- Inactive bullets removed from array
- Inactive enemies removed from array
- Expired explosions removed from array
- No circular references
- No event listener leaks

### Performance Monitoring

Built-in FPS counter:
```javascript
if (timestamp % 10 === 0) {
    fpsDisplay.innerText = Math.round(1000/dt);
}
```

## Extensibility Points

### Easy to Modify

1. **Colors**: Change CSS variables
2. **Sounds**: Edit AudioEngine methods
3. **Sprites**: Modify enemy shape array
4. **Physics**: Adjust speed/spawn constants
5. **Visual Effects**: Edit CSS overlays

### Medium Difficulty

1. **New Entity Types**: Create new classes
2. **Power-ups**: Add pickup system
3. **Multiple Levels**: Add state machine
4. **Save System**: Use localStorage

### Requires Refactoring

1. **Multiplayer**: Need network layer
2. **Different Game Modes**: Need scene manager
3. **Asset Loading**: Need resource manager
4. **Mobile App**: Need Cordova/Capacitor wrapper

## Design Patterns Used

1. **Singleton**: AudioEngine (one instance)
2. **Object Pooling**: Particle system
3. **Entity-Component**: Game entities with update/draw
4. **Game Loop**: Central update/render cycle
5. **Module Pattern**: Encapsulated systems

## Code Quality

### Pros
- Clear naming conventions
- Logical organization
- Inline documentation
- No magic numbers (mostly)
- Consistent style

### Could Improve
- Add TypeScript for type safety
- Extract constants to config object
- Separate concerns (split file)
- Add unit tests
- Use more ES6+ features

---

[← Back to Game Mechanics](Game-Mechanics) | [Next: Performance Tuning →](Performance-Tuning)
