'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRollGenerator } from '@/components/BRollGenerator';
import { VoiceCloning } from '@/components/VoiceCloning';
import { HighlightDetector } from '@/components/HighlightDetector';
import { RenderQueue } from '@/components/RenderQueue';

type ToolTab = 'broll' | 'voice' | 'highlights' | 'render' | 'scriptTimer';

const WORDS_PER_MINUTE = {
  relaxed: 125,
  conversational: 150,
  energetic: 180,
} as const;

const PLATFORM_WINDOWS = [
  { name: 'TikTok / Reels hook', min: 15, max: 35 },
  { name: 'Short-form sweet spot', min: 45, max: 75 },
  { name: 'YouTube Short max', min: 1, max: 60 },
  { name: 'LinkedIn clip', min: 60, max: 150 },
];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function ScriptTimer() {
  const [script, setScript] = useState(`Cold open: Most creators lose viewers before the value starts.\n\nTurn your next talking-head video into three tight clips: lead with the result, prove it with one visual, then end with a simple next step.`);
  const [pace, setPace] = useState<keyof typeof WORDS_PER_MINUTE>('conversational');

  const words = script.trim().match(/[\w’'-]+/g) ?? [];
  const wordCount = words.length;
  const estimatedSeconds = Math.max(1, Math.round((wordCount / WORDS_PER_MINUTE[pace]) * 60));
  const shortFormWordsRemaining = Math.max(0, Math.floor((60 * WORDS_PER_MINUTE[pace]) / 60) - wordCount);
  const hookText = script.split(/\n|\./).find((line) => line.trim().length > 0)?.trim() ?? '';
  const hookSeconds = Math.max(1, Math.round(((hookText.match(/[\w’'-]+/g) ?? []).length / WORDS_PER_MINUTE[pace]) * 60));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Pre-production</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Script Timer</h2>
        <p className="mt-2 text-white/60">
          Paste a draft voiceover and VibeCut will estimate runtime before you record, so clips stay inside the target platform window.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            className="min-h-64 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-indigo-400"
            placeholder="Paste a script, hook, or caption draft..."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(WORDS_PER_MINUTE) as Array<keyof typeof WORDS_PER_MINUTE>).map((option) => (
              <button
                key={option}
                onClick={() => setPace(option)}
                className={`rounded-xl border p-3 text-left transition ${
                  pace === option
                    ? 'border-indigo-400 bg-indigo-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="block text-sm font-semibold capitalize">{option}</span>
                <span className="text-xs text-white/45">{WORDS_PER_MINUTE[option]} wpm</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5">
            <p className="text-sm text-indigo-200">Estimated runtime</p>
            <p className="mt-2 text-5xl font-black text-white">{formatDuration(estimatedSeconds)}</p>
            <p className="mt-2 text-sm text-white/55">{wordCount} words at {WORDS_PER_MINUTE[pace]} words per minute</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <h3 className="font-semibold text-white">Hook check</h3>
            <p className="mt-2 text-sm text-white/60">
              First beat runs about <span className="text-white">{formatDuration(hookSeconds)}</span>. Keep it under 5s for cold audiences.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <h3 className="font-semibold text-white">Platform fit</h3>
            <div className="mt-4 space-y-3">
              {PLATFORM_WINDOWS.map((window) => {
                const fits = estimatedSeconds >= window.min && estimatedSeconds <= window.max;
                return (
                  <div key={window.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/70">{window.name}</span>
                    <span className={`rounded-full px-2 py-1 text-xs ${fits ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/45'}`}>
                      {fits ? 'Fits' : `${formatDuration(window.min)}-${formatDuration(window.max)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-pink-500/10 p-5 text-sm text-pink-100">
            {shortFormWordsRemaining > 0
              ? `${shortFormWordsRemaining} words left before a 60-second Short at this pace.`
              : 'Trim for YouTube Shorts, or split this script into a two-part sequence.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('broll');

  const tools = [
    { id: 'broll' as const, name: 'AI B-Roll', icon: '🎬', description: 'Generate video clips from text' },
    { id: 'voice' as const, name: 'Voice & TTS', icon: '🎤', description: 'Clone voices, generate speech' },
    { id: 'highlights' as const, name: 'Highlights', icon: '✨', description: 'Find viral moments' },
    { id: 'render' as const, name: 'Render Queue', icon: '📦', description: 'Batch render videos' },
    { id: 'scriptTimer' as const, name: 'Script Timer', icon: '⏱️', description: 'Estimate voiceover runtime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
              🎬
            </div>
            <span className="text-2xl font-bold text-white">VibeCut</span>
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium text-white/60 hover:text-white transition">
              Home
            </Link>
            <Link href="/editor" className="text-sm font-medium text-white/60 hover:text-white transition">
              Editor
            </Link>
            <span className="text-sm font-medium text-white">AI Tools</span>
            <Link href="/settings" className="text-sm font-medium text-white/60 hover:text-white transition">
              ⚙️ Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Tools</h1>
          <p className="text-white/60">Powerful AI-powered tools to supercharge your video production</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`w-full p-4 rounded-xl text-left transition ${
                  activeTab === tool.id
                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <p className="text-white font-medium">{tool.name}</p>
                    <p className="text-white/50 text-sm">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white/5 rounded-2xl p-6">
            {activeTab === 'broll' && <BRollGenerator />}
            {activeTab === 'voice' && <VoiceCloning />}
            {activeTab === 'highlights' && (
              <HighlightDetector 
                transcript={null} // Would come from editor context
                onHighlightSelect={(h) => console.log('Selected highlight:', h)}
              />
            )}
            {activeTab === 'render' && <RenderQueue />}
            {activeTab === 'scriptTimer' && <ScriptTimer />}
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: '🎬',
              title: 'AI B-Roll',
              description: 'Describe a scene, get AI-generated video footage instantly',
              features: ['WaveSpeed AI', 'Replicate models', '4-10 sec clips'],
            },
            {
              icon: '🎤',
              title: 'Voice Cloning',
              description: 'Clone any voice or use ElevenLabs TTS for voiceovers',
              features: ['Voice cloning', 'Text-to-speech', 'Sound effects'],
            },
            {
              icon: '✨',
              title: 'Auto-Highlights',
              description: 'AI finds the most viral-worthy moments in your video',
              features: ['Key phrases', 'Emotion peaks', 'Hook detection'],
            },
            {
              icon: '📦',
              title: 'Batch Render',
              description: 'Queue multiple videos and render them all at once',
              features: ['Multiple formats', 'Quality presets', 'Progress tracking'],
            },
            {
              icon: '⏱️',
              title: 'Script Timer',
              description: 'Estimate voiceover runtime before recording a short-form edit',
              features: ['WPM presets', 'Hook timing', 'Platform fit'],
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-white/60 text-sm mb-3">{feature.description}</p>
              <div className="flex flex-wrap gap-1">
                {feature.features.map((f, j) => (
                  <span key={j} className="px-2 py-0.5 bg-white/10 rounded text-white/50 text-xs">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
