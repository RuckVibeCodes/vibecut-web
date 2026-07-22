'use client';

import { AspectRatio, ASPECT_RATIOS } from '@/lib/types';

type ReadinessStatus = 'ready' | 'warning' | 'missing';

interface ReadinessItem {
  id: string;
  label: string;
  detail: string;
  status: ReadinessStatus;
}

interface Props {
  hasVideo: boolean;
  hasTranscript: boolean;
  textOverlayCount: number;
  duration: number;
  selectedAspectRatio: AspectRatio;
}

const statusStyles: Record<ReadinessStatus, { icon: string; className: string; label: string }> = {
  ready: {
    icon: '✓',
    className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    label: 'Ready',
  },
  warning: {
    icon: '!',
    className: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    label: 'Review',
  },
  missing: {
    icon: '•',
    className: 'border-white/15 bg-white/5 text-white/60',
    label: 'Needed',
  },
};

export function ExportReadinessChecklist({
  hasVideo,
  hasTranscript,
  textOverlayCount,
  duration,
  selectedAspectRatio,
}: Props) {
  const ratio = ASPECT_RATIOS[selectedAspectRatio];
  const readableDuration = duration > 0 ? `${Math.max(1, Math.round(duration))}s` : 'No duration yet';

  const items: ReadinessItem[] = [
    {
      id: 'source-video',
      label: 'Source video',
      detail: hasVideo ? `Loaded and ready (${readableDuration})` : 'Upload a clip before exporting.',
      status: hasVideo ? 'ready' : 'missing',
    },
    {
      id: 'captions',
      label: 'Captions',
      detail: hasTranscript ? 'Transcript is available for burned-in captions.' : 'Transcribe the clip for social-ready captions.',
      status: hasTranscript ? 'ready' : 'warning',
    },
    {
      id: 'format',
      label: 'Format',
      detail: `${ratio.name} export selected for ${ratio.platform} (${ratio.width}×${ratio.height}).`,
      status: 'ready',
    },
    {
      id: 'overlays',
      label: 'Text overlays',
      detail: textOverlayCount > 0 ? `${textOverlayCount} hook/callout overlay${textOverlayCount === 1 ? '' : 's'} added.` : 'Consider adding a hook, CTA, or chapter title.',
      status: textOverlayCount > 0 ? 'ready' : 'warning',
    },
  ];

  const readyCount = items.filter((item) => item.status === 'ready').length;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-white font-semibold">Export readiness</h4>
          <p className="text-white/50 text-sm">Quick checks before rendering the final cut.</p>
        </div>
        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
          {readyCount}/{items.length} ready
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const style = statusStyles[item.status];

          return (
            <div key={item.id} className={`rounded-xl border p-3 ${style.className}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-white">{item.label}</p>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">{style.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">{item.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
