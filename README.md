# VibeCut Web

VibeCut is a browser-based video creation studio for turning long-form clips and ideas into short, social-ready edits. The app combines AI-assisted scripting, b-roll generation, voice tools, project/export management, and Remotion-powered rendering in a Next.js 16 interface.

## What is in the app

- **Editor** (`/editor`) — assemble scripts, captions, assets, b-roll, music, and export presets.
- **Tools** (`/tools`) — standalone b-roll, voice cloning, highlight detection, and render queue workflows.
- **Settings** (`/settings`) — configure provider keys in the browser for local creative workflows.
- **Render engine** — queues aspect-ratio exports and uses Remotion Lambda when AWS/Remotion env vars are available, otherwise falls back to simulated renders for local development.

## Tech stack

- Next.js 16 App Router + React 19
- TypeScript
- Tailwind CSS 4
- Remotion 4 for video composition/rendering
- Optional Supabase client for project persistence hooks
- Optional Anthropic, ElevenLabs, WaveSpeed, and AWS/Remotion integrations

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000> and start with the editor, tools page, or settings page.

## Scripts

```bash
npm run dev              # Start the Next.js dev server
npm run build            # Build the production app
npm run start            # Serve a production build
npm run lint             # Run ESLint
npm run remotion:preview # Open Remotion Studio for src/remotion/Root.tsx
npm run remotion:build   # Bundle the Remotion project
npm run remotion:render  # Render the default 16:9 composition locally
```

## Configuration

Server-side rendering configuration is read from environment variables. Copy `.env.example` to `.env.local` and fill in the values you need.

| Variable | Required | Purpose |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | Only for real Lambda renders | AWS credentials used by Remotion Lambda. |
| `AWS_SECRET_ACCESS_KEY` | Only for real Lambda renders | AWS credentials used by Remotion Lambda. |
| `AWS_REGION` | Optional | AWS region; defaults to `us-east-1`. |
| `REMOTION_LAMBDA_FUNCTION` | Only for real Lambda renders | Deployed Remotion Lambda function name; defaults to `vibecut-render` in code. |
| `REMOTION_S3_BUCKET` | Only for real Lambda renders | S3 bucket for render output; defaults to `vibecut-renders` in code. |
| `REMOTION_SERVE_URL` | Only for real Lambda renders | Hosted Remotion bundle/site URL used by Lambda. |

Client-side creative provider keys are intentionally entered through `/settings` and stored in browser `localStorage` for local workflows. Do not commit secrets to the repo.

## Local rendering behavior

`src/lib/render.ts` checks for AWS credentials before starting a Lambda render. Without `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, render jobs are simulated so the render queue can still be tested without cloud setup.

For production Lambda setup, see [`docs/LAMBDA_SETUP.md`](docs/LAMBDA_SETUP.md).

## Useful paths

- `src/app/api/command/route.ts` — command router for project creation, assets, analysis, styling, and exports.
- `src/app/api/render/route.ts` — render queue API.
- `src/lib/projectStore.ts` — in-memory project/export store used by API routes.
- `src/lib/render.ts` — Lambda/simulated render orchestration.
- `src/remotion/Root.tsx` — Remotion composition registration entry point.
- `src/remotion/CinematicComposition.tsx` — main cinematic video composition.

## Development notes

- Keep branches off `main` and open PRs for changes.
- Run `npm run build` before opening release-oriented PRs.
- Run `npm run lint` before UI/component PRs.
- Treat browser-stored API keys as local development conveniences, not production secret storage.
