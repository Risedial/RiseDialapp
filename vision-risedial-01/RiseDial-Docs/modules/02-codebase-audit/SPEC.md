# Module 2 — Codebase Audit: SPEC

## Purpose

Perform a systematic read-only review of all 14 concern areas across the RiseDial codebase and produce `AUDIT.md` — a structured findings document that drives all code changes in Module 3. No code is modified during this module.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 1 complete — `npx tsc --noEmit` exits 0; `npx next build` exits 0  
**Constraint:** This module is strictly read-only. No source files may be modified. No git commits are made.

---

## Inputs

| Field | Type | Source | Required | Constraints |
|-------|------|--------|----------|-------------|
| All source files in `lib/` | TypeScript | Local filesystem | Yes | |
| All source files in `app/` | TypeScript/TSX | Local filesystem | Yes | |
| `middleware.ts` | TypeScript | Project root | Yes | |
| `supabase/migrations/001_initial_schema.sql` | SQL | Local filesystem | Yes | Ground truth for all table and column names |
| `package.json` | JSON | Project root | Yes | |
| `tsconfig.json` | JSON | Project root | Yes | |
| `public/manifest.json` | JSON | `public/` | Yes | PWA manifest |
| `public/sw.js` | JavaScript | `public/` | Yes | Service worker |
| `next.config.ts` or `next.config.js` | TypeScript/JS | Project root | Yes | |

---

## Outputs

| Field | Type | Destination | Format |
|-------|------|-------------|--------|
| `AUDIT.md` | Markdown | Project root | One section per area; findings classified as Blocking or Warning |

### AUDIT.md Structure

```
# RiseDial Codebase Audit — [date]

## Area 1 — Import and Module Resolution
### Findings
- BLOCKING: [description]
- WARNING: [description]
- No finding.

## Area 2 — TypeScript Strict Type Correctness
...

## Area 14 — Fix Execution Plan
### Ordered Fix List
1. [fix description] — files affected: [list]
2. ...
```

**Classification:**
- **BLOCKING** — must be fixed before Module 6 (unit tests) can pass or before the app is safe to run
- **WARNING** — should be fixed; does not block test writing or deployment but represents technical debt or security risk

---

## Audit Areas

### Area 1 — Import and Module Resolution

Check every `import` statement in `lib/`, `app/`, and `middleware.ts`.

**Steps:**
1. For each import, verify the imported file path exists on the filesystem
2. For each named import (`{ foo }`), verify `foo` is actually exported from the target file
3. Specifically check these exports (confirmed by the vision as the critical ones):
   - `lib/openai/client.ts` — must export `callRise` and `callCompression`
   - `lib/memory/executor.ts` — must export `executeCompressionAsync`
   - `lib/supabase/server.ts` — must export `supabaseServer` as a singleton (not a factory function)
   - `lib/rise/rate-limit.ts` — must export `checkRateLimit` and `recordMessage`
   - `lib/auth/session.ts` — must export `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
   - `lib/auth/subscription-gate.ts` — must exist and export a subscription gate function
4. Flag any import that resolves to a non-existent path as BLOCKING
5. Flag any named import that does not match an export as BLOCKING

### Area 2 — TypeScript Strict Type Correctness

**Steps:**
1. Verify `tsc --noEmit --strict` exits 0 (strict mode is already enabled in tsconfig.json, so this should be equivalent to the Module 1 check)
2. Check all Stripe SDK v22 type shapes. Key unions:
   - `Stripe.Invoice.customer`: `string | Stripe.Customer | Stripe.DeletedCustomer | null` — every cast or use must handle the full union
   - `Stripe.Subscription.items.data[0].current_period_end`: this field is on the item, not the subscription object — confirm zero uses of `subscription.current_period_end` across the codebase
3. Check `lib/auth/session.ts` — the `Uint8Array.buffer as ArrayBuffer` cast near line 62: `SubtleCrypto.sign()` returns `ArrayBuffer`; confirm the cast is valid
4. Check all `supabaseServer.from('table').select()` call chains: confirm the return type is narrowed to the correct shape before use

### Area 3 — Runtime Environment Compatibility

**Steps:**
1. List every file that `middleware.ts` imports directly or transitively (follow the import graph)
2. For each file in that graph, check for imports of: `bcryptjs`, `jsonwebtoken`, `fs`, `path`, `node:crypto`, `stream`, `buffer`, or any package that requires the Node.js runtime
3. Confirm `lib/auth/session.ts`'s `verifySession` function uses only `crypto.subtle` (Web Crypto API, Edge-safe) — not `require('crypto')` (Node.js built-in)
4. Scan all `app/api/` route files for `export const runtime = 'edge'` declarations. Flag any route that declares Edge Runtime but imports Node.js-only packages
5. Confirm `lib/memory/executor.ts` line 1 is `import 'server-only'` — this prevents Edge Runtime from accidentally bundling this file

### Area 4 — Stripe Integration Correctness

**Steps:**
1. Check `package.json`: Stripe SDK version must be `^22.1.0` or higher
2. Check `lib/stripe/config.ts`: `apiVersion` must be `'2026-04-22.dahlia'` — the Stripe API version for SDK v22
3. Grep the entire codebase for `current_period_end`. Every occurrence must be in the form `subscription.items.data[0].current_period_end`, never `subscription.current_period_end`
4. **Webhook duplication audit:**
   - Read `app/api/webhooks/stripe/route.ts` — count how many Stripe event handlers are defined inline
   - Read `lib/stripe/webhooks.ts` — count how many event handlers are defined there
   - Check whether `route.ts` imports `routeWebhookEvent` from `lib/stripe/webhooks.ts` — it should not (the import does not exist; the lib's export is dead code)
   - Confirm the route file's idempotency logic: the route inserts into `webhook_events` BEFORE processing the event (crash-safe pre-insert). Document that this pattern must be preserved after consolidation.
5. Check for `const PREMIUM_PRODUCT_ID` in `route.ts` — this is declared but never referenced; flag as BLOCKING dead code

### Area 5 — Supabase Schema Validation

**Steps:**
1. Grep for `supabaseServer.from('` across all files. For each table name found, verify it exists in `001_initial_schema.sql`. Valid names: `users`, `chats`, `messages`, `memory_profiles`, `rate_limit_tracking`, `webhook_events`
2. For every `.select('field')`, `.update({ field: value })`, `.insert({ field: value })` — verify the field name exists as a column in the target table per the migration
3. **RLS documentation:** The migration enables RLS on all tables with `auth.uid()` policies. The app uses a custom JWT and the service role client, which bypasses RLS entirely. The RLS policies protect nothing and provide nothing. Document this as a WARNING — security architecture note; out of scope to fix in this pipeline.
4. Confirm `memory_profiles` has `UNIQUE` constraint on `user_id` in the migration — required for the `.upsert()` conflict resolution pattern

### Area 6 — Authentication Flow

**Steps:**
1. Trace the sign-up flow end-to-end in code:
   - Locate the sign-up API route
   - Verify: password → `bcrypt.hash()` → stored in `password_hash`
   - Verify: user row inserted into `users`
   - Verify: `createSession(userId, subscriptionStatus)` called → `setSessionCookie()` called
2. Trace the login flow end-to-end in code:
   - Locate the login API route
   - Verify: email → `users` table query → `bcrypt.compare()` → if match → `createSession()` → `setSessionCookie()`
3. Read `middleware.ts` matcher. Current expected value: `['/api/chat/:path*', '/api/memory/:path*', '/api/subscription/:path*', '/api/chats/:path*', '/api/user/:path*']`. Verify no authenticated API route exists outside these paths
4. **Security finding:** Read `lib/auth/session.ts` line 3. If it reads `process.env.JWT_SECRET ?? "changeme-insecure-fallback"` — flag as BLOCKING. JWT tokens can be forged by anyone who knows the fallback string.
5. Verify `setSessionCookie` parameters: `httpOnly: true`, `sameSite: 'strict'`, `secure: true`, `maxAge: 30 * 24 * 60 * 60` (30 days), `path: '/'`
6. Verify `verifySession` checks the `exp` claim and returns `null` if the token is expired
7. List all API routes that read `x-user-id` and `x-subscription-status` headers. Verify none of them have a fallback path for when these headers are absent (middleware guarantees they are always present for authenticated requests)

### Area 7 — Subscription Flow

**Steps:**
1. Trace the checkout creation flow: locate the checkout API route; verify it creates a Stripe checkout session with `metadata.user_id` set; verify it returns a redirect URL to Stripe
2. Trace the webhook activation flow: webhook route → signature verification → idempotency check → retrieve subscription with `expand: ['items.data.price']` → update `users` table with `subscription_status: 'active'`, `plan_type`, `next_billing_date`, `has_premium_memory`
3. Verify `lib/auth/subscription-gate.ts` exists. If it does not exist — BLOCKING finding. List every API route that serves premium or authenticated content — those routes are unprotected.
4. Verify the subscription gate reads `x-subscription-status` from `request.headers` and returns 402 or 403 for non-`'active'` status

### Area 8 — Memory Compression Pipeline

**Steps:**
1. Read the message route (`app/api/chat/[chatId]/message/route.ts`). Find every location where a user message is inserted into the `messages` table. Verify `user_message_index` is set on every user message insert. If any insert is missing `user_message_index` — BLOCKING finding (compression will never trigger for those messages)
2. Read `lib/memory/trigger.ts` (or equivalent). Confirm compression fires at exactly 50 user messages (initial) and every 10 messages after that (60, 70, 80...)
3. Verify the message route calls `executeCompressionAsync` with `void` — fire-and-forget, not `await`. If it uses `await`, the HTTP response is blocked
4. Read `lib/memory/compress.ts` and `lib/memory/patch.ts`. Verify both call OpenAI with `response_format: { type: 'json_object' }`, parse with `JSON.parse()` in a `try/catch`, and validate the parsed shape before upserting
5. Verify the upsert in both files uses `onConflict: 'user_id'` (matching the UNIQUE constraint on `memory_profiles.user_id`)

### Area 9 — Rate Limiting

**Steps:**
1. Read `lib/rise/rate-limit.ts`. Find the `recordMessage` function. Identify whether it reads the current `message_count`, increments in application code, then writes back (race condition) or calls an atomic DB operation.
   - If read-then-increment-then-write: BLOCKING. Document as a race condition. Flag for Module 3 fix (atomic Supabase RPC).
   - If atomic: No finding.
2. Read `checkRateLimit`. Verify the rolling window query uses `gte` (`>=`), not `gt` (`>`): `window_start >= now() - interval '60 minutes'`
3. Verify `checkRateLimit` returns `{ allowed: boolean, remaining: number }`. Verify the message route destructures it correctly without renaming `allowed` in a way that causes confusion

### Area 10 — Dead Code and Duplication

**Steps:**
1. Grep for `PREMIUM_PRODUCT_ID` across all files — should find exactly one declaration in `app/api/webhooks/stripe/route.ts` and zero uses. Flag as BLOCKING dead code.
2. Check `lib/stripe/webhooks.ts` exports. If `routeWebhookEvent` is exported but never imported by any other file — flag as WARNING dead code (it will become the primary export after Module 3 consolidation, so the export is correct; but the fact that it is unused currently means the route file has its own implementation)
3. Grep for `import.*jsonwebtoken` across all `.ts` and `.tsx` files (excluding `node_modules`). If zero results: add `jsonwebtoken` and `@types/jsonwebtoken` to the Module 3 removal list. If any results: list the files.
4. Check whether `orchestration/` directory contains `.ts` files. If so, verify it is excluded from `tsconfig.json` `exclude` array. If not excluded: flag for Module 3 fix.
5. Identify any other runtime-dead files (files that are never imported and not an entry point)

### Area 11 — Environment Variable Audit

**Steps:**
1. Grep for `process.env.` across all source files (excluding `node_modules`):
```bash
grep -r "process\.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" -h | grep -oP "process\.env\.\w+" | sort -u
```
2. Compare the result to this expected complete list. Flag any extra vars found:
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
3. Flag any `process.env.X!` (non-null assertion without prior validation) as BLOCKING — these throw unhelpful errors at runtime
4. Flag `process.env.JWT_SECRET ?? "changeme-insecure-fallback"` specifically as BLOCKING (already noted in Area 6)

### Area 12 — PWA Correctness

**Steps:**
1. Read `public/manifest.json`. Verify it contains: `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, `icons`. Verify `icons` has at least one entry with `sizes: "192x192"` and one with `sizes: "512x512"`.
2. For each icon path in `manifest.json`, verify the PNG file exists in `public/`
3. Read `next.config.ts` (or `next.config.js`). If using `next-pwa`, verify: `dest: 'public'`, `register: true`, `skipWaiting: true`
4. Verify `public/sw.js` is not a zero-byte file (the file exists per git status; confirm it has valid Workbox content)
5. Read the root layout file (`app/layout.tsx`). Verify it includes `<link rel="manifest" href="/manifest.json" />` and a `<meta name="theme-color" ... />` tag

### Area 13 — Test Strategy Documentation

Document in `AUDIT.md` the test plan for Modules 5–7:

**Unit tests (Vitest):**
- `lib/auth/session.ts` — `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- `lib/rise/rate-limit.ts` — `checkRateLimit`, `recordMessage`
- `lib/memory/trigger.ts` — `checkCompressionTrigger`
- `lib/memory/executor.ts` — `executeCompressionAsync`
- `lib/stripe/webhooks.ts` — `verifyWebhookSignature`, `routeWebhookEvent`
- `lib/supabase/client.ts` — browser Supabase client construction
- `lib/env.ts` — schema validation

**Integration tests (Vitest with vi.mock()):**
- `app/api/chat/[chatId]/message/route.ts`
- `app/api/webhooks/stripe/route.ts`
- All other `app/api/` routes

**E2E tests (Playwright against localhost:3000):**
- Flow 1: Sign-up + onboarding (local only; skipped in CI)
- Flow 2: Login + session persistence
- Flow 3: Chat + AI response
- Flow 4: Stripe billing portal

### Area 14 — Fix Execution Plan

The final section of `AUDIT.md` is an ordered fix list. Every BLOCKING finding becomes a fix. WARNING findings are included but labeled optional-for-release.

**Ordering rule:** A fix that creates or modifies a file that another fix also modifies must come before that other fix. The webhook consolidation (moves code from route → lib) must come before any other changes to `lib/stripe/webhooks.ts` or `app/api/webhooks/stripe/route.ts`.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| A file referenced by an import does not exist | Log as BLOCKING under Area 1. Continue auditing all other areas — do not stop. |
| A column used in code is not in `001_initial_schema.sql` | Log as BLOCKING under Area 5. Note the table name, column name, and the file + line where it is used. |
| `lib/auth/subscription-gate.ts` does not exist | Log as BLOCKING under Area 7. List every route that calls subscription-gated logic so Module 3 knows what to protect. |
| More than 20 distinct BLOCKING findings | Group findings into categories: Auth/Security, Data/Schema, Dead Code, Integration. Module 3 will address them in category order. |
| A finding in one area is already noted in another area | Note it only once, in the primary area. Add a cross-reference in the secondary area. |

---

## Failure States

| Failure | Recovery |
|---------|----------|
| The `001_initial_schema.sql` file does not exist | Cannot perform Area 5 validation. Document as BLOCKING. Locate the schema another way (Supabase dashboard > Database > Schema) and note the alternative source. |
| A file exists but cannot be parsed as valid TypeScript | Document as BLOCKING under Area 1. The Module 1 tsc check should have caught this; if it did not, it is likely a JSX/TSX configuration issue. |

---

## AI/LLM Used

None.

---

## Data Stored

| Field | Type | Location | Retention |
|-------|------|----------|-----------|
| AUDIT.md | Markdown file | Project root | Until pipeline complete |
