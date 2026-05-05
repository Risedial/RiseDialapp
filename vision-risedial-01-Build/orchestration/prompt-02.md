# Step 02: M2 — Codebase Audit

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-02" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-02"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\design-tokens.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

This module is **strictly read-only**. No source files may be modified. No git commits are made. The only output is `AUDIT.md` at the project root.

**Pre-flight check (mandatory):**
Run `git status`. It must show no staged or unstaged changes in `lib/`, `app/`, or `middleware.ts` before beginning.

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\AUDIT.md`:**
Create the file with this exact header (substituting today's date 2026-05-04):
```
# RiseDial Codebase Audit — 2026-05-04
> **Status:** In progress
> **Module:** 2 of 8
> **Auditor:** Claude Code
```

**Sub-step 2 — Area 1: Import and Module Resolution:**
Read all `.ts` and `.tsx` files in `lib/`, `app/`, and `middleware.ts`. For each import, verify the resolved file exists and named imports match actual exports. Specifically verify these exports exist:
- `lib/openai/client.ts` exports `callRise`, `callCompression`
- `lib/memory/executor.ts` exports `executeCompressionAsync`
- `lib/supabase/server.ts` exports `supabaseServer` as a singleton value
- `lib/rise/rate-limit.ts` exports `checkRateLimit`, `recordMessage`
- `lib/auth/session.ts` exports `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- Check whether `lib/auth/subscription-gate.ts` exists
Any import resolving to a non-existent path = BLOCKING. Missing named export = BLOCKING.

**Sub-step 3 — Area 2: TypeScript Strict Type Correctness:**
Run `npx tsc --noEmit --strict` and record output. Grep for `subscription\.current_period_end` (bare, without `.items.data[0]`) — any match is BLOCKING. Verify `lib/auth/session.ts` `as ArrayBuffer` cast is present. Check that `invoice.customer` is never cast `as string`.

**Sub-step 4 — Area 3: Runtime Environment Compatibility:**
Read middleware.ts import graph recursively. Check for Node.js-only packages (bcryptjs, jsonwebtoken, fs, path, node:crypto, stream, buffer) in the middleware import chain. Grep `app/api/` for `export const runtime = 'edge'`. Verify `lib/memory/executor.ts` line 1 is `import 'server-only'`. Verify `lib/auth/session.ts` verifySession uses `crypto.subtle` not `require('crypto')`.

**Sub-step 5 — Area 4: Stripe Integration Correctness:**
Read `package.json` (Stripe SDK must be `^22.1.0` or higher). Read `lib/stripe/config.ts` (apiVersion must be `'2026-04-22.dahlia'`). Grep for bare `current_period_end` without `.items.data[0]`. Audit webhook duplication between `route.ts` (inline handlers) and `lib/stripe/webhooks.ts` (unused lib) — this is a BLOCKING finding. Check for `PREMIUM_PRODUCT_ID` declared but never used — BLOCKING dead code.

**Sub-step 6 — Area 5: Supabase Schema Validation:**
Extract all `.from('...')` table names. Valid names: `users`, `chats`, `messages`, `memory_profiles`, `rate_limit_tracking`, `webhook_events`. Any other name = BLOCKING. Verify column names in `.select()`, `.update()`, `.insert()` calls match the schema from `data-schema.md`. Document RLS WARNING (service role bypasses RLS — out of scope to fix).

**Sub-step 7 — Area 6: Authentication Flow:**
Trace sign-up and login API routes end-to-end. Read `lib/auth/session.ts` line 3 — if it contains `"changeme-insecure-fallback"` → BLOCKING security finding. Verify cookie settings match auth-values.md. Verify `verifySession` checks `exp` claim.

**Sub-step 8 — Area 7: Subscription Flow:**
Trace checkout creation flow. Verify `lib/auth/subscription-gate.ts` existence. Verify gate reads `x-subscription-status` header and returns 402/403 for non-active status.

**Sub-step 9 — Area 8: Memory Compression Pipeline:**
Read `app/api/chat/[chatId]/message/route.ts`. Verify `user_message_index` is included in every user-role message insert. Verify compression fires at 50 and every 10 after. Verify `executeCompressionAsync` is called with `void` (fire-and-forget). Verify upsert uses `onConflict: 'user_id'`.

**Sub-step 10 — Area 9: Rate Limiting:**
Read `lib/rise/rate-limit.ts`. Find `recordMessage`. If it uses read-increment-write → BLOCKING race condition. Verify `checkRateLimit` returns `{ allowed: boolean, remaining: number }`.

**Sub-step 11 — Area 10: Dead Code and Duplication:**
Grep for `PREMIUM_PRODUCT_ID` — expected: one declaration, zero uses → BLOCKING. Check `lib/stripe/webhooks.ts` exports for unused `routeWebhookEvent`. Grep for `jsonwebtoken` imports. Check `tsconfig.json` exclude array for `orchestration`.

**Sub-step 12 — Area 11: Environment Variable Audit:**
Grep all `process.env.` references. Compare to the 13 required env vars from `external-services.md`. Flag any `process.env.X!` non-null assertions as BLOCKING. Flag `"changeme-insecure-fallback"` as BLOCKING. Verify `.env.local` is in `.gitignore`. Verify `.env.example` is committed.

**Sub-step 13 — Area 12: PWA Correctness:**
Read `public/manifest.json`. Verify required fields (name, short_name, start_url, display, background_color, theme_color, icons) and icon sizes (192x192, 512x512). Verify each icon file exists. Read `next.config.ts/js` for next-pwa config. Verify `public/sw.js` is non-empty. Read `app/layout.tsx` for manifest link and theme-color meta tag.

**Sub-step 14 — Area 13: Test Strategy Documentation:**
Write the test plan verbatim from the refined-prompt.md M2 Area 13 section into AUDIT.md — unit tests (Vitest) listing, integration tests listing, and E2E tests (Playwright) listing.

**Sub-step 15 — Area 14: Fix Execution Plan:**
Write all confirmed BLOCKING fix entries in order:
- Fix 1: Remove insecure JWT_SECRET fallback (lib/auth/session.ts)
- Fix 2: Remove unused PREMIUM_PRODUCT_ID constant (app/api/webhooks/stripe/route.ts)
- Fix 3: Remove jsonwebtoken package (package.json, package-lock.json) — conditional on zero grep results
- Fix 4: Consolidate Stripe webhook handlers (lib/stripe/webhooks.ts, app/api/webhooks/stripe/route.ts)
- Fix 5: Replace rate limiter read-increment-write with atomic RPC (lib/rise/rate-limit.ts, supabase/migrations/002_atomic_rate_limit.sql)
Plus any additional BLOCKING findings discovered during audit.

**Sub-step 16 — Finalize AUDIT.md:**
Replace header status from "In progress" to "Complete". Add `> **BLOCKING findings:** [N]` to header. Verify all 14 sections contain real content or explicit "No finding." text. Run `git diff` to confirm only AUDIT.md appears as a new/modified file.

## Verification
- [ ] `AUDIT.md` exists at `C:\Users\Alexb\Documents\RiseDialapp\AUDIT.md`
- [ ] `AUDIT.md` contains exactly 14 sections (Area 1 through Area 14), each with real content or explicit `No finding.`
- [ ] Area 14 contains one ordered fix entry for every BLOCKING finding found across Areas 1–13
- [ ] Each fix entry in Area 14 specifies: what, which files, how, commit message, and classification
- [ ] `git diff` shows only `AUDIT.md` as a new/modified file — no source code files were modified
- [ ] `AUDIT.md` documents the JWT_SECRET insecure fallback as BLOCKING under Area 6
- [ ] `AUDIT.md` documents the PREMIUM_PRODUCT_ID dead code as BLOCKING under Area 4 and/or Area 10
- [ ] `AUDIT.md` documents the webhook duplication between `route.ts` and `lib/stripe/webhooks.ts` under Area 4
- [ ] `AUDIT.md` documents the rate limiter race condition as BLOCKING under Area 9
- [ ] `AUDIT.md` includes an RLS security architecture note under Area 5 (WARNING)

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-02" from pendingSteps to completedSteps
- Set steps["prompt-02"].status = "complete"
