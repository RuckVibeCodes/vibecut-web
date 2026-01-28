'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Player } from '@remotion/player';
import { CaptionStylePicker } from '@/components/CaptionStylePicker';
import { ExportPresets } from '@/components/ExportPresets';
import { AIPromptEditor } from '@/components/AIPromptEditor';
import { 
  AspectRatio, 
  CaptionStyleId, 
  Transcript, 
  ASPECT_RATIOS,
  CAPTION_STYLES 
} from '@/lib/types';

// Simple composition for preview
const PreviewComposition: React.FC<{
  transcript?: Transcript;
  captionStyle: CaptionStyleId;
  currentTime: number;
}> = ({ transcript, captionStyle, currentTime }) => {
  const style = CAPTION_STYLES.find(s => s.id === captionStyle) || CAPTION_STYLES[0];
  
  // Find current words to display
  const getCurrentWords = () => {
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

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
      {/* Placeholder content */}
      <div className="text-white/30 text-lg">
        {transcript ? 'Video Preview' : 'Upload a video to preview'}
      </div>
      
      {/* Captions overlay */}
      {transcript && (
        <div 
          className={`absolute left-0 right-0 px-8 ${
            style.config.position === 'top' ? 'top-8' :
            style.config.position === 'center' ? 'top-1/2 -translate-y-1/2' :
            'bottom-8'
          }`}
        >
          <p
            className="text-center"
            style={{
              fontSize: style.config.fontSize,
              fontWeight: style.config.fontWeight,
              fontFamily: style.config.fontFamily,
              color: style.config.color,
              textShadow: style.config.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : undefined,
              WebkitTextStroke: style.config.outline ? `2px ${style.config.outlineColor}` : undefined,
              backgroundColor: style.config.backgroundColor,
              padding: style.config.backgroundColor ? '8px 16px' : undefined,
              borderRadius: style.config.backgroundColor ? '8px' : undefined,
            }}
          >
            {getCurrentWords()}
          </p>
        </div>
      )}
    </div>
  );
};

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<'edit' | 'captions' | 'export' | 'ai'>('edit');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyleId>('tiktok-bounce');
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratioConfig = ASPECT_RATIOS[aspectRatio];

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    
    // Auto-transcribe on upload
    setIsTranscribing(true);
    try {
      const stored = localStorage.getItem('vibecut-api-keys');
      if (!stored) {
        throw new Error('Please configure API keys in Settings');
      }
      
      const keys = JSON.parse(stored);
      const apiKey = keys.deepgram || keys.openai;
      const provider = keys.deepgram ? 'deepgram' : 'openai';
      
      if (!apiKey) {
        throw new Error('Please add Deepgram or OpenAI API key in Settings');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('apiKey', apiKey);
      formData.append('provider', provider);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error) {
      console.error('Transcription error:', error);
      alert(error instanceof Error ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-lg">
              🎬
            </div>
            <span className="text-xl font-bold text-white">VibeCut</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">
              {uploadedFile ? uploadedFile.name : 'No video loaded'}
            </span>
            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition">
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-black/50 border-r border-white/10 flex flex-col items-center py-4 gap-2">
          {[
            { id: 'edit', icon: '✂️', label: 'Edit' },
            { id: 'captions', icon: '💬', label: 'Captions' },
            { id: 'export', icon: '📤', label: 'Export' },
            { id: 'ai', icon: '✨', label: 'AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white'
              }`}
              title={tab.label}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Preview Panel */}
          <div className="flex-1 p-6 flex flex-col">
            <div 
              className="flex-1 bg-black rounded-xl overflow-hidden relative"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploadedFile ? (
                <Player
                  component={PreviewComposition}
                  inputProps={{
                    transcript: transcript || undefined,
                    captionStyle,
                    currentTime,
                  }}
                  durationInFrames={Math.max(60, (transcript?.duration || 10) * 60)}
                  fps={60}
                  compositionWidth={ratioConfig.width}
                  compositionHeight={ratioConfig.height}
                  style={{ width: '100%', height: '100%' }}
                  controls
                />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-white/70 text-lg mb-2">Drop video here or click to upload</p>
                  <p className="text-white/40 text-sm">Supports MP4, MOV, WebM</p>
                </div>
              )}
              
              {isTranscribing && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🎙️</div>
                    <p className="text-white font-medium">Transcribing audio...</p>
                    <p className="text-white/50 text-sm">This may take a moment</p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />

            {/* Timeline placeholder */}
            <div className="h-24 mt-4 bg-black/50 rounded-xl flex items-center justify-center">
              {transcript ? (
                <div className="w-full px-4">
                  <div className="h-12 bg-white/10 rounded-lg relative overflow-hidden">
                    {/* Waveform visualization placeholder */}
                    <div className="absolute inset-0 flex items-center">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 mx-px bg-indigo-500/50"
                          style={{ height: `${Math.random() * 80 + 20}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mt-2 text-center">
                    {transcript.words.length} words • {Math.round(transcript.duration)}s duration
                  </p>
                </div>
              ) : (
                <p className="text-white/30">Timeline will appear after upload</p>
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-96 border-l border-white/10 bg-black/30 overflow-y-auto p-6">
            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Project Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm block mb-2">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ASPECT_RATIOS).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => setAspectRatio(key as AspectRatio)}
                            className={`p-3 rounded-lg border transition text-left ${
                              aspectRatio === key
                                ? 'border-indigo-500 bg-indigo-500/20'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            <span className="text-lg mr-2">{config.icon}</span>
                            <span className="text-white text-sm">{config.ratio}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {transcript && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>
                    <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {transcript.text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'captions' && (
              <CaptionStylePicker 
                selected={captionStyle} 
                onSelect={setCaptionStyle}
              />
            )}

            {activeTab === 'export' && (
              <ExportPresets 
                selected={aspectRatio} 
                onSelect={setAspectRatio}
              />
            )}

            {activeTab === 'ai' && (
              <div className="h-full">
                <AIPromptEditor />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
