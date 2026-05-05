# Module Fragment 01: Build Error Resolution

## Role

A developer (or AI agent acting as developer) executes this module: running `npx tsc --noEmit`, reading all errors before touching any file, applying minimal targeted fixes to each error one at a time, and committing a single clean-build commit.

## Context

**Locked technology values:**
- framework: Next.js 14 App Router
- language: TypeScript 5 (strict: true, noEmit: true)
- auth: Custom HS256 JWT via `lib/auth/session.ts` (no jsonwebtoken, uses `crypto.subtle`)
- payments: Stripe SDK v22
- database: Supabase (supabase-js 2.x)
- runtime: Node.js 20
- package_manager: npm

**Locked constraints:**
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
16. No real network calls in unit tests. No real database.
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
27. This module is strictly read-only for Module 2. No source files may be modified. No git commits are made. (Module 2 constraint — does not apply here.)
28. Do not speculate. Escalate to Module 2 (Codebase Audit). Document the error in the Module 2 audit under Area 1.
29. Do not use `as string` for `Stripe.Invoice.customer` — this is a real union.
30. Every fix is committed independently before the next fix begins.
31. After every fix, run `npx tsc --noEmit` before committing to ensure the fix did not introduce a type regression.
32. Only execute Fix F (remove `jsonwebtoken` from `package.json`) if grep for `jsonwebtoken` in `lib/` `app/` `middleware.ts` returns zero results.
33. No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` and `lib/supabase/client.ts`).
34. `.env.local` must be in `.gitignore`.
35. `.env.example` is committed to the repository.
36. Tests that import files which depend on `lib/env.ts` must either set test env vars in `vitest.config.ts` or mock `lib/env.ts`.
37. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
38. E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing.
39. The Supabase schema (`001_initial_schema.sql`) is accepted as the ground truth; no schema changes except the `increment_message_count` RPC function for atomic rate limiting.
40. `jsonwebtoken` may be removed from `package.json` only after confirming it has zero remaining imports in the codebase.
41. No test makes a real database call, real Stripe API call, or real OpenAI API call.
42. Do not add `export const runtime = 'edge'` to Node.js-only routes.
43. Never use `as string` for `Stripe.Invoice.customer`.
44. Must use `--noEmit` not build for type checking; `next build` will obscure type errors behind bundler output.
45. Do not read files in `orchestration/` — they will be excluded from tsconfig compilation in Module 3.
46. Silent failure that results in an empty assistant message is not acceptable.

## What Must Be True After This Module

Both `npx tsc --noEmit` and `npx next build` exit 0 with zero errors before any other work begins.

## Files to Change

### C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json

**Current state (read from disk):**

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

**When to edit this file:** Only if `npx tsc --noEmit` (after deleting `tsconfig.tsbuildinfo`) reports:

```
error TS2688: Cannot find type definition file for 'testing-library__jest-dom'.
```

**Branch A — `node_modules/@types/testing-library__jest-dom` directory exists:**

Add `"types": ["node", "react", "react-dom"]` to `compilerOptions`. Complete edited file:

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
    },
    "types": ["node", "react", "react-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Branch B — `node_modules/@types/testing-library__jest-dom` does NOT exist:**

Do NOT edit `tsconfig.json`. Instead run:
```bash
npm install --save-dev @types/testing-library__jest-dom
```
Then re-run `npx tsc --noEmit`.

**If `orchestration/` directory causes tsc errors (any error with path containing `orchestration/`):**

Add `"orchestration"` to the `exclude` array. Complete edited file (shown with Branch A types fix also applied — apply only what is needed):

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
    },
    "types": ["node", "react", "react-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "orchestration"]
}
```

**If no tsc errors relate to `@types/testing-library__jest-dom` or `orchestration/`:** Leave `tsconfig.json` unchanged.

After any edit to `tsconfig.json`, immediately run `npx tsc --noEmit` before committing.

### C:\Users\Alexb\Documents\RiseDialapp\tsconfig.tsbuildinfo

**Action: Delete this file unconditionally before running any tsc command.**

This is a stale incremental build cache. Deleting it is always safe and is required as the first step.

```bash
# Run this command first, before any tsc invocation:
Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
# or on bash:
rm -f tsconfig.tsbuildinfo
```

**Do NOT add `tsconfig.tsbuildinfo` to `.gitignore` in this module.** That is handled in Module 3.

**Do NOT commit `tsconfig.tsbuildinfo`.** It must not appear in the git commit for this module. Verify with `git status` that it is absent from staged files before committing.

The verification criterion for this file is: it does not exist in the project root after this module completes.

### C:\Users\Alexb\Documents\RiseDialapp\package.json

**Current state (read from disk):**

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
    "jsonwebtoken": "9.x",
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
    "@types/jsonwebtoken": "^9",
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

**When to edit this file:** Only after confirming that `jsonwebtoken` has zero remaining imports anywhere in `lib/`, `app/`, and `middleware.ts`.

**Verification command before editing:**
```bash
# PowerShell:
Select-String -Path "lib\**\*.ts","app\**\*.ts","app\**\*.tsx","middleware.ts" -Pattern "jsonwebtoken" -Recurse
# bash:
grep -r "jsonwebtoken" lib/ app/ middleware.ts
```

If this returns zero results, remove `jsonwebtoken` from `dependencies` and `@types/jsonwebtoken` from `devDependencies`. Complete edited file:

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

After editing `package.json`, run `npm install` to regenerate `package-lock.json`, then run `npx tsc --noEmit` to confirm no regression.

**If `jsonwebtoken` imports still exist anywhere:** Do NOT edit `package.json`. Leave it unchanged and fix the imports first.

### C:\Users\Alexb\Documents\RiseDialapp\package-lock.json

**Do not edit this file manually.** It is regenerated automatically by `npm install`.

This file changes only as a side effect of removing `jsonwebtoken` and `@types/jsonwebtoken` from `package.json` and then running:

```bash
npm install
```

If `package.json` is not changed (because `jsonwebtoken` imports still exist), `package-lock.json` is also not changed.

**When staging for commit:** Include `package-lock.json` only if `package.json` was also changed and `npm install` was run. Stage it with:

```bash
git add package.json package-lock.json
```

### C:\Users\Alexb\Documents\RiseDialapp\middleware.ts

**Current state (read from disk):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('risedial_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const payload = await verifySession(sessionCookie.value);

  if (!payload) {
    return NextResponse.json(
      { error: 'Your session has expired. Sign in to continue.' },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.user_id);
  requestHeaders.set('x-subscription-status', payload.subscription_status);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/memory/:path*',
    '/api/subscription/:path*',
    '/api/chats/:path*',
    '/api/user/:path*',
  ],
};
```

**Assessment:** This file is already correct as-is. It imports only from `next/server` and `@/lib/auth/session`. It does not import `jsonwebtoken`. It does not have `export const runtime`. The `export const config` here is middleware configuration (valid in Next.js middleware), not Pages Router route config. No changes required unless `npx tsc --noEmit` reports a specific error on a specific line in this file.

**If tsc reports an error in this file:** Read the exact error, line number, and message before touching anything. Apply only the minimal fix for that specific error. Do not change any surrounding logic.

### C:\Users\Alexb\Documents\RiseDialapp\app\api\webhooks\stripe\route.ts

**Current state (read from disk):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Idempotency check: return 200 immediately if this event was already processed
  const { data: existingEvent } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ received: true })
  }

  // Insert event into webhook_events BEFORE processing (prevents double-processing on crash)
  await supabaseServer.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.subscription || !session.customer) {
          break
        }

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

        // Determine user_id from checkout session metadata
        const userId = session.metadata?.user_id
        if (!userId) break

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

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        let basePriceId: string
        try {
          basePriceId = getBasePriceId(subscription)
        } catch {
          break
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

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

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

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id ?? null

        if (!customerId) break

        await supabaseServer
          .from('users')
          .update({
            subscription_status: 'lapsed',
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        // Unhandled event type — ignore silently
        break
    }
  } catch {
    // Never return raw errors — always return received: true
  }

  return NextResponse.json({ received: true })
}
```

**Known type error in this file — `invoice.payment_failed` handler, `invoice.customer` cast:**

The line:
```typescript
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id ?? null
```

The cast `as Stripe.Customer` is incorrect because `invoice.customer` in Stripe SDK v22 is typed as `string | Stripe.Customer | Stripe.DeletedCustomer | null`. Casting it `as Stripe.Customer` when it could be `Stripe.DeletedCustomer` is unsafe and may produce a TypeScript error depending on strict settings.

**Minimal fix — replace only the `customerId` assignment in the `invoice.payment_failed` case:**

Replace:
```typescript
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id ?? null
```

With:
```typescript
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null
```

The `.id` property exists on both `Stripe.Customer` and `Stripe.DeletedCustomer`, so no cast is needed. The `?` handles the `null` case. This is the correct narrowing for the full union.

**Complete corrected file (only this one line changed — all other code is identical):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Idempotency check: return 200 immediately if this event was already processed
  const { data: existingEvent } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ received: true })
  }

  // Insert event into webhook_events BEFORE processing (prevents double-processing on crash)
  await supabaseServer.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.subscription || !session.customer) {
          break
        }

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

        // Determine user_id from checkout session metadata
        const userId = session.metadata?.user_id
        if (!userId) break

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

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        let basePriceId: string
        try {
          basePriceId = getBasePriceId(subscription)
        } catch {
          break
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

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

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

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null

        if (!customerId) break

        await supabaseServer
          .from('users')
          .update({
            subscription_status: 'lapsed',
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        // Unhandled event type — ignore silently
        break
    }
  } catch {
    // Never return raw errors — always return received: true
  }

  return NextResponse.json({ received: true })
}
```

After applying this fix, immediately run `npx tsc --noEmit` before committing.

### C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts

**Current state (read from disk):**

```typescript
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback";
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

**Known potential type error — `sigBytes.buffer` in `hmacVerify`:**

The line:
```typescript
  return crypto.subtle.verify("HMAC", cryptoKey, sigBytes.buffer as ArrayBuffer, dataBytes);
```

In some TypeScript configurations, `Uint8Array.buffer` is typed as `ArrayBuffer | SharedArrayBuffer`. The `as ArrayBuffer` cast is the correct minimal fix and is already present in the file. If tsc reports an error here, the cast is already applied — verify the exact error text before touching anything.

**Assessment:** This file is already correct as-is. The `as ArrayBuffer` cast is present on line 62. No changes are required unless `npx tsc --noEmit` reports a specific error at a specific line in this file.

**If tsc reports an error on the `sigBytes.buffer` line:** The cast `as ArrayBuffer` is already in place. If the error persists, read the exact error message — it may be a different issue. Apply only the minimal fix for the exact error reported.

**Do not import `lib/env.ts` into this file.** Constraint 7 explicitly prohibits this in Module 1.

**Do not remove `jsonwebtoken` imports from this file** — this file has no `jsonwebtoken` import (confirmed by reading the file). Do not add one.

## Verification

- [ ] `npx tsc --noEmit` exits with code 0 and produces zero lines of output
- [ ] `npx next build` exits with code 0 and shows no compilation errors in terminal output
- [ ] `tsconfig.tsbuildinfo` is deleted from the project root
- [ ] `git log --oneline` shows exactly one new commit with message containing 'fix: resolve all TypeScript errors and next build blockers'
- [ ] No speculative code changes exist — `git diff HEAD~1` shows only type fixes, no logic changes
- [ ] No files are created — only existing files are edited

## Failure Recovery

- If `npx tsc --noEmit` reports `Cannot find type definition file for 'testing-library__jest-dom'` after deleting `tsconfig.tsbuildinfo`: Check whether `node_modules/@types/testing-library__jest-dom` exists. If it does, add `"types": ["node", "react", "react-dom"]` to `compilerOptions` in `tsconfig.json`. If it does not exist, run `npm install --save-dev @types/testing-library__jest-dom`.

- If `npx tsc --noEmit` reports errors in a file under the `orchestration/` directory: Do not fix those errors. Add `"orchestration"` to the `exclude` array in `tsconfig.json`. Run `npx tsc --noEmit` again to confirm those errors are gone.

- If `npx tsc --noEmit` reports `Type 'string | Customer | DeletedCustomer | null' is not assignable` on `invoice.customer` in `app/api/webhooks/stripe/route.ts`: Replace `(invoice.customer as Stripe.Customer)?.id ?? null` with `invoice.customer?.id ?? null` — the `.id` property is present on all non-string, non-null members of the union, so no cast is needed.

- If `npx tsc --noEmit` reports `Argument of type 'ArrayBuffer | SharedArrayBuffer' is not assignable to parameter of type 'ArrayBuffer'` in `lib/auth/session.ts` line 62: The cast `as ArrayBuffer` is already in the file — verify you are reading the current file on disk, not a stale editor view. If the error still appears, read the exact tsc output; it may be referencing a different location.

- If `npx next build` fails with `export const config` error in an App Router file other than `app/api/webhooks/stripe/route.ts`: Open the indicated file, remove the `export const config = { ... }` block entirely, save, and re-run `npx next build`. Do not add `export const runtime = 'edge'` as a replacement unless the route is confirmed Edge-compatible (no bcryptjs, no Node-only built-ins).

- If `npx next build` exits 0 but `npx tsc --noEmit` subsequently exits 1: A fix applied during the `next build` phase introduced a type regression. Run `git diff` to identify the change, revert it, and find the minimal fix that satisfies both commands.

- If `git commit` is rejected by a pre-commit hook: Read the hook error output. Fix the reported issue (lint error, format error, etc.), re-stage the corrected files, and create a new commit. Do not use `--no-verify`.

- If `grep -r "jsonwebtoken" lib/ app/ middleware.ts` returns results after the tsc fixes: Do not remove `jsonwebtoken` from `package.json`. The remaining imports must be replaced with calls to `verifySession` or `createSession` from `lib/auth/session.ts` first. Only remove from `package.json` after grep returns zero results.
