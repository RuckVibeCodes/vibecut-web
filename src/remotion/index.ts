// VibeCut Remotion Exports
// All compositions and components for video rendering

// Main composition
export { CinematicVideo, default as CinematicComposition } from './CinematicComposition';

// Components
export { DynamicCamera, SubtleDrift } from './components/DynamicCamera';
export { CinematicCaptions } from './components/CinematicCaptions';
export { 
  ColorGrade, 
  FilmGrain, 
  Vignette, 
  CinematicBars,
  COLOR_GRADES 
} from './components/ColorGrade';

// Re-export types for convenience
export type {
  // These would be imported from the types file
} from '../lib/types/project';
