// VibeCut AI Integration Types

// ============================================================================
// WaveSpeed API Types
// ============================================================================

export type WaveSpeedModel = 
  | 'pixverse-v4.5'
  | 'vidu-q1'
  | 'wan-2.1'
  | 'flux-dev'
  | 'flux-schnell'
  | 'elevenlabs-tts'
  | 'lipsync-v2';

export interface WaveSpeedRequestBase {
  model: WaveSpeedModel;
}

export interface WaveSpeedError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface WaveSpeedResponse<T> {
  success: boolean;
  data?: T;
  error?: WaveSpeedError;
  requestId?: string;
}

// Video Generation
export interface VideoGenerationRequest extends WaveSpeedRequestBase {
  prompt: string;
  duration?: number; // 2-10 seconds
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
  quality?: 'standard' | 'high' | 'ultra';
  negativePrompt?: string;
  seed?: number;
  fps?: number;
}

export interface VideoGenerationResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  width: number;
  height: number;
  model: WaveSpeedModel;
  generationTimeMs: number;
}

// Image Generation
export interface ImageGenerationRequest extends WaveSpeedRequestBase {
  prompt: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  guidance?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  width: number;
  height: number;
  model: WaveSpeedModel;
  seed: number;
}

// TTS Generation
export interface TTSRequest extends WaveSpeedRequestBase {
  text: string;
  voiceId: string;
  stability?: number; // 0-1
  similarityBoost?: number; // 0-1
  style?: number; // 0-1
  speakerBoost?: boolean;
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
  voiceId: string;
  characterCount: number;
}

// Lipsync Generation
export interface LipsyncRequest extends WaveSpeedRequestBase {
  imageUrl: string;
  audioUrl: string;
  enhanceFace?: boolean;
  outputFormat?: 'mp4' | 'webm';
}

export interface LipsyncResult {
  videoUrl: string;
  duration: number;
  originalImageUrl: string;
  generationTimeMs: number;
}

// ============================================================================
// Narrative Analysis Types (Claude-powered)
// ============================================================================

export type NarrativeSectionType = 
  | 'intro'
  | 'hook'
  | 'setup'
  | 'conflict'
  | 'rising-action'
  | 'climax'
  | 'falling-action'
  | 'resolution'
  | 'outro'
  | 'transition';

export interface NarrativeSection {
  type: NarrativeSectionType;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  summary: string;
  intensity: number; // 0-1, emotional intensity
  keywords: string[];
}

export interface KeyMoment {
  timestamp: number;
  type: 'emotional-peak' | 'key-point' | 'joke' | 'revelation' | 'call-to-action';
  description: string;
  importance: number; // 1-10
  suggestedEffect?: string;
}

export type EnhancementType = 
  | 'zoom-in'
  | 'zoom-out'
  | 'b-roll'
  | 'text-overlay'
  | 'sound-effect'
  | 'music-swell'
  | 'reaction-cut'
  | 'split-screen'
  | 'slow-motion'
  | 'speed-ramp';

export interface SuggestedEnhancement {
  type: EnhancementType;
  startTime: number;
  endTime: number;
  description: string;
  prompt?: string; // For AI-generated content (b-roll, images)
  intensity?: number; // 0-1
  priority: 'low' | 'medium' | 'high';
}

export interface NarrativeAnalysis {
  sections: NarrativeSection[];
  keyMoments: KeyMoment[];
  suggestedEnhancements: SuggestedEnhancement[];
  overallTone: string;
  pacing: 'slow' | 'moderate' | 'fast' | 'dynamic';
  estimatedEngagement: number; // 1-10
  summary: string;
}

// ============================================================================
// Enhancement Plan Types
// ============================================================================

export type CinematicStyle = 
  | 'documentary'
  | 'vlog'
  | 'tutorial'
  | 'entertainment'
  | 'dramatic'
  | 'comedic'
  | 'minimalist'
  | 'high-energy';

export interface BRollSuggestion {
  timestamp: number;
  duration: number;
  prompt: string;
  style: string;
  context: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MusicSuggestion {
  startTime: number;
  endTime: number;
  mood: string;
  intensity: number;
  genre?: string;
  bpm?: number;
}

export interface TextOverlaySuggestion {
  timestamp: number;
  duration: number;
  text: string;
  style: 'title' | 'subtitle' | 'quote' | 'stat' | 'callout';
  position: 'top' | 'center' | 'bottom';
  animation: string;
}

export interface CameraMovementSuggestion {
  timestamp: number;
  duration: number;
  movement: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'shake' | 'smooth';
  intensity: number; // 0-1
  reason: string;
}

export interface EnhancementPlan {
  style: CinematicStyle;
  bRoll: BRollSuggestion[];
  music: MusicSuggestion[];
  textOverlays: TextOverlaySuggestion[];
  cameraMovements: CameraMovementSuggestion[];
  captionStyle: string;
  colorGrade?: string;
  transitionStyle: 'cut' | 'dissolve' | 'wipe' | 'dynamic';
  overallNotes: string;
}

// ============================================================================
// Transcript Types (extends base)
// ============================================================================

export interface EnhancedTranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
  speaker?: string;
  emotion?: string;
  emphasis?: number; // 0-1
}

export interface TranscriptWithAnalysis {
  words: EnhancedTranscriptWord[];
  text: string;
  duration: number;
  speakers?: string[];
  analysis?: NarrativeAnalysis;
  enhancementPlan?: EnhancementPlan;
}

// ============================================================================
// API Configuration Types
// ============================================================================

export interface WaveSpeedConfig {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface NarrativeConfig {
  anthropicApiKey: string;
  model?: string;
  maxTokens?: number;
}

// ============================================================================
// Job Status Types
// ============================================================================

export type GenerationStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationJob<T> {
  id: string;
  status: GenerationStatus;
  progress: number; // 0-100
  result?: T;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTimeMs?: number;
}
