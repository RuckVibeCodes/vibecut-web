'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRollGenerator } from '@/components/BRollGenerator';
import { VoiceCloning } from '@/components/VoiceCloning';
import { HighlightDetector } from '@/components/HighlightDetector';
import { RenderQueue } from '@/components/RenderQueue';

type ToolTab = 'broll' | 'voice' | 'highlights' | 'render' | 'hookRemix';

type HookAngle = 'contrarian' | 'numbers' | 'mistake' | 'fastWin';

const HOOK_ANGLES: Record<HookAngle, { label: string; formula: string; description: string }> = {
  contrarian: {
    label: 'Contrarian',
    formula: 'Stop {bad habit}. Do {better action} instead.',
    description: 'Challenges a common belief and creates pattern interrupt.',
  },
  numbers: {
    label: 'Number-led',
    formula: '{number} ways to get {outcome} without {pain}.',
    description: 'Adds specificity for saves, shares, and carousels.',
  },
  mistake: {
    label: 'Mistake',
    formula: 'The {audience} mistake that keeps {pain} happening.',
    description: 'Frames the clip as a quick diagnostic.',
  },
  fastWin: {
    label: 'Fast win',
    formula: 'Try this {timeframe} fix to {outcome}.',
    description: 'Promises a short, actionable payoff.',
  },
};

function getFirstWords(value: string, count: number) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, count)
    .join(' ');
}

function HookRemixGenerator() {
  const [topic, setTopic] = useState('turning a long founder interview into short-form clips');
  const [audience, setAudience] = useState('busy founders');
  const [outcome, setOutcome] = useState('publish more polished clips without hiring an editor');
  const [angle, setAngle] = useState<HookAngle>('contrarian');

  const trimmedTopic = topic.trim() || 'your video idea';
  const trimmedAudience = audience.trim() || 'your audience';
  const trimmedOutcome = outcome.trim() || 'get a better result';
  const outcomeShort = getFirstWords(trimmedOutcome, 8);
  const topicShort = getFirstWords(trimmedTopic, 7);

  const variants = [
    `Stop opening with context. Show ${trimmedAudience} the ${outcomeShort} payoff first, then explain ${topicShort}.`,
    `Most ${trimmedAudience} make ${topicShort} feel harder than it is. Here is the faster way to ${outcomeShort}.`,
    `If ${trimmedAudience} only have 30 seconds, lead with this: ${outcomeShort}.`,
    `The ${trimmedAudience} mistake: saving the best proof for the end of the clip. Move it to second one.`,
    `Here are 3 ways to make ${topicShort} feel instantly more useful for ${trimmedAudience}.`,
  ];

  const selectedFormula = HOOK_ANGLES[angle];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">Ideation</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Hook Remix Generator</h2>
        <p className="mt-2 text-white/60">
          Turn one raw clip idea into reusable opening lines before recording or editing. Use it to pressure-test whether the first three seconds are clear enough.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
          <label className="block text-sm font-medium text-white">Clip topic
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="What is this clip about?"
            />
          </label>

          <label className="block text-sm font-medium text-white">Audience
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="Who should stop scrolling?"
            />
          </label>

          <label className="block text-sm font-medium text-white">Desired outcome
            <input
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="What result should the viewer want?"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-white">Angle</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.keys(HOOK_ANGLES) as HookAngle[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setAngle(option)}
                  className={`rounded-xl border p-3 text-left transition ${
                    angle === option
                      ? 'border-pink-400 bg-pink-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="block text-sm font-semibold">{HOOK_ANGLES[option].label}</span>
                  <span className="text-xs text-white/45">{HOOK_ANGLES[option].description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-pink-400/30 bg-pink-500/10 p-5">
            <p className="text-sm text-pink-100">Recommended formula</p>
            <p className="mt-2 text-lg font-semibold text-white">{selectedFormula.formula}</p>
            <p className="mt-2 text-sm text-white/55">{selectedFormula.description}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Hook candidates</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">5 variants</span>
            </div>
            <div className="mt-4 space-y-3">
              {variants.map((variant, index) => (
                <div key={variant} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Option {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{variant}</p>
                </div>
              ))}
            </div>
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
    { id: 'hookRemix' as const, name: 'Hook Remix', icon: '🪝', description: 'Generate scroll-stopping openings' },
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
            {activeTab === 'hookRemix' && <HookRemixGenerator />}
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
              icon: '🪝',
              title: 'Hook Remix',
              description: 'Pressure-test the first three seconds with multiple hook angles',
              features: ['Audience fit', 'Angle formulas', '5 variants'],
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
