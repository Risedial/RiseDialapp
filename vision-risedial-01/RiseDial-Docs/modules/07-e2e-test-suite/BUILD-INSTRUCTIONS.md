# Module 7 — E2E Test Suite: Build Instructions

## What You Are Building

Four Playwright spec files plus globalSetup/globalTeardown scripts. Tests run against a local dev server using the `risedial-test` Supabase project and Stripe test mode.

---

## Prerequisites

- Module 6 complete: 100% coverage passing
- `playwright.config.ts` references `e2e/globalSetup.ts` and `e2e/globalTeardown.ts`
- `risedial-test` Supabase project exists with both migrations applied
- `.env.local` points to risedial-test credentials
- `npx playwright install chromium` already done in Module 5

---

## Step 1 — Verify risedial-test Supabase schema

Open the Supabase dashboard for the `risedial-test` project. Confirm:
- Tables: `users`, `chats`, `messages`, `memory_profiles`, `rate_limit_tracking`, `webhook_events`
- Database function: `increment_message_count`

If missing: apply migrations from `supabase/migrations/` in the Supabase SQL Editor.

---

## Step 2 — Update .env.local for test mode

Ensure `.env.local` uses:
- `risedial-test` Supabase URL and keys (not production)
- Stripe test mode keys (`sk_test_*`, `whsec_*`)
- A valid `OPENAI_API_KEY` (needed for Flow 3 in local testing)

---

## Step 3 — Create globalSetup.ts

Replace `e2e/globalSetup.ts` with the full implementation from SPEC.md.

The implementation:
1. Creates a test user in `risedial-test` with `subscription_status: 'active'`
2. Uses `bcrypt.hash` to create a proper password hash
3. Writes `{ email, password, id }` to `e2e/fixtures/test-user.json`

---

## Step 4 — Create globalTeardown.ts

Replace `e2e/globalTeardown.ts` with the full implementation from SPEC.md.

The implementation:
1. Reads the test user email from `e2e/fixtures/test-user.json`
2. Deletes the user row from Supabase (cascade-deletes all related data)
3. Deletes the fixture file

---

## Step 5 — Update .gitignore

Add:
```
e2e/fixtures/
playwright-report/
test-results/
```

---

## Step 6 — Write the 4 spec files

Copy the spec implementations from FLOW.md into the respective files.

**Important:** The selectors in the spec files are approximate. Before running, inspect the actual RiseDial UI to find the correct selectors:

```bash
# Start the dev server
npm run dev

# Open Playwright inspector to explore selectors interactively
npx playwright codegen http://localhost:3000/login
```

The Playwright codegen tool will generate selector code as you click through the UI.

---

## Step 7 — Run tests locally

```bash
# Run all E2E tests
npx playwright test

# Run with UI for debugging
npx playwright test --ui

# Run a specific spec
npx playwright test e2e/auth.spec.ts

# Run with debug mode for step-through
npx playwright test e2e/auth.spec.ts --debug
```

Fix any selector mismatches by updating the spec files to use the correct element attributes or text.

---

## Step 8 — Verify globalSetup/globalTeardown work correctly

Check that:
- Before the tests: `e2e/fixtures/test-user.json` does not exist
- During the tests: `e2e/fixtures/test-user.json` exists with email/password/id
- After the tests: `e2e/fixtures/test-user.json` is deleted
- In the Supabase dashboard: the test user row is cleaned up after the run

---

## Step 9 — Commit

```bash
git add e2e/globalSetup.ts e2e/globalTeardown.ts
git add e2e/signup.spec.ts e2e/auth.spec.ts e2e/chat.spec.ts e2e/billing.spec.ts
git add .gitignore
git commit -m "test(e2e): add 4 Playwright flows for signup, auth, chat, and billing"
```

---

## Selector Reference

For each test, the hardest part is finding the right selectors. Here is the approach:

**Login form:**
```typescript
// Try these in order until one works:
await page.fill('[name="email"]', email)
await page.fill('[id="email"]', email)
await page.fill('input[type="email"]', email)
await page.fill('input[placeholder*="email" i]', email)
```

**Submit button:**
```typescript
// Try these in order:
await page.click('[type="submit"]')
await page.click('button:has-text("Sign in")')
await page.click('button:has-text("Log in")')
```

**Message input:**
```typescript
// Try these in order:
await page.fill('textarea', message)
await page.fill('input[placeholder*="message" i]', message)
await page.fill('[data-testid="message-input"]', message)
```

**Manage subscription button:**
```typescript
// Try these in order:
await page.click('text=Manage subscription')
await page.click('button:has-text("Manage")')
await page.click('[data-testid="manage-billing"]')
```

---

## Definition of Done

- [ ] `npx playwright test` exits 0 locally with all 4 spec files running
- [ ] `e2e/globalSetup.ts` creates a test user with `subscription_status: 'active'`
- [ ] `e2e/globalTeardown.ts` deletes the test user after all tests
- [ ] `e2e/fixtures/` is in `.gitignore`
- [ ] Flow 1 (`e2e/signup.spec.ts`) is skipped when `SKIP_STRIPE_E2E=true`
- [ ] Flows 2, 3, 4 pass without `SKIP_STRIPE_E2E` set
- [ ] Ready to begin Module 8
