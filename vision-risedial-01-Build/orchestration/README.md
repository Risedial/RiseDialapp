# RiseDial Vision Build Orchestration

**Project:** vision-risedial-01
**Scale:** LARGE (17 steps)
**State file:** `orchestration/state.json`

## Build Steps

| Index | Prompt File | Title | Status |
|-------|-------------|-------|--------|
| 01 | prompt-01.md | M1 — Build Error Resolution | pending |
| 02 | prompt-02.md | M2 — Codebase Audit | pending |
| 03 | prompt-03.md | M3-A — Fix A: Remove insecure JWT_SECRET fallback | pending |
| 04 | prompt-04.md | M3-B — Fix B: Consolidate Stripe webhook handlers into lib | pending |
| 05 | prompt-05.md | M3-C — Fix C: Make webhook route a thin dispatcher | pending |
| 06 | prompt-06.md | M3-D — Fix D: Replace rate limiter read-modify-write with atomic RPC | pending |
| 07 | prompt-07.md | M3-E — Fix E: Add atomic rate-limit SQL migration | pending |
| 08 | prompt-08.md | M3-F — Fix F: Exclude orchestration/ from tsconfig | pending |
| 09 | prompt-09.md | M3-G — Fix G: Remove jsonwebtoken from package.json | pending |
| 10 | prompt-10.md | M4 — Environment Variable Validation (lib/env.ts + replacements) | pending |
| 11 | prompt-11.md | M5-A — Test Infrastructure: Install packages and update package.json | pending |
| 12 | prompt-12.md | M5-B — Test Infrastructure: Config files (vitest, playwright, e2e setup/teardown) | pending |
| 13 | prompt-13.md | M6-A — Unit Tests: session, rate-limit, memory trigger | pending |
| 14 | prompt-14.md | M6-B — Unit Tests: memory executor, stripe webhooks lib, supabase client | pending |
| 15 | prompt-15.md | M6-C — Unit Tests: env schema, chat message route, stripe webhook route | pending |
| 16 | prompt-16.md | M7 — E2E Test Suite (signup, auth, chat, billing specs + globalSetup/Teardown) | pending |
| 17 | prompt-17.md | M8 — CI Pipeline (.github/workflows/ci.yml) | pending |

## Execution Notes

- Steps must be executed in order (no parallel execution — each module depends on prior)
- After each step completes, the executor updates `state.json` (moves step from pendingSteps to completedSteps, sets status to "complete")
- Each step prompt specifies its context files — read those before executing
- Run `npx tsc --noEmit` after every file edit in M1, M3, M4, M5 before committing
- M3 fixes (steps 03–09) must each be committed independently before proceeding to the next
