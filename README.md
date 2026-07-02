# VibeCut Web

VibeCut is a Next.js video-editing workspace with AI-assisted prompts, transcription, b-roll generation, voice tools, and Remotion render exports.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run check:env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment readiness

Run the environment checker before deploying or debugging render failures:

```bash
npm run check:env
# or validate a specific file
npm run check:env -- --file=.env.production
```

The app can run locally without server credentials. If AWS/Remotion Lambda settings are missing, render jobs fall back to the demo simulation path.

### Optional server-side render variables

Set these when enabling real Remotion Lambda renders:

| Variable | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS access key for Remotion Lambda/S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Remotion Lambda/S3 |
| `AWS_REGION` | AWS region, defaults to `us-east-1` |
| `REMOTION_LAMBDA_FUNCTION` | Lambda function name, defaults to `vibecut-render` |
| `REMOTION_S3_BUCKET` | S3 bucket for render outputs, defaults to `vibecut-renders` |
| `REMOTION_SERVE_URL` | Bundled Remotion site URL used by Lambda renders |

### Browser-local provider keys

AI provider keys are configured in the app at `/settings` and stored in browser `localStorage`:

- OpenAI
- Anthropic
- ElevenLabs
- Replicate
- Deepgram
- WaveSpeed AI

Do not commit provider keys to the repository. The readiness check warns if provider-key-looking env vars are set because the current app reads them from `/settings` instead.

## Scripts

```bash
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run check:env        # Validate deployment/render environment
npm run remotion:preview # Preview Remotion compositions
npm run remotion:build   # Bundle Remotion compositions
npm run remotion:render  # Render the default composition locally
```

## Deploy on Vercel

Deploy the Next.js app with Vercel or another Node-compatible host. Configure the optional Remotion Lambda variables above only when using production Lambda renders.
