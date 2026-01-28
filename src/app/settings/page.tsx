'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKeys {
  openai: string;
  anthropic: string;
  elevenlabs: string;
  replicate: string;
  deepgram: string;
  wavespeed: string;
}

const API_KEY_CONFIG = [
  {
    key: 'openai' as const,
    name: 'OpenAI',
    description: 'For GPT models, DALL-E, and Whisper transcription',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    key: 'anthropic' as const,
    name: 'Anthropic (Claude)',
    description: 'For Claude models - video script generation and editing prompts',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    key: 'elevenlabs' as const,
    name: 'ElevenLabs',
    description: 'For AI voiceovers and text-to-speech',
    placeholder: 'xi-...',
    docsUrl: 'https://elevenlabs.io/app/settings/api-keys',
  },
  {
    key: 'replicate' as const,
    name: 'Replicate',
    description: 'For AI video generation (Veo) and image generation',
    placeholder: 'r8_...',
    docsUrl: 'https://replicate.com/account/api-tokens',
  },
  {
    key: 'deepgram' as const,
    name: 'Deepgram',
    description: 'For fast, accurate transcription with word-level timestamps',
    placeholder: '',
    docsUrl: 'https://console.deepgram.com/',
  },
  {
    key: 'wavespeed' as const,
    name: 'WaveSpeed AI',
    description: 'For AI video/image generation — 700+ models including Sora, Wan, Seedream',
    placeholder: '',
    docsUrl: 'https://wavespeed.ai/settings/api-keys',
  },
];

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    elevenlabs: '',
    replicate: '',
    deepgram: '',
    wavespeed: '',
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'openai' | 'anthropic'>('anthropic');

  // Load keys from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vibecut-api-keys');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setKeys(parsed);
      } catch (e) {
        console.error('Failed to parse stored keys:', e);
      }
    }
    
    const provider = localStorage.getItem('vibecut-llm-provider') as 'openai' | 'anthropic' | null;
    if (provider) {
      setActiveProvider(provider);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('vibecut-api-keys', JSON.stringify(keys));
    localStorage.setItem('vibecut-llm-provider', activeProvider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getKeyStatus = (key: keyof ApiKeys) => {
    const value = keys[key];
    if (!value) return 'missing';
    if (value.length < 10) return 'invalid';
    return 'configured';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
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
            <span className="text-sm font-medium text-white">Settings</span>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Configure your API keys to enable AI features</p>
        </div>

        {/* LLM Provider Selection */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Default LLM Provider</h2>
          <p className="text-white/60 text-sm mb-4">
            Choose which AI model to use for video editing prompts and script generation.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveProvider('anthropic')}
              className={`flex-1 p-4 rounded-xl border-2 transition ${
                activeProvider === 'anthropic'
                  ? 'border-pink-500 bg-pink-500/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-white font-medium">Claude</div>
              <div className="text-white/60 text-sm">Anthropic</div>
            </button>
            <button
              onClick={() => setActiveProvider('openai')}
              className={`flex-1 p-4 rounded-xl border-2 transition ${
                activeProvider === 'openai'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-white font-medium">GPT-4</div>
              <div className="text-white/60 text-sm">OpenAI</div>
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">API Keys</h2>
          <p className="text-white/60 text-sm mb-6">
            Your keys are stored locally in your browser. They are never sent to our servers.
          </p>

          <div className="space-y-6">
            {API_KEY_CONFIG.map((config) => {
              const status = getKeyStatus(config.key);
              return (
                <div key={config.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{config.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          status === 'configured'
                            ? 'bg-green-500/20 text-green-400'
                            : status === 'invalid'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {status === 'configured' ? '✓ Configured' : status === 'invalid' ? '⚠ Invalid' : 'Not set'}
                      </span>
                    </div>
                    <a
                      href={config.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Get API Key →
                    </a>
                  </div>
                  <p className="text-white/50 text-sm">{config.description}</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys[config.key] ? 'text' : 'password'}
                        value={keys[config.key]}
                        onChange={(e) => setKeys({ ...keys, [config.key]: e.target.value })}
                        placeholder={config.placeholder || 'Enter API key...'}
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                      />
                    </div>
                    <button
                      onClick={() => toggleShowKey(config.key)}
                      className="px-4 py-3 bg-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition"
                    >
                      {showKeys[config.key] ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`px-8 py-3 rounded-xl font-semibold transition ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-white text-indigo-900 hover:bg-white/90'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
          <h3 className="text-white font-medium mb-2">🔒 Privacy Note</h3>
          <p className="text-white/70 text-sm">
            All API keys are stored locally in your browser&apos;s localStorage. They are only sent directly 
            to the respective API providers when you use features that require them. VibeCut does not 
            have access to your keys.
          </p>
        </div>
      </main>
    </div>
  );
}
