// DynamicCamera.tsx
// Applies keyframed camera movements (zoom, pan, drift) to video content

import React, { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export interface CameraKeyframe {
  frame: number;
  scale: number;
  x: number;
  y: number;
  rotation?: number;
  easing?: (t: number) => number;
}

export interface DynamicCameraProps {
  children: ReactNode;
  keyframes: CameraKeyframe[];
  smoothness?: number;
}

const defaultKeyframes: CameraKeyframe[] = [
  { frame: 0, scale: 1, x: 0, y: 0, rotation: 0 },
];

export const DynamicCamera: React.FC<DynamicCameraProps> = ({
  children,
  keyframes = defaultKeyframes,
  smoothness = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Sort keyframes by frame
  const sortedKeyframes = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Find the surrounding keyframes
  let prevKeyframe = sortedKeyframes[0];
  let nextKeyframe = sortedKeyframes[sortedKeyframes.length - 1];

  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    if (frame >= sortedKeyframes[i].frame && frame < sortedKeyframes[i + 1].frame) {
      prevKeyframe = sortedKeyframes[i];
      nextKeyframe = sortedKeyframes[i + 1];
      break;
    }
  }

  // If we're past all keyframes, use the last one
  if (frame >= sortedKeyframes[sortedKeyframes.length - 1].frame) {
    prevKeyframe = sortedKeyframes[sortedKeyframes.length - 1];
    nextKeyframe = prevKeyframe;
  }

  // Calculate easing based on smoothness
  const getEasing = (kf: CameraKeyframe) => {
    if (kf.easing) return kf.easing;
    if (smoothness > 0.7) return Easing.bezier(0.25, 0.1, 0.25, 1);
    if (smoothness > 0.3) return Easing.inOut(Easing.ease);
    return Easing.linear;
  };

  const easing = getEasing(nextKeyframe);

  // Interpolate values
  const scale = interpolate(
    frame,
    [prevKeyframe.frame, nextKeyframe.frame],
    [prevKeyframe.scale, nextKeyframe.scale],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  const x = interpolate(
    frame,
    [prevKeyframe.frame, nextKeyframe.frame],
    [prevKeyframe.x, nextKeyframe.x],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  const y = interpolate(
    frame,
    [prevKeyframe.frame, nextKeyframe.frame],
    [prevKeyframe.y, nextKeyframe.y],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  const rotation = interpolate(
    frame,
    [prevKeyframe.frame, nextKeyframe.frame],
    [prevKeyframe.rotation ?? 0, nextKeyframe.rotation ?? 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }
  );

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${x}%, ${y}%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Pre-built camera movements
export const CameraPresets = {
  // Slow zoom in
  slowZoomIn: (durationInFrames: number): CameraKeyframe[] => [
    { frame: 0, scale: 1, x: 0, y: 0 },
    { frame: durationInFrames, scale: 1.2, x: 0, y: 0 },
  ],

  // Ken Burns effect (slow pan + zoom)
  kenBurns: (durationInFrames: number): CameraKeyframe[] => [
    { frame: 0, scale: 1, x: -5, y: -2 },
    { frame: durationInFrames, scale: 1.15, x: 5, y: 2 },
  ],

  // Dramatic zoom to center
  dramaticZoom: (durationInFrames: number): CameraKeyframe[] => [
    { frame: 0, scale: 1, x: 0, y: 0 },
    { frame: Math.floor(durationInFrames * 0.7), scale: 1, x: 0, y: 0 },
    { frame: durationInFrames, scale: 1.5, x: 0, y: 0 },
  ],

  // Subtle drift
  subtleDrift: (durationInFrames: number): CameraKeyframe[] => [
    { frame: 0, scale: 1.05, x: -2, y: 0 },
    { frame: Math.floor(durationInFrames * 0.5), scale: 1.08, x: 2, y: 1 },
    { frame: durationInFrames, scale: 1.05, x: -1, y: -1 },
  ],

  // Focus on speaker (zoom + center)
  focusSpeaker: (durationInFrames: number): CameraKeyframe[] => [
    { frame: 0, scale: 1, x: 0, y: 0 },
    { frame: 15, scale: 1.3, x: 0, y: -5 },
    { frame: durationInFrames - 15, scale: 1.3, x: 0, y: -5 },
    { frame: durationInFrames, scale: 1, x: 0, y: 0 },
  ],

  // Shake effect (for emphasis)
  shake: (startFrame: number, intensity: number = 2): CameraKeyframe[] => [
    { frame: startFrame, scale: 1, x: 0, y: 0 },
    { frame: startFrame + 2, scale: 1, x: intensity, y: -intensity },
    { frame: startFrame + 4, scale: 1, x: -intensity, y: intensity },
    { frame: startFrame + 6, scale: 1, x: intensity * 0.5, y: -intensity * 0.5 },
    { frame: startFrame + 8, scale: 1, x: 0, y: 0 },
  ],
};

// Subtle drift effect (adds life to static shots) - legacy component
export const SubtleDrift: React.FC<{
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
}> = ({ children, intensity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const time = frame / fps;
  
  // Gentle sine wave motion
  const driftX = Math.sin(time * 0.3 * speed) * 0.5 * intensity;
  const driftY = Math.cos(time * 0.2 * speed) * 0.3 * intensity;
  const driftScale = 1 + Math.sin(time * 0.1 * speed) * 0.01 * intensity;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${driftScale}) translate(${driftX}%, ${driftY}%)`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
};

export default DynamicCamera;
