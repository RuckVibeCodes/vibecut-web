import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from 'remotion';

export interface ImpactTitleProps {
  text: string;
  /** Frame when the animation starts */
  startFrame?: number;
  /** Duration of the slam animation in frames */
  slamDuration?: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Text color */
  color?: string;
  /** Shadow color for depth */
  shadowColor?: string;
  /** Whether to add a screen shake effect */
  shake?: boolean;
  /** Font family */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: number;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * ImpactTitle - Text that slams in with dramatic scale animation
 * 
 * Creates a cinematic "slam" effect where text starts huge and
 * rapidly scales down to its final size with optional screen shake
 */
export const ImpactTitle: React.FC<ImpactTitleProps> = ({
  text,
  startFrame = 0,
  slamDuration = 10,
  fontSize = 120,
  color = '#FFFFFF',
  shadowColor = 'rgba(0,0,0,0.5)',
  shake = true,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 900,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  
  // Don't render before start
  if (relativeFrame < 0) return null;
  
  // Spring for the main slam effect
  const slamProgress = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  // Scale from huge (3x) to normal (1x)
  const scale = interpolate(
    slamProgress,
    [0, 1],
    [3, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Opacity: fade in during slam
  const opacity = interpolate(
    relativeFrame,
    [0, slamDuration * 0.3],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Screen shake effect (only during and slightly after slam)
  let shakeX = 0;
  let shakeY = 0;
  
  if (shake && relativeFrame < slamDuration * 1.5) {
    const shakeIntensity = interpolate(
      relativeFrame,
      [0, slamDuration * 0.5, slamDuration * 1.5],
      [0, 15, 0],
      { extrapolateRight: 'clamp' }
    );
    
    // Use sin/cos for organic shake movement
    shakeX = Math.sin(relativeFrame * 2.5) * shakeIntensity;
    shakeY = Math.cos(relativeFrame * 3.2) * shakeIntensity;
  }
  
  // Text shadow that grows with impact
  const shadowBlur = interpolate(
    relativeFrame,
    [0, slamDuration * 0.5, slamDuration],
    [50, 20, 10],
    { extrapolateRight: 'clamp' }
  );
  
  const shadowOffsetY = interpolate(
    relativeFrame,
    [0, slamDuration],
    [20, 5],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        <span
          style={{
            fontSize,
            fontFamily,
            fontWeight,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textShadow: `
              0 ${shadowOffsetY}px ${shadowBlur}px ${shadowColor},
              0 0 ${shadowBlur * 2}px ${shadowColor}
            `,
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: '90%',
            ...style,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default ImpactTitle;
