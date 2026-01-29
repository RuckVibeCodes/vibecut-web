// CinematicCaptions.tsx
// Word-by-word animated captions with multiple styles

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from 'remotion';
import { TranscriptWord, CaptionStyle, CAPTION_STYLES } from '@/lib/types';

export interface CinematicCaptionsProps {
  words: TranscriptWord[];
  styleId?: string;
  customStyle?: Partial<CaptionStyle['config']>;
  impactWords?: string[];
  maxWordsOnScreen?: number;
}

export const CinematicCaptions: React.FC<CinematicCaptionsProps> = ({
  words,
  styleId = 'tiktok-bounce',
  customStyle,
  impactWords = [],
  maxWordsOnScreen = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // Get style config
  const baseStyle = CAPTION_STYLES.find((s) => s.id === styleId)?.config ?? CAPTION_STYLES[0].config;
  const style = { ...baseStyle, ...customStyle };

  // Find current visible words
  const visibleWords = words.filter((w) => {
    return currentTime >= w.start && currentTime <= w.end + 0.5;
  });

  // Group words into lines
  const getWordsToDisplay = () => {
    if (visibleWords.length === 0) return [];

    // Find the most recent word that started
    const currentWordIndex = words.findIndex(
      (w) => currentTime >= w.start && currentTime < w.end + 0.1
    );

    if (currentWordIndex === -1) return [];

    // Get surrounding words for context
    const startIndex = Math.max(0, currentWordIndex - Math.floor(maxWordsOnScreen / 2));
    const endIndex = Math.min(words.length, startIndex + maxWordsOnScreen);

    return words.slice(startIndex, endIndex).map((word, i) => ({
      ...word,
      isActive: currentTime >= word.start && currentTime < word.end + 0.1,
      index: startIndex + i,
    }));
  };

  const displayWords = getWordsToDisplay();

  // Position based on style
  const getPositionStyle = () => {
    switch (style.position) {
      case 'top':
        return { top: height * 0.1 };
      case 'center':
        return { top: height * 0.45 };
      case 'bottom':
      default:
        return { top: height * 0.75 };
    }
  };

  // Animation for each word
  const getWordAnimation = (word: TranscriptWord & { isActive: boolean }, index: number) => {
    const wordStartFrame = word.start * fps;
    const wordEndFrame = word.end * fps;
    const isImpact = impactWords.some((iw) => word.word.toLowerCase().includes(iw.toLowerCase()));

    switch (style.animation) {
      case 'bounce': {
        const bounceProgress = spring({
          frame: frame - wordStartFrame,
          fps,
          config: {
            damping: 12,
            stiffness: 200,
            mass: 0.5,
          },
        });
        const scale = interpolate(bounceProgress, [0, 1], [0.3, isImpact ? 1.3 : 1]);
        const y = interpolate(bounceProgress, [0, 1], [30, 0]);
        return {
          transform: `scale(${scale}) translateY(${y}px)`,
          opacity: bounceProgress,
        };
      }

      case 'pop': {
        const popProgress = spring({
          frame: frame - wordStartFrame,
          fps,
          config: {
            damping: 8,
            stiffness: 300,
            mass: 0.4,
          },
        });
        const scale = interpolate(popProgress, [0, 0.5, 1], [0, 1.4, isImpact ? 1.2 : 1]);
        return {
          transform: `scale(${scale})`,
          opacity: popProgress,
        };
      }

      case 'slide': {
        const slideProgress = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + 10],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        );
        const x = interpolate(slideProgress, [0, 1], [50, 0]);
        return {
          transform: `translateX(${x}px)`,
          opacity: slideProgress,
        };
      }

      case 'fade': {
        const fadeIn = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + 8],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return { opacity: fadeIn };
      }

      case 'typewriter': {
        const charProgress = interpolate(
          frame,
          [wordStartFrame, wordEndFrame],
          [0, word.word.length],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return {
          clipPath: `inset(0 ${100 - (charProgress / word.word.length) * 100}% 0 0)`,
        };
      }

      case 'glow': {
        const glowPulse = Math.sin((frame - wordStartFrame) * 0.3) * 0.5 + 0.5;
        const glowIntensity = word.isActive ? 20 + glowPulse * 10 : 5;
        return {
          textShadow: `0 0 ${glowIntensity}px ${style.color}, 0 0 ${glowIntensity * 2}px ${style.color}`,
        };
      }

      default:
        return {};
    }
  };

  // Get word color
  const getWordColor = (word: TranscriptWord & { isActive: boolean }) => {
    const isImpact = impactWords.some((iw) => word.word.toLowerCase().includes(iw.toLowerCase()));
    if (isImpact) return '#ff4444';
    if (style.highlightCurrentWord && word.isActive) return style.highlightColor ?? '#ffff00';
    return style.color;
  };

  if (displayWords.length === 0) return null;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...getPositionStyle(),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.3em',
            padding: '0.5em 1em',
            borderRadius: '0.5em',
            backgroundColor: style.backgroundColor ?? 'transparent',
            maxWidth: width * 0.9,
          }}
        >
          {displayWords.map((word, i) => (
            <span
              key={`${word.word}-${word.start}`}
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                color: getWordColor(word),
                WebkitTextStroke: style.outline ? `2px ${style.outlineColor ?? '#000'}` : undefined,
                textShadow: style.shadow ? '3px 3px 6px rgba(0,0,0,0.8)' : undefined,
                display: 'inline-block',
                ...getWordAnimation(word, i),
              }}
            >
              {word.punctuated_word ?? word.word}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Export helper to create captions from a transcript
export const createCaptionsFromTranscript = (
  transcript: { words: TranscriptWord[] },
  options?: Partial<CinematicCaptionsProps>
): CinematicCaptionsProps => ({
  words: transcript.words,
  ...options,
});

export default CinematicCaptions;
