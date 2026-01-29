// VibeCut Remotion Compositions Root
// Registers all compositions for rendering

import { Composition } from 'remotion';
import { CinematicVideo } from '../CinematicComposition';

// Default input props for preview
const defaultProps = {
  sourceVideoUrl: '',
  duration: 30,
  width: 1920,
  height: 1080,
  
  transcript: undefined,
  captionStyle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 48,
    fontWeight: 700,
    color: '#FFFFFF',
    position: 'bottom' as const,
    animation: 'bounce' as const,
    outlineColor: '#000000',
    outlineWidth: 2,
  },
  
  colorGrade: {
    id: 'none',
    name: 'Original',
    filter: 'none',
  },
  
  cameraKeyframes: [],
  brollClips: [],
  textOverlays: [],
  soundEffects: [],
  musicTrack: undefined,
  
  enableSubtleDrift: false,
  enableFilmGrain: false,
  enableVignette: true,
};

// Aspect ratio configurations
const ASPECT_CONFIGS = {
  '16:9': { width: 1920, height: 1080, id: 'CinematicVideo-16-9' },
  '9:16': { width: 1080, height: 1920, id: 'CinematicVideo-9-16' },
  '1:1': { width: 1080, height: 1080, id: 'CinematicVideo-1-1' },
  '4:5': { width: 1080, height: 1350, id: 'CinematicVideo-4-5' },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* YouTube / Standard HD (16:9) */}
      <Composition
        id={ASPECT_CONFIGS['16:9'].id}
        component={CinematicVideo}
        durationInFrames={30 * 30} // Default 30 seconds
        fps={30}
        width={ASPECT_CONFIGS['16:9'].width}
        height={ASPECT_CONFIGS['16:9'].height}
        defaultProps={{
          ...defaultProps,
          width: ASPECT_CONFIGS['16:9'].width,
          height: ASPECT_CONFIGS['16:9'].height,
        }}
      />

      {/* TikTok / Reels / Shorts (9:16) */}
      <Composition
        id={ASPECT_CONFIGS['9:16'].id}
        component={CinematicVideo}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['9:16'].width}
        height={ASPECT_CONFIGS['9:16'].height}
        defaultProps={{
          ...defaultProps,
          width: ASPECT_CONFIGS['9:16'].width,
          height: ASPECT_CONFIGS['9:16'].height,
          // Adjust caption style for vertical
          captionStyle: {
            ...defaultProps.captionStyle,
            fontSize: 64, // Larger for mobile
            position: 'center' as const,
          },
        }}
      />

      {/* Instagram Square (1:1) */}
      <Composition
        id={ASPECT_CONFIGS['1:1'].id}
        component={CinematicVideo}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['1:1'].width}
        height={ASPECT_CONFIGS['1:1'].height}
        defaultProps={{
          ...defaultProps,
          width: ASPECT_CONFIGS['1:1'].width,
          height: ASPECT_CONFIGS['1:1'].height,
        }}
      />

      {/* Instagram Portrait (4:5) */}
      <Composition
        id={ASPECT_CONFIGS['4:5'].id}
        component={CinematicVideo}
        durationInFrames={30 * 30}
        fps={30}
        width={ASPECT_CONFIGS['4:5'].width}
        height={ASPECT_CONFIGS['4:5'].height}
        defaultProps={{
          ...defaultProps,
          width: ASPECT_CONFIGS['4:5'].width,
          height: ASPECT_CONFIGS['4:5'].height,
        }}
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
