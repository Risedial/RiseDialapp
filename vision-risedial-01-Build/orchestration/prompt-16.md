# Step 16: M7 — E2E Test Suite (signup, auth, chat, billing specs + globalSetup/Teardown)

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-16" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-16"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Write 4 E2E spec files. The `globalSetup.ts` and `globalTeardown.ts` were created in prompt-12; update them here if the M7 spec requires different content (e.g., bcrypt-hashed password for real login flow).

Key values from context (do NOT invent):
- `cookie_name`: `risedial_session` (from auth-values.md)
- `e2e_base_url`: `http://localhost:3000` (from external-services.md)
- `e2e_supabase_project`: `risedial-test` (from external-services.md)
- `ci_skip_stripe_e2e_var`: `SKIP_STRIPE_E2E` (from api-contracts.md)
- `stripe_test_card`: `4242 4242 4242 4242` (from api-contracts.md)
- `e2e_test_user_fixture`: `e2e/fixtures/test-user.json` (from api-contracts.md)
- `table:users` columns: `email`, `password_hash`, `subscription_status` (from data-schema.md)
- `enum:users.subscription_status` valid values: `['active', 'lapsed', 'cancelled']` (from data-schema.md)
- `env_var:SUPABASE_URL`, `env_var:SUPABASE_SERVICE_ROLE_KEY`, `env_var:STRIPE_SECRET_KEY` (from external-services.md)

**Pre-requisite check:**
Verify `@playwright/test` is installed and `npx playwright install chromium` has been run (done in prompt-11).

**Sub-step 1 — Update `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts`:**
Read the current file. Update if needed to match the M7 spec: the setup should hash the test user's password with bcrypt so the login flow can authenticate via the app's `/api/auth/signin` endpoint. Use `bcryptjs` (already in dependencies). Generate a unique email with `crypto.randomBytes(4).toString('hex')`. Write credentials to `e2e/fixtures/test-user.json` with `{ id, email, password }` (plain password for use in the login flow).

**Sub-step 2 — Update `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts`:**
Read the current file. Ensure it reads the fixture file, deletes the user by `id` from `users` table (CASCADE removes all related rows), and removes the fixture file.

**Sub-step 3 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\signup.spec.ts`:**
Flow 1 — Full signup with Stripe test card. Must be skipped entirely when `SKIP_STRIPE_E2E === 'true'`.
Use `test.skip(SKIP, 'Skipped because SKIP_STRIPE_E2E=true')`.
Test steps:
1. Navigate to `/signin` and switch to Create Account mode
2. Fill email and password, submit → wait for `/plan-selection`
3. Click Monthly plan, Continue to Checkout → wait for `checkout.stripe.com`
4. Fill Stripe test card `4242 4242 4242 4242`, expiry `12 / 30`, CVC `123`, ZIP `10001`
5. Submit → wait for `/onboarding`
6. Verify 'Rise is listening' text visible

**Sub-step 4 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\auth.spec.ts`:**
Flow 2 — Login with test user credentials, verify `risedial_session` cookie is set, verify page remains on chat interface after reload.
Test steps:
1. Navigate to `/signin`, fill credentials from fixture, submit
2. Wait for `/onboarding` or `/chat/` URL
3. If `/onboarding`: click Skip, wait for `/chat/**`
4. Verify `risedial_session` cookie exists in `context.cookies()`
5. Capture chat URL
6. Reload page, wait for same chat URL
7. Verify page is NOT `/signin` and IS `/chat/`
8. Verify 'Online' text visible

**Sub-step 5 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\chat.spec.ts`:**
Flow 3 — Send a message, wait up to 30 seconds for AI response, verify both messages persist after reload.
Test steps:
1. Login and navigate to chat (reuse login helper)
2. Fill message input (`aria-label="Message input"`) with test message
3. Click send button (`aria-label="Send message"`)
4. Verify user message visible
5. Wait for 'Rise is typing' indicator to appear then disappear (30s timeout)
6. Verify at least one message bubble after the user message
7. Reload page, wait for same chat URL
8. Verify user message text still visible
9. Verify at least 2 message elements visible after reload

**Sub-step 6 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\billing.spec.ts`:**
Flow 4 — Navigate to Settings, click "Manage Billing", verify redirect to billing.stripe.com.
Use `page.route('**/api/subscription/portal', ...)` to mock the portal API response with a fake `billing.stripe.com` URL so no live Stripe account is required.
Test steps:
1. Set up route mock BEFORE login (intercept POST to `/api/subscription/portal`, return `{ url: 'https://billing.stripe.com/p/session/test_e2e_mock_session_id' }`)
2. Login and navigate to `/settings`
3. Set up `page.waitForURL(/billing\.stripe\.com/, { timeout: 15_000 })`
4. Click "Manage Billing" button
5. Await navigation
6. Verify `page.url()` contains `billing.stripe.com`

**Sub-step 7 — Verify .gitignore entries:**
Confirm `e2e/fixtures/`, `playwright-report/`, `test-results/` are in `.gitignore` (done in prompt-11, verify).

**Sub-step 8 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 9 — Commit:**
Stage: `git add e2e/globalSetup.ts e2e/globalTeardown.ts e2e/signup.spec.ts e2e/auth.spec.ts e2e/chat.spec.ts e2e/billing.spec.ts`
Commit message: `test(e2e): add four E2E flows — signup, auth persistence, chat, billing portal`

## Verification
- [ ] `e2e/signup.spec.ts` exists and uses `test.skip` when `SKIP_STRIPE_E2E=true`
- [ ] `e2e/auth.spec.ts` exists and verifies `risedial_session` cookie is set after login
- [ ] `e2e/chat.spec.ts` exists and verifies AI assistant response appears within 30 seconds
- [ ] `e2e/billing.spec.ts` exists and verifies redirect URL contains `billing.stripe.com`
- [ ] `e2e/globalSetup.ts` creates a test user in the `users` table with `subscription_status: 'active'`
- [ ] `e2e/globalTeardown.ts` deletes the test user row
- [ ] `e2e/fixtures/` is in `.gitignore`
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx playwright test` exits 0 locally against a running dev server (with .env.local pointing at risedial-test project)

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-16" from pendingSteps to completedSteps
- Set steps["prompt-16"].status = "complete"
