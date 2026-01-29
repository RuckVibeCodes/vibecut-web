// CinematicComposition.tsx
// Main composition for VibeCut - AI Cinematographer video editing

import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Audio,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { DynamicCamera, CameraKeyframe } from './components/DynamicCamera';
import { CinematicCaptions, CinematicCaptionsProps } from './components/CinematicCaptions';
import { BRollOverlay, BRollClip } from './components/BRollOverlay';
import { ColorGrade, ColorGradePreset, ColorGradeConfig } from './components/ColorGrade';
import { LowerThird, LowerThirdConfig } from './components/LowerThird';
import { TextCallout, TextCalloutConfig } from './components/TextCallout';
import { TranscriptWord } from '@/lib/types';

/**
 * Main input props for the Cinematic Composition
 * All video editing features are controlled via these props
 */
export interface CinematicCompositionProps {
  // Core media
  videoSrc?: string;
  audioSrc?: string;
  audioVolume?: number;
  audioStartFrom?: number;

  // Transcript/Captions
  transcript?: {
    words: TranscriptWord[];
  };
  captionStyle?: string;
  showCaptions?: boolean;
  impactWords?: string[];
  maxCaptionWords?: number;

  // Camera movement
  cameraKeyframes?: CameraKeyframe[];
  cameraSmoothness?: number;

  // B-roll overlays
  brollClips?: BRollClip[];
  brollTransitionDuration?: number;

  // Color grading
  colorGradePreset?: ColorGradePreset;
  colorGradeConfig?: ColorGradeConfig;
  colorGradeIntensity?: number;

  // Lower thirds
  lowerThirds?: LowerThirdConfig[];

  // Text callouts
  callouts?: TextCalloutConfig[];

  // Global settings
  backgroundColor?: string;
}

export const CinematicComposition: React.FC<CinematicCompositionProps> = ({
  // Core media
  videoSrc,
  audioSrc,
  audioVolume = 1,
  audioStartFrom = 0,

  // Captions
  transcript,
  captionStyle = 'tiktok-bounce',
  showCaptions = true,
  impactWords = [],
  maxCaptionWords = 4,

  // Camera
  cameraKeyframes,
  cameraSmoothness = 0.5,

  // B-roll
  brollClips = [],
  brollTransitionDuration = 10,

  // Color grade
  colorGradePreset = 'cinematic',
  colorGradeConfig,
  colorGradeIntensity = 1,

  // Lower thirds
  lowerThirds = [],

  // Callouts
  callouts = [],

  // Global
  backgroundColor = '#000000',
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  // Default camera keyframes if none provided - subtle cinematic drift
  const defaultCameraKeyframes: CameraKeyframe[] = [
    { frame: 0, scale: 1.02, x: 0, y: 0 },
    { frame: Math.floor(durationInFrames * 0.3), scale: 1.05, x: -1, y: 0.5 },
    { frame: Math.floor(durationInFrames * 0.6), scale: 1.03, x: 1, y: -0.5 },
    { frame: durationInFrames, scale: 1.02, x: 0, y: 0 },
  ];

  const finalCameraKeyframes = cameraKeyframes ?? defaultCameraKeyframes;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Layer 1: Color graded video with dynamic camera */}
      <ColorGrade
        preset={colorGradePreset}
        config={colorGradeConfig}
        intensity={colorGradeIntensity}
        animateIn
        animateInDuration={30}
      >
        <DynamicCamera
          keyframes={finalCameraKeyframes}
          smoothness={cameraSmoothness}
        >
          <AbsoluteFill>
            {videoSrc ? (
              <OffthreadVideo
                src={videoSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1a2e' }} />
            )}
          </AbsoluteFill>
        </DynamicCamera>
      </ColorGrade>

      {/* Layer 2: B-roll overlays */}
      {brollClips.length > 0 && (
        <ColorGrade
          preset={colorGradePreset}
          config={colorGradeConfig}
          intensity={colorGradeIntensity}
        >
          <BRollOverlay
            clips={brollClips}
            transitionDuration={brollTransitionDuration}
          />
        </ColorGrade>
      )}

      {/* Layer 3: Text callouts (behind captions, in front of video) */}
      {callouts.length > 0 && (
        <TextCallout callouts={callouts} />
      )}

      {/* Layer 4: Lower third graphics */}
      {lowerThirds.length > 0 && (
        <LowerThird graphics={lowerThirds} />
      )}

      {/* Layer 5: Captions (topmost text layer) */}
      {showCaptions && transcript && transcript.words.length > 0 && (
        <CinematicCaptions
          words={transcript.words}
          styleId={captionStyle}
          impactWords={impactWords}
          maxWordsOnScreen={maxCaptionWords}
        />
      )}

      {/* Audio track (if separate from video) */}
      {audioSrc && (
        <Sequence from={Math.round(audioStartFrom * fps)}>
          <Audio src={audioSrc} volume={audioVolume} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// Default props helper for quick setup
export const defaultCinematicProps: Partial<CinematicCompositionProps> = {
  showCaptions: true,
  captionStyle: 'tiktok-bounce',
  colorGradePreset: 'cinematic',
  colorGradeIntensity: 1,
  cameraSmoothness: 0.5,
  maxCaptionWords: 4,
  backgroundColor: '#000000',
  audioVolume: 1,
};

// Preset composition configurations for different content types
export const CompositionPresets = {
  youtube: {
    captionStyle: 'youtube-shorts',
    colorGradePreset: 'vibrant' as ColorGradePreset,
    colorGradeIntensity: 0.8,
    maxCaptionWords: 5,
  },
  tiktok: {
    captionStyle: 'tiktok-bounce',
    colorGradePreset: 'cinematic' as ColorGradePreset,
    colorGradeIntensity: 1,
    maxCaptionWords: 3,
  },
  podcast: {
    captionStyle: 'minimal',
    colorGradePreset: 'warm' as ColorGradePreset,
    colorGradeIntensity: 0.6,
    maxCaptionWords: 8,
  },
  documentary: {
    captionStyle: 'classic',
    colorGradePreset: 'cinematic' as ColorGradePreset,
    colorGradeIntensity: 1,
    maxCaptionWords: 10,
  },
  mrbeast: {
    captionStyle: 'mrbeast',
    colorGradePreset: 'vibrant' as ColorGradePreset,
    colorGradeIntensity: 1.2,
    maxCaptionWords: 2,
    impactWords: ['FREE', 'MONEY', 'MILLION', 'INSANE', 'CRAZY', 'WOW'],
  },
  aesthetic: {
    captionStyle: 'neon',
    colorGradePreset: 'cyberpunk' as ColorGradePreset,
    colorGradeIntensity: 1,
    maxCaptionWords: 4,
  },
  vintage: {
    captionStyle: 'typewriter',
    colorGradePreset: 'vintage' as ColorGradePreset,
    colorGradeIntensity: 1,
    maxCaptionWords: 8,
  },
};

export default CinematicComposition;
