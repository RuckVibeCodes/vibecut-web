import { NextResponse } from 'next/server';

// Render queue management
// Note: Actual rendering would need a backend service (Lambda, Cloud Run, etc.)
// This API manages the queue and status

interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  outputUrl?: string;
  error?: string;
  config: {
    aspectRatio: string;
    quality: 'draft' | 'standard' | 'high';
    format: 'mp4' | 'webm' | 'gif';
    fps: number;
  };
}

// In-memory queue (would be Redis/DB in production)
const renderQueue: Map<string, RenderJob> = new Map();

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'add':
        return addToQueue(params);
      case 'status':
        return getStatus(params.jobId);
      case 'cancel':
        return cancelJob(params.jobId);
      case 'list':
        return listJobs();
      case 'clear-completed':
        return clearCompleted();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Render API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Render operation failed' },
      { status: 500 }
    );
  }
}

function addToQueue(params: {
  projectId: string;
  projectName: string;
  aspectRatio?: string;
  quality?: 'draft' | 'standard' | 'high';
  format?: 'mp4' | 'webm' | 'gif';
  fps?: number;
}) {
  const job: RenderJob = {
    id: `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId: params.projectId,
    projectName: params.projectName,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    config: {
      aspectRatio: params.aspectRatio || '16:9',
      quality: params.quality || 'standard',
      format: params.format || 'mp4',
      fps: params.fps || 30,
    },
  };

  renderQueue.set(job.id, job);

  // Simulate rendering process (in production, this would trigger actual render)
  simulateRender(job.id);

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      position: Array.from(renderQueue.values()).filter(j => j.status === 'queued').length,
    },
  });
}

function getStatus(jobId: string) {
  const job = renderQueue.get(jobId);
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    job,
  });
}

function cancelJob(jobId: string) {
  const job = renderQueue.get(jobId);
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status === 'completed') {
    return NextResponse.json({ error: 'Cannot cancel completed job' }, { status: 400 });
  }

  job.status = 'failed';
  job.error = 'Cancelled by user';
  renderQueue.set(jobId, job);

  return NextResponse.json({
    success: true,
    message: 'Job cancelled',
  });
}

function listJobs() {
  const jobs = Array.from(renderQueue.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    success: true,
    jobs,
    stats: {
      total: jobs.length,
      queued: jobs.filter(j => j.status === 'queued').length,
      rendering: jobs.filter(j => j.status === 'rendering').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    },
  });
}

function clearCompleted() {
  const toDelete: string[] = [];
  
  renderQueue.forEach((job, id) => {
    if (job.status === 'completed' || job.status === 'failed') {
      toDelete.push(id);
    }
  });

  toDelete.forEach(id => renderQueue.delete(id));

  return NextResponse.json({
    success: true,
    cleared: toDelete.length,
  });
}

// Simulate rendering (for demo purposes)
async function simulateRender(jobId: string) {
  const job = renderQueue.get(jobId);
  if (!job) return;

  // Wait in queue
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Start rendering
  job.status = 'rendering';
  job.startedAt = new Date().toISOString();
  renderQueue.set(jobId, job);

  // Simulate progress
  const totalSteps = 20;
  for (let i = 1; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentJob = renderQueue.get(jobId);
    if (!currentJob || currentJob.status === 'failed') return;

    currentJob.progress = Math.round((i / totalSteps) * 100);
    renderQueue.set(jobId, currentJob);
  }

  // Complete
  const finalJob = renderQueue.get(jobId);
  if (finalJob && finalJob.status !== 'failed') {
    finalJob.status = 'completed';
    finalJob.completedAt = new Date().toISOString();
    finalJob.progress = 100;
    finalJob.outputUrl = `https://storage.example.com/renders/${jobId}.${finalJob.config.format}`;
    renderQueue.set(jobId, finalJob);
  }
}

// GET endpoint for polling status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    return getStatus(jobId);
  }

  return listJobs();
}
