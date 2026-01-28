'use client';

import { useState, useCallback } from 'react';

interface ClipEdit {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  volume: number;
  speed: number;
  opacity: number;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
}

interface Props {
  duration: number;
  onEditChange?: (edit: Partial<ClipEdit>) => void;
}

export function SimpleEditor({ duration, onEditChange }: Props) {
  const [edit, setEdit] = useState<ClipEdit>({
    id: 'main',
    name: 'Main Clip',
    startTime: 0,
    endTime: duration,
    volume: 100,
    speed: 1,
    opacity: 100,
    position: { x: 50, y: 50 },
    scale: 100,
    rotation: 0,
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    },
  });

  const [activeSection, setActiveSection] = useState<'trim' | 'transform' | 'audio' | 'filters'>('trim');

  const updateEdit = useCallback((updates: Partial<ClipEdit>) => {
    setEdit(prev => {
      const newEdit = { ...prev, ...updates };
      onEditChange?.(newEdit);
      return newEdit;
    });
  }, [onEditChange]);

  const updateFilters = useCallback((filterUpdates: Partial<ClipEdit['filters']>) => {
    setEdit(prev => {
      const newEdit = { 
        ...prev, 
        filters: { ...prev.filters, ...filterUpdates } 
      };
      onEditChange?.(newEdit);
      return newEdit;
    });
  }, [onEditChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const Slider = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    unit = '',
    showValue = true
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    showValue?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        {showValue && <span className="text-white">{value}{unit}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Edit Clip</h3>

      {/* Section tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'trim', label: '✂️ Trim', name: 'trim' as const },
          { id: 'transform', label: '🔄 Transform', name: 'transform' as const },
          { id: 'audio', label: '🔊 Audio', name: 'audio' as const },
          { id: 'filters', label: '🎨 Filters', name: 'filters' as const },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.name)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
              activeSection === section.name
                ? 'bg-indigo-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Trim section */}
      {activeSection === 'trim' && (
        <div className="space-y-4 bg-white/5 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-2">Start Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={edit.endTime - 0.1}
                  step={0.1}
                  value={edit.startTime}
                  onChange={(e) => updateEdit({ startTime: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
                />
                <span className="text-white/50 text-xs">sec</span>
              </div>
              <p className="text-white/40 text-xs mt-1">{formatTime(edit.startTime)}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">End Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={edit.startTime + 0.1}
                  max={duration}
                  step={0.1}
                  value={edit.endTime}
                  onChange={(e) => updateEdit({ endTime: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
                />
                <span className="text-white/50 text-xs">sec</span>
              </div>
              <p className="text-white/40 text-xs mt-1">{formatTime(edit.endTime)}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Duration: <span className="text-white">{formatTime(edit.endTime - edit.startTime)}</span>
            </p>
          </div>

          <Slider
            label="Playback Speed"
            value={edit.speed}
            onChange={(v) => updateEdit({ speed: v })}
            min={0.25}
            max={4}
            step={0.25}
            unit="x"
          />
        </div>
      )}

      {/* Transform section */}
      {activeSection === 'transform' && (
        <div className="space-y-4 bg-white/5 rounded-lg p-4">
          <Slider
            label="Scale"
            value={edit.scale}
            onChange={(v) => updateEdit({ scale: v })}
            min={10}
            max={200}
            unit="%"
          />
          
          <Slider
            label="Rotation"
            value={edit.rotation}
            onChange={(v) => updateEdit({ rotation: v })}
            min={-180}
            max={180}
            unit="°"
          />
          
          <Slider
            label="Opacity"
            value={edit.opacity}
            onChange={(v) => updateEdit({ opacity: v })}
            min={0}
            max={100}
            unit="%"
          />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="text-white/70 text-sm block mb-2">Position X</label>
              <input
                type="number"
                value={edit.position.x}
                onChange={(e) => updateEdit({ position: { ...edit.position, x: parseFloat(e.target.value) } })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Position Y</label>
              <input
                type="number"
                value={edit.position.y}
                onChange={(e) => updateEdit({ position: { ...edit.position, y: parseFloat(e.target.value) } })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => updateEdit({ scale: 100, rotation: 0, opacity: 100, position: { x: 50, y: 50 } })}
            className="w-full px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 hover:text-white transition"
          >
            Reset Transform
          </button>
        </div>
      )}

      {/* Audio section */}
      {activeSection === 'audio' && (
        <div className="space-y-4 bg-white/5 rounded-lg p-4">
          <Slider
            label="Volume"
            value={edit.volume}
            onChange={(v) => updateEdit({ volume: v })}
            min={0}
            max={200}
            unit="%"
          />

          <div className="flex gap-2">
            <button
              onClick={() => updateEdit({ volume: 0 })}
              className="flex-1 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 hover:text-white transition"
            >
              🔇 Mute
            </button>
            <button
              onClick={() => updateEdit({ volume: 100 })}
              className="flex-1 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 hover:text-white transition"
            >
              🔊 100%
            </button>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-white/50 text-sm">Audio options</p>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-2 bg-white/10 text-white/70 rounded-lg text-xs hover:bg-white/20 transition">
                Fade In
              </button>
              <button className="px-3 py-2 bg-white/10 text-white/70 rounded-lg text-xs hover:bg-white/20 transition">
                Fade Out
              </button>
              <button className="px-3 py-2 bg-white/10 text-white/70 rounded-lg text-xs hover:bg-white/20 transition">
                Normalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters section */}
      {activeSection === 'filters' && (
        <div className="space-y-4 bg-white/5 rounded-lg p-4">
          <Slider
            label="Brightness"
            value={edit.filters.brightness}
            onChange={(v) => updateFilters({ brightness: v })}
            min={0}
            max={200}
            unit="%"
          />
          
          <Slider
            label="Contrast"
            value={edit.filters.contrast}
            onChange={(v) => updateFilters({ contrast: v })}
            min={0}
            max={200}
            unit="%"
          />
          
          <Slider
            label="Saturation"
            value={edit.filters.saturation}
            onChange={(v) => updateFilters({ saturation: v })}
            min={0}
            max={200}
            unit="%"
          />
          
          <Slider
            label="Blur"
            value={edit.filters.blur}
            onChange={(v) => updateFilters({ blur: v })}
            min={0}
            max={20}
            unit="px"
          />

          <button
            onClick={() => updateFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 })}
            className="w-full px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 hover:text-white transition"
          >
            Reset Filters
          </button>

          {/* Preset filters */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/50 text-sm mb-2">Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Warm', b: 105, c: 105, s: 110 },
                { name: 'Cool', b: 100, c: 100, s: 90 },
                { name: 'Vintage', b: 95, c: 90, s: 80 },
                { name: 'B&W', b: 100, c: 110, s: 0 },
                { name: 'Vibrant', b: 105, c: 115, s: 130 },
                { name: 'Muted', b: 100, c: 90, s: 70 },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateFilters({ 
                    brightness: preset.b, 
                    contrast: preset.c, 
                    saturation: preset.s 
                  })}
                  className="px-2 py-2 bg-white/10 text-white/70 rounded-lg text-xs hover:bg-white/20 hover:text-white transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
