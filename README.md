# VibeCut Web

VibeCut is a Next.js + Remotion video-production workspace for turning raw talking-head footage into polished short-form and YouTube-ready edits. It combines an in-browser editor, AI captioning and generation tools, and a Remotion render pipeline.

## What it does

- **Browser editor**: upload footage, preview it in a Remotion player, scrub the timeline, add text overlays, adjust speed, choose filters, and export in common social aspect ratios.
- **AI captions**: transcribe uploads with Deepgram or OpenAI Whisper and preview animated word-level captions.
- **AI video assistant**: generate Remotion composition snippets from natural-language prompts using Anthropic or OpenAI.
- **B-roll generation**: create short b-roll clips from text prompts through WaveSpeed or Replicate providers.
- **Voice tools**: list ElevenLabs voices, clone a voice from samples, generate speech, and generate sound effects.
- **Highlight detection**: find hook-worthy moments from transcript text with rule-based detection or optional AI analysis.
- **Batch rendering**: queue Remotion Lambda exports for 16:9, 9:16, 1:1, and 4:5 deliverables.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Remotion 4 (`@remotion/player`, `@remotion/cli`, `@remotion/lambda`)
- Optional Supabase storage for media assets

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then:

1. Visit **Settings** and save any provider keys you want to use.
2. Open **Editor** to upload footage and style captions/overlays.
3. Visit **AI Tools** for b-roll, voice, highlight, and render workflows.

Provider API keys are entered by the user in the app and stored in browser local storage. Do not commit personal provider keys to the repository.

## Useful scripts

```bash
npm run dev                 # Start the local Next.js dev server
npm run build               # Build the production app
npm run start               # Start the production server
npm run lint                # Run ESLint
npm run remotion:preview    # Open Remotion Studio
npm run remotion:build      # Bundle Remotion compositions
npm run remotion:render     # Render the default 16:9 cinematic composition
```

## Project map

```text
src/app/                 Next.js pages and API routes
src/app/editor/          Main editing experience
src/app/tools/           AI tools dashboard
src/app/api/             Transcription, generation, b-roll, voice, project, and render APIs
src/components/          Editor and tool UI components
src/lib/                 Project store, rendering utilities, Supabase helpers, AI clients, types
src/remotion/            Remotion compositions and reusable video components
```

## API routes

| Route | Purpose |
| --- | --- |
| `POST /api/transcribe` | Transcribe uploaded media with Deepgram or OpenAI Whisper. |
| `POST /api/generate` | Generate Remotion/React code from an editing prompt. |
| `POST /api/broll` | Generate AI b-roll with WaveSpeed or Replicate. |
| `GET /api/broll` | Poll supported b-roll providers for generation status. |
| `POST /api/voice` | List voices, clone voices, generate speech, or generate sound effects. |
| `POST /api/highlights` | Detect highlight-worthy transcript moments. |
| `GET/POST/PUT/DELETE /api/project` | Manage in-memory project records for the current server process. |
| `POST/GET /api/render` | Queue or inspect Remotion render jobs. |
| `POST /api/command` | Apply structured editing commands to a project. |

## Configuration notes

Most AI provider credentials are supplied per request from the browser settings UI. Remotion Lambda rendering also reads server environment variables when available:

```bash
AWS_REGION=us-east-1
REMOTION_LAMBDA_FUNCTION=vibecut-render
REMOTION_LAMBDA_BUCKET=vibecut-renders
```

The render API currently falls back to simulated jobs when AWS credentials are not configured, which keeps the UI testable in local development.

## Current limitations

- `ProjectStore` and render job state are in-memory; server restarts clear them.
- Uploaded editor files are previewed via browser object URLs unless wired into persistent asset storage.
- Some AI tools depend on third-party provider limits and model availability.

## Deployment

The app can be deployed like a standard Next.js application. For hosted rendering, provision Remotion Lambda infrastructure and configure the environment variables above in the deployment platform.
