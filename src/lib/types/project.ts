// VibeCut Project Types
// Defines the complete state of a video project

export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface Transcript {
  text: string;
  words: Word[];
  duration: number;
  confidence: number;
}

export interface CaptionStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'bounce' | 'fade' | 'typewriter' | 'highlight';
  highlightColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
}

export interface CameraKeyframe {
  time: number; // seconds
  scale: number; // 1 = normal, 1.5 = 50% zoom
  x: number; // pan x (-100 to 100)
  y: number; // pan y (-100 to 100)
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface BRollClip {
  id: string;
  type: 'generated' | 'library' | 'uploaded';
  url: string;
  prompt?: string; // if generated
  startTime: number; // when to show in main video
  duration: number;
  opacity: number;
  position: 'fullscreen' | 'pip-top-right' | 'pip-top-left' | 'pip-bottom-right' | 'pip-bottom-left';
  transition: 'cut' | 'fade' | 'slide';
}

export interface TextOverlay {
  id: string;
  type: 'callout' | 'lower-third' | 'chapter' | 'impact';
  text: string;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontWeight: number;
    color: string;
    backgroundColor?: string;
    animation: 'slam' | 'fade' | 'typewriter' | 'slide';
  };
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  startTime: number;
  volume: number; // 0-1
  category: 'transition' | 'impact' | 'ambient' | 'ui';
}

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  startTime: number;
  endTime?: number; // if not set, plays to end
  volume: number;
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

export interface ColorGrade {
  id: string;
  name: string;
  filter: string; // CSS filter string
}

export interface NarrativeSection {
  type: 'intro' | 'setup' | 'conflict' | 'climax' | 'resolution' | 'outro';
  startTime: number;
  endTime: number;
  summary: string;
}

export interface EnhancementSuggestion {
  id: string;
  type: 'zoom' | 'broll' | 'reaction' | 'sound' | 'text-callout' | 'chapter';
  time: number;
  reason: string;
  prompt?: string; // for generated content
  applied: boolean;
}

export interface ExportSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  quality: 'draft' | 'standard' | 'high';
  format: 'mp4' | 'webm';
  fps: 30 | 60;
  resolution: '720p' | '1080p' | '4k';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  
  // Source
  sourceVideoUrl?: string;
  sourceVideoFile?: string;
  duration: number;
  
  // Transcript
  transcript?: Transcript;
  transcriptEdited: boolean;
  
  // Narrative Analysis
  narrativeSections?: NarrativeSection[];
  enhancementSuggestions?: EnhancementSuggestion[];
  
  // Styling
  captionStyle: CaptionStyle;
  colorGrade: ColorGrade;
  
  // Enhancements
  cameraKeyframes: CameraKeyframe[];
  brollClips: BRollClip[];
  textOverlays: TextOverlay[];
  soundEffects: SoundEffect[];
  musicTrack?: MusicTrack;
  
  // Export
  exports: {
    aspectRatio: ExportSettings['aspectRatio'];
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    url?: string;
    error?: string;
  }[];
}

// Default values
export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  id: 'default',
  name: 'Default',
  fontFamily: 'Inter, sans-serif',
  fontSize: 48,
  fontWeight: 700,
  color: '#FFFFFF',
  position: 'bottom',
  animation: 'bounce',
  outlineColor: '#000000',
  outlineWidth: 2,
};

export const DEFAULT_COLOR_GRADE: ColorGrade = {
  id: 'none',
  name: 'Original',
  filter: 'none',
};

export const createEmptyProject = (name: string): Project => ({
  id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  duration: 0,
  transcriptEdited: false,
  captionStyle: DEFAULT_CAPTION_STYLE,
  colorGrade: DEFAULT_COLOR_GRADE,
  cameraKeyframes: [],
  brollClips: [],
  textOverlays: [],
  soundEffects: [],
  exports: [],
});
