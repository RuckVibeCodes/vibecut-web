# VibeCut Web

VibeCut is a web editor for turning source footage into social-ready, captioned clips with AI-assisted styling, camera moves, B-roll, text callouts, music, and export queues.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key areas

- `src/app/editor` — interactive editing surface.
- `src/app/api/command` — chat/automation command endpoint for Geoffrey-style workflows.
- `src/remotion` — Remotion compositions and visual overlays.
- `docs/COMMAND_API.md` — command API reference and curl examples.
- `docs/LAMBDA_SETUP.md` — serverless rendering setup notes.

## Useful scripts

```bash
npm run dev              # local Next.js dev server
npm run build            # production build
npm run lint             # ESLint
npm run remotion:preview # open Remotion preview
npm run remotion:render  # render the default cinematic composition
```

## Command API quick start

```bash
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"create","params":{"name":"Launch teaser"}}'
```

See [`docs/COMMAND_API.md`](docs/COMMAND_API.md) for the full workflow and validation behavior.
