# Module Fragment 02: Codebase Audit

## Role

Claude Code executes this module as a read-only auditor, systematically examining every concern area in the RiseDial codebase and producing `AUDIT.md` — the structured findings document that drives all code changes in Module 3.

---

## Context

### Locked Technology Stack

```
framework: Next.js 14 App Router
language: TypeScript (strict mode)
database: Supabase (service role client, PostgreSQL)
auth: Custom JWT via Web Crypto API (crypto.subtle)
billing: Stripe SDK v22 (apiVersion: '2026-04-22.dahlia')
ai: OpenAI gpt-4o-mini (chat), gpt-4o (memory compression)
pwa: next-pwa (Workbox-based service worker)
runtime_target: Node.js (no Edge Runtime routes)
```

### Locked Constraints

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything.
3. Do not leave a partially-changed file — revert any speculative edits before moving on.
4. Do not fix it. The `orchestration/` directory will be excluded from TypeScript compilation in Module 3.
5. Do not batch multiple fixes into a single commit.
6. Do not add `tsconfig.tsbuildinfo` to `.gitignore` yet.
7. Do not skip ahead and add the env import in this fix — that creates a dependency on Module 4 which is not yet built.
8. Do not move: `verifyWebhookSignature` (it is already in the lib file).
9. Do not add `export const runtime = 'edge'` to Node.js-only routes.
10. No new product features may be added during this pipeline.
11. The Supabase schema (`001_initial_schema.sql`) is accepted as ground truth; no schema changes except the `increment_message_count` RPC function.
12. All fixes must preserve existing API contract shapes.
13. `jsonwebtoken` may be removed only after confirming zero remaining imports.
14. No UI changes.
15. No new features.
16. No real network calls [in unit tests]. No real database.
17. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
18. `lib/supabase/client.ts` (the browser Supabase client) does NOT import `lib/env.ts` — it is a browser-side module and must not import server-only code.
19. `lib/supabase/client.ts` must not import `lib/env.ts`.
20. New product features or UI changes are explicitly NOT included in this build.
21. Database migrations (schema is accepted as-is from `001_initial_schema.sql`) are explicitly NOT included.
22. Supabase RLS policy redesign is explicitly NOT included.
23. Stripe product/price ID configuration (IDs stored as env vars, not changed) is explicitly NOT included.
24. OpenAI prompt engineering changes are explicitly NOT included.
25. `npx tsc --noEmit` must exit 0 after every commit in this module.
26. No API response shapes are changed (requests and responses for all routes remain identical).
27. **This module is strictly read-only. No source files may be modified. No git commits are made.**
28. Do not speculate. Escalate to Module 2 (Codebase Audit). Document the error in the Module 2 audit under Area 1.
29. Do not use `as string` for `Stripe.Invoice.customer` — this is a real union.
30. Every fix is committed independently before the next fix begins.
31. After every fix, run `npx tsc --noEmit` before committing to ensure the fix did not introduce a type regression.
32. Only execute Fix F if grep for 'jsonwebtoken' in `lib/` `app/` `middleware.ts` returns zero results.
33. No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` and `lib/supabase/client.ts`).
34. `.env.local` must be in `.gitignore`.
35. `.env.example` is committed to the repository.
36. Tests that import files which depend on `lib/env.ts` must either set test env vars in `vitest.config.ts` or mock `lib/env.ts`.
37. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
38. E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing.
39. The Supabase schema (`001_initial_schema.sql`) is accepted as the ground truth; no schema changes except the `increment_message_count` RPC function for atomic rate limiting.
40. `jsonwebtoken` may be removed from `package.json` only after confirming it has zero remaining imports in the codebase.
41. No test makes a real database call, real Stripe API call, or real OpenAI API call. [Unit/Integration tests]
42. Do not add `export const runtime = 'edge'` to Node.js-only routes.
43. Never use `as string` for `Stripe.Invoice.customer`.
44. Must use `--noEmit` not build for type checking; `next build` will obscure type errors behind bundler output.
45. Do not read files in `orchestration/` — they will be excluded from tsconfig compilation in Module 3.
46. Silent failure that results in an empty assistant message is not acceptable.

---

## What Must Be True After This Module

`AUDIT.md` exists at the project root with all 14 areas populated, every BLOCKING finding documented, and an ordered fix list in Area 14.

---

## Files to Change

### C:\Users\Alexb\Documents\RiseDialapp\AUDIT.md

**Purpose:** Create this file from scratch. It is the only file produced by this module. No source files are modified.

**Pre-flight check:** Run `git status` first. It must show no staged or unstaged changes in `lib/`, `app/`, or `middleware.ts` before beginning — this is a read-only module.

---

### Step 1 — Create the AUDIT.md shell

Create `AUDIT.md` at the project root with this exact header, substituting today's date:

```markdown
# RiseDial Codebase Audit — 2026-05-04

> **Status:** In progress
> **Module:** 2 of 8
> **Auditor:** Claude Code

---
```

Then append placeholder sections for all 14 areas (replace each `[findings]` placeholder with real content as each area is completed — do not leave any placeholder in the final file).

---

### Step 2 — Area 1: Import and Module Resolution

**What to check:**

1. List all `.ts` and `.tsx` files in `lib/`, `app/`, and `middleware.ts`.
2. For each `import` statement, resolve the path (treat `@/` as the project root).
3. Verify the resolved file exists on the filesystem.
4. For named imports (`{ foo }`), verify `foo` is exported by the target module.
5. Specifically verify these critical exports exist with the exact names listed:

| File | Must export |
|------|------------|
| `lib/openai/client.ts` | `callRise`, `callCompression` |
| `lib/memory/executor.ts` | `executeCompressionAsync` |
| `lib/supabase/server.ts` | `supabaseServer` as a singleton value (not a factory function) |
| `lib/rise/rate-limit.ts` | `checkRateLimit`, `recordMessage` |
| `lib/auth/session.ts` | `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie` |
| `lib/auth/subscription-gate.ts` | existence check; note the gate function's exported name |

**Classification rules:**
- Import resolves to non-existent path → BLOCKING
- Named import does not match any export in the target file → BLOCKING
- `lib/auth/subscription-gate.ts` does not exist → BLOCKING (list every route that is unprotected)

**Finding format:**
```markdown
## Area 1 — Import and Module Resolution

### Findings

- **BLOCKING:** [description]. File: `[path]`, line [N]. Impact: [what breaks].
- **WARNING:** [description]. File: `[path]`. Impact: [what is suboptimal].
```

If nothing found: write `No finding.`

---

### Step 3 — Area 2: TypeScript Strict Type Correctness

**What to check:**

1. Run `npx tsc --noEmit --strict` and record any output. (Strict is already enabled; this is a confirmation that Module 1's clean state holds.)
2. Grep for `subscription.current_period_end` (without `.items.data[0]`):
   ```
   grep -rn "subscription\.current_period_end" lib/ app/ --include="*.ts"
   ```
   Any match = BLOCKING. Every occurrence must be in the form `subscription.items.data[0].current_period_end`.
3. Read `lib/auth/session.ts` around line 62. Verify the `Uint8Array.buffer as ArrayBuffer` cast. `SubtleCrypto.sign()` returns `ArrayBuffer`; the cast is valid — document as No finding if correct.
4. Read all `supabaseServer.from(...)` call chains. Verify the return type is narrowed to the correct shape before use.
5. **Never use `as string` for `Stripe.Invoice.customer`** — its type is `string | Stripe.Customer | Stripe.DeletedCustomer | null`. Flag any such cast as BLOCKING.

---

### Step 4 — Area 3: Runtime Environment Compatibility

**What to check:**

1. Read `middleware.ts`. List its direct imports.
2. For each imported file, follow the import graph recursively until complete.
3. For each file in the graph, check for imports of: `bcryptjs`, `jsonwebtoken`, `fs`, `path`, `node:crypto`, `stream`, `buffer`, or any package that requires the Node.js runtime (not Edge-safe).
4. Grep all `app/api/` route files for `export const runtime = 'edge'`. Flag any route that declares Edge Runtime but imports Node.js-only packages as BLOCKING.
5. Verify `lib/memory/executor.ts` line 1 is `import 'server-only'`. If absent, BLOCKING.
6. Verify `lib/auth/session.ts` `verifySession` uses only `crypto.subtle` (Web Crypto API) — not `require('crypto')` (Node.js built-in).

---

### Step 5 — Area 4: Stripe Integration Correctness

**What to check:**

1. Read `package.json`. Stripe SDK version must be `^22.1.0` or higher.
2. Read `lib/stripe/config.ts`. `apiVersion` must be `'2026-04-22.dahlia'`.
3. Grep for `current_period_end`:
   ```
   grep -rn "current_period_end" lib/ app/ --include="*.ts"
   ```
   Every match must read `items.data[0].current_period_end`. Any bare `subscription.current_period_end` is BLOCKING.
4. **Webhook duplication audit:**
   - Read `app/api/webhooks/stripe/route.ts`. Count how many Stripe event handlers are defined inline.
   - Read `lib/stripe/webhooks.ts`. Count how many event handlers are defined there.
   - Check whether `route.ts` imports `routeWebhookEvent` from `lib/stripe/webhooks.ts`. It should not — the lib's export is currently dead code.
   - Confirm idempotency pattern: the route must insert into `webhook_events` BEFORE processing the event (crash-safe pre-insert). Document that this pattern must be preserved after consolidation.
   - **Flag the duplication as BLOCKING** — event handlers exist in both files without the route file using the lib.
5. Read `app/api/webhooks/stripe/route.ts`. Check for `const PREMIUM_PRODUCT_ID`. If it is declared but never referenced in the same file — flag as BLOCKING dead code.

**Known BLOCKING finding to document:**
- `PREMIUM_PRODUCT_ID` is declared in `app/api/webhooks/stripe/route.ts` but never used → BLOCKING dead code
- Webhook handler logic is duplicated between `route.ts` (inline) and `lib/stripe/webhooks.ts` (unused lib) → BLOCKING

---

### Step 6 — Area 5: Supabase Schema Validation

**What to check:**

1. Extract all table names from `supabaseServer.from('...')` calls:
   ```
   grep -rn "\.from\('" lib/ app/ --include="*.ts"
   ```
   Valid table names per `001_initial_schema.sql`: `users`, `chats`, `messages`, `memory_profiles`, `rate_limit_tracking`, `webhook_events`. Any other name is BLOCKING.
2. For each `.select('field')`, `.update({ field: value })`, `.insert({ field: value })` — verify the field name exists as a column in the target table per the migration file.
3. **RLS architecture WARNING (do not fix):** The migration enables RLS on all tables with `auth.uid()` policies. The app uses a custom JWT and the service role client, which bypasses RLS entirely. The RLS policies protect nothing in this architecture. Document as WARNING — security architecture note; out of scope to fix in this pipeline.
4. Verify `memory_profiles` has a `UNIQUE` constraint on `user_id` in the migration — required for `.upsert()` conflict resolution with `onConflict: 'user_id'`.

**Known WARNING to document:**
- RLS policies are enabled but bypassed by the service role client; they provide no protection in this architecture → WARNING (out of scope)

---

### Step 7 — Area 6: Authentication Flow

**What to check:**

1. Trace the sign-up API route end-to-end:
   - Locate the sign-up route file.
   - Verify: password → `bcrypt.hash()` → stored in `password_hash`.
   - Verify: user row inserted into `users`.
   - Verify: `createSession(userId, subscriptionStatus)` called → `setSessionCookie()` called.
2. Trace the login API route:
   - Verify: email → `users` table query → `bcrypt.compare()` → if match → `createSession()` → `setSessionCookie()`.
3. Read `middleware.ts` matcher. Expected paths: `['/api/chat/:path*', '/api/memory/:path*', '/api/subscription/:path*', '/api/chats/:path*', '/api/user/:path*']`. Verify no authenticated route falls outside these paths.
4. **Read `lib/auth/session.ts` line 3. If it reads `process.env.JWT_SECRET ?? "changeme-insecure-fallback"` — this is a BLOCKING security finding.** Anyone who knows the fallback string can forge JWT tokens.
5. Verify `setSessionCookie` uses: `httpOnly: true`, `sameSite: 'strict'`, `secure: true`, `maxAge: 30 * 24 * 60 * 60` (30 days), `path: '/'`.
6. Verify `verifySession` checks the `exp` claim and returns `null` for expired tokens.
7. List all API routes that read `x-user-id` and `x-subscription-status` headers. Verify none have a fallback path for when these headers are absent (middleware guarantees they are always present for authenticated requests).

**Known BLOCKING finding to document:**
- `lib/auth/session.ts` line 3: `process.env.JWT_SECRET ?? "changeme-insecure-fallback"` → BLOCKING security vulnerability. JWT tokens can be forged by anyone who knows the fallback string.

---

### Step 8 — Area 7: Subscription Flow

**What to check:**

1. Trace the checkout creation flow: locate the checkout API route; verify it creates a Stripe checkout session with `metadata.user_id` set; verify it returns a redirect URL.
2. Trace the webhook activation flow: webhook route → signature verification → idempotency check → retrieve subscription with `expand: ['items.data.price']` → update `users` table with `subscription_status: 'active'`, `plan_type`, `next_billing_date`, `has_premium_memory`.
3. Verify `lib/auth/subscription-gate.ts` exists. If it does not exist — BLOCKING. List every API route that serves premium content (those routes are unprotected without a gate).
4. Verify the subscription gate reads `x-subscription-status` from `request.headers` and returns 402 or 403 for non-`'active'` status.

---

### Step 9 — Area 8: Memory Compression Pipeline

**What to check:**

1. Read `app/api/chat/[chatId]/message/route.ts`. Find every `supabaseServer.from('messages').insert(...)`. Verify `user_message_index` is included in every user-role message insert. Any insert missing `user_message_index` is BLOCKING (compression will never trigger for those messages).
2. Read `lib/memory/trigger.ts` (or equivalent). Confirm compression fires at exactly 50 user messages (initial threshold) and every 10 messages after that (60, 70, 80…).
3. Verify `executeCompressionAsync` is called with `void` (fire-and-forget), not `await`. If `await` is used, the HTTP response is blocked.
4. Read `lib/memory/compress.ts` and `lib/memory/patch.ts`. Verify both:
   - Call OpenAI with `response_format: { type: 'json_object' }`
   - Parse with `JSON.parse()` inside a `try/catch`
   - Validate the parsed shape before upserting
5. Verify the upsert in both files uses `onConflict: 'user_id'` (matching the UNIQUE constraint on `memory_profiles.user_id`).

---

### Step 10 — Area 9: Rate Limiting

**What to check:**

1. Read `lib/rise/rate-limit.ts`. Find the `recordMessage` function. Determine whether it:
   - Reads the current `message_count`, increments in application code, then writes back (read-increment-write pattern) → **BLOCKING race condition**. Multiple concurrent requests can read the same count, both increment it, and write `count + 1` instead of `count + 2`. Flag for Module 3 fix (atomic Supabase RPC via `increment_message_count`).
   - Calls an atomic DB operation → No finding.
2. Read `checkRateLimit`. Verify the rolling window query uses `gte` (`>=`), not `gt` (`>`): `window_start >= now() - interval '60 minutes'`.
3. Verify `checkRateLimit` returns `{ allowed: boolean, remaining: number }`. Verify the message route destructures these fields correctly.

**Known BLOCKING finding to document:**
- `lib/rise/rate-limit.ts` `recordMessage`: read-increment-write pattern is a race condition. Concurrent requests can cause `message_count` to be understated, allowing users to exceed their rate limit. Must be replaced with an atomic `increment_message_count` RPC call → BLOCKING.

---

### Step 11 — Area 10: Dead Code and Duplication

**What to check:**

1. Grep for `PREMIUM_PRODUCT_ID` across all files:
   ```
   grep -rn "PREMIUM_PRODUCT_ID" lib/ app/ --include="*.ts"
   ```
   Expected: exactly one declaration in `app/api/webhooks/stripe/route.ts` and zero uses. If declared and never used → BLOCKING dead code. (Cross-reference with Area 4.)
2. Check `lib/stripe/webhooks.ts` exports. If `routeWebhookEvent` is exported but never imported anywhere → WARNING dead code. (It will become the primary export after Module 3 consolidation; the export is structurally correct but currently unused.)
3. Grep for `jsonwebtoken` imports:
   ```
   grep -rn "from 'jsonwebtoken'" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
   grep -rn "require('jsonwebtoken')" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
   ```
   If zero results: add `jsonwebtoken` and `@types/jsonwebtoken` to the Module 3 removal list. If any results: list the files.
4. Check `tsconfig.json` `exclude` array for `orchestration`. If `orchestration/` contains `.ts` files and is not in the `exclude` array → flag for Module 3 fix. Do not read files inside `orchestration/`.
5. Identify any other runtime-dead files (files that are never imported and are not entry points).

**Known BLOCKING finding to document:**
- `PREMIUM_PRODUCT_ID` declared in `app/api/webhooks/stripe/route.ts` but never referenced → BLOCKING dead code. (Cross-reference Area 4.)

---

### Step 12 — Area 11: Environment Variable Audit

**What to check:**

1. Grep for all `process.env.` references across source files:
   ```
   grep -rn "process\.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
   ```
2. Compare to the expected complete list:
   - `process.env.SUPABASE_URL`
   - `process.env.SUPABASE_SERVICE_ROLE_KEY`
   - `process.env.JWT_SECRET`
   - `process.env.STRIPE_SECRET_KEY`
   - `process.env.STRIPE_WEBHOOK_SECRET`
   - `process.env.STRIPE_PRICE_MONTHLY`
   - `process.env.STRIPE_PRICE_ANNUAL`
   - `process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON`
   - `process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON`
   - `process.env.OPENAI_API_KEY`
   - `process.env.NEXT_PUBLIC_SUPABASE_URL`
   - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `process.env.NEXT_PUBLIC_APP_URL`
   
   Flag any var found in the grep that is not on this list.
3. Flag any `process.env.X!` (non-null assertion without prior validation) as BLOCKING — these throw unhelpful runtime errors.
4. Flag `process.env.JWT_SECRET ?? "changeme-insecure-fallback"` specifically as BLOCKING (cross-reference Area 6).
5. Verify `.env.local` is listed in `.gitignore`.
6. Verify `.env.example` is committed to the repository.

---

### Step 13 — Area 12: PWA Correctness

**What to check:**

1. Read `public/manifest.json`. Verify it contains: `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, `icons`. Verify `icons` has at least one entry with `sizes: "192x192"` and one with `sizes: "512x512"`.
2. For each icon path in `manifest.json`, verify the PNG file exists in `public/`.
3. Read `next.config.ts` (or `next.config.js`). If using `next-pwa`, verify: `dest: 'public'`, `register: true`, `skipWaiting: true`.
4. Verify `public/sw.js` is not a zero-byte file (the file is present per git status; confirm it has valid Workbox content and is not empty).
5. Read `app/layout.tsx`. Verify it includes `<link rel="manifest" href="/manifest.json" />` and a `<meta name="theme-color" ... />` tag.

---

### Step 14 — Area 13: Test Strategy Documentation

This section is documentation of what Module 6 will build — no code analysis required. Write the following test plan verbatim into `AUDIT.md`:

**Unit tests (Vitest):**
- `lib/auth/session.ts` — `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- `lib/rise/rate-limit.ts` — `checkRateLimit`, `recordMessage`
- `lib/memory/trigger.ts` — `checkCompressionTrigger`
- `lib/memory/executor.ts` — `executeCompressionAsync`
- `lib/stripe/webhooks.ts` — `verifyWebhookSignature`, `routeWebhookEvent`
- `lib/supabase/client.ts` — browser Supabase client construction
- `lib/env.ts` — schema validation

**Integration tests (Vitest with `vi.mock()`):**
- `app/api/chat/[chatId]/message/route.ts`
- `app/api/webhooks/stripe/route.ts`
- All other `app/api/` routes

**E2E tests (Playwright against localhost:3000):**
- Flow 1: Sign-up + onboarding (local only; skipped in CI via `SKIP_STRIPE_E2E=true`)
- Flow 2: Login + session persistence
- Flow 3: Chat + AI response
- Flow 4: Stripe billing portal

---

### Step 15 — Area 14: Fix Execution Plan

This is the most important section. Module 3 reads it to know what to fix and in what order.

**Ordering rule:** A fix that modifies a file that another fix also modifies must come first. The webhook consolidation (moves code from route → lib) must come before any other changes to `lib/stripe/webhooks.ts` or `app/api/webhooks/stripe/route.ts`.

**Default ordering (adjust only if a dependency discovered during audit requires it):**
1. Security fix: JWT_SECRET insecure fallback (touches `lib/auth/session.ts`)
2. Dead code removal: PREMIUM_PRODUCT_ID (touches `app/api/webhooks/stripe/route.ts`)
3. Dead code removal: `jsonwebtoken` package (touches `package.json`) — only if grep confirms zero imports
4. Webhook consolidation: move inline handlers from `route.ts` into `lib/stripe/webhooks.ts` (touches both files)
5. Rate limiter atomicity: create `increment_message_count` RPC migration and update `lib/rise/rate-limit.ts`
6. Any additional BLOCKING findings in dependency order
7. WARNING items (labeled optional-for-release)

**Required format for every fix entry:**

```markdown
**Fix N — [short descriptive name]**
- What: [one sentence describing the change]
- Files: `[file-path-1]`, `[file-path-2]`
- How: [step-by-step instructions precise enough for an agent to execute without ambiguity]
- Commit message: `[conventional-commit format, e.g. fix(auth): remove insecure JWT_SECRET fallback]`
- Classification: BLOCKING | WARNING
```

**Confirmed BLOCKING fix entries that must appear in Area 14:**

```markdown
**Fix 1 — Remove insecure JWT_SECRET fallback**
- What: Remove the hardcoded `"changeme-insecure-fallback"` fallback from the JWT secret lookup so that missing JWT_SECRET fails loudly at startup instead of silently accepting forgeable tokens.
- Files: `lib/auth/session.ts`
- How: On the line reading `process.env.JWT_SECRET ?? "changeme-insecure-fallback"`, delete ` ?? "changeme-insecure-fallback"`. Leave `process.env.JWT_SECRET` bare. Do not add a zod import — that dependency belongs to Module 4.
- Commit message: `fix(auth): remove insecure JWT_SECRET fallback`
- Classification: BLOCKING

**Fix 2 — Remove unused PREMIUM_PRODUCT_ID constant**
- What: Delete the dead `PREMIUM_PRODUCT_ID` constant that is declared but never referenced anywhere in the codebase.
- Files: `app/api/webhooks/stripe/route.ts`
- How: Delete the line `const PREMIUM_PRODUCT_ID = '...'` (or equivalent declaration). Do not touch any surrounding code.
- Commit message: `fix(stripe): remove unused PREMIUM_PRODUCT_ID dead code`
- Classification: BLOCKING

**Fix 3 — Remove jsonwebtoken package** (conditional — only if grep for 'jsonwebtoken' returns zero results in lib/, app/, middleware.ts)
- What: Remove `jsonwebtoken` and `@types/jsonwebtoken` from package.json dependencies.
- Files: `package.json`, `package-lock.json`
- How: Run `npm uninstall jsonwebtoken @types/jsonwebtoken`. Verify `npx tsc --noEmit` still exits 0 after removal.
- Commit message: `chore(deps): remove unused jsonwebtoken package`
- Classification: BLOCKING

**Fix 4 — Consolidate Stripe webhook handlers**
- What: Move all inline event handlers and idempotency logic from `app/api/webhooks/stripe/route.ts` into `lib/stripe/webhooks.ts`, then update `route.ts` to delegate to `routeWebhookEvent`. Preserve the crash-safe pre-insert idempotency pattern (insert into `webhook_events` BEFORE processing the event).
- Files: `lib/stripe/webhooks.ts`, `app/api/webhooks/stripe/route.ts`
- How: [To be detailed by Module 3 — see Module 3 SPEC.md webhook consolidation section. Do not move `verifyWebhookSignature`; it is already in the lib file.]
- Commit message: `fix(stripe): consolidate webhook handler into lib/stripe/webhooks.ts`
- Classification: BLOCKING

**Fix 5 — Replace rate limiter read-increment-write with atomic RPC**
- What: Replace the `recordMessage` read-then-write pattern in `lib/rise/rate-limit.ts` with a call to the `increment_message_count` Supabase RPC function to eliminate the race condition.
- Files: `lib/rise/rate-limit.ts`, `supabase/migrations/002_increment_message_count.sql` (new migration)
- How: (1) Create `supabase/migrations/002_increment_message_count.sql` defining the `increment_message_count(p_user_id uuid, p_chat_id uuid)` function with `SECURITY DEFINER`. (2) In `lib/rise/rate-limit.ts`, replace the read-increment-write in `recordMessage` with `supabaseServer.rpc('increment_message_count', { p_user_id, p_chat_id })`. Do not change `checkRateLimit` or the return type.
- Commit message: `fix(rate-limit): replace read-increment-write with atomic increment_message_count RPC`
- Classification: BLOCKING
```

After listing all BLOCKING fixes, append any WARNING items with `Classification: WARNING (optional-for-release)`.

---

### Step 16 — Finalize AUDIT.md

1. Replace the header status from `In progress` to `Complete`.
2. Add the total BLOCKING finding count to the header: `> **BLOCKING findings:** [N]`
3. Verify every one of the 14 sections contains real content or the explicit text `No finding.` — no placeholder text may remain.
4. Do not modify any source file. Run `git diff` to confirm only `AUDIT.md` appears as a new/modified file.

---

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

---

## Failure Recovery

| Failure | Recovery |
|---------|----------|
| `001_initial_schema.sql` does not exist at `supabase/migrations/001_initial_schema.sql` | Cannot perform Area 5 column-level validation. Document as BLOCKING under Area 5. Attempt to locate the schema via the Supabase MCP tool (`list_tables` + `execute_sql` against the project). Note the alternative source used. |
| A file exists but contains syntax that cannot be parsed as valid TypeScript | Document as BLOCKING under Area 1. Note that Module 1's `npx tsc --noEmit` should have caught this; if it did not, it is likely a JSX/TSX configuration issue. Do not attempt to fix it — document only. |
| `lib/auth/subscription-gate.ts` does not exist | Document as BLOCKING under Area 7. List every API route that serves authenticated or premium content so Module 3 knows exactly what to protect when it creates the gate file. |
| More than 20 distinct BLOCKING findings are discovered | Group findings by category: Auth/Security, Data/Schema, Dead Code, Integration. Add a summary table after the Area 14 header showing categories and counts. Module 3 will address them in category order. |
| A finding in one area overlaps with a finding in another area | Document the finding fully under its primary area. In the secondary area, write a cross-reference: `See Area [N] — [short name].` Do not duplicate the full finding text. |
| `npx tsc --noEmit --strict` exits non-zero during audit (regression from Module 1) | Document every error as BLOCKING under Area 2. Do not attempt to fix errors during Module 2. Record the exact compiler output in `AUDIT.md`. Module 3 will resolve them. |
| A source file imports from a path that resolves to `orchestration/` | Document as a WARNING under Area 1. Do not read the file in `orchestration/`. Note that `orchestration/` will be excluded from `tsconfig.json` in Module 3. |
