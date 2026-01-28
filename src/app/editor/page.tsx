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
  const [activePanel, setActivePanel] = useState<'canvas' | 'clips' | 'text' | 'stickers' | 'effects' | 'audio' | 'captions' | 'filters' | 'speed' | 'export' | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
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
  const [speed, setSpeed] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<unknown[]>([]);
  const [redoStack, setRedoStack] = useState<unknown[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(video.duration);
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
  const handleTimelineInteraction = useCallback((clientX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setCurrentTime(percent * duration);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Aspect ratio options (InShot style)
  const aspectOptions: { ratio: AspectRatio; label: string; icon: string }[] = [
    { ratio: '9:16', label: 'TikTok', icon: '📱' },
    { ratio: '1:1', label: 'Square', icon: '⬜' },
    { ratio: '16:9', label: 'YouTube', icon: '📺' },
    { ratio: '4:5', label: 'Instagram', icon: '📸' },
  ];

  // Filter presets
  const filters = [
    { id: 'none', name: 'Original', color: 'transparent' },
    { id: 'warm', name: 'Warm', color: 'rgba(255,200,150,0.2)' },
    { id: 'cool', name: 'Cool', color: 'rgba(150,200,255,0.2)' },
    { id: 'vintage', name: 'Vintage', color: 'rgba(255,220,180,0.3)' },
    { id: 'bw', name: 'B&W', color: 'grayscale(100%)' },
    { id: 'vivid', name: 'Vivid', color: 'saturate(1.5)' },
  ];

  // Speed options
  const speedOptions = [0.5, 0.75, 1, 1.5, 2, 3];

  // Get preview dimensions
  const getPreviewDimensions = () => {
    const maxHeight = isMobile ? 380 : 480;
    const ratio = ratioConfig.width / ratioConfig.height;
    
    if (ratio > 1) {
      // Landscape
      const width = isMobile ? 320 : 420;
      return { width, height: width / ratio };
    } else {
      // Portrait or square
      const height = maxHeight;
      return { width: height * ratio, height };
    }
  };

  const previewDims = getPreviewDimensions();

  return (
    <div className="h-[100dvh] bg-black flex flex-col overflow-hidden touch-manipulation select-none">
      {/* Top bar */}
      <header className="h-12 bg-black/90 backdrop-blur flex items-center justify-between px-3 shrink-0 pt-safe border-b border-white/5">
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white active:scale-95 transition"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 ml-1">
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                undoStack.length > 0 ? 'text-white/70 hover:bg-white/10 active:scale-95' : 'text-white/20'
              }`}
              disabled={undoStack.length === 0}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"/>
              </svg>
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                redoStack.length > 0 ? 'text-white/70 hover:bg-white/10 active:scale-95' : 'text-white/20'
              }`}
              disabled={redoStack.length === 0}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4m4 4l-4 4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Project name */}
        <span className="text-white/80 font-medium text-sm truncate max-w-[120px]">
          {uploadedFile?.name?.slice(0, 15) || 'New Project'}
        </span>

        {/* Export button */}
        <button
          onClick={() => setActivePanel('export')}
          className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-sm rounded-full hover:opacity-90 active:scale-95 transition"
        >
          Export
        </button>
      </header>

      {/* Main preview area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Preview container */}
        <div className="flex-1 flex items-center justify-center p-3 relative">
          {/* Aspect ratio quick toggle (InShot style) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full p-1 z-10">
            {aspectOptions.map((opt) => (
              <button
                key={opt.ratio}
                onClick={() => setAspectRatio(opt.ratio)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  aspectRatio === opt.ratio 
                    ? 'bg-white text-black' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Preview frame */}
          <div 
            className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{
              width: previewDims.width,
              height: previewDims.height,
            }}
          >
            {/* Filter overlay */}
            {activeFilter && activeFilter !== 'none' && (
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: filters.find(f => f.id === activeFilter)?.color,
                  filter: ['bw', 'vivid'].includes(activeFilter) 
                    ? filters.find(f => f.id === activeFilter)?.color 
                    : undefined,
                }}
              />
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
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-white/60">
                    <path d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <p className="text-white/60 text-sm font-medium">Add Video</p>
                <p className="text-white/30 text-xs mt-1">or drag & drop</p>
              </div>
            )}

            {/* Transcribing overlay */}
            {isTranscribing && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">Generating captions...</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating action buttons (TikTok style) - Right side */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {[
              { id: 'text', icon: 'Aa', label: 'Text', action: addTextOverlay },
              { id: 'stickers', icon: '😀', label: 'Stickers' },
              { id: 'effects', icon: '✨', label: 'Effects' },
              { id: 'filters', icon: '🎨', label: 'Filters' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  if (btn.action) btn.action();
                  else setActivePanel(activePanel === btn.id ? null : btn.id as typeof activePanel);
                }}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
                  activePanel === btn.id
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-black/50 backdrop-blur text-white hover:bg-black/70'
                }`}
              >
                <span className="text-base leading-none">{btn.icon}</span>
                <span className="text-[8px] mt-0.5 opacity-70">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline + controls section */}
        <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-4">
          {/* Playback controls */}
          <div className="flex items-center justify-center gap-6 mb-3">
            <button 
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white active:scale-95 transition"
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? (
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" className="ml-1">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            
            <button 
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white active:scale-95 transition"
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Time display */}
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-white/60 text-xs font-mono">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePanel(activePanel === 'speed' ? null : 'speed')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                  speed !== 1 ? 'bg-pink-500/20 text-pink-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {speed}x
              </button>
            </div>
            <span className="text-white/60 text-xs font-mono">{formatTime(duration)}</span>
          </div>

          {/* Timeline scrubber */}
          <div 
            ref={timelineRef}
            className="mx-4 mb-2 relative cursor-pointer touch-none"
            onClick={(e) => handleTimelineInteraction(e.clientX)}
            onTouchStart={(e) => handleTimelineInteraction(e.touches[0].clientX)}
            onTouchMove={(e) => handleTimelineInteraction(e.touches[0].clientX)}
          >
            {/* Waveform-style background */}
            <div className="h-12 bg-white/5 rounded-xl overflow-hidden relative">
              {/* Video clips */}
              {timelineClips.filter(c => c.track === 0).map((clip) => (
                <div
                  key={clip.id}
                  className="absolute top-1 bottom-1 rounded-lg overflow-hidden"
                  style={{
                    left: `${(clip.startTime / duration) * 100}%`,
                    width: `${(clip.duration / duration) * 100}%`,
                    background: `linear-gradient(135deg, ${clip.color}, ${clip.color}88)`,
                  }}
                >
                  <div className="h-full flex items-center px-2">
                    <span className="text-white/80 text-[10px] font-medium truncate">
                      {clip.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>

            {/* Text clips track */}
            {timelineClips.filter(c => c.track === 1).length > 0 && (
              <div className="h-6 mt-1 bg-white/5 rounded-lg relative overflow-hidden">
                {timelineClips.filter(c => c.track === 1).map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 rounded"
                    style={{
                      left: `${(clip.startTime / duration) * 100}%`,
                      width: `${(clip.duration / duration) * 100}%`,
                      backgroundColor: clip.color,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom toolbar (TikTok/InShot style) */}
      <div className="bg-black border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { id: 'clips', icon: '🎬', label: 'Clips' },
            { id: 'audio', icon: '🎵', label: 'Audio' },
            { id: 'captions', icon: '💬', label: 'Captions' },
            { id: 'speed', icon: '⚡', label: 'Speed' },
            { id: 'canvas', icon: '📐', label: 'Canvas' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(activePanel === item.id ? null : item.id as typeof activePanel)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition active:scale-95 ${
                activePanel === item.id ? 'bg-white/10' : ''
              }`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span className={`text-[10px] ${activePanel === item.id ? 'text-white' : 'text-white/60'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom sheet panels */}
      {activePanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setActivePanel(null)}
          />
          
          {/* Panel */}
          <div className="fixed inset-x-0 bottom-0 bg-gray-900 rounded-t-3xl z-50 max-h-[60vh] overflow-hidden animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
              <h3 className="text-white font-semibold">
                {activePanel === 'clips' && 'Clips'}
                {activePanel === 'audio' && 'Audio'}
                {activePanel === 'captions' && 'Captions'}
                {activePanel === 'speed' && 'Speed'}
                {activePanel === 'canvas' && 'Canvas'}
                {activePanel === 'filters' && 'Filters'}
                {activePanel === 'stickers' && 'Stickers'}
                {activePanel === 'effects' && 'Effects'}
                {activePanel === 'export' && 'Export'}
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(60vh-80px)]">
              {activePanel === 'clips' && (
                <AssetManager onSelectAsset={(asset) => console.log('Selected:', asset)} />
              )}

              {activePanel === 'captions' && (
                <CaptionStylePicker selected={captionStyle} onSelect={setCaptionStyle} />
              )}

              {activePanel === 'export' && (
                <ExportPresets selected={aspectRatio} onSelect={setAspectRatio} />
              )}

              {activePanel === 'canvas' && (
                <div className="space-y-4">
                  <p className="text-white/60 text-sm">Choose aspect ratio for your video</p>
                  <div className="grid grid-cols-2 gap-3">
                    {aspectOptions.map((opt) => (
                      <button
                        key={opt.ratio}
                        onClick={() => {
                          setAspectRatio(opt.ratio);
                          setActivePanel(null);
                        }}
                        className={`p-4 rounded-2xl border-2 transition active:scale-95 ${
                          aspectRatio === opt.ratio
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl mb-2">{opt.icon}</div>
                        <div className="text-white font-medium text-sm">{opt.label}</div>
                        <div className="text-white/40 text-xs">{opt.ratio}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'speed' && (
                <div className="space-y-4">
                  <p className="text-white/60 text-sm">Adjust playback speed</p>
                  <div className="flex gap-2 flex-wrap">
                    {speedOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSpeed(s);
                          setActivePanel(null);
                        }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition active:scale-95 ${
                          speed === s
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'filters' && (
                <div className="space-y-4">
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id === 'none' ? null : filter.id)}
                        className={`flex-shrink-0 w-20 transition active:scale-95 ${
                          (activeFilter === filter.id || (!activeFilter && filter.id === 'none'))
                            ? 'opacity-100'
                            : 'opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div 
                          className={`w-20 h-20 rounded-xl mb-2 ${
                            (activeFilter === filter.id || (!activeFilter && filter.id === 'none'))
                              ? 'ring-2 ring-pink-500'
                              : ''
                          }`}
                          style={{
                            background: filter.id === 'none' 
                              ? 'linear-gradient(135deg, #374151, #1f2937)' 
                              : `linear-gradient(135deg, #374151, #1f2937)`,
                          }}
                        />
                        <span className="text-white text-xs">{filter.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'stickers' && (
                <div className="grid grid-cols-6 gap-2">
                  {['😀', '🔥', '💯', '❤️', '👍', '🎉', '⭐', '💪', '🚀', '💡', '✅', '🎯', '👀', '🤩', '😎', '🥳', '💥', '⚡'].map((emoji) => (
                    <button
                      key={emoji}
                      className="w-12 h-12 bg-white/10 rounded-xl text-2xl hover:bg-white/20 active:scale-95 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {activePanel === 'effects' && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Blur', icon: '🌫️' },
                    { name: 'Zoom', icon: '🔍' },
                    { name: 'Shake', icon: '📳' },
                    { name: 'Flash', icon: '⚡' },
                    { name: 'Glitch', icon: '📺' },
                    { name: 'VHS', icon: '📼' },
                    { name: 'Fade', icon: '🌅' },
                    { name: 'Slide', icon: '➡️' },
                    { name: 'Spin', icon: '🔄' },
                  ].map((effect) => (
                    <button
                      key={effect.name}
                      className="p-4 bg-white/10 rounded-xl text-center hover:bg-white/15 active:scale-95 transition"
                    >
                      <span className="text-2xl">{effect.icon}</span>
                      <p className="text-white text-xs mt-2">{effect.name}</p>
                    </button>
                  ))}
                </div>
              )}

              {activePanel === 'audio' && (
                <div className="space-y-3">
                  {[
                    { icon: '🎵', title: 'Add Music', desc: 'Browse sounds' },
                    { icon: '🎤', title: 'Voiceover', desc: 'Record or AI voice' },
                    { icon: '🔊', title: 'Sound Effects', desc: 'AI generated' },
                    { icon: '📊', title: 'Volume', desc: 'Adjust levels' },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className="w-full p-4 bg-white/10 rounded-xl text-left hover:bg-white/15 active:scale-[0.98] transition flex items-center gap-4"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-white/50 text-xs">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      {/* CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
