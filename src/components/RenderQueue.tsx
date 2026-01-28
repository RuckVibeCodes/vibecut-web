'use client';

import { useState, useEffect, useCallback } from 'react';

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
    quality: string;
    format: string;
    fps: number;
  };
}

interface Props {
  onAddJob?: (config: { aspectRatio: string; quality: string; format: string }) => void;
}

export function RenderQueue({ onAddJob }: Props) {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [stats, setStats] = useState({ total: 0, queued: 0, rendering: 0, completed: 0, failed: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobConfig, setNewJobConfig] = useState({
    projectName: 'My Video',
    aspectRatio: '16:9',
    quality: 'standard' as 'draft' | 'standard' | 'high',
    format: 'mp4' as 'mp4' | 'webm' | 'gif',
  });

  // Poll for job updates
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/render');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setStats(data.stats || { total: 0, queued: 0, rendering: 0, completed: 0, failed: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    
    // Poll every 2 seconds while there are active jobs
    const interval = setInterval(() => {
      fetchJobs();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  const addJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          projectId: `project-${Date.now()}`,
          projectName: newJobConfig.projectName,
          aspectRatio: newJobConfig.aspectRatio,
          quality: newJobConfig.quality,
          format: newJobConfig.format,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        fetchJobs();
        onAddJob?.(newJobConfig);
      }
    } catch (error) {
      console.error('Failed to add job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', jobId }),
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const clearCompleted = async () => {
    try {
      await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-completed' }),
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to clear jobs:', error);
    }
  };

  const getStatusIcon = (status: RenderJob['status']) => {
    switch (status) {
      case 'queued': return '⏳';
      case 'rendering': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
    }
  };

  const getStatusColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'queued': return 'text-yellow-400';
      case 'rendering': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Render Queue</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
        >
          + Add Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Queued', value: stats.queued, color: 'text-yellow-400' },
          { label: 'Rendering', value: stats.rendering, color: 'text-blue-400' },
          { label: 'Done', value: stats.completed, color: 'text-green-400' },
          { label: 'Failed', value: stats.failed, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-lg p-2 text-center">
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-white/50 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add job form */}
      {showAddForm && (
        <div className="bg-white/10 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-medium">New Render Job</h4>
          
          <input
            type="text"
            value={newJobConfig.projectName}
            onChange={(e) => setNewJobConfig(prev => ({ ...prev, projectName: e.target.value }))}
            placeholder="Project name"
            className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
          />
          
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newJobConfig.aspectRatio}
              onChange={(e) => setNewJobConfig(prev => ({ ...prev, aspectRatio: e.target.value }))}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
            
            <select
              value={newJobConfig.quality}
              onChange={(e) => setNewJobConfig(prev => ({ ...prev, quality: e.target.value as 'draft' | 'standard' | 'high' }))}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="draft">Draft</option>
              <option value="standard">Standard</option>
              <option value="high">High</option>
            </select>
            
            <select
              value={newJobConfig.format}
              onChange={(e) => setNewJobConfig(prev => ({ ...prev, format: e.target.value as 'mp4' | 'webm' | 'gif' }))}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="gif">GIF</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addJob}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add to Queue'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <p className="text-white/40">No render jobs in queue</p>
          <p className="text-white/30 text-sm mt-1">Add a job to start rendering</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(job.status)}>
                    {getStatusIcon(job.status)}
                  </span>
                  <span className="text-white font-medium text-sm truncate max-w-[150px]">
                    {job.projectName}
                  </span>
                </div>
                <span className="text-white/40 text-xs">{formatDate(job.createdAt)}</span>
              </div>

              {/* Progress bar */}
              {(job.status === 'rendering' || job.status === 'completed') && (
                <div className="mb-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        job.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-1">{job.progress}%</p>
                </div>
              )}

              {/* Config badges */}
              <div className="flex gap-1 flex-wrap mb-2">
                <span className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs">
                  {job.config.aspectRatio}
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs">
                  {job.config.quality}
                </span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs">
                  {job.config.format.toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {job.status === 'completed' && job.outputUrl && (
                  <a
                    href={job.outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-xs font-medium text-center hover:bg-green-500/30 transition"
                  >
                    ⬇️ Download
                  </a>
                )}
                {(job.status === 'queued' || job.status === 'rendering') && (
                  <button
                    onClick={() => cancelJob(job.id)}
                    className="flex-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-xs font-medium hover:bg-red-500/30 transition"
                  >
                    Cancel
                  </button>
                )}
                {job.status === 'failed' && (
                  <p className="text-red-400 text-xs">{job.error || 'Render failed'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear completed */}
      {stats.completed + stats.failed > 0 && (
        <button
          onClick={clearCompleted}
          className="w-full px-4 py-2 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20 hover:text-white transition"
        >
          🗑️ Clear Completed Jobs
        </button>
      )}
    </div>
  );
}
