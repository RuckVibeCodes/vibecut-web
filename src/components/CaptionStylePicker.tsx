'use client';

import { useState } from 'react';
import { CAPTION_STYLES, CaptionStyleId, CaptionStyle } from '@/lib/types';

interface Props {
  selected: CaptionStyleId;
  onSelect: (styleId: CaptionStyleId) => void;
}

export function CaptionStylePicker({ selected, onSelect }: Props) {
  const [hoveredStyle, setHoveredStyle] = useState<CaptionStyle | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Caption Style</h3>
      
      {/* Style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CAPTION_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            onMouseEnter={() => setHoveredStyle(style)}
            onMouseLeave={() => setHoveredStyle(null)}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              ${selected === style.id
                ? 'border-indigo-500 bg-indigo-500/20'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              }
            `}
          >
            <div className="text-3xl mb-2">{style.preview}</div>
            <div className="text-white font-medium text-sm">{style.name}</div>
            <div className="text-white/50 text-xs mt-1 line-clamp-1">{style.description}</div>
            
            {selected === style.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-black rounded-xl p-8 relative overflow-hidden min-h-[200px] flex items-center justify-center">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        
        {/* Caption Preview */}
        <CaptionPreview style={hoveredStyle || CAPTION_STYLES.find(s => s.id === selected) || CAPTION_STYLES[0]} />
      </div>
    </div>
  );
}

function CaptionPreview({ style }: { style: CaptionStyle }) {
  const words = ['This', 'is', 'how', 'your', 'captions', 'will', 'look'];
  const currentWordIndex = 3; // "your" is highlighted

  const getPositionClass = () => {
    switch (style.config.position) {
      case 'top': return 'items-start pt-8';
      case 'center': return 'items-center';
      case 'bottom': return 'items-end pb-8';
    }
  };

  const getAnimationClass = (index: number) => {
    if (style.config.animation === 'bounce') {
      return 'animate-bounce';
    }
    if (style.config.animation === 'pop') {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className={`relative z-10 w-full flex justify-center ${getPositionClass()}`}>
      <div
        className="text-center px-4 py-2 rounded-lg"
        style={{
          backgroundColor: style.config.backgroundColor,
          fontFamily: style.config.fontFamily,
        }}
      >
        <p
          className="flex flex-wrap justify-center gap-x-2"
          style={{
            fontSize: `${style.config.fontSize * 0.5}px`,
            fontWeight: style.config.fontWeight,
            textShadow: style.config.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : undefined,
          }}
        >
          {words.map((word, i) => {
            const isHighlighted = style.config.highlightCurrentWord && i === currentWordIndex;
            return (
              <span
                key={i}
                className={getAnimationClass(i)}
                style={{
                  color: isHighlighted ? style.config.highlightColor : style.config.color,
                  WebkitTextStroke: style.config.outline ? `1px ${style.config.outlineColor}` : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
