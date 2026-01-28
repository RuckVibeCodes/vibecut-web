'use client';

import { useState, useCallback, useEffect } from 'react';
import { Asset, getAssetType } from '@/lib/supabase';

interface Props {
  onSelectAsset?: (asset: Asset) => void;
}

// Local storage based asset management (no Supabase required)
// Assets stored as base64 data URLs for simplicity
interface LocalAsset extends Asset {
  dataUrl: string;
}

export function AssetManager({ onSelectAsset }: Props) {
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'image' | 'gif'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load assets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vibecut-assets');
    if (stored) {
      try {
        setAssets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load assets:', e);
      }
    }
  }, []);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('vibecut-assets', JSON.stringify(assets));
    }
  }, [assets]);

  const handleUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    
    const newAssets: LocalAsset[] = [];
    
    for (const file of Array.from(files)) {
      try {
        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Get dimensions for images/video
        let width, height, duration;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = dataUrl;
          });
          width = img.width;
          height = img.height;
        } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
          const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
          await new Promise((resolve) => {
            media.onloadedmetadata = resolve;
            media.src = dataUrl;
          });
          duration = media.duration;
          if (file.type.startsWith('video/')) {
            width = (media as HTMLVideoElement).videoWidth;
            height = (media as HTMLVideoElement).videoHeight;
          }
        }

        const asset: LocalAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: getAssetType(file.type),
          file_path: file.name,
          file_size: file.size,
          mime_type: file.type,
          duration,
          width,
          height,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dataUrl,
        };

        newAssets.push(asset);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    setAssets(prev => [...newAssets, ...prev]);
    setIsUploading(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const filteredAssets = assets.filter(asset => {
    if (filter !== 'all' && asset.type !== filter) return false;
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Asset Library</h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-indigo-500 mb-3"
        />
        
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'video', 'audio', 'image', 'gif'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {type === 'all' ? '📁 All' : 
               type === 'video' ? '🎬 Video' : 
               type === 'audio' ? '🎵 Audio' : 
               type === 'gif' ? '🎭 GIFs' : '🖼️ Images'}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mx-4 mt-4 border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/40 hover:bg-white/5 transition cursor-pointer"
        onClick={() => document.getElementById('asset-upload')?.click()}
      >
        <input
          id="asset-upload"
          type="file"
          multiple
          accept="video/*,audio/*,image/*,.gif"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
        {isUploading ? (
          <p className="text-white/60 text-sm">Uploading...</p>
        ) : (
          <>
            <p className="text-white/60 text-sm">Drop files or click to upload</p>
            <p className="text-white/40 text-xs mt-1">Video, audio, or images</p>
          </>
        )}
      </div>

      {/* Asset grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">No assets yet</p>
            <p className="text-white/30 text-xs mt-1">Upload some files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition cursor-pointer"
                onClick={() => onSelectAsset?.(asset)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(asset));
                }}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-black/50 flex items-center justify-center relative">
                  {asset.type === 'image' || asset.type === 'gif' ? (
                    <img 
                      src={asset.dataUrl} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : asset.type === 'video' ? (
                    <video 
                      src={asset.dataUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🎵</span>
                  )}
                  
                  {/* GIF badge */}
                  {asset.type === 'gif' && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-500/80 rounded text-white text-xs font-bold">
                      GIF
                    </span>
                  )}
                  
                  {/* Duration badge */}
                  {asset.duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs">
                      {formatDuration(asset.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-white text-xs truncate">{asset.name}</p>
                  <p className="text-white/40 text-xs">{formatSize(asset.file_size)}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <span className="text-white text-xs">×</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/40">
          <span>{assets.length} assets</span>
          <span>{formatSize(assets.reduce((acc, a) => acc + a.file_size, 0))} used</span>
        </div>
      </div>
    </div>
  );
}
