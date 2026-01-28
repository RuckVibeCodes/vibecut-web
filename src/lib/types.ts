// VibeCut Core Types

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  aspectRatio: AspectRatio;
  duration: number; // in seconds
  fps: number;
  assets: Asset[];
  transcript?: Transcript;
  composition?: CompositionConfig;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface AspectRatioConfig {
  name: string;
  ratio: AspectRatio;
  width: number;
  height: number;
  platform: string;
  icon: string;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioConfig> = {
  '16:9': { name: 'Landscape', ratio: '16:9', width: 1920, height: 1080, platform: 'YouTube', icon: '📺' },
  '9:16': { name: 'Portrait', ratio: '9:16', width: 1080, height: 1920, platform: 'TikTok/Reels', icon: '📱' },
  '1:1': { name: 'Square', ratio: '1:1', width: 1080, height: 1080, platform: 'Instagram', icon: '⬜' },
  '4:5': { name: 'Portrait', ratio: '4:5', width: 1080, height: 1350, platform: 'Instagram Feed', icon: '📷' },
};

export interface Asset {
  id: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface Transcript {
  words: TranscriptWord[];
  text: string;
  duration: number;
  confidence: number;
}

export interface TranscriptWord {
  word: string;
  start: number; // seconds
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface CompositionConfig {
  captionStyle: CaptionStyleId;
  showCaptions: boolean;
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
}

// Caption Styles
export type CaptionStyleId = 
  | 'classic'
  | 'tiktok-bounce'
  | 'youtube-shorts'
  | 'mrbeast'
  | 'minimal'
  | 'karaoke'
  | 'typewriter'
  | 'neon';

export interface CaptionStyle {
  id: CaptionStyleId;
  name: string;
  description: string;
  preview: string;
  config: {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    animation: 'none' | 'bounce' | 'pop' | 'slide' | 'fade' | 'typewriter' | 'glow';
    position: 'bottom' | 'center' | 'top';
    outline?: boolean;
    outlineColor?: string;
    shadow?: boolean;
    highlightCurrentWord?: boolean;
    highlightColor?: string;
    wordsPerLine: number;
  };
}

export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, readable subtitles',
    preview: '🎬',
    config: {
      fontSize: 48,
      fontWeight: 600,
      fontFamily: 'Inter',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      animation: 'fade',
      position: 'bottom',
      wordsPerLine: 8,
    },
  },
  {
    id: 'tiktok-bounce',
    name: 'TikTok Bounce',
    description: 'Words pop in with bounce effect',
    preview: '🎵',
    config: {
      fontSize: 64,
      fontWeight: 800,
      fontFamily: 'Inter',
      color: '#ffffff',
      animation: 'bounce',
      position: 'center',
      outline: true,
      outlineColor: '#000000',
      highlightCurrentWord: true,
      highlightColor: '#ffff00',
      wordsPerLine: 3,
    },
  },
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    description: 'Bold text with shadow',
    preview: '▶️',
    config: {
      fontSize: 56,
      fontWeight: 700,
      fontFamily: 'Montserrat',
      color: '#ffffff',
      animation: 'pop',
      position: 'center',
      shadow: true,
      highlightCurrentWord: true,
      highlightColor: '#ff0000',
      wordsPerLine: 4,
    },
  },
  {
    id: 'mrbeast',
    name: 'MrBeast Style',
    description: 'Giant impact text',
    preview: '🔥',
    config: {
      fontSize: 80,
      fontWeight: 900,
      fontFamily: 'Impact',
      color: '#ffff00',
      animation: 'pop',
      position: 'center',
      outline: true,
      outlineColor: '#000000',
      wordsPerLine: 2,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Subtle, elegant captions',
    preview: '✨',
    config: {
      fontSize: 36,
      fontWeight: 400,
      fontFamily: 'Inter',
      color: '#ffffff',
      animation: 'fade',
      position: 'bottom',
      wordsPerLine: 10,
    },
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Words highlight as spoken',
    preview: '🎤',
    config: {
      fontSize: 52,
      fontWeight: 700,
      fontFamily: 'Inter',
      color: '#888888',
      animation: 'none',
      position: 'bottom',
      highlightCurrentWord: true,
      highlightColor: '#ffffff',
      wordsPerLine: 6,
    },
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Characters appear one by one',
    preview: '⌨️',
    config: {
      fontSize: 44,
      fontWeight: 500,
      fontFamily: 'JetBrains Mono',
      color: '#00ff00',
      backgroundColor: 'rgba(0,0,0,0.9)',
      animation: 'typewriter',
      position: 'bottom',
      wordsPerLine: 8,
    },
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Glowing neon effect',
    preview: '💜',
    config: {
      fontSize: 56,
      fontWeight: 700,
      fontFamily: 'Inter',
      color: '#ff00ff',
      animation: 'glow',
      position: 'center',
      shadow: true,
      wordsPerLine: 4,
    },
  },
];

// Render Queue
export interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  outputUrl?: string;
  error?: string;
  aspectRatio: AspectRatio;
}
