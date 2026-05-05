# Step 13: M6-A — Unit Tests: session, rate-limit, memory trigger

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-13" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-13"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Write 3 unit test files. All external dependencies must be mocked. No real database, Stripe, or OpenAI calls.

Key values from context (do NOT invent):
- `cookie_name`: `risedial_session` (from auth-values.md)
- `jwt_algorithm`: HS256 (from auth-values.md)
- `jwt_claim:user_id`: `user_id` (from auth-values.md)
- `jwt_claim:subscription_status`: `subscription_status` (from auth-values.md)
- `jwt_expiry_seconds`: 2592000 = 30 days (from auth-values.md)
- `cookie.httpOnly`, `cookie.sameSite`, `cookie.secure`, `cookie.maxAge`, `cookie.path` (from auth-values.md)
- `rate_limit_max_messages`: 60 (from data-schema.md)
- `rate_limit_window_minutes`: 60 (from data-schema.md)
- `rate_limit_return_shape`: `{ allowed: boolean, remaining: number }` (from api-contracts.md)
- `memory_compression_initial_threshold`: 50 (from data-schema.md)
- `memory_compression_patch_interval`: 10 (from data-schema.md)
- `compression_trigger_return_shape`: `{ shouldCompress: boolean, isInitial: boolean, isPatch: boolean }` (from api-contracts.md)
- `table:rate_limit_tracking`: `rate_limit_tracking` (from data-schema.md)

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\auth\session.test.ts`:**
Create the directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 1. Key test cases:
- `createSession` returns 3-part dot-separated JWT, embeds user_id and subscription_status, encodes HS256/JWT header
- `verifySession` returns payload for valid token, null for tampered signature, null for <3 parts, null for >3 parts, null for garbage string, null for expired token (use `vi.setSystemTime`)
- `setSessionCookie` sets `risedial_session` cookie with httpOnly:true, sameSite:'strict', secure:true, maxAge:2592000, path:'/'
- `clearSessionCookie` sets `risedial_session` to empty string with maxAge:0
Mock `next/server` with a MockNextResponse class that has a MockCookies store.
Import `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie` from `@/lib/auth/session`.

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\rise\rate-limit.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 2. Key test cases:
- Mock `@/lib/supabase/server` at module boundary
- `checkRateLimit`: allowed:true remaining:60 when no active window; allowed:true remaining:30 when count=30; allowed:false remaining:0 when count=60; allowed:false remaining:0 when count=65; throws when supabase returns error
- `recordMessage`: calls `supabaseServer.rpc('increment_message_count', { p_user_id: userId })`, throws when rpc returns error
Note: The `recordMessage` tests in M6 must match the actual implementation from Fix D (which uses RPC). The M6 tests in the refined-prompt show an older read-modify-write pattern — use the RPC pattern instead to match the Fixed D implementation.

**Sub-step 3 — Create `C:\Users\Alexb\Documents\RiseDialapp\__tests__\lib\memory\trigger.test.ts`:**
Create directory path if needed. Write the full test file as specified in the refined-prompt.md M6 section 3. Key test cases:
- Mock `@/lib/supabase/server` at module boundary
- `checkCompressionTrigger` at count=49 → no compress; count=50 → initial; count=51 → no compress; count=59 → no compress; count=60 → patch; count=61 → no compress; count=70 → patch; count=80 → patch; error → false; null count → false

**Sub-step 4 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 5 — Run tests:**
Run `npx vitest run`. All 3 test files must pass with zero failures.

**Sub-step 6 — Commit:**
Stage: `git add __tests__/lib/auth/session.test.ts __tests__/lib/rise/rate-limit.test.ts __tests__/lib/memory/trigger.test.ts`
Commit message: `test(unit): add session, rate-limit, and memory trigger unit tests`

## Verification
- [ ] `__tests__/lib/auth/session.test.ts` exists and tests createSession, verifySession, setSessionCookie, clearSessionCookie
- [ ] `__tests__/lib/rise/rate-limit.test.ts` exists and tests checkRateLimit and recordMessage with RPC mock
- [ ] `__tests__/lib/memory/trigger.test.ts` exists and tests checkCompressionTrigger at counts 49, 50, 51, 59, 60, 61, 70, 80
- [ ] `npx vitest run` exits 0 with zero failing tests for these 3 files
- [ ] No test makes a real database call
- [ ] `npx tsc --noEmit` exits 0

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-13" from pendingSteps to completedSteps
- Set steps["prompt-13"].status = "complete"
