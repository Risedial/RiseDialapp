# Module 4 — Environment Variable Validation: SPEC

## Purpose

Create `lib/env.ts` — a zod-validated environment object that throws a descriptive error at module-load time if any required environment variable is absent or malformed. Update all files that currently read `process.env` directly to import from `lib/env.ts` instead. Create `.env.example` as the canonical list of required variables.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 3 complete — all BLOCKING AUDIT.md findings fixed; `npx tsc --noEmit` exits 0; `npx next build` exits 0

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| Complete env var list from AUDIT.md Area 11 | List | AUDIT.md | Yes |
| `package.json` | JSON | Project root | Yes — `zod` must be present in dependencies |
| All files that currently read `process.env.*` | TypeScript | `lib/`, `app/api/` | Yes |

---

## Outputs

| Field | Type | Destination | Description |
|-------|------|-------------|-------------|
| `lib/env.ts` | TypeScript | `lib/env.ts` | Exports `env` object; throws `ZodError` with variable name if any var is missing or malformed |
| `.env.example` | Text | Project root | Lists all 13 required env vars with placeholder values |
| Updated `lib/supabase/server.ts` | TypeScript | `lib/supabase/server.ts` | Imports `env.SUPABASE_URL` and `env.SUPABASE_SERVICE_ROLE_KEY` from lib/env.ts |
| Updated `lib/auth/session.ts` | TypeScript | `lib/auth/session.ts` | Imports `env.JWT_SECRET` from lib/env.ts (replaces the bare `process.env.JWT_SECRET!`) |
| Updated `lib/stripe/config.ts` | TypeScript | `lib/stripe/config.ts` | Imports `env.STRIPE_SECRET_KEY` from lib/env.ts |
| Updated `lib/stripe/webhooks.ts` | TypeScript | `lib/stripe/webhooks.ts` | Imports `env.STRIPE_WEBHOOK_SECRET`, `env.STRIPE_PRICE_*` from lib/env.ts |
| Updated API routes using NEXT_PUBLIC_APP_URL | TypeScript | `app/api/auth/reset-request/route.ts`, `app/api/subscription/checkout/route.ts` | Import `env.NEXT_PUBLIC_APP_URL` |

---

## Behavior

### lib/env.ts: Module-Load Validation

`lib/env.ts` imports only `zod`. It has zero imports from the project itself (to avoid circular dependencies). It calls `envSchema.parse(process.env)` at the module level, which:
- Throws `ZodError` immediately if any required var is missing or does not match its format constraint
- Returns a fully-typed `env` object if all vars pass validation

The error thrown by zod is descriptive:
```
ZodError: [
  { code: 'too_small', minimum: 32, path: ['JWT_SECRET'], message: 'JWT_SECRET must be at least 32 characters' }
]
```

This ensures that a missing or misconfigured env var fails loudly at startup, not silently at the point of use.

### NEXT_PUBLIC Variables in lib/env.ts

`NEXT_PUBLIC_*` variables are available server-side in Next.js (they are inlined at build time for browser bundles, but they are also present in `process.env` on the server). They can therefore be validated in `lib/env.ts` (a server module).

The three NEXT_PUBLIC vars found in the codebase:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL for the browser client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key for the browser client
- `NEXT_PUBLIC_APP_URL` — App base URL for webhook redirects and password reset emails

`lib/supabase/client.ts` (the browser Supabase client) does NOT import `lib/env.ts` — it is a browser-side module and must not import server-only code. It keeps its own inline validation (`if (!supabaseUrl) throw new Error(...)`). The server-side validation in `lib/env.ts` serves as an additional safety net at startup.

### Files to Update After Creating lib/env.ts

**`lib/supabase/server.ts`:**
- Before: reads `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` with manual `if (!x)` checks
- After: `import { env } from '@/lib/env'` and use `env.SUPABASE_URL`, `env.SUPABASE_SERVICE_ROLE_KEY`
- Remove the manual null checks (zod handles this at startup)

**`lib/auth/session.ts`:**
- Before: `const JWT_SECRET = process.env.JWT_SECRET` (after Fix A in Module 3)
- After: `import { env } from '@/lib/env'` and use `env.JWT_SECRET`
- Remove the `JWT_SECRET!` non-null assertion (no longer needed; zod guarantees it is defined)

**`lib/stripe/config.ts`:**
- Before: reads `process.env.STRIPE_SECRET_KEY`
- After: `import { env } from '@/lib/env'` and use `env.STRIPE_SECRET_KEY`

**`lib/stripe/webhooks.ts`:**
- Before: reads `process.env.STRIPE_WEBHOOK_SECRET`, `process.env.STRIPE_PRICE_MONTHLY`, etc.
- After: import from `lib/env.ts` and use env.* vars

**`app/api/auth/reset-request/route.ts`:**
- Before: `process.env.NEXT_PUBLIC_APP_URL ?? 'https://risedial.com'`
- After: `import { env } from '@/lib/env'` and use `env.NEXT_PUBLIC_APP_URL`
- Remove the `?? 'https://risedial.com'` fallback (zod validates the var is present at startup)

**`app/api/subscription/checkout/route.ts`:**
- Before: `${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?...`
- After: `${env.NEXT_PUBLIC_APP_URL}/checkout-success?...`

### .env.example

`.env.example` is committed to the repository. It lists every required env var with a placeholder value. Developers clone the repo, copy `.env.example` to `.env.local`, and fill in real values.

`.env.local` must be in `.gitignore` (it should already be in Next.js's default `.gitignore`).

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| `lib/env.ts` imports from another project file | This creates a risk of circular dependencies. `lib/env.ts` must import ONLY from `zod` — no project imports. |
| `NEXT_PUBLIC_SUPABASE_URL` same value as `SUPABASE_URL` | This is expected — the Supabase project URL is the same; only the client-side access pattern differs. Both vars must be set, even if they have the same value, to satisfy both server and browser clients. |
| `lib/supabase/client.ts` tries to import lib/env.ts | This must not happen. `lib/supabase/client.ts` is a browser module. Server-only imports in browser modules cause bundling errors. Keep `client.ts`'s inline validation as-is. |
| Vitest test environment does not have env vars set | `vitest.config.ts` must set test environment variables (or the test must mock `lib/env.ts` with `vi.mock('@/lib/env')`). See Module 6 SPEC for details. |

---

## Failure States

| Failure | Recovery |
|---------|----------|
| `lib/env.ts` causes a circular import when imported by `lib/supabase/server.ts` | Check that `lib/env.ts` has zero project imports. If a circular dependency still exists, it is because another lib file imported by server.ts also imports env.ts and creates a cycle. Resolve by ensuring all imports of env.ts are top-level (not re-exported through another module). |
| `zod` is not in `package.json` | Install: `npm install zod`. (It should already be present based on AUDIT.md Area 11 findings.) |

---

## AI/LLM Used

None.

---

## Data Stored

None. Files committed to git only.
