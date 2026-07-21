'use client';

import { AspectRatio, ASPECT_RATIOS } from '@/lib/types';

interface Props {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  durationSeconds?: number;
  sourceFileSizeBytes?: number;
}

const QUALITY_PRESETS = [
  { id: 'draft', label: 'Draft', bitrateMbps: 5, renderMultiplier: 0.8, description: 'Fast review pass' },
  { id: 'standard', label: 'Standard', bitrateMbps: 12, renderMultiplier: 1.5, description: 'Most social posts' },
  { id: 'high', label: 'High', bitrateMbps: 24, renderMultiplier: 2.4, description: 'Client/final export' },
] as const;

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';

  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;

  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

const estimateOutputSize = (durationSeconds: number, bitrateMbps: number) => {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return (durationSeconds * bitrateMbps * 1_000_000) / 8;
};

export function ExportPresets({ selected, onSelect, durationSeconds = 30, sourceFileSizeBytes }: Props) {
  const selectedConfig = ASPECT_RATIOS[selected];
  const estimatedMinutes = Math.max(1, Math.ceil((durationSeconds * 1.5) / 60));
  const hasSourceFile = typeof sourceFileSizeBytes === 'number' && sourceFileSizeBytes > 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Export Format</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ASPECT_RATIOS).map(([key, config]) => {
          const ratio = key as AspectRatio;
          const isSelected = selected === ratio;
          
          return (
            <button
              key={ratio}
              onClick={() => onSelect(ratio)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }
              `}
            >
              {/* Aspect ratio visual */}
              <div className="flex justify-center mb-3">
                <div
                  className={`bg-white/20 rounded ${isSelected ? 'bg-indigo-500/50' : ''}`}
                  style={{
                    width: ratio === '9:16' ? '24px' : ratio === '1:1' ? '40px' : ratio === '4:5' ? '32px' : '48px',
                    height: ratio === '9:16' ? '40px' : ratio === '1:1' ? '40px' : ratio === '4:5' ? '40px' : '27px',
                  }}
                />
              </div>
              
              <div className="text-2xl mb-1">{config.icon}</div>
              <div className="text-white font-medium text-sm">{config.name}</div>
              <div className="text-white/50 text-xs">{config.platform}</div>
              <div className="text-white/30 text-xs mt-1">{config.width}×{config.height}</div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-medium">Export readiness estimate</p>
            <p className="text-white/50 text-xs mt-1">
              {selectedConfig.platform} · {selectedConfig.width}×{selectedConfig.height} · {formatDuration(durationSeconds)} timeline
            </p>
          </div>
          <div className="rounded-lg bg-indigo-500/15 px-3 py-2 text-right">
            <p className="text-indigo-200 text-xs">Typical render</p>
            <p className="text-white font-semibold">~{estimatedMinutes} min</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {QUALITY_PRESETS.map((preset) => {
            const outputSize = estimateOutputSize(durationSeconds, preset.bitrateMbps);
            const renderMinutes = Math.max(1, Math.ceil((durationSeconds * preset.renderMultiplier) / 60));

            return (
              <div key={preset.id} className="rounded-lg bg-black/20 p-3 border border-white/10">
                <p className="text-white text-sm font-medium">{preset.label}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{preset.description}</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-white/40">Size</span>
                    <span className="text-white/70">~{formatFileSize(outputSize)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-white/40">Render</span>
                    <span className="text-white/70">~{renderMinutes} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-white/40 text-xs">
          {hasSourceFile
            ? `Source upload: ${formatFileSize(sourceFileSizeBytes)}. Estimates use common H.264 social bitrates; final Lambda output can vary with motion and effects.`
            : 'Upload a source video to tailor timeline duration. Estimates use common H.264 social bitrates and help pick a quality before queueing Lambda work.'}
        </p>
      </div>

      {/* Quick export buttons */}
      <div className="flex gap-3 mt-4">
        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
          <span>▶️</span> YouTube
        </button>
        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
          <span>📱</span> TikTok
        </button>
        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
          <span>📷</span> Instagram
        </button>
      </div>
    </div>
  );
}
