'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Player } from '@remotion/player';
import { DemoVideo } from '@/components/DemoVideo';
import { AIPromptEditor } from '@/components/AIPromptEditor';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'templates'>('home');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
              🎬
            </div>
            <span className="text-2xl font-bold text-white">VibeCut</span>
          </div>
          <nav className="flex gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition ${activeTab === 'home' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`text-sm font-medium transition ${activeTab === 'create' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Create
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`text-sm font-medium transition ${activeTab === 'templates' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              Templates
            </button>
            <Link 
              href="/tools"
              className="text-sm font-medium text-white/60 hover:text-white transition"
            >
              🧠 AI Tools
            </Link>
            <Link 
              href="/settings"
              className="text-sm font-medium text-white/60 hover:text-white transition"
            >
              ⚙️ Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      {activeTab === 'home' && (
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              AI-Powered Video
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Production Pipeline
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Record once. Let AI handle captions, b-roll, and editing. 
              Ship professional talking-head videos in minutes, not hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/editor"
                className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-white/90 transition"
              >
                Open Editor
              </Link>
              <a 
                href="https://github.com/RuckVibeCodes/vibecut"
                target="_blank"
                className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Demo Player */}
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <Player
                component={DemoVideo}
                durationInFrames={300}
                fps={30}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{ width: '100%', height: '100%' }}
                controls
              />
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <FeatureCard
              emoji="🎙️"
              title="Auto-Transcription"
              description="Upload your video, get word-level timestamps and animated captions automatically."
            />
            <FeatureCard
              emoji="🎨"
              title="AI B-Roll"
              description="Generate relevant b-roll clips from text descriptions using AI video models."
            />
            <FeatureCard
              emoji="⚡"
              title="Batch Render"
              description="Create templates once, generate variations infinitely. Scale your content."
            />
          </div>

          {/* Workflow */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <WorkflowStep number={1} title="Record" description="Film your talking head video" />
              <WorkflowStep number={2} title="Transcribe" description="AI generates word-level captions" />
              <WorkflowStep number={3} title="Enhance" description="Add b-roll, graphics, music" />
              <WorkflowStep number={4} title="Export" description="Render to YouTube-ready MP4" />
            </div>
          </div>
        </main>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <main className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-white mb-2">Create New Video</h2>
          <p className="text-white/60 mb-8">Use AI to generate video compositions or upload your footage</p>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* AI Prompt Editor */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span> AI Video Editor
              </h3>
              <AIPromptEditor onGenerateCode={setGeneratedCode} />
            </div>

            {/* Upload + Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📹</span> Upload Footage
                </h3>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition cursor-pointer">
                    <div className="text-3xl mb-3">📁</div>
                    <p className="text-white/70 mb-2">Drop files or click to browse</p>
                    <p className="text-sm text-white/40">MP4, MOV, M4A, MP3</p>
                  </div>
                </div>
              </div>

              {/* Generated Code Preview */}
              {generatedCode && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">💻</span> Generated Code
                  </h3>
                  <div className="bg-black/50 backdrop-blur rounded-2xl p-4 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{generatedCode}</pre>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedCode)}
                      className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedCode], { type: 'text/typescript' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'Composition.tsx';
                        a.click();
                      }}
                      className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-white/10 rounded-xl text-left hover:bg-white/15 transition">
                    <div className="text-2xl mb-2">🎙️</div>
                    <div className="text-white font-medium text-sm">Transcribe</div>
                    <div className="text-white/50 text-xs">Generate captions</div>
                  </button>
                  <button className="p-4 bg-white/10 rounded-xl text-left hover:bg-white/15 transition">
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-white font-medium text-sm">Generate B-Roll</div>
                    <div className="text-white/50 text-xs">AI video clips</div>
                  </button>
                  <button className="p-4 bg-white/10 rounded-xl text-left hover:bg-white/15 transition">
                    <div className="text-2xl mb-2">🔊</div>
                    <div className="text-white font-medium text-sm">Add Voiceover</div>
                    <div className="text-white/50 text-xs">ElevenLabs TTS</div>
                  </button>
                  <button className="p-4 bg-white/10 rounded-xl text-left hover:bg-white/15 transition">
                    <div className="text-2xl mb-2">🎵</div>
                    <div className="text-white font-medium text-sm">Add Music</div>
                    <div className="text-white/50 text-xs">Background audio</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <main className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-8">Video Templates</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplateCard
              title="Talking Head"
              description="Perfect for YouTube videos, tutorials, and vlogs"
              tags={['Captions', 'B-Roll', 'Intro/Outro']}
            />
            <TemplateCard
              title="Product Demo"
              description="Showcase your app or product with screen recordings"
              tags={['Screen Capture', 'Voiceover', 'Zoom Effects']}
            />
            <TemplateCard
              title="Short Form"
              description="Optimized for TikTok, Reels, and Shorts"
              tags={['9:16 Ratio', 'Fast Cuts', 'Trending Captions']}
            />
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/50 text-sm">
          Built with Remotion + Next.js by Ruck Vibe Codes
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
}

function WorkflowStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
        {number}
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );
}

function TemplateCard({ title, description, tags }: { title: string; description: string; tags: string[] }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/15 transition cursor-pointer">
      <div className="aspect-video bg-black/30 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-4xl">🎬</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
