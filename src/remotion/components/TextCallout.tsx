import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Easing,
} from 'remotion';

export interface TextCalloutConfig {
  text: string;
  startTime: number; // seconds
  duration: number; // seconds
  style?: 'slam' | 'typewriter' | 'glitch' | 'bounce' | 'zoom' | 'reveal' | 'neon' | 'fire';
  position?: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  rotation?: number;
  shake?: boolean;
}

export interface TextCalloutProps {
  callouts: TextCalloutConfig[];
}

export const TextCallout: React.FC<TextCalloutProps> = ({ callouts }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {callouts.map((callout, index) => {
        const startFrame = Math.round(callout.startTime * fps);
        const durationFrames = Math.round(callout.duration * fps);

        return (
          <Sequence
            key={`callout-${index}`}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <CalloutRenderer config={callout} durationFrames={durationFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface CalloutRendererProps {
  config: TextCalloutConfig;
  durationFrames: number;
}

const CalloutRenderer: React.FC<CalloutRendererProps> = ({ config, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const {
    text,
    style = 'slam',
    position = 'center',
    fontSize = 80,
    fontWeight = 900,
    fontFamily = 'Impact, sans-serif',
    color = '#FFFFFF',
    backgroundColor,
    rotation = 0,
    shake = false,
  } = config;

  // Get position coordinates
  const getPositionStyle = (): React.CSSProperties => {
    const positions: Record<string, React.CSSProperties> = {
      center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      top: { top: '15%', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top: '85%', left: '50%', transform: 'translate(-50%, -100%)' },
      'top-left': { top: '15%', left: '10%' },
      'top-right': { top: '15%', right: '10%', textAlign: 'right' as const },
      'bottom-left': { top: '85%', left: '10%', transform: 'translateY(-100%)' },
      'bottom-right': { top: '85%', right: '10%', textAlign: 'right' as const, transform: 'translateY(-100%)' },
    };
    return positions[position] || positions.center;
  };

  // Shake effect
  const getShakeTransform = () => {
    if (!shake) return '';
    const shakeX = Math.sin(frame * 0.8) * 3;
    const shakeY = Math.cos(frame * 0.9) * 2;
    return `translate(${shakeX}px, ${shakeY}px)`;
  };

  // Exit animation
  const exitStart = durationFrames - 10;
  const exitProgress = interpolate(frame, [exitStart, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Style-specific animations
  const renderSlam = () => {
    const slamProgress = spring({
      frame,
      fps,
      config: { damping: 8, stiffness: 300, mass: 0.6 },
    });

    const scale = interpolate(slamProgress, [0, 0.5, 1], [5, 0.9, 1]);
    const opacity = interpolate(slamProgress, [0, 0.3, 1], [0, 1, 1]) * exitProgress;
    const blur = interpolate(slamProgress, [0, 0.5, 1], [20, 2, 0]);

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          transform: `${getPositionStyle().transform ?? ''} scale(${scale}) rotate(${rotation}deg) ${getShakeTransform()}`,
          opacity,
          filter: `blur(${blur}px)`,
          fontFamily,
          fontSize,
          fontWeight,
          color,
          backgroundColor,
          padding: backgroundColor ? '20px 40px' : 0,
          textShadow: '4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000',
          WebkitTextStroke: '3px black',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    );
  };

  const renderTypewriter = () => {
    const charsToShow = interpolate(frame, [0, 30], [0, text.length], {
      extrapolateRight: 'clamp',
    });
    const displayText = text.slice(0, Math.floor(charsToShow));
    const cursorOpacity = Math.sin(frame * 0.5) > 0 ? 1 : 0;

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          opacity: exitProgress,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: fontSize * 0.8,
          fontWeight: 600,
          color,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '20px 30px',
          borderRadius: 8,
        }}
      >
        {displayText}
        <span style={{ opacity: cursorOpacity }}>|</span>
      </div>
    );
  };

  const renderGlitch = () => {
    const glitchOffset = Math.random() > 0.9 ? (Math.random() - 0.5) * 10 : 0;
    const rgbShift = Math.random() > 0.85;

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          opacity: exitProgress,
          fontFamily,
          fontSize,
          fontWeight,
          color,
          textShadow: rgbShift
            ? `4px 0 #ff0000, -4px 0 #00ffff, 0 4px #ff00ff`
            : '2px 2px 0 #000',
          transform: `${getPositionStyle().transform ?? ''} translate(${glitchOffset}px, 0)`,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    );
  };

  const renderBounce = () => {
    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          display: 'flex',
          gap: '0.1em',
          opacity: exitProgress,
        }}
      >
        {text.split('').map((char, i) => {
          const delay = i * 2;
          const bounceProgress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, stiffness: 200, mass: 0.5 },
          });
          const y = interpolate(bounceProgress, [0, 1], [100, 0]);
          const scale = interpolate(bounceProgress, [0, 0.5, 1], [0.5, 1.2, 1]);

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily,
                fontSize,
                fontWeight,
                color,
                textShadow: '3px 3px 0 #000',
                transform: `translateY(${y}px) scale(${scale})`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
    );
  };

  const renderZoom = () => {
    const zoomProgress = spring({
      frame,
      fps,
      config: { damping: 15, stiffness: 100 },
    });
    const scale = interpolate(zoomProgress, [0, 1], [0, 1]) * exitProgress;
    const rotate = interpolate(zoomProgress, [0, 1], [-10, rotation]);

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          transform: `${getPositionStyle().transform ?? ''} scale(${scale}) rotate(${rotate}deg)`,
          fontFamily,
          fontSize,
          fontWeight,
          color,
          textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    );
  };

  const renderReveal = () => {
    const revealProgress = interpolate(frame, [0, 20], [0, 100], {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          overflow: 'hidden',
          opacity: exitProgress,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize,
            fontWeight,
            color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            clipPath: `inset(0 ${100 - revealProgress}% 0 0)`,
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  const renderNeon = () => {
    const pulseIntensity = Math.sin(frame * 0.3) * 0.3 + 0.7;
    const glowSize = 20 + pulseIntensity * 15;

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          fontFamily: 'Inter, sans-serif',
          fontSize,
          fontWeight: 700,
          color: color,
          textShadow: `
            0 0 ${glowSize * 0.5}px ${color},
            0 0 ${glowSize}px ${color},
            0 0 ${glowSize * 1.5}px ${color},
            0 0 ${glowSize * 2}px ${color}
          `,
          opacity: exitProgress,
        }}
      >
        {text}
      </div>
    );
  };

  const renderFire = () => {
    const flicker = 0.9 + Math.random() * 0.2;

    return (
      <div
        style={{
          ...getPositionStyle(),
          position: 'absolute',
          fontFamily,
          fontSize,
          fontWeight,
          color: '#FFD700',
          textShadow: `
            0 0 10px #FF6600,
            0 0 20px #FF3300,
            0 0 30px #FF0000,
            0 -10px 40px #FF6600
          `,
          opacity: exitProgress * flicker,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    );
  };

  switch (style) {
    case 'typewriter':
      return renderTypewriter();
    case 'glitch':
      return renderGlitch();
    case 'bounce':
      return renderBounce();
    case 'zoom':
      return renderZoom();
    case 'reveal':
      return renderReveal();
    case 'neon':
      return renderNeon();
    case 'fire':
      return renderFire();
    case 'slam':
    default:
      return renderSlam();
  }
};

// Helper to create common callout patterns
export const CalloutPresets = {
  impactText: (text: string, startTime: number): TextCalloutConfig => ({
    text,
    startTime,
    duration: 2,
    style: 'slam',
    color: '#FFFF00',
    shake: true,
  }),

  keyPoint: (text: string, startTime: number): TextCalloutConfig => ({
    text,
    startTime,
    duration: 3,
    style: 'reveal',
    position: 'bottom',
    fontSize: 48,
    color: '#FFFFFF',
  }),

  emphasis: (text: string, startTime: number): TextCalloutConfig => ({
    text,
    startTime,
    duration: 1.5,
    style: 'bounce',
    color: '#FF4444',
  }),
};
