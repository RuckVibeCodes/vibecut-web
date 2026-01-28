'use client';

import { useState } from 'react';
import { Transcript } from '@/lib/types';

interface Highlight {
  id: string;
  type: string;
  start: number;
  end: number;
  text: string;
  score: number;
  reason: string;
}

interface Props {
  transcript: Transcript | null;
  onHighlightSelect?: (highlight: Highlight) => void;
}

export function HighlightDetector({ transcript, onHighlightSelect }: Props) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const analyzeTranscript = async () => {
    if (!transcript) return;

    setIsAnalyzing(true);
    setHighlights([]);

    try {
      let apiKey = '';
      let provider = 'anthropic';

      if (useAI) {
        const stored = localStorage.getItem('vibecut-api-keys');
        if (stored) {
          const keys = JSON.parse(stored);
          apiKey = keys.anthropic || keys.openai || '';
          provider = keys.anthropic ? 'anthropic' : 'openai';
        }
      }

      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.text,
          words: transcript.words,
          useAI,
          apiKey,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setHighlights(data.highlights || []);
    } catch (error) {
      console.error('Highlight analysis error:', error);
      alert(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'exclamation': return '❗';
      case 'emotion': return '😮';
      case 'key_phrase': return '🎯';
      case 'rapid_speech': return '⚡';
      case 'silence': return '⏸️';
      case 'hook': return '🪝';
      case 'insight': return '💡';
      case 'humor': return '😄';
      default: return '✨';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-white/60';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Auto-Highlight Detection</h3>
      <p className="text-white/60 text-sm">Find viral-worthy moments in your video</p>

      {!transcript ? (
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <p className="text-white/40">Upload a video to detect highlights</p>
        </div>
      ) : (
        <>
          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-white/70 text-sm">Use AI for deeper analysis</span>
            </label>
          </div>

          {/* Analyze button */}
          <button
            onClick={analyzeTranscript}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {isAnalyzing ? '🔍 Analyzing...' : '🔍 Find Highlights'}
          </button>

          {/* Results */}
          {highlights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white/70 text-sm font-medium">
                  Found {highlights.length} highlights
                </h4>
                <span className="text-white/40 text-xs">Sorted by viral potential</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {highlights.map((highlight, index) => (
                  <div
                    key={highlight.id}
                    onClick={() => onHighlightSelect?.(highlight)}
                    className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getTypeEmoji(highlight.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/40 text-xs">#{index + 1}</span>
                          <span className={`text-sm font-bold ${getScoreColor(highlight.score)}`}>
                            {Math.round(highlight.score * 100)}%
                          </span>
                          {highlight.start > 0 && (
                            <span className="text-white/40 text-xs">
                              @ {formatTime(highlight.start)}
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm line-clamp-2">{highlight.text}</p>
                        <p className="text-white/50 text-xs mt-1">{highlight.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export highlights */}
              <button
                onClick={() => {
                  const data = JSON.stringify(highlights, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'highlights.json';
                  a.click();
                }}
                className="w-full px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition"
              >
                ⬇️ Export Highlights
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
