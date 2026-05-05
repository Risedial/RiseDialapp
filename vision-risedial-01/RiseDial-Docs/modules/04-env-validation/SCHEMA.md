# Module 4 — Environment Variable Validation: Schema

## Environment Variable Schema

This is the complete schema for `lib/env.ts`. Every environment variable required by the RiseDial application is listed here with its type, format constraint, and validation rule.

### lib/env.ts (complete file)

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Supabase server-side client
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  STRIPE_PRICE_MONTHLY: z.string().startsWith('price_', 'STRIPE_PRICE_MONTHLY must start with price_'),
  STRIPE_PRICE_ANNUAL: z.string().startsWith('price_', 'STRIPE_PRICE_ANNUAL must start with price_'),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z.string().startsWith('price_', 'STRIPE_PRICE_PREMIUM_MONTHLY_ADDON must start with price_'),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z.string().startsWith('price_', 'STRIPE_PRICE_PREMIUM_ANNUAL_ADDON must start with price_'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),

  // Public vars (available server-side in Next.js; validated here for server startup safety)
  // Note: lib/supabase/client.ts (browser module) does NOT import this file
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
})

export const env = envSchema.parse(process.env)
```

### Variable Reference Table

| Variable | Type | Format Constraint | Example Value | Used By |
|----------|------|------------------|---------------|---------|
| `SUPABASE_URL` | string | Must be a valid URL | `https://abcdef.supabase.co` | `lib/supabase/server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | string | min length 1 | `eyJhbGciOiJIUzI1NiIs...` | `lib/supabase/server.ts` |
| `JWT_SECRET` | string | min length 32 chars | `a-very-long-random-secret-key-here` | `lib/auth/session.ts` |
| `STRIPE_SECRET_KEY` | string | starts with `sk_` | `sk_test_abc123...` | `lib/stripe/config.ts` |
| `STRIPE_WEBHOOK_SECRET` | string | starts with `whsec_` | `whsec_abc123...` | `lib/stripe/webhooks.ts` |
| `STRIPE_PRICE_MONTHLY` | string | starts with `price_` | `price_abc123` | `lib/stripe/webhooks.ts`, subscription checkout |
| `STRIPE_PRICE_ANNUAL` | string | starts with `price_` | `price_def456` | `lib/stripe/webhooks.ts`, subscription checkout |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | string | starts with `price_` | `price_ghi789` | `lib/stripe/webhooks.ts` |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | string | starts with `price_` | `price_jkl012` | `lib/stripe/webhooks.ts` |
| `OPENAI_API_KEY` | string | starts with `sk-` | `sk-proj-abc123...` | `lib/openai/client.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | string | Must be a valid URL | `https://abcdef.supabase.co` | `lib/supabase/client.ts` (browser-side inline) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | min length 1 | `eyJhbGciOiJIUzI1NiIs...` | `lib/supabase/client.ts` (browser-side inline) |
| `NEXT_PUBLIC_APP_URL` | string | Must be a valid URL | `https://risedial.com` | `app/api/auth/reset-request/route.ts`, `app/api/subscription/checkout/route.ts` |

### .env.example (complete file)

```bash
# Supabase — server-side service role client
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication — HS256 JWT signing secret (minimum 32 characters)
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long

# Stripe — must use test keys for development, live keys for production
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

### Typed env Object Shape

The `env` export from `lib/env.ts` has this TypeScript type (inferred by zod):

```typescript
type Env = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  JWT_SECRET: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_PRICE_MONTHLY: string
  STRIPE_PRICE_ANNUAL: string
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: string
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: string
  OPENAI_API_KEY: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_APP_URL: string
}
```

All fields are `string` (not `string | undefined`) because zod's `.parse()` throws if any field is absent or fails validation. Callers do not need null checks.

### Error Format on Validation Failure

When any variable is missing or fails validation, zod throws a `ZodError` with this structure:

```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["JWT_SECRET"],
    "message": "Required"
  }
]
```

Or for format failures:
```
ZodError: [
  {
    "code": "too_small",
    "minimum": 32,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "JWT_SECRET must be at least 32 characters",
    "path": ["JWT_SECRET"]
  }
]
```

The `path` array always identifies the exact variable name that failed, making misconfiguration immediately actionable.

### Test Environment Variables

For Vitest tests, the env validation runs when `lib/env.ts` is imported. Tests that import files which depend on `lib/env.ts` must either:

**Option A — Set test env vars in vitest.config.ts:**
```typescript
export default defineConfig({
  test: {
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-characters',
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
  },
})
```

**Option B — Mock lib/env.ts in tests that need it:**
```typescript
vi.mock('@/lib/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-characters',
    // ... other test values
  },
}))
```

The vitest.config.ts `env` field approach (Option A) is preferred because it avoids the need for per-file mocks and better represents the real startup behavior.
