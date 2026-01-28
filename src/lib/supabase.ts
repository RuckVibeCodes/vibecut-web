import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
// Uses anon key stored in localStorage (set via Settings)
export function getSupabaseClient() {
  const stored = localStorage.getItem('vibecut-supabase');
  if (!stored) return null;
  
  try {
    const { url, anonKey } = JSON.parse(stored);
    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  } catch {
    return null;
  }
}

// Asset types
export interface Asset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'gif';
  file_path: string;
  file_size: number;
  mime_type: string;
  duration?: number; // for video/audio
  width?: number; // for video/image
  height?: number;
  thumbnail_path?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AssetUploadResult {
  success: boolean;
  asset?: Asset;
  error?: string;
}

// Helper to determine asset type from mime
export function getAssetType(mimeType: string): 'video' | 'audio' | 'image' | 'gif' {
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  return 'video'; // default
}

// Get signed URL for asset
export async function getAssetUrl(filePath: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data, error } = await supabase.storage
    .from('assets')
    .createSignedUrl(filePath, 3600); // 1 hour
    
  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
  
  return data.signedUrl;
}
