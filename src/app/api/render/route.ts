// VibeCut Render API
// Triggers Lambda renders and tracks progress

import { NextResponse } from 'next/server';
import ProjectStore from '@/lib/projectStore';
import RenderEngine from '@/lib/render';

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'start': {
        const { projectId, aspectRatios, quality = 'standard' } = params as {
          projectId: string;
          aspectRatios?: ('16:9' | '9:16' | '1:1' | '4:5')[];
          quality?: 'draft' | 'standard' | 'high';
        };

        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        const project = ProjectStore.get(projectId);
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (!project.sourceVideoUrl) {
          return NextResponse.json({ error: 'No source video in project' }, { status: 400 });
        }

        // Queue exports if not already queued
        const ratios = aspectRatios || ['16:9'];
        for (const ratio of ratios) {
          ProjectStore.addExport(projectId, ratio);
        }

        // Get updated project
        const updatedProject = ProjectStore.get(projectId);
        if (!updatedProject) {
          return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
        }

        // Trigger renders
        const jobs = await RenderEngine.renderAllExports(updatedProject, quality);

        // Update export statuses
        for (const job of jobs) {
          ProjectStore.updateExportStatus(projectId, job.aspectRatio, 'rendering');
        }

        return NextResponse.json({
          success: true,
          message: `Started ${jobs.length} render job(s)`,
          jobs: jobs.map(j => ({
            id: j.id,
            aspectRatio: j.aspectRatio,
            status: j.status,
            progress: j.progress,
          })),
        });
      }

      case 'status': {
        const { jobId, projectId } = params as { jobId?: string; projectId?: string };

        if (jobId) {
          const job = RenderEngine.getRenderJob(jobId);
          if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
          }
          return NextResponse.json({ success: true, job });
        }

        if (projectId) {
          const jobs = RenderEngine.getProjectRenderJobs(projectId);
          return NextResponse.json({ success: true, jobs });
        }

        const jobs = RenderEngine.listRenderJobs();
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

      case 'cancel': {
        const { jobId } = params as { jobId: string };
        
        const job = RenderEngine.getRenderJob(jobId);
        if (!job) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status === 'completed') {
          return NextResponse.json({ error: 'Cannot cancel completed job' }, { status: 400 });
        }

        RenderEngine.updateRenderJob(jobId, {
          status: 'failed',
          error: 'Cancelled by user',
        });

        // Update project export status
        ProjectStore.updateExportStatus(job.projectId, job.aspectRatio, 'failed', undefined, 'Cancelled');

        return NextResponse.json({
          success: true,
          message: 'Job cancelled',
        });
      }

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

// GET endpoint for polling status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const projectId = searchParams.get('projectId');

  if (jobId) {
    const job = RenderEngine.getRenderJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, job });
  }

  if (projectId) {
    const jobs = RenderEngine.getProjectRenderJobs(projectId);
    return NextResponse.json({ success: true, jobs });
  }

  const jobs = RenderEngine.listRenderJobs();
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
