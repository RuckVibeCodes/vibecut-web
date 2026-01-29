// ColorGrade.tsx
// Apply cinematic color grading via CSS filters

import React, { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

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
  | 'sepia'
  | 'late-night'
  | 'golden-hour'
  | 'documentary'
  | 'high-contrast';

export interface ColorGradeConfig {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hueRotate?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;
  invert?: number;
  opacity?: number;
  overlay?: string;
  overlayBlendMode?: string;
  overlayOpacity?: number;
  vignette?: boolean;
  vignetteIntensity?: number;
}

export interface ColorGradeProps {
  children: ReactNode;
  preset?: ColorGradePreset;
  config?: ColorGradeConfig;
  intensity?: number;
  animateIn?: boolean;
  animateInDuration?: number;
  // Legacy props for backward compatibility
  filter?: string;
}

// Predefined cinematic grades - legacy format
export const COLOR_GRADES = {
  none: 'none',
  warm: 'sepia(0.15) saturate(1.1) brightness(1.05)',
  cool: 'saturate(0.9) hue-rotate(-10deg) brightness(1.05)',
  noir: 'grayscale(0.8) contrast(1.2) brightness(0.95)',
  vintage: 'sepia(0.3) contrast(0.9) brightness(1.1) saturate(0.8)',
  cinematic: 'contrast(1.1) saturate(1.15) brightness(0.95)',
  'late-night': 'saturate(0.85) brightness(0.85) contrast(1.15) hue-rotate(-5deg)',
  'golden-hour': 'sepia(0.2) saturate(1.3) brightness(1.1) contrast(1.05)',
  'documentary': 'contrast(1.05) saturate(0.9) brightness(1.02)',
  'high-contrast': 'contrast(1.3) saturate(1.1) brightness(0.95)',
  'muted': 'saturate(0.7) contrast(0.95) brightness(1.05)',
  'vibrant': 'saturate(1.4) contrast(1.05) brightness(1.02)',
  'film-grain': 'contrast(1.1) brightness(0.98) saturate(0.95)',
};

// Preset configurations - new format with more control
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
  'late-night': {
    brightness: 85,
    contrast: 115,
    saturation: 85,
    hueRotate: -5,
    overlay: 'rgba(0, 20, 40, 0.15)',
    vignette: true,
    vignetteIntensity: 0.4,
  },
  'golden-hour': {
    brightness: 110,
    contrast: 105,
    saturation: 130,
    sepia: 20,
    overlay: 'rgba(255, 200, 100, 0.12)',
  },
  documentary: {
    brightness: 102,
    contrast: 105,
    saturation: 90,
  },
  'high-contrast': {
    brightness: 95,
    contrast: 130,
    saturation: 110,
  },
};

export const ColorGrade: React.FC<ColorGradeProps> = ({
  children,
  preset = 'none',
  config,
  intensity = 1,
  animateIn = false,
  animateInDuration = 30,
  filter,
}) => {
  const frame = useCurrentFrame();

  // Legacy mode: if filter prop is provided, use the old behavior
  if (filter !== undefined) {
    if (intensity >= 1 || filter === 'none') {
      return (
        <div style={{ width: '100%', height: '100%', filter: filter === 'none' ? undefined : filter }}>
          {children}
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          {children}
        </div>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, filter, opacity: intensity, pointerEvents: 'none' }}>
          {children}
        </div>
      </div>
    );
  }

  // New mode: use preset and config
  const presetConfig = GRADE_PRESETS[preset];
  const finalConfig: ColorGradeConfig = { ...presetConfig, ...config };

  const animationProgress = animateIn
    ? interpolate(frame, [0, animateInDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const effectiveIntensity = intensity * animationProgress;

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

  const filterStr = buildFilter();

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: filterStr, opacity: finalConfig.opacity ?? 1 }}>
        {children}
      </AbsoluteFill>

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

export const ColorGradePresets = GRADE_PRESETS;

// Film grain overlay component
export const FilmGrain: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  animated?: boolean;
}> = ({ children, intensity = 0.1, animated = true }) => {
  const noiseId = `noise-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: intensity,
          mixBlendMode: 'overlay',
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <defs>
            <filter id={noiseId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency={animated ? '0.8' : '0.6'}
                numOctaves="4"
                seed={animated ? Math.floor(Math.random() * 100) : 42}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>
    </div>
  );
};

// Vignette effect
export const Vignette: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  size?: number;
}> = ({ children, intensity = 0.3, size = 0.5 }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `radial-gradient(ellipse at center, transparent ${size * 100}%, rgba(0, 0, 0, ${intensity}) 100%)`,
        }}
      />
    </div>
  );
};

// Cinematic bars (letterbox)
export const CinematicBars: React.FC<{
  children: React.ReactNode;
  ratio?: number;
}> = ({ children, ratio = 2.35 }) => {
  const currentRatio = 16 / 9;
  const barHeight = ratio > currentRatio ? ((1 - (currentRatio / ratio)) / 2) * 100 : 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
      {barHeight > 0 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${barHeight}%`, backgroundColor: 'black' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${barHeight}%`, backgroundColor: 'black' }} />
        </>
      )}
    </div>
  );
};

export default ColorGrade;
