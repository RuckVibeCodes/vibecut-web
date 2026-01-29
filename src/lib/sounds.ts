/**
 * Sound Effect Library for VibeCut
 * Royalty-free sound effects organized by category
 */

export type SoundCategory = 'transitions' | 'impacts' | 'ambient' | 'ui';

export type TransitionSound = 'whoosh' | 'swoosh' | 'tape-stop' | 'reverse';
export type ImpactSound = 'pop' | 'bass-drop' | 'slam' | 'thud';
export type AmbientSound = 'glitch' | 'static' | 'hum' | 'drone';
export type UISound = 'ding' | 'click' | 'beep' | 'notification';

export type SoundName = TransitionSound | ImpactSound | AmbientSound | UISound;

interface SoundEntry {
  url: string;
  duration: number; // in seconds
  description: string;
}

interface SoundLibrary {
  transitions: Record<TransitionSound, SoundEntry>;
  impacts: Record<ImpactSound, SoundEntry>;
  ambient: Record<AmbientSound, SoundEntry>;
  ui: Record<UISound, SoundEntry>;
}

/**
 * Sound library with URLs to royalty-free sounds
 * Note: Replace these with actual CDN URLs or local files in production
 * 
 * Recommended sources:
 * - freesound.org (CC0 licensed)
 * - pixabay.com/sound-effects (Pixabay License)
 * - mixkit.co/free-sound-effects (Mixkit License)
 */
export const soundLibrary: SoundLibrary = {
  transitions: {
    'whoosh': {
      url: '/sounds/transitions/whoosh.mp3',
      duration: 0.5,
      description: 'Quick air whoosh for fast transitions'
    },
    'swoosh': {
      url: '/sounds/transitions/swoosh.mp3',
      duration: 0.4,
      description: 'Smooth swoosh for slide transitions'
    },
    'tape-stop': {
      url: '/sounds/transitions/tape-stop.mp3',
      duration: 0.8,
      description: 'VHS tape stop effect for retro vibes'
    },
    'reverse': {
      url: '/sounds/transitions/reverse.mp3',
      duration: 0.6,
      description: 'Reverse/rewind sound effect'
    }
  },
  impacts: {
    'pop': {
      url: '/sounds/impacts/pop.mp3',
      duration: 0.2,
      description: 'Quick pop for text/element appearance'
    },
    'bass-drop': {
      url: '/sounds/impacts/bass-drop.mp3',
      duration: 1.2,
      description: 'Deep bass drop for dramatic moments'
    },
    'slam': {
      url: '/sounds/impacts/slam.mp3',
      duration: 0.4,
      description: 'Hard slam for impactful text'
    },
    'thud': {
      url: '/sounds/impacts/thud.mp3',
      duration: 0.3,
      description: 'Heavy thud for weight/emphasis'
    }
  },
  ambient: {
    'glitch': {
      url: '/sounds/ambient/glitch.mp3',
      duration: 0.3,
      description: 'Digital glitch effect'
    },
    'static': {
      url: '/sounds/ambient/static.mp3',
      duration: 2.0,
      description: 'TV static noise (loopable)'
    },
    'hum': {
      url: '/sounds/ambient/hum.mp3',
      duration: 3.0,
      description: 'Electronic hum (loopable)'
    },
    'drone': {
      url: '/sounds/ambient/drone.mp3',
      duration: 5.0,
      description: 'Atmospheric drone (loopable)'
    }
  },
  ui: {
    'ding': {
      url: '/sounds/ui/ding.mp3',
      duration: 0.3,
      description: 'Notification ding'
    },
    'click': {
      url: '/sounds/ui/click.mp3',
      duration: 0.1,
      description: 'Button click'
    },
    'beep': {
      url: '/sounds/ui/beep.mp3',
      duration: 0.2,
      description: 'System beep'
    },
    'notification': {
      url: '/sounds/ui/notification.mp3',
      duration: 0.5,
      description: 'Notification alert'
    }
  }
};

/**
 * Get the URL for a specific sound
 */
export function getSoundUrl(category: SoundCategory, name: SoundName): string {
  const categoryData = soundLibrary[category];
  if (!categoryData) {
    console.warn(`Sound category "${category}" not found`);
    return '';
  }
  
  const sound = categoryData[name as keyof typeof categoryData] as SoundEntry | undefined;
  if (!sound) {
    console.warn(`Sound "${name}" not found in category "${category}"`);
    return '';
  }
  
  return sound.url;
}

/**
 * Get full sound entry with metadata
 */
export function getSound(category: SoundCategory, name: SoundName): SoundEntry | null {
  const categoryData = soundLibrary[category];
  if (!categoryData) return null;
  
  return categoryData[name as keyof typeof categoryData] || null;
}

/**
 * Get all sounds in a category
 */
export function getSoundsByCategory(category: SoundCategory): Record<string, SoundEntry> {
  return soundLibrary[category] || {};
}

/**
 * Get all available sound names for a category
 */
export function getSoundNames(category: SoundCategory): string[] {
  return Object.keys(soundLibrary[category] || {});
}

/**
 * Preload sounds for smoother playback
 */
export function preloadSounds(sounds: Array<{ category: SoundCategory; name: SoundName }>): void {
  sounds.forEach(({ category, name }) => {
    const url = getSoundUrl(category, name);
    if (url) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
    }
  });
}

/**
 * Play a sound effect (for preview in editor)
 */
export function playSound(
  category: SoundCategory,
  name: SoundName,
  volume: number = 1.0
): HTMLAudioElement | null {
  const url = getSoundUrl(category, name);
  if (!url) return null;
  
  const audio = new Audio(url);
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.play().catch(err => console.warn('Failed to play sound:', err));
  
  return audio;
}
