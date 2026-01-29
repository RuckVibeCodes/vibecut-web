/**
 * WaveSpeed API Wrapper
 * Unified interface for AI video, image, TTS, and lipsync generation
 */

import {
  WaveSpeedConfig,
  WaveSpeedResponse,
  WaveSpeedError,
  WaveSpeedModel,
  VideoGenerationRequest,
  VideoGenerationResult,
  ImageGenerationRequest,
  ImageGenerationResult,
  TTSRequest,
  TTSResult,
  LipsyncRequest,
  LipsyncResult,
  GenerationStatus,
} from './types/ai';

const DEFAULT_CONFIG: Partial<WaveSpeedConfig> = {
  baseUrl: 'https://api.wavespeed.ai/api/v2',
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 300000, // 5 minutes
};

// Internal type for raw API responses
interface WaveSpeedApiResponse {
  video?: { url?: string };
  output?: { video_url?: string; image_url?: string; audio_url?: string };
  video_url?: string;
  image_url?: string;
  audio_url?: string;
  thumbnail?: { url?: string };
  audio?: { url?: string };
  images?: Array<{ url?: string }>;
  duration?: number;
  width?: number;
  height?: number;
  seed?: number;
  generation_time_ms?: number;
  data?: WaveSpeedApiResponse;
  id?: string;
  task_id?: string;
  request_id?: string;
  status?: string;
  error?: string;
}

// WaveSpeed model endpoints
const MODEL_ENDPOINTS: Record<string, string> = {
  'pixverse-v4.5': '/pixverse/v4.5/text2video',
  'vidu-q1': '/vidu/vidu-q1/text2video',
  'wan-2.1': '/wavespeed-ai/wan-2.1/text2video',
  'flux-dev': '/flux/flux-dev/text2img',
  'flux-schnell': '/flux/flux-schnell/text2img',
  'elevenlabs-tts': '/elevenlabs/tts',
  'lipsync-v2': '/wavespeed-ai/lipsync-v2',
};

export class WaveSpeedClient {
  private config: WaveSpeedConfig;
  private baseUrl: string;

  constructor(config: WaveSpeedConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseUrl = this.config.baseUrl || DEFAULT_CONFIG.baseUrl!;
  }

  // ============================================================================
  // Video Generation
  // ============================================================================

  async generateVideo(
    prompt: string,
    options: Partial<Omit<VideoGenerationRequest, 'prompt' | 'model'>> & { model?: WaveSpeedModel } = {}
  ): Promise<WaveSpeedResponse<VideoGenerationResult>> {
    const model = options.model || 'pixverse-v4.5';
    const endpoint = MODEL_ENDPOINTS[model];
    
    if (!endpoint) {
      return this.errorResponse('INVALID_MODEL', `Unknown model: ${model}`);
    }

    const requestBody = {
      prompt,
      size: this.aspectRatioToSize(options.aspectRatio || '16:9'),
      duration: options.duration || 4,
      seed: options.seed,
      negative_prompt: options.negativePrompt,
      quality: options.quality || 'high',
      fps: options.fps || 24,
    };

    return this.executeWithPolling<VideoGenerationResult>(
      endpoint,
      requestBody,
      (data: WaveSpeedApiResponse) => ({
        videoUrl: data.video?.url || data.output?.video_url || data.video_url || '',
        thumbnailUrl: data.thumbnail?.url,
        duration: data.duration || options.duration || 4,
        width: data.width || 1920,
        height: data.height || 1080,
        model,
        generationTimeMs: data.generation_time_ms || 0,
      })
    );
  }

  // ============================================================================
  // Image Generation
  // ============================================================================

  async generateImage(
    prompt: string,
    options: Partial<Omit<ImageGenerationRequest, 'prompt' | 'model'>> & { model?: WaveSpeedModel } = {}
  ): Promise<WaveSpeedResponse<ImageGenerationResult>> {
    const model = options.model || 'flux-schnell';
    const endpoint = MODEL_ENDPOINTS[model];

    if (!endpoint) {
      return this.errorResponse('INVALID_MODEL', `Unknown model: ${model}`);
    }

    const requestBody = {
      prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      seed: options.seed,
      negative_prompt: options.negativePrompt,
      num_inference_steps: options.steps || 25,
      guidance_scale: options.guidance || 7.5,
    };

    return this.executeWithPolling<ImageGenerationResult>(
      endpoint,
      requestBody,
      (data: WaveSpeedApiResponse) => ({
        imageUrl: data.images?.[0]?.url || data.output?.image_url || data.image_url || '',
        width: options.width || 1024,
        height: options.height || 1024,
        model,
        seed: data.seed || options.seed || 0,
      })
    );
  }

  // ============================================================================
  // Text-to-Speech (ElevenLabs via WaveSpeed)
  // ============================================================================

  async generateTTS(
    text: string,
    voiceId: string,
    options: Partial<Omit<TTSRequest, 'text' | 'voiceId' | 'model'>> = {}
  ): Promise<WaveSpeedResponse<TTSResult>> {
    const endpoint = MODEL_ENDPOINTS['elevenlabs-tts'];

    const requestBody = {
      text,
      voice_id: voiceId,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0,
        use_speaker_boost: options.speakerBoost ?? true,
      },
    };

    return this.executeWithPolling<TTSResult>(
      endpoint,
      requestBody,
      (data: WaveSpeedApiResponse) => ({
        audioUrl: data.audio?.url || data.output?.audio_url || data.audio_url || '',
        duration: data.duration || 0,
        voiceId,
        characterCount: text.length,
      })
    );
  }

  // ============================================================================
  // Lipsync Generation
  // ============================================================================

  async lipsync(
    imageUrl: string,
    audioUrl: string,
    options: Partial<Omit<LipsyncRequest, 'imageUrl' | 'audioUrl' | 'model'>> = {}
  ): Promise<WaveSpeedResponse<LipsyncResult>> {
    const endpoint = MODEL_ENDPOINTS['lipsync-v2'];

    const requestBody = {
      image_url: imageUrl,
      audio_url: audioUrl,
      enhance_face: options.enhanceFace ?? true,
      output_format: options.outputFormat || 'mp4',
    };

    return this.executeWithPolling<LipsyncResult>(
      endpoint,
      requestBody,
      (data: WaveSpeedApiResponse) => ({
        videoUrl: data.video?.url || data.output?.video_url || data.video_url || '',
        duration: data.duration || 0,
        originalImageUrl: imageUrl,
        generationTimeMs: data.generation_time_ms || 0,
      })
    );
  }

  // ============================================================================
  // Core Request Methods
  // ============================================================================

  private async executeWithPolling<T>(
    endpoint: string,
    body: Record<string, unknown>,
    transformResult: (data: WaveSpeedApiResponse) => T
  ): Promise<WaveSpeedResponse<T>> {
    let lastError: WaveSpeedError | undefined;
    
    for (let attempt = 0; attempt < this.config.maxRetries!; attempt++) {
      try {
        // Initial request
        const response = await this.makeRequest(endpoint, body);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if async task (returns task_id or request_id)
        const taskId = data.data?.id || data.task_id || data.request_id || data.id;
        
        if (taskId && (data.status === 'pending' || data.status === 'processing' || data.data?.status === 'pending')) {
          // Poll for completion
          const result = await this.pollForCompletion(taskId, endpoint);
          return {
            success: true,
            data: transformResult(result),
            requestId: taskId,
          };
        }

        // Immediate result
        const resultData = data.data || data;
        return {
          success: true,
          data: transformResult(resultData),
          requestId: taskId,
        };
      } catch (error) {
        lastError = {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        };

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }

        // Wait before retry
        if (attempt < this.config.maxRetries! - 1) {
          await this.sleep(this.config.retryDelayMs! * Math.pow(2, attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError,
    };
  }

  private async makeRequest(endpoint: string, body: Record<string, unknown>): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      return await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async pollForCompletion(
    taskId: string,
    originalEndpoint: string
  ): Promise<WaveSpeedApiResponse> {
    const statusEndpoint = `/tasks/${taskId}/status`;
    const maxPollTime = this.config.timeoutMs!;
    const pollInterval = 2000; // 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollTime) {
      const response = await fetch(`${this.baseUrl}${statusEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        // Try alternate status URL format
        const altResponse = await fetch(`${this.baseUrl}${originalEndpoint}/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        });
        
        if (!altResponse.ok) {
          throw new Error(`Failed to check status: ${response.status}`);
        }
        
        const altData = await altResponse.json();
        const altStatus = altData.data?.status || altData.status;
        
        if (altStatus === 'completed' || altStatus === 'succeeded') {
          return altData.data || altData;
        }
        if (altStatus === 'failed') {
          throw new Error(altData.data?.error || altData.error || 'Generation failed');
        }
        
        await this.sleep(pollInterval);
        continue;
      }

      const data = await response.json();
      const status: GenerationStatus = data.data?.status || data.status;

      if (status === 'completed' || (data.data?.status === 'completed')) {
        return data.data || data;
      }

      if (status === 'failed') {
        throw new Error(data.data?.error || data.error || 'Generation failed');
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Generation timed out');
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private aspectRatioToSize(aspectRatio: string): string {
    const sizes: Record<string, string> = {
      '16:9': '1280x720',
      '9:16': '720x1280',
      '1:1': '1024x1024',
      '4:5': '864x1080',
    };
    return sizes[aspectRatio] || '1280x720';
  }

  private errorResponse<T>(code: string, message: string): WaveSpeedResponse<T> {
    return {
      success: false,
      error: { code, message },
    };
  }

  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('invalid api key') ||
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('not found') ||
        message.includes('invalid model')
      );
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

let defaultClient: WaveSpeedClient | null = null;

export function initWaveSpeed(config: WaveSpeedConfig): WaveSpeedClient {
  defaultClient = new WaveSpeedClient(config);
  return defaultClient;
}

export function getWaveSpeedClient(): WaveSpeedClient {
  if (!defaultClient) {
    throw new Error('WaveSpeed client not initialized. Call initWaveSpeed() first.');
  }
  return defaultClient;
}

// Direct function exports for simpler usage
export async function generateVideo(
  apiKey: string,
  prompt: string,
  options?: Partial<Omit<VideoGenerationRequest, 'prompt' | 'model'>> & { model?: WaveSpeedModel }
): Promise<WaveSpeedResponse<VideoGenerationResult>> {
  const client = new WaveSpeedClient({ apiKey });
  return client.generateVideo(prompt, options);
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  options?: Partial<Omit<ImageGenerationRequest, 'prompt' | 'model'>> & { model?: WaveSpeedModel }
): Promise<WaveSpeedResponse<ImageGenerationResult>> {
  const client = new WaveSpeedClient({ apiKey });
  return client.generateImage(prompt, options);
}

export async function generateTTS(
  apiKey: string,
  text: string,
  voiceId: string,
  options?: Partial<Omit<TTSRequest, 'text' | 'voiceId' | 'model'>>
): Promise<WaveSpeedResponse<TTSResult>> {
  const client = new WaveSpeedClient({ apiKey });
  return client.generateTTS(text, voiceId, options);
}

export async function lipsync(
  apiKey: string,
  imageUrl: string,
  audioUrl: string,
  options?: Partial<Omit<LipsyncRequest, 'imageUrl' | 'audioUrl' | 'model'>>
): Promise<WaveSpeedResponse<LipsyncResult>> {
  const client = new WaveSpeedClient({ apiKey });
  return client.lipsync(imageUrl, audioUrl, options);
}

export { WaveSpeedClient as default };
