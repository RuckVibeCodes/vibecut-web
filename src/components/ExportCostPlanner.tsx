'use client';

import { useMemo, useState } from 'react';

type Platform = 'youtube' | 'shorts' | 'tiktok' | 'reels' | 'linkedin';
type Quality = 'draft' | 'standard' | 'high';

interface PlatformConfig {
  id: Platform;
  label: string;
  emoji: string;
  aspectRatio: string;
  defaultExports: number;
  suggestedDuration: number;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'youtube', label: 'YouTube', emoji: '📺', aspectRatio: '16:9', defaultExports: 1, suggestedDuration: 180 },
  { id: 'shorts', label: 'Shorts', emoji: '▶️', aspectRatio: '9:16', defaultExports: 2, suggestedDuration: 45 },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', aspectRatio: '9:16', defaultExports: 2, suggestedDuration: 45 },
  { id: 'reels', label: 'Reels', emoji: '📱', aspectRatio: '9:16', defaultExports: 2, suggestedDuration: 45 },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼', aspectRatio: '1:1', defaultExports: 1, suggestedDuration: 90 },
];

const QUALITY_MULTIPLIERS: Record<Quality, { label: string; speed: number; storage: number; lambda: number }> = {
  draft: { label: 'Draft', speed: 0.55, storage: 0.45, lambda: 0.6 },
  standard: { label: 'Standard', speed: 1, storage: 1, lambda: 1 },
  high: { label: 'High', speed: 1.65, storage: 1.8, lambda: 1.7 },
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function ExportCostPlanner() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['shorts', 'tiktok', 'reels']);
  const [videoDuration, setVideoDuration] = useState(45);
  const [variationsPerPlatform, setVariationsPerPlatform] = useState(2);
  const [quality, setQuality] = useState<Quality>('standard');
  const [brollClips, setBrollClips] = useState(3);
  const [includeCaptions, setIncludeCaptions] = useState(true);

  const estimate = useMemo(() => {
    const multiplier = QUALITY_MULTIPLIERS[quality];
    const platformCount = selectedPlatforms.length || 1;
    const exportCount = platformCount * variationsPerPlatform;
    const renderedMinutes = (videoDuration * exportCount) / 60;
    const renderMinutes = Math.max(1, Math.ceil(renderedMinutes * 1.8 * multiplier.speed));
    const storageGb = Math.max(0.01, (videoDuration / 60) * exportCount * 0.08 * multiplier.storage);
    const brollCost = brollClips * 0.18;
    const captionCost = includeCaptions ? Math.max(0.02, (videoDuration / 60) * 0.012) : 0;
    const renderCost = renderMinutes * 0.035 * multiplier.lambda;
    const storageCost = storageGb * 0.023;
    const totalCost = brollCost + captionCost + renderCost + storageCost;

    return {
      exportCount,
      renderedMinutes,
      renderMinutes,
      storageGb,
      brollCost,
      captionCost,
      renderCost,
      storageCost,
      totalCost,
    };
  }, [brollClips, includeCaptions, quality, selectedPlatforms.length, variationsPerPlatform, videoDuration]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.length === 1 ? current : current.filter((p) => p !== platform);
      }
      return [...current, platform];
    });
  };

  const applyPlatformPreset = (platform: PlatformConfig) => {
    setSelectedPlatforms([platform.id]);
    setVideoDuration(platform.suggestedDuration);
    setVariationsPerPlatform(platform.defaultExports);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Export Cost Planner</h3>
        <p className="text-white/60 text-sm">
          Estimate render time, storage, and generation spend before queueing a multi-platform batch.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-medium text-white">Distribution targets</p>
              <span className="text-xs text-white/40">{selectedPlatforms.length} selected</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {PLATFORMS.map((platform) => {
                const selected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-indigo-400 bg-indigo-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{platform.emoji} {platform.label}</span>
                      <span className="text-xs text-white/50">{platform.aspectRatio}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        applyPlatformPreset(platform);
                      }}
                      className="mt-2 text-xs text-indigo-200 hover:text-white min-h-0 min-w-0"
                    >
                      Use preset
                    </button>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="bg-white/5 rounded-xl p-4 space-y-2">
              <span className="text-sm font-medium text-white">Video duration</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={15}
                  max={600}
                  step={15}
                  value={videoDuration}
                  onChange={(event) => setVideoDuration(Number(event.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="w-16 text-right text-white text-sm">{Math.round(videoDuration / 60)}m {videoDuration % 60}s</span>
              </div>
            </label>

            <label className="bg-white/5 rounded-xl p-4 space-y-2">
              <span className="text-sm font-medium text-white">Variations per platform</span>
              <input
                type="number"
                min={1}
                max={12}
                value={variationsPerPlatform}
                onChange={(event) => setVariationsPerPlatform(Number(event.target.value))}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              />
            </label>

            <label className="bg-white/5 rounded-xl p-4 space-y-2">
              <span className="text-sm font-medium text-white">AI b-roll clips</span>
              <input
                type="number"
                min={0}
                max={25}
                value={brollClips}
                onChange={(event) => setBrollClips(Number(event.target.value))}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              />
            </label>

            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <span className="text-sm font-medium text-white">Render quality</span>
              <select
                value={quality}
                onChange={(event) => setQuality(event.target.value as Quality)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              >
                {Object.entries(QUALITY_MULTIPLIERS).map(([id, config]) => (
                  <option key={id} value={id}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-white/5 p-4 text-white/80">
            <input
              type="checkbox"
              checked={includeCaptions}
              onChange={(event) => setIncludeCaptions(event.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
            Include AI caption/transcription estimate
          </label>
        </div>

        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5 space-y-4">
          <div>
            <p className="text-sm text-indigo-100">Estimated batch cost</p>
            <p className="text-4xl font-bold text-white">{currencyFormatter.format(estimate.totalCost)}</p>
            <p className="text-xs text-white/50 mt-1">Planning estimate only; provider billing may vary.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Exports" value={estimate.exportCount.toString()} />
            <Metric label="Render minutes" value={`${estimate.renderMinutes}m`} />
            <Metric label="Video minutes" value={estimate.renderedMinutes.toFixed(1)} />
            <Metric label="Storage" value={`${estimate.storageGb.toFixed(2)} GB`} />
          </div>

          <div className="space-y-2 rounded-xl bg-black/20 p-4 text-sm">
            <CostRow label="AI b-roll" value={estimate.brollCost} />
            <CostRow label="Captions" value={estimate.captionCost} />
            <CostRow label="Rendering" value={estimate.renderCost} />
            <CostRow label="Storage" value={estimate.storageCost} />
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm font-medium text-white mb-2">Batch checklist</p>
            <ul className="space-y-1 text-xs text-white/60">
              <li>• Create one export preset per selected aspect ratio.</li>
              <li>• Generate b-roll before queueing high-quality renders.</li>
              <li>• Use draft quality for caption timing reviews.</li>
              <li>• Clear completed renders after delivery to limit storage drift.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-white/70">
      <span>{label}</span>
      <span className="font-medium text-white">{currencyFormatter.format(value)}</span>
    </div>
  );
}
