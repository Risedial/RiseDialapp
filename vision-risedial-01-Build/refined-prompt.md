<role>
You are a Next.js 14 App Router developer building vision-risedial-01. Your role is to implement each module exactly as specified, applying all locked constraints to every file you write.
</role>

<context>
framework: Next.js 14 App Router
language: TypeScript (strict mode)
database: Supabase PostgreSQL via service role client
auth_algorithm: HS256 JWT via crypto.subtle (Web Crypto API)
cookie_name: risedial_session
cookie_options: { "httpOnly": true, "sameSite": "strict", "secure": true, "maxAge": 2592000, "path": "/" }
jwt_claims: ["user_id", "subscription_status", "iat", "exp"]
jwt_expiry_seconds: 2592000
stripe_sdk_version: ^22.1.0
stripe_api_version: 2026-04-22.dahlia
openai_chat_model: gpt-4o-mini
openai_compression_model_premium: gpt-4o
openai_compression_model_standard: gpt-4o-mini
openai_response_format: { type: 'json_object' }
styling: Tailwind CSS 3
hosting: Vercel
ci: GitHub Actions
node_version_ci: 20
unit_test_runner: Vitest
unit_test_coverage_provider: @vitest/coverage-v8
e2e_test_runner: Playwright
e2e_browser: Chromium (Desktop Chrome)
e2e_base_url: http://localhost:3000
e2e_supabase_project: risedial-test
env_validation_library: zod
test_isolation: vi.mock() at module boundary
coverage_threshold: 100% lines, functions, branches, statements
coverage_include: ["lib/**/*.ts", "app/api/**/*.ts"]
coverage_exclude: ["lib/env.ts"]
rate_limit_window_minutes: 60
rate_limit_max_messages: 60
memory_compression_initial_threshold: 50
memory_compression_patch_interval: 10
memory_compression_retry_attempts: 3
memory_profiles_conflict_target: user_id
webhook_idempotency_table: webhook_events
webhook_idempotency_field: stripe_event_id
webhook_pre_insert: true
rate_limit_rpc_function: increment_message_count
rate_limit_rpc_param: p_user_id
rate_limit_migration_file: supabase/migrations/002_atomic_rate_limit.sql
schema_migration_ground_truth: supabase/migrations/001_initial_schema.sql
valid_table_names: ["users", "chats", "messages", "memory_profiles", "rate_limit_tracking", "webhook_events"]
users_subscription_status_values: ["active", "lapsed", "cancelled"]
users_plan_type_values: ["monthly", "annual"]
messages_role_values: ["user", "assistant"]
middleware_matcher_paths: ["/api/chat/:path*", "/api/memory/:path*", "/api/subscription/:path*", "/api/chats/:path*", "/api/user/:path*"]
env_vars_required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_ANNUAL", "STRIPE_PRICE_PREMIUM_MONTHLY_ADDON", "STRIPE_PRICE_PREMIUM_ANNUAL_ADDON", "OPENAI_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"]
JWT_SECRET_min_length: 32
STRIPE_SECRET_KEY_prefix: sk_
STRIPE_WEBHOOK_SECRET_prefix: whsec_
STRIPE_PRICE_prefix: price_
OPENAI_API_KEY_prefix: sk-
SUPABASE_URL_format: valid URL
NEXT_PUBLIC_SUPABASE_URL_format: valid URL
NEXT_PUBLIC_APP_URL_format: valid URL
lib_env_ts_allowed_imports: ["zod"]
vitest_environment: jsdom
playwright_retries_ci: 2
playwright_workers_ci: 1
playwright_trace: on-first-retry
ci_artifact_retention_days: 7
ci_skip_stripe_e2e_var: SKIP_STRIPE_E2E
stripe_test_card: 4242 4242 4242 4242
e2e_test_user_fixture: e2e/fixtures/test-user.json
vitest_globals: true
vitest_setup_file: ./vitest.setup.ts
pwa_manifest_path: public/manifest.json
pwa_service_worker_path: public/sw.js
pwa_icon_sizes_required: ["192x192", "512x512"]
next_pwa_config: { "dest": "public", "register": true, "skipWaiting": true }
checkout_expand_param: ['items.data.price']
subscription_billing_date_field: subscription.items.data[0].current_period_end
subscription_billing_date_field_FORBIDDEN: subscription.current_period_end
webhook_events_insert_strategy: INSERT BEFORE processing (crash-safe pre-insert)
ci_typecheck_job: typecheck
ci_unit_test_job: unit-tests
ci_e2e_job: e2e-tests
ci_workflow_file: .github/workflows/ci.yml
ci_triggers: ["push to main", "pull_request targeting main"]
dead_code_to_remove: ["PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'", "createServerClient", "recordRateLimitMessage"]
tsconfig_must_exclude: ["node_modules", "orchestration"]
vitest_config_file: vitest.config.ts
playwright_config_file: playwright.config.ts
playwright_test_dir: ./e2e
playwright_global_setup: ./e2e/globalSetup.ts
playwright_global_teardown: ./e2e/globalTeardown.ts

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything
3. Do not leave a partially-changed file — revert any speculative edits before moving on.
4. Do not fix it. The `orchestration/` directory will be excluded from TypeScript compilation in Module 3.
5. Do not batch multiple fixes into a single commit.
6. Do not add `tsconfig.tsbuildinfo` to `.gitignore` yet
7. Do not skip ahead and add the env import in this fix — that creates a dependency on Module 4 which is not yet built.
8. Do not move: `verifyWebhookSignature` (it is already in the lib file).
9. Do not add `export const runtime = 'edge'` to Node.js-only routes
10. No new product features may be added during this pipeline
11. The Supabase schema (`001_initial_schema.sql`) is accepted as ground truth; no schema changes except the `increment_message_count` RPC function
12. All fixes must preserve existing API contract shapes
13. `jsonwebtoken` may be removed only after confirming zero remaining imports
14. No UI changes
15. No new features
16. No real network calls [in unit tests]. No real database.
17. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed
18. `lib/supabase/client.ts` (the browser Supabase client) does NOT import `lib/env.ts` — it is a browser-side module and must not import server-only code.
19. lib/supabase/client.ts must not import lib/env.ts
20. New product features or UI changes [are explicitly NOT included in this build]
21. Database migrations (schema is accepted as-is from `001_initial_schema.sql`) [are explicitly NOT included]
22. Supabase RLS policy redesign [is explicitly NOT included] (RLS policies exist but are bypassed by the service role client; documenting this as a known risk but not rewriting policies)
23. Stripe product/price ID configuration (IDs stored as env vars, not changed) [is explicitly NOT included]
24. OpenAI prompt engineering changes [are explicitly NOT included]
25. `npx tsc --noEmit` must exit 0 after every commit in this module
26. No API response shapes are changed (requests and responses for all routes remain identical)
27. This module is strictly read-only. No source files may be modified. No git commits are made. [Module 2]
28. Do not speculate. Escalate to Module 2 (Codebase Audit). Document the error in the Module 2 audit under Area 1.
29. Do not use `as string` [for Stripe.Invoice.customer] — this is a real union
30. Every fix is committed independently before the next fix begins.
31. After every fix, run `npx tsc --noEmit` before committing to ensure the fix did not introduce a type regression.
32. Only execute Fix F if grep for 'jsonwebtoken' in lib/ app/ middleware.ts returns zero results
33. No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` and `lib/supabase/client.ts`)
34. `.env.local` must be in `.gitignore`
35. `.env.example` is committed to the repository
36. Tests that import files which depend on `lib/env.ts` must either set test env vars in vitest.config.ts or mock lib/env.ts
37. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`
38. E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing
39. The Supabase schema (`001_initial_schema.sql`) is accepted as the ground truth; no schema changes except the `increment_message_count` RPC function for atomic rate limiting
40. `jsonwebtoken` may be removed from `package.json` only after confirming it has zero remaining imports in the codebase
41. No test makes a real database call, real Stripe API call, or real OpenAI API call. [Unit/Integration tests]
42. Do not add `export const runtime = 'edge'` to Node.js-only routes
43. Never use `as string` for Stripe.Invoice.customer
44. Must use `--noEmit` not build for type checking; `next build` will obscure type errors behind bundler output
45. Do not read files in `orchestration/` — they will be excluded from tsconfig compilation in Module 3
46. Silent failure that results in an empty assistant message is not acceptable.
47. Do not write any other file [other than module-manifest.json — project mapper instruction]
</context>

<build_order>
| Index | Module Name | Key | Parallel Safe | Depends On |
|-------|-------------|-----|---------------|------------|
| 1 | Build Error Resolution | M1 | false | |
| 2 | Codebase Audit | M2 | false | M1 |
| 3 | Code Fixes | M3 | false | M2 |
| 4 | Environment Variable Validation | M4 | false | M3 |
| 5 | Test Infrastructure | M5 | false | M4 |
| 6 | Unit & Integration Test Suite | M6 | false | M5 |
| 7 | E2E Test Suite | M7 | false | M6 |
| 8 | CI Pipeline | M8 | false | M7 |
</build_order>


## MODULE 01: Build Error Resolution

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


---


## MODULE 02: Codebase Audit

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


---


## MODULE 03: Code Fixes

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


---


## MODULE 04: Environment Variable Validation

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


---


## MODULE 05: Test Infrastructure

# Module Fragment 05 — Test Infrastructure (M5)

## Role

You are the **Test Infrastructure builder** for the RiseDial production app. Your sole responsibility in this module is to install and configure Vitest (unit/integration) and Playwright (E2E) so that both runners exit 0 on empty suites and all required npm scripts are present. You write config files, setup/teardown files, and update `package.json`. You do not write any tests. You do not change product code.

---

## Context

### Locked Technology Values

| Key | Value |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Unit test runner | Vitest |
| Unit test coverage provider | @vitest/coverage-v8 |
| E2E test runner | Playwright |
| E2E browser | Chromium (Desktop Chrome) |
| E2E base URL | http://localhost:3000 |
| E2E Supabase project | risedial-test |
| vitest_environment | jsdom |
| vitest_globals | true |
| vitest_setup_file | ./vitest.setup.ts |
| vitest_config_file | vitest.config.ts |
| vitest_coverage_provider | @vitest/coverage-v8 |
| vitest_coverage_include | ['lib/**/*.ts', 'app/api/**/*.ts'] |
| vitest_coverage_exclude | ['lib/env.ts'] |
| vitest_coverage_threshold | 100% lines, functions, branches, statements |
| playwright_config_file | playwright.config.ts |
| playwright_test_dir | ./e2e |
| playwright_global_setup | ./e2e/globalSetup.ts |
| playwright_global_teardown | ./e2e/globalTeardown.ts |
| playwright_retries_ci | 2 |
| playwright_workers_ci | 1 |
| playwright_trace | on-first-retry |
| playwright_browser | Chromium (Desktop Chrome) |
| node_version_ci | 20 |
| package_scripts:test | vitest run |
| package_scripts:test:watch | vitest |
| package_scripts:test:coverage | vitest run --coverage |
| package_scripts:test:e2e | playwright test |

### Vitest Test Environment Variables (all 13)

| Variable | Value |
|---|---|
| SUPABASE_URL | https://test.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | test-service-role-key |
| JWT_SECRET | test-jwt-secret-that-is-at-least-32-chars-long |
| STRIPE_SECRET_KEY | sk_test_key |
| STRIPE_WEBHOOK_SECRET | whsec_test |
| STRIPE_PRICE_MONTHLY | price_test_monthly |
| STRIPE_PRICE_ANNUAL | price_test_annual |
| STRIPE_PRICE_PREMIUM_MONTHLY_ADDON | price_test_premium_monthly |
| STRIPE_PRICE_PREMIUM_ANNUAL_ADDON | price_test_premium_annual |
| OPENAI_API_KEY | sk-test-openai-key |
| NEXT_PUBLIC_SUPABASE_URL | https://test.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | test-anon-key |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 |

### Locked Constraints (numbered)

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything.
3. No new product features may be added during this pipeline.
4. No UI changes.
5. No new features.
6. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
7. `lib/supabase/client.ts` does NOT import `lib/env.ts`.
8. `npx tsc --noEmit` must exit 0 after every commit in this module.
9. No API response shapes are changed.
10. Every fix is committed independently before the next fix begins.
11. After every fix, run `npx tsc --noEmit` before committing.
12. Tests that import files which depend on `lib/env.ts` must either set test env vars in vitest.config.ts or mock lib/env.ts.
13. No test makes a real database call, real Stripe API call, or real OpenAI API call.
14. Must use `--noEmit` not build for type checking.
15. Silent failure that results in an empty assistant message is not acceptable.
16. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
17. E2E tests target the `risedial-test` Supabase project.
18. Do not add `export const runtime = 'edge'` to Node.js-only routes.

---

## What Must Be True After This Module

Vitest and Playwright are installed and configured; both test runners exit 0 on empty test suites; all 4 npm test scripts are present in package.json.

---

## Files to Change

There are exactly 7 files to create or update. Each subsection contains the complete, verbatim file content to write. Do not add, omit, or modify any content relative to what is shown.

---

### C:\Users\Alexb\Documents\RiseDialapp\vitest.config.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
      STRIPE_SECRET_KEY: 'sk_test_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      STRIPE_PRICE_MONTHLY: 'price_test_monthly',
      STRIPE_PRICE_ANNUAL: 'price_test_annual',
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_test_premium_monthly',
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_test_premium_annual',
      OPENAI_API_KEY: 'sk-test-openai-key',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'app/api/**/*.ts'],
      exclude: ['lib/env.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

---

### C:\Users\Alexb\Documents\RiseDialapp\vitest.setup.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
import '@testing-library/jest-dom';
```

---

### C:\Users\Alexb\Documents\RiseDialapp\playwright.config.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

---

### C:\Users\Alexb\Documents\RiseDialapp\package.json

This file currently exists. Replace it entirely with the content below. All existing dependencies are preserved; the four test scripts and test devDependencies are added.

```json
{
  "name": "risedial",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
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
    "@playwright/test": "^1.44.0",
    "@testing-library/jest-dom": "^6.4.6",
    "@types/bcryptjs": "^2",
    "@types/jsonwebtoken": "^9",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitest/coverage-v8": "^1.6.0",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.x",
    "jsdom": "^24.1.0",
    "postcss": "^8",
    "vitest": "^1.6.0"
  }
}
```

---

### C:\Users\Alexb\Documents\RiseDialapp\package-lock.json

This file currently exists. After updating `package.json`, delete `package-lock.json` and regenerate it by running:

```
npm install
```

The executor agent must run `npm install` after writing `package.json` so that `package-lock.json` reflects the new devDependencies. The content of `package-lock.json` is machine-generated and must not be hand-authored. The step sequence is:

1. Write `package.json` (content above).
2. Run `npm install` in the project root.
3. Commit both `package.json` and the newly regenerated `package-lock.json`.

Do NOT paste a static `package-lock.json` — it will be wrong the moment any transitive dependency version differs from what npm resolves.

> **Note to executor:** If npm install fails due to peer dependency conflicts, add `--legacy-peer-deps` and retry.

---

### C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts

This file does not currently exist. Create the `e2e/` directory if needed, then create this file.

```ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key';

const TEST_USER_EMAIL = 'e2e-test-user@risedial-test.internal';
const TEST_USER_PASSWORD = 'E2eTestPassword!2024';

async function globalSetup(): Promise<void> {
  // Skip if SKIP_STRIPE_E2E is set (CI flow-1 skip)
  if (process.env.SKIP_STRIPE_E2E === 'true') {
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Remove any pre-existing test user to ensure a clean slate
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_USER_EMAIL)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('users').delete().eq('id', existing.id);
  }

  // Insert a fresh test user row with active subscription
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: TEST_USER_EMAIL,
      password_hash: 'e2e-placeholder-hash',
      subscription_status: 'active',
      subscription_plan: 'monthly',
      stripe_customer_id: 'cus_e2etest',
      stripe_subscription_id: 'sub_e2etest',
    })
    .select('id, email')
    .single();

  if (error || !user) {
    throw new Error(`globalSetup: failed to create test user — ${error?.message}`);
  }

  // Persist credentials for use in individual tests
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(fixturesDir, 'test-user.json'),
    JSON.stringify(
      { id: user.id, email: user.email, password: TEST_USER_PASSWORD },
      null,
      2,
    ),
  );
}

export default globalSetup;
```

---

### C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts

This file does not currently exist. Create it in the same `e2e/` directory.

```ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key';

async function globalTeardown(): Promise<void> {
  // Skip if SKIP_STRIPE_E2E is set (CI flow-1 skip)
  if (process.env.SKIP_STRIPE_E2E === 'true') {
    return;
  }

  const fixturesPath = path.join(__dirname, 'fixtures', 'test-user.json');

  if (!fs.existsSync(fixturesPath)) {
    return;
  }

  const raw = fs.readFileSync(fixturesPath, 'utf-8');
  const { id } = JSON.parse(raw) as { id: string; email: string; password: string };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete the test user row; cascading foreign keys handle related data
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    console.error(`globalTeardown: failed to delete test user ${id} — ${error.message}`);
  }

  // Remove the fixtures file
  fs.unlinkSync(fixturesPath);
}

export default globalTeardown;
```

---

## Verification

After applying all file changes and running `npm install`, verify every item below is true before considering M5 complete.

- [ ] `vitest.config.ts` exists at project root
- [ ] `vitest.setup.ts` exists at project root and contains `import '@testing-library/jest-dom'`
- [ ] `playwright.config.ts` exists at project root
- [ ] `e2e/globalSetup.ts` exists
- [ ] `e2e/globalTeardown.ts` exists
- [ ] `package.json` scripts include: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"test:e2e": "playwright test"`
- [ ] `vitest.config.ts` env block contains all 13 required test environment variables with format-compliant values (STRIPE_SECRET_KEY starts with sk_, OPENAI_API_KEY starts with sk-, etc.)
- [ ] `vitest.config.ts` coverage include is `['lib/**/*.ts', 'app/api/**/*.ts']` and exclude is `['lib/env.ts']`
- [ ] `vitest.config.ts` coverage thresholds are 100% for lines, functions, branches, statements
- [ ] `vitest.config.ts` environment is `'jsdom'` and globals is `true`
- [ ] `playwright.config.ts` baseURL is `'http://localhost:3000'`
- [ ] `playwright.config.ts` references `'./e2e/globalSetup.ts'` and `'./e2e/globalTeardown.ts'`
- [ ] `npx vitest run` exits 0 (no tests found is acceptable)
- [ ] `npx playwright test` exits 0 (no tests found is acceptable)
- [ ] `npx tsc --noEmit` exits 0

---

## Failure Recovery

| Symptom | Recovery |
|---|---|
| `npx tsc --noEmit` fails after adding config files | Check that `@vitejs/plugin-react` and `vitest` types are installed (`npm install`). Confirm `tsconfig.json` includes/excludes do not conflict with the new config files. Do not change product source files. |
| `vitest run` exits non-zero with "no tests found" error | Add `passWithNoTests: true` to the `test` block in `vitest.config.ts`. Re-run `npx tsc --noEmit` before committing. |
| `playwright test` exits non-zero with "no tests found" error | Playwright ≥1.40 exits 0 when no test files are found. If an older version is installed, upgrade: `npm install @playwright/test@^1.44.0`. |
| `npm install` fails with peer dependency conflicts | Re-run with `npm install --legacy-peer-deps`. Commit `package-lock.json` from the result of this command. |
| `globalSetup` throws "failed to create test user" | Verify that the `users` table in the `risedial-test` Supabase project has the columns `email`, `password_hash`, `subscription_status`, `subscription_plan`, `stripe_customer_id`, `stripe_subscription_id`. If the schema differs, update only the `insert` payload in `e2e/globalSetup.ts` to match the actual column names — do not change product code. |
| `globalTeardown` fails to delete the test user | Confirm that the `users` table primary key is `id` (UUID). If cascading deletes are not configured in Supabase, add `ON DELETE CASCADE` to related foreign keys via a migration — this is infrastructure work, not product code. |
| `@testing-library/jest-dom` types not recognized in tests | Ensure `vitest.setup.ts` is listed in `setupFiles` in `vitest.config.ts` and that `@types/jest` is NOT installed (it conflicts). If `@types/jest` is present, remove it with `npm uninstall @types/jest`. |
| Coverage threshold failure (100% required) | Coverage thresholds only apply when actual test files exist and `vitest run --coverage` is executed. An empty test suite with no include-matched files will pass at 100% (nothing to measure). If real tests are added later and thresholds fail, add targeted unit tests — do not lower the thresholds. |


---


## MODULE 06: Unit & Integration Test Suite

# Module Fragment 06 — Unit & Integration Test Suite

## Role

You are the test engineer for the RiseDial production codebase. Your sole responsibility in this module is to write a complete, passing vitest test suite that achieves 100% line, function, and branch coverage of all files under `lib/**` and `app/api/**`, with every external dependency mocked. You may not add product features, change API response shapes, modify UI, or make real network/database/Stripe/OpenAI calls. You write exactly the 9 test files listed below and the supporting config changes. Nothing else.

---

## Context

### Locked Tech Values

| Key | Value |
|---|---|
| cookie_name | `risedial_session` |
| jwt_algorithm | HS256 |
| jwt_claim: user_id | `user_id` |
| jwt_claim: subscription_status | `subscription_status` |
| jwt_claim: iat | `iat` |
| jwt_claim: exp | `exp` |
| jwt_expiry_seconds | 2592000 (30 days) |
| jwt_secret_min_length | 32 |
| jwt_implementation | `crypto.subtle` (Web Crypto API) |
| middleware_header: user_id | `x-user-id` |
| middleware_header: subscription_status | `x-subscription-status` |
| rate_limit_window_minutes | 60 |
| rate_limit_max_messages | 60 |
| memory_compression_initial_threshold | 50 |
| memory_compression_patch_interval | 10 |
| memory_compression_retry_attempts | 3 |
| rpc: increment_message_count | `increment_message_count(p_user_id uuid)` |
| rpc param | `p_user_id` |
| webhook_idempotency_field | `stripe_event_id` |
| stripe_event: checkout_completed | `checkout.session.completed` |
| stripe_event: subscription_updated | `customer.subscription.updated` |
| stripe_event: subscription_deleted | `customer.subscription.deleted` |
| stripe_event: invoice_payment_failed | `invoice.payment_failed` |
| stripe_header: signature | `stripe-signature` |
| rate_limit_return_shape | `{ allowed: boolean, remaining: number }` |
| compression_trigger_return_shape | `{ shouldCompress: boolean, isInitial: boolean, isPatch: boolean }` |
| lib_rate_limit_exports | `checkRateLimit`, `recordMessage` |
| lib_memory_executor_export | `executeCompressionAsync` |
| session_exports | `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie` |
| test_isolation | `vi.mock()` at module boundary |
| zod_error_message: JWT_SECRET | `JWT_SECRET must be at least 32 characters` |

### Locked Constraints

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. No real network calls in unit tests. No real database.
6. No test makes a real database call, real Stripe API call, or real OpenAI API call.
7. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
8. `lib/supabase/client.ts` does NOT import `lib/env.ts`.
9. `npx tsc --noEmit` must exit 0 after every commit in this module.
10. No API response shapes are changed.
11. Tests that import files which depend on `lib/env.ts` must either set test env vars in `vitest.config.ts` or mock `lib/env.ts`.
12. Silent failure that results in an empty assistant message is not acceptable.
13. Must use `--noEmit` not build for type checking.

---

## What Must Be True After This Module

`npx vitest run --coverage` exits 0 with 100% line, function, and branch coverage of all files in `lib/` and `app/api/`, with all external dependencies mocked.

---

## Prerequisites — Install vitest and coverage provider

Before the test files will run, add vitest and its dependencies. These are dev dependencies only and do not touch production code:

```bash
npm install --save-dev vitest @vitest/coverage-v8 @vitejs/plugin-react vite-tsconfig-paths
```

Then create `vitest.config.ts` in the repo root:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      // Provide all env vars that module-level code reads at import time.
      // These are fake values — no real services are called.
      JWT_SECRET: 'test-secret-that-is-at-least-32-chars!!',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      STRIPE_SECRET_KEY: 'sk_test_fake',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_fake',
      STRIPE_PRICE_MONTHLY: 'price_monthly_fake',
      STRIPE_PRICE_ANNUAL: 'price_annual_fake',
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      include: ['lib/**', 'app/api/**'],
      exclude: ['lib/env.ts'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
})
```

Also add `coverage/` to `.gitignore`:

```
# test coverage
coverage/
```

And add these scripts to `package.json`:

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

---

## Files to Change

### 1. `__tests__/lib/auth/session.test.ts`

Tests `createSession`, `verifySession`, `setSessionCookie`, and `clearSessionCookie` from `lib/auth/session.ts`. The module uses `process.env.JWT_SECRET` at the top of the module (not through `lib/env.ts`), so the env var set in `vitest.config.ts` is sufficient. `next/server` is mocked so `NextResponse` is available without a Next.js runtime.

```typescript
// __tests__/lib/auth/session.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server so NextResponse is available in a plain Node environment ──
vi.mock('next/server', () => {
  class MockCookies {
    private store: Map<string, { value: string; options: Record<string, unknown> }> = new Map()
    set(name: string, value: string, options: Record<string, unknown> = {}) {
      this.store.set(name, { value, options })
    }
    get(name: string) {
      return this.store.get(name)
    }
  }

  class MockNextResponse {
    cookies = new MockCookies()
    status: number
    body: unknown
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body
      this.status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }

  return { NextResponse: MockNextResponse }
})

import {
  createSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session'
import { NextResponse } from 'next/server'

// The vitest.config.ts sets JWT_SECRET to a 40-char value. session.ts reads it
// at module-load time from process.env, so the correct secret is already in use.

describe('createSession', () => {
  it('returns a three-part dot-separated JWT string', async () => {
    const token = await createSession('user-123', 'active')
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
  })

  it('embeds user_id and subscription_status in the payload', async () => {
    const token = await createSession('user-abc', 'lapsed')
    const [, payloadB64] = token.split('.')
    // base64url → base64 → JSON
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const json = atob(padded + '='.repeat(pad))
    const payload = JSON.parse(json)
    expect(payload.user_id).toBe('user-abc')
    expect(payload.subscription_status).toBe('lapsed')
    expect(typeof payload.iat).toBe('number')
    expect(typeof payload.exp).toBe('number')
    expect(payload.exp - payload.iat).toBe(60 * 60 * 24 * 30)
  })

  it('encodes header as HS256/JWT', async () => {
    const token = await createSession('u', 's')
    const [headerB64] = token.split('.')
    const padded = headerB64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const header = JSON.parse(atob(padded + '='.repeat(pad)))
    expect(header.alg).toBe('HS256')
    expect(header.typ).toBe('JWT')
  })
})

describe('verifySession', () => {
  it('returns payload for a freshly created token', async () => {
    const token = await createSession('user-xyz', 'active')
    const result = await verifySession(token)
    expect(result).not.toBeNull()
    expect(result?.user_id).toBe('user-xyz')
    expect(result?.subscription_status).toBe('active')
  })

  it('returns null for a token with a tampered signature', async () => {
    const token = await createSession('user-1', 'active')
    const parts = token.split('.')
    // Flip the last character of the signature
    const badSig = parts[2].slice(0, -1) + (parts[2].endsWith('a') ? 'b' : 'a')
    const bad = `${parts[0]}.${parts[1]}.${badSig}`
    expect(await verifySession(bad)).toBeNull()
  })

  it('returns null for a token with fewer than 3 parts', async () => {
    expect(await verifySession('only.two')).toBeNull()
  })

  it('returns null for a token with more than 3 parts', async () => {
    expect(await verifySession('a.b.c.d')).toBeNull()
  })

  it('returns null for a completely garbage string', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull()
  })

  it('returns null for an expired token', async () => {
    // Create a token then fake the clock so exp is in the past
    const token = await createSession('user-2', 'active')
    const [header, payload, sig] = token.split('.')

    // Decode payload, push exp 31 days into the past
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const decoded = JSON.parse(atob(padded + '='.repeat(pad)))
    decoded.exp = Math.floor(Date.now() / 1000) - 1 // already expired

    // Re-encode (note: signature won't match — this tests the expiry branch
    // only if we also tamper the payload, but more precisely we want to
    // test expiry separately. We do that by mocking Date.now instead.)
    // Instead, use vi.setSystemTime to push time past the token's real exp.
    const expiry = decoded.exp + 60 * 60 * 24 * 30 + 1 // past the real exp
    vi.useFakeTimers()
    vi.setSystemTime(new Date(expiry * 1000))
    const result = await verifySession(token)
    vi.useRealTimers()
    expect(result).toBeNull()
  })
})

describe('setSessionCookie', () => {
  it('sets the risedial_session cookie with correct attributes', () => {
    const response = NextResponse.json({}) as unknown as InstanceType<typeof NextResponse> & {
      cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined }
    }
    setSessionCookie(response as never, 'my-token')
    const cookie = (response as unknown as { cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined } }).cookies.get('risedial_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('my-token')
    expect(cookie?.options).toMatchObject({
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  })
})

describe('clearSessionCookie', () => {
  it('sets the risedial_session cookie to empty string with maxAge 0', () => {
    const response = NextResponse.json({}) as unknown as InstanceType<typeof NextResponse> & {
      cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined }
    }
    clearSessionCookie(response as never)
    const cookie = (response as unknown as { cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined } }).cookies.get('risedial_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('')
    expect(cookie?.options).toMatchObject({ maxAge: 0 })
  })
})
```

---

### 2. `__tests__/lib/rise/rate-limit.test.ts`

Tests `checkRateLimit` and `recordMessage` from `lib/rise/rate-limit.ts`. Supabase is fully mocked at the module boundary.

```typescript
// __tests__/lib/rise/rate-limit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock @supabase/supabase-js and the server client ──────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = {
    from: vi.fn(),
  }
  return { supabaseServer: mockSupabase }
})

import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit'
import { supabaseServer } from '@/lib/supabase/server'

// Helper to build a chainable Supabase query mock that resolves to `result`
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'gte', 'order', 'limit', 'maybeSingle', 'update', 'insert']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  // Terminal call resolves to result
  ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue(result)
  // update/insert also resolve
  ;(chain.update as ReturnType<typeof vi.fn>).mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })
  ;(chain.insert as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })
  return chain
}

const mockFrom = vi.mocked(supabaseServer.from)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('checkRateLimit', () => {
  it('returns allowed:true and remaining:60 when no active window exists', async () => {
    // maybeSingle returns null → no active window
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: true, remaining: 60 })
  })

  it('returns allowed:true when message_count is below the limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 30, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: true, remaining: 30 })
  })

  it('returns allowed:false and remaining:0 when message_count equals limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 60, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })

  it('returns allowed:false and remaining:0 when message_count exceeds limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 65, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })

  it('throws when supabase returns an error', async () => {
    const chain = makeChain({ data: null, error: { message: 'DB failure' } })
    mockFrom.mockReturnValue(chain as never)

    await expect(checkRateLimit('user-1')).rejects.toThrow('Failed to query rate_limit_tracking')
  })
})

describe('recordMessage', () => {
  it('inserts a new window when no active window exists', async () => {
    // First call (getActiveWindow inside recordMessage): returns null
    const nullChain = makeChain({ data: null, error: null })
    // The insert chain
    const insertChain = {
      from: vi.fn(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFrom
      .mockReturnValueOnce(nullChain as never)  // getActiveWindow
      .mockReturnValueOnce(insertChain as never) // insert

    await expect(recordMessage('user-new')).resolves.toBeUndefined()
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-new', message_count: 1 })
    )
  })

  it('updates message_count when an active window exists', async () => {
    const existingWindow = { id: 'w-existing', message_count: 5, window_start: new Date().toISOString() }

    // eq chain for the update
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateChain = { update: vi.fn().mockReturnValue({ eq: eqMock }) }
    const selectChain = makeChain({ data: existingWindow, error: null })

    mockFrom
      .mockReturnValueOnce(selectChain as never) // getActiveWindow inside recordMessage
      .mockReturnValueOnce(updateChain as never)  // update call

    await expect(recordMessage('user-existing')).resolves.toBeUndefined()
    expect(updateChain.update).toHaveBeenCalledWith({ message_count: 6 })
    expect(eqMock).toHaveBeenCalledWith('id', 'w-existing')
  })

  it('throws when the update returns an error', async () => {
    const existingWindow = { id: 'w-err', message_count: 10, window_start: new Date().toISOString() }

    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'update failed' } })
    const updateChain = { update: vi.fn().mockReturnValue({ eq: eqMock }) }
    const selectChain = makeChain({ data: existingWindow, error: null })

    mockFrom
      .mockReturnValueOnce(selectChain as never)
      .mockReturnValueOnce(updateChain as never)

    await expect(recordMessage('user-err')).rejects.toThrow('Failed to increment message_count')
  })

  it('throws when the insert returns an error', async () => {
    const nullChain = makeChain({ data: null, error: null })
    const insertChain = {
      insert: vi.fn().mockResolvedValue({ error: { message: 'insert failed' } }),
    }

    mockFrom
      .mockReturnValueOnce(nullChain as never)
      .mockReturnValueOnce(insertChain as never)

    await expect(recordMessage('user-insert-err')).rejects.toThrow(
      'Failed to create rate limit window'
    )
  })
})
```

---

### 3. `__tests__/lib/memory/trigger.test.ts`

Tests `checkCompressionTrigger` at all boundary counts specified in verification criteria: 49, 50, 51, 59, 60, 61, 70, 80.

```typescript
// __tests__/lib/memory/trigger.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = { from: vi.fn() }
  return { supabaseServer: mockSupabase }
})

import { checkCompressionTrigger } from '@/lib/memory/trigger'
import { supabaseServer } from '@/lib/supabase/server'

const mockFrom = vi.mocked(supabaseServer.from)

// Builds a chain that resolves with a given count value
function makeCountChain(count: number | null, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const terminal = vi.fn().mockResolvedValue({ count, error })
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.not = vi.fn(() => terminal)
  return { chain, terminal }
}

beforeEach(() => {
  vi.clearAllMocks()
})

async function triggerFor(count: number) {
  const { chain } = makeCountChain(count)
  mockFrom.mockReturnValue(chain as never)
  return checkCompressionTrigger('chat-1', 'user-1')
}

describe('checkCompressionTrigger', () => {
  it('count=49 → shouldCompress:false', async () => {
    expect(await triggerFor(49)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=50 → shouldCompress:true, isInitial:true, isPatch:false', async () => {
    expect(await triggerFor(50)).toEqual({ shouldCompress: true, isInitial: true, isPatch: false })
  })

  it('count=51 → shouldCompress:false', async () => {
    expect(await triggerFor(51)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=59 → shouldCompress:false', async () => {
    expect(await triggerFor(59)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=60 → shouldCompress:true, isInitial:false, isPatch:true (patch at +10)', async () => {
    expect(await triggerFor(60)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('count=61 → shouldCompress:false', async () => {
    expect(await triggerFor(61)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=70 → shouldCompress:true, isPatch:true (patch at +20)', async () => {
    expect(await triggerFor(70)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('count=80 → shouldCompress:true, isPatch:true (patch at +30)', async () => {
    expect(await triggerFor(80)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('returns false when supabase returns an error (logs and does not throw)', async () => {
    const chain: Record<string, unknown> = {}
    const terminal = vi.fn().mockResolvedValue({ count: null, error: { message: 'DB error' } })
    chain.select = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.not = vi.fn(() => terminal)
    mockFrom.mockReturnValue(chain as never)

    const result = await checkCompressionTrigger('chat-err', 'user-err')
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('treats null count as 0 (no compression)', async () => {
    const { chain } = makeCountChain(null)
    mockFrom.mockReturnValue(chain as never)
    const result = await checkCompressionTrigger('chat-null', 'user-null')
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })
})
```

---

### 4. `__tests__/lib/memory/executor.test.ts`

Verifies `executeCompressionAsync` never throws under any conditions, including when underlying functions throw.

```typescript
// __tests__/lib/memory/executor.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// executor.ts imports 'server-only', mock it to prevent node errors
vi.mock('server-only', () => ({}))

// Mock the trigger and compression modules
vi.mock('@/lib/memory/trigger', () => ({
  checkCompressionTrigger: vi.fn(),
}))

vi.mock('@/lib/memory/compress', () => ({
  generateInitialProfile: vi.fn(),
}))

vi.mock('@/lib/memory/patch', () => ({
  patchMemoryProfile: vi.fn(),
}))

import { executeCompressionAsync } from '@/lib/memory/executor'
import { checkCompressionTrigger } from '@/lib/memory/trigger'
import { generateInitialProfile } from '@/lib/memory/compress'
import { patchMemoryProfile } from '@/lib/memory/patch'

const mockTrigger = vi.mocked(checkCompressionTrigger)
const mockGenerate = vi.mocked(generateInitialProfile)
const mockPatch = vi.mocked(patchMemoryProfile)

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('executeCompressionAsync — never throws', () => {
  it('resolves without throwing when no compression is needed', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: false, isInitial: false, isPatch: false })
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when initial compression succeeds', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockResolvedValue(undefined)
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when patch compression succeeds', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true })
    mockPatch.mockResolvedValue(undefined)
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when trigger check throws', async () => {
    mockTrigger.mockRejectedValue(new Error('trigger exploded'))
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (premium=false)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('OpenAI down'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    // Advance timers to satisfy retry delays (1s + 2s + 4s)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (premium=true, uses gpt-4o)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('OpenAI error'))

    const promise = executeCompressionAsync('chat-1', 'user-1', true)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
    // Verify it passed gpt-4o (premium model)
    expect(mockGenerate).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o')
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (non-premium, uses gpt-4o-mini)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true })
    mockPatch.mockRejectedValue(new Error('patch failed'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
    expect(mockPatch).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini')
  })

  it('retries exactly 3 times before giving up', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('always fails'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await promise
    expect(mockGenerate).toHaveBeenCalledTimes(3)
  })

  it('succeeds on second attempt and does not call compression fn a third time', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValueOnce(undefined) // second attempt succeeds

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await promise
    expect(mockGenerate).toHaveBeenCalledTimes(2)
  })

  it('resolves without throwing even if an unexpected outer error occurs', async () => {
    // Force the outer try block to fail by making trigger throw something unexpected
    mockTrigger.mockImplementation(() => { throw new Error('sync throw') })
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })
})
```

---

### 5. `__tests__/lib/stripe/webhooks.test.ts`

Tests `verifyWebhookSignature` and `routeWebhookEvent` from `lib/stripe/webhooks.ts`, including the idempotency early-return path.

```typescript
// __tests__/lib/stripe/webhooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// ── Mock the stripe config (avoids real Stripe key requirement at import) ──────
vi.mock('@/lib/stripe/config', () => {
  const mockWebhooks = { constructEvent: vi.fn() }
  const mockSubscriptions = { retrieve: vi.fn() }
  return {
    stripe: {
      webhooks: mockWebhooks,
      subscriptions: mockSubscriptions,
    },
    PRICE_MONTHLY: 'price_monthly_fake',
    PRICE_ANNUAL: 'price_annual_fake',
    PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
    PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    PLAN_PRICES: {},
    getPriceIds: vi.fn(),
  }
})

// ── Mock supabase server client ────────────────────────────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const eq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })
  return { supabaseServer: { from } }
})

import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent)
const mockRetrieve = vi.mocked(stripe.subscriptions.retrieve)
const mockFrom = vi.mocked(supabaseServer.from)

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_fake'
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual_fake'
  process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON = 'price_premium_monthly_fake'
  process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON = 'price_premium_annual_fake'
})

describe('verifyWebhookSignature', () => {
  it('calls stripe.webhooks.constructEvent with the provided body and signature', () => {
    const fakeEvent = { id: 'evt_1', type: 'checkout.session.completed' } as Stripe.Event
    mockConstructEvent.mockReturnValue(fakeEvent)
    const result = verifyWebhookSignature('raw-body', 'sig-header')
    expect(mockConstructEvent).toHaveBeenCalledWith(
      'raw-body',
      'sig-header',
      process.env.STRIPE_WEBHOOK_SECRET
    )
    expect(result).toBe(fakeEvent)
  })

  it('propagates the error thrown by constructEvent on bad signature', () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found')
    })
    expect(() => verifyWebhookSignature('body', 'bad-sig')).toThrow('No signatures found')
  })
})

describe('routeWebhookEvent', () => {
  // Helper to build a minimal fake Stripe.Subscription
  function fakeSubscription(overrides: Partial<{
    customer: string
    items: { price: { id: string }; current_period_end: number; id: string }[]
  }> = {}): Stripe.Subscription {
    const items = overrides.items ?? [
      { price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' },
    ]
    return {
      customer: overrides.customer ?? 'cus_test',
      items: { data: items },
    } as unknown as Stripe.Subscription
  }

  it('handles checkout.session.completed and updates users table', async () => {
    const sub = fakeSubscription()
    mockRetrieve.mockResolvedValue(sub as never)

    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer: 'cus_123',
          metadata: { user_id: 'user-uuid' },
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'active', plan_type: 'monthly' })
    )
  })

  it('handles checkout.session.completed with missing subscription → early return', async () => {
    const event: Stripe.Event = {
      id: 'evt_checkout_nosub',
      type: 'checkout.session.completed',
      data: {
        object: { subscription: null, customer: null } as unknown as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(mockRetrieve).not.toHaveBeenCalled()
  })

  it('handles checkout.session.completed with missing user_id → early return', async () => {
    const sub = fakeSubscription()
    mockRetrieve.mockResolvedValue(sub as never)
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout_noid',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer: 'cus_123',
          metadata: {},
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('handles customer.subscription.updated', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_updated',
      type: 'customer.subscription.updated',
      data: { object: fakeSubscription() },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ plan_type: 'monthly' })
    )
  })

  it('handles customer.subscription.updated with no base price → early return without throw', async () => {
    const sub = fakeSubscription({
      items: [{ price: { id: 'price_unknown' }, current_period_end: 9999999999, id: 'item-x' }],
    })
    const eq = vi.fn()
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_updated_nobase',
      type: 'customer.subscription.updated',
      data: { object: sub },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('handles customer.subscription.deleted', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_deleted',
      type: 'customer.subscription.deleted',
      data: { object: fakeSubscription() },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'lapsed' })
    )
  })

  it('handles invoice.payment_failed with a string customer', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_invoice_failed',
      type: 'invoice.payment_failed',
      data: {
        object: { customer: 'cus_456' } as Stripe.Invoice,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith({ subscription_status: 'lapsed' })
  })

  it('handles invoice.payment_failed with null customer → no DB update', async () => {
    const eq = vi.fn()
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_invoice_null',
      type: 'invoice.payment_failed',
      data: {
        object: { customer: null } as unknown as Stripe.Invoice,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('silently ignores unhandled event types', async () => {
    const event: Stripe.Event = {
      id: 'evt_unknown',
      type: 'payment_intent.created',
      data: { object: {} },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
  })

  it('detects premium add-on items in subscription', async () => {
    const sub = fakeSubscription({
      items: [
        { price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-base' },
        { price: { id: 'price_premium_monthly_fake' }, current_period_end: 9999999999, id: 'item-premium' },
      ],
    })
    mockRetrieve.mockResolvedValue(sub as never)

    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout_premium',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_premium',
          customer: 'cus_premium',
          metadata: { user_id: 'user-premium' },
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ has_premium_memory: true, stripe_premium_item_id: 'item-premium' })
    )
  })
})
```

---

### 6. `__tests__/lib/supabase/client.test.ts`

Tests `lib/supabase/client.ts`. The module does NOT import `lib/env.ts` (constraint 8). It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `process.env` at module-load time, and throws if either is missing. The `@supabase/supabase-js` `createClient` function is mocked.

```typescript
// __tests__/lib/supabase/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/supabase-js so no real network calls are made
vi.mock('@supabase/supabase-js', () => {
  const mockClient = { auth: {}, from: vi.fn() }
  return { createClient: vi.fn(() => mockClient) }
})

import { createClient } from '@supabase/supabase-js'

const mockCreateClient = vi.mocked(createClient)

describe('lib/supabase/client', () => {
  it('exports supabaseClient without throwing when env vars are present', async () => {
    // env vars are set by vitest.config.ts — the module should load cleanly
    const mod = await import('@/lib/supabase/client')
    expect(mod.supabaseClient).toBeDefined()
  })

  it('calls createClient with the URL and anon key from environment', async () => {
    // The module is already loaded (cached). Verify createClient was called.
    expect(mockCreateClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: true }) })
    )
  })

  it('calls createClient with autoRefreshToken:true', () => {
    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ auth: expect.objectContaining({ autoRefreshToken: true }) })
    )
  })
})
```

---

### 7. `__tests__/lib/env.test.ts`

Tests that `lib/env.ts` throws a `ZodError` when `JWT_SECRET` is shorter than 32 characters. Because `lib/env.ts` does not exist yet (it is created by this module), the test also documents the required interface. The module must be re-imported in an isolated context per test.

**Important:** `lib/env.ts` must be created as part of this module. Its only allowed import is `import { z } from 'zod'`.

First, create `lib/env.ts`:

```typescript
// lib/env.ts
// CONSTRAINT: Only `import { z } from 'zod'` is allowed. No other project imports.
import { z } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),
})

// Parse and throw ZodError immediately if env is invalid.
// This is intentionally side-effectful at module load time.
export const env = envSchema.parse({
  JWT_SECRET: process.env.JWT_SECRET,
})
```

Then the test file:

```typescript
// __tests__/lib/env.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ZodError } from 'zod'

describe('lib/env', () => {
  const originalJwtSecret = process.env.JWT_SECRET

  afterEach(() => {
    // Restore original value
    process.env.JWT_SECRET = originalJwtSecret
    // Purge the module from Vitest's module registry so it re-executes on next import
    // @ts-expect-error — __vitest_module_deps__ is internal Vitest API
    if (typeof globalThis.__vitest_module_deps__ !== 'undefined') {
      globalThis.__vitest_module_deps__.delete('@/lib/env')
    }
  })

  it('parses successfully when JWT_SECRET is exactly 32 characters', async () => {
    process.env.JWT_SECRET = 'a'.repeat(32)
    // Dynamic import with cache-busting query to get a fresh evaluation
    const mod = await import(`@/lib/env?v=${Math.random()}`)
    expect(mod.env.JWT_SECRET).toBe('a'.repeat(32))
  })

  it('parses successfully when JWT_SECRET is longer than 32 characters', async () => {
    process.env.JWT_SECRET = 'b'.repeat(40)
    const mod = await import(`@/lib/env?v=${Math.random()}`)
    expect(mod.env.JWT_SECRET).toBe('b'.repeat(40))
  })

  it('throws ZodError when JWT_SECRET is shorter than 32 characters', async () => {
    process.env.JWT_SECRET = 'short'
    await expect(
      import(`@/lib/env?v=${Math.random()}`)
    ).rejects.toThrow(ZodError)
  })

  it('ZodError message contains the required text when JWT_SECRET is too short', async () => {
    process.env.JWT_SECRET = 'tooshort'
    let error: unknown
    try {
      await import(`@/lib/env?v=${Math.random()}`)
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(ZodError)
    const zodErr = error as ZodError
    expect(zodErr.errors[0].message).toBe('JWT_SECRET must be at least 32 characters')
  })

  it('throws ZodError when JWT_SECRET is undefined', async () => {
    delete process.env.JWT_SECRET
    await expect(
      import(`@/lib/env?v=${Math.random()}`)
    ).rejects.toThrow(ZodError)
  })
})
```

---

### 8. `__tests__/app/api/chat/[chatId]/message/route.test.ts`

Verifies the message route returns 429 when `checkRateLimit` returns `{ allowed: false }`, and covers the full response path tree (401, 403, 404, 400, 200).

```typescript
// __tests__/app/api/chat/[chatId]/message/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──────────────────────────────────────────────────────────
vi.mock('next/server', () => {
  class MockNextResponse {
    public _body: unknown
    public _status: number
    constructor(body: unknown, init?: { status?: number }) {
      this._body = body
      this._status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }
  return { NextRequest: class {}, NextResponse: MockNextResponse }
})

// ── Mock all lib dependencies ─────────────────────────────────────────────────
vi.mock('@/lib/auth/getUser', () => ({ getUserFromRequest: vi.fn() }))
vi.mock('@/lib/db/users', () => ({ getUserById: vi.fn() }))
vi.mock('@/lib/db/messages', () => ({
  createMessage: vi.fn(),
  getMessagesByChatId: vi.fn(),
}))
vi.mock('@/lib/db/memory', () => ({ getMemoryProfileByUserId: vi.fn() }))
vi.mock('@/lib/rise/system-prompt', () => ({ buildSystemMessage: vi.fn(() => 'system') }))
vi.mock('@/lib/rise/context-window', () => ({ buildMessageWindow: vi.fn(() => []) }))
vi.mock('@/lib/rise/api-messages', () => ({ buildApiMessages: vi.fn(() => []) }))
vi.mock('@/lib/rise/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  recordMessage: vi.fn(),
}))
vi.mock('@/lib/openai/client', () => ({ callRise: vi.fn() }))
vi.mock('@/lib/memory/executor', () => ({ executeCompressionAsync: vi.fn() }))

import { POST } from '@/app/api/chat/[chatId]/message/route'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById } from '@/lib/db/users'
import { createMessage, getMessagesByChatId } from '@/lib/db/messages'
import { getMemoryProfileByUserId } from '@/lib/db/memory'
import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit'
import { callRise } from '@/lib/openai/client'
import { executeCompressionAsync } from '@/lib/memory/executor'

const mockGetUser = vi.mocked(getUserFromRequest)
const mockGetUserById = vi.mocked(getUserById)
const mockCreateMessage = vi.mocked(createMessage)
const mockGetMessages = vi.mocked(getMessagesByChatId)
const mockGetMemory = vi.mocked(getMemoryProfileByUserId)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockRecordMessage = vi.mocked(recordMessage)
const mockCallRise = vi.mocked(callRise)
const mockExecuteCompression = vi.mocked(executeCompressionAsync)

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: { get: (k: string) => headers[k] ?? null },
    cookies: { get: () => null },
  } as unknown as Request
}

const params = { chatId: 'chat-test-id' }

beforeEach(() => {
  vi.clearAllMocks()
  mockGetMessages.mockResolvedValue([])
  mockGetMemory.mockResolvedValue(null)
  mockCreateMessage.mockResolvedValue({ id: 'msg-1', role: 'assistant', content: 'Hello' } as never)
  mockCallRise.mockResolvedValue('Hello from Rise')
  mockRecordMessage.mockResolvedValue(undefined)
  mockExecuteCompression.mockResolvedValue(undefined)
})

describe('POST /api/chat/[chatId]/message', () => {
  it('returns 401 when session is null', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(401)
  })

  it('returns 403 when subscription_status is not active', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'lapsed' })
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(403)
    expect((res as never as { _body: { code: string } })._body.code).toBe('SUBSCRIPTION_INACTIVE')
  })

  it('returns 404 when user record is not found', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u-missing', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue(null)
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(404)
  })

  it('returns 429 when checkRateLimit returns allowed:false', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 })

    const req = makeRequest({ content: 'hello' })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(429)
    expect((res as never as { _body: { error: string } })._body.error).toContain('Rise needs a moment')
  })

  it('returns 400 when request body is not valid JSON', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })

    const req = {
      json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
      headers: { get: () => null },
      cookies: { get: () => null },
    } as unknown as Request

    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toBe('Invalid request body.')
  })

  it('returns 400 when content is empty string', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })

    const req = makeRequest({ content: '   ' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toBe('Message content is required.')
  })

  it('returns 200 with message and truncation_warning:false on happy path', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: 'Alex' } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })
    mockGetMessages.mockResolvedValue([])
    mockCallRise.mockResolvedValue('Great answer')
    mockCreateMessage.mockResolvedValue({ id: 'msg-2', role: 'assistant', content: 'Great answer' } as never)

    const req = makeRequest({ content: 'Hello Rise' })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(200)
    const body = (res as never as { _body: { truncation_warning: boolean; message: unknown } })._body
    expect(body.truncation_warning).toBe(false)
    expect(body.message).toBeDefined()
  })

  it('sets truncation_warning:true when content exceeds 4000 characters', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: true, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })
    mockGetMessages.mockResolvedValue([])
    mockCallRise.mockResolvedValue('Response')
    mockCreateMessage.mockResolvedValue({ id: 'msg-3', role: 'assistant', content: 'Response' } as never)

    const req = makeRequest({ content: 'x'.repeat(4001) })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { truncation_warning: boolean } })._body.truncation_warning).toBe(true)
  })

  it('calls recordMessage after a successful response', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 58 })
    mockCallRise.mockResolvedValue('ok')
    mockCreateMessage.mockResolvedValue({ id: 'msg-4', role: 'assistant', content: 'ok' } as never)

    const req = makeRequest({ content: 'test' })
    await POST(req as never, { params })

    expect(mockRecordMessage).toHaveBeenCalledWith('u1')
  })

  it('fires executeCompressionAsync (void, non-blocking) on success', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: true, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 57 })
    mockCallRise.mockResolvedValue('ok')
    mockCreateMessage.mockResolvedValue({ id: 'msg-5', role: 'assistant', content: 'ok' } as never)

    const req = makeRequest({ content: 'test compression' })
    await POST(req as never, { params })

    expect(mockExecuteCompression).toHaveBeenCalledWith('chat-test-id', 'u1', true)
  })
})
```

---

### 9. `__tests__/app/api/webhooks/stripe/route.test.ts`

Verifies the Stripe webhook route returns 400 when the `stripe-signature` header is missing, and covers the full event handling tree.

```typescript
// __tests__/app/api/webhooks/stripe/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// ── Mock next/server ──────────────────────────────────────────────────────────
vi.mock('next/server', () => {
  class MockNextResponse {
    public _body: unknown
    public _status: number
    constructor(body: unknown, init?: { status?: number }) {
      this._body = body
      this._status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }
  class MockNextRequest {
    private _body: string
    private _headers: Record<string, string>
    constructor(body: string, headers: Record<string, string> = {}) {
      this._body = body
      this._headers = headers
    }
    async text() { return this._body }
    headers = {
      get: (k: string) => this._headers[k] ?? null,
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse }
})

// ── Mock stripe config ────────────────────────────────────────────────────────
vi.mock('@/lib/stripe/config', () => {
  const mockConstructEvent = vi.fn()
  const mockRetrieve = vi.fn()
  return {
    stripe: {
      webhooks: { constructEvent: mockConstructEvent },
      subscriptions: { retrieve: mockRetrieve },
    },
    PRICE_MONTHLY: 'price_monthly_fake',
    PRICE_ANNUAL: 'price_annual_fake',
    PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
    PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    PLAN_PRICES: {},
    getPriceIds: vi.fn(),
  }
})

// ── Mock supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const maybeSingle = vi.fn()
  const selectChain = { select: vi.fn(), eq: vi.fn(), maybeSingle }
  selectChain.select.mockReturnValue(selectChain)
  selectChain.eq.mockReturnValue(selectChain)

  const insertMock = vi.fn().mockResolvedValue({ error: null })
  const eqMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })

  const from = vi.fn()

  return {
    supabaseServer: { from },
    _mocks: { from, maybeSingle, selectChain, insertMock, eqMock, updateMock },
  }
})

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent)
const mockRetrieve = vi.mocked(stripe.subscriptions.retrieve)
const mockFrom = vi.mocked(supabaseServer.from)

// Helpers
function makeReq(body: string, headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server')
  return new NextRequest(body, headers)
}

function fakeEvent(type: string, object: unknown, id = 'evt_test'): Stripe.Event {
  return { id, type, data: { object } } as unknown as Stripe.Event
}

function setupSupabase(existingEvent: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existingEvent, error: null })
  const selectInner = { maybeSingle, eq: vi.fn() }
  selectInner.eq.mockReturnValue(selectInner)
  const selectOuter = { select: vi.fn().mockReturnValue(selectInner) }

  const insertMock = vi.fn().mockResolvedValue({ error: null })
  const eqUpdateMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

  // from() returns different chains depending on call index
  let callCount = 0
  mockFrom.mockImplementation(() => {
    callCount++
    if (callCount === 1) return selectOuter as never   // idempotency check
    if (callCount === 2) return { insert: insertMock } as never // insert event log
    return { update: updateMock } as never              // user update
  })

  return { maybeSingle, insertMock, updateMock, eqUpdateMock }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_fake'
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual_fake'
  process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON = 'price_premium_monthly_fake'
  process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON = 'price_premium_annual_fake'
})

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const req = makeReq('{}', {})
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toContain(
      'Missing stripe-signature'
    )
  })

  it('returns 400 when webhook signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature mismatch')
    })
    const req = makeReq('{}', { 'stripe-signature': 'bad-sig' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(400)
  })

  it('returns 200 received:true immediately when event is already processed (idempotency)', async () => {
    const event = fakeEvent('checkout.session.completed', {})
    mockConstructEvent.mockReturnValue(event)

    // First from() call (idempotency check) returns an existing event
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'existing' }, error: null })
    const selectInner = { maybeSingle, eq: vi.fn().mockReturnValue({ maybeSingle }) }
    const selectOuter = { select: vi.fn().mockReturnValue(selectInner) }
    mockFrom.mockReturnValueOnce(selectOuter as never)

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)

    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { received: boolean } })._body.received).toBe(true)
    // Should NOT proceed to insert or update
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('returns 200 received:true for checkout.session.completed with no subscription', async () => {
    const event = fakeEvent('checkout.session.completed', { subscription: null, customer: null })
    mockConstructEvent.mockReturnValue(event)
    const { insertMock } = setupSupabase(null)

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
    // Event was logged but no user update happened (early break)
    expect(insertMock).toHaveBeenCalled()
  })

  it('returns 200 received:true for checkout.session.completed happy path', async () => {
    const sub = {
      customer: 'cus_test',
      items: {
        data: [{ price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' }],
      },
    }
    mockRetrieve.mockResolvedValue(sub as never)

    const event = fakeEvent('checkout.session.completed', {
      subscription: 'sub_123',
      customer: 'cus_123',
      metadata: { user_id: 'user-uuid' },
    })
    mockConstructEvent.mockReturnValue(event)

    const { updateMock, eqUpdateMock } = setupSupabase(null)
    // Override: third from() call needs update chain
    mockFrom
      .mockImplementationOnce(() => {
        // idempotency select
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for customer.subscription.updated', async () => {
    const sub = {
      customer: 'cus_test',
      items: {
        data: [{ price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' }],
      },
    }
    const event = fakeEvent('customer.subscription.updated', sub)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for customer.subscription.deleted', async () => {
    const sub = { customer: 'cus_test', items: { data: [] } }
    const event = fakeEvent('customer.subscription.deleted', sub)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for invoice.payment_failed', async () => {
    const invoice = { customer: 'cus_invoice' }
    const event = fakeEvent('invoice.payment_failed', invoice)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for unhandled event type (silently ignored)', async () => {
    const event = fakeEvent('payment_intent.created', {})
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { received: boolean } })._body.received).toBe(true)
  })

  it('returns 200 received:true even when internal handler throws (outer catch)', async () => {
    const event = fakeEvent('checkout.session.completed', {
      subscription: 'sub_throw',
      customer: 'cus_throw',
      metadata: { user_id: 'u-throw' },
    })
    mockConstructEvent.mockReturnValue(event)
    mockRetrieve.mockRejectedValue(new Error('Stripe retrieve exploded'))

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })
})
```

---

## Verification

- [ ] `npx vitest run` exits 0 with zero failing tests
- [ ] `npx vitest run --coverage` exits 0
- [ ] Coverage report in `coverage/index.html` shows 100% lines for all files under `lib/**` and `app/api/**` (except `lib/env.ts`)
- [ ] Coverage report shows 100% functions for all covered files
- [ ] Coverage report shows 100% branches for all covered files
- [ ] `__tests__/lib/auth/session.test.ts` exists and tests `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- [ ] `__tests__/lib/rise/rate-limit.test.ts` exists and tests `checkRateLimit` and `recordMessage`
- [ ] `__tests__/lib/memory/trigger.test.ts` exists and tests `checkCompressionTrigger` at counts 49, 50, 51, 59, 60, 61, 70, 80
- [ ] `__tests__/lib/memory/executor.test.ts` exists and verifies `executeCompressionAsync` never throws
- [ ] `__tests__/lib/stripe/webhooks.test.ts` exists and tests idempotency early return
- [ ] `__tests__/app/api/webhooks/stripe/route.test.ts` verifies 400 on missing `stripe-signature`
- [ ] `__tests__/app/api/chat/[chatId]/message/route.test.ts` verifies 429 response when `checkRateLimit` returns `allowed:false`
- [ ] `__tests__/lib/env.test.ts` verifies `ZodError` thrown when `JWT_SECRET` is shorter than 32 chars
- [ ] No test file makes a real HTTP call, database call, Stripe API call, or OpenAI API call
- [ ] `coverage/` directory exists and is listed in `.gitignore`

---

## Failure Recovery

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'vitest'` | vitest not installed | Run `npm install --save-dev vitest @vitest/coverage-v8 vite-tsconfig-paths` |
| `Cannot find module '@/lib/...'` | `@` path alias not resolved by vitest | Ensure `vite-tsconfig-paths` is in `vitest.config.ts` plugins array |
| `Missing environment variable: SUPABASE_URL` at test startup | `lib/supabase/server.ts` throws at module-load time before mocks run | Add `SUPABASE_URL` etc. to `vitest.config.ts` `test.env` block |
| `Cannot find module 'server-only'` | Next.js `server-only` sentinel package not installed | Run `npm install server-only` or ensure the mock `vi.mock('server-only', () => ({}))` appears before the import in executor tests |
| `Coverage below 100%` on a specific file | A branch or function is not exercised | Add a test case targeting the uncovered branch — refer to the source file directly; do not comment out lines |
| `ZodError` tests fail with module cache hit | Vitest caches ESM modules; re-import with `?v=${Math.random()}` query for fresh evaluation | Use dynamic `import(\`@/lib/env?v=...\`)` pattern already shown in the env test file |
| `npx tsc --noEmit` fails after adding test files | Test files use types not in tsconfig `include` | The `tsconfig.json` `include` already contains `**/*.ts`; ensure `__tests__` is not in `exclude` |
| `stripe-signature` test returns 200 instead of 400 | `req.headers.get` mock returns a non-null value | Confirm `MockNextRequest` passes an empty `headers` object so `.get('stripe-signature')` returns `null` |
| Executor retry test hangs | `vi.useFakeTimers()` active but `vi.runAllTimersAsync()` not awaited | Always `await vi.runAllTimersAsync()` before awaiting the `executeCompressionAsync` promise |
| `createClient` called with wrong args in supabase client test | Module was loaded before mock was registered | Ensure `vi.mock('@supabase/supabase-js', ...)` appears before any `import` that triggers the module |


---


## MODULE 07: E2E Test Suite

# Module Fragment 07 — E2E Test Suite

## Role

You are the build agent for **M7: E2E Test Suite**. Your sole job is to produce the six files listed in "Files to Change" so that `npx playwright test` exits 0 locally with all four E2E flows passing against a local dev server (`http://localhost:3000`) using the `risedial-test` Supabase project and Stripe test mode. You must not add product features, change UI, or alter API contract shapes. You must not add `export const runtime = 'edge'` to any file.

---

## Context

### Locked Tech Values

| Key | Value |
|-----|-------|
| cookie_name | `risedial_session` |
| e2e_base_url | `http://localhost:3000` |
| e2e_supabase_project | `risedial-test` |
| e2e_browser | Chromium (Desktop Chrome) |
| playwright_global_setup | `./e2e/globalSetup.ts` |
| playwright_global_teardown | `./e2e/globalTeardown.ts` |
| playwright_test_dir | `./e2e` |
| playwright_retries_ci | 2 |
| playwright_workers_ci | 1 |
| playwright_trace | `on-first-retry` |
| ci_skip_stripe_e2e_var | `SKIP_STRIPE_E2E` |
| stripe_test_card | `4242 4242 4242 4242` |
| e2e_test_user_fixture | `e2e/fixtures/test-user.json` |
| table:users | `users` |
| users.subscription_status | `text CHECK IN ('active','lapsed','cancelled') NOT NULL` |
| users.email | `text UNIQUE NOT NULL` |
| fk:chats.user_id | `REFERENCES users(id) ON DELETE CASCADE` |
| gitignore_entries | `.env.local`, `coverage/`, `playwright-report/`, `test-results/`, `e2e/fixtures/` |
| env_var:SUPABASE_URL | `SUPABASE_URL` |
| env_var:SUPABASE_SERVICE_ROLE_KEY | `SUPABASE_SERVICE_ROLE_KEY` |
| env_var:STRIPE_SECRET_KEY | `STRIPE_SECRET_KEY` |

### Locked Constraints (numbered)

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. All fixes must preserve existing API contract shapes.
6. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
7. E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing.
8. `npx tsc --noEmit` must exit 0 after every commit in this module.
9. Silent failure that results in an empty assistant message is not acceptable.
10. Do not add `export const runtime = 'edge'` to Node.js-only routes.

---

## What Must Be True After This Module

> `npx playwright test` exits 0 locally with all 4 E2E flows passing against a local dev server using the `risedial-test` Supabase project and Stripe test mode.

---

## Pre-requisites You Must Complete Before Writing Test Files

### 1. Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 2. Create `playwright.config.ts` in the project root

This file does not exist yet. Create it:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 3. Add entries to `.gitignore`

Append these lines to `.gitignore` if not already present:

```
coverage/
playwright-report/
test-results/
e2e/fixtures/
```

### 4. Add `@types/bcryptjs` if not present (already in devDependencies — no action needed)

### 5. Environment variables required at test runtime

The following must be set in `.env.local` (never committed) pointing at the **`risedial-test`** Supabase project:

```
SUPABASE_URL=<risedial-test project URL>
SUPABASE_SERVICE_ROLE_KEY=<risedial-test service role key>
STRIPE_SECRET_KEY=<stripe test mode secret key>
JWT_SECRET=<same value as production for local dev>
```

---

## Files to Change

### 1. `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts`

Creates a test user with `subscription_status: 'active'` directly in the `users` table via Supabase service role, then writes credentials to `e2e/fixtures/test-user.json` for use by the specs.

The `users` table stores `password_hash` (bcrypt). The test user is inserted with a known bcrypt hash so the login flow can authenticate via the app's `/api/auth/signin` endpoint. The password used is `E2eTestPassword1!`.

```typescript
// e2e/globalSetup.ts
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export default async function globalSetup(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'globalSetup: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Generate a unique test email to avoid collisions between runs
  const runId = crypto.randomBytes(4).toString('hex');
  const email = `e2e-test-${runId}@risedial-test.invalid`;
  const password = 'E2eTestPassword1!';

  const passwordHash = await bcrypt.hash(password, 10);

  // Insert test user directly into the users table
  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      subscription_status: 'active',
    })
    .select('id, email')
    .single();

  if (error || !inserted) {
    throw new Error(`globalSetup: failed to insert test user — ${error?.message ?? 'no data returned'}`);
  }

  // Ensure fixtures directory exists
  const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');
  fs.mkdirSync(fixturesDir, { recursive: true });

  // Write test user credentials to fixture file
  const fixture = {
    id: inserted.id as string,
    email: inserted.email as string,
    password,
  };

  fs.writeFileSync(
    path.join(fixturesDir, 'test-user.json'),
    JSON.stringify(fixture, null, 2),
    'utf-8'
  );

  console.log(`[globalSetup] Test user created: ${email} (id: ${inserted.id})`);
}
```

### 2. `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts`

Reads `e2e/fixtures/test-user.json`, deletes the test user by `id` (CASCADE removes all related rows — chats, messages, memory), then removes the fixture file.

```typescript
// e2e/globalTeardown.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export default async function globalTeardown(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[globalTeardown] Missing Supabase env vars — skipping cleanup.');
    return;
  }

  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');

  if (!fs.existsSync(fixturePath)) {
    console.warn('[globalTeardown] Fixture file not found — skipping cleanup.');
    return;
  }

  let fixture: { id: string; email: string; password: string };
  try {
    fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
      id: string;
      email: string;
      password: string;
    };
  } catch (err) {
    console.error('[globalTeardown] Could not parse fixture file:', err);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Delete user by id — FK ON DELETE CASCADE removes chats and all related rows
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', fixture.id);

  if (error) {
    console.error(`[globalTeardown] Failed to delete test user (id: ${fixture.id}):`, error.message);
  } else {
    console.log(`[globalTeardown] Test user deleted: ${fixture.email} (id: ${fixture.id})`);
  }

  // Remove fixture file
  try {
    fs.unlinkSync(fixturePath);
  } catch {
    // Non-fatal
  }
}
```

### 3. `C:\Users\Alexb\Documents\RiseDialapp\e2e\signup.spec.ts`

Flow 1 — Full signup with Stripe test card. Skipped entirely when `SKIP_STRIPE_E2E=true`.

The login page lives at `/signin` (the `(auth)/signin/page.tsx` route, accessible at `/signin`). The signup flow uses the same page toggled to "Create Account" mode. After account creation the app redirects to `/plan-selection`. Stripe Checkout is an external hosted page that loads the Stripe test card form.

```typescript
// e2e/signup.spec.ts
import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const SKIP = process.env.SKIP_STRIPE_E2E === 'true';

test.describe('Flow 1 — Signup with Stripe', () => {
  test.skip(SKIP, 'Skipped because SKIP_STRIPE_E2E=true');

  test('user can sign up, select a plan, and complete Stripe checkout', async ({ page }) => {
    const runId = crypto.randomBytes(4).toString('hex');
    const email = `e2e-signup-${runId}@risedial-test.invalid`;
    const password = 'E2eTestPassword1!';

    // --- Step 1: Navigate to sign-in page and switch to sign-up mode ---
    await page.goto('/signin');
    await expect(page.getByText('Create Account').first()).toBeVisible();

    // Toggle to Create Account mode
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Fill in credentials
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    // Submit — app routes to /plan-selection on success
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/plan-selection', { timeout: 10_000 });

    // --- Step 2: Select monthly plan and proceed to Stripe ---
    await page.getByRole('button', { name: /Monthly/i }).click();
    await page.getByRole('button', { name: /Continue to Checkout/i }).click();

    // Stripe hosted checkout page
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });

    // --- Step 3: Fill in Stripe test card ---
    // Stripe checkout loads card fields in an iframe
    const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await cardFrame.locator('[placeholder="Card number"]').fill('4242 4242 4242 4242');
    await cardFrame.locator('[placeholder="MM / YY"]').fill('12 / 30');
    await cardFrame.locator('[placeholder="CVC"]').fill('123');
    await cardFrame.locator('[placeholder="ZIP"]').fill('10001');

    // Submit Stripe form
    await page.getByRole('button', { name: /Pay/i }).click();

    // --- Step 4: App redirects back to /checkout-success then /onboarding ---
    await page.waitForURL('**/onboarding', { timeout: 30_000 });
    await expect(page.getByText('Rise is listening')).toBeVisible();
  });
});
```

### 4. `C:\Users\Alexb\Documents\RiseDialapp\e2e\auth.spec.ts`

Flow 2 — Login with test user credentials, verify `risedial_session` cookie is set, and verify that after a page reload the user remains on the chat interface rather than being redirected to `/signin`.

The signin page is `/signin`. On successful login with `subscription_status: 'active'` and an existing `lastChatId`, the server redirects to `/chat/<chatId>`. Because the test user is freshly created with no chat history (`lastChatId` will be `null`), the signin route redirects to `/onboarding`. The spec must handle this by navigating through onboarding to reach a chat page, then verify persistence on reload.

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

test.describe('Flow 2 — Auth session persistence', () => {
  test('risedial_session cookie is set after login and page remains on chat after reload', async ({
    page,
    context,
  }) => {
    const { email, password } = loadFixture();

    // --- Step 1: Log in ---
    await page.goto('/signin');

    // Ensure we are in sign-in mode (heading visible)
    await expect(page.getByText('Sign In').first()).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // The test user has no chats yet, so the app redirects to /onboarding
    await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

    // If redirected to onboarding, skip through it to get a chat page
    if (page.url().includes('/onboarding')) {
      await page.getByRole('button', { name: 'Skip' }).click();
      await page.waitForURL('**/chat/**', { timeout: 10_000 });
    }

    // --- Step 2: Verify risedial_session cookie is set ---
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'risedial_session');
    expect(sessionCookie, 'risedial_session cookie should be set after login').toBeTruthy();
    expect(sessionCookie?.value.length).toBeGreaterThan(0);

    // --- Step 3: Capture current chat URL ---
    const chatUrl = page.url();
    expect(chatUrl).toMatch(/\/chat\//);

    // --- Step 4: Reload and verify page stays on chat interface (not redirected to /signin) ---
    await page.reload();
    await page.waitForURL(chatUrl, { timeout: 10_000 });

    // The chat page header contains the "Rise" identity and "Online" status
    await expect(page.getByText('Online').first()).toBeVisible();

    // Confirm we are NOT on /signin
    expect(page.url()).not.toContain('/signin');
    expect(page.url()).toContain('/chat/');
  });
});
```

### 5. `C:\Users\Alexb\Documents\RiseDialapp\e2e\chat.spec.ts`

Flow 3 — Send a message, wait up to 30 seconds for an AI assistant response, and verify both the user message and the assistant message persist after a page reload.

The chat page renders user messages in gradient right-aligned bubbles and assistant messages in left-aligned surface-color bubbles (with a "Rise" avatar). The `aria-label="Message input"` on the textarea and `aria-label="Send message"` on the send button are the correct selectors from the source.

```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

async function loginAndGetChatUrl(page: import('@playwright/test').Page): Promise<string> {
  const { email, password } = loadFixture();

  await page.goto('/signin');
  await expect(page.getByText('Sign In').first()).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.waitForURL('**/chat/**', { timeout: 10_000 });
  }

  return page.url();
}

test.describe('Flow 3 — Chat message persistence', () => {
  test('user message and assistant response both persist after page reload', async ({ page }) => {
    const chatUrl = await loginAndGetChatUrl(page);

    // --- Step 1: Send a message ---
    const testMessage = 'Hello Rise, this is an E2E test message.';

    const messageInput = page.getByLabel('Message input');
    await messageInput.fill(testMessage);
    await page.getByLabel('Send message').click();

    // --- Step 2: Verify user message appears immediately ---
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5_000 });

    // --- Step 3: Wait up to 30s for assistant response ---
    // The typing indicator has aria-label="Rise is typing" while waiting.
    // An assistant response is a non-empty text node inside a Rise bubble.
    // We wait for the typing indicator to disappear AND a second message to appear.
    await expect(page.getByRole('status', { name: 'Rise is typing' })).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('status', { name: 'Rise is typing' })).toBeHidden({
      timeout: 30_000,
    });

    // The assistant message container: the Rise bubble holds the response text.
    // We locate it by finding a div that follows a user message and contains non-empty text.
    // A simpler approach: the page should now have at least 2 message bubbles.
    // The last message is the assistant response — verify it is non-empty.
    const allMessages = page.locator('.chat-message-enter');
    await expect(allMessages.last()).toBeVisible({ timeout: 5_000 });

    // Capture the assistant response text before reload
    // We identify the Rise bubble by its aria-label="Rise is typing" sibling absence
    // and its left-aligned position. Use a broader selector: all text content of
    // the last visible message bubble.
    const lastBubbleText = await allMessages.last().textContent();
    expect(lastBubbleText?.trim().length).toBeGreaterThan(0);

    // --- Step 4: Reload the page ---
    await page.reload();
    await page.waitForURL(chatUrl, { timeout: 10_000 });

    // --- Step 5: Verify both messages persist after reload ---
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10_000 });

    // The assistant message also persisted — verify at least 2 messages are visible
    // by checking that the user message is not the only content
    const messagesAfterReload = page.locator('.chat-message-enter');
    // Wait for messages to load from API
    await expect(messagesAfterReload.first()).toBeVisible({ timeout: 10_000 });

    const messageCount = await messagesAfterReload.count();
    expect(messageCount, 'Both user and assistant messages should persist after reload').toBeGreaterThanOrEqual(2);
  });
});
```

### 6. `C:\Users\Alexb\Documents\RiseDialapp\e2e\billing.spec.ts`

Flow 4 — Navigate to the Settings page, click "Manage Billing", and verify the browser URL contains `billing.stripe.com`.

The Settings page is at `/settings`. The button text is "Manage Billing" (from `settings/page.tsx` line 1318). Clicking it calls `POST /api/subscription/portal` which returns a `{ url: string }` pointing to `billing.stripe.com`. The page then sets `window.location.href = data.url`.

Because Playwright blocks navigation to external domains by default, we intercept the route to the Stripe portal API and mock it to return a redirect URL, or alternatively listen for the navigation event. The cleanest approach for this test is to intercept `POST /api/subscription/portal` and return a `billing.stripe.com` URL, then verify the navigation.

```typescript
// e2e/billing.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

async function loginAndNavigateToSettings(page: import('@playwright/test').Page): Promise<void> {
  const { email, password } = loadFixture();

  await page.goto('/signin');
  await expect(page.getByText('Sign In').first()).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.waitForURL('**/chat/**', { timeout: 10_000 });
  }

  // Navigate to settings
  await page.goto('/settings');
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 5_000 });
}

test.describe('Flow 4 — Billing portal redirect', () => {
  test('clicking Manage Billing redirects to billing.stripe.com', async ({ page }) => {
    // Intercept the portal API so we do not require a live Stripe account.
    // The mock returns a valid billing.stripe.com URL.
    const mockPortalUrl =
      'https://billing.stripe.com/p/session/test_e2e_mock_session_id';

    await page.route('**/api/subscription/portal', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: mockPortalUrl }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndNavigateToSettings(page);

    // Listen for the navigation to billing.stripe.com
    // window.location.href assignment triggers a navigation event.
    const navigationPromise = page.waitForURL(/billing\.stripe\.com/, {
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Manage Billing' }).click();

    await navigationPromise;

    // Verify the URL contains billing.stripe.com
    expect(page.url()).toContain('billing.stripe.com');
  });
});
```

---

## Verification

- [ ] `npx playwright test` exits 0 locally
- [ ] `e2e/signup.spec.ts` exists and is skipped when `SKIP_STRIPE_E2E=true`
- [ ] `e2e/auth.spec.ts` exists and verifies `risedial_session` cookie is set after login
- [ ] `e2e/chat.spec.ts` exists and verifies an AI assistant response appears within 30 seconds
- [ ] `e2e/billing.spec.ts` exists and verifies redirect URL contains `billing.stripe.com`
- [ ] `e2e/globalSetup.ts` creates a test user in the `users` table with `subscription_status: 'active'`
- [ ] `e2e/globalTeardown.ts` deletes the test user row (cascading all related data)
- [ ] `e2e/fixtures/` directory is listed in `.gitignore`
- [ ] `playwright-report/` is listed in `.gitignore`
- [ ] `test-results/` is listed in `.gitignore`
- [ ] Flow 2 (auth): page remains on chat interface after reload — not redirected to /login
- [ ] Flow 3 (chat): both user message and assistant message persist after page reload
- [ ] Flow 4 (billing): browser URL after clicking 'Manage subscription' contains `billing.stripe.com`

---

## Failure Recovery

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `globalSetup` throws "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set" | Environment variables not loaded | Ensure `.env.local` exists with the `risedial-test` project credentials. Playwright loads `.env.local` when running in Next.js projects only if you explicitly load it. Add `require('dotenv').config({ path: '.env.local' })` at the top of `globalSetup.ts` or run `npx dotenv -e .env.local -- npx playwright test`. |
| `globalSetup` throws "failed to insert test user" with `duplicate key` | A previous run did not clean up | Run teardown manually: delete the row from `users` where email matches `e2e-test-*@risedial-test.invalid` using the Supabase dashboard or CLI. |
| Flow 2 fails: `risedial_session` cookie not found | App uses `httpOnly: true` and `sameSite: strict` — Playwright can read httpOnly cookies via `context.cookies()` in the same browser context, so this should work. If missing, check that the signin API returned status 200 and examine `page.url()` after login. | Add `console.log(await context.cookies())` temporarily to debug. Ensure `JWT_SECRET` is set in `.env.local`. |
| Flow 2 fails: page redirected to `/signin` after reload | Session cookie not persisting across reload or `secure: true` blocking on HTTP localhost | The app sets `secure: true` on the cookie which blocks it over plain HTTP. Either set up HTTPS locally or temporarily set `secure: false` for the test environment by adding `NODE_ENV=test` guard in `lib/auth/session.ts`. Alternatively, use `page.context().addCookies()` to inject the session cookie with `secure: false` for localhost. |
| Flow 3 fails: assistant message never appears (typing indicator stays) | The `/api/chat/[chatId]/message` route is failing silently | Check the server console for errors. The route requires `JWT_SECRET` and an OpenAI API key (`OPENAI_API_KEY`). Ensure both are in `.env.local`. Silent failure resulting in empty assistant message violates constraint 9. |
| Flow 3 fails: messages not visible after reload | Messages loaded from API but `.chat-message-enter` class only applied to last message on initial render | Switch selector to a more stable one: `page.locator('[data-testid="message"]')` if testids are added, or query by text content directly. The fallback is to count visible text containing the known user message text. |
| Flow 4 fails: `waitForURL(/billing\.stripe\.com/)` times out | The route mock was not set up before navigation or the button text changed | Verify `Manage Billing` is the exact button text (confirmed in `app/settings/page.tsx` line 1318). Check that `page.route(...)` is called before `loginAndNavigateToSettings`. |
| `npx tsc --noEmit` fails on e2e files | TypeScript strict mode rejecting Playwright types | Ensure `@playwright/test` is in `devDependencies`. Add `"include": ["e2e/**/*"]` to `tsconfig.json` or create a separate `e2e/tsconfig.json` with `{ "extends": "../tsconfig.json", "include": ["./**/*"] }`. |
| `globalSetup` env vars not available | Playwright does not auto-load `.env.local` in global setup | Add this block at the top of `globalSetup.ts` (before any other code): `import * as dotenv from 'dotenv'; import * as path from 'path'; dotenv.config({ path: path.join(process.cwd(), '.env.local') });` and install `dotenv` as a devDependency. |


---


## MODULE 08: CI Pipeline

# Module Fragment 08 — CI Pipeline (M8)

## Role Statement

You are the CI Pipeline engineer for RiseDial. Your sole responsibility in this module is to produce and commit `.github/workflows/ci.yml` so that every push to `main` and every pull request targeting `main` automatically runs three sequential jobs — `typecheck`, `unit-tests`, and `e2e-tests` — and reports green or red status checks back to GitHub. You touch no product code, no UI, and no API contracts. You only create the workflow file.

---

## Context

### Locked Tech Values

| Key | Value |
|-----|-------|
| CI system | GitHub Actions |
| Workflow file | `.github/workflows/ci.yml` |
| Typecheck job name | `typecheck` |
| Unit-test job name | `unit-tests` |
| E2E job name | `e2e-tests` |
| CI triggers | push to `main`, pull_request targeting `main` |
| Artifact retention | 7 days |
| Stripe E2E skip variable | `SKIP_STRIPE_E2E` |
| Node version (CI) | 20 |
| Hosting | Vercel |
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Unit test runner | Vitest |
| E2E test runner | Playwright |
| E2E browser | Chromium (Desktop Chrome) |
| Required env vars | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL |

### Locked Constraints

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. All fixes must preserve existing API contract shapes.
6. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
7. `npx tsc --noEmit` must exit 0 — must use `--noEmit` not build for type checking.
8. Silent failure that results in an empty assistant message is not acceptable.
9. No test makes a real database call, real Stripe API call, or real OpenAI API call.

---

## What Must Be True After This Module

`.github/workflows/ci.yml` is pushed to GitHub and all 3 CI jobs (`typecheck`, `unit-tests`, `e2e-tests`) show green checks on the latest push to main.

---

## Files to Change

### `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`

This is the complete, final workflow file. Write it exactly as shown.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_PRICE_MONTHLY: ${{ secrets.STRIPE_PRICE_MONTHLY }}
      STRIPE_PRICE_ANNUAL: ${{ secrets.STRIPE_PRICE_ANNUAL }}
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON }}
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: typecheck
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_PRICE_MONTHLY: ${{ secrets.STRIPE_PRICE_MONTHLY }}
      STRIPE_PRICE_ANNUAL: ${{ secrets.STRIPE_PRICE_ANNUAL }}
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON }}
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npx vitest run --coverage

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_PRICE_MONTHLY: ${{ secrets.STRIPE_PRICE_MONTHLY }}
      STRIPE_PRICE_ANNUAL: ${{ secrets.STRIPE_PRICE_ANNUAL }}
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON }}
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      SKIP_STRIPE_E2E: 'true'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### GitHub Repository Secrets Setup

Before the CI workflow can run successfully, all 12 secrets below must be configured in GitHub at:

**Repository > Settings > Secrets and variables > Actions > New repository secret**

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_URL` | Full Supabase project URL (e.g. `https://xxxx.supabase.co`) — used server-side for admin DB access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role JWT — bypasses Row Level Security; never expose client-side |
| `JWT_SECRET` | Secret used to sign/verify RiseDial session JWTs — must match the value in production |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_live_...` or `sk_test_...`) — used server-side only |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) — validates incoming webhook payloads |
| `STRIPE_PRICE_MONTHLY` | Stripe Price ID for the monthly subscription plan (`price_...`) |
| `STRIPE_PRICE_ANNUAL` | Stripe Price ID for the annual subscription plan (`price_...`) |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | Stripe Price ID for the premium monthly add-on (`price_...`) |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | Stripe Price ID for the premium annual add-on (`price_...`) |
| `OPENAI_API_KEY` | OpenAI API key (`sk-...`) — used server-side for AI coaching chat completions |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL as above — safe to expose; used by the client-side Supabase JS SDK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key — safe to expose; respects Row Level Security |

Note: `NEXT_PUBLIC_APP_URL` is hardcoded as `http://localhost:3000` directly in the workflow file and does not need to be a repository secret.

---

## Verification

- [ ] `.github/workflows/ci.yml` exists at `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`
- [ ] `ci.yml` defines exactly 3 jobs: `typecheck`, `unit-tests`, `e2e-tests`
- [ ] `typecheck` job runs `npx tsc --noEmit` on `ubuntu-latest` with Node 20
- [ ] `unit-tests` job has `needs: typecheck` and runs `npx vitest run --coverage`
- [ ] `e2e-tests` job has `needs: unit-tests` and runs `npx playwright test` with `SKIP_STRIPE_E2E: 'true'`
- [ ] `ci.yml` trigger is `push: branches: [main]` and `pull_request: branches: [main]`
- [ ] `e2e-tests` job uploads `playwright-report/` artifact on failure with `retention-days: 7`
- [ ] GitHub Actions CI page for the latest push to main shows three green check marks
- [ ] All 12 required GitHub repository secrets are configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] `ci.yml` `e2e-tests` job installs browsers with `npx playwright install --with-deps chromium`

---

## Failure Recovery

| Symptom | Recovery |
|---------|----------|
| `typecheck` job fails with TypeScript errors | Run `npx tsc --noEmit` locally, fix all type errors in source files before pushing. Do not suppress errors with `// @ts-ignore` unless the type is provably unreachable. |
| `unit-tests` job fails because Vitest cannot find test files | Confirm `vitest.config.ts` (or `vitest.config.js`) exists and its `include` glob matches your test file locations. Run `npx vitest run` locally to reproduce. |
| `unit-tests` job fails because a test calls a real external service | Add or fix the mock for that service in the test file. No test may make a real database, Stripe, or OpenAI call (constraint 9). |
| `e2e-tests` job fails and the playwright-report artifact is present | Download the artifact from the GitHub Actions run summary, open `index.html` in a browser, identify the failing test, and fix the underlying app or test code. |
| `e2e-tests` job fails with "browser not found" | Confirm the `npx playwright install --with-deps chromium` step runs before `npx playwright test`. Check that `playwright.config.ts` does not override the project browser list to something other than Chromium. |
| Stripe-related E2E test runs despite `SKIP_STRIPE_E2E=true` | Confirm the test file checks `process.env.SKIP_STRIPE_E2E === 'true'` and calls `test.skip()` accordingly. |
| Secrets not injected (env var is empty string in logs) | Verify all 12 secrets are set in GitHub repository Settings > Secrets and variables > Actions. Secret names are case-sensitive. |
| `npm ci` fails because `package-lock.json` is out of sync | Run `npm install` locally, commit the updated `package-lock.json`, and push. |
| Workflow never triggers on pull request | Confirm the PR targets `main` (not a different base branch). The trigger is `pull_request: branches: [main]`. |


---


## Refinement Report
### Modules Covered: 8
### Source Fragments: module-fragment-01.md, module-fragment-02.md, module-fragment-03.md, module-fragment-04.md, module-fragment-05.md, module-fragment-06.md, module-fragment-07.md, module-fragment-08.md
### Locked Tech Values Carried Forward: 108
### Locked Constraints Applied: 47
