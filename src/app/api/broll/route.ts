import { NextResponse } from 'next/server';
import { WaveSpeedClient } from '@/lib/wavespeed';
import type { WaveSpeedModel } from '@/lib/types/ai';

// Generate B-Roll video using WaveSpeed AI or Replicate
export async function POST(request: Request) {
  try {
    const { 
      prompt, 
      duration = 4, 
      aspectRatio = '16:9', 
      provider = 'wavespeed',
      model,
      apiKey 
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (provider === 'wavespeed') {
      return await generateWithWaveSpeed(prompt, duration, aspectRatio, apiKey, model);
    } else if (provider === 'replicate') {
      return await generateWithReplicate(prompt, duration, aspectRatio, apiKey);
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('B-Roll generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

async function generateWithWaveSpeed(
  prompt: string, 
  duration: number, 
  aspectRatio: string, 
  apiKey: string,
  model?: WaveSpeedModel
) {
  const client = new WaveSpeedClient({ apiKey });
  
  const result = await client.generateVideo(prompt, {
    model: model || 'pixverse-v4.5',
    duration: Math.min(duration, 10),
    aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1' | '4:5',
    quality: 'high',
  });

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'WaveSpeed generation failed');
  }

  return NextResponse.json({
    success: true,
    videoUrl: result.data.videoUrl,
    thumbnailUrl: result.data.thumbnailUrl,
    duration: result.data.duration,
    width: result.data.width,
    height: result.data.height,
    provider: 'wavespeed',
    model: result.data.model,
    requestId: result.requestId,
  });
}

async function generateWithReplicate(
  prompt: string, 
  duration: number, 
  aspectRatio: string, 
  apiKey: string
) {
  // Start prediction with Replicate
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Using minimax/video-01 or similar model
      version: 'minimax/video-01', 
      input: {
        prompt,
        duration: Math.min(duration, 6),
        aspect_ratio: aspectRatio,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();

  // Poll for completion
  let result = prediction;
  const maxAttempts = 60; // 5 minutes max
  let attempts = 0;

  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const pollResponse = await fetch(result.urls.get, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });
    
    if (!pollResponse.ok) break;
    result = await pollResponse.json();
    attempts++;
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Video generation failed');
  }

  if (result.status !== 'succeeded') {
    throw new Error('Video generation timed out');
  }

  return NextResponse.json({
    success: true,
    videoUrl: result.output,
    provider: 'replicate',
  });
}

// GET endpoint to check generation status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get('id');
  const apiKey = searchParams.get('apiKey');
  const provider = searchParams.get('provider') || 'replicate';

  if (!predictionId || !apiKey) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (provider === 'replicate') {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({
      status: result.status,
      videoUrl: result.output,
      error: result.error,
    });
  }

  if (provider === 'wavespeed') {
    // WaveSpeed status check
    const client = new WaveSpeedClient({ apiKey });
    // Status is handled internally by the client during generation
    // This endpoint is primarily for Replicate's async model
    return NextResponse.json({ 
      error: 'WaveSpeed handles polling internally. Check generation result.' 
    }, { status: 400 });
  }

  return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
}
