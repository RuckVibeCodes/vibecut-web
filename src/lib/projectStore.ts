// VibeCut Project Store
// In-memory store for development, can be replaced with DB later

import { 
  Project, 
  createEmptyProject, 
  CaptionStyle, 
  ColorGrade,
  CameraKeyframe,
  BRollClip,
  TextOverlay,
  SoundEffect,
  MusicTrack,
  EnhancementSuggestion,
  NarrativeSection,
  Transcript,
} from './types/project';

// In-memory store (replace with Redis/DB in production)
const projects: Map<string, Project> = new Map();

export const ProjectStore = {
  // CRUD Operations
  create(name: string): Project {
    const project = createEmptyProject(name);
    projects.set(project.id, project);
    return project;
  },

  get(id: string): Project | null {
    return projects.get(id) || null;
  },

  list(): Project[] {
    return Array.from(projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  update(id: string, updates: Partial<Project>): Project | null {
    const project = projects.get(id);
    if (!project) return null;
    
    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    projects.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return projects.delete(id);
  },

  // Source Video
  setSourceVideo(id: string, url: string, duration: number): Project | null {
    return this.update(id, { sourceVideoUrl: url, duration });
  },

  // Transcript
  setTranscript(id: string, transcript: Transcript): Project | null {
    return this.update(id, { transcript, transcriptEdited: false });
  },

  updateTranscript(id: string, transcript: Transcript): Project | null {
    return this.update(id, { transcript, transcriptEdited: true });
  },

  // Narrative Analysis
  setNarrativeAnalysis(
    id: string, 
    sections: NarrativeSection[], 
    suggestions: EnhancementSuggestion[]
  ): Project | null {
    return this.update(id, { 
      narrativeSections: sections, 
      enhancementSuggestions: suggestions 
    });
  },

  applySuggestion(id: string, suggestionId: string): Project | null {
    const project = projects.get(id);
    if (!project || !project.enhancementSuggestions) return null;

    const suggestions = project.enhancementSuggestions.map(s =>
      s.id === suggestionId ? { ...s, applied: true } : s
    );
    return this.update(id, { enhancementSuggestions: suggestions });
  },

  // Styling
  setCaptionStyle(id: string, style: CaptionStyle): Project | null {
    return this.update(id, { captionStyle: style });
  },

  setColorGrade(id: string, grade: ColorGrade): Project | null {
    return this.update(id, { colorGrade: grade });
  },

  // Camera
  addCameraKeyframe(id: string, keyframe: CameraKeyframe): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const keyframes = [...project.cameraKeyframes, keyframe].sort(
      (a, b) => a.time - b.time
    );
    return this.update(id, { cameraKeyframes: keyframes });
  },

  removeCameraKeyframe(id: string, time: number): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const keyframes = project.cameraKeyframes.filter(k => k.time !== time);
    return this.update(id, { cameraKeyframes: keyframes });
  },

  setCameraKeyframes(id: string, keyframes: CameraKeyframe[]): Project | null {
    return this.update(id, { cameraKeyframes: keyframes.sort((a, b) => a.time - b.time) });
  },

  // B-Roll
  addBRoll(id: string, clip: BRollClip): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const clips = [...project.brollClips, clip].sort(
      (a, b) => a.startTime - b.startTime
    );
    return this.update(id, { brollClips: clips });
  },

  removeBRoll(id: string, clipId: string): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const clips = project.brollClips.filter(c => c.id !== clipId);
    return this.update(id, { brollClips: clips });
  },

  updateBRoll(id: string, clipId: string, updates: Partial<BRollClip>): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const clips = project.brollClips.map(c =>
      c.id === clipId ? { ...c, ...updates } : c
    );
    return this.update(id, { brollClips: clips });
  },

  // Text Overlays
  addTextOverlay(id: string, overlay: TextOverlay): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const overlays = [...project.textOverlays, overlay].sort(
      (a, b) => a.startTime - b.startTime
    );
    return this.update(id, { textOverlays: overlays });
  },

  removeTextOverlay(id: string, overlayId: string): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const overlays = project.textOverlays.filter(o => o.id !== overlayId);
    return this.update(id, { textOverlays: overlays });
  },

  updateTextOverlay(id: string, overlayId: string, updates: Partial<TextOverlay>): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const overlays = project.textOverlays.map(o =>
      o.id === overlayId ? { ...o, ...updates } : o
    );
    return this.update(id, { textOverlays: overlays });
  },

  // Sound Effects
  addSoundEffect(id: string, sound: SoundEffect): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const sounds = [...project.soundEffects, sound].sort(
      (a, b) => a.startTime - b.startTime
    );
    return this.update(id, { soundEffects: sounds });
  },

  removeSoundEffect(id: string, soundId: string): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const sounds = project.soundEffects.filter(s => s.id !== soundId);
    return this.update(id, { soundEffects: sounds });
  },

  // Music
  setMusicTrack(id: string, track: MusicTrack | undefined): Project | null {
    return this.update(id, { musicTrack: track });
  },

  // Export
  addExport(
    id: string, 
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  ): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    // Check if this aspect ratio already exists
    const existingIndex = project.exports.findIndex(e => e.aspectRatio === aspectRatio);
    
    if (existingIndex >= 0) {
      // Update existing
      const exports = [...project.exports];
      exports[existingIndex] = { aspectRatio, status: 'pending' };
      return this.update(id, { exports });
    } else {
      // Add new
      const exports = [...project.exports, { aspectRatio, status: 'pending' as const }];
      return this.update(id, { exports });
    }
  },

  updateExportStatus(
    id: string,
    aspectRatio: string,
    status: 'pending' | 'rendering' | 'completed' | 'failed',
    url?: string,
    error?: string
  ): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const exports = project.exports.map(e =>
      e.aspectRatio === aspectRatio ? { ...e, status, url, error } : e
    );
    return this.update(id, { exports });
  },
};

export default ProjectStore;
