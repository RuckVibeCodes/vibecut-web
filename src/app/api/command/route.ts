// VibeCut Command API
// Geoffrey uses this to control VibeCut via chat
// Commands: create, upload, transcribe, analyze, style, camera, broll, text, sound, music, render

import { NextResponse } from 'next/server';
import ProjectStore from '@/lib/projectStore';
import {
  CaptionStyle,
  ColorGrade,
  CameraKeyframe,
  BRollClip,
  TextOverlay,
  SoundEffect,
  MusicTrack,
  DEFAULT_CAPTION_STYLE,
} from '@/lib/types/project';

// Caption style presets
const CAPTION_PRESETS: Record<string, Partial<CaptionStyle>> = {
  'tiktok-bounce': {
    fontFamily: 'Inter, sans-serif',
    fontSize: 56,
    fontWeight: 800,
    color: '#FFFFFF',
    position: 'bottom',
    animation: 'bounce',
    outlineColor: '#000000',
    outlineWidth: 3,
  },
  'yellow-impact': {
    fontFamily: 'Impact, sans-serif',
    fontSize: 64,
    fontWeight: 700,
    color: '#FFE500',
    position: 'bottom',
    animation: 'bounce',
    outlineColor: '#000000',
    outlineWidth: 4,
  },
  'minimal-white': {
    fontFamily: 'Inter, sans-serif',
    fontSize: 42,
    fontWeight: 500,
    color: '#FFFFFF',
    position: 'bottom',
    animation: 'fade',
    outlineColor: 'transparent',
    outlineWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  'documentary': {
    fontFamily: 'Georgia, serif',
    fontSize: 48,
    fontWeight: 400,
    color: '#FFFFFF',
    position: 'bottom',
    animation: 'fade',
    outlineColor: '#000000',
    outlineWidth: 2,
  },
  'highlight-pop': {
    fontFamily: 'Inter, sans-serif',
    fontSize: 52,
    fontWeight: 700,
    color: '#FFFFFF',
    position: 'center',
    animation: 'highlight',
    highlightColor: '#FF3366',
    outlineColor: '#000000',
    outlineWidth: 2,
  },
};

// Color grade presets
const COLOR_PRESETS: Record<string, ColorGrade> = {
  'none': { id: 'none', name: 'Original', filter: 'none' },
  'warm': { id: 'warm', name: 'Warm', filter: 'sepia(0.15) saturate(1.1) brightness(1.05)' },
  'cool': { id: 'cool', name: 'Cool', filter: 'saturate(0.9) hue-rotate(-10deg) brightness(1.05)' },
  'noir': { id: 'noir', name: 'Noir', filter: 'grayscale(0.8) contrast(1.2) brightness(0.95)' },
  'vintage': { id: 'vintage', name: 'Vintage', filter: 'sepia(0.3) contrast(0.9) brightness(1.1) saturate(0.8)' },
  'cinematic': { id: 'cinematic', name: 'Cinematic', filter: 'contrast(1.1) saturate(1.15) brightness(0.95)' },
  'late-night': { id: 'late-night', name: 'Late Night', filter: 'saturate(0.85) brightness(0.85) contrast(1.15) hue-rotate(-5deg)' },
  'golden-hour': { id: 'golden-hour', name: 'Golden Hour', filter: 'sepia(0.2) saturate(1.3) brightness(1.1) contrast(1.05)' },
};

interface CommandRequest {
  command: string;
  projectId?: string;
  params?: Record<string, unknown>;
}

const VALID_ASPECT_RATIOS = new Set(['16:9', '9:16', '1:1', '4:5']);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body: CommandRequest = await request.json();
    const { command, projectId, params = {} } = body;

    if (!isNonEmptyString(command)) {
      return badRequest('Command is required');
    }

    // Commands that don't need a project
    if (command === 'create') {
      const name = isNonEmptyString(params.name) ? params.name.trim() : `Project ${Date.now()}`;
      const project = ProjectStore.create(name);
      return NextResponse.json({
        success: true,
        message: `Created project "${project.name}"`,
        project,
      });
    }

    if (command === 'list') {
      const projects = ProjectStore.list();
      return NextResponse.json({
        success: true,
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          duration: p.duration,
          hasTranscript: !!p.transcript,
          updatedAt: p.updatedAt,
        })),
      });
    }

    if (command === 'presets') {
      return NextResponse.json({
        success: true,
        captionPresets: Object.keys(CAPTION_PRESETS),
        colorPresets: Object.keys(COLOR_PRESETS),
      });
    }

    // Commands that need a project
    if (!projectId) {
      return badRequest('Project ID required for this command');
    }

    const project = ProjectStore.get(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    switch (command) {
      case 'get': {
        return NextResponse.json({ success: true, project });
      }

      case 'set-source': {
        const { url, duration } = params as { url: string; duration: number };

        if (!isNonEmptyString(url)) {
          return badRequest('Source video URL is required');
        }

        const safeDuration = asFiniteNumber(duration);
        if (safeDuration === null || safeDuration <= 0) {
          return badRequest('Source video duration must be a positive number');
        }

        const updated = ProjectStore.setSourceVideo(projectId, url.trim(), safeDuration);
        return NextResponse.json({
          success: true,
          message: `Source video set (${safeDuration}s)`,
          project: updated,
        });
      }

      case 'set-transcript': {
        const { transcript } = params as { transcript: { text: string; words: Array<{ word: string; start: number; end: number; confidence: number }> } };

        if (!transcript || !isNonEmptyString(transcript.text) || !Array.isArray(transcript.words)) {
          return badRequest('Transcript with text and words is required');
        }

        if (transcript.words.length === 0) {
          return badRequest('Transcript must include at least one word');
        }

        const invalidWord = transcript.words.find(
          (word) =>
            !isNonEmptyString(word.word) ||
            asFiniteNumber(word.start) === null ||
            asFiniteNumber(word.end) === null ||
            asFiniteNumber(word.confidence) === null
        );
        if (invalidWord) {
          return badRequest('Each transcript word needs word, start, end, and confidence');
        }

        const updated = ProjectStore.setTranscript(projectId, {
          ...transcript,
          duration: project.duration,
          confidence: transcript.words.reduce((acc, w) => acc + w.confidence, 0) / transcript.words.length,
        });
        return NextResponse.json({
          success: true,
          message: `Transcript set (${transcript.words.length} words)`,
          project: updated,
        });
      }

      case 'set-caption-style': {
        const { preset, custom } = params as { preset?: string; custom?: Partial<CaptionStyle> };
        
        let style: CaptionStyle;
        if (preset && CAPTION_PRESETS[preset]) {
          style = {
            ...DEFAULT_CAPTION_STYLE,
            ...CAPTION_PRESETS[preset],
            id: preset,
            name: preset,
          };
        } else if (custom) {
          style = { ...project.captionStyle, ...custom };
        } else {
          return NextResponse.json({ error: 'Preset or custom style required' }, { status: 400 });
        }

        const updated = ProjectStore.setCaptionStyle(projectId, style);
        return NextResponse.json({
          success: true,
          message: `Caption style set to "${style.name}"`,
          project: updated,
        });
      }

      case 'set-color-grade': {
        const { preset, custom } = params as { preset?: string; custom?: ColorGrade };
        
        const grade = preset ? COLOR_PRESETS[preset] : custom;
        if (!grade) {
          return NextResponse.json({ error: 'Invalid color grade' }, { status: 400 });
        }

        const updated = ProjectStore.setColorGrade(projectId, grade);
        return NextResponse.json({
          success: true,
          message: `Color grade set to "${grade.name}"`,
          project: updated,
        });
      }

      case 'add-camera-keyframe': {
        const { time, scale = 1, x = 0, y = 0, easing = 'ease-in-out' } = params as Partial<CameraKeyframe> & { time: number };

        const safeTime = asFiniteNumber(time);
        const safeScale = asFiniteNumber(scale);
        const safeX = asFiniteNumber(x);
        const safeY = asFiniteNumber(y);

        if (safeTime === null || safeTime < 0) {
          return badRequest('Camera keyframe time must be a non-negative number');
        }

        if (safeScale === null || safeScale <= 0 || safeX === null || safeY === null) {
          return badRequest('Camera keyframe scale, x, and y must be valid numbers');
        }
        
        const keyframe: CameraKeyframe = { time: safeTime, scale: safeScale, x: safeX, y: safeY, easing: easing as CameraKeyframe['easing'] };
        const updated = ProjectStore.addCameraKeyframe(projectId, keyframe);
        
        return NextResponse.json({
          success: true,
          message: `Camera keyframe added at ${safeTime}s (scale: ${safeScale}, position: ${safeX},${safeY})`,
          project: updated,
        });
      }

      case 'set-camera-keyframes': {
        const { keyframes } = params as { keyframes: CameraKeyframe[] };

        if (!Array.isArray(keyframes)) {
          return badRequest('Keyframes array is required');
        }

        const updated = ProjectStore.setCameraKeyframes(projectId, keyframes);
        
        return NextResponse.json({
          success: true,
          message: `Set ${keyframes.length} camera keyframes`,
          project: updated,
        });
      }

      case 'add-broll': {
        const {
          url,
          prompt,
          startTime,
          duration = 3,
          opacity = 1,
          position = 'fullscreen',
          transition = 'fade',
          type = 'library',
        } = params as Partial<BRollClip> & { startTime: number };

        if (!url && !prompt) {
          return badRequest('URL or prompt required');
        }

        if (asFiniteNumber(startTime) === null || startTime < 0 || asFiniteNumber(duration) === null || duration <= 0) {
          return badRequest('B-roll startTime must be non-negative and duration must be positive');
        }

        const clip: BRollClip = {
          id: `broll-${Date.now()}`,
          type: type as BRollClip['type'],
          url: url || '', // Will be filled after generation
          prompt,
          startTime,
          duration,
          opacity,
          position: position as BRollClip['position'],
          transition: transition as BRollClip['transition'],
        };

        const updated = ProjectStore.addBRoll(projectId, clip);
        return NextResponse.json({
          success: true,
          message: `B-roll added at ${startTime}s (${duration}s duration)`,
          clipId: clip.id,
          project: updated,
        });
      }

      case 'remove-broll': {
        const { clipId } = params as { clipId: string };
        if (!isNonEmptyString(clipId)) {
          return badRequest('Clip ID is required');
        }
        const updated = ProjectStore.removeBRoll(projectId, clipId);
        return NextResponse.json({
          success: true,
          message: 'B-roll removed',
          project: updated,
        });
      }

      case 'add-text': {
        const {
          text,
          type = 'callout',
          startTime,
          endTime,
          position = { x: 50, y: 50 },
          style = {},
        } = params as {
          text: string;
          type?: TextOverlay['type'];
          startTime: number;
          endTime?: number;
          position?: { x: number; y: number };
          style?: Partial<TextOverlay['style']>;
        };

        if (!isNonEmptyString(text)) {
          return badRequest('Text overlay content is required');
        }

        if (asFiniteNumber(startTime) === null || startTime < 0 || (endTime !== undefined && (asFiniteNumber(endTime) === null || endTime <= startTime))) {
          return badRequest('Text overlay needs a non-negative startTime and optional endTime after startTime');
        }

        const overlay: TextOverlay = {
          id: `text-${Date.now()}`,
          type,
          text,
          startTime,
          endTime: endTime || startTime + 3,
          position,
          style: {
            fontSize: 48,
            fontWeight: 700,
            color: '#FFFFFF',
            animation: type === 'impact' ? 'slam' : 'fade',
            ...style,
          },
        };

        const updated = ProjectStore.addTextOverlay(projectId, overlay);
        return NextResponse.json({
          success: true,
          message: `Text overlay "${text}" added at ${startTime}s`,
          overlayId: overlay.id,
          project: updated,
        });
      }

      case 'remove-text': {
        const { overlayId } = params as { overlayId: string };
        if (!isNonEmptyString(overlayId)) {
          return badRequest('Overlay ID is required');
        }
        const updated = ProjectStore.removeTextOverlay(projectId, overlayId);
        return NextResponse.json({
          success: true,
          message: 'Text overlay removed',
          project: updated,
        });
      }

      case 'add-sound': {
        const {
          name,
          url,
          startTime,
          volume = 0.8,
          category = 'transition',
        } = params as {
          name: string;
          url: string;
          startTime: number;
          volume?: number;
          category?: SoundEffect['category'];
        };

        if (!isNonEmptyString(name) || !isNonEmptyString(url)) {
          return badRequest('Sound effect name and URL are required');
        }

        if (asFiniteNumber(startTime) === null || startTime < 0 || asFiniteNumber(volume) === null || volume < 0 || volume > 1) {
          return badRequest('Sound effect startTime must be non-negative and volume must be between 0 and 1');
        }

        const sound: SoundEffect = {
          id: `sound-${Date.now()}`,
          name,
          url,
          startTime,
          volume,
          category,
        };

        const updated = ProjectStore.addSoundEffect(projectId, sound);
        return NextResponse.json({
          success: true,
          message: `Sound effect "${name}" added at ${startTime}s`,
          soundId: sound.id,
          project: updated,
        });
      }

      case 'set-music': {
        const {
          name,
          url,
          startTime = 0,
          endTime,
          volume = 0.3,
          fadeIn = 2,
          fadeOut = 3,
        } = params as Partial<MusicTrack> & { name: string; url: string };

        if (!isNonEmptyString(name) || !isNonEmptyString(url)) {
          return badRequest('Music track name and URL are required');
        }

        if (
          asFiniteNumber(startTime) === null ||
          startTime < 0 ||
          (endTime !== undefined && (asFiniteNumber(endTime) === null || endTime <= startTime)) ||
          asFiniteNumber(volume) === null ||
          volume < 0 ||
          volume > 1
        ) {
          return badRequest('Music timing must be valid and volume must be between 0 and 1');
        }

        const track: MusicTrack = {
          id: `music-${Date.now()}`,
          name,
          url,
          startTime,
          endTime,
          volume,
          fadeIn,
          fadeOut,
        };

        const updated = ProjectStore.setMusicTrack(projectId, track);
        return NextResponse.json({
          success: true,
          message: `Music track "${name}" set`,
          project: updated,
        });
      }

      case 'remove-music': {
        const updated = ProjectStore.setMusicTrack(projectId, undefined);
        return NextResponse.json({
          success: true,
          message: 'Music track removed',
          project: updated,
        });
      }

      case 'set-narrative': {
        const { sections, suggestions } = params as {
          sections: Array<{ type: string; startTime: number; endTime: number; summary: string }>;
          suggestions: Array<{ id: string; type: string; time: number; reason: string; prompt?: string }>;
        };

        if (!Array.isArray(sections) || !Array.isArray(suggestions)) {
          return badRequest('Narrative sections and suggestions arrays are required');
        }

        const updated = ProjectStore.setNarrativeAnalysis(
          projectId,
          sections.map(s => ({ ...s, type: s.type as 'intro' | 'setup' | 'conflict' | 'climax' | 'resolution' | 'outro' })),
          suggestions.map(s => ({
            ...s,
            type: s.type as 'zoom' | 'broll' | 'reaction' | 'sound' | 'text-callout' | 'chapter',
            applied: false,
          }))
        );
        return NextResponse.json({
          success: true,
          message: `Narrative analysis set (${sections.length} sections, ${suggestions.length} suggestions)`,
          project: updated,
        });
      }

      case 'apply-suggestion': {
        const { suggestionId } = params as { suggestionId: string };
        if (!isNonEmptyString(suggestionId)) {
          return badRequest('Suggestion ID is required');
        }

        if (!project.enhancementSuggestions?.some((suggestion) => suggestion.id === suggestionId)) {
          return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        const updated = ProjectStore.applySuggestion(projectId, suggestionId);
        return NextResponse.json({
          success: true,
          message: 'Suggestion applied',
          project: updated,
        });
      }

      case 'queue-export': {
        const { aspectRatios = ['16:9'] } = params as { aspectRatios?: ('16:9' | '9:16' | '1:1' | '4:5')[] };

        if (!Array.isArray(aspectRatios) || aspectRatios.length === 0) {
          return badRequest('At least one aspect ratio is required');
        }

        const invalidRatio = aspectRatios.find((ratio) => !VALID_ASPECT_RATIOS.has(ratio));
        if (invalidRatio) {
          return badRequest(`Invalid aspect ratio: ${invalidRatio}`);
        }
        
        let updated = project;
        for (const ratio of aspectRatios) {
          updated = ProjectStore.addExport(projectId, ratio) || updated;
        }

        return NextResponse.json({
          success: true,
          message: `Queued exports: ${aspectRatios.join(', ')}`,
          project: updated,
        });
      }

      case 'apply-all-suggestions': {
        if (!project.enhancementSuggestions) {
          return NextResponse.json({ error: 'No suggestions to apply' }, { status: 400 });
        }

        let updated = project;
        let appliedCount = 0;
        for (const suggestion of project.enhancementSuggestions) {
          if (!suggestion.applied) {
            updated = ProjectStore.applySuggestion(projectId, suggestion.id) || updated;
            appliedCount += 1;
          }
        }

        return NextResponse.json({
          success: true,
          message: `Applied ${appliedCount} suggestions`,
          project: updated,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown command: ${command}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Command error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Command failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available commands
export async function GET() {
  return NextResponse.json({
    success: true,
    commands: [
      { name: 'create', params: ['name'], description: 'Create new project' },
      { name: 'list', params: [], description: 'List all projects' },
      { name: 'get', params: ['projectId'], description: 'Get project details' },
      { name: 'presets', params: [], description: 'List available presets' },
      { name: 'set-source', params: ['projectId', 'url', 'duration'], description: 'Set source video' },
      { name: 'set-transcript', params: ['projectId', 'transcript'], description: 'Set transcript' },
      { name: 'set-caption-style', params: ['projectId', 'preset|custom'], description: 'Set caption style' },
      { name: 'set-color-grade', params: ['projectId', 'preset|custom'], description: 'Set color grade' },
      { name: 'add-camera-keyframe', params: ['projectId', 'time', 'scale', 'x', 'y'], description: 'Add camera move' },
      { name: 'add-broll', params: ['projectId', 'url|prompt', 'startTime', 'duration'], description: 'Add b-roll clip' },
      { name: 'add-text', params: ['projectId', 'text', 'type', 'startTime', 'endTime'], description: 'Add text overlay' },
      { name: 'add-sound', params: ['projectId', 'name', 'url', 'startTime'], description: 'Add sound effect' },
      { name: 'set-music', params: ['projectId', 'name', 'url'], description: 'Set background music' },
      { name: 'set-narrative', params: ['projectId', 'sections', 'suggestions'], description: 'Set narrative analysis' },
      { name: 'apply-suggestion', params: ['projectId', 'suggestionId'], description: 'Apply enhancement suggestion' },
      { name: 'apply-all-suggestions', params: ['projectId'], description: 'Apply all suggestions' },
      { name: 'queue-export', params: ['projectId', 'aspectRatios'], description: 'Queue video export' },
    ],
    captionPresets: Object.keys(CAPTION_PRESETS),
    colorPresets: Object.keys(COLOR_PRESETS),
  });
}
