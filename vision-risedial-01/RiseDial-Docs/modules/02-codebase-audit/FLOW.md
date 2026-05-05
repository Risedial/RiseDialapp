# Module 2 — Codebase Audit: Flow

## Pre-conditions
- Module 1 complete: `npx tsc --noEmit` exits 0; `npx next build` exits 0
- `AUDIT.md` does not yet exist in the project root
- No code changes will be made during this module

---

## Steps

**1.** Create `AUDIT.md` in the project root with the following header:
```markdown
# RiseDial Codebase Audit — [today's date]

> **Status:** In progress  
> **Module:** 2 of 8  
> **Auditor:** [Claude Code / Developer]

---
```

**2.** Begin Area 1 — Import and Module Resolution.

2a. List all `.ts` and `.tsx` files in `lib/`, `app/`, and `middleware.ts`.

2b. For each import statement in each file:
- Resolve the path (handle `@/` alias as project root)
- Verify the resolved file exists
- For named imports, verify the named export exists in the target file

2c. Specifically check these critical exports exist with the exact names:
- `lib/openai/client.ts` → `callRise`, `callCompression`
- `lib/memory/executor.ts` → `executeCompressionAsync`
- `lib/supabase/server.ts` → `supabaseServer` (must be a value, not a factory function)
- `lib/rise/rate-limit.ts` → `checkRateLimit`, `recordMessage`
- `lib/auth/session.ts` → `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- `lib/auth/subscription-gate.ts` → existence check only; note the gate function's name

2d. Write Area 1 findings to `AUDIT.md`. Mark each finding BLOCKING or WARNING.

**3.** Continue Area 2 — TypeScript Strict Type Correctness.

3a. Run: `npx tsc --noEmit --strict` (strict is already on; this is a confirmation)

3b. Grep for `subscription.current_period_end` (without `.items.data[0]`):
```bash
grep -r "subscription\.current_period_end" lib/ app/ --include="*.ts"
```
Any match = BLOCKING.

3c. Read `lib/auth/session.ts` around line 62. Verify the `Uint8Array.buffer` cast.

3d. Read all `supabaseServer.from(...)` chains. Verify return types are narrowed.

3e. Write Area 2 findings.

**4.** Continue Area 3 — Runtime Environment Compatibility.

4a. Read `middleware.ts`. List its direct imports.

4b. For each imported file, read its imports recursively until the import graph is complete.

4c. Check each file in the graph for: `bcryptjs`, `jsonwebtoken`, `require('fs')`, `require('path')`, `require('crypto')` (Node crypto, not Web Crypto).

4d. Grep for `export const runtime = 'edge'` across all `app/api/` route files.

4e. Verify `lib/memory/executor.ts` line 1 is `import 'server-only'`.

4f. Write Area 3 findings.

**5.** Continue Area 4 — Stripe Integration Correctness.

5a. Read `package.json`. Check `stripe` version.

5b. Read `lib/stripe/config.ts`. Check `apiVersion`.

5c. Grep for `current_period_end`:
```bash
grep -rn "current_period_end" lib/ app/ --include="*.ts"
```
Every match must be `items.data[0].current_period_end`.

5d. Compare handler implementations in `app/api/webhooks/stripe/route.ts` and `lib/stripe/webhooks.ts`. Document what is duplicated.

5e. Check for `PREMIUM_PRODUCT_ID` declaration and usage.

5f. Confirm idempotency: `webhook_events` insert happens BEFORE event processing in the route.

5g. Write Area 4 findings.

**6.** Continue Area 5 — Supabase Schema Validation.

6a. Extract all table names from calls to `supabaseServer.from('...')`:
```bash
grep -rn "\.from\('" lib/ app/ --include="*.ts" | grep -oP "from\('\K[^']+"
```

6b. For each table name, verify it exists in `supabase/migrations/001_initial_schema.sql`.

6c. For each `.select('field')`, `.update({ field })`, `.insert({ field })` — verify the field against the migration.

6d. Document the RLS bypass as a WARNING (not a fix target in this pipeline).

6e. Verify `memory_profiles` UNIQUE constraint on `user_id` in the migration.

6f. Write Area 5 findings.

**7.** Continue Area 6 — Authentication Flow.

7a. Trace the sign-up API route from handler to database write to cookie set.

7b. Trace the login API route similarly.

7c. Read `middleware.ts` matcher config. List all protected paths.

7d. Read `lib/auth/session.ts` line 3. Check for the insecure fallback string `"changeme-insecure-fallback"`.
- Found → BLOCKING finding

7e. Verify `setSessionCookie` cookie attributes.

7f. Verify `verifySession` checks `exp` claim.

7g. Write Area 6 findings.

**8.** Continue Area 7 — Subscription Flow.

8a. Read the checkout creation route. Verify `metadata.user_id` is set.

8b. Trace the webhook handler for `checkout.session.completed`.

8c. Verify `lib/auth/subscription-gate.ts` exists.
- Does not exist → BLOCKING

8d. Verify subscription gate reads `x-subscription-status` header.

8e. Write Area 7 findings.

**9.** Continue Area 8 — Memory Compression Pipeline.

9a. Read the message route. Find every `supabaseServer.from('messages').insert(...)`. Verify `user_message_index` is included in every user-role insert.

9b. Read the compression trigger file. Verify threshold: 50 (initial), 10-message intervals (patch).

9c. Verify `executeCompressionAsync` is called with `void` (not `await`) in the message route.

9d. Read `generateInitialProfile` and `patchMemoryProfile`. Verify `response_format: { type: 'json_object' }`, `JSON.parse` in try/catch, and `onConflict: 'user_id'`.

9e. Write Area 8 findings.

**10.** Continue Area 9 — Rate Limiting.

10a. Read `lib/rise/rate-limit.ts` → `recordMessage`. Identify if it is a read-increment-write (race condition) or atomic.

10b. Read `checkRateLimit`. Verify `gte` (not `gt`) for the window cutoff.

10c. Verify `checkRateLimit` return shape.

10d. Write Area 9 findings.

**11.** Continue Area 10 — Dead Code and Duplication.

11a. Grep for `PREMIUM_PRODUCT_ID`.

11b. List `routeWebhookEvent` usages: is it imported anywhere?

11c. Grep for `jsonwebtoken` imports:
```bash
grep -rn "from 'jsonwebtoken'" lib/ app/ middleware.ts --include="*.ts"
```

11d. Check `tsconfig.json` `exclude` array for `orchestration`.

11e. Write Area 10 findings.

**12.** Continue Area 11 — Environment Variable Audit.

12a. Run:
```bash
grep -rn "process\.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" | grep -oP "process\.env\.\w+" | sort -u
```

12b. Compare to expected list. Flag any extra or missing vars.

12c. Flag any `process.env.X!` non-null assertions.

12d. Write Area 11 findings with the complete var list and any gaps.

**13.** Continue Area 12 — PWA Correctness.

13a. Read `public/manifest.json`. Verify required fields and icon entries.

13b. For each icon path in manifest, check the file exists with `ls public/[path]`.

13c. Read `next.config.ts`. Verify next-pwa configuration.

13d. Verify `public/sw.js` is non-empty.

13e. Read `app/layout.tsx`. Verify manifest link and theme-color meta.

13f. Write Area 12 findings.

**14.** Write Area 13 — Test Strategy.

Write the test plan table in `AUDIT.md` as specified in the SPEC. This is documentation of what Module 6 will build — no analysis required.

**15.** Write Area 14 — Fix Execution Plan.

15a. Collect all BLOCKING findings from Areas 1–12.

15b. Sort them into dependency order:
- First: Security fix (JWT_SECRET insecure fallback) — touches `lib/auth/session.ts`
- Second: Dead code removal (PREMIUM_PRODUCT_ID, jsonwebtoken if zero imports)
- Third: Webhook consolidation — touches `lib/stripe/webhooks.ts` and `app/api/webhooks/stripe/route.ts`
- Fourth: Rate limiter atomicity — creates migration file and updates `lib/rise/rate-limit.ts`
- Fifth: Any other BLOCKING findings in dependency order
- After all BLOCKING: WARNING items (labeled optional-for-release)

15c. For each fix, list: (a) what to change, (b) which files are affected, (c) the git commit message to use.

15d. Write Area 14 to `AUDIT.md`.

**16.** Update `AUDIT.md` header status to `Complete`.

**17.** Verify `AUDIT.md` has all 14 sections populated. Every section must have either a finding or the explicit text "No finding."

---

## Post-conditions

- `AUDIT.md` exists at the project root
- All 14 areas are documented
- Every BLOCKING finding is categorised with: the area number, the specific problem, the file(s) affected, and the severity classification
- Area 14 contains an ordered fix list that Module 3 will execute
- No source code was modified during this module
- Ready to begin Module 3
