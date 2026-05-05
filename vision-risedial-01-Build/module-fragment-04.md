# Module Fragment 04 — Environment Variable Validation

## Role

You are an **implementation agent** responsible for Module 4 (M4) of the RiseDial production build pipeline. Your sole task is to introduce a single, zod-validated `env` object in `lib/env.ts` and replace every bare `process.env.*` reference in `lib/` and `app/api/` (except `lib/env.ts` itself and `lib/supabase/client.ts`) with `env.*` imported from `lib/env.ts`. You do not add features, rename symbols, change API response shapes, or touch any file not listed below.

---

## Context

```json
{
  "locked_tech": {
    "framework": "Next.js 14 App Router",
    "language": "TypeScript strict",
    "env_validation_library": "zod",
    "JWT_SECRET_min_length": 32,
    "STRIPE_SECRET_KEY_prefix": "sk_",
    "STRIPE_WEBHOOK_SECRET_prefix": "whsec_",
    "STRIPE_PRICE_prefix": "price_",
    "OPENAI_API_KEY_prefix": "sk-",
    "lib_env_ts_allowed_imports": ["zod"],
    "lib_supabase_client_must_not_import": "lib/env.ts"
  }
}
```

### Locked Constraints

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything.
3. Do not leave a partially-changed file — revert any speculative edits before moving on.
4. Do not add `tsconfig.tsbuildinfo` to `.gitignore` yet.
5. Do not skip ahead and add the env import in this fix — that creates a dependency on Module 4 which is not yet built. (N/A — this IS Module 4.)
6. Do not move: `verifyWebhookSignature` (it is already in the lib file).
7. Do not add `export const runtime = 'edge'` to Node.js-only routes.
8. No new product features may be added during this pipeline.
9. The Supabase schema (`001_initial_schema.sql`) is accepted as ground truth; no schema changes except the `increment_message_count` RPC function.
10. All fixes must preserve existing API contract shapes.
11. `jsonwebtoken` may be removed only after confirming zero remaining imports.
12. No UI changes.
13. No new features.
14. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
15. `lib/supabase/client.ts` does NOT import `lib/env.ts` — it is a browser-side module and must not import server-only code.
16. `lib/supabase/client.ts` must not import `lib/env.ts`.
17. `npx tsc --noEmit` must exit 0 after every commit in this module.
18. No API response shapes are changed (requests and responses for all routes remain identical).
19. Do not use `as string` for `Stripe.Invoice.customer` — this is a real union.
20. Every fix is committed independently before the next fix begins.
21. After every fix, run `npx tsc --noEmit` before committing.
22. No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` and `lib/supabase/client.ts`).
23. `.env.local` must be in `.gitignore`.
24. `.env.example` is committed to the repository.
25. Never use `as string` for `Stripe.Invoice.customer`.
26. Must use `--noEmit` not build for type checking.
27. Silent failure that results in an empty assistant message is not acceptable.

---

## What Must Be True After This Module

`lib/env.ts` exports a zod-validated `env` object with all 13 required environment variables, throwing a descriptive ZodError at startup if any are missing or malformed.

---

## Files to Change

Apply the 9 changes below **in order**. After each file is written, run `npx tsc --noEmit` and confirm it exits 0 before committing that file. Commit each file independently.

---

### C:\Users\Alexb\Documents\RiseDialapp\lib\env.ts

**Action:** Create new file (does not exist yet).

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Supabase (server-only)
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Auth
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),

  // Stripe secret keys
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', { message: 'STRIPE_SECRET_KEY must start with sk_' }),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', {
      message: 'STRIPE_WEBHOOK_SECRET must start with whsec_',
    }),

  // Stripe price IDs
  STRIPE_PRICE_MONTHLY: z
    .string()
    .startsWith('price_', {
      message: 'STRIPE_PRICE_MONTHLY must start with price_',
    }),
  STRIPE_PRICE_ANNUAL: z
    .string()
    .startsWith('price_', {
      message: 'STRIPE_PRICE_ANNUAL must start with price_',
    }),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z
    .string()
    .startsWith('price_', {
      message: 'STRIPE_PRICE_PREMIUM_MONTHLY_ADDON must start with price_',
    }),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z
    .string()
    .startsWith('price_', {
      message: 'STRIPE_PRICE_PREMIUM_ANNUAL_ADDON must start with price_',
    }),

  // OpenAI
  OPENAI_API_KEY: z
    .string()
    .startsWith('sk-', { message: 'OPENAI_API_KEY must start with sk-' }),

  // Public (also available server-side)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

---

### C:\Users\Alexb\Documents\RiseDialapp\.env.example

**Action:** Create new file (does not exist yet). Commit this file to the repository. It contains placeholder values only — no real secrets.

```
# Supabase (server-only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
JWT_SECRET=change-me-to-a-random-string-at-least-32-chars

# Stripe secret keys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe price IDs
STRIPE_PRICE_MONTHLY=price_your-monthly-price-id
STRIPE_PRICE_ANNUAL=price_your-annual-price-id
STRIPE_PRICE_PREMIUM_MONTHLY_ADDON=price_your-premium-monthly-addon-price-id
STRIPE_PRICE_PREMIUM_ANNUAL_ADDON=price_your-premium-annual-addon-price-id

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Public (available in browser and server)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://risedial.com
```

---

### C:\Users\Alexb\Documents\RiseDialapp\lib\supabase\server.ts

**Action:** Replace the two bare `process.env.*` reads with `env.*` imported from `lib/env.ts`. Remove the manual `if (!...)` guards — `env` is already validated at startup. Preserve all other code verbatim.

```typescript
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Supabase service role client.
 * Bypasses Row Level Security — use only in server-side API routes.
 * Never expose this client or its key to the browser.
 */
export const supabaseServer = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

---

### C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts

**Action:** Replace the top-level `process.env.JWT_SECRET` read with `env.JWT_SECRET` imported from `lib/env.ts`. All function bodies, exports, and helper functions remain verbatim.

```typescript
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const JWT_SECRET = env.JWT_SECRET;
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

---

### C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\config.ts

**Action:** Replace the four bare `process.env.*` reads with `env.*` imported from `lib/env.ts`. The `!` non-null assertions are removed because `env` is already validated. All exports and function signatures remain identical.

```typescript
import Stripe from 'stripe'
import { env } from '@/lib/env'

// Stripe client initialization
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Price ID constants (live values from environment variables)
export const PRICE_MONTHLY = env.STRIPE_PRICE_MONTHLY
export const PRICE_ANNUAL = env.STRIPE_PRICE_ANNUAL
export const PRICE_PREMIUM_MONTHLY_ADDON = env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON
export const PRICE_PREMIUM_ANNUAL_ADDON = env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON

// Plan prices map: plan_type → base price ID and premium add-on price ID
export const PLAN_PRICES: Record<
  'monthly' | 'annual',
  { base: string; premiumAddon: string }
> = {
  monthly: {
    base: PRICE_MONTHLY,
    premiumAddon: PRICE_PREMIUM_MONTHLY_ADDON,
  },
  annual: {
    base: PRICE_ANNUAL,
    premiumAddon: PRICE_PREMIUM_ANNUAL_ADDON,
  },
}

// Utility: get relevant price IDs for a given plan type and premium toggle
export function getPriceIds(
  planType: 'monthly' | 'annual',
  hasPremium: boolean
): { base: string; premiumAddon?: string } {
  const plan = PLAN_PRICES[planType]
  return {
    base: plan.base,
    ...(hasPremium ? { premiumAddon: plan.premiumAddon } : {}),
  }
}
```

---

### C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts

**Action:** Replace the five bare `process.env.*` reads with `env.*` imported from `lib/env.ts`. The `!` non-null assertions are removed because `env` is already validated. All function signatures, exports, logic, and comments remain identical.

```typescript
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'
import { env } from '@/lib/env'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getPlanTypeFromPriceId(priceId: string): 'monthly' | 'annual' {
  if (priceId === env.STRIPE_PRICE_MONTHLY) return 'monthly'
  if (priceId === env.STRIPE_PRICE_ANNUAL) return 'annual'
  throw new Error(`Unknown base price ID: ${priceId}`)
}

function detectPremiumItem(subscription: Stripe.Subscription): {
  hasPremiumMemory: boolean
  premiumItemId: string | null
} {
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (
      priceId === env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON ||
      priceId === env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON
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
      priceId === env.STRIPE_PRICE_MONTHLY ||
      priceId === env.STRIPE_PRICE_ANNUAL
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
    env.STRIPE_WEBHOOK_SECRET
  )
}

/**
 * Routes a verified Stripe.Event to the appropriate handler.
 * Handles exactly 4 event types:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_failed
 *
 * Unhandled event types are silently ignored.
 */
export async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
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

---

### C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\reset-request\route.ts

**Action:** Replace the two bare `process.env.*` reads (`RESEND_API_KEY` and `NEXT_PUBLIC_APP_URL`) with `env.*` and a local fallback pattern. `RESEND_API_KEY` is not in the validated schema (it is optional), so keep it as `process.env.RESEND_API_KEY`. Only `NEXT_PUBLIC_APP_URL` moves to `env.NEXT_PUBLIC_APP_URL`. The `?? 'https://risedial.com'` fallback is removed because `env` guarantees the value. All other code, imports, and response shapes remain verbatim.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';
import { supabaseServer } from '@/lib/supabase/server';
import { env } from '@/lib/env';

const resetRequestSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const parsed = resetRequestSchema.safeParse(body);
    if (!parsed.success) {
      // Return success to avoid leaking validation details that could aid enumeration
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up the user — but do NOT reveal whether the user exists
    let userId: string | null = null;
    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (!error && data) {
        userId = data.id as string;
      }
    } catch {
      // Swallow DB errors — always return success
    }

    if (userId) {
      // Generate cryptographically random token
      let rawToken: string;
      try {
        rawToken = crypto.randomBytes(32).toString('hex');
      } catch {
        // If token generation fails, return success without sending email
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Hash the token for storage (SHA-256)
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      // Expiry: 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      try {
        await supabaseServer
          .from('users')
          .update({
            password_reset_token: hashedToken,
            password_reset_expires: expiresAt,
          })
          .eq('id', userId);
      } catch {
        // Swallow DB errors — always return success
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Send reset email via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      const appBaseUrl = env.NEXT_PUBLIC_APP_URL;

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const resetLink = `${appBaseUrl}/reset-password?token=${rawToken}`;

          await resend.emails.send({
            from: 'RiseDial <noreply@risedial.com>',
            to: normalizedEmail,
            subject: 'Reset your RiseDial password',
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #111827;">Reset your password</h2>
                <p style="color: #374151;">
                  We received a request to reset the password for your RiseDial account.
                  Click the button below to choose a new password. This link expires in 1 hour.
                </p>
                <a
                  href="${resetLink}"
                  style="
                    display: inline-block;
                    margin: 24px 0;
                    padding: 12px 24px;
                    background-color: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                  "
                >
                  Reset Password
                </a>
                <p style="color: #6b7280; font-size: 14px;">
                  If you did not request a password reset, you can safely ignore this email.
                  Your password will not change.
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                  If the button above does not work, copy and paste this link into your browser:<br />
                  <span style="word-break: break-all;">${resetLink}</span>
                </p>
              </div>
            `,
          });
        } catch {
          // Swallow email errors — always return success
        }
      }
    }

    // Always return success regardless of whether the email existed
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Top-level catch — always return success to prevent user enumeration
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
```

---

### C:\Users\Alexb\Documents\RiseDialapp\app\api\subscription\checkout\route.ts

**Action:** Replace the two bare `process.env.NEXT_PUBLIC_APP_URL` reads in the `stripe.checkout.sessions.create` call with `env.NEXT_PUBLIC_APP_URL`. Add `import { env } from '@/lib/env'`. All other imports, logic, and response shapes remain verbatim.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById, updateUser } from '@/lib/db/users'
import { stripe, PLAN_PRICES } from '@/lib/stripe/config'
import { env } from '@/lib/env'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth gate — read user from JWT cookie
  const session = await getUserFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { user_id } = session

  // Parse and validate request body
  let planType: 'monthly' | 'annual'
  let hasPremiumAddon: boolean

  try {
    const body = await request.json()
    if (body.planType !== 'monthly' && body.planType !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid planType. Must be "monthly" or "annual".' },
        { status: 400 }
      )
    }
    if (typeof body.hasPremiumAddon !== 'boolean') {
      return NextResponse.json(
        { error: 'hasPremiumAddon must be a boolean.' },
        { status: 400 }
      )
    }
    planType = body.planType
    hasPremiumAddon = body.hasPremiumAddon
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  // Fetch full user record to get email and stripe_customer_id
  const user = await getUserById(user_id)
  if (!user) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    )
  }

  // Create or retrieve Stripe customer
  let stripeCustomerId = user.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id },
    })
    stripeCustomerId = customer.id

    // Persist the new customer ID back to the users table
    await updateUser(user_id, { stripe_customer_id: stripeCustomerId })
  }

  // Build line_items: base plan first, premium add-on second if requested
  const plan = PLAN_PRICES[planType]

  const lineItems: { price: string; quantity: number }[] = [
    {
      price: plan.base,
      quantity: 1,
    },
  ]

  if (hasPremiumAddon) {
    lineItems.push({
      price: plan.premiumAddon,
      quantity: 1,
    })
  }

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: lineItems,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/plan-selection`,
    metadata: {
      user_id,
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
```

---

### C:\Users\Alexb\Documents\RiseDialapp\.gitignore

**Action:** `.env.local` is already present in the existing `.gitignore`. No change is required. The file is listed here for completeness and to confirm it satisfies constraint 23. The complete current content (do not modify):

```
# dependencies
node_modules/

# next.js
.next/
out/

# env files — never commit secrets
.env
.env.local
.env*.local

# build output
build/
dist/

# misc
.DS_Store
*.pem
npm-debug.log*
```

---

## Verification

After all 9 files are written and committed (each independently after a passing `npx tsc --noEmit`), verify:

- [ ] `lib/env.ts` exists at `C:\Users\Alexb\Documents\RiseDialapp\lib\env.ts`
- [ ] `lib/env.ts` contains only `import { z } from 'zod'` as its sole import (zero project imports)
- [ ] `lib/env.ts` exports `const env = envSchema.parse(process.env)`
- [ ] `lib/env.ts` schema includes all 13 required variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON`, `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- [ ] `.env.example` exists at project root and lists all 13 required variables
- [ ] `.env.local` appears in `.gitignore`
- [ ] Grep for `process.env.` in `lib/` and `app/api/` (excluding `lib/env.ts` and `lib/supabase/client.ts`) returns zero results
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run dev` starts at localhost:3000 without throwing a ZodError when `.env.local` has all 13 vars
- [ ] Starting the app without `JWT_SECRET` set throws a ZodError with message `JWT_SECRET must be at least 32 characters`
- [ ] `lib/supabase/client.ts` does NOT import from `lib/env.ts`

---

## Failure Recovery

| Symptom | Recovery |
|---|---|
| `npx tsc --noEmit` fails after writing `lib/env.ts` with "Module not found: 'zod'" | Run `npm install zod` — zod must be listed in `dependencies` in `package.json`. |
| `npx tsc --noEmit` fails after writing `lib/supabase/server.ts` with "Cannot find module '@/lib/env'" | Confirm `lib/env.ts` was written first and `tsconfig.json` has `"paths": { "@/*": ["./*"] }`. |
| App throws ZodError at startup even with all 13 vars set | Check `.env.local` for typos in variable names or values that fail prefix validation (e.g. `STRIPE_SECRET_KEY` not starting with `sk_`). |
| Grep still finds `process.env.` in `app/api/subscription/checkout/route.ts` | Re-apply the checkout route file — both `success_url` and `cancel_url` template literals must use `env.NEXT_PUBLIC_APP_URL`. |
| `lib/supabase/client.ts` accidentally imports `lib/env.ts` | Revert `lib/supabase/client.ts` immediately — it is a browser-side module and must use `process.env.NEXT_PUBLIC_*` directly. Do not commit until the import is removed. |
| `verifyWebhookSignature` is moved or renamed | Revert — constraint 6 prohibits moving this function. It must remain exported from `lib/stripe/webhooks.ts`. |
| `.env.example` is accidentally added to `.gitignore` | Remove the `.env.example` line from `.gitignore` — `.env.example` must be committed to the repository (constraint 24). |
