import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ReactNode } from 'react';

export type ColorGradePreset =
  | 'none'
  | 'warm'
  | 'cool'
  | 'noir'
  | 'vintage'
  | 'cinematic'
  | 'vibrant'
  | 'muted'
  | 'dramatic'
  | 'sunset'
  | 'forest'
  | 'cyberpunk'
  | 'film-noir'
  | 'sepia';

export interface ColorGradeConfig {
  brightness?: number; // 0-200, default 100
  contrast?: number; // 0-200, default 100
  saturation?: number; // 0-200, default 100
  hueRotate?: number; // 0-360 degrees
  blur?: number; // 0-20 px
  grayscale?: number; // 0-100
  sepia?: number; // 0-100
  invert?: number; // 0-100
  opacity?: number; // 0-1
  overlay?: string; // CSS color for overlay
  overlayBlendMode?: string;
  overlayOpacity?: number;
  vignette?: boolean;
  vignetteIntensity?: number; // 0-1
}

export interface ColorGradeProps {
  children: ReactNode;
  preset?: ColorGradePreset;
  config?: ColorGradeConfig;
  intensity?: number; // 0-1, how strong the effect is
  animateIn?: boolean;
  animateInDuration?: number; // frames
}

// Preset configurations
const GRADE_PRESETS: Record<ColorGradePreset, ColorGradeConfig> = {
  none: {},
  warm: {
    brightness: 105,
    contrast: 105,
    saturation: 110,
    sepia: 15,
    overlay: 'rgba(255, 180, 100, 0.1)',
  },
  cool: {
    brightness: 100,
    contrast: 105,
    saturation: 90,
    hueRotate: 10,
    overlay: 'rgba(100, 150, 255, 0.1)',
  },
  noir: {
    brightness: 95,
    contrast: 130,
    saturation: 0,
    overlay: 'rgba(0, 0, 0, 0.2)',
    vignette: true,
    vignetteIntensity: 0.6,
  },
  vintage: {
    brightness: 95,
    contrast: 90,
    saturation: 80,
    sepia: 30,
    overlay: 'rgba(255, 220, 180, 0.15)',
    vignette: true,
    vignetteIntensity: 0.4,
  },
  cinematic: {
    brightness: 98,
    contrast: 115,
    saturation: 105,
    overlay: 'rgba(0, 50, 80, 0.1)',
    vignette: true,
    vignetteIntensity: 0.3,
  },
  vibrant: {
    brightness: 105,
    contrast: 115,
    saturation: 140,
  },
  muted: {
    brightness: 100,
    contrast: 90,
    saturation: 60,
    overlay: 'rgba(128, 128, 128, 0.1)',
  },
  dramatic: {
    brightness: 95,
    contrast: 140,
    saturation: 110,
    vignette: true,
    vignetteIntensity: 0.5,
    overlay: 'rgba(0, 0, 30, 0.15)',
  },
  sunset: {
    brightness: 105,
    contrast: 110,
    saturation: 120,
    overlay: 'rgba(255, 100, 50, 0.15)',
    hueRotate: -10,
  },
  forest: {
    brightness: 98,
    contrast: 105,
    saturation: 90,
    overlay: 'rgba(50, 100, 50, 0.12)',
    hueRotate: 5,
  },
  cyberpunk: {
    brightness: 100,
    contrast: 130,
    saturation: 130,
    hueRotate: -20,
    overlay: 'rgba(255, 0, 128, 0.1)',
    vignette: true,
    vignetteIntensity: 0.4,
  },
  'film-noir': {
    brightness: 90,
    contrast: 150,
    saturation: 0,
    overlay: 'rgba(0, 0, 0, 0.3)',
    vignette: true,
    vignetteIntensity: 0.7,
  },
  sepia: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 80,
  },
};

export const ColorGrade: React.FC<ColorGradeProps> = ({
  children,
  preset = 'none',
  config,
  intensity = 1,
  animateIn = false,
  animateInDuration = 30,
}) => {
  const frame = useCurrentFrame();

  // Get preset and merge with custom config
  const presetConfig = GRADE_PRESETS[preset];
  const finalConfig: ColorGradeConfig = { ...presetConfig, ...config };

  // Calculate animation progress
  const animationProgress = animateIn
    ? interpolate(frame, [0, animateInDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const effectiveIntensity = intensity * animationProgress;

  // Build filter string
  const buildFilter = () => {
    const filters: string[] = [];

    if (finalConfig.brightness !== undefined && finalConfig.brightness !== 100) {
      const value = interpolate(effectiveIntensity, [0, 1], [100, finalConfig.brightness]);
      filters.push(`brightness(${value}%)`);
    }

    if (finalConfig.contrast !== undefined && finalConfig.contrast !== 100) {
      const value = interpolate(effectiveIntensity, [0, 1], [100, finalConfig.contrast]);
      filters.push(`contrast(${value}%)`);
    }

    if (finalConfig.saturation !== undefined && finalConfig.saturation !== 100) {
      const value = interpolate(effectiveIntensity, [0, 1], [100, finalConfig.saturation]);
      filters.push(`saturate(${value}%)`);
    }

    if (finalConfig.hueRotate) {
      const value = interpolate(effectiveIntensity, [0, 1], [0, finalConfig.hueRotate]);
      filters.push(`hue-rotate(${value}deg)`);
    }

    if (finalConfig.blur) {
      const value = interpolate(effectiveIntensity, [0, 1], [0, finalConfig.blur]);
      filters.push(`blur(${value}px)`);
    }

    if (finalConfig.grayscale) {
      const value = interpolate(effectiveIntensity, [0, 1], [0, finalConfig.grayscale]);
      filters.push(`grayscale(${value}%)`);
    }

    if (finalConfig.sepia) {
      const value = interpolate(effectiveIntensity, [0, 1], [0, finalConfig.sepia]);
      filters.push(`sepia(${value}%)`);
    }

    if (finalConfig.invert) {
      const value = interpolate(effectiveIntensity, [0, 1], [0, finalConfig.invert]);
      filters.push(`invert(${value}%)`);
    }

    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  const filter = buildFilter();

  return (
    <AbsoluteFill>
      {/* Main content with filter */}
      <AbsoluteFill style={{ filter, opacity: finalConfig.opacity ?? 1 }}>
        {children}
      </AbsoluteFill>

      {/* Color overlay */}
      {finalConfig.overlay && (
        <AbsoluteFill
          style={{
            backgroundColor: finalConfig.overlay,
            mixBlendMode: (finalConfig.overlayBlendMode as React.CSSProperties['mixBlendMode']) ?? 'normal',
            opacity: (finalConfig.overlayOpacity ?? 1) * effectiveIntensity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Vignette effect */}
      {finalConfig.vignette && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${(finalConfig.vignetteIntensity ?? 0.5) * effectiveIntensity}) 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Export presets for easy access
export const ColorGradePresets = GRADE_PRESETS;
