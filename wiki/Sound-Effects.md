# Sound Effects Documentation

Deep dive into the procedural audio system of CRT Spaceship.

## Overview

CRT Spaceship uses the **Web Audio API** to generate all sound effects procedurally in real-time. This means:
- ✅ No audio files to load
- ✅ Zero network requests for audio
- ✅ Smaller total file size
- ✅ Authentic retro/arcade sound
- ✅ Infinite variation potential

## Web Audio API Basics

### AudioContext

The core of the audio system:
```javascript
window.AudioContext = window.AudioContext || window.webkitAudioContext;
this.ctx = new AudioContext();
```

**Important**: Must be initialized on user interaction (browser security policy).

### Audio Nodes

Web Audio uses a node-based graph system:
```
[Source Node] → [Effect Node] → [Gain Node] → [Destination]
```

## Implemented Sound Effects

### 1. Shoot Sound

**Type**: Frequency Sweep (Descending)

**Code**:
```javascript
playShoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
}
```

**Parameters**:
- **Waveform**: Square (8-bit/retro sound)
- **Start Frequency**: 800 Hz
- **End Frequency**: 100 Hz
- **Duration**: 0.15 seconds
- **Volume**: 0.1 → 0.01 (fade out)

**Audio Graph**:
```
Oscillator (Square, 800→100Hz) → Gain (0.1→0.01) → Output
```

**Why It Works**:
- Descending pitch mimics classic laser/shoot sounds
- Square wave gives it that retro game feel
- Quick fade prevents clicking artifacts

### 2. Explosion Sound

**Type**: Filtered Noise

**Code**:
```javascript
playExplosion() {
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate White Noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
}
```

**Parameters**:
- **Noise Type**: White noise (all frequencies)
- **Filter**: Lowpass (1000Hz → 100Hz)
- **Duration**: 0.4 seconds
- **Volume**: 0.2 → 0.001 (exponential fade)

**Audio Graph**:
```
Buffer (White Noise) → Lowpass Filter (1000→100Hz) → Gain (0.2→0.001) → Output
```

**Why It Works**:
- White noise provides the "crunch"
- Lowpass filter creates deep boom effect
- Descending filter frequency mimics explosion decay
- Longer duration than shoot (more impact)

### 3. Background Ambience

**Type**: Continuous Sine Wave (Mains Hum)

**Code**:
```javascript
playAmbience() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 60; // 60Hz mains hum
    gain.gain.value = 0.02;   // Very quiet

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
}
```

**Parameters**:
- **Waveform**: Sine (pure tone)
- **Frequency**: 60 Hz (US power line frequency)
- **Volume**: 0.02 (barely audible)
- **Duration**: Infinite (never stops)

**Why It Works**:
- Mimics the hum of old CRT monitors
- Adds to retro atmosphere
- 60Hz is below normal hearing range but felt as vibration
- Very low volume prevents annoyance

## Waveform Types

### Available Waveforms

1. **Sine**: Smooth, pure tone
   - Use: Background hums, musical tones
   
2. **Square**: Sharp, digital sound
   - Use: Retro game effects, lasers
   
3. **Sawtooth**: Buzzy, bright
   - Use: Sci-fi sounds, alarms
   
4. **Triangle**: Softer than square
   - Use: Mellower retro sounds

### Waveform Comparison

```javascript
osc.type = 'sine';     // Smooth:    ~~~~
osc.type = 'square';   // Digital:   ▄▀▄▀
osc.type = 'sawtooth'; // Bright:    /|/|
osc.type = 'triangle'; // Mellow:    /\/\
```

## Parameter Ramping

### Why Ramp Parameters?

Static sounds are boring. Ramping creates dynamic, interesting effects.

### Types of Ramping

1. **Linear Ramp**: Constant rate of change
```javascript
param.linearRampToValueAtTime(target, time);
```

2. **Exponential Ramp**: Accelerating change (more natural)
```javascript
param.exponentialRampToValueAtTime(target, time);
```

### Common Patterns

**Frequency Sweep** (Lasers, Zaps):
```javascript
osc.frequency.setValueAtTime(1000, now);
osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
```

**Fade Out** (Natural decay):
```javascript
gain.gain.setValueAtTime(1.0, now);
gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
```

**Tremolo** (Vibrato):
```javascript
gain.gain.setValueAtTime(0.5, now);
for (let i = 0; i < 10; i++) {
    gain.gain.linearRampToValueAtTime(0.3, now + i*0.1);
    gain.gain.linearRampToValueAtTime(0.7, now + i*0.1 + 0.05);
}
```

## Custom Sound Effects

### Power-Up Sound

```javascript
playPowerUp() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    
    // Ascending arpeggio
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(300, now + 0.1);
    osc.frequency.setValueAtTime(400, now + 0.2);
    osc.frequency.setValueAtTime(600, now + 0.3);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.5);
}
```

### Hit/Damage Sound

```javascript
playHit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    
    // Quick low frequency pulse
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(50, now);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.1);
}
```

### Menu Blip

```javascript
playBlip() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 440; // A4 note
    
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.06);
}
```

## Advanced Techniques

### Using Filters for Variety

**Bandpass** (Telephone effect):
```javascript
const filter = this.ctx.createBiquadFilter();
filter.type = 'bandpass';
filter.frequency.value = 1000;
filter.Q.value = 10; // Narrow band
```

**Highpass** (Tinny sound):
```javascript
const filter = this.ctx.createBiquadFilter();
filter.type = 'highpass';
filter.frequency.value = 2000;
```

**Peaking** (Resonance):
```javascript
const filter = this.ctx.createBiquadFilter();
filter.type = 'peaking';
filter.frequency.value = 800;
filter.Q.value = 5;
filter.gain.value = 10; // dB boost
```

### Layering Sounds

Combine multiple oscillators for richer sounds:
```javascript
playRichExplosion() {
    // Low boom
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 40;
    
    // Mid crunch
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 200;
    
    // High sizzle (noise would be even better)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.value = 3000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start();
    osc2.start();
    osc3.start();
    osc1.stop(this.ctx.currentTime + 0.6);
    osc2.stop(this.ctx.currentTime + 0.6);
    osc3.stop(this.ctx.currentTime + 0.6);
}
```

### Randomization for Variety

Add slight random variations:
```javascript
playRandomShoot() {
    const baseFreq = 800;
    const variation = (Math.random() - 0.5) * 100; // ±50Hz
    
    osc.frequency.setValueAtTime(baseFreq + variation, this.ctx.currentTime);
    // ... rest of implementation
}
```

## Browser Compatibility

### Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS requires user interaction)
- ✅ Opera: Full support

### iOS Specific Issues

**Problem**: Audio context suspended until user interaction

**Solution**: Initialize on button click
```javascript
startBtn.addEventListener('click', () => {
    AudioEngine.init(); // Only initialize here
});
```

## Performance Considerations

### CPU Usage
- Oscillators: Very light (~0.5% CPU)
- Filters: Light (~1% CPU)
- Noise generation: Moderate (~2-5% CPU)

### Best Practices
1. Reuse AudioContext (don't create multiple)
2. Stop oscillators when done (prevents memory leak)
3. Limit simultaneous sounds (max 10-20)
4. Use exponentialRamp instead of linearRamp when possible

### Memory Management

```javascript
// Good: Stop and disconnect
osc.stop(time);
osc.disconnect();

// Bad: Memory leak
osc.start();
// Never stopped or disconnected
```

## Testing Audio

### Verify Audio Working

```javascript
// Test in console
AudioEngine.init();
AudioEngine.playShoot();
AudioEngine.playExplosion();
```

### Debugging

```javascript
// Check if context is running
console.log(AudioEngine.ctx.state); // Should be "running"

// Resume if suspended
if (AudioEngine.ctx.state === 'suspended') {
    AudioEngine.ctx.resume();
}
```

## Further Resources

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Spec](https://www.w3.org/TR/webaudio/)
- [Sound generation tutorial](https://marcgg.com/blog/2016/11/01/javascript-audio/)

---

[← Back to Performance Tuning](Performance-Tuning) | [Next: Visual Effects →](Visual-Effects)
