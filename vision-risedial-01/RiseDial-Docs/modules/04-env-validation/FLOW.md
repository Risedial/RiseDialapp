# Module 4 — Environment Variable Validation: Flow

## Pre-conditions
- Module 3 complete: all BLOCKING AUDIT.md findings fixed and committed
- `npx tsc --noEmit` exits 0
- `zod` is present in `package.json` dependencies

---

## Steps

**1.** Verify zod is installed:
```bash
cat package.json | grep '"zod"'
```
If not found: `npm install zod`

**2.** Create `lib/env.ts` with the complete content from `modules/04-env-validation/SCHEMA.md`.

The file must have zero project imports — only `import { z } from 'zod'`.

**3.** Run `npx tsc --noEmit`.
- Exit 0 → continue
- Exit 1 → the env schema likely has a type issue; fix it (e.g., `.startsWith()` method may need a different zod version — use `.regex(/^sk_/)` as an alternative if needed)

**4.** Update `lib/supabase/server.ts`.

4a. Add at the top: `import { env } from '@/lib/env'`

4b. Replace `process.env.SUPABASE_URL` with `env.SUPABASE_URL`

4c. Replace `process.env.SUPABASE_SERVICE_ROLE_KEY` with `env.SUPABASE_SERVICE_ROLE_KEY`

4d. Remove any manual `if (!supabaseUrl) throw new Error(...)` checks — zod handles this at startup

4e. Run `npx tsc --noEmit` → exit 0

**5.** Update `lib/auth/session.ts`.

5a. Add at the top: `import { env } from '@/lib/env'`

5b. Replace `const JWT_SECRET = process.env.JWT_SECRET` (the bare version from Module 3 Fix A) with `const JWT_SECRET = env.JWT_SECRET`

5c. Remove any `JWT_SECRET!` non-null assertions added in Module 3 — no longer needed

5d. Run `npx tsc --noEmit` → exit 0

**6.** Update `lib/stripe/config.ts`.

6a. Add at the top: `import { env } from '@/lib/env'`

6b. Replace `process.env.STRIPE_SECRET_KEY` with `env.STRIPE_SECRET_KEY`

6c. Run `npx tsc --noEmit` → exit 0

**7.** Update `lib/stripe/webhooks.ts`.

7a. Add at the top: `import { env } from '@/lib/env'`

7b. Replace all `process.env.STRIPE_WEBHOOK_SECRET`, `process.env.STRIPE_PRICE_MONTHLY`, `process.env.STRIPE_PRICE_ANNUAL`, `process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON`, `process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` with their `env.*` equivalents

7c. Run `npx tsc --noEmit` → exit 0

**8.** Update API routes that use NEXT_PUBLIC_APP_URL.

8a. Open `app/api/auth/reset-request/route.ts`:
- Add: `import { env } from '@/lib/env'`
- Replace: `process.env.NEXT_PUBLIC_APP_URL ?? 'https://risedial.com'` with `env.NEXT_PUBLIC_APP_URL`

8b. Open `app/api/subscription/checkout/route.ts`:
- Add: `import { env } from '@/lib/env'`
- Replace: `process.env.NEXT_PUBLIC_APP_URL` with `env.NEXT_PUBLIC_APP_URL`

8c. Run `npx tsc --noEmit` → exit 0

**9.** Check for any remaining `process.env.*` references in the codebase (excluding lib/supabase/client.ts which must keep its own inline validation):
```bash
grep -rn "process\.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" \
  | grep -v "lib/supabase/client.ts" \
  | grep -v "lib/env.ts"
```

For any remaining references found:
- If the var is in the SCHEMA.md list: update that file to import from lib/env.ts
- If the var is NOT in the SCHEMA.md list: add it to the env schema and update accordingly

**10.** Create `.env.example` at the project root.

Copy the `.env.example` content from `modules/04-env-validation/SCHEMA.md`.

**11.** Verify `.env.local` is gitignored:
```bash
cat .gitignore | grep "\.env\.local"
```
If not found: add `.env.local` to `.gitignore`.

**12.** Run the full build verification:
```bash
npx tsc --noEmit   # exit 0
```

**13.** Verify the app starts correctly with env vars present:
```bash
npm run dev
# Expected: server starts at localhost:3000 without throwing ZodError
```

If it throws a ZodError: identify the missing var from the error message, add it to `.env.local`, and retry.

**14.** Commit all changes:
```bash
git add lib/env.ts lib/supabase/server.ts lib/auth/session.ts lib/stripe/config.ts lib/stripe/webhooks.ts
git add app/api/auth/reset-request/route.ts app/api/subscription/checkout/route.ts
git add .env.example .gitignore
git commit -m "feat(env): add zod env validation; update all process.env call sites to use lib/env.ts"
```

---

## Decision Points

```
Create lib/env.ts
  │
  ▼
tsc exits 0?
  │ no → fix schema type issue (e.g., replace .startsWith with .regex)
  │ yes → continue
  ▼
Update lib/supabase/server.ts → tsc check
  ▼
Update lib/auth/session.ts → tsc check
  ▼
Update lib/stripe/config.ts → tsc check
  ▼
Update lib/stripe/webhooks.ts → tsc check
  ▼
Update API routes using NEXT_PUBLIC_APP_URL → tsc check
  ▼
Grep for remaining process.env references
  │ found (not in client.ts/env.ts) → update those files → tsc check
  │ none found → continue
  ▼
Create .env.example
  ▼
Verify .env.local is gitignored
  ▼
npm run dev → starts without ZodError?
  │ no → identify missing var from error → add to .env.local → retry
  │ yes → commit
```

---

## Post-conditions

- `lib/env.ts` exists and exports a typed `env` object
- No file in `lib/` or `app/api/` reads `process.env.*` directly (except `lib/env.ts` itself and `lib/supabase/client.ts`)
- `lib/supabase/client.ts` keeps its own inline validation (browser module — cannot import lib/env.ts)
- `.env.example` exists at project root with all 13 vars
- `.env.local` is in `.gitignore`
- `npm run dev` starts without env validation errors when `.env.local` is populated
- `npx tsc --noEmit` exits 0
- Ready to begin Module 5
