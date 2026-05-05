# Module 3 — Code Fixes: Build Instructions

## What You Are Building

Corrected source files and one new SQL migration file. You are applying every BLOCKING finding from `AUDIT.md` as atomic, independently-committed git changes.

---

## Prerequisites

- `AUDIT.md` exists with all 14 areas populated
- `npx tsc --noEmit` exits 0 (from Module 1)
- Git working tree is clean

---

## Rule: One Commit Per Fix

Every fix is committed independently before the next fix begins. Do not batch multiple fixes into a single commit. This makes bisecting and rollback straightforward.

After every fix, run `npx tsc --noEmit` before committing to ensure the fix did not introduce a type regression.

---

## Fix A — JWT_SECRET Insecure Fallback

**File:** `lib/auth/session.ts`

Find this line (approximately line 3):
```typescript
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback"
```

Change to:
```typescript
const JWT_SECRET = process.env.JWT_SECRET
```

Now `JWT_SECRET` is `string | undefined`. Find every location in the same file that uses `JWT_SECRET` where a `string` is required. Add a non-null assertion `JWT_SECRET!` at those sites. Add an inline comment: `// Validated at startup by lib/env.ts (Module 4)`

Run: `npx tsc --noEmit` → must exit 0

Commit:
```bash
git add lib/auth/session.ts
git commit -m "fix(auth): remove insecure JWT_SECRET fallback"
```

---

## Fix B — Dead Code: PREMIUM_PRODUCT_ID

**File:** `app/api/webhooks/stripe/route.ts`

Find and delete this line:
```typescript
const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'
```

Run: `npx tsc --noEmit` → must exit 0

Commit:
```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "fix(stripe): remove unused PREMIUM_PRODUCT_ID dead code"
```

---

## Fix C — Webhook Handler Consolidation

This is the most involved fix. Read both files fully before starting.

### Part 1: Prepare lib/stripe/webhooks.ts

Open `lib/stripe/webhooks.ts`. You should see a `verifyWebhookSignature` export and a `routeWebhookEvent` export. The `routeWebhookEvent` likely lacks the idempotency logic and the full set of handlers.

Add to `lib/stripe/webhooks.ts`:

1. **Copy helper functions from route.ts:** `getPlanTypeFromPriceId`, `detectPremiumItem`, `getBasePriceId`, and any other utility functions the route file defines inline
2. **Copy handler functions:** `handleCheckoutSessionCompleted`, and equivalent handlers for `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
3. **Update `routeWebhookEvent`** to include the idempotency pattern at the top of the function:

```typescript
export async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
  // Idempotency check — return early if already processed
  const { data: existing } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existing) return

  // Pre-insert BEFORE processing (crash-safe)
  await supabaseServer
    .from('webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    })

  // Route to handler
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break
    default:
      // Silently ignore unknown event types
      break
  }
}
```

### Part 2: Thin the route file

Replace most of `app/api/webhooks/stripe/route.ts` with a thin dispatcher. The file should look like:

```typescript
import Stripe from 'stripe'
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
  } catch {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  await routeWebhookEvent(event)
  return Response.json({ received: true })
}
```

### Part 3: Verify and commit

```bash
npx tsc --noEmit        # must exit 0
npx next build          # must exit 0

git add lib/stripe/webhooks.ts app/api/webhooks/stripe/route.ts
git commit -m "fix(stripe): consolidate webhook handlers into lib/stripe/webhooks.ts"
```

---

## Fix D — Rate Limiter Atomicity

### Part 1: Create the migration file

Create `supabase/migrations/002_atomic_rate_limit.sql`:

Copy the exact SQL from [SCHEMA.md](./SCHEMA.md) in this module directory.

### Part 2: Apply the migration

```bash
# If Supabase CLI is linked to your project:
npx supabase db push

# If not (manual):
# Open Supabase dashboard → SQL Editor → paste the SQL → Run
```

### Part 3: Update recordMessage

Open `lib/rise/rate-limit.ts`. Find the `recordMessage` function. Replace its entire body:

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

Delete any remaining read/update logic that was part of the old non-atomic pattern.

```bash
npx tsc --noEmit   # must exit 0

git add supabase/migrations/002_atomic_rate_limit.sql lib/rise/rate-limit.ts
git commit -m "fix(rate-limit): replace read-modify-write with atomic increment_message_count RPC"
```

---

## Fix E — Exclude orchestration/ from TypeScript

Open `tsconfig.json`. Find or add the `exclude` array. Add `"orchestration"`:

```json
{
  "compilerOptions": { ... },
  "exclude": ["node_modules", "orchestration"]
}
```

```bash
npx tsc --noEmit   # must exit 0

git add tsconfig.json
git commit -m "fix(tsconfig): exclude orchestration/ from TypeScript compilation"
```

---

## Fix F — Remove jsonwebtoken (if unused)

Check for any remaining usage:
```bash
grep -rn "jsonwebtoken" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"
```

If the grep returns zero lines:
```bash
npm uninstall jsonwebtoken @types/jsonwebtoken
npx tsc --noEmit   # must exit 0

git add package.json package-lock.json
git commit -m "fix(deps): remove unused jsonwebtoken dependency"
```

If the grep returns any lines: fix those usages first (they should not exist after Fix A), then run Fix F.

---

## Fix G — All Remaining AUDIT.md Findings

For each remaining BLOCKING finding in AUDIT.md Area 14 (not covered by Fixes A–F):

1. Apply the minimal fix as described in AUDIT.md
2. Run `npx tsc --noEmit` → exit 0
3. Commit with the message specified in AUDIT.md Area 14

---

## Final Verification

```bash
npx tsc --noEmit
# Expected: exit 0, zero output

npx next build
# Expected: exit 0

git log --oneline -20
# Expected: one commit per fix, descriptive messages
```

---

## Definition of Done

- [ ] All BLOCKING findings from AUDIT.md Area 14 have a corresponding commit in git log
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx next build` exits 0
- [ ] `lib/stripe/webhooks.ts` contains all 4 event handlers + idempotency logic
- [ ] `app/api/webhooks/stripe/route.ts` is a thin dispatcher with no handler logic
- [ ] `recordMessage` in `lib/rise/rate-limit.ts` calls `supabaseServer.rpc('increment_message_count', ...)`
- [ ] `supabase/migrations/002_atomic_rate_limit.sql` exists in source control
- [ ] `tsconfig.json` excludes `orchestration/`
- [ ] `lib/auth/session.ts` has no `"changeme-insecure-fallback"` string
- [ ] Ready to begin Module 4
