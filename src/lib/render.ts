// VibeCut Render Engine
// Handles video rendering via Remotion Lambda or local fallback

import { Project } from './types/project';

// Environment-based config
const RENDER_CONFIG = {
  // AWS Lambda config (set via env vars)
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  functionName: process.env.REMOTION_LAMBDA_FUNCTION || 'vibecut-render',
  bucketName: process.env.REMOTION_S3_BUCKET || 'vibecut-renders',
  
  // Composition settings
  compositionId: 'CinematicVideo',
  fps: 30,
  
  // Quality presets
  quality: {
    draft: { crf: 28, scale: 0.5 },
    standard: { crf: 22, scale: 1 },
    high: { crf: 18, scale: 1 },
  },
  
  // Resolution by aspect ratio
  resolution: {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
  } as Record<string, { width: number; height: number }>,
};

export interface RenderJob {
  id: string;
  projectId: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  outputUrl?: string;
  error?: string;
  renderId?: string; // Remotion Lambda render ID
}

// In-memory job tracking
const renderJobs: Map<string, RenderJob> = new Map();

// Convert project state to Remotion inputProps
export function projectToInputProps(project: Project, aspectRatio: string) {
  const resolution = RENDER_CONFIG.resolution[aspectRatio] || RENDER_CONFIG.resolution['16:9'];
  
  return {
    // Video source
    sourceVideoUrl: project.sourceVideoUrl,
    duration: project.duration,
    
    // Dimensions
    width: resolution.width,
    height: resolution.height,
    fps: RENDER_CONFIG.fps,
    
    // Transcript & captions
    transcript: project.transcript,
    captionStyle: project.captionStyle,
    
    // Color grading
    colorGrade: project.colorGrade,
    
    // Camera movements
    cameraKeyframes: project.cameraKeyframes,
    
    // Overlays
    brollClips: project.brollClips,
    textOverlays: project.textOverlays,
    
    // Audio
    soundEffects: project.soundEffects,
    musicTrack: project.musicTrack,
    
    // Metadata
    projectId: project.id,
    projectName: project.name,
    aspectRatio,
  };
}

// Create a render job
export function createRenderJob(
  projectId: string,
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
): RenderJob {
  const job: RenderJob = {
    id: `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    aspectRatio,
    status: 'queued',
    progress: 0,
  };
  
  renderJobs.set(job.id, job);
  return job;
}

// Update job status
export function updateRenderJob(
  jobId: string,
  updates: Partial<RenderJob>
): RenderJob | null {
  const job = renderJobs.get(jobId);
  if (!job) return null;
  
  const updated = { ...job, ...updates };
  renderJobs.set(jobId, updated);
  return updated;
}

// Get job by ID
export function getRenderJob(jobId: string): RenderJob | null {
  return renderJobs.get(jobId) || null;
}

// Get jobs for a project
export function getProjectRenderJobs(projectId: string): RenderJob[] {
  return Array.from(renderJobs.values()).filter(j => j.projectId === projectId);
}

// List all jobs
export function listRenderJobs(): RenderJob[] {
  return Array.from(renderJobs.values());
}

// Trigger Lambda render (actual implementation)
export async function triggerLambdaRender(
  project: Project,
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5',
  quality: 'draft' | 'standard' | 'high' = 'standard'
): Promise<RenderJob> {
  const job = createRenderJob(project.id, aspectRatio);
  const inputProps = projectToInputProps(project, aspectRatio);
  const qualitySettings = RENDER_CONFIG.quality[quality];
  const resolution = RENDER_CONFIG.resolution[aspectRatio];
  
  // Check if we have AWS credentials
  const hasAwsCredentials = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  if (!hasAwsCredentials) {
    // Simulate render for development
    console.log('No AWS credentials - simulating render');
    simulateRender(job.id, project.duration);
    return job;
  }

  try {
    // Import Remotion Lambda SDK dynamically
    const { renderMediaOnLambda, getRenderProgress } = await import('@remotion/lambda/client');

    updateRenderJob(job.id, { status: 'rendering', startedAt: new Date().toISOString() });

    // Trigger the render
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: RENDER_CONFIG.awsRegion as 'us-east-1',
      functionName: RENDER_CONFIG.functionName,
      composition: RENDER_CONFIG.compositionId,
      serveUrl: process.env.REMOTION_SERVE_URL || 'https://vibecut-web.vercel.app/remotion',
      inputProps,
      codec: 'h264',
      imageFormat: 'jpeg',
      maxRetries: 1,
      framesPerLambda: 20,
      privacy: 'public',
      downloadBehavior: {
        type: 'download',
        fileName: `${project.name}-${aspectRatio}.mp4`,
      },
      // Quality settings
      crf: qualitySettings.crf,
      scale: qualitySettings.scale,
      // Output dimensions
      height: resolution.height,
      width: resolution.width,
    });

    updateRenderJob(job.id, { renderId });

    // Poll for progress
    const pollProgress = async () => {
      try {
        const progress = await getRenderProgress({
          renderId,
          bucketName,
          functionName: RENDER_CONFIG.functionName,
          region: RENDER_CONFIG.awsRegion as 'us-east-1',
        });

        if (progress.done) {
          updateRenderJob(job.id, {
            status: 'completed',
            progress: 100,
            completedAt: new Date().toISOString(),
            outputUrl: progress.outputFile,
          });
        } else if (progress.fatalErrorEncountered) {
          updateRenderJob(job.id, {
            status: 'failed',
            error: progress.errors?.[0]?.message || 'Render failed',
          });
        } else {
          updateRenderJob(job.id, {
            progress: Math.round((progress.overallProgress || 0) * 100),
          });
          // Continue polling
          setTimeout(pollProgress, 2000);
        }
      } catch (error) {
        console.error('Progress poll error:', error);
        updateRenderJob(job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Failed to check progress',
        });
      }
    };

    // Start polling after a short delay
    setTimeout(pollProgress, 3000);

    return job;
  } catch (error) {
    console.error('Lambda render error:', error);
    updateRenderJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to start render',
    });
    return job;
  }
}

// Simulate render for development/demo
async function simulateRender(jobId: string, duration: number) {
  updateRenderJob(jobId, { status: 'rendering', startedAt: new Date().toISOString() });
  
  // Calculate simulated render time (roughly 2x realtime for standard quality)
  const totalSteps = Math.max(10, Math.round(duration / 3));
  
  for (let i = 1; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const job = getRenderJob(jobId);
    if (!job || job.status === 'failed') return;
    
    updateRenderJob(jobId, {
      progress: Math.round((i / totalSteps) * 100),
    });
  }
  
  // Complete with mock URL
  updateRenderJob(jobId, {
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString(),
    outputUrl: `https://storage.vibecut.app/renders/${jobId}.mp4`,
  });
}

// Render all queued exports for a project
export async function renderAllExports(
  project: Project,
  quality: 'draft' | 'standard' | 'high' = 'standard'
): Promise<RenderJob[]> {
  const jobs: RenderJob[] = [];
  
  for (const exportConfig of project.exports) {
    if (exportConfig.status === 'pending') {
      const job = await triggerLambdaRender(project, exportConfig.aspectRatio, quality);
      jobs.push(job);
    }
  }
  
  return jobs;
}

export default {
  createRenderJob,
  updateRenderJob,
  getRenderJob,
  getProjectRenderJobs,
  listRenderJobs,
  triggerLambdaRender,
  renderAllExports,
  projectToInputProps,
  RENDER_CONFIG,
};
