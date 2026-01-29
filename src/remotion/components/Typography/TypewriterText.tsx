import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export interface TypewriterTextProps {
  text: string;
  /** Frame when typing starts */
  startFrame?: number;
  /** Characters per second */
  speed?: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Text color */
  color?: string;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Cursor character */
  cursor?: string;
  /** Cursor blink rate (blinks per second) */
  cursorBlinkRate?: number;
  /** Font family */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: number;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Vertical alignment */
  verticalAlign?: 'top' | 'center' | 'bottom';
  /** Horizontal padding */
  paddingX?: number;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * TypewriterText - Text that types itself character by character
 * 
 * Creates a classic typewriter effect with optional blinking cursor
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  speed = 15, // characters per second
  fontSize = 48,
  color = '#FFFFFF',
  showCursor = true,
  cursor = '|',
  cursorBlinkRate = 2,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 500,
  textAlign = 'left',
  verticalAlign = 'center',
  paddingX = 60,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  
  // Don't render before start
  if (relativeFrame < 0) return null;
  
  // Calculate how many characters to show
  const secondsElapsed = relativeFrame / fps;
  const charsToShow = Math.min(
    Math.floor(secondsElapsed * speed),
    text.length
  );
  
  const visibleText = text.slice(0, charsToShow);
  const isTypingComplete = charsToShow >= text.length;
  
  // Cursor blink: visible when sin wave is positive
  const cursorOpacity = isTypingComplete
    ? (Math.sin(relativeFrame * (cursorBlinkRate * Math.PI * 2) / fps) > 0 ? 1 : 0)
    : 1; // Always visible while typing
  
  // Vertical alignment
  const alignItems = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  }[verticalAlign];
  
  // Justify content based on text alignment
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[textAlign];
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems,
        justifyContent,
        padding: `60px ${paddingX}px`,
      }}
    >
      <div
        style={{
          fontSize,
          fontFamily,
          fontWeight,
          color,
          whiteSpace: 'pre-wrap',
          textAlign,
          lineHeight: 1.4,
          ...style,
        }}
      >
        {visibleText}
        {showCursor && (
          <span
            style={{
              opacity: cursorOpacity,
              color,
              marginLeft: 2,
            }}
          >
            {cursor}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * TypewriterTextMultiline - Type multiple lines with delays between them
 */
export interface TypewriterTextMultilineProps {
  lines: string[];
  /** Frame when typing starts */
  startFrame?: number;
  /** Characters per second */
  speed?: number;
  /** Delay between lines in frames */
  lineDelay?: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Text color */
  color?: string;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Font family */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: number;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

export const TypewriterTextMultiline: React.FC<TypewriterTextMultilineProps> = ({
  lines,
  startFrame = 0,
  speed = 15,
  lineDelay = 15,
  fontSize = 48,
  color = '#FFFFFF',
  showCursor = true,
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 500,
  textAlign = 'left',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const relativeFrame = frame - startFrame;
  if (relativeFrame < 0) return null;
  
  // Calculate visible text for each line
  const renderedLines: { text: string; showCursor: boolean }[] = [];
  let currentFrame = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTypeDuration = (line.length / speed) * fps;
    
    if (relativeFrame < currentFrame) {
      // Haven't reached this line yet
      break;
    }
    
    const lineRelativeFrame = relativeFrame - currentFrame;
    const secondsElapsed = lineRelativeFrame / fps;
    const charsToShow = Math.min(Math.floor(secondsElapsed * speed), line.length);
    const visibleText = line.slice(0, charsToShow);
    const lineComplete = charsToShow >= line.length;
    
    renderedLines.push({
      text: visibleText,
      showCursor: showCursor && i === renderedLines.length && !lineComplete,
    });
    
    if (!lineComplete) break;
    
    currentFrame += lineTypeDuration + lineDelay;
  }
  
  const isAllComplete = renderedLines.length === lines.length && 
    renderedLines[renderedLines.length - 1]?.text === lines[lines.length - 1];
  
  // Cursor blink when complete
  const cursorOpacity = isAllComplete
    ? (Math.sin(relativeFrame * 4 * Math.PI / fps) > 0 ? 1 : 0)
    : 1;
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}
    >
      <div
        style={{
          fontSize,
          fontFamily,
          fontWeight,
          color,
          textAlign,
          lineHeight: 1.6,
          ...style,
        }}
      >
        {renderedLines.map((line, i) => (
          <div key={i}>
            {line.text}
            {line.showCursor && (
              <span style={{ opacity: cursorOpacity }}>|</span>
            )}
            {!line.showCursor && i === renderedLines.length - 1 && isAllComplete && showCursor && (
              <span style={{ opacity: cursorOpacity }}>|</span>
            )}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default TypewriterText;
