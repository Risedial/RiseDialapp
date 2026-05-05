# Step 15: M6-C — Unit Tests: env schema, chat message route, stripe webhook route

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-15" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-15"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Write 3 unit/integration test files. All external dependencies must be mocked. No real database, Stripe, or OpenAI calls.

Key values from context (do NOT invent):
- `zod_error_message:JWT_SECRET`: `JWT_SECRET must be at least 32 characters` (from external-services.md)
- `jwt_secret_min_length`: 32 (from external-services.md)
- `status:unauthorized`: 401 (from api-contracts.md)
- `status:payment_required`: 402 (from api-contracts.md)
- `status:forbidden`: 403 (from api-contracts.md)
- `status:rate_limited`: 429 (from api-contracts.md)
- `status:bad_request`: 400 (from api-contracts.md)
- `status:ok`: 200 (from api-contracts.md)
- `stripe_header:signature`: `stripe-signature` (from api-contracts.md)
- `webhook_error:missing_signature`: `{ error: 'Missing stripe-signature header' }` (from api-contracts.md)
- `webhook_response:received`: `{ received: true }` (from api-contracts.md)
- `endpoint:chat_message`: `/api/chat/[chatId]/message` (from api-contracts.md)
- `endpoint:webhooks_stripe`: `/api/webhooks/stripe` (from api-contracts.md)
- `middleware_header:user_id`: `x-user-id` (from auth-values.md)
- `middleware_header:subscription_status`: `x-subscription-status` (from auth-values.md)

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\env.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 7. Key test cases:
- Parses successfully when JWT_SECRET is exactly 32 characters
- Parses successfully when JWT_SECRET is longer than 32 characters
- Throws ZodError when JWT_SECRET is shorter than 32 characters
- ZodError message contains exactly: `JWT_SECRET must be at least 32 characters`
- Throws ZodError when JWT_SECRET is undefined
Use dynamic imports with `?v=${Math.random()}` query to bypass module cache for fresh evaluation per test.

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\app\api\chat\[chatId]\message\route.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 8. Key test cases:
- Mock `next/server`, `@/lib/auth/getUser`, `@/lib/db/users`, `@/lib/db/messages`, `@/lib/db/memory`, `@/lib/rise/system-prompt`, `@/lib/rise/context-window`, `@/lib/rise/api-messages`, `@/lib/rise/rate-limit`, `@/lib/openai/client`, `@/lib/memory/executor`
- Returns 401 when session is null
- Returns 403 when subscription_status is not 'active' (body.code === 'SUBSCRIPTION_INACTIVE')
- Returns 404 when user record is not found
- Returns 429 when `checkRateLimit` returns `{ allowed: false, remaining: 0 }` with error containing 'Rise needs a moment'
- Returns 400 when request body is not valid JSON
- Returns 400 when content is empty string (message 'Message content is required.')
- Returns 200 with `truncation_warning: false` on happy path
- Sets `truncation_warning: true` when content exceeds 4000 characters
- Calls `recordMessage` after successful response
- Fires `executeCompressionAsync` (void, non-blocking) on success

**Sub-step 3 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\app\api\webhooks\stripe\route.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 9. Key test cases:
- Mock `next/server` with MockNextResponse and MockNextRequest
- Mock `@/lib/stripe/config` (stripe.webhooks.constructEvent)
- Mock `@/lib/supabase/server` for idempotency and insert/update chains
- Returns 400 when `stripe-signature` header is missing (error: 'Missing stripe-signature header')
- Returns 400 when webhook signature verification fails
- Returns 200 `{ received: true }` immediately when event already processed (idempotency — only 1 `from()` call)
- Returns 200 for checkout.session.completed with no subscription (early break)
- Returns 200 for checkout.session.completed happy path
- Returns 200 for customer.subscription.updated
- Returns 200 for customer.subscription.deleted
- Returns 200 for invoice.payment_failed
- Returns 200 for unhandled event type (silently ignored)
- Returns 200 even when internal handler throws (outer catch)

**Sub-step 4 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 5 — Run all tests:**
Run `npx vitest run`. All 9 test files (from prompts 13, 14, and 15) must pass with zero failures.

**Sub-step 6 — Run coverage:**
Run `npx vitest run --coverage`. Coverage must be 100% lines, functions, branches for all files in `lib/**/*.ts` and `app/api/**/*.ts` (excluding `lib/env.ts`).

**Sub-step 7 — Commit:**
Stage: `git add __tests__/lib/env.test.ts "__tests__/app/api/chat/[chatId]/message/route.test.ts" __tests__/app/api/webhooks/stripe/route.test.ts`
Commit message: `test(unit): add env schema, chat message route, and stripe webhook route integration tests`

## Verification
- [ ] `__tests__/lib/env.test.ts` exists and verifies ZodError thrown when JWT_SECRET < 32 chars
- [ ] `__tests__/app/api/chat/[chatId]/message/route.test.ts` exists and verifies 429 on rate limit
- [ ] `__tests__/app/api/webhooks/stripe/route.test.ts` exists and verifies 400 on missing stripe-signature
- [ ] `npx vitest run` exits 0 with zero failing tests across all 9 test files
- [ ] `npx vitest run --coverage` exits 0
- [ ] Coverage report shows 100% lines for all covered files
- [ ] `coverage/` directory exists and is listed in `.gitignore`
- [ ] No test file makes a real HTTP, database, Stripe, or OpenAI call
- [ ] `npx tsc --noEmit` exits 0

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-15" from pendingSteps to completedSteps
- Set steps["prompt-15"].status = "complete"
