# Module 3 — Code Fixes: SPEC

## Purpose

Apply every fix identified in `AUDIT.md` Area 14 in dependency order. Each fix is committed as a separate, atomic git commit. When this module is complete, `npx tsc --noEmit` still exits 0 (all fixes are type-correct) and all BLOCKING findings from the audit are resolved.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** `AUDIT.md` exists at the project root with all 14 areas complete  
**Fix list source:** `AUDIT.md` Area 14 — Ordered Fix List

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| `AUDIT.md` | Markdown | Project root | Yes — all 14 areas must be complete |
| `lib/auth/session.ts` | TypeScript | Project filesystem | Yes |
| `app/api/webhooks/stripe/route.ts` | TypeScript | Project filesystem | Yes |
| `lib/stripe/webhooks.ts` | TypeScript | Project filesystem | Yes |
| `lib/rise/rate-limit.ts` | TypeScript | Project filesystem | Yes |
| `tsconfig.json` | JSON | Project root | Yes |
| `package.json` | JSON | Project root | Yes |

---

## Outputs

| Field | Type | Destination |
|-------|------|-------------|
| Corrected `lib/auth/session.ts` | TypeScript | `lib/auth/session.ts` |
| Consolidated `lib/stripe/webhooks.ts` | TypeScript | `lib/stripe/webhooks.ts` |
| Thinned `app/api/webhooks/stripe/route.ts` | TypeScript | `app/api/webhooks/stripe/route.ts` |
| Updated `lib/rise/rate-limit.ts` | TypeScript | `lib/rise/rate-limit.ts` |
| Migration file | SQL | `supabase/migrations/002_atomic_rate_limit.sql` |
| Updated `tsconfig.json` | JSON | `tsconfig.json` |
| Updated `package.json` | JSON | `package.json` |
| One git commit per fix | Commits | Repository |

---

## Fix Specifications

### Fix A — JWT_SECRET Security: Remove Insecure Fallback

**File:** `lib/auth/session.ts`  
**Finding:** Area 6, BLOCKING

**Current code (approximately line 3):**
```typescript
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback"
```

**Corrected code:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET
```

**Constraint:** Leave the bare `process.env.JWT_SECRET` for now — Module 4 will update this to `import { env } from '@/lib/env'` and use `env.JWT_SECRET`. Do not skip ahead and add the env import in this fix — that creates a dependency on Module 4 which is not yet built.

**Type impact:** `JWT_SECRET` changes type from `string` to `string | undefined`. Any call that passes `JWT_SECRET` to a function expecting `string` will now produce a TypeScript error. Fix those call sites: add `JWT_SECRET!` (non-null assertion) with a comment `// Validated at startup via lib/env.ts (Module 4)`. The startup validation in Module 4 will ensure this is never actually undefined at runtime.

**Commit message:** `fix(auth): remove insecure JWT_SECRET fallback`

---

### Fix B — Dead Code: Remove PREMIUM_PRODUCT_ID

**File:** `app/api/webhooks/stripe/route.ts`  
**Finding:** Area 4 and Area 10, BLOCKING

**Action:** Delete the line:
```typescript
const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'
```

This constant is declared but never referenced in the file. It is dead code from an earlier iteration of the webhook handler.

**Verification:** After deletion, `npx tsc --noEmit` still exits 0.

**Commit message:** `fix(stripe): remove unused PREMIUM_PRODUCT_ID dead code`

---

### Fix C — Webhook Consolidation

**Files:** `app/api/webhooks/stripe/route.ts`, `lib/stripe/webhooks.ts`  
**Finding:** Area 4 and Area 10, BLOCKING

This is the most complex fix. Execute in this exact sequence:

**Step C1 — Audit both files' current implementations**
Read both files in full before changing anything:
- `lib/stripe/webhooks.ts`: note all exported functions, all handler functions, whether idempotency logic is present
- `app/api/webhooks/stripe/route.ts`: note the inline handler functions, the idempotency logic (webhook_events table insert/check), and the 4 event type handlers

**Step C2 — Move handler functions from route to lib**
Move these functions from `app/api/webhooks/stripe/route.ts` into `lib/stripe/webhooks.ts`:
- `getPlanTypeFromPriceId`
- `detectPremiumItem`
- `getBasePriceId`
- `handleCheckoutSessionCompleted`
- Any other handler functions for `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

Do not move: `verifyWebhookSignature` (it is already in the lib file).

**Step C3 — Move idempotency logic into routeWebhookEvent**
The idempotency check in the route file (insert into `webhook_events` table before processing) must be moved into `lib/stripe/webhooks.ts`'s `routeWebhookEvent` function.

The idempotency pattern to preserve:
```typescript
// 1. Check if event already processed
const { data: existing } = await supabaseServer
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single()

if (existing) {
  return // Already processed — idempotent early return
}

// 2. Insert BEFORE processing (crash-safe pre-insert)
await supabaseServer
  .from('webhook_events')
  .insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })

// 3. Route to handler
switch (event.type) {
  case 'checkout.session.completed': ...
  case 'customer.subscription.updated': ...
  case 'customer.subscription.deleted': ...
  case 'invoice.payment_failed': ...
  default: // silently ignore unknown types
}
```

**Step C4 — Thin the route file**
After consolidation, `app/api/webhooks/stripe/route.ts` must be a thin dispatcher:
```typescript
import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = verifyWebhookSignature(body, signature)
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await routeWebhookEvent(event)
  return Response.json({ received: true })
}
```

**Step C5 — Verify exports**
After consolidation, `lib/stripe/webhooks.ts` must export:
- `verifyWebhookSignature(body: string, signature: string): Stripe.Event` — throws on invalid signature
- `routeWebhookEvent(event: Stripe.Event): Promise<void>` — includes idempotency logic and all 4 handlers

**Step C6 — Verify tsc**
Run `npx tsc --noEmit`. Fix any type errors introduced by the consolidation before committing.

**Commit message:** `fix(stripe): consolidate webhook handlers into lib/stripe/webhooks.ts`

---

### Fix D — Rate Limiter Atomicity

**Files:** `supabase/migrations/002_atomic_rate_limit.sql` (new), `lib/rise/rate-limit.ts`  
**Finding:** Area 9, BLOCKING

**Step D1 — Create the migration file**
Create `supabase/migrations/002_atomic_rate_limit.sql` with the `increment_message_count` PostgreSQL function.

See `modules/03-code-fixes/SCHEMA.md` for the exact SQL.

**Step D2 — Apply the migration**
Apply the migration to the Supabase project:
```bash
# Option A: via Supabase CLI
npx supabase db push

# Option B: via Supabase dashboard
# Copy the SQL from 002_atomic_rate_limit.sql and run in Supabase SQL Editor
```

**Step D3 — Update recordMessage**
In `lib/rise/rate-limit.ts`, replace the `recordMessage` function body.

**Current pattern (race condition):**
```typescript
// read current count
const { data } = await supabaseServer.from('rate_limit_tracking')...
const newCount = (data?.message_count ?? 0) + 1
// write back — not atomic under concurrent requests
await supabaseServer.from('rate_limit_tracking').update({ message_count: newCount })...
```

**Corrected pattern (atomic):**
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

The RPC function handles both the "active window exists → increment" and "no active window → insert new window" cases atomically in the database.

**Commit message:** `fix(rate-limit): replace read-modify-write with atomic increment_message_count RPC`

---

### Fix E — orchestration/ TypeScript Exclusion

**File:** `tsconfig.json`  
**Finding:** Area 10 (if orchestration/ causes type errors)

Add `"orchestration"` to the `exclude` array in `tsconfig.json`:
```json
{
  "exclude": ["node_modules", "orchestration"]
}
```

**Commit message:** `fix(tsconfig): exclude orchestration/ from TypeScript compilation`

---

### Fix F — jsonwebtoken Removal (conditional)

**Files:** `package.json`, `package-lock.json`  
**Finding:** Area 10, WARNING

**Condition:** Only execute this fix if:
```bash
grep -rn "jsonwebtoken" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
```
Returns zero results (excluding `node_modules`).

**Action:**
```bash
npm uninstall jsonwebtoken @types/jsonwebtoken
```

**Commit message:** `fix(deps): remove unused jsonwebtoken dependency`

---

### Fix G — Other AUDIT.md Findings

For each remaining BLOCKING finding in `AUDIT.md` Area 14:
- Apply the minimal fix as documented
- Run `npx tsc --noEmit` after each fix to confirm no regressions
- Commit each fix independently with a descriptive commit message

---

## Sequencing Rules

Fixes must be applied in this order:
1. Fix A (JWT_SECRET fallback) — isolated change, no dependencies
2. Fix B (dead code) — isolated change, no dependencies
3. Fix C (webhook consolidation) — must precede any changes that depend on `lib/stripe/webhooks.ts` exports
4. Fix D (rate limiter) — must precede Module 4 (the atomic RPC must exist before tests are written)
5. Fix E (tsconfig) — can be done at any point
6. Fix F (jsonwebtoken) — must be done after Fix A confirms no more jsonwebtoken usage
7. Fix G (remaining findings from AUDIT.md) — in the order specified in Area 14

---

## Invariants

- `npx tsc --noEmit` must exit 0 after every commit in this module
- No API response shapes are changed (requests and responses for all routes remain identical)
- No UI changes
- No new features

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Webhook consolidation introduces a TypeScript error in the route file | Fix the type error before committing. The consolidated code must be type-correct. |
| The Supabase RPC migration fails to apply | Document the error. Apply via Supabase SQL Editor directly as a fallback. Ensure `002_atomic_rate_limit.sql` still exists in the migrations directory for source control tracking. |
| `jsonwebtoken` is still imported in a file after Fix A | Fix A should have revealed this if jsonwebtoken is still in use. Find the import, remove it, replace with the session helpers. Then run Fix F. |
| A finding in AUDIT.md requires changing an interface shared by many files | Change the interface definition first, then fix all call sites in a single commit. Do not leave the codebase in a state where the interface change exists but call sites are broken. |

---

## AI/LLM Used

None.

---

## Data Stored

None beyond git commits. The migration file `002_atomic_rate_limit.sql` is committed to source control and applied to Supabase.
