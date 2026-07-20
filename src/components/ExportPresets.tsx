'use client';

import { AspectRatio, ASPECT_RATIOS } from '@/lib/types';

interface Props {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
}

type PlatformPreset = {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  ratio: AspectRatio;
  recommendation: string;
  checklist: string[];
};

const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '▶️',
    gradient: 'from-red-500 to-pink-500',
    ratio: '16:9',
    recommendation: 'Use landscape for long-form uploads, trailers, and explainers.',
    checklist: ['Keep key text inside the center 80%', 'Export 1080p+ for crisp thumbnails', 'Add hook text in the first 5 seconds'],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '📱',
    gradient: 'from-pink-500 to-purple-500',
    ratio: '9:16',
    recommendation: 'Use full-screen portrait for TikTok, Reels, and Shorts cuts.',
    checklist: ['Avoid bottom 20% for captions and CTAs', 'Lead with the strongest visual beat', 'Keep captions large and center-weighted'],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📷',
    gradient: 'from-purple-500 to-indigo-500',
    ratio: '4:5',
    recommendation: 'Use 4:5 for feed posts that need more screen space than square.',
    checklist: ['Place headline text above the fold', 'Keep logos away from corners', 'Check the crop before cross-posting to Reels'],
  },
];

export function ExportPresets({ selected, onSelect }: Props) {
  const selectedConfig = ASPECT_RATIOS[selected];
  const matchingPreset = PLATFORM_PRESETS.find((preset) => preset.ratio === selected);

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

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">{selectedConfig.platform} delivery notes</p>
            <p className="text-sm text-white/60 mt-1">
              {matchingPreset?.recommendation ?? 'Use this crop for square social posts, ads, and profile-friendly previews.'}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200">
            {selectedConfig.width}×{selectedConfig.height}
          </span>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {(matchingPreset?.checklist ?? [
            'Keep subject and captions centered',
            'Preview on mobile before publishing',
            'Use bold contrast for small screens',
          ]).map((item) => (
            <li key={item} className="flex gap-2 text-xs text-white/60">
              <span className="text-indigo-300">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick export buttons */}
      <div className="flex gap-3 mt-4">
        {PLATFORM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.ratio)}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${preset.gradient} rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 ${
              selected === preset.ratio ? 'ring-2 ring-white/70' : ''
            }`}
            aria-pressed={selected === preset.ratio}
          >
            <span>{preset.icon}</span> {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
