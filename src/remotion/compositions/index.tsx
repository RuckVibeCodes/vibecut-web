// VibeCut Remotion Compositions Root
// Registers all compositions for rendering

import React from 'react';
import { Composition } from 'remotion';
import CinematicComposition from '../CinematicComposition';

// Aspect ratio configurations
const ASPECT_CONFIGS = {
  '16:9': { width: 1920, height: 1080, id: 'CinematicVideo-16-9' },
  '9:16': { width: 1080, height: 1920, id: 'CinematicVideo-9-16' },
  '1:1': { width: 1080, height: 1080, id: 'CinematicVideo-1-1' },
  '4:5': { width: 1080, height: 1350, id: 'CinematicVideo-4-5' },
};

// Default input props for preview
const defaultProps = {
  videoSrc: '',
  audioSrc: undefined,
  transcript: undefined,
  captionStyle: 'bounce',
  showCaptions: true,
  cameraKeyframes: [],
  brollClips: [],
  colorGrade: 'none' as const,
  lowerThirds: [],
  textCallouts: [],
  soundEffects: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* YouTube / Standard HD (16:9) */}
      <Composition
        id={ASPECT_CONFIGS['16:9'].id}
        component={CinematicComposition}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['16:9'].width}
        height={ASPECT_CONFIGS['16:9'].height}
        defaultProps={defaultProps}
      />

      {/* TikTok / Reels / Shorts (9:16) */}
      <Composition
        id={ASPECT_CONFIGS['9:16'].id}
        component={CinematicComposition}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['9:16'].width}
        height={ASPECT_CONFIGS['9:16'].height}
        defaultProps={defaultProps}
      />

      {/* Instagram Square (1:1) */}
      <Composition
        id={ASPECT_CONFIGS['1:1'].id}
        component={CinematicComposition}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['1:1'].width}
        height={ASPECT_CONFIGS['1:1'].height}
        defaultProps={defaultProps}
      />

      {/* Instagram Portrait (4:5) */}
      <Composition
        id={ASPECT_CONFIGS['4:5'].id}
        component={CinematicComposition}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['4:5'].width}
        height={ASPECT_CONFIGS['4:5'].height}
        defaultProps={defaultProps}
      />
    </>
  );
};

// Helper to get composition ID from aspect ratio
export function getCompositionId(aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'): string {
  return ASPECT_CONFIGS[aspectRatio].id;
}

// Helper to get dimensions from aspect ratio
export function getDimensions(aspectRatio: '16:9' | '9:16' | '1:1' | '4:5') {
  return {
    width: ASPECT_CONFIGS[aspectRatio].width,
    height: ASPECT_CONFIGS[aspectRatio].height,
  };
}

export { ASPECT_CONFIGS };
export default RemotionRoot;
