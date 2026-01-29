// CinematicComposition.tsx
// Main composition for VibeCut - combines all elements into a cinematic video

import React from 'react';
import {
  AbsoluteFill,
  Video,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  OffthreadVideo,
} from 'remotion';
import { DynamicCamera, SubtleDrift } from './components/DynamicCamera';
import { CinematicCaptions } from './components/CinematicCaptions';
import { ColorGrade, FilmGrain, Vignette } from './components/ColorGrade';

// Types
interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

interface Transcript {
  text: string;
  words: Word[];
  duration: number;
}

interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'bounce' | 'fade' | 'typewriter' | 'highlight';
  highlightColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
}

interface CameraKeyframe {
  time: number;
  scale: number;
  x: number;
  y: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface BRollClip {
  id: string;
  type: 'generated' | 'library' | 'uploaded';
  url: string;
  startTime: number;
  duration: number;
  opacity: number;
  position: 'fullscreen' | 'pip-top-right' | 'pip-top-left' | 'pip-bottom-right' | 'pip-bottom-left';
  transition: 'cut' | 'fade' | 'slide';
}

interface TextOverlay {
  id: string;
  type: 'callout' | 'lower-third' | 'chapter' | 'impact';
  text: string;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontWeight: number;
    color: string;
    backgroundColor?: string;
    animation: 'slam' | 'fade' | 'typewriter' | 'slide';
  };
}

interface SoundEffect {
  id: string;
  name: string;
  url: string;
  startTime: number;
  volume: number;
}

interface MusicTrack {
  id: string;
  name: string;
  url: string;
  startTime: number;
  endTime?: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

interface ColorGradeConfig {
  id: string;
  name: string;
  filter: string;
}

// Input props for the composition
interface CinematicVideoProps {
  sourceVideoUrl: string;
  duration: number;
  width: number;
  height: number;
  
  transcript?: Transcript;
  captionStyle: CaptionStyle;
  
  colorGrade: ColorGradeConfig;
  
  cameraKeyframes: CameraKeyframe[];
  brollClips: BRollClip[];
  textOverlays: TextOverlay[];
  soundEffects: SoundEffect[];
  musicTrack?: MusicTrack;
  
  // Feature flags
  enableSubtleDrift?: boolean;
  enableFilmGrain?: boolean;
  enableVignette?: boolean;
  filmGrainIntensity?: number;
  vignetteIntensity?: number;
}

export const CinematicVideo: React.FC<CinematicVideoProps> = ({
  sourceVideoUrl,
  duration,
  
  transcript,
  captionStyle,
  
  colorGrade,
  
  cameraKeyframes,
  brollClips,
  textOverlays,
  soundEffects,
  musicTrack,
  
  enableSubtleDrift = false,
  enableFilmGrain = false,
  enableVignette = true,
  filmGrainIntensity = 0.08,
  vignetteIntensity = 0.25,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Render video with camera movements
  const renderVideo = () => {
    let content = (
      <OffthreadVideo
        src={sourceVideoUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );

    // Apply subtle drift if enabled
    if (enableSubtleDrift) {
      content = <SubtleDrift intensity={0.5}>{content}</SubtleDrift>;
    }

    // Apply dynamic camera movements
    if (cameraKeyframes.length > 0) {
      content = (
        <DynamicCamera keyframes={cameraKeyframes} duration={duration}>
          {content}
        </DynamicCamera>
      );
    }

    return content;
  };

  // Render B-roll overlays
  const renderBRoll = () => {
    return brollClips.map((clip) => {
      const startFrame = Math.floor(clip.startTime * fps);
      const durationFrames = Math.floor(clip.duration * fps);
      
      // Position styles for PIP
      const positionStyles: React.CSSProperties = {
        position: 'absolute',
        ...(clip.position === 'fullscreen' && { inset: 0 }),
        ...(clip.position === 'pip-top-right' && { 
          top: 20, 
          right: 20, 
          width: '30%', 
          height: 'auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }),
        ...(clip.position === 'pip-top-left' && { 
          top: 20, 
          left: 20, 
          width: '30%',
          height: 'auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }),
        ...(clip.position === 'pip-bottom-right' && { 
          bottom: 100, 
          right: 20, 
          width: '30%',
          height: 'auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }),
        ...(clip.position === 'pip-bottom-left' && { 
          bottom: 100, 
          left: 20, 
          width: '30%',
          height: 'auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }),
      };

      return (
        <Sequence
          key={clip.id}
          from={startFrame}
          durationInFrames={durationFrames}
        >
          <BRollTransition
            transition={clip.transition}
            duration={durationFrames}
            fps={fps}
          >
            <div style={{ ...positionStyles, opacity: clip.opacity }}>
              <OffthreadVideo
                src={clip.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </BRollTransition>
        </Sequence>
      );
    });
  };

  // Render text overlays
  const renderTextOverlays = () => {
    return textOverlays.map((overlay) => {
      const startFrame = Math.floor(overlay.startTime * fps);
      const durationFrames = Math.floor((overlay.endTime - overlay.startTime) * fps);

      return (
        <Sequence
          key={overlay.id}
          from={startFrame}
          durationInFrames={durationFrames}
        >
          <TextOverlayComponent overlay={overlay} fps={fps} />
        </Sequence>
      );
    });
  };

  // Render audio (sound effects + music)
  const renderAudio = () => {
    return (
      <>
        {soundEffects.map((sound) => (
          <Sequence
            key={sound.id}
            from={Math.floor(sound.startTime * fps)}
          >
            <Audio src={sound.url} volume={sound.volume} />
          </Sequence>
        ))}
        
        {musicTrack && (
          <Sequence from={Math.floor(musicTrack.startTime * fps)}>
            <MusicWithFade
              src={musicTrack.url}
              volume={musicTrack.volume}
              fadeIn={musicTrack.fadeIn || 0}
              fadeOut={musicTrack.fadeOut || 0}
              duration={musicTrack.endTime ? musicTrack.endTime - musicTrack.startTime : duration}
              fps={fps}
            />
          </Sequence>
        )}
      </>
    );
  };

  // Main composition
  let composition = (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Base video layer */}
      {renderVideo()}
      
      {/* B-roll layer */}
      {renderBRoll()}
      
      {/* Text overlays layer */}
      {renderTextOverlays()}
      
      {/* Captions layer */}
      {transcript && transcript.words.length > 0 && (
        <CinematicCaptions
          words={transcript.words}
          style={captionStyle}
        />
      )}
    </AbsoluteFill>
  );

  // Apply color grading
  if (colorGrade.filter !== 'none') {
    composition = <ColorGrade filter={colorGrade.filter}>{composition}</ColorGrade>;
  }

  // Apply film grain
  if (enableFilmGrain) {
    composition = <FilmGrain intensity={filmGrainIntensity}>{composition}</FilmGrain>;
  }

  // Apply vignette
  if (enableVignette) {
    composition = <Vignette intensity={vignetteIntensity}>{composition}</Vignette>;
  }

  return (
    <>
      {composition}
      {renderAudio()}
    </>
  );
};

// B-roll transition component
const BRollTransition: React.FC<{
  children: React.ReactNode;
  transition: 'cut' | 'fade' | 'slide';
  duration: number;
  fps: number;
}> = ({ children, transition, duration, fps }) => {
  const frame = useCurrentFrame();
  
  const fadeInFrames = Math.min(fps * 0.3, duration / 4);
  const fadeOutFrames = Math.min(fps * 0.3, duration / 4);
  
  let opacity = 1;
  let transform = 'none';

  if (transition === 'fade') {
    if (frame < fadeInFrames) {
      opacity = interpolate(frame, [0, fadeInFrames], [0, 1]);
    } else if (frame > duration - fadeOutFrames) {
      opacity = interpolate(frame, [duration - fadeOutFrames, duration], [1, 0]);
    }
  } else if (transition === 'slide') {
    if (frame < fadeInFrames) {
      const progress = interpolate(frame, [0, fadeInFrames], [0, 1]);
      transform = `translateX(${(1 - progress) * 100}%)`;
      opacity = progress;
    } else if (frame > duration - fadeOutFrames) {
      const progress = interpolate(frame, [duration - fadeOutFrames, duration], [0, 1]);
      transform = `translateX(${progress * -100}%)`;
      opacity = 1 - progress;
    }
  }

  return (
    <div style={{ opacity, transform, width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

// Text overlay component with animations
const TextOverlayComponent: React.FC<{
  overlay: TextOverlay;
  fps: number;
}> = ({ overlay, fps }) => {
  const frame = useCurrentFrame();
  const duration = (overlay.endTime - overlay.startTime) * fps;
  
  const animIn = Math.min(fps * 0.3, duration / 4);
  const animOut = Math.min(fps * 0.3, duration / 4);
  
  let opacity = 1;
  let transform = 'translate(-50%, -50%)';
  let scale = 1;

  switch (overlay.style.animation) {
    case 'slam':
      if (frame < animIn) {
        scale = interpolate(frame, [0, animIn], [2, 1], {
          extrapolateRight: 'clamp',
        });
        opacity = interpolate(frame, [0, animIn * 0.5], [0, 1]);
      }
      if (frame > duration - animOut) {
        opacity = interpolate(frame, [duration - animOut, duration], [1, 0]);
      }
      transform = `translate(-50%, -50%) scale(${scale})`;
      break;
      
    case 'fade':
      if (frame < animIn) {
        opacity = interpolate(frame, [0, animIn], [0, 1]);
      }
      if (frame > duration - animOut) {
        opacity = interpolate(frame, [duration - animOut, duration], [1, 0]);
      }
      break;
      
    case 'slide':
      if (frame < animIn) {
        const slideProgress = interpolate(frame, [0, animIn], [0, 1]);
        transform = `translate(${-50 + (1 - slideProgress) * -20}%, -50%)`;
        opacity = slideProgress;
      }
      if (frame > duration - animOut) {
        const slideProgress = interpolate(frame, [duration - animOut, duration], [0, 1]);
        transform = `translate(${-50 + slideProgress * 20}%, -50%)`;
        opacity = 1 - slideProgress;
      }
      break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${overlay.position.x}%`,
        top: `${overlay.position.y}%`,
        transform,
        opacity,
        fontSize: overlay.style.fontSize,
        fontWeight: overlay.style.fontWeight,
        color: overlay.style.color,
        backgroundColor: overlay.style.backgroundColor,
        padding: overlay.style.backgroundColor ? '0.3em 0.6em' : 0,
        borderRadius: overlay.style.backgroundColor ? 8 : 0,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        whiteSpace: 'nowrap',
      }}
    >
      {overlay.text}
    </div>
  );
};

// Music with fade in/out
const MusicWithFade: React.FC<{
  src: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  duration: number;
  fps: number;
}> = ({ src, volume, fadeIn, fadeOut, duration, fps }) => {
  const frame = useCurrentFrame();
  const totalFrames = duration * fps;
  const fadeInFrames = fadeIn * fps;
  const fadeOutFrames = fadeOut * fps;

  let currentVolume = volume;

  if (frame < fadeInFrames) {
    currentVolume = interpolate(frame, [0, fadeInFrames], [0, volume]);
  } else if (frame > totalFrames - fadeOutFrames) {
    currentVolume = interpolate(
      frame,
      [totalFrames - fadeOutFrames, totalFrames],
      [volume, 0]
    );
  }

  return <Audio src={src} volume={currentVolume} />;
};

export default CinematicVideo;
