# VibeCut Geoffrey PR stack triage — 2026-07-31

VibeCut currently has 14 open Geoffrey pull requests. GitHub reports each PR as mergeable, but several touch the same files and will drift if they land out of order. This note groups the stack into review tracks, calls out overlap risks, and gives Matt a concrete landing order.

## Snapshot

| PR | Track | Files | Merge risk | Recommendation |
| --- | --- | ---: | --- | --- |
| [#1 chore: add environment readiness check](https://github.com/RuckVibeCodes/vibecut-web/pull/1) | Setup / deploy safety | 3 | Low | Land first; gives reviewers a fast environment sanity check. |
| [#8 docs: improve VibeCut onboarding](https://github.com/RuckVibeCodes/vibecut-web/pull/8) | Setup / onboarding docs | 3 | Medium | Land after #1 and reconcile README / `.env.example` changes together. |
| [#2 feat: wire render queue manual actions](https://github.com/RuckVibeCodes/vibecut-web/pull/2) | Render queue | 2 | Medium | Review before render-validation PRs because it establishes queue actions. |
| [#6 feat: validate projects before render](https://github.com/RuckVibeCodes/vibecut-web/pull/6) | Render queue | 1 | Medium | Land after #2; shares `src/lib/render.ts`. |
| [#7 fix: align render queue API contract](https://github.com/RuckVibeCodes/vibecut-web/pull/7) | Render queue | 3 | High | Land after #2 and #6 or rebase once either merges; it touches the same render route/helper surface. |
| [#5 fix: validate project API payloads](https://github.com/RuckVibeCodes/vibecut-web/pull/5) | API safety | 1 | Low | Can land independently; isolated to `src/app/api/project/route.ts`. |
| [#3 fix: make Remotion effects lint-safe](https://github.com/RuckVibeCodes/vibecut-web/pull/3) | Editor / Remotion safety | 5 | Medium | Review before #4 because both touch settings/client UI assumptions. |
| [#4 feat: harden client API key storage](https://github.com/RuckVibeCodes/vibecut-web/pull/4) | Editor / credentials safety | 7 | High | Land after #3 or rebase; overlaps `src/app/settings/page.tsx`, `src/app/editor/page.tsx`, and AI/editor components. |
| [#9 feat: add export platform guidance](https://github.com/RuckVibeCodes/vibecut-web/pull/9) | Export UX | 1 | Low | Land first in export track; only changes `ExportPresets`. |
| [#10 feat: add export readiness estimates](https://github.com/RuckVibeCodes/vibecut-web/pull/10) | Export UX | 2 | Medium | Land after #9; overlaps `ExportPresets` and editor page. |
| [#11 feat: add export readiness checklist](https://github.com/RuckVibeCodes/vibecut-web/pull/11) | Export UX | 2 | Medium | Land after #10 or rebase; shares `src/app/editor/page.tsx`. |
| [#13 feat: add share pack generator](https://github.com/RuckVibeCodes/vibecut-web/pull/13) | Growth tools | 2 | Low | Can land independently; isolated tools route/component. |
| [#12 feat: add template launch playbooks](https://github.com/RuckVibeCodes/vibecut-web/pull/12) | Landing / template activation | 4 | Medium | Review before #14 because both touch `src/app/page.tsx`; also updates README/docs. |
| [#14 feat: turn templates into prompt starters](https://github.com/RuckVibeCodes/vibecut-web/pull/14) | Landing / template activation | 2 | High | Land after #12 or rebase; overlaps landing page and `AIPromptEditor`. |

## Recommended landing order

1. **Setup safety:** #1, then #8.
2. **Render queue reliability:** #2 → #6 → #7.
3. **Isolated API safety:** #5 can land whenever CI is green.
4. **Editor/runtime safety:** #3 → #4.
5. **Export UX:** #9 → #10 → #11.
6. **Growth tools and landing activation:** #13 can land independently; #12 should precede #14.

## Conflict hotspots

- `src/lib/render.ts`: #2, #6, #7. Treat #7 as the final integration PR for render queue contracts.
- `src/app/editor/page.tsx`: #4, #10, #11. Export-readiness UI should be rebased after API-key storage hardening if #4 lands first.
- `src/components/ExportPresets.tsx`: #9, #10. Platform guidance should precede estimate copy to avoid repeated manual conflict resolution.
- `README.md`: #1, #8, #12. Prefer landing setup docs (#1/#8) before launch-playbook docs (#12).
- `src/app/page.tsx`: #12, #14. Prompt starters should layer on top of launch playbooks, not compete with them.
- `src/components/AIPromptEditor.tsx`: #4, #14. If #4 lands first, #14 should be rebased to keep secure key handling intact.

## Review shortcuts

- **Fast wins:** #1, #5, #9, #13 are isolated or low-overlap and should be easiest to merge.
- **Most important reliability chain:** #2, #6, #7. This is the highest leverage operational stack because it protects render queue actions and validation.
- **Most likely manual rebase work:** #4, #7, #14 because they overlap multiple prior branches.
- **Good stopping point:** If Matt only wants one batch, land #1, #5, #9, and #13 first, then return to the render queue chain.

## Suggested reviewer checklist

- Confirm each PR was refreshed against current `main` immediately before merge.
- Run `npm run lint` after every track, not only after the final merge, because several PRs touch client components.
- After render queue track merges, manually test queue pause/resume/retry/cancel flows and invalid project payload handling.
- After export UX track merges, open the editor and confirm the platform tips, readiness estimates, and checklist do not compete for the same screen space.
- After template activation PRs merge, verify sample prompts still open the editor with the intended prompt payload.
