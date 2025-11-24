# Game Mechanics

This page details the core gameplay mechanics of CRT Spaceship.

## Core Gameplay Loop

### Game States

1. **Boot State** (Initial)
   - Start overlay is displayed
   - Game waits for user interaction
   - Audio system is not initialized yet

2. **Active State** (Playing)
   - Player can move and shoot
   - Enemies spawn and descend
   - Score and wave counters update
   - Game loop runs at 60 FPS

### Player Mechanics

#### Movement
- **Input Method**: Mouse position or touch coordinates
- **Movement Type**: Smooth interpolation (lerp)
- **Formula**: `player.x += (targetX - player.x) * 0.15`
- **Boundaries**: Clamped to 20px from screen edges
- **Speed**: Responsive but smooth (15% interpolation per frame)

#### Shooting
- **Trigger**: Click or tap anywhere on screen
- **Rate of Fire**: One bullet per tap/click
- **Bullet Speed**: 10 pixels per frame
- **Bullet Properties**:
  - Width: 4px
  - Height: 10px
  - Color: Phosphor green (#39ff14)
  - Glow effect: 10px shadow blur

### Enemy System

#### Spawning
- **Spawn Rate**: `Math.random() < 0.015 * wave`
- **Wave Scaling**: Spawn probability increases with wave number
- **Position**: Random X coordinate, starts at Y = -50
- **Properties**:
  - Width: 30px
  - Height: 30px
  - Pixel-art sprite (6x4 grid)

#### Movement
- **Speed Formula**: `Math.random() * 2 + 1 + (wave * 0.2)`
- **Base Speed**: 1-3 pixels per frame
- **Wave Bonus**: +0.2 pixels per wave
- **Direction**: Straight down

#### Behavior
- Enemies are removed when they go off-screen (bottom)
- No horizontal movement
- No shooting back (planned for future update)

### Collision Detection

#### Bullet-Enemy Collision
```javascript
if (bullet.x > enemy.x && 
    bullet.x < enemy.x + enemy.width &&
    bullet.y > enemy.y && 
    bullet.y < enemy.y + enemy.height) {
    // Collision!
}
```

**On Collision**:
1. Enemy is marked inactive
2. Bullet is marked inactive
3. Score increases by 100 points
4. Explosion effect spawned
5. Explosion sound plays

### Scoring System

#### Points
- **Enemy Destroyed**: 100 points
- **Display**: Padded to 4 digits (e.g., "0000", "0100")
- **No Penalties**: Missing enemies doesn't reduce score

#### Wave Progression
- **Trigger**: Score exceeds `wave * 1000`
- **Effect**: Wave counter increases
- **Difficulty Increase**: 
  - Enemies spawn more frequently
  - Enemies move faster
- **Display**: Padded to 2 digits (e.g., "01", "02")

### Particle System

#### Background Particles
- **Count**: Dynamic based on screen size
- **Formula**: `Math.min((width * height) / 4000, 200)`
- **Behavior**:
  - Ambient drift (slow random movement)
  - Screen wrapping (particles wrap around edges)
  - Touch repulsion (push away from cursor/finger)

#### Repulsion Physics
- **Radius**: 200 pixels
- **Force Calculation**: `(maxDist - dist) / maxDist`
- **Push Strength**: `15 * force * 0.1`
- **Friction**: 0.98 (particles slow down gradually)

#### Explosion Particles
- **Count**: 8 particles per explosion
- **Lifespan**: 1.0 to 0.0 (decreases by 0.05 per frame)
- **Velocity**: Random in all directions (-4 to +4 pixels/frame)
- **Color**: White with alpha based on life

### Performance Features

#### Frame Rate
- **Target**: 60 FPS
- **Implementation**: `requestAnimationFrame()`
- **Delta Time**: Calculated but not currently used for time-independent movement

#### Object Cleanup
- **Bullets**: Removed when `y < 0`
- **Enemies**: Removed when `y > height` or inactive
- **Explosions**: Removed when all particles have expired
- **Particles**: Never removed, they wrap around instead

## Game Balance

### Difficulty Curve

| Wave | Enemy Speed | Spawn Rate | Approx. Time |
|------|-------------|------------|--------------|
| 1    | 1-3 px/f    | 1.5%       | 0:00         |
| 2    | 1.2-3.2     | 3.0%       | ~1:00        |
| 5    | 2-4         | 7.5%       | ~3:00        |
| 10   | 3-5         | 15%        | ~6:00        |

### Strategy Tips

1. **Stay Mobile**: Keep moving to avoid enemy clusters
2. **Shoot Often**: There's no cooldown, spam those bullets!
3. **Lead Your Targets**: Click ahead of fast-moving enemies
4. **Watch the Edges**: Enemies can spawn anywhere across the screen
5. **Mind the Bottom**: Missing enemies isn't penalized, but don't get overwhelmed

## Future Enhancements

Potential mechanics to add:
- Power-ups (rapid fire, shield, slow-mo)
- Different enemy types
- Boss battles every 5 waves
- Player health system
- Enemy shooting mechanics
- Combo multipliers
- Achievements system

---

[← Back to Home](Home) | [Next: Code Architecture →](Code-Architecture)
