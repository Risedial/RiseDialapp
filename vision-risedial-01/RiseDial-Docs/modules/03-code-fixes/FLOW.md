# Module 3 — Code Fixes: Flow

## Pre-conditions
- `AUDIT.md` exists at project root with all 14 areas complete
- `npx tsc --noEmit` exits 0 (from Module 1)
- Git working tree is clean

---

## Steps

**1.** Open `AUDIT.md`. Read Area 14 in full. Do not start any fix until you have read all fixes.

**2.** Verify the AUDIT.md fix list matches the known expected fixes. If there are additional BLOCKING findings discovered during the audit, add them to the ordered fix list before proceeding.

**3.** Apply Fix A — JWT_SECRET insecure fallback.

3a. Open `lib/auth/session.ts`.

3b. Find the line: `const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback"`

3c. Change it to: `const JWT_SECRET = process.env.JWT_SECRET`

3d. Find all usages of `JWT_SECRET` in the file. If any function passes it where `string` is expected, add a non-null assertion: `JWT_SECRET!`. Add a comment: `// Validated at startup by lib/env.ts (added in Module 4)`

3e. Run `npx tsc --noEmit`. Fix any type errors.

3f. Commit:
```bash
git add lib/auth/session.ts
git commit -m "fix(auth): remove insecure JWT_SECRET fallback"
```

**4.** Apply Fix B — Dead code removal.

4a. Open `app/api/webhooks/stripe/route.ts`.

4b. Find and delete: `const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'`

4c. Run `npx tsc --noEmit`. Confirm exit 0.

4d. Commit:
```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "fix(stripe): remove unused PREMIUM_PRODUCT_ID dead code"
```

**5.** Apply Fix C — Webhook consolidation.

5a. Read `app/api/webhooks/stripe/route.ts` completely. Take note of:
- All handler function definitions
- The exact idempotency logic (webhook_events check + pre-insert)
- The switch/case routing logic

5b. Read `lib/stripe/webhooks.ts` completely. Take note of:
- `verifyWebhookSignature` implementation
- `routeWebhookEvent` implementation (likely incomplete — it does not include idempotency)
- All helper functions

5c. In `lib/stripe/webhooks.ts`:
- Copy all handler functions from the route file into the lib file
- Copy the idempotency logic into `routeWebhookEvent` (BEFORE the switch/case)
- Update `routeWebhookEvent` signature if needed: `export async function routeWebhookEvent(event: Stripe.Event): Promise<void>`
- Ensure the idempotency check uses the same pre-insert pattern: insert first, then process

5d. Verify `lib/stripe/webhooks.ts` exports:
- `verifyWebhookSignature(body: string, signature: string): Stripe.Event` — throws on bad signature
- `routeWebhookEvent(event: Stripe.Event): Promise<void>` — includes idempotency + all 4 handlers

5e. Rewrite `app/api/webhooks/stripe/route.ts` as a thin dispatcher:
- Import `verifyWebhookSignature` and `routeWebhookEvent` from `@/lib/stripe/webhooks`
- Parse body, check signature header, call verify, call route, return 200
- The route file should have no handler logic, no idempotency logic, no PREMIUM_PRODUCT_ID

5f. Run `npx tsc --noEmit`. Fix all type errors before committing.

5g. Run `npx next build`. Verify exit 0.

5h. Commit:
```bash
git add lib/stripe/webhooks.ts app/api/webhooks/stripe/route.ts
git commit -m "fix(stripe): consolidate webhook handlers into lib/stripe/webhooks.ts"
```

**6.** Apply Fix D — Rate limiter atomicity.

6a. Create `supabase/migrations/002_atomic_rate_limit.sql` with the exact SQL from `modules/03-code-fixes/SCHEMA.md`.

6b. Apply the migration to Supabase:
```bash
# If Supabase CLI is configured:
npx supabase db push

# If not, copy the SQL into the Supabase dashboard SQL Editor and run it
```

6c. Verify the function was created:
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'increment_message_count';
```

6d. Open `lib/rise/rate-limit.ts`. Find the `recordMessage` function.

6e. Replace the function body with the atomic RPC call:
```typescript
export async function recordMessage(userId: string): Promise<void> {
  const { error } = await supabaseServer.rpc('increment_message_count', {
    p_user_id: userId,
  })
  if (error) {
    console.error('[rate-limit] Failed to record message:', error)
  }
}
```

6f. Run `npx tsc --noEmit`. Fix any type errors.

6g. Commit:
```bash
git add supabase/migrations/002_atomic_rate_limit.sql lib/rise/rate-limit.ts
git commit -m "fix(rate-limit): replace read-modify-write with atomic increment_message_count RPC"
```

**7.** Apply Fix E — orchestration/ tsconfig exclusion.

7a. Open `tsconfig.json`.

7b. Find or add the `exclude` array. Add `"orchestration"`:
```json
{
  "exclude": ["node_modules", "orchestration"]
}
```

7c. Run `npx tsc --noEmit`. Confirm exit 0.

7d. Commit:
```bash
git add tsconfig.json
git commit -m "fix(tsconfig): exclude orchestration/ from TypeScript compilation"
```

**8.** Apply Fix F — jsonwebtoken removal (conditional).

8a. Check for remaining jsonwebtoken usage:
```bash
grep -rn "jsonwebtoken" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
```

8b. If zero results:
```bash
npm uninstall jsonwebtoken @types/jsonwebtoken
git add package.json package-lock.json
git commit -m "fix(deps): remove unused jsonwebtoken dependency"
```

8c. If results found: do not uninstall. Note the file(s) in a comment in AUDIT.md and fix the usage first (it should have been caught in earlier fixes).

**9.** Apply all remaining BLOCKING fixes from AUDIT.md Area 14.

For each fix:
9a. Apply the minimal code change
9b. Run `npx tsc --noEmit` — confirm still exits 0
9c. Commit with the prescribed commit message from AUDIT.md Area 14

**10.** Final verification.

10a. Run `npx tsc --noEmit` — must exit 0.

10b. Run `npx next build` — must exit 0.

10c. Review git log:
```bash
git log --oneline -20
```
Verify one commit per fix; no batch commits.

---

## Decision Points

```
Read AUDIT.md Area 14
  │
  ▼
Fix A (JWT_SECRET) → commit → tsc check
  ▼
Fix B (dead code) → commit → tsc check
  ▼
Fix C (webhook consolidation)
  │ Read both files fully
  │ Migrate handlers to lib
  │ Migrate idempotency to routeWebhookEvent
  │ Thin the route file
  │ → tsc check → next build check → commit
  ▼
Fix D (rate limiter)
  │ Create 002_atomic_rate_limit.sql
  │ Apply migration to Supabase
  │ Update recordMessage
  │ → tsc check → commit
  ▼
Fix E (tsconfig) → commit
  ▼
Fix F (jsonwebtoken check)
  │ grep finds nothing → uninstall → commit
  │ grep finds something → fix those files first → then uninstall → commit
  ▼
Apply remaining AUDIT.md findings in order
  ▼
Final: tsc ✓ next build ✓ git log looks clean
```

---

## Post-conditions

- All BLOCKING findings from AUDIT.md are resolved
- `npx tsc --noEmit` exits 0
- `npx next build` exits 0
- `lib/stripe/webhooks.ts` is the single source of truth for all 4 Stripe event handlers + idempotency
- `app/api/webhooks/stripe/route.ts` is a thin dispatcher (~20 lines)
- `lib/rise/rate-limit.ts`'s `recordMessage` calls `supabaseServer.rpc('increment_message_count', ...)`
- `supabase/migrations/002_atomic_rate_limit.sql` exists and has been applied to Supabase
- `orchestration/` is in tsconfig `exclude` array
- `jsonwebtoken` is not in `package.json` dependencies (if it had zero remaining imports)
- `JWT_SECRET` in `lib/auth/session.ts` has no insecure fallback
- Ready to begin Module 4
