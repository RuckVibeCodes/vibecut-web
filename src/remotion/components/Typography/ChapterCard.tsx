import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';

export interface ChapterCardProps {
  /** Chapter number (displayed prominently) */
  number: number | string;
  /** Chapter title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Frame when animation starts */
  startFrame?: number;
  /** Duration of the reveal animation in frames */
  animationDuration?: number;
  /** Primary color (for number and accents) */
  primaryColor?: string;
  /** Text color */
  textColor?: string;
  /** Background color/style */
  backgroundColor?: string;
  /** Show decorative line */
  showLine?: boolean;
  /** Number font size */
  numberSize?: number;
  /** Title font size */
  titleSize?: number;
  /** Subtitle font size */
  subtitleSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Variant style */
  variant?: 'default' | 'minimal' | 'bold' | 'cinematic';
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * ChapterCard - Section divider with number and title
 * 
 * Creates a stylish chapter/section transition card with
 * animated reveal effects
 */
export const ChapterCard: React.FC<ChapterCardProps> = ({
  number,
  title,
  subtitle,
  startFrame = 0,
  animationDuration = 30,
  primaryColor = '#FF6B35',
  textColor = '#FFFFFF',
  backgroundColor = 'rgba(0, 0, 0, 0.85)',
  showLine = true,
  numberSize = 180,
  titleSize = 64,
  subtitleSize = 28,
  fontFamily = 'Inter, system-ui, sans-serif',
  variant = 'default',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;
  
  // Animation progress
  const progress = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  });
  
  // Staggered animations
  const numberProgress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  
  const titleProgress = spring({
    frame: Math.max(0, relativeFrame - 5),
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  
  const subtitleProgress = spring({
    frame: Math.max(0, relativeFrame - 10),
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  
  const lineProgress = interpolate(
    relativeFrame,
    [5, animationDuration * 0.7],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Background fade
  const bgOpacity = interpolate(
    relativeFrame,
    [0, 10],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Number animation (slide up + scale)
  const numberY = interpolate(numberProgress, [0, 1], [60, 0]);
  const numberScale = interpolate(numberProgress, [0, 1], [0.8, 1]);
  const numberOpacity = interpolate(numberProgress, [0, 1], [0, 1]);
  
  // Title animation (slide up)
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  
  // Subtitle animation
  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  
  // Variant-specific styles
  const variantStyles = {
    default: {},
    minimal: {
      numberSize: numberSize * 0.7,
      showLine: false,
    },
    bold: {
      numberSize: numberSize * 1.2,
      titleSize: titleSize * 1.1,
    },
    cinematic: {
      letterSpacing: '0.3em',
      textTransform: 'uppercase' as const,
    },
  };
  
  const activeVariant = variantStyles[variant] || {};
  const finalNumberSize = activeVariant.numberSize || numberSize;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        opacity: bgOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Chapter Number */}
        <div
          style={{
            fontSize: finalNumberSize,
            fontFamily,
            fontWeight: 900,
            color: primaryColor,
            opacity: numberOpacity,
            transform: `translateY(${numberY}px) scale(${numberScale})`,
            lineHeight: 1,
            ...(variant === 'cinematic' && { letterSpacing: '0.1em' }),
          }}
        >
          {typeof number === 'number' ? String(number).padStart(2, '0') : number}
        </div>
        
        {/* Decorative Line */}
        {showLine && activeVariant.showLine !== false && (
          <div
            style={{
              width: 120 * lineProgress,
              height: 4,
              backgroundColor: primaryColor,
              borderRadius: 2,
              marginTop: -10,
              marginBottom: 10,
            }}
          />
        )}
        
        {/* Title */}
        <div
          style={{
            fontSize: activeVariant.titleSize || titleSize,
            fontFamily,
            fontWeight: 700,
            color: textColor,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            maxWidth: '80%',
            ...(variant === 'cinematic' && {
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }),
          }}
        >
          {title}
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: subtitleSize,
              fontFamily,
              fontWeight: 400,
              color: textColor,
              opacity: subtitleOpacity * 0.7,
              transform: `translateY(${subtitleY}px)`,
              textAlign: 'center',
              maxWidth: '70%',
              ...(variant === 'cinematic' && {
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }),
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * SimpleChapter - Quick chapter marker without full card
 */
export interface SimpleChapterProps {
  number: number | string;
  title: string;
  startFrame?: number;
  color?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const SimpleChapter: React.FC<SimpleChapterProps> = ({
  number,
  title,
  startFrame = 0,
  color = '#FFFFFF',
  position = 'top-left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;
  
  const progress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 60, left: 60 },
    'top-right': { top: 60, right: 60 },
    'bottom-left': { bottom: 60, left: 60 },
    'bottom-right': { bottom: 60, right: 60 },
  };
  
  const slideDirection = position.includes('left') ? -50 : 50;
  const x = interpolate(progress, [0, 1], [slideDirection, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  
  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <span
        style={{
          fontSize: 48,
          fontWeight: 900,
          color,
          opacity: 0.5,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {typeof number === 'number' ? String(number).padStart(2, '0') : number}
      </span>
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          color,
          fontFamily: 'Inter, system-ui, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default ChapterCard;
