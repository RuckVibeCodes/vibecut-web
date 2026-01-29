/**
 * Narrative Analyzer
 * Claude-powered story structure analysis and enhancement planning
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  NarrativeAnalysis,
  NarrativeSection,
  KeyMoment,
  SuggestedEnhancement,
  EnhancementPlan,
  CinematicStyle,
  NarrativeConfig,
  BRollSuggestion,
  MusicSuggestion,
  TextOverlaySuggestion,
  CameraMovementSuggestion,
} from './types/ai';
import { Transcript, TranscriptWord } from './types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export class NarrativeAnalyzer {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: NarrativeConfig) {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
    this.model = config.model || DEFAULT_MODEL;
    this.maxTokens = config.maxTokens || 4096;
  }

  // ============================================================================
  // Transcript Analysis
  // ============================================================================

  async analyzeTranscript(transcript: Transcript | string): Promise<NarrativeAnalysis> {
    const text = typeof transcript === 'string' ? transcript : transcript.text;
    const duration = typeof transcript === 'string' ? this.estimateDuration(text) : transcript.duration;
    const words = typeof transcript === 'string' ? null : transcript.words;

    const systemPrompt = `You are an expert video editor and story analyst. Analyze transcripts to identify narrative structure, key moments, and opportunities for visual enhancement.

Your analysis should be precise with timestamps and actionable for video editing.

Always respond with valid JSON matching the schema provided.`;

    const userPrompt = `Analyze this video transcript and provide a detailed narrative breakdown.

TRANSCRIPT:
${text}

DURATION: ${duration} seconds
${words ? `WORD COUNT: ${words.length}` : ''}

Provide a JSON response with this exact structure:
{
  "sections": [
    {
      "type": "intro|hook|setup|conflict|rising-action|climax|falling-action|resolution|outro|transition",
      "title": "Brief section title",
      "startTime": 0,
      "endTime": 10,
      "summary": "What happens in this section",
      "intensity": 0.5,
      "keywords": ["key", "words"]
    }
  ],
  "keyMoments": [
    {
      "timestamp": 15,
      "type": "emotional-peak|key-point|joke|revelation|call-to-action",
      "description": "What makes this moment significant",
      "importance": 8,
      "suggestedEffect": "zoom-in"
    }
  ],
  "suggestedEnhancements": [
    {
      "type": "zoom-in|zoom-out|b-roll|text-overlay|sound-effect|music-swell|reaction-cut|split-screen|slow-motion|speed-ramp",
      "startTime": 20,
      "endTime": 25,
      "description": "What enhancement to add",
      "prompt": "B-roll prompt if applicable",
      "intensity": 0.7,
      "priority": "low|medium|high"
    }
  ],
  "overallTone": "informative and engaging",
  "pacing": "slow|moderate|fast|dynamic",
  "estimatedEngagement": 7,
  "summary": "One paragraph summary of the content"
}

Be specific with timestamps based on typical speaking pace (~150 words/minute). Identify at least 3-5 key moments and suggest 5-10 enhancements.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content.text];
    const analysis: NarrativeAnalysis = JSON.parse(jsonMatch[1]?.trim() || content.text);

    // Validate and adjust timestamps if we have word-level data
    if (words && words.length > 0) {
      analysis.sections = this.adjustSectionTimestamps(analysis.sections, words, duration);
      analysis.keyMoments = this.adjustMomentTimestamps(analysis.keyMoments, words, duration);
      analysis.suggestedEnhancements = this.adjustEnhancementTimestamps(
        analysis.suggestedEnhancements,
        words,
        duration
      );
    }

    return analysis;
  }

  // ============================================================================
  // Enhancement Plan Generation
  // ============================================================================

  async generateEnhancementPlan(
    transcript: Transcript | string,
    style: CinematicStyle
  ): Promise<EnhancementPlan> {
    const text = typeof transcript === 'string' ? transcript : transcript.text;
    const duration = typeof transcript === 'string' ? this.estimateDuration(text) : transcript.duration;

    const styleGuides: Record<CinematicStyle, string> = {
      documentary: 'Use subtle enhancements, informative text overlays, and ambient music. Focus on authenticity.',
      vlog: 'Casual energy, personal connection, quick cuts, trending music, relatable text overlays.',
      tutorial: 'Clear visual aids, step-by-step text overlays, calm music, zoom on details, clean transitions.',
      entertainment: 'High energy, frequent b-roll, dynamic camera movements, impactful sound effects.',
      dramatic: 'Cinematic movements, emotional music swells, strategic slow motion, powerful text reveals.',
      comedic: 'Quick zooms on punchlines, reaction cuts, playful sound effects, meme-style text.',
      minimalist: 'Subtle enhancements only, clean aesthetic, minimal text, soft ambient music.',
      'high-energy': 'Maximum engagement: rapid cuts, bold text, intense music, constant motion.',
    };

    const systemPrompt = `You are a professional video editor creating an enhancement plan for a ${style} style video.

Style guide: ${styleGuides[style]}

Generate specific, actionable enhancements with precise timestamps.`;

    const userPrompt = `Create a comprehensive cinematic enhancement plan for this video transcript.

STYLE: ${style}
TRANSCRIPT:
${text}

DURATION: ${duration} seconds

Provide a JSON response with this exact structure:
{
  "style": "${style}",
  "bRoll": [
    {
      "timestamp": 10,
      "duration": 3,
      "prompt": "Detailed prompt for AI video generation",
      "style": "cinematic slow motion",
      "context": "Why this b-roll fits here",
      "priority": "high"
    }
  ],
  "music": [
    {
      "startTime": 0,
      "endTime": 30,
      "mood": "upbeat and inspiring",
      "intensity": 0.6,
      "genre": "electronic",
      "bpm": 120
    }
  ],
  "textOverlays": [
    {
      "timestamp": 5,
      "duration": 3,
      "text": "Text to display",
      "style": "title|subtitle|quote|stat|callout",
      "position": "top|center|bottom",
      "animation": "pop|slide|fade|typewriter"
    }
  ],
  "cameraMovements": [
    {
      "timestamp": 15,
      "duration": 2,
      "movement": "zoom-in|zoom-out|pan-left|pan-right|shake|smooth",
      "intensity": 0.7,
      "reason": "Why this movement enhances the moment"
    }
  ],
  "captionStyle": "tiktok-bounce|youtube-shorts|mrbeast|minimal|karaoke",
  "colorGrade": "warm|cool|cinematic|vibrant|muted",
  "transitionStyle": "cut|dissolve|wipe|dynamic",
  "overallNotes": "Summary of the enhancement approach"
}

Generate 5-10 b-roll suggestions, 2-4 music segments, 5-10 text overlays, and 10-15 camera movements.
Make b-roll prompts detailed enough for AI video generation (describe scene, lighting, camera angle, motion).`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content.text];
    const plan: EnhancementPlan = JSON.parse(jsonMatch[1]?.trim() || content.text);

    return plan;
  }

  // ============================================================================
  // Specialized Analysis Functions
  // ============================================================================

  async findBRollOpportunities(
    transcript: Transcript | string,
    maxSuggestions: number = 10
  ): Promise<BRollSuggestion[]> {
    const text = typeof transcript === 'string' ? transcript : transcript.text;
    const duration = typeof transcript === 'string' ? this.estimateDuration(text) : transcript.duration;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Identify the best ${maxSuggestions} moments for B-roll footage in this transcript.

TRANSCRIPT:
${text}

DURATION: ${duration} seconds

For each moment, provide a detailed AI video generation prompt.

Respond with JSON array:
[
  {
    "timestamp": 10,
    "duration": 3,
    "prompt": "Cinematic aerial shot of a modern city skyline at golden hour, camera slowly pushing forward, warm lighting, 4K quality",
    "style": "cinematic",
    "context": "Supports the speaker's point about urban growth",
    "priority": "high"
  }
]`
        }
      ],
      system: 'You are a video editor identifying perfect moments for B-roll footage. Create vivid, detailed prompts for AI video generation.',
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content.text];
    return JSON.parse(jsonMatch[1]?.trim() || content.text);
  }

  async detectEmotionalPeaks(
    transcript: Transcript | string
  ): Promise<KeyMoment[]> {
    const text = typeof transcript === 'string' ? transcript : transcript.text;
    const duration = typeof transcript === 'string' ? this.estimateDuration(text) : transcript.duration;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Identify emotional peaks and key moments in this transcript for video enhancement.

TRANSCRIPT:
${text}

DURATION: ${duration} seconds

Find moments that would benefit from:
- Zoom effects
- Music swells
- Sound effects
- Slow motion
- Text emphasis

Respond with JSON array:
[
  {
    "timestamp": 45,
    "type": "emotional-peak|key-point|joke|revelation|call-to-action",
    "description": "The speaker reveals the main twist",
    "importance": 9,
    "suggestedEffect": "slow-motion zoom with music swell"
  }
]`
        }
      ],
      system: 'You are analyzing video content for emotional peaks and engaging moments.',
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content.text];
    return JSON.parse(jsonMatch[1]?.trim() || content.text);
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private estimateDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const wordCount = text.split(/\s+/).length;
    return Math.round((wordCount / 150) * 60);
  }

  private adjustSectionTimestamps(
    sections: NarrativeSection[],
    words: TranscriptWord[],
    totalDuration: number
  ): NarrativeSection[] {
    // Map estimated timestamps to actual word timestamps
    return sections.map(section => {
      const startWord = this.findNearestWord(words, section.startTime, totalDuration);
      const endWord = this.findNearestWord(words, section.endTime, totalDuration);

      return {
        ...section,
        startTime: startWord?.start ?? section.startTime,
        endTime: endWord?.end ?? section.endTime,
      };
    });
  }

  private adjustMomentTimestamps(
    moments: KeyMoment[],
    words: TranscriptWord[],
    totalDuration: number
  ): KeyMoment[] {
    return moments.map(moment => {
      const nearestWord = this.findNearestWord(words, moment.timestamp, totalDuration);
      return {
        ...moment,
        timestamp: nearestWord?.start ?? moment.timestamp,
      };
    });
  }

  private adjustEnhancementTimestamps(
    enhancements: SuggestedEnhancement[],
    words: TranscriptWord[],
    totalDuration: number
  ): SuggestedEnhancement[] {
    return enhancements.map(enhancement => {
      const startWord = this.findNearestWord(words, enhancement.startTime, totalDuration);
      const endWord = this.findNearestWord(words, enhancement.endTime, totalDuration);

      return {
        ...enhancement,
        startTime: startWord?.start ?? enhancement.startTime,
        endTime: endWord?.end ?? enhancement.endTime,
      };
    });
  }

  private findNearestWord(
    words: TranscriptWord[],
    targetTime: number,
    totalDuration: number
  ): TranscriptWord | null {
    if (words.length === 0) return null;

    // Estimate position based on proportion
    const proportion = targetTime / totalDuration;
    const estimatedIndex = Math.floor(proportion * words.length);

    // Search around estimated position
    let nearestWord = words[Math.min(estimatedIndex, words.length - 1)];
    let minDiff = Math.abs(nearestWord.start - targetTime);

    for (let i = Math.max(0, estimatedIndex - 10); i < Math.min(words.length, estimatedIndex + 10); i++) {
      const diff = Math.abs(words[i].start - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        nearestWord = words[i];
      }
    }

    return nearestWord;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

let defaultAnalyzer: NarrativeAnalyzer | null = null;

export function initNarrativeAnalyzer(config: NarrativeConfig): NarrativeAnalyzer {
  defaultAnalyzer = new NarrativeAnalyzer(config);
  return defaultAnalyzer;
}

export function getNarrativeAnalyzer(): NarrativeAnalyzer {
  if (!defaultAnalyzer) {
    throw new Error('Narrative analyzer not initialized. Call initNarrativeAnalyzer() first.');
  }
  return defaultAnalyzer;
}

// Direct function exports
export async function analyzeTranscript(
  apiKey: string,
  transcript: Transcript | string
): Promise<NarrativeAnalysis> {
  const analyzer = new NarrativeAnalyzer({ anthropicApiKey: apiKey });
  return analyzer.analyzeTranscript(transcript);
}

export async function generateEnhancementPlan(
  apiKey: string,
  transcript: Transcript | string,
  style: CinematicStyle
): Promise<EnhancementPlan> {
  const analyzer = new NarrativeAnalyzer({ anthropicApiKey: apiKey });
  return analyzer.generateEnhancementPlan(transcript, style);
}

export async function findBRollOpportunities(
  apiKey: string,
  transcript: Transcript | string,
  maxSuggestions?: number
): Promise<BRollSuggestion[]> {
  const analyzer = new NarrativeAnalyzer({ anthropicApiKey: apiKey });
  return analyzer.findBRollOpportunities(transcript, maxSuggestions);
}

export async function detectEmotionalPeaks(
  apiKey: string,
  transcript: Transcript | string
): Promise<KeyMoment[]> {
  const analyzer = new NarrativeAnalyzer({ anthropicApiKey: apiKey });
  return analyzer.detectEmotionalPeaks(transcript);
}

export { NarrativeAnalyzer as default };
