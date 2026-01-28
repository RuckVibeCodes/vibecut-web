'use client';

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Animation phases
  const phase1End = fps * 3;   // Intro: 0-3s
  const phase2End = fps * 7;   // Features: 3-7s
  const phase3End = fps * 10;  // CTA: 7-10s
  
  const introOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const introScale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 30 });
  
  const featuresOpacity = interpolate(frame, [phase1End, phase1End + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const ctaOpacity = interpolate(frame, [phase2End, phase2End + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Phase 1: Intro */}
      {frame < phase1End && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: introOpacity,
            transform: `scale(${introScale})`,
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>🎬</div>
          <h1
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            VibeCut
          </h1>
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 20,
            }}
          >
            AI-Powered Video Production
          </p>
        </AbsoluteFill>
      )}
      
      {/* Phase 2: Features */}
      {frame >= phase1End && frame < phase2End && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: featuresOpacity,
            padding: 60,
          }}
        >
          <h2
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 40,
            }}
          >
            What You Get
          </h2>
          <div style={{ display: 'flex', gap: 40 }}>
            <FeatureBox emoji="🎙️" text="Auto Captions" delay={0} frame={frame - phase1End} fps={fps} />
            <FeatureBox emoji="🎨" text="AI B-Roll" delay={15} frame={frame - phase1End} fps={fps} />
            <FeatureBox emoji="⚡" text="Batch Render" delay={30} frame={frame - phase1End} fps={fps} />
          </div>
        </AbsoluteFill>
      )}
      
      {/* Phase 3: CTA */}
      {frame >= phase2End && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: ctaOpacity,
          }}
        >
          <h2
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 30,
            }}
          >
            Start Creating Today
          </h2>
          <div
            style={{
              backgroundColor: 'white',
              color: '#4F46E5',
              padding: '20px 50px',
              borderRadius: 12,
              fontSize: 28,
              fontWeight: 'bold',
            }}
          >
            vibecut.dev
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

function FeatureBox({ emoji, text, delay, frame, fps }: { emoji: string; text: string; delay: number; frame: number; fps: number }) {
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [delay, delay + 20], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: '30px 40px',
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 24, color: 'white', fontWeight: 500 }}>{text}</div>
    </div>
  );
}
