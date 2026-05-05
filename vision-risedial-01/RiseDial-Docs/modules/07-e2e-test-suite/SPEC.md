# Module 7 — E2E Test Suite: SPEC

## Purpose

Write Playwright tests covering the four critical user flows against a local `npm run dev` server. Tests use the `risedial-test` Supabase project and Stripe test mode. A global setup script creates a pre-seeded test user before tests run; teardown cleans up after.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 6 complete — `npx vitest run --coverage` exits 0 with 100% coverage

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| `playwright.config.ts` | TypeScript | Project root | Yes |
| Running local dev server | Process | Terminal | Yes — Playwright starts it via webServer config |
| `.env.local` | Env file | Project root | Yes — must point to `risedial-test` Supabase project with Stripe test keys |

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `e2e/globalSetup.ts` | `e2e/` | Creates test user in risedial-test Supabase; writes credentials to fixture |
| `e2e/globalTeardown.ts` | `e2e/` | Deletes test user from risedial-test Supabase |
| `e2e/fixtures/test-user.json` | `e2e/fixtures/` | Email + password for pre-seeded test user (gitignored) |
| `e2e/signup.spec.ts` | `e2e/` | Flow 1: Sign-up + Stripe checkout (skipped in CI) |
| `e2e/auth.spec.ts` | `e2e/` | Flow 2: Login + session persistence |
| `e2e/chat.spec.ts` | `e2e/` | Flow 3: Chat + AI response |
| `e2e/billing.spec.ts` | `e2e/` | Flow 4: Stripe billing portal |

---

## Supabase Test Project

All E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing. It has the same schema as production (both migrations applied: `001_initial_schema.sql` and `002_atomic_rate_limit.sql`).

The `.env.local` file for E2E testing must use the `risedial-test` credentials:
- `SUPABASE_URL` → risedial-test project URL
- `SUPABASE_SERVICE_ROLE_KEY` → risedial-test service role key
- `NEXT_PUBLIC_SUPABASE_URL` → same as SUPABASE_URL for risedial-test
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → risedial-test anon key

---

## CI Behavior

The signup flow (Flow 1) requires Stripe to deliver a webhook to the app after checkout completion. In CI (GitHub Actions), there is no public URL for Stripe to reach, so webhook delivery is not possible without the Stripe CLI.

**Resolution:** Flow 1 is marked with `test.skip` when `process.env.SKIP_STRIPE_E2E === 'true'`. This env var is set to `'true'` in the CI e2e-tests job. Flows 2, 3, and 4 run in CI without modification. Webhook handler logic is fully covered by unit tests in Module 6.

---

## globalSetup.ts Specification

The global setup script runs once before all tests in the Playwright session. It:

1. Creates a test user directly in the Supabase `users` table using the service role client (bypasses bcrypt and auth flow)
2. Sets `subscription_status: 'active'`, `plan_type: 'monthly'`, `has_premium_memory: false`, and a pre-computed `bcrypt.hash` of the test password
3. Writes the test user's email and password to `e2e/fixtures/test-user.json`

```typescript
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const TEST_USER_EMAIL = `e2e-test-${Date.now()}@risedial.test`
const TEST_USER_PASSWORD = 'E2eTestPass123!'

export default async function globalSetup() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 10)

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: TEST_USER_EMAIL,
      password_hash: passwordHash,
      subscription_status: 'active',
      plan_type: 'monthly',
      has_premium_memory: false,
      stripe_customer_id: 'cus_test_e2e_placeholder',
      stripe_subscription_id: 'sub_test_e2e_placeholder',
    })
    .select('id')
    .single()

  if (error || !user) {
    throw new Error(`globalSetup: Failed to create test user: ${error?.message}`)
  }

  // Write credentials to fixture file for tests to read
  const fixtureDir = path.join(__dirname, 'fixtures')
  if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir)
  
  fs.writeFileSync(
    path.join(fixtureDir, 'test-user.json'),
    JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD, id: user.id })
  )
}
```

---

## globalTeardown.ts Specification

Runs once after all tests complete. Deletes the test user row (cascade-deletes all related chats, messages, rate_limit_tracking rows).

```typescript
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

export default async function globalTeardown() {
  const fixturePath = path.join(__dirname, 'fixtures', 'test-user.json')
  if (!fs.existsSync(fixturePath)) return

  const { email } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('users').delete().eq('email', email)

  fs.unlinkSync(fixturePath)
}
```

---

## Flow 1 — Sign-up + Stripe Checkout (`e2e/signup.spec.ts`)

**CI behavior:** Entire file skipped when `SKIP_STRIPE_E2E=true`

**Steps:**
1. Navigate to `/signup`
2. Fill in a new email address (unique per test run) and a valid password
3. Submit the signup form
4. Assert: browser is redirected to a Stripe Checkout page (URL contains `checkout.stripe.com`)
5. Fill in Stripe test card: number `4242 4242 4242 4242`, any future expiry, any CVC, any name
6. Complete the checkout (click Pay button)
7. Assert: browser is redirected back to the app (URL no longer contains `stripe.com`)
8. Assert: the chat interface is visible (a text input or send button is present)
9. Poll the Supabase `users` table for up to 15 seconds: `subscription_status` equals `'active'`
10. Assert: `subscription_status` is `'active'`

**Cleanup:** The test user created during signup must be deleted in teardown. Since this user is created by the signup flow (not by globalSetup), it needs separate cleanup logic — either in an `afterAll` block within this spec or via a Supabase delete call keyed on the email used.

---

## Flow 2 — Login + Session Persistence (`e2e/auth.spec.ts`)

**CI behavior:** Runs in CI.

**Steps:**
1. Read test user credentials from `e2e/fixtures/test-user.json`
2. Navigate to `/login`
3. Fill in email and password from the fixture
4. Submit the login form
5. Assert: browser is redirected to the chat interface (not `/login`)
6. Assert: a cookie named `risedial_session` is set on the response (check via `page.context().cookies()`)
7. Reload the page
8. Assert: still on the chat interface (not redirected to `/login`)
9. Make a direct GET request to a protected API route (e.g., `GET /api/chats` or equivalent)
10. Assert: response status is 200 (not 401)

---

## Flow 3 — Chat + AI Response (`e2e/chat.spec.ts`)

**CI behavior:** Runs in CI.

**Note:** This flow makes a real OpenAI API call. The `.env.local` for CI must have a valid `OPENAI_API_KEY`. The test allows up to 30 seconds for the AI response.

**Steps:**
1. Log in as the test user via the UI (navigate to `/login`, fill credentials, submit)
2. Navigate to the chat page (or create a new chat if required)
3. Find the message input field
4. Type the message: `"Hello, this is an E2E test"`
5. Submit the message (click Send or press Enter)
6. Assert: the user message `"Hello, this is an E2E test"` appears in the chat history
7. Wait up to 30 seconds for an assistant response to appear
8. Assert: an assistant message appears in the chat history
9. Assert: the assistant message is not an error message (does not contain `"Error"`, `"500"`, `"failed"`)
10. Reload the page
11. Assert: both the user message and assistant message are still visible after reload

---

## Flow 4 — Stripe Billing Portal (`e2e/billing.spec.ts`)

**CI behavior:** Runs in CI.

**Note:** This flow tests the redirect to Stripe Customer Portal but does not complete any billing action.

**Steps:**
1. Log in as the test user via the UI
2. Navigate to the account or billing settings page (find the URL by looking at the app's navigation)
3. Find and click the "Manage subscription" button (or equivalent — check the app UI for the exact label)
4. Assert: the browser navigates to a URL containing `billing.stripe.com`
5. (Do not interact with the Stripe portal — just verify the redirect)
6. Navigate back to the app
7. Assert: the app still shows the correct subscription status (`active`)

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Stripe checkout webhook not received within 15 seconds (Flow 1) | Flow 1 times out at 15 seconds with a descriptive `Error: subscription_status did not become 'active' within 15s` message. The test fails visibly. |
| Dev server fails to start for webServer config | Playwright reports the webServer startup failure before any test runs. Check that port 3000 is free and `.env.local` is populated. |
| AI response takes more than 30 seconds (Flow 3) | Test fails with `Timeout exceeded 30s`. This is not a test bug — it indicates the OpenAI call is too slow. Investigate the API key rate limits. |
| globalSetup fails to create test user | Playwright aborts all tests with the error from globalSetup. Fix the Supabase connection before re-running. |

---

## Files to Add to .gitignore

```
e2e/fixtures/
playwright-report/
test-results/
```

---

## AI/LLM Used

None (the pipeline itself uses no AI; Flow 3 exercises the app's real AI integration against the OpenAI API).
