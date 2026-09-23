'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BRollGenerator } from '@/components/BRollGenerator';
import { VoiceCloning } from '@/components/VoiceCloning';
import { HighlightDetector } from '@/components/HighlightDetector';
import { RenderQueue } from '@/components/RenderQueue';

type ToolTab = 'broll' | 'voice' | 'highlights' | 'render' | 'captionPack';
type CaptionTone = 'curious' | 'bold' | 'educational' | 'community';

const CAPTION_TONES: Record<CaptionTone, { label: string; hook: string; cta: string; emoji: string }> = {
  curious: {
    label: 'Curious',
    hook: 'Nobody tells you this part about',
    cta: 'Save this before your next edit.',
    emoji: '🧠',
  },
  bold: {
    label: 'Bold',
    hook: 'Stop posting before you fix',
    cta: 'Share it with the creator who needs the nudge.',
    emoji: '⚡',
  },
  educational: {
    label: 'Educational',
    hook: 'A faster workflow for understanding',
    cta: 'Bookmark this as your pre-upload checklist.',
    emoji: '🎓',
  },
  community: {
    label: 'Community',
    hook: 'If your team is trying to improve',
    cta: 'Tag someone you would test this with.',
    emoji: '🤝',
  },
};

function slugifyTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join('');
}

function CaptionPackGenerator() {
  const [topic, setTopic] = useState('turning a long founder interview into three launch clips');
  const [audience, setAudience] = useState('busy SaaS founders');
  const [outcome, setOutcome] = useState('ship more useful short-form without opening a blank doc');
  const [tone, setTone] = useState<CaptionTone>('curious');

  const selectedTone = CAPTION_TONES[tone];
  const captionPack = useMemo(() => {
    const cleanTopic = topic.trim() || 'your next clip';
    const cleanAudience = audience.trim() || 'your audience';
    const cleanOutcome = outcome.trim() || 'take the next step';
    const tag = slugifyTag(cleanTopic) || 'creatorworkflow';

    return {
      primary: `${selectedTone.emoji} ${selectedTone.hook} ${cleanTopic}: your first caption should tell ${cleanAudience} exactly why the next 30 seconds matter.\n\nUse the clip to show the before/after, name the friction, then end with one simple next move: ${cleanOutcome}.\n\n${selectedTone.cta}`,
      alt: [
        `POV: ${cleanAudience} finally have a repeatable way to ${cleanOutcome}.`,
        `The clip idea is not \"${cleanTopic}\". The clip idea is the moment ${cleanAudience} realize they can ${cleanOutcome}.`,
        `Cut the setup. Open on the payoff: ${cleanOutcome}. Then prove it with the best 8 seconds from ${cleanTopic}.`,
      ],
      hashtags: [`#${tag}`, '#videomarketing', '#contentworkflow', '#shortformvideo', '#vibecut'],
    };
  }, [audience, outcome, selectedTone, topic]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">Distribution</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Caption Pack Generator</h2>
        <p className="mt-2 text-white/60">
          Turn a clip idea into platform-ready caption copy, alternates, and hashtag starters before the export leaves VibeCut.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white/70">
            Clip topic
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="What is this clip about?"
            />
          </label>

          <label className="block text-sm font-medium text-white/70">
            Audience
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="Who should stop scrolling?"
            />
          </label>

          <label className="block text-sm font-medium text-white/70">
            Desired action
            <input
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-400"
              placeholder="What should they do or understand?"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(CAPTION_TONES) as CaptionTone[]).map((option) => (
              <button
                key={option}
                onClick={() => setTone(option)}
                className={`rounded-xl border p-3 text-left transition ${
                  tone === option
                    ? 'border-pink-400 bg-pink-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{CAPTION_TONES[option].emoji}</span>
                <span className="ml-2 text-sm font-semibold">{CAPTION_TONES[option].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-pink-400/30 bg-pink-500/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Primary caption</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Ready to paste</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-pink-50">{captionPack.primary}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <h3 className="font-semibold text-white">A/B caption hooks</h3>
            <div className="mt-4 space-y-3">
              {captionPack.alt.map((caption, index) => (
                <div key={caption} className="rounded-xl bg-black/20 p-3 text-sm text-white/70">
                  <span className="mr-2 text-pink-200">{index + 1}.</span>
                  {caption}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-5">
            <h3 className="font-semibold text-white">Hashtag starter set</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {captionPack.hashtags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
                  {tag}
                </span>
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
    { id: 'captionPack' as const, name: 'Caption Pack', icon: '✍️', description: 'Draft captions and hashtags' },
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
            {activeTab === 'captionPack' && <CaptionPackGenerator />}
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
              icon: '✍️',
              title: 'Caption Pack',
              description: 'Draft post captions, A/B hooks, and hashtags before publishing',
              features: ['Caption copy', 'Hook variants', 'Hashtags'],
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
