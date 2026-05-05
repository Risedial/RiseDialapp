# Module 4 — Environment Variable Validation: Build Instructions

## What You Are Building

Two new files (`lib/env.ts` and `.env.example`) plus updates to 6 existing files that currently read `process.env` directly. The result is a single validated entry point for all environment configuration.

---

## Prerequisites

- Module 3 complete: all BLOCKING fixes committed, `npx tsc --noEmit` exits 0
- `zod` in `package.json` dependencies (verify: `npm list zod`)
- `.env.local` with real values for all 13 required vars (for local testing)

---

## Step 1 — Create lib/env.ts

Create the file at `lib/env.ts` with this exact content:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  STRIPE_PRICE_MONTHLY: z.string().startsWith('price_', 'STRIPE_PRICE_MONTHLY must start with price_'),
  STRIPE_PRICE_ANNUAL: z.string().startsWith('price_', 'STRIPE_PRICE_ANNUAL must start with price_'),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z.string().startsWith('price_', 'STRIPE_PRICE_PREMIUM_MONTHLY_ADDON must start with price_'),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z.string().startsWith('price_', 'STRIPE_PRICE_PREMIUM_ANNUAL_ADDON must start with price_'),
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
})

export const env = envSchema.parse(process.env)
```

**Important:** This file must have zero imports from the project. Only `import { z } from 'zod'` is allowed.

Run `npx tsc --noEmit` after creating this file.

---

## Step 2 — Update lib/supabase/server.ts

Find the `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` references.

Add to imports:
```typescript
import { env } from '@/lib/env'
```

Replace:
```typescript
// Before:
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
if (!supabaseKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

// After:
const supabaseUrl = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
// Manual null checks removed — zod validates at startup
```

Run `npx tsc --noEmit`.

---

## Step 3 — Update lib/auth/session.ts

Add to imports:
```typescript
import { env } from '@/lib/env'
```

Replace:
```typescript
// Before (from Module 3 Fix A):
const JWT_SECRET = process.env.JWT_SECRET

// After:
const JWT_SECRET = env.JWT_SECRET
```

Remove any `JWT_SECRET!` non-null assertions — no longer needed.

Run `npx tsc --noEmit`.

---

## Step 4 — Update lib/stripe/config.ts

Add to imports:
```typescript
import { env } from '@/lib/env'
```

Replace `process.env.STRIPE_SECRET_KEY` with `env.STRIPE_SECRET_KEY`.

Run `npx tsc --noEmit`.

---

## Step 5 — Update lib/stripe/webhooks.ts

Add to imports:
```typescript
import { env } from '@/lib/env'
```

Replace each `process.env.*` reference with the corresponding `env.*`:
- `process.env.STRIPE_WEBHOOK_SECRET` → `env.STRIPE_WEBHOOK_SECRET`
- `process.env.STRIPE_PRICE_MONTHLY` → `env.STRIPE_PRICE_MONTHLY`
- `process.env.STRIPE_PRICE_ANNUAL` → `env.STRIPE_PRICE_ANNUAL`
- `process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` → `env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON`
- `process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` → `env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON`

Run `npx tsc --noEmit`.

---

## Step 6 — Update API routes using NEXT_PUBLIC_APP_URL

**`app/api/auth/reset-request/route.ts`:**
```typescript
// Add import:
import { env } from '@/lib/env'

// Replace:
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://risedial.com'
// With:
const appBaseUrl = env.NEXT_PUBLIC_APP_URL
```

**`app/api/subscription/checkout/route.ts`:**
```typescript
// Add import:
import { env } from '@/lib/env'

// Replace:
`${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?...`
// With:
`${env.NEXT_PUBLIC_APP_URL}/checkout-success?...`
```

Run `npx tsc --noEmit`.

---

## Step 7 — Audit for remaining process.env references

```bash
grep -rn "process\.env\." lib/ app/ middleware.ts \
  --include="*.ts" --include="*.tsx" \
  | grep -v "lib/env.ts" \
  | grep -v "lib/supabase/client.ts"
```

Expected: zero results. If any remain, update those files to import from lib/env.ts.

---

## Step 8 — Create .env.example

Create `.env.example` at the project root with this content:

```bash
# Supabase — server-side service role client
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication — HS256 JWT signing secret (minimum 32 characters)
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long

# Stripe — use test keys for development, live keys for production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_PREMIUM_MONTHLY_ADDON=price_...
STRIPE_PRICE_PREMIUM_ANNUAL_ADDON=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# Browser-visible Supabase client (NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App base URL — used in Stripe checkout success/cancel URLs and password reset emails
NEXT_PUBLIC_APP_URL=https://risedial.com
```

---

## Step 9 — Verify .env.local is gitignored

```bash
grep "\.env\.local" .gitignore
```

If not found, add `.env.local` to `.gitignore`.

---

## Step 10 — Test that the app starts

```bash
npm run dev
```

The dev server should start at `localhost:3000` without throwing a `ZodError`. If it throws, the error message will name the exact variable that is missing or malformed. Add the variable to `.env.local` and retry.

---

## Step 11 — Commit

```bash
git add lib/env.ts
git add lib/supabase/server.ts lib/auth/session.ts lib/stripe/config.ts lib/stripe/webhooks.ts
git add app/api/auth/reset-request/route.ts app/api/subscription/checkout/route.ts
git add .env.example .gitignore
git commit -m "feat(env): add zod env validation; update all process.env call sites to use lib/env.ts"
```

---

## What to Test

```bash
npx tsc --noEmit
# Expected: exit 0, zero output

npm run dev
# Expected: starts at localhost:3000, no ZodError in console

# Test fail-fast: temporarily remove JWT_SECRET from .env.local, restart dev server
# Expected: ZodError naming JWT_SECRET before the server finishes starting
# Restore .env.local after this test
```

---

## Definition of Done

- [ ] `lib/env.ts` exists and exports a typed `env` object with 13 fields
- [ ] `lib/env.ts` has zero project imports (only `import { z } from 'zod'`)
- [ ] No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` and `lib/supabase/client.ts`)
- [ ] `.env.example` exists at project root with all 13 vars
- [ ] `.env.local` is in `.gitignore`
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run dev` starts without ZodError when `.env.local` has all required vars
- [ ] Starting without `JWT_SECRET` throws: `ZodError: JWT_SECRET must be at least 32 characters`
- [ ] Ready to begin Module 5
