/**
 * Color Grade Presets for VibeCut
 * CSS filter strings for applying cinematic color grades to video
 */

export type ColorGradeName = 
  | 'none'
  | 'warm'
  | 'cool'
  | 'noir'
  | 'vintage'
  | 'cinematic'
  | 'late-night'
  | 'vibrant'
  | 'muted'
  | 'sepia';

export interface ColorGrade {
  name: ColorGradeName;
  label: string;
  description: string;
  filter: string;
  /** For preview thumbnails - a gradient representing the look */
  previewGradient: string;
}

/**
 * Color grade presets as CSS filter strings
 * 
 * CSS Filter Reference:
 * - brightness(%) - 100% is normal
 * - contrast(%) - 100% is normal
 * - saturate(%) - 100% is normal, 0% is grayscale
 * - sepia(%) - 0% is normal, 100% is full sepia
 * - hue-rotate(deg) - rotates color wheel
 * - invert(%) - 0% is normal
 */
export const colorGrades: Record<ColorGradeName, ColorGrade> = {
  none: {
    name: 'none',
    label: 'Original',
    description: 'No color grading applied',
    filter: 'none',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)'
  },
  
  warm: {
    name: 'warm',
    label: 'Warm',
    description: 'Cozy orange tint, perfect for lifestyle content',
    filter: 'brightness(105%) contrast(105%) saturate(110%) sepia(15%) hue-rotate(-5deg)',
    previewGradient: 'linear-gradient(135deg, #ff9a56 0%, #ffce81 100%)'
  },
  
  cool: {
    name: 'cool',
    label: 'Cool',
    description: 'Blue tech vibes, great for tutorials and coding',
    filter: 'brightness(100%) contrast(110%) saturate(90%) hue-rotate(10deg)',
    previewGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  
  noir: {
    name: 'noir',
    label: 'Noir',
    description: 'High contrast, desaturated for dramatic effect',
    filter: 'brightness(95%) contrast(130%) saturate(30%) grayscale(40%)',
    previewGradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
  },
  
  vintage: {
    name: 'vintage',
    label: 'Vintage',
    description: 'Faded film look with warm shadows',
    filter: 'brightness(100%) contrast(95%) saturate(85%) sepia(25%) hue-rotate(-10deg)',
    previewGradient: 'linear-gradient(135deg, #d4a574 0%, #c9b896 100%)'
  },
  
  cinematic: {
    name: 'cinematic',
    label: 'Cinematic',
    description: 'Teal and orange Hollywood color grade',
    filter: 'brightness(98%) contrast(115%) saturate(105%) hue-rotate(-5deg) sepia(10%)',
    previewGradient: 'linear-gradient(135deg, #ff6b35 0%, #1a535c 100%)'
  },
  
  'late-night': {
    name: 'late-night',
    label: 'Late Night',
    description: 'Dark with blue shadows and warm highlights',
    filter: 'brightness(85%) contrast(120%) saturate(90%) hue-rotate(5deg) sepia(5%)',
    previewGradient: 'linear-gradient(135deg, #0c0c2c 0%, #1a1a4a 50%, #ff7e5f 100%)'
  },
  
  vibrant: {
    name: 'vibrant',
    label: 'Vibrant',
    description: 'Punchy, saturated colors for high energy',
    filter: 'brightness(105%) contrast(115%) saturate(140%)',
    previewGradient: 'linear-gradient(135deg, #ff0099 0%, #493240 50%, #00d4ff 100%)'
  },
  
  muted: {
    name: 'muted',
    label: 'Muted',
    description: 'Soft, desaturated aesthetic',
    filter: 'brightness(102%) contrast(90%) saturate(70%)',
    previewGradient: 'linear-gradient(135deg, #bdc3c7 0%, #a0a5aa 100%)'
  },
  
  sepia: {
    name: 'sepia',
    label: 'Sepia',
    description: 'Classic sepia tone for nostalgic feel',
    filter: 'brightness(100%) contrast(100%) sepia(80%)',
    previewGradient: 'linear-gradient(135deg, #d4a574 0%, #8b7355 100%)'
  }
};

/**
 * Get a color grade by name
 */
export function getColorGrade(name: ColorGradeName): ColorGrade {
  return colorGrades[name] || colorGrades.none;
}

/**
 * Get the CSS filter string for a color grade
 */
export function getColorGradeFilter(name: ColorGradeName): string {
  return colorGrades[name]?.filter || 'none';
}

/**
 * Get all color grade names
 */
export function getColorGradeNames(): ColorGradeName[] {
  return Object.keys(colorGrades) as ColorGradeName[];
}

/**
 * Get all color grades as array (useful for UI components)
 */
export function getAllColorGrades(): ColorGrade[] {
  return Object.values(colorGrades);
}

/**
 * Apply a color grade to an element style
 */
export function applyColorGrade(
  element: HTMLElement | null,
  gradeName: ColorGradeName
): void {
  if (!element) return;
  element.style.filter = getColorGradeFilter(gradeName);
}

/**
 * Combine multiple filters
 */
export function combineFilters(...gradeNames: ColorGradeName[]): string {
  // For combining, we'd need to parse and merge individual values
  // For simplicity, just concatenate (may not always look good)
  const filters = gradeNames
    .map(name => getColorGradeFilter(name))
    .filter(f => f !== 'none');
  
  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Generate custom color grade from parameters
 */
export function createCustomGrade(params: {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sepia?: number;
  hueRotate?: number;
}): string {
  const parts: string[] = [];
  
  if (params.brightness !== undefined) {
    parts.push(`brightness(${params.brightness}%)`);
  }
  if (params.contrast !== undefined) {
    parts.push(`contrast(${params.contrast}%)`);
  }
  if (params.saturation !== undefined) {
    parts.push(`saturate(${params.saturation}%)`);
  }
  if (params.sepia !== undefined) {
    parts.push(`sepia(${params.sepia}%)`);
  }
  if (params.hueRotate !== undefined) {
    parts.push(`hue-rotate(${params.hueRotate}deg)`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'none';
}
