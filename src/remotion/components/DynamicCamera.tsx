// DynamicCamera.tsx
// Applies keyframed camera movements (zoom, pan, drift) to video content

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

interface CameraKeyframe {
  time: number;
  scale: number;
  x: number;
  y: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface DynamicCameraProps {
  children: React.ReactNode;
  keyframes: CameraKeyframe[];
  duration: number;
}

const easingMap = {
  'linear': Easing.linear,
  'ease-in': Easing.in(Easing.cubic),
  'ease-out': Easing.out(Easing.cubic),
  'ease-in-out': Easing.inOut(Easing.cubic),
};

export const DynamicCamera: React.FC<DynamicCameraProps> = ({
  children,
  keyframes,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Sort keyframes by time
  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

  // Add implicit start and end keyframes if needed
  if (sortedKeyframes.length === 0) {
    sortedKeyframes.push({ time: 0, scale: 1, x: 0, y: 0, easing: 'linear' });
    sortedKeyframes.push({ time: duration, scale: 1, x: 0, y: 0, easing: 'linear' });
  } else {
    if (sortedKeyframes[0].time > 0) {
      sortedKeyframes.unshift({ time: 0, scale: 1, x: 0, y: 0, easing: 'linear' });
    }
    if (sortedKeyframes[sortedKeyframes.length - 1].time < duration) {
      const lastKf = sortedKeyframes[sortedKeyframes.length - 1];
      sortedKeyframes.push({ 
        time: duration, 
        scale: lastKf.scale, 
        x: lastKf.x, 
        y: lastKf.y, 
        easing: 'linear' 
      });
    }
  }

  // Find current segment
  let fromIndex = 0;
  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    if (currentTime >= sortedKeyframes[i].time && currentTime < sortedKeyframes[i + 1].time) {
      fromIndex = i;
      break;
    }
    if (i === sortedKeyframes.length - 2) {
      fromIndex = i;
    }
  }

  const fromKf = sortedKeyframes[fromIndex];
  const toKf = sortedKeyframes[Math.min(fromIndex + 1, sortedKeyframes.length - 1)];

  // Calculate segment progress
  const segmentDuration = toKf.time - fromKf.time;
  const segmentProgress = segmentDuration > 0 
    ? (currentTime - fromKf.time) / segmentDuration 
    : 0;

  // Apply easing
  const easing = easingMap[toKf.easing] || Easing.linear;
  const easedProgress = easing(Math.max(0, Math.min(1, segmentProgress)));

  // Interpolate values
  const scale = interpolate(easedProgress, [0, 1], [fromKf.scale, toKf.scale]);
  const x = interpolate(easedProgress, [0, 1], [fromKf.x, toKf.x]);
  const y = interpolate(easedProgress, [0, 1], [fromKf.y, toKf.y]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
          transformOrigin: 'center center',
          transition: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Subtle drift effect (adds life to static shots)
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
