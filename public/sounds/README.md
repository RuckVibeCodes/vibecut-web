# VibeCut Sound Effects

This directory contains sound effects for video transitions, impacts, and UI feedback.

## Directory Structure

```
sounds/
├── transitions/     # Swoosh, whoosh, tape effects
│   ├── whoosh.mp3
│   ├── swoosh.mp3
│   ├── tape-stop.mp3
│   └── reverse.mp3
├── impacts/         # Punchy sounds for emphasis
│   ├── pop.mp3
│   ├── bass-drop.mp3
│   ├── slam.mp3
│   └── thud.mp3
├── ambient/         # Background/texture sounds
│   ├── glitch.mp3
│   ├── static.mp3
│   ├── hum.mp3
│   └── drone.mp3
└── ui/              # Interface feedback sounds
    ├── ding.mp3
    ├── click.mp3
    ├── beep.mp3
    └── notification.mp3
```

## Adding Sound Files

### Requirements
- **Format:** MP3 (recommended) or WAV
- **Sample Rate:** 44.1kHz or 48kHz
- **Bit Depth:** 16-bit or 24-bit
- **Channels:** Mono or Stereo
- **Duration:** Keep short (0.1s - 5s max for most effects)

### Recommended Sources (Royalty-Free)

1. **Freesound.org** (CC0 licensed)
   - Search for effects, filter by CC0 license
   - Free, attribution not required for CC0

2. **Pixabay Sound Effects** (Pixabay License)
   - https://pixabay.com/sound-effects/
   - Free for commercial use

3. **Mixkit** (Mixkit License)
   - https://mixkit.co/free-sound-effects/
   - Free for commercial use

4. **Zapsplat** (Requires attribution or paid)
   - https://www.zapsplat.com/
   - Large library, some free

### Naming Convention

Use lowercase, hyphenated names:
- ✅ `bass-drop.mp3`
- ✅ `tape-stop.mp3`
- ❌ `Bass Drop.mp3`
- ❌ `bassDropEffect.mp3`

### Adding to the Library

1. Place sound file in appropriate category folder
2. Update `/src/lib/sounds.ts` with the new sound:
   ```typescript
   'new-sound': {
     url: '/sounds/category/new-sound.mp3',
     duration: 0.5,
     description: 'Description of the sound effect'
   }
   ```
3. Add the type to the appropriate sound type union

## Usage in Code

```typescript
import { getSoundUrl, playSound } from '@/lib/sounds';

// Get URL for Remotion Audio component
const whooshUrl = getSoundUrl('transitions', 'whoosh');

// Preview sound in editor
playSound('impacts', 'pop', 0.8); // 80% volume
```

## Tips

- **Normalize audio** to consistent levels (-3dB to -6dB peak)
- **Trim silence** from start and end
- **Use short sounds** for snappy transitions (0.2s - 0.5s)
- **Layer sounds** for more complex effects
- **Test in context** - sounds feel different in a video vs isolated
