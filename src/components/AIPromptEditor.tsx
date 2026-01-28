'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlock?: string;
}

interface Props {
  onGenerateCode?: (code: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Create a 30-second intro with my logo fading in, then a title slide",
  "Add animated captions that pop up word by word",
  "Generate b-roll of a city skyline for the background",
  "Add a smooth zoom effect on the speaker when they make a key point",
  "Create a TikTok-style vertical video with trending caption style",
];

export function AIPromptEditor({ onGenerateCode }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your AI video editor. Describe what you want to create and I'll generate the Remotion code for you. You can ask me to:\n\n• Create intro/outro sequences\n• Add animated captions\n• Generate b-roll suggestions\n• Apply zoom and transition effects\n• Build entire video compositions\n\nWhat would you like to create?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API keys are configured
    const stored = localStorage.getItem('vibecut-api-keys');
    if (stored) {
      const keys = JSON.parse(stored);
      const provider = localStorage.getItem('vibecut-llm-provider') || 'anthropic';
      if (provider === 'anthropic' && !keys.anthropic) {
        setApiKeyMissing(true);
      } else if (provider === 'openai' && !keys.openai) {
        setApiKeyMissing(true);
      } else {
        setApiKeyMissing(false);
      }
    } else {
      setApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get API keys and provider from localStorage
      const stored = localStorage.getItem('vibecut-api-keys');
      const provider = localStorage.getItem('vibecut-llm-provider') || 'anthropic';
      
      if (!stored) {
        throw new Error('API keys not configured');
      }

      const keys = JSON.parse(stored);
      const apiKey = provider === 'anthropic' ? keys.anthropic : keys.openai;

      if (!apiKey) {
        throw new Error(`${provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key not configured`);
      }

      // Call the API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          provider,
          apiKey,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        codeBlock: data.code,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.code && onGenerateCode) {
        onGenerateCode(data.code);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${error instanceof Error ? error.message : 'Something went wrong'}. Please check your API keys in Settings.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[600px] bg-black/30 backdrop-blur rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
            ✨
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Video Editor</h3>
            <p className="text-white/50 text-xs">Describe your video, get code</p>
          </div>
        </div>
        {apiKeyMissing && (
          <a
            href="/settings"
            className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full hover:bg-yellow-500/30 transition"
          >
            ⚠️ Configure API Keys
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.codeBlock && (
                <div className="mt-3 bg-black/50 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">{message.codeBlock}</pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message.codeBlock || '');
                    }}
                    className="mt-2 text-xs text-white/50 hover:text-white transition"
                  >
                    📋 Copy code
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-white/40 text-xs mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(prompt)}
                className="text-xs px-3 py-1.5 bg-white/10 text-white/70 rounded-full hover:bg-white/20 hover:text-white transition truncate max-w-[200px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
      </form>
    </div>
  );
}
