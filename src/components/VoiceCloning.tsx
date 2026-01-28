'use client';

import { useState, useEffect, useRef } from 'react';

interface Voice {
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
}

export function VoiceCloning() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'clone'>('generate');
  const [cloneName, setCloneName] = useState('');
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    const stored = localStorage.getItem('vibecut-api-keys');
    if (!stored) return;

    const keys = JSON.parse(stored);
    if (!keys.elevenlabs) return;

    try {
      const formData = new FormData();
      formData.append('action', 'list-voices');
      formData.append('apiKey', keys.elevenlabs);

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);
        if (data.voices?.length > 0) {
          setSelectedVoice(data.voices[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;

    const stored = localStorage.getItem('vibecut-api-keys');
    if (!stored) {
      alert('Please configure ElevenLabs API key in Settings');
      return;
    }

    const keys = JSON.parse(stored);
    if (!keys.elevenlabs) {
      alert('Please add ElevenLabs API key in Settings');
      return;
    }

    setIsLoading(true);
    setGeneratedAudio(null);

    try {
      const formData = new FormData();
      formData.append('action', 'generate-speech');
      formData.append('apiKey', keys.elevenlabs);
      formData.append('text', text.trim());
      formData.append('voiceId', selectedVoice);

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedAudio(data.audioUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneVoice = async () => {
    if (!cloneName.trim() || cloneFiles.length === 0) return;

    const stored = localStorage.getItem('vibecut-api-keys');
    if (!stored) {
      alert('Please configure ElevenLabs API key in Settings');
      return;
    }

    const keys = JSON.parse(stored);
    if (!keys.elevenlabs) {
      alert('Please add ElevenLabs API key in Settings');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('action', 'clone-voice');
      formData.append('apiKey', keys.elevenlabs);
      formData.append('name', cloneName.trim());
      
      for (const file of cloneFiles) {
        formData.append('files', file);
      }

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cloning failed');
      }

      alert(`Voice "${cloneName}" created successfully!`);
      setCloneName('');
      setCloneFiles([]);
      loadVoices(); // Refresh voice list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to clone voice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Voice & TTS</h3>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'generate'
              ? 'bg-indigo-500 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🔊 Generate Speech
        </button>
        <button
          onClick={() => setActiveTab('clone')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'clone'
              ? 'bg-indigo-500 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🎤 Clone Voice
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-4">
          {/* Voice selector */}
          <div>
            <label className="text-white/60 text-sm block mb-2">Select Voice</label>
            {voices.length === 0 ? (
              <p className="text-white/40 text-sm">
                Add ElevenLabs API key to load voices
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-2 rounded-lg text-left transition ${
                      selectedVoice === voice.id
                        ? 'bg-indigo-500/30 border border-indigo-500'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <p className="text-white text-sm font-medium truncate">{voice.name}</p>
                    <p className="text-white/50 text-xs">{voice.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <div>
            <label className="text-white/60 text-sm block mb-2">Text to Speak</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              rows={4}
            />
            <p className="text-white/40 text-xs mt-1">{text.length} characters</p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || !selectedVoice || isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Generating...' : '🔊 Generate Speech'}
          </button>

          {/* Audio player */}
          {generatedAudio && (
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">Generated Audio:</p>
              <audio
                ref={audioRef}
                src={generatedAudio}
                controls
                className="w-full"
              />
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedAudio;
                  a.download = 'voiceover.mp3';
                  a.click();
                }}
                className="mt-2 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition w-full"
              >
                ⬇️ Download Audio
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'clone' && (
        <div className="space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ Voice cloning requires clean audio samples (1-5 minutes total). 
              Use recordings of the voice you want to clone.
            </p>
          </div>

          {/* Clone name */}
          <div>
            <label className="text-white/60 text-sm block mb-2">Voice Name</label>
            <input
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder="My Custom Voice"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Audio upload */}
          <div>
            <label className="text-white/60 text-sm block mb-2">Audio Samples</label>
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition cursor-pointer"
              onClick={() => document.getElementById('clone-audio-input')?.click()}
            >
              <input
                id="clone-audio-input"
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => setCloneFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
              <p className="text-white/60 text-sm">
                {cloneFiles.length > 0 
                  ? `${cloneFiles.length} file(s) selected`
                  : 'Click to upload audio samples'}
              </p>
              <p className="text-white/40 text-xs mt-1">MP3, WAV, M4A supported</p>
            </div>

            {cloneFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {cloneFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/70 truncate">{file.name}</span>
                    <button
                      onClick={() => setCloneFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clone button */}
          <button
            onClick={handleCloneVoice}
            disabled={!cloneName.trim() || cloneFiles.length === 0 || isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Cloning...' : '🎤 Clone Voice'}
          </button>
        </div>
      )}
    </div>
  );
}
