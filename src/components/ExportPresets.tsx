'use client';

import { AspectRatio, ASPECT_RATIOS } from '@/lib/types';

interface Props {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
}

export function ExportPresets({ selected, onSelect }: Props) {
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
