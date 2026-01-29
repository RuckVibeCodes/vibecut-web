// VibeCut Remotion Compositions - Main Export
// AI Cinematographer video editing components for Remotion

// Main Composition
export {
  CinematicComposition,
  defaultCinematicProps,
  CompositionPresets,
} from './CinematicComposition';
export type { CinematicCompositionProps } from './CinematicComposition';

// Dynamic Camera
export { DynamicCamera, CameraPresets, SubtleDrift } from './components/DynamicCamera';
export type { DynamicCameraProps, CameraKeyframe } from './components/DynamicCamera';

// Cinematic Captions
export {
  CinematicCaptions,
  createCaptionsFromTranscript,
} from './components/CinematicCaptions';
export type { CinematicCaptionsProps } from './components/CinematicCaptions';

// B-Roll Overlay
export { BRollOverlay, createBRollFromTimestamps } from './components/BRollOverlay';
export type { BRollOverlayProps, BRollClip } from './components/BRollOverlay';

// Color Grading
export { ColorGrade, ColorGradePresets, COLOR_GRADES, FilmGrain, Vignette, CinematicBars } from './components/ColorGrade';
export type {
  ColorGradeProps,
  ColorGradeConfig,
  ColorGradePreset,
} from './components/ColorGrade';

// Lower Third Graphics
export { LowerThird } from './components/LowerThird';
export type { LowerThirdProps, LowerThirdConfig } from './components/LowerThird';

// Text Callouts
export { TextCallout, CalloutPresets } from './components/TextCallout';
export type { TextCalloutProps, TextCalloutConfig } from './components/TextCallout';

/**
 * VibeCut Remotion Composition System
 * ===================================
 * 
 * Usage:
 * 
 * ```tsx
 * import { CinematicComposition, CompositionPresets } from '@/remotion';
 * 
 * // Basic usage
 * <CinematicComposition
 *   videoSrc="https://example.com/video.mp4"
 *   transcript={transcriptData}
 *   {...CompositionPresets.tiktok}
 * />
 * 
 * // Full customization
 * <CinematicComposition
 *   videoSrc="https://example.com/video.mp4"
 *   transcript={transcriptData}
 *   captionStyle="mrbeast"
 *   colorGradePreset="vibrant"
 *   cameraKeyframes={[
 *     { frame: 0, scale: 1, x: 0, y: 0 },
 *     { frame: 60, scale: 1.2, x: -5, y: -3 },
 *   ]}
 *   brollClips={[
 *     { id: 'broll1', src: 'clip.mp4', type: 'video', startTime: 5, duration: 3 }
 *   ]}
 *   lowerThirds={[
 *     { name: 'John Doe', title: 'Expert', startTime: 2, duration: 5 }
 *   ]}
 *   callouts={[
 *     { text: 'INCREDIBLE!', startTime: 10, duration: 2, style: 'slam' }
 *   ]}
 *   impactWords={['amazing', 'incredible', 'unbelievable']}
 * />
 * ```
 * 
 * Components can also be used individually for custom compositions.
 */
