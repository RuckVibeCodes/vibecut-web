import { NextResponse } from 'next/server';

// Generate B-Roll video using WaveSpeed AI or Replicate
export async function POST(request: Request) {
  try {
    const { prompt, duration = 4, aspectRatio = '16:9', provider = 'wavespeed', apiKey } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (provider === 'wavespeed') {
      return await generateWithWaveSpeed(prompt, duration, aspectRatio, apiKey);
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

async function generateWithWaveSpeed(prompt: string, duration: number, aspectRatio: string, apiKey: string) {
  // WaveSpeed API for video generation
  // Using their Wan 2.1 or similar model
  const response = await fetch('https://api.wavespeed.ai/v1/video/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: 'wan-2.1', // or 'veo-2' when available
      duration: Math.min(duration, 10), // Max 10 seconds
      aspect_ratio: aspectRatio,
      quality: 'high',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `WaveSpeed API error: ${response.status}`);
  }

  const data = await response.json();
  
  return NextResponse.json({
    success: true,
    videoUrl: data.video_url || data.output?.video_url,
    thumbnailUrl: data.thumbnail_url,
    duration: data.duration,
    provider: 'wavespeed',
  });
}

async function generateWithReplicate(prompt: string, duration: number, aspectRatio: string, apiKey: string) {
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

  return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
}
