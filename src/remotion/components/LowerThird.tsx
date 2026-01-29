import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from 'remotion';

export interface LowerThirdConfig {
  name: string;
  title?: string;
  subtitle?: string;
  logo?: string;
  startTime: number; // seconds
  duration: number; // seconds
  position?: 'left' | 'center' | 'right';
  style?: 'modern' | 'minimal' | 'broadcast' | 'social' | 'corporate';
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface LowerThirdProps {
  graphics: LowerThirdConfig[];
}

export const LowerThird: React.FC<LowerThirdProps> = ({ graphics }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {graphics.map((graphic, index) => {
        const startFrame = Math.round(graphic.startTime * fps);
        const durationFrames = Math.round(graphic.duration * fps);

        return (
          <Sequence
            key={`lower-third-${index}`}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <LowerThirdRenderer config={graphic} durationFrames={durationFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface LowerThirdRendererProps {
  config: LowerThirdConfig;
  durationFrames: number;
}

const LowerThirdRenderer: React.FC<LowerThirdRendererProps> = ({
  config,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const {
    name,
    title,
    subtitle,
    logo,
    position = 'left',
    style = 'modern',
    primaryColor = '#4F46E5',
    secondaryColor = '#1E1B4B',
    textColor = '#FFFFFF',
    accentColor = '#F59E0B',
  } = config;

  // Animation timing
  const animInDuration = 20;
  const animOutDuration = 15;
  const animOutStart = durationFrames - animOutDuration;

  // Entrance animation
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // Exit animation
  const exitProgress = interpolate(
    frame,
    [animOutStart, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const isExiting = frame > animOutStart;
  const animProgress = isExiting ? exitProgress : enterProgress;

  // Position calculation
  const getPositionStyle = (): React.CSSProperties => {
    const baseY = height * 0.78;
    const xOffset = position === 'left' ? 50 : position === 'right' ? width - 450 : (width - 400) / 2;
    const slideX = interpolate(animProgress, [0, 1], [position === 'right' ? 100 : -100, 0]);

    return {
      position: 'absolute',
      left: xOffset + (isExiting ? 0 : slideX),
      top: baseY,
      opacity: animProgress,
    };
  };

  // Style-specific rendering
  const renderModern = () => (
    <div
      style={{
        ...getPositionStyle(),
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 6,
          backgroundColor: accentColor,
        }}
      />

      {/* Main content */}
      <div
        style={{
          backgroundColor: secondaryColor,
          padding: '16px 24px',
          minWidth: 280,
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 28,
            fontWeight: 700,
            color: textColor,
            marginBottom: title ? 4 : 0,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              fontWeight: 500,
              color: primaryColor,
              opacity: 0.9,
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              color: textColor,
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Logo section */}
      {logo && (
        <div
          style={{
            backgroundColor: primaryColor,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={logo} alt="" style={{ height: 40, width: 'auto' }} />
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div
      style={{
        ...getPositionStyle(),
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 26,
          fontWeight: 600,
          color: textColor,
          textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        {name}
      </div>
      {title && (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 400,
            color: textColor,
            opacity: 0.8,
            textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );

  const renderBroadcast = () => {
    const barWidth = interpolate(enterProgress, [0, 1], [0, 350]);
    return (
      <div style={getPositionStyle()}>
        {/* Animated bar */}
        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: accentColor,
            marginBottom: 8,
          }}
        />
        
        {/* Name box */}
        <div
          style={{
            backgroundColor: primaryColor,
            padding: '12px 20px',
            display: 'inline-block',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              color: textColor,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {name}
          </div>
        </div>

        {/* Title box */}
        {title && (
          <div
            style={{
              backgroundColor: secondaryColor,
              padding: '8px 20px',
              marginTop: 2,
              display: 'inline-block',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: textColor,
                opacity: 0.9,
              }}
            >
              {title}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSocial = () => (
    <div
      style={{
        ...getPositionStyle(),
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        padding: '16px 24px',
        borderRadius: 50,
        border: `2px solid ${primaryColor}`,
      }}
    >
      {logo && (
        <img src={logo} alt="" style={{ height: 48, width: 48, borderRadius: 24 }} />
      )}
      <div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: textColor,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: primaryColor,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  );

  const renderCorporate = () => (
    <div
      style={{
        ...getPositionStyle(),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '20px 28px',
        borderRadius: 4,
        borderLeft: `5px solid ${primaryColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {logo && (
        <img src={logo} alt="" style={{ height: 50, width: 'auto', marginRight: 20 }} />
      )}
      <div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: secondaryColor,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: primaryColor,
              marginTop: 2,
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: '#666',
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  switch (style) {
    case 'minimal':
      return renderMinimal();
    case 'broadcast':
      return renderBroadcast();
    case 'social':
      return renderSocial();
    case 'corporate':
      return renderCorporate();
    case 'modern':
    default:
      return renderModern();
  }
};
