'use client';

import { useState } from 'react';

interface GeneratedClip {
  id: string;
  prompt: string;
  videoUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

export function BRollGenerator() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(4);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [clips, setClips] = useState<GeneratedClip[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const stored = localStorage.getItem('vibecut-api-keys');
    if (!stored) {
      alert('Please configure WaveSpeed or Replicate API key in Settings');
      return;
    }

    const keys = JSON.parse(stored);
    const apiKey = keys.wavespeed || keys.replicate;
    const provider = keys.wavespeed ? 'wavespeed' : 'replicate';

    if (!apiKey) {
      alert('Please add WaveSpeed or Replicate API key in Settings');
      return;
    }

    const clipId = `clip-${Date.now()}`;
    const newClip: GeneratedClip = {
      id: clipId,
      prompt: prompt.trim(),
      status: 'generating',
    };

    setClips(prev => [newClip, ...prev]);
    setIsGenerating(true);
    setPrompt('');

    try {
      const response = await fetch('/api/broll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          aspectRatio,
          provider,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, status: 'completed', videoUrl: data.videoUrl }
          : c
      ));
    } catch (error) {
      setClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, status: 'failed', error: error instanceof Error ? error.message : 'Failed' }
          : c
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = [
    'Cinematic city skyline at sunset',
    'Ocean waves crashing on rocks',
    'Coffee being poured in slow motion',
    'Aerial view of mountains',
    'Typing on keyboard with RGB lighting',
    'Time-lapse of clouds moving',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">AI B-Roll Generator</h3>
      <p className="text-white/60 text-sm">Describe a scene and AI will generate video footage</p>

      {/* Prompt input */}
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the b-roll you need..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 text-sm resize-none"
          rows={3}
        />

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 3).map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-xs hover:bg-white/20 hover:text-white transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-white/60 text-xs block mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value={2}>2 sec</option>
              <option value={4}>4 sec</option>
              <option value={6}>6 sec</option>
              <option value={10}>10 sec</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-white/60 text-xs block mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="16:9">16:9 (YouTube)</option>
              <option value="9:16">9:16 (TikTok)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🎬 Generating...' : '✨ Generate B-Roll'}
        </button>
      </div>

      {/* Generated clips */}
      {clips.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-white/70 text-sm font-medium">Generated Clips</h4>
          {clips.map((clip) => (
            <div key={clip.id} className="bg-white/5 rounded-lg p-3">
              <p className="text-white text-sm mb-2 line-clamp-2">{clip.prompt}</p>
              
              {clip.status === 'generating' && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <span className="animate-spin">⏳</span> Generating...
                </div>
              )}
              
              {clip.status === 'completed' && clip.videoUrl && (
                <video
                  src={clip.videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              )}
              
              {clip.status === 'failed' && (
                <p className="text-red-400 text-sm">❌ {clip.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
