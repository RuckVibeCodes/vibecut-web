import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert AI video editor assistant for VibeCut, a Remotion-based video production tool. Your job is to help users create video compositions by generating React/Remotion code.

When users describe what they want, you should:
1. Understand their creative intent
2. Generate clean, working Remotion code
3. Explain what the code does

VibeCut uses these components (from the VibeCut component library):
- TitleSlide: Full-screen title with optional className for theming
- ContentSlide: Header + body text  
- CodeSlide: Display code with syntax highlighting
- VideoSlide: Embed video files
- Logo: Animated logo overlay with position and size options
- Caption: Animated captions/subtitles synced to transcript
- Music: Background audio with fade in/out

Key Remotion patterns:
- Use <Sequence from={frame}> for timing
- Use <TransitionSeries> with fade() for transitions
- secondsToFrames(seconds) converts timing (60fps default)
- All compositions run at 60fps

Example response format:
"Here's a 10-second intro sequence with your logo fading in:

\`\`\`tsx
import { Sequence } from 'remotion';
import { TitleSlide } from '../components/TitleSlide';
import { Logo } from '../components/Logo';
import { secondsToFrames } from '../config';

export const MyIntro: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={secondsToFrames(10)}>
        <TitleSlide title="Welcome" className="bg-gradient-to-br from-indigo-900 to-purple-900" />
      </Sequence>
      <Sequence from={secondsToFrames(1)} durationInFrames={secondsToFrames(5)}>
        <Logo src="/logo.svg" position="center" size={200} />
      </Sequence>
    </>
  );
};
\`\`\`

This creates a title slide with a gradient background, then fades in your logo after 1 second."

Be helpful, creative, and generate working code. If the user's request is unclear, ask clarifying questions.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { prompt, provider, apiKey, conversationHistory } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    let response: Response;
    let assistantMessage: string;

    if (provider === 'anthropic') {
      // Call Claude API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            ...conversationHistory.map((m: Message) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Anthropic API error:', error);
        return NextResponse.json(
          { error: error.error?.message || 'Failed to call Claude API' },
          { status: response.status }
        );
      }

      const data = await response.json();
      assistantMessage = data.content[0].text;
    } else {
      // Call OpenAI API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.map((m: Message) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: prompt },
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        return NextResponse.json(
          { error: error.error?.message || 'Failed to call OpenAI API' },
          { status: response.status }
        );
      }

      const data = await response.json();
      assistantMessage = data.choices[0].message.content;
    }

    // Extract code block if present
    const codeMatch = assistantMessage.match(/```(?:tsx?|jsx?|javascript|typescript)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : undefined;

    return NextResponse.json({
      message: assistantMessage,
      code,
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
