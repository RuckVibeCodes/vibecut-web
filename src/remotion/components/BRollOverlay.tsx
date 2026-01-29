import {
  AbsoluteFill,
  OffthreadVideo,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from 'remotion';

export interface BRollClip {
  id: string;
  src: string;
  type: 'video' | 'image';
  startTime: number; // in seconds
  duration: number; // in seconds
  transition?: 'cut' | 'fade' | 'zoom' | 'slide-left' | 'slide-right' | 'slide-up';
  scale?: number;
  position?: { x: number; y: number };
  opacity?: number;
  playbackRate?: number;
  volume?: number;
}

export interface BRollOverlayProps {
  clips: BRollClip[];
  transitionDuration?: number; // frames for transition
}

export const BRollOverlay: React.FC<BRollOverlayProps> = ({
  clips,
  transitionDuration = 10,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {clips.map((clip) => {
        const startFrame = Math.round(clip.startTime * fps);
        const durationFrames = Math.round(clip.duration * fps);

        return (
          <Sequence
            key={clip.id}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <BRollClipRenderer
              clip={clip}
              transitionDuration={transitionDuration}
              durationFrames={durationFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface BRollClipRendererProps {
  clip: BRollClip;
  transitionDuration: number;
  durationFrames: number;
}

const BRollClipRenderer: React.FC<BRollClipRendererProps> = ({
  clip,
  transitionDuration,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate transition animations
  const getTransitionStyle = () => {
    const transition = clip.transition ?? 'fade';

    switch (transition) {
      case 'cut':
        return { opacity: 1, transform: 'none' };

      case 'fade': {
        const fadeIn = interpolate(frame, [0, transitionDuration], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const fadeOut = interpolate(
          frame,
          [durationFrames - transitionDuration, durationFrames],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return { opacity: Math.min(fadeIn, fadeOut) };
      }

      case 'zoom': {
        const zoomIn = spring({
          frame,
          fps,
          config: { damping: 15, stiffness: 100 },
        });
        const scale = interpolate(zoomIn, [0, 1], [1.2, 1]);
        const fadeIn = interpolate(frame, [0, transitionDuration / 2], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const fadeOut = interpolate(
          frame,
          [durationFrames - transitionDuration, durationFrames],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return {
          opacity: Math.min(fadeIn, fadeOut),
          transform: `scale(${scale})`,
        };
      }

      case 'slide-left': {
        const slideIn = interpolate(frame, [0, transitionDuration], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const slideOut = interpolate(
          frame,
          [durationFrames - transitionDuration, durationFrames],
          [0, -100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const x = frame < transitionDuration ? slideIn : slideOut;
        return { transform: `translateX(${x}%)` };
      }

      case 'slide-right': {
        const slideIn = interpolate(frame, [0, transitionDuration], [-100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const slideOut = interpolate(
          frame,
          [durationFrames - transitionDuration, durationFrames],
          [0, 100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const x = frame < transitionDuration ? slideIn : slideOut;
        return { transform: `translateX(${x}%)` };
      }

      case 'slide-up': {
        const slideIn = interpolate(frame, [0, transitionDuration], [100, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const slideOut = interpolate(
          frame,
          [durationFrames - transitionDuration, durationFrames],
          [0, -100],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const y = frame < transitionDuration ? slideIn : slideOut;
        return { transform: `translateY(${y}%)` };
      }

      default:
        return { opacity: 1 };
    }
  };

  const transitionStyle = getTransitionStyle();
  const baseOpacity = clip.opacity ?? 1;
  const baseScale = clip.scale ?? 1;
  const position = clip.position ?? { x: 0, y: 0 };

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...transitionStyle,
    opacity: (transitionStyle.opacity ?? 1) * baseOpacity,
  };

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${baseScale}) translate(${position.x}%, ${position.y}%)`,
  };

  return (
    <div style={containerStyle}>
      {clip.type === 'video' ? (
        <OffthreadVideo
          src={clip.src}
          style={mediaStyle}
          playbackRate={clip.playbackRate ?? 1}
          volume={clip.volume ?? 1}
        />
      ) : (
        <Img src={clip.src} style={mediaStyle} />
      )}
    </div>
  );
};

// Helper to create B-roll from timestamps
export const createBRollFromTimestamps = (
  clips: Array<{
    src: string;
    type: 'video' | 'image';
    timestamp: number;
    duration?: number;
  }>
): BRollClip[] => {
  return clips.map((clip, index) => ({
    id: `broll-${index}`,
    src: clip.src,
    type: clip.type,
    startTime: clip.timestamp,
    duration: clip.duration ?? 3,
    transition: 'fade',
  }));
};
