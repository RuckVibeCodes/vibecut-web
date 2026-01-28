'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Player, PlayerRef } from '@remotion/player';
import { CaptionStylePicker } from '@/components/CaptionStylePicker';
import { ExportPresets } from '@/components/ExportPresets';
import { AssetManager } from '@/components/AssetManager';
import { 
  AspectRatio, 
  CaptionStyleId, 
  Transcript, 
  ASPECT_RATIOS,
  CAPTION_STYLES 
} from '@/lib/types';

// Text overlay type
interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: number;
  startTime: number;
  endTime: number;
}

// Timeline clip type
interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  track: number;
  color: string;
  data?: unknown;
}

// Preview composition
const PreviewComposition: React.FC<{
  transcript?: Transcript;
  captionStyle: CaptionStyleId;
  textOverlays: TextOverlay[];
  currentTime: number;
  videoUrl?: string;
}> = ({ transcript, captionStyle, textOverlays, currentTime, videoUrl }) => {
  const style = CAPTION_STYLES.find(s => s.id === captionStyle) || CAPTION_STYLES[0];
  
  const getCurrentCaption = () => {
    if (!transcript?.words) return '';
    const wordsPerLine = style.config.wordsPerLine;
    const currentWords: string[] = [];
    
    for (const word of transcript.words) {
      if (word.start <= currentTime && word.end >= currentTime - 2) {
        currentWords.push(word.punctuated_word || word.word);
        if (currentWords.length >= wordsPerLine) break;
      }
    }
    return currentWords.join(' ');
  };

  const visibleOverlays = textOverlays.filter(
    o => currentTime >= o.startTime && currentTime <= o.endTime
  );

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {/* Video background */}
      {videoUrl ? (
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <span className="text-white/20 text-lg">Preview</span>
        </div>
      )}
      
      {/* Text overlays */}
      {visibleOverlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute pointer-events-none"
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p
            style={{
              fontSize: overlay.fontSize,
              color: overlay.color,
              fontWeight: overlay.fontWeight,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {overlay.text}
          </p>
        </div>
      ))}

      {/* Captions */}
      {transcript && (
        <div 
          className={`absolute left-0 right-0 px-4 ${
            style.config.position === 'top' ? 'top-8' :
            style.config.position === 'center' ? 'top-1/2 -translate-y-1/2' :
            'bottom-16'
          }`}
        >
          <p
            className="text-center"
            style={{
              fontSize: style.config.fontSize * 0.6,
              fontWeight: style.config.fontWeight,
              color: style.config.color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {getCurrentCaption()}
          </p>
        </div>
      )}
    </div>
  );
};

export default function EditorPage() {
  // State
  const [activePanel, setActivePanel] = useState<'clips' | 'text' | 'stickers' | 'effects' | 'audio' | 'captions' | 'export' | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16'); // TikTok default
  const [captionStyle, setCaptionStyle] = useState<CaptionStyleId>('tiktok-bounce');
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ratioConfig = ASPECT_RATIOS[aspectRatio];

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    
    // Create video URL for preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Get video duration
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      
      // Add to timeline
      const clip: TimelineClip = {
        id: `clip-${Date.now()}`,
        type: 'video',
        name: file.name,
        startTime: 0,
        duration: video.duration,
        track: 0,
        color: '#6366f1',
      };
      setTimelineClips([clip]);
    };
    
    // Auto-transcribe
    setIsTranscribing(true);
    try {
      const stored = localStorage.getItem('vibecut-api-keys');
      if (stored) {
        const keys = JSON.parse(stored);
        const apiKey = keys.deepgram || keys.openai;
        const provider = keys.deepgram ? 'deepgram' : 'openai';
        
        if (apiKey) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('apiKey', apiKey);
          formData.append('provider', provider);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setTranscript(data.transcript);
          }
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // Add text overlay
  const addTextOverlay = useCallback(() => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Tap to edit',
      x: 50,
      y: 30,
      fontSize: 48,
      color: '#ffffff',
      fontWeight: 700,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    
    // Add to timeline
    const clip: TimelineClip = {
      id: newOverlay.id,
      type: 'text',
      name: 'Text',
      startTime: newOverlay.startTime,
      duration: newOverlay.endTime - newOverlay.startTime,
      track: 1,
      color: '#ec4899',
      data: newOverlay,
    };
    setTimelineClips(prev => [...prev, clip]);
  }, [currentTime, duration]);

  // Timeline scrubbing
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
  }, [duration]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick action buttons (TikTok style)
  const quickActions = [
    { id: 'clips', icon: '🎬', label: 'Clips' },
    { id: 'text', icon: 'Aa', label: 'Text' },
    { id: 'stickers', icon: '😀', label: 'Stickers' },
    { id: 'effects', icon: '✨', label: 'Effects' },
    { id: 'audio', icon: '🎵', label: 'Audio' },
    { id: 'captions', icon: '💬', label: 'Captions' },
  ];

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden touch-manipulation">
      {/* Top bar */}
      <header className="h-12 md:h-14 bg-black border-b border-white/10 flex items-center justify-between px-3 md:px-4 shrink-0 safe-area-inset-top">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            ←
          </Link>
          <span className="text-white font-medium text-sm truncate max-w-[120px] md:max-w-none">
            {uploadedFile?.name || 'New Project'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Aspect ratio toggle - hidden on mobile, show in panel */}
          <div className="hidden md:flex bg-white/10 rounded-lg p-1">
            {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  aspectRatio === ratio
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setActivePanel('export')}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-pink-500 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-pink-600 transition"
          >
            Export
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center bg-black p-2 md:p-4 relative">
          <div 
            className="relative bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            style={{
              width: isMobile 
                ? (aspectRatio === '9:16' ? '200px' : aspectRatio === '1:1' ? '280px' : '320px')
                : (aspectRatio === '9:16' ? '300px' : aspectRatio === '1:1' ? '400px' : '500px'),
              height: isMobile
                ? (aspectRatio === '9:16' ? '356px' : aspectRatio === '1:1' ? '280px' : '180px')
                : (aspectRatio === '9:16' ? '533px' : aspectRatio === '1:1' ? '400px' : '281px'),
            }}
          >
            {/* Phone frame for vertical videos */}
            {aspectRatio === '9:16' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full z-10" />
            )}
            
            {uploadedFile ? (
              <Player
                ref={playerRef}
                component={PreviewComposition}
                inputProps={{
                  transcript: transcript || undefined,
                  captionStyle,
                  textOverlays,
                  currentTime,
                  videoUrl: videoUrl || undefined,
                }}
                durationInFrames={Math.max(60, duration * 60)}
                fps={60}
                compositionWidth={ratioConfig.width}
                compositionHeight={ratioConfig.height}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-5xl mb-3">📹</div>
                <p className="text-white/70 text-sm">Add video</p>
              </div>
            )}

            {/* Transcribing overlay */}
            {isTranscribing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2 animate-pulse">🎙️</div>
                  <p className="text-white text-sm">Generating captions...</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions - Right side on desktop, floating on mobile */}
          <div className={`${
            isMobile 
              ? 'absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1' 
              : 'ml-4 flex flex-col gap-2'
          }`}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'text') {
                    addTextOverlay();
                  } else {
                    setActivePanel(activePanel === action.id ? null : action.id as typeof activePanel);
                  }
                }}
                className={`${
                  isMobile ? 'w-10 h-10' : 'w-14 h-14'
                } rounded-xl flex flex-col items-center justify-center transition ${
                  activePanel === action.id
                    ? 'bg-white text-black'
                    : 'bg-black/60 backdrop-blur text-white hover:bg-white/20'
                }`}
              >
                <span className={isMobile ? 'text-base' : 'text-lg'}>{action.icon}</span>
                {!isMobile && <span className="text-[10px] mt-0.5">{action.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel (desktop) / Bottom sheet (mobile) */}
        {activePanel && (
          <div className={`${
            isMobile 
              ? 'fixed inset-x-0 bottom-0 max-h-[70vh] rounded-t-3xl z-50' 
              : 'w-80 border-l border-white/10'
          } bg-gray-900 overflow-y-auto`}>
            {/* Drag handle for mobile */}
            {isMobile && (
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>
            )}
            <div className="p-4 relative">
              {/* Close button */}
              <button
                onClick={() => setActivePanel(null)}
                className="absolute top-2 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white bg-white/10 rounded-full"
              >
                ✕
              </button>

              {activePanel === 'clips' && (
                <AssetManager onSelectAsset={(asset) => console.log('Selected:', asset)} />
              )}
              
              {activePanel === 'captions' && (
                <CaptionStylePicker selected={captionStyle} onSelect={setCaptionStyle} />
              )}
              
              {activePanel === 'export' && (
                <ExportPresets selected={aspectRatio} onSelect={setAspectRatio} />
              )}

              {activePanel === 'stickers' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Stickers</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['😀', '🔥', '💯', '❤️', '👍', '🎉', '⭐', '💪', '🚀', '💡', '✅', '🎯'].map((emoji) => (
                      <button
                        key={emoji}
                        className="w-12 h-12 bg-white/10 rounded-lg text-2xl hover:bg-white/20 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'effects' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Effects</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Blur', icon: '🌫️' },
                      { name: 'Zoom', icon: '🔍' },
                      { name: 'Shake', icon: '📳' },
                      { name: 'Flash', icon: '⚡' },
                      { name: 'Glitch', icon: '📺' },
                      { name: 'VHS', icon: '📼' },
                    ].map((effect) => (
                      <button
                        key={effect.name}
                        className="p-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition"
                      >
                        <span className="text-xl">{effect.icon}</span>
                        <p className="text-white text-sm mt-1">{effect.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'audio' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Audio</h3>
                  <div className="space-y-2">
                    <button className="w-full p-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition flex items-center gap-3">
                      <span className="text-xl">🎵</span>
                      <div>
                        <p className="text-white text-sm">Add Music</p>
                        <p className="text-white/50 text-xs">From library</p>
                      </div>
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition flex items-center gap-3">
                      <span className="text-xl">🎤</span>
                      <div>
                        <p className="text-white text-sm">Voiceover</p>
                        <p className="text-white/50 text-xs">Record or AI voice</p>
                      </div>
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition flex items-center gap-3">
                      <span className="text-xl">🔊</span>
                      <div>
                        <p className="text-white text-sm">Sound Effects</p>
                        <p className="text-white/50 text-xs">AI generated</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom timeline */}
      <div className={`${isMobile ? 'h-32' : 'h-44'} bg-gray-900 border-t border-white/10 shrink-0 safe-area-inset-bottom`}>
        {/* Playback controls */}
        <div className="h-10 md:h-12 flex items-center justify-center gap-3 md:gap-4 border-b border-white/10">
          <button className="text-white/60 hover:text-white text-sm md:text-base">
            ⏮️
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-black"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button className="text-white/60 hover:text-white text-sm md:text-base">
            ⏭️
          </button>
          <span className="text-white/60 text-xs md:text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Timeline scrubber */}
        <div 
          ref={timelineRef}
          className="h-6 md:h-8 mx-2 md:mx-4 mt-1 md:mt-2 relative cursor-pointer touch-none"
          onClick={handleTimelineClick}
          onTouchMove={(e) => {
            if (!timelineRef.current) return;
            const touch = e.touches[0];
            const rect = timelineRef.current.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            setCurrentTime(percent * duration);
          }}
        >
          {/* Time markers */}
          <div className="absolute inset-0 flex justify-between text-white/30 text-xs">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>{formatTime((duration / 5) * i)}</span>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-white/20 rounded">
            <div 
              className="h-full bg-pink-500 rounded"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-2 w-0.5 h-6 bg-white"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Timeline tracks */}
        <div className="mx-2 md:mx-4 mt-1 md:mt-2 space-y-1 overflow-x-auto">
          {/* Video track */}
          <div className="h-8 md:h-10 bg-white/5 rounded relative">
            {timelineClips
              .filter(c => c.track === 0)
              .map((clip) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip.id)}
                  className={`absolute top-1 bottom-1 rounded cursor-pointer transition ${
                    selectedClip === clip.id ? 'ring-2 ring-white' : ''
                  }`}
                  style={{
                    left: `${(clip.startTime / duration) * 100}%`,
                    width: `${(clip.duration / duration) * 100}%`,
                    backgroundColor: clip.color,
                  }}
                >
                  <span className="text-white text-xs px-2 truncate block">
                    {clip.name}
                  </span>
                </div>
              ))}
          </div>
          
          {/* Text/overlay track */}
          <div className={`${isMobile ? 'h-6' : 'h-8'} bg-white/5 rounded relative`}>
            {timelineClips
              .filter(c => c.track === 1)
              .map((clip) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip.id)}
                  className={`absolute top-1 bottom-1 rounded cursor-pointer transition ${
                    selectedClip === clip.id ? 'ring-2 ring-white' : ''
                  }`}
                  style={{
                    left: `${(clip.startTime / duration) * 100}%`,
                    width: `${(clip.duration / duration) * 100}%`,
                    backgroundColor: clip.color,
                  }}
                >
                  <span className="text-white text-[10px] px-1 truncate block">
                    {clip.name}
                  </span>
                </div>
              ))}
          </div>

          {/* Audio track */}
          <div className={`${isMobile ? 'hidden' : 'h-8'} bg-white/5 rounded relative`}>
            {timelineClips
              .filter(c => c.track === 2)
              .map((clip) => (
                <div
                  key={clip.id}
                  className="absolute top-1 bottom-1 rounded"
                  style={{
                    left: `${(clip.startTime / duration) * 100}%`,
                    width: `${(clip.duration / duration) * 100}%`,
                    backgroundColor: clip.color,
                  }}
                >
                  <span className="text-white text-[10px] px-1">{clip.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
