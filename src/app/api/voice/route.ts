import { NextResponse } from 'next/server';

// ElevenLabs Voice Cloning and TTS
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const apiKey = formData.get('apiKey') as string;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    switch (action) {
      case 'list-voices':
        return await listVoices(apiKey);
      case 'clone-voice':
        return await cloneVoice(formData, apiKey);
      case 'generate-speech':
        return await generateSpeech(formData, apiKey);
      case 'generate-sound-effect':
        return await generateSoundEffect(formData, apiKey);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Voice operation failed' },
      { status: 500 }
    );
  }
}

async function listVoices(apiKey: string) {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch voices');
  }

  const data = await response.json();
  
  return NextResponse.json({
    success: true,
    voices: data.voices.map((v: {
      voice_id: string;
      name: string;
      category: string;
      labels: Record<string, string>;
      preview_url: string;
    }) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      labels: v.labels,
      previewUrl: v.preview_url,
    })),
  });
}

async function cloneVoice(formData: FormData, apiKey: string) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const files = formData.getAll('files') as File[];

  if (!name || files.length === 0) {
    throw new Error('Name and at least one audio file required');
  }

  // Build multipart form for ElevenLabs
  const elevenLabsForm = new FormData();
  elevenLabsForm.append('name', name);
  if (description) {
    elevenLabsForm.append('description', description);
  }
  
  for (const file of files) {
    elevenLabsForm.append('files', file);
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: elevenLabsForm,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail?.message || 'Failed to clone voice');
  }

  const data = await response.json();
  
  return NextResponse.json({
    success: true,
    voiceId: data.voice_id,
    message: `Voice "${name}" created successfully`,
  });
}

async function generateSpeech(formData: FormData, apiKey: string) {
  const text = formData.get('text') as string;
  const voiceId = formData.get('voiceId') as string;
  const modelId = (formData.get('modelId') as string) || 'eleven_multilingual_v2';
  const stability = parseFloat((formData.get('stability') as string) || '0.5');
  const similarityBoost = parseFloat((formData.get('similarityBoost') as string) || '0.75');

  if (!text || !voiceId) {
    throw new Error('Text and voiceId are required');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail?.message || 'Failed to generate speech');
  }

  // Get audio as base64
  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

  return NextResponse.json({
    success: true,
    audioUrl: audioDataUrl,
    format: 'mp3',
  });
}

async function generateSoundEffect(formData: FormData, apiKey: string) {
  const text = formData.get('text') as string;
  const durationSeconds = parseFloat((formData.get('duration') as string) || '2');

  if (!text) {
    throw new Error('Text description is required');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      duration_seconds: durationSeconds,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail?.message || 'Failed to generate sound effect');
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

  return NextResponse.json({
    success: true,
    audioUrl: audioDataUrl,
    format: 'mp3',
  });
}
