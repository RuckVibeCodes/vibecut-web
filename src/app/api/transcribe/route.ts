import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const apiKey = formData.get('apiKey') as string | null;
    const provider = (formData.get('provider') as string) || 'deepgram';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (provider === 'deepgram') {
      return await transcribeWithDeepgram(buffer, file.type, apiKey);
    } else if (provider === 'openai') {
      return await transcribeWithWhisper(buffer, file.name, apiKey);
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}

async function transcribeWithDeepgram(buffer: Buffer, mimeType: string, apiKey: string) {
  const response = await fetch(
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=false&utterances=false',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': mimeType || 'audio/wav',
      },
      body: new Uint8Array(buffer),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.err_msg || 'Deepgram transcription failed');
  }

  const data = await response.json();
  const channel = data.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative) {
    throw new Error('No transcription results');
  }

  const words = alternative.words?.map((w: {
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word?: string;
  }) => ({
    word: w.word,
    start: w.start,
    end: w.end,
    confidence: w.confidence,
    punctuated_word: w.punctuated_word || w.word,
  })) || [];

  return NextResponse.json({
    success: true,
    transcript: {
      text: alternative.transcript,
      words,
      duration: data.metadata?.duration || 0,
      confidence: alternative.confidence || 0,
    },
  });
}

async function transcribeWithWhisper(buffer: Buffer, filename: string, apiKey: string) {
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)]), filename);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Whisper transcription failed');
  }

  const data = await response.json();

  const words = data.words?.map((w: { word: string; start: number; end: number }) => ({
    word: w.word,
    start: w.start,
    end: w.end,
    confidence: 1,
    punctuated_word: w.word,
  })) || [];

  return NextResponse.json({
    success: true,
    transcript: {
      text: data.text,
      words,
      duration: data.duration || 0,
      confidence: 1,
    },
  });
}
