# VibeCut Command API

The command API lets Geoffrey or another automation client assemble and enhance a VibeCut project over chat-style JSON commands.

## Endpoints

- `GET /api/command` — returns supported commands plus caption and color presets.
- `POST /api/command` — runs one command. Body shape:

```json
{
  "command": "create",
  "projectId": "proj-...",
  "params": {}
}
```

`projectId` is only required after a project has been created.

## Example workflow

```bash
# 1. Create a project
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"create","params":{"name":"Launch teaser"}}'

# 2. Set source media
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"set-source","projectId":"proj-...","params":{"url":"https://example.com/video.mp4","duration":42}}'

# 3. Apply a punchy caption preset
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"set-caption-style","projectId":"proj-...","params":{"preset":"tiktok-bounce"}}'

# 4. Add an impact callout
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"add-text","projectId":"proj-...","params":{"text":"Stop scrolling","type":"impact","startTime":2,"endTime":4}}'

# 5. Queue social exports
curl -s http://localhost:3000/api/command \
  -H 'Content-Type: application/json' \
  -d '{"command":"queue-export","projectId":"proj-...","params":{"aspectRatios":["16:9","9:16","1:1"]}}'
```

## Validation notes

The API now rejects malformed commands early with `400` responses instead of storing broken project state. It validates required IDs, source duration, transcript word data, media timing, sound/music volume, suggestion IDs, and export aspect ratios.

Supported export aspect ratios: `16:9`, `9:16`, `1:1`, `4:5`.
