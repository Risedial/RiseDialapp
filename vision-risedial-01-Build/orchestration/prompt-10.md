# Step 10: M4 — Environment Variable Validation (lib/env.ts + replacements)

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-10" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-10"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Create `lib/env.ts` with a zod-validated `env` object and replace every bare `process.env.*` reference in `lib/` and `app/api/` (except `lib/env.ts` itself and `lib/supabase/client.ts`) with `env.*` imported from `lib/env.ts`.

Key values from context (do NOT invent):
- `lib_env_ts_allowed_imports`: only `import { z } from 'zod'` (from external-services.md)
- `lib_env_ts_export`: `export const env = envSchema.parse(process.env)` (from external-services.md)
- `lib_supabase_client_must_not_import`: `lib/env.ts` (from external-services.md)
- JWT_SECRET min length: 32 (from external-services.md)
- All 13 required env var names (from external-services.md)
- Error messages for each validation (from external-services.md `zod_error_message:*`)
- Stripe API version: `2026-04-22.dahlia` (from api-contracts.md)

Apply these 9 sub-steps. After each file is written, run `npx tsc --noEmit` and confirm it exits 0 before committing that file. Commit each file independently.

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\lib\env.ts`:**
Create new file. Allowed imports: ONLY `import { z } from 'zod'`. No project imports.
The schema must validate all 13 required variables with the exact error messages from external-services.md. Export: `export const env = envSchema.parse(process.env)`
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): add zod-validated env schema in lib/env.ts`

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\.env.example`:**
Create new file with placeholder values for all 13 required env vars. This file must be committed to the repository. Format from refined-prompt.md M4 section.
After writing: commit with message: `chore: add .env.example with all required environment variable placeholders`

**Sub-step 3 — Update `C:\Users\Alexb\Documents\RiseDialapp\lib\supabase\server.ts`:**
Read the current file. Replace bare `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` reads with `env.SUPABASE_URL` and `env.SUPABASE_SERVICE_ROLE_KEY`. Add `import { env } from '@/lib/env'`. Remove manual if (!...) guards. Keep all other code identical.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace process.env reads in lib/supabase/server.ts with env`

**Sub-step 4 — Update `C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts`:**
Read the current file (it now has the `_jwtSecret` throw pattern from Fix A). Replace the throw pattern with `import { env } from '@/lib/env'` and `const JWT_SECRET = env.JWT_SECRET`. All function bodies, exports, and helper functions remain verbatim.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace process.env.JWT_SECRET in lib/auth/session.ts with env`

**Sub-step 5 — Update `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\config.ts`:**
Read the current file. Replace the four bare `process.env.*` reads with `env.*` imported from `lib/env.ts`. Remove `!` non-null assertions. All exports and function signatures remain identical. Stripe apiVersion must remain `'2026-04-22.dahlia'`.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace process.env reads in lib/stripe/config.ts with env`

**Sub-step 6 — Update `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts`:**
Read the current file. Replace the five bare `process.env.*` reads (STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, STRIPE_WEBHOOK_SECRET) with `env.*` imported from `lib/env.ts`. Add `import { env } from '@/lib/env'`. All function signatures, exports, logic, and comments remain identical.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace process.env reads in lib/stripe/webhooks.ts with env`

**Sub-step 7 — Update `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\reset-request\route.ts`:**
Read the current file. Add `import { env } from '@/lib/env'`. Replace `process.env.NEXT_PUBLIC_APP_URL` (used in `appBaseUrl`) with `env.NEXT_PUBLIC_APP_URL`. Keep `process.env.RESEND_API_KEY` as-is (RESEND_API_KEY is not in the validated schema — it is optional). Remove the `?? 'https://risedial.com'` fallback from `appBaseUrl`. All other code, imports, and response shapes remain verbatim.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace NEXT_PUBLIC_APP_URL process.env in reset-request route with env`

**Sub-step 8 — Update `C:\Users\Alexb\Documents\RiseDialapp\app\api\subscription\checkout\route.ts`:**
Read the current file. Add `import { env } from '@/lib/env'`. Replace the two `process.env.NEXT_PUBLIC_APP_URL` reads in `success_url` and `cancel_url` template literals with `env.NEXT_PUBLIC_APP_URL`. All other imports, logic, and response shapes remain verbatim.
After writing: run `npx tsc --noEmit`, then commit with message: `feat(env): replace NEXT_PUBLIC_APP_URL process.env in checkout route with env`

**Sub-step 9 — Verify `.gitignore`:**
Read `C:\Users\Alexb\Documents\RiseDialapp\.gitignore`. Confirm `.env.local` is listed. If it is not, add it. No commit needed unless the file was actually changed.

After all 9 sub-steps, run a final grep to confirm zero remaining `process.env.` reads in `lib/` and `app/api/` (excluding `lib/env.ts` and `lib/supabase/client.ts`).

## Verification
- [ ] `lib/env.ts` exists and contains ONLY `import { z } from 'zod'` as its import
- [ ] `lib/env.ts` exports `const env = envSchema.parse(process.env)`
- [ ] `lib/env.ts` schema includes all 13 required variables
- [ ] `.env.example` exists at project root and lists all 13 required variables
- [ ] `.env.local` appears in `.gitignore`
- [ ] Grep for `process.env.` in `lib/` and `app/api/` (excluding `lib/env.ts` and `lib/supabase/client.ts`) returns zero results
- [ ] `npx tsc --noEmit` exits 0
- [ ] `lib/supabase/client.ts` does NOT import from `lib/env.ts`
- [ ] Each file was committed independently with its own commit message

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-10" from pendingSteps to completedSteps
- Set steps["prompt-10"].status = "complete"
