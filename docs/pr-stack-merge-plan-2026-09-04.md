# VibeCut Geoffrey PR stack merge plan — 2026-09-04

VibeCut now has twenty open Geoffrey PRs. Every open branch is currently marked `MERGEABLE`, but the stack mixes foundational repo fixes, API contracts, editor/export UX, template activation, and production-planning tools. This plan gives Matt a safe landing order that maximizes user-visible progress while minimizing rebases.

## Current open PR inventory

| PR | Branch | Theme | Notes |
| --- | --- | --- | --- |
| #1 | `geoffrey/env-readiness-check` | Setup/docs | Adds env validation and VibeCut-specific setup docs; overlaps with #8 README work. |
| #2 | `geoffrey/render-queue-actions` | Render queue API | Adds manual queue actions and job metadata; partly superseded by #7. |
| #3 | `geoffrey/deterministic-remotion-lint` | Lint/render safety | Deterministic Remotion effects, stable editor component identity, safer localStorage hydration. |
| #4 | `geoffrey/api-key-storage-safety` | API-key storage | Centralizes client-side provider key storage; stacked on #3 cleanup. |
| #5 | `geoffrey/project-api-input-safety` | API safety | Validates project API JSON/body fields; low-file-count backend hardening. |
| #6 | `geoffrey/render-readiness-validation` | Render validation | Adds server-side render preflight validation in `src/lib/render.ts`. |
| #7 | `geoffrey/render-queue-api-contract` | Render queue API/UI | Broader version of #2 with UI error surfacing and 4:5 preset. |
| #8 | `geoffrey/readme-onboarding` | Onboarding docs | Replaces stock README and adds `.env.example`; overlaps with #1 docs. |
| #9 | `geoffrey/export-platform-tips` | Export UX | Makes platform presets actionable with selected-format guidance. |
| #10 | `geoffrey/render-cost-estimator` | Export UX | Adds render-time/output-size estimates in editor export panel. |
| #11 | `geoffrey/export-checklist-panel` | Export UX | Adds preflight checklist in editor export panel. |
| #12 | `geoffrey/template-launch-playbooks` | Template library | Expands homepage Templates tab and links chosen templates to editor. |
| #13 | `geoffrey/share-pack-generator` | AI tools/growth | Adds share-pack generator for captions, titles, hashtags, and publish checks. |
| #14 | `geoffrey/onboarding-sample-prompts` | Template prompts | Adds richer template metadata and prompt starters; overlaps heavily with #12. |
| #15 | `geoffrey/pr-stack-triage-20260731` | Docs | Older triage for PRs #1-#14; useful historical context but now incomplete. |
| #16 | `geoffrey/nightshift-import-safety-20260803` | Lint/render safety | Newer duplicate of #3-style cleanup; verified lint/build. |
| #17 | `geoffrey/creator-brief-builder-20260804` | AI tools/planning | Adds Brief Builder tab and tools landing updates. |
| #18 | `geoffrey/export-readiness-matrix-20260806` | Homepage/export education | Adds static export readiness matrix to homepage. |
| #19 | `geoffrey/nightshift-batch-briefs-20260827` | Templates/planning | Adds batch brief planner in Templates tab. |
| #20 | `geoffrey/nightshift-script-timer-20260831` | AI tools/script planning | Adds Script Timer tab to AI Tools workspace. |

## Recommended merge order

### 1) Land the foundation first

1. **#16 — clear lint blockers**: prefer this over #3 because it is newer, verified with both `npm run lint` and `npm run build`, and covers the same deterministic Remotion/localStorage/editor-stability cleanup.
2. **#5 — project API input safety**: small, isolated API hardening that should not conflict with product UX branches.
3. **#8 — onboarding README + `.env.example`**: gives reviewers/deployers current setup guidance before render-related changes land.
4. **#1 — env readiness check**, only after comparing its README edits against #8. Keep the script/check-env pieces, but expect to drop or reconcile duplicated README content.

### 2) Normalize render queue and render validation

5. **#7 — render queue API contract**: prefer this over #2 because it includes the manual queue actions plus UI error surfacing and preset coverage.
6. **#2 — render queue manual actions**, review after #7. It is likely redundant; close it if #7 fully covers the API changes.
7. **#6 — render readiness validation**: merge after #7 so validation errors align with the settled render job shape.

### 3) Ship export decision support as one reviewer pass

8. **#9 — export platform guidance**.
9. **#10 — render cost estimator**.
10. **#11 — export readiness checklist**.
11. **#18 — homepage export readiness matrix**.

These all improve export confidence but touch overlapping editor/homepage surfaces. Review them together, then rebase in the order above so the editor export panel evolves from preset selection (#9), to estimation (#10), to preflight (#11), with the homepage matrix (#18) as a parallel education layer.

### 4) Consolidate templates before adding planning tools

12. **#12 — template launch playbooks**: make this the canonical template-library branch.
13. **#14 — template prompt starters**, after #12. Cherry-pick unique prompt metadata/AI editor seed behavior; expect conflicts in homepage template data.
14. **#19 — batch brief planner**, after #12/#14 settle the Templates tab data shape.

### 5) Add AI-tools workflow helpers

15. **#17 — creator brief builder**.
16. **#20 — script timing tool**.
17. **#13 — share pack generator**.

These branches expand the AI Tools workspace. Land them after template data stabilizes so each tool can link into the same production flow: brief -> script timing -> share pack.

### 6) Retire docs-only duplicates

18. **#15 — older PR stack triage** should not merge before this plan. Either close it as superseded by this document or update it to point here after the actionable stack starts landing.

## Conflict and redundancy hotspots

- **README/setup docs**: #1 and #8 both replace the stock Next.js README. Keep one final VibeCut README, then preserve #1's env-check script/docs if still distinct.
- **Render queue contract**: #2 and #7 solve the same queue gap. Prefer #7 unless manual API behavior from #2 is missing.
- **Lint cleanup duplicates**: #3 and #16 overlap substantially. Prefer #16 as the newer cleanup; close #3 if no unique changes remain.
- **Homepage template data**: #12, #14, #18, and #19 all touch homepage/template presentation. Land #12 first, then rebase the others one at a time.
- **Editor export panel**: #9, #10, and #11 likely overlap in `src/components/ExportPresets.tsx` and/or editor page props. Review together, merge incrementally.
- **AI Tools tabs**: #13, #17, and #20 all update the tools workspace. After the first lands, rebase the others to avoid tab/nav copy drift.

## Quick decisions for Matt

- Use **#16, #7, #12, and this plan** as the canonical versions of cleanup, render queue, templates, and stack documentation.
- Close or supersede **#2, #3, and #15** if their unique changes are fully covered by newer PRs.
- Merge small backend/docs foundation first, then batch user-facing UX by surface area so Vercel previews stay easy to review.

## Verification for this plan

- GitHub open PR state checked on 2026-09-04 at night-shift start.
- All listed open PRs were reported by GitHub as `MERGEABLE` at the time of this plan.
- This document is docs-only; validate with `git diff --check` before merging.
