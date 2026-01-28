'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRollGenerator } from '@/components/BRollGenerator';
import { VoiceCloning } from '@/components/VoiceCloning';
import { HighlightDetector } from '@/components/HighlightDetector';
import { RenderQueue } from '@/components/RenderQueue';

type ToolTab = 'broll' | 'voice' | 'highlights' | 'render';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('broll');

  const tools = [
    { id: 'broll' as const, name: 'AI B-Roll', icon: '🎬', description: 'Generate video clips from text' },
    { id: 'voice' as const, name: 'Voice & TTS', icon: '🎤', description: 'Clone voices, generate speech' },
    { id: 'highlights' as const, name: 'Highlights', icon: '✨', description: 'Find viral moments' },
    { id: 'render' as const, name: 'Render Queue', icon: '📦', description: 'Batch render videos' },
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
