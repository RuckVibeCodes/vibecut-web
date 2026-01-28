import { NextResponse } from 'next/server';

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

interface Highlight {
  id: string;
  type: 'key_phrase' | 'emotion' | 'question' | 'exclamation' | 'silence' | 'rapid_speech';
  start: number;
  end: number;
  text: string;
  score: number; // 0-1 relevance score
  reason: string;
}

// Detect highlights/viral moments from transcript
export async function POST(request: Request) {
  try {
    const { transcript, words, useAI = false, apiKey, provider = 'anthropic' } = await request.json();

    if (!transcript && !words) {
      return NextResponse.json({ error: 'Transcript or words required' }, { status: 400 });
    }

    let highlights: Highlight[] = [];

    // Rule-based detection (always runs)
    const ruleBasedHighlights = detectRuleBasedHighlights(words || [], transcript || '');
    highlights = [...ruleBasedHighlights];

    // AI-enhanced detection (optional)
    if (useAI && apiKey) {
      const aiHighlights = await detectAIHighlights(transcript || wordsToText(words), apiKey, provider);
      highlights = mergeHighlights(highlights, aiHighlights);
    }

    // Sort by score descending
    highlights.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      highlights,
      totalCount: highlights.length,
    });
  } catch (error) {
    console.error('Highlight detection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Detection failed' },
      { status: 500 }
    );
  }
}

function wordsToText(words: TranscriptWord[]): string {
  return words.map(w => w.punctuated_word || w.word).join(' ');
}

function detectRuleBasedHighlights(words: TranscriptWord[], transcript: string): Highlight[] {
  const highlights: Highlight[] = [];
  let highlightId = 0;

  // 1. Detect questions (engagement hooks)
  const questionRegex = /([^.!?]*\?)/g;
  let match;
  while ((match = questionRegex.exec(transcript)) !== null) {
    const questionText = match[1].trim();
    const timing = findTimingForText(words, questionText);
    if (timing) {
      highlights.push({
        id: `highlight-${++highlightId}`,
        type: 'question',
        start: timing.start,
        end: timing.end,
        text: questionText,
        score: 0.7,
        reason: 'Questions increase engagement and hook viewers',
      });
    }
  }

  // 2. Detect exclamations (emotion peaks)
  const exclamationRegex = /([^.!?]*!)/g;
  while ((match = exclamationRegex.exec(transcript)) !== null) {
    const exclamationText = match[1].trim();
    const timing = findTimingForText(words, exclamationText);
    if (timing) {
      highlights.push({
        id: `highlight-${++highlightId}`,
        type: 'exclamation',
        start: timing.start,
        end: timing.end,
        text: exclamationText,
        score: 0.65,
        reason: 'Emotional moments capture attention',
      });
    }
  }

  // 3. Detect key phrases
  const keyPhrases = [
    'here\'s the thing',
    'the secret is',
    'most people don\'t',
    'what you need to know',
    'the truth is',
    'listen',
    'watch this',
    'check this out',
    'this is important',
    'game changer',
    'mind blown',
    'crazy',
    'insane',
    'unbelievable',
    'you won\'t believe',
    'number one',
    'first thing',
    'biggest mistake',
    'pro tip',
    'hot take',
  ];

  const lowerTranscript = transcript.toLowerCase();
  for (const phrase of keyPhrases) {
    const index = lowerTranscript.indexOf(phrase);
    if (index !== -1) {
      const context = transcript.substring(
        Math.max(0, index - 20),
        Math.min(transcript.length, index + phrase.length + 50)
      );
      const timing = findTimingForText(words, phrase);
      if (timing) {
        highlights.push({
          id: `highlight-${++highlightId}`,
          type: 'key_phrase',
          start: timing.start,
          end: timing.end,
          text: context.trim(),
          score: 0.8,
          reason: `Contains hook phrase: "${phrase}"`,
        });
      }
    }
  }

  // 4. Detect rapid speech (excitement indicator)
  if (words.length > 10) {
    const windowSize = 10;
    for (let i = 0; i <= words.length - windowSize; i++) {
      const windowWords = words.slice(i, i + windowSize);
      const duration = windowWords[windowWords.length - 1].end - windowWords[0].start;
      const wordsPerSecond = windowSize / duration;
      
      if (wordsPerSecond > 4) { // Fast speech threshold
        highlights.push({
          id: `highlight-${++highlightId}`,
          type: 'rapid_speech',
          start: windowWords[0].start,
          end: windowWords[windowWords.length - 1].end,
          text: windowWords.map(w => w.punctuated_word || w.word).join(' '),
          score: 0.6,
          reason: `Rapid speech (${wordsPerSecond.toFixed(1)} words/sec) indicates excitement`,
        });
      }
    }
  }

  // 5. Detect pauses/silences (dramatic effect)
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > 1.5) { // 1.5+ second pause
      highlights.push({
        id: `highlight-${++highlightId}`,
        type: 'silence',
        start: words[i - 1].end,
        end: words[i].start,
        text: `[${gap.toFixed(1)}s pause] ${words[i].punctuated_word || words[i].word}`,
        score: 0.5,
        reason: 'Dramatic pause - good for emphasis',
      });
    }
  }

  return highlights;
}

function findTimingForText(words: TranscriptWord[], searchText: string): { start: number; end: number } | null {
  if (!words.length) return null;
  
  const searchWords = searchText.toLowerCase().split(/\s+/);
  const wordTexts = words.map(w => (w.punctuated_word || w.word).toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  for (let i = 0; i <= words.length - searchWords.length; i++) {
    let match = true;
    for (let j = 0; j < Math.min(searchWords.length, 5); j++) { // Check first 5 words
      const searchWord = searchWords[j].replace(/[^a-z0-9]/g, '');
      if (!wordTexts[i + j].includes(searchWord) && !searchWord.includes(wordTexts[i + j])) {
        match = false;
        break;
      }
    }
    if (match) {
      return {
        start: words[i].start,
        end: words[Math.min(i + searchWords.length - 1, words.length - 1)].end,
      };
    }
  }
  
  return null;
}

async function detectAIHighlights(transcript: string, apiKey: string, provider: string): Promise<Highlight[]> {
  const prompt = `Analyze this video transcript and identify the most "viral-worthy" moments - segments that would work well as short-form clips or hooks. For each highlight, provide:
1. The exact text
2. Why it's engaging (emotion, hook, insight, humor, etc.)
3. A score from 0-1 for viral potential

Transcript:
${transcript}

Return JSON array: [{ "text": "...", "reason": "...", "score": 0.X, "type": "emotion|hook|insight|humor|controversy" }]`;

  try {
    let response: Response;
    let content: string;

    if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) return [];
      const data = await response.json();
      content = data.content[0].text;
    } else {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) return [];
      const data = await response.json();
      content = data.choices[0].message.content;
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const aiHighlights = JSON.parse(jsonMatch[0]);
    return aiHighlights.map((h: { text: string; reason: string; score: number; type: string }, i: number) => ({
      id: `ai-highlight-${i}`,
      type: h.type || 'key_phrase',
      start: 0, // Would need to match with transcript timing
      end: 0,
      text: h.text,
      score: h.score,
      reason: h.reason,
    }));
  } catch {
    return [];
  }
}

function mergeHighlights(ruleBasedHighlights: Highlight[], aiHighlights: Highlight[]): Highlight[] {
  // Combine and deduplicate
  const all = [...ruleBasedHighlights];
  
  for (const aiH of aiHighlights) {
    // Check if similar highlight already exists
    const exists = all.some(h => 
      h.text.toLowerCase().includes(aiH.text.toLowerCase().substring(0, 20)) ||
      aiH.text.toLowerCase().includes(h.text.toLowerCase().substring(0, 20))
    );
    
    if (!exists) {
      all.push(aiH);
    }
  }
  
  return all;
}
