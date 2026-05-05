# Step 14: M6-B — Unit Tests: memory executor, stripe webhooks lib, supabase client

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-14" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-14"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Write 3 unit test files. All external dependencies must be mocked. No real database, Stripe, or OpenAI calls.

Key values from context (do NOT invent):
- `lib_memory_executor_export`: `executeCompressionAsync` (from api-contracts.md)
- `memory_compression_retry_attempts`: 3 (from data-schema.md)
- `openai_compression_model_premium`: `gpt-4o` (from api-contracts.md)
- `openai_compression_model_standard`: `gpt-4o-mini` (from api-contracts.md)
- `webhook_idempotency_field`: `stripe_event_id` (from data-schema.md)
- `stripe_event:checkout_completed`: `checkout.session.completed` (from api-contracts.md)
- `stripe_event:subscription_updated`: `customer.subscription.updated` (from api-contracts.md)
- `stripe_event:subscription_deleted`: `customer.subscription.deleted` (from api-contracts.md)
- `stripe_event:invoice_payment_failed`: `invoice.payment_failed` (from api-contracts.md)
- `webhook_lib_exports`: `verifyWebhookSignature, routeWebhookEvent` (from api-contracts.md)
- `supabase_client_export`: `supabaseServer` as singleton (from api-contracts.md)
- `subscription_billing_date_field`: `subscription.items.data[0].current_period_end` (from data-schema.md)

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\memory\executor.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 4. Key test cases:
- Mock `server-only` to `({})` to prevent node errors
- Mock `@/lib/memory/trigger`, `@/lib/memory/compress`, `@/lib/memory/patch`
- `executeCompressionAsync` never throws under any condition:
  - No compression needed → resolves undefined
  - Initial compression succeeds → resolves undefined
  - Patch compression succeeds → resolves undefined
  - Trigger check throws → resolves undefined
  - Compression fn throws on all 3 attempts (premium=false) → resolves undefined (advance fake timers)
  - Compression fn throws on all 3 attempts (premium=true, uses gpt-4o) → resolves undefined
  - Patch fn throws on all 3 attempts (non-premium, uses gpt-4o-mini) → resolves undefined
  - Retries exactly 3 times before giving up
  - Succeeds on second attempt, does not call compression a third time
  - Resolves even if unexpected outer error occurs

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\stripe\webhooks.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 5. Key test cases:
- Mock `@/lib/stripe/config` (stripe.webhooks.constructEvent, stripe.subscriptions.retrieve)
- Mock `@/lib/supabase/server`
- `verifyWebhookSignature`: calls constructEvent with body and signature, propagates errors
- `routeWebhookEvent`: handles all 4 event types, idempotency early return, premium addon detection, null customer early return, missing user_id early return, subscription update with no base price (early return), silently ignores unhandled event types
- Billing date field verification: uses `subscription.items.data[0].current_period_end`

**Sub-step 3 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\supabase\client.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 6. Key test cases:
- Mock `@supabase/supabase-js` so no real network calls are made
- `lib/supabase/client` exports `supabaseClient` (note: NOT `supabaseServer` — client.ts is the browser client) without throwing when env vars are present
- `createClient` was called with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and `auth: { persistSession: true, autoRefreshToken: true }`
- Verify the module does NOT import from `lib/env.ts` (reads process.env directly)

**Sub-step 4 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 5 — Run tests:**
Run `npx vitest run`. All 3 test files must pass with zero failures.

**Sub-step 6 — Commit:**
Stage: `git add __tests__/lib/memory/executor.test.ts __tests__/lib/stripe/webhooks.test.ts __tests__/lib/supabase/client.test.ts`
Commit message: `test(unit): add memory executor, stripe webhooks, and supabase client unit tests`

## Verification
- [ ] `__tests__/lib/memory/executor.test.ts` exists and verifies `executeCompressionAsync` never throws
- [ ] `__tests__/lib/stripe/webhooks.test.ts` exists and tests idempotency early return
- [ ] `__tests__/lib/supabase/client.test.ts` exists and tests browser client construction
- [ ] `npx vitest run` exits 0 with zero failing tests for these 3 files
- [ ] No test makes a real database, Stripe, or OpenAI call
- [ ] `npx tsc --noEmit` exits 0

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-14" from pendingSteps to completedSteps
- Set steps["prompt-14"].status = "complete"
