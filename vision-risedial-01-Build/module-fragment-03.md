# Module Fragment 03 — Code Fixes (M3)

## Role

You are a **surgical code-fix executor** for the RiseDial production codebase. Your job is to apply exactly the fixes listed below — no more, no less — each as an independent, atomic git commit. You do not refactor, rename, or touch surrounding code. You do not batch fixes. You do not speculate. You run `npx tsc --noEmit` after every fix and before every commit; if it exits non-zero, you stop and escalate to the audit phase.

---

## Context

### Locked Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5, strict mode
- **Auth:** Custom HS256 JWT via `lib/auth/session.ts` (no external JWT library)
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` 2.x
- **Payments:** Stripe ^22.1.0
- **Runtime:** Node.js (not Edge) for all routes touched in this module
- **Package manager:** npm (package-lock.json lockfileVersion 3)

### Locked Constraints (apply to every code block and instruction)

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything.
3. Do not leave a partially-changed file — revert any speculative edits before moving on.
4. The `orchestration/` directory will be excluded from TypeScript compilation in this module (Fix F). Do not read files in `orchestration/`.
5. Do not batch multiple fixes into a single commit. Every fix is committed independently before the next fix begins.
6. Do not add `tsconfig.tsbuildinfo` to `.gitignore` yet.
7. Do not add the env import in any fix — `lib/env.ts` does not exist yet in this module. Use `process.env.*` directly where needed, and throw if required values are absent.
8. Do not move `verifyWebhookSignature` — it is already in `lib/stripe/webhooks.ts`.
9. Do not add `export const runtime = 'edge'` to any route in this module.
10. No new product features may be added.
11. The Supabase schema (`001_initial_schema.sql`) is accepted as ground truth; no schema changes except the `increment_message_count` RPC function.
12. All fixes must preserve existing API contract shapes (request and response shapes are unchanged).
13. `jsonwebtoken` may be removed from `package.json` only after confirming zero remaining imports (Fix G depends on Fix F grep result).
14. No UI changes.
15. No real network calls in unit tests. No real database.
16. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
17. `lib/supabase/client.ts` does NOT import `lib/env.ts`.
18. No API response shapes are changed.
19. Do not use `as string` for `Stripe.Invoice.customer` — this is a real union type.
20. After every fix, run `npx tsc --noEmit` before committing to ensure the fix did not introduce a type regression.
21. Only execute Fix F if grep for `jsonwebtoken` in `lib/`, `app/`, and `middleware.ts` returns zero results.
22. No file in `lib/` or `app/api/` reads `process.env.*` directly except `lib/env.ts` and `lib/supabase/client.ts`. (Note: the fixes in this module that touch `process.env.*` directly are explicitly permitted as temporary exceptions until Module 4 builds `lib/env.ts`.)
23. `.env.local` must be in `.gitignore`.
24. `.env.example` is committed to the repository.
25. `jsonwebtoken` may be removed from `package.json` only after confirming zero remaining imports.
26. Must use `--noEmit` not build for type-checking between commits.
27. Silent failure that results in an empty assistant message is not acceptable.

---

## What Must Be True After This Module

All BLOCKING findings from AUDIT.md are resolved as atomic commits, `npx tsc --noEmit` exits 0, and the webhook handler is consolidated into `lib/stripe/webhooks.ts`.

---

## Execution Order

Apply fixes in this order. Each fix is one commit. Do not proceed to the next fix until the current fix's commit is complete and `npx tsc --noEmit` exits 0.

| Fix | Label | File(s) |
|-----|-------|---------|
| A | Remove insecure JWT_SECRET fallback | `lib/auth/session.ts` |
| B | Consolidate webhook handlers + idempotency | `lib/stripe/webhooks.ts` |
| C | Make webhook route a thin dispatcher | `app/api/webhooks/stripe/route.ts` |
| D | Replace read-modify-write with RPC | `lib/rise/rate-limit.ts` |
| E | Add atomic rate-limit SQL migration | `supabase/migrations/002_atomic_rate_limit.sql` |
| F | Exclude orchestration/ from tsconfig | `tsconfig.json` |
| G | Remove jsonwebtoken from package.json | `package.json`, `package-lock.json` |

---

## Files to Change

### `C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts`

**Fix A — Remove the `"changeme-insecure-fallback"` string; throw if `JWT_SECRET` is absent.**

**Constraint:** Do not add an import from `lib/env.ts` (it does not exist yet in this module). Read `process.env.JWT_SECRET` directly and throw at module initialisation time if it is absent.

**Current line 3:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback";
```

**Replace that single line with:**
```typescript
const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = _jwtSecret;
```

Everything else in the file is unchanged. The complete file after the edit is:

```typescript
import { NextResponse } from "next/server";

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = _jwtSecret;
const COOKIE_NAME = "risedial_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ---------------------------------------------------------------------------
// Minimal HS256 JWT — no external dependencies
// ---------------------------------------------------------------------------

function base64urlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const padded2 = padded + "=".repeat(padLength);
  const binary = atob(padded2);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(secret);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  return base64urlEncode(new Uint8Array(signature));
}

async function hmacVerify(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const keyBytes = new TextEncoder().encode(secret);
  const dataBytes = new TextEncoder().encode(data);
  const sigBytes = base64urlDecode(signature);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify("HMAC", cryptoKey, sigBytes.buffer as ArrayBuffer, dataBytes);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates an HS256 JWT with a 30-day expiry containing `user_id` and
 * `subscription_status` in the payload.
 */
export async function createSession(
  userId: string,
  subscriptionStatus: string
): Promise<string> {
  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));

  const now = Math.floor(Date.now() / 1000);
  const payload = base64urlEncode(
    JSON.stringify({
      user_id: userId,
      subscription_status: subscriptionStatus,
      iat: now,
      exp: now + MAX_AGE_SECONDS,
    })
  );

  const signingInput = `${header}.${payload}`;
  const signature = await hmacSign(signingInput, JWT_SECRET);
  return `${signingInput}.${signature}`;
}

/**
 * Verifies an HS256 JWT.  Returns the payload if valid, or `null` on any
 * error (bad signature, expired, malformed, etc.).
 */
export async function verifySession(
  token: string
): Promise<{ user_id: string; subscription_status: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const signingInput = `${header}.${payload}`;

    const valid = await hmacVerify(signingInput, signature, JWT_SECRET);
    if (!valid) return null;

    const decoded = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payload))
    ) as {
      user_id: string;
      subscription_status: string;
      iat: number;
      exp: number;
    };

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;

    return {
      user_id: decoded.user_id,
      subscription_status: decoded.subscription_status,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the `risedial_session` cookie on a `NextResponse` as httpOnly,
 * SameSite=Strict, Secure with a 30-day maxAge.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

/**
 * Clears the `risedial_session` cookie by setting maxAge to 0.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 0,
    path: "/",
  });
}
```

**Commit message:** `fix(A): throw on absent JWT_SECRET instead of using insecure fallback`

**After editing:** Run `npx tsc --noEmit`. It must exit 0 before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts`

**Fix B — Add idempotency pre-insert, consolidate all 4 event handlers, remove dead `PREMIUM_PRODUCT_ID`, fix billing date field.**

**Analysis of current file:**
- The current file (`lib/stripe/webhooks.ts`) already contains all 4 handlers as private functions and exports `verifyWebhookSignature` and `routeWebhookEvent`. Do NOT move `verifyWebhookSignature`.
- The current file does NOT have an idempotency check — that logic currently lives only in the route file. The idempotency check must be added to `routeWebhookEvent` in this lib file.
- The billing date field `subscription.items.data[0].current_period_end` is already used correctly in the current `lib/stripe/webhooks.ts`; confirm it remains so.
- There is no `PREMIUM_PRODUCT_ID` constant in the current `lib/stripe/webhooks.ts` (it only exists in the route file). No removal needed here.
- The `handleInvoicePaymentFailed` function uses `(invoice.customer as Stripe.Customer)?.id` — this is an allowed pattern for narrowing the union; do NOT use `as string`.

**What needs to change:** Add the idempotency pre-insert logic to `routeWebhookEvent` so that this lib file is the single source of truth for webhook processing. The route file (Fix C) will become a thin dispatcher that calls `routeWebhookEvent` directly.

**The idempotency check requires `supabaseServer`** which is already imported. Add the check at the top of `routeWebhookEvent` before the switch statement.

The complete file after Fix B:

```typescript
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getPlanTypeFromPriceId(priceId: string): 'monthly' | 'annual' {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly'
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual'
  throw new Error(`Unknown base price ID: ${priceId}`)
}

function detectPremiumItem(subscription: Stripe.Subscription): {
  hasPremiumMemory: boolean
  premiumItemId: string | null
} {
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (
      priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON ||
      priceId === process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON
    ) {
      return { hasPremiumMemory: true, premiumItemId: item.id }
    }
  }
  return { hasPremiumMemory: false, premiumItemId: null }
}

function getBasePriceId(subscription: Stripe.Subscription): string {
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (
      priceId === process.env.STRIPE_PRICE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ANNUAL
    ) {
      return priceId
    }
  }
  throw new Error('No base plan price found on subscription')
}

// ─── Event Handlers ────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (!session.subscription || !session.customer) return

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer.id

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  const basePriceId = getBasePriceId(subscription)
  const planType = getPlanTypeFromPriceId(basePriceId)
  const { hasPremiumMemory, premiumItemId } = detectPremiumItem(subscription)
  const nextBillingDate = new Date(subscription.items.data[0].current_period_end * 1000).toISOString()

  const userId = session.metadata?.user_id
  if (!userId) return

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_type: planType,
      next_billing_date: nextBillingDate,
      has_premium_memory: hasPremiumMemory,
      stripe_premium_item_id: premiumItemId,
    })
    .eq('id', userId)
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  let basePriceId: string
  try {
    basePriceId = getBasePriceId(subscription)
  } catch {
    return
  }

  const planType = getPlanTypeFromPriceId(basePriceId)
  const { hasPremiumMemory, premiumItemId } = detectPremiumItem(subscription)
  const nextBillingDate = new Date(subscription.items.data[0].current_period_end * 1000).toISOString()

  await supabaseServer
    .from('users')
    .update({
      plan_type: planType,
      has_premium_memory: hasPremiumMemory,
      next_billing_date: nextBillingDate,
      stripe_premium_item_id: premiumItemId,
    })
    .eq('stripe_customer_id', customerId)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'lapsed',
      subscription_lapsed_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : (invoice.customer as Stripe.Customer)?.id ?? null

  if (!customerId) return

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'lapsed',
    })
    .eq('stripe_customer_id', customerId)
}

// ─── Public Exports ────────────────────────────────────────────────────────────

/**
 * Verifies the Stripe webhook signature using STRIPE_WEBHOOK_SECRET.
 * Throws if the signature is invalid.
 * Returns the parsed Stripe.Event on success.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

/**
 * Routes a verified Stripe.Event to the appropriate handler.
 *
 * Performs an idempotency pre-insert into `webhook_events` BEFORE processing:
 * if the event has already been recorded (duplicate delivery), returns immediately.
 * If not recorded, inserts the event record first, then processes it.
 *
 * Handles exactly 4 event types:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_failed
 *
 * Unhandled event types are silently ignored.
 */
export async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
  // Idempotency check: return immediately if this event was already processed
  const { data: existingEvent } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent) {
    return
  }

  // Pre-insert event into webhook_events BEFORE processing
  // This prevents double-processing if the handler crashes mid-flight
  await supabaseServer.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice
      )
      break

    default:
      // Unhandled event type — ignore silently
      break
  }
}
```

**Commit message:** `fix(B): add idempotency pre-insert to routeWebhookEvent in lib/stripe/webhooks.ts`

**After editing:** Run `npx tsc --noEmit`. It must exit 0 before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\app\api\webhooks\stripe\route.ts`

**Fix C — Remove all inline handler functions, dead `PREMIUM_PRODUCT_ID` constant, and duplicate idempotency logic. Make this a thin dispatcher that calls `verifyWebhookSignature` and `routeWebhookEvent` from `lib/stripe/webhooks.ts`.**

**Analysis of current file:** The current route file (`app/api/webhooks/stripe/route.ts`) contains:
- A dead `PREMIUM_PRODUCT_ID` constant
- Three duplicated helper functions (`getPlanTypeFromPriceId`, `detectPremiumItem`, `getBasePriceId`) that are already in the lib file
- Inline event handler logic in a switch block
- Its own idempotency check and pre-insert

All of that must be removed. The route becomes a thin POST handler that:
1. Reads the raw body and `stripe-signature` header
2. Calls `verifyWebhookSignature` from the lib
3. Calls `routeWebhookEvent` from the lib
4. Returns `{ received: true }`

The complete file after Fix C:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event

  try {
    event = verifyWebhookSignature(rawBody, signature)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    await routeWebhookEvent(event)
  } catch {
    // Never return raw errors — always return received: true
  }

  return NextResponse.json({ received: true })
}
```

**Commit message:** `fix(C): reduce stripe webhook route to thin dispatcher; move all logic to lib/stripe/webhooks.ts`

**After editing:** Run `npx tsc --noEmit`. It must exit 0 before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\lib\rise\rate-limit.ts`

**Fix D — Replace the read-modify-write pattern in `recordMessage` with an atomic `supabaseServer.rpc('increment_message_count', { p_user_id: userId })` call.**

**Analysis of current file:** The current `recordMessage` function:
1. Calls `getActiveWindow(userId)` (a SELECT)
2. If a window exists: does an UPDATE with `window.message_count + 1` (a read-modify-write, not atomic)
3. If no window exists: INSERTs a new row with `message_count: 1`

This entire body must be replaced with a single RPC call. The RPC function (`increment_message_count`) is defined in Fix E and handles both the insert-or-update atomically.

The `checkRateLimit` function and `getActiveWindow` helper are unchanged.

The complete file after Fix D:

```typescript
import { supabaseServer } from '@/lib/supabase/server';

const RATE_LIMIT_MAX = 60;
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Finds the active rate limit window for a user, if one exists and has not expired.
 * A window is considered active if window_start is within the last 60 minutes.
 */
async function getActiveWindow(
  userId: string
): Promise<{ id: string; message_count: number; window_start: string } | null> {
  const windowCutoff = new Date(Date.now() - WINDOW_DURATION_MS).toISOString();

  const { data, error } = await supabaseServer
    .from('rate_limit_tracking')
    .select('id, message_count, window_start')
    .eq('user_id', userId)
    .gte('window_start', windowCutoff)
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to query rate_limit_tracking: ${error.message}`);
  }

  return data ?? null;
}

/**
 * checkRateLimit
 *
 * Checks whether the user is allowed to send another message within the current
 * 60-minute rolling window.
 *
 * - If no active window exists, the user is allowed (remaining = 60).
 * - If an active window exists, returns whether message_count < 60 and
 *   the number of remaining messages in the window.
 *
 * @param userId - The UUID of the user to check
 * @returns { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const window = await getActiveWindow(userId);

  if (!window) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - window.message_count);
  const allowed = window.message_count < RATE_LIMIT_MAX;

  return { allowed, remaining };
}

/**
 * recordMessage
 *
 * Atomically increments the message_count for the user's current 60-minute window
 * using the `increment_message_count` database RPC function.
 * If no active window exists, the RPC creates a new window with message_count = 1.
 *
 * Should be called after a message has been successfully sent.
 *
 * @param userId - The UUID of the user who sent the message
 */
export async function recordMessage(userId: string): Promise<void> {
  const { error } = await supabaseServer.rpc('increment_message_count', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to record message: ${error.message}`);
  }
}
```

**Commit message:** `fix(D): replace read-modify-write in recordMessage with atomic increment_message_count RPC`

**After editing:** Run `npx tsc --noEmit`. It must exit 0 before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\supabase\migrations\002_atomic_rate_limit.sql`

**Fix E — Create the `increment_message_count` PostgreSQL function that `recordMessage` calls via RPC.**

**This file does not yet exist.** Create it as a new file. It must:
- Be idempotent (`CREATE OR REPLACE FUNCTION`)
- Accept `p_user_id uuid`
- Use `SECURITY DEFINER` so it can bypass RLS to atomically upsert the rate-limit row
- Use an atomic upsert (INSERT ... ON CONFLICT DO UPDATE) to avoid race conditions
- Operate on the `rate_limit_tracking` table from `001_initial_schema.sql`

The complete new file:

```sql
-- Migration: 002_atomic_rate_limit
-- Date: 2026-05-04
-- Description: Adds increment_message_count RPC function for atomic rate-limit tracking.
--              Replaces the read-modify-write pattern in lib/rise/rate-limit.ts with
--              a single atomic upsert, preventing double-counting under concurrent requests.

CREATE OR REPLACE FUNCTION increment_message_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_cutoff timestamptz := now() - interval '60 minutes';
BEGIN
  -- Atomically insert a new window row or increment the existing one.
  -- A "current" window is one whose window_start is within the last 60 minutes.
  INSERT INTO rate_limit_tracking (user_id, window_start, message_count)
  VALUES (p_user_id, now(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    message_count = CASE
      WHEN rate_limit_tracking.window_start >= v_window_cutoff
        THEN rate_limit_tracking.message_count + 1
      ELSE 1
    END,
    window_start = CASE
      WHEN rate_limit_tracking.window_start >= v_window_cutoff
        THEN rate_limit_tracking.window_start
      ELSE now()
    END
  WHERE rate_limit_tracking.user_id = p_user_id;
END;
$$;
```

**Note on the ON CONFLICT target:** The `ON CONFLICT (user_id)` clause assumes `rate_limit_tracking.user_id` has a UNIQUE constraint. If the existing schema uses a different unique index (e.g., a composite key or the `id` primary key), adjust the conflict target to match. Check `001_initial_schema.sql` for the exact constraint name before applying. If no unique constraint on `user_id` exists, add `ALTER TABLE rate_limit_tracking ADD CONSTRAINT rate_limit_tracking_user_id_key UNIQUE (user_id);` above the function definition in this same migration file — do not modify `001_initial_schema.sql`.

**Commit message:** `fix(E): add 002_atomic_rate_limit.sql with increment_message_count RPC function`

**After creating:** Run `npx tsc --noEmit`. It must exit 0 before committing (SQL file does not affect TypeScript compilation, but run the check as a discipline gate).

---

### `C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json`

**Fix F — Add `"orchestration"` to the `exclude` array.**

**Pre-condition (MANDATORY):** Before making this edit, run the following grep and confirm it returns zero results:

```
grep -r "jsonwebtoken" lib/ app/ middleware.ts
```

If any result is returned, stop — Fix G must resolve those imports first. However, since Fix G removes the package (not imports — `jsonwebtoken` imports were confirmed absent in the audit), and the `orchestration/` exclusion is independent of the `jsonwebtoken` grep, the constraint in the spec is: only execute Fix F if the grep for `jsonwebtoken` in `lib/ app/ middleware.ts` returns zero results. Run the grep. If zero results: proceed. If non-zero: fix the imports first before proceeding with Fix F.

**Current `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Edit:** Change the `"exclude"` array from `["node_modules"]` to `["node_modules", "orchestration"]`.

The complete file after Fix F:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "orchestration"]
}
```

**Commit message:** `fix(F): exclude orchestration/ directory from TypeScript compilation`

**After editing:** Run `npx tsc --noEmit`. It must exit 0 before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\package.json`

**Fix G (part 1 of 2) — Remove `jsonwebtoken` and `@types/jsonwebtoken` from `package.json`.**

**Pre-condition (MANDATORY):** Before making this edit, run the following greps and confirm all return zero results:

```
grep -r "jsonwebtoken" lib/
grep -r "jsonwebtoken" app/
grep "jsonwebtoken" middleware.ts
```

If any result is returned, do not proceed — remove those imports first and commit them before this fix.

**Current `package.json` dependencies section (relevant lines):**
- `"jsonwebtoken": "9.x"` — remove this line
- `"@types/jsonwebtoken": "^9"` in devDependencies — remove this line

The complete file after Fix G:

```json
{
  "name": "risedial",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.x",
    "bcryptjs": "2.x",
    "next": "14.x",
    "next-pwa": "5.x",
    "openai": "4.x",
    "react": "18.x",
    "react-dom": "18.x",
    "resend": "3.x",
    "stripe": "^22.1.0",
    "tailwindcss": "3.x",
    "typescript": "5.x",
    "zod": "3.x"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.x",
    "postcss": "^8"
  }
}
```

**Commit message:** `fix(G): remove jsonwebtoken and @types/jsonwebtoken (no remaining imports)`

**After editing:** Run `npm install` to regenerate `package-lock.json`, then run `npx tsc --noEmit`. Both must succeed before committing.

---

### `C:\Users\Alexb\Documents\RiseDialapp\package-lock.json`

**Fix G (part 2 of 2) — Regenerate `package-lock.json` after removing `jsonwebtoken`.**

This file is NOT hand-edited. It is regenerated automatically by running:

```bash
npm install
```

after `package.json` has been updated in Fix G part 1. Do not manually edit `package-lock.json`.

The regenerated `package-lock.json` will no longer contain entries for `jsonwebtoken` or `@types/jsonwebtoken`.

**Stage both `package.json` AND the regenerated `package-lock.json` in the same commit as Fix G.**

**Commit message:** `fix(G): remove jsonwebtoken and @types/jsonwebtoken (no remaining imports)`

(Same commit as `package.json` — both files are staged together before this single commit.)

---

## Verification

After all 7 fixes are committed, verify the following:

- [ ] `npx tsc --noEmit` exits 0 with zero output after all fixes
- [ ] `npx next build` exits 0 after all fixes
- [ ] `lib/auth/session.ts` contains no string `"changeme-insecure-fallback"`
- [ ] `app/api/webhooks/stripe/route.ts` contains no `PREMIUM_PRODUCT_ID` string
- [ ] `lib/stripe/webhooks.ts` contains all 4 Stripe event handlers: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] `lib/stripe/webhooks.ts` contains the idempotency check (pre-insert into `webhook_events` BEFORE processing)
- [ ] `app/api/webhooks/stripe/route.ts` contains no inline handler functions (is a thin dispatcher only)
- [ ] `lib/rise/rate-limit.ts` `recordMessage` function calls `supabaseServer.rpc('increment_message_count', ...)` instead of read-modify-write
- [ ] `supabase/migrations/002_atomic_rate_limit.sql` exists and contains `CREATE OR REPLACE FUNCTION increment_message_count`
- [ ] `tsconfig.json` `exclude` array contains `"orchestration"`
- [ ] Grep for `jsonwebtoken` in `lib/` `app/` `middleware.ts` returns zero results (package removed, no imports remain)
- [ ] `git log --oneline` shows one commit per fix (Fix A through Fix G)
- [ ] Grep for `PREMIUM_PRODUCT_ID` returns zero results
- [ ] Grep for `createServerClient` returns zero results
- [ ] Grep for `recordRateLimitMessage` returns zero results
- [ ] Grep for `subscription.current_period_end` (not `items.data[0]`) returns zero results

---

## Failure Recovery

| Symptom | Recovery Action |
|---------|----------------|
| `npx tsc --noEmit` exits non-zero after a fix | Do NOT commit. Revert the edit to its pre-fix state, diagnose the TypeScript error, correct the fix, and re-run `npx tsc --noEmit` before re-attempting the commit. |
| Fix B or C causes `routeWebhookEvent` to not be found | Confirm the export is present in `lib/stripe/webhooks.ts` and the import path in `route.ts` is `@/lib/stripe/webhooks` (not `@/lib/stripe/config` or similar). |
| `002_atomic_rate_limit.sql` migration fails on `ON CONFLICT (user_id)` | The `rate_limit_tracking` table may not have a UNIQUE constraint on `user_id`. Add `ALTER TABLE rate_limit_tracking ADD CONSTRAINT rate_limit_tracking_user_id_key UNIQUE (user_id);` as the first statement in the migration file (before the function definition). Do not modify `001_initial_schema.sql`. |
| `npm install` after Fix G fails or produces lock conflicts | Run `npm install --package-lock-only` to regenerate only the lockfile without downloading packages, then inspect the error. If a transitive dependency of `jsonwebtoken` is also required by another package, `npm install` will retain it as a transitive dep — this is correct. Only the direct dependency entry is removed from `package.json`. |
| Fix G pre-condition grep finds `jsonwebtoken` imports | Locate each import, determine whether the importing file can be updated to use the custom JWT functions in `lib/auth/session.ts`, make that replacement, run `npx tsc --noEmit`, commit that replacement separately, and only then proceed with Fix G. |
| Fix F pre-condition grep finds `jsonwebtoken` imports | Same as above — resolve the imports before applying the tsconfig exclusion. |
| A fix introduces a regression in a previously passing fix | Run `git log --oneline` to identify which commit introduced the regression. Revert only that commit with `git revert <sha>`, re-apply the fix correctly, and re-commit. Do not amend previous commits. |
| `npx next build` fails after `npx tsc --noEmit` passes | Next.js build performs additional checks. Review the build output for the specific file and error. Apply a targeted fix as a new commit (Fix H, etc.) following the same atomic-commit discipline. |
