# Module 7 — E2E Test Suite: Flow

## Pre-conditions
- Module 6 complete: `npx vitest run --coverage` exits 0 with 100% coverage
- `playwright.config.ts` exists with `globalSetup` and `globalTeardown` references
- `.env.local` points to `risedial-test` Supabase project and Stripe test keys
- `risedial-test` Supabase project exists with both migrations applied

---

## Steps

**1.** Verify the `risedial-test` Supabase project has the correct schema.

In the Supabase dashboard for `risedial-test`:
- Confirm tables: `users`, `chats`, `messages`, `memory_profiles`, `rate_limit_tracking`, `webhook_events`
- Confirm the `increment_message_count` function exists (from migration 002)

If the test project does not have the migrations applied:
```sql
-- Apply in Supabase SQL Editor for risedial-test project
-- Paste contents of supabase/migrations/001_initial_schema.sql
-- Then paste contents of supabase/migrations/002_atomic_rate_limit.sql
```

**2.** Update `.env.local` to use risedial-test credentials.

Ensure `.env.local` has:
- `SUPABASE_URL` → risedial-test project URL
- `SUPABASE_SERVICE_ROLE_KEY` → risedial-test service role key
- `NEXT_PUBLIC_SUPABASE_URL` → same as SUPABASE_URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → risedial-test anon key
- All Stripe vars → Stripe test mode keys
- `OPENAI_API_KEY` → valid test-mode key

**3.** Replace the placeholder `e2e/globalSetup.ts` with the full implementation from SPEC.md.

**4.** Replace the placeholder `e2e/globalTeardown.ts` with the full implementation from SPEC.md.

**5.** Create `e2e/fixtures/` directory (it will be gitignored):
```bash
mkdir e2e/fixtures
```

Add to `.gitignore`:
```
e2e/fixtures/
playwright-report/
test-results/
```

**6.** Write `e2e/signup.spec.ts` (Flow 1):

```typescript
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SKIP_STRIPE = process.env.SKIP_STRIPE_E2E === 'true'

test.describe('Sign-up + onboarding', () => {
  const testEmail = `signup-${Date.now()}@risedial.test`
  const testPassword = 'SignupTest123!'
  let userId: string | null = null

  test.afterAll(async () => {
    if (userId) {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase.from('users').delete().eq('id', userId)
    }
  })

  test('new user can sign up, pay, and land on chat', async ({ page }) => {
    if (SKIP_STRIPE) {
      test.skip(true, 'Skipped in CI: SKIP_STRIPE_E2E=true')
    }

    await page.goto('/signup')
    await page.fill('[name="email"], [type="email"]', testEmail)
    await page.fill('[name="password"], [type="password"]', testPassword)
    await page.click('[type="submit"]')

    // Redirected to Stripe checkout
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 15000 })

    // Fill Stripe test card
    await page.fill('[placeholder*="Card number"], [autocomplete="cc-number"]', '4242424242424242')
    await page.fill('[placeholder*="MM / YY"], [autocomplete="cc-exp"]', '12/30')
    await page.fill('[placeholder*="CVC"], [autocomplete="cc-csc"]', '123')
    await page.click('[type="submit"]')

    // Redirected back to app
    await expect(page).not.toHaveURL(/stripe\.com/, { timeout: 30000 })

    // Chat interface visible
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible({ timeout: 10000 })

    // Wait for webhook to set subscription_status active
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    let isActive = false
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const { data } = await supabase
        .from('users')
        .select('id, subscription_status')
        .eq('email', testEmail)
        .single()
      if (data?.subscription_status === 'active') {
        isActive = true
        userId = data.id
        break
      }
    }
    expect(isActive, 'subscription_status did not become active within 15s').toBe(true)
  })
})
```

**7.** Write `e2e/auth.spec.ts` (Flow 2):

```typescript
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

function getTestUser() {
  const fixturePath = path.join(__dirname, 'fixtures', 'test-user.json')
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
}

test.describe('Login + session persistence', () => {
  test('user can log in and session persists on reload', async ({ page }) => {
    const { email, password } = getTestUser()

    await page.goto('/login')
    await page.fill('[name="email"], [type="email"]', email)
    await page.fill('[name="password"], [type="password"]', password)
    await page.click('[type="submit"]')

    // Redirected to chat interface
    await expect(page).not.toHaveURL('/login', { timeout: 10000 })

    // Session cookie set
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name === 'risedial_session')
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie?.httpOnly).toBe(true)

    // Reload — still logged in
    await page.reload()
    await expect(page).not.toHaveURL('/login', { timeout: 5000 })

    // Protected API route returns 200
    const response = await page.request.get('/api/chats')
    expect(response.status()).toBe(200)
  })
})
```

**8.** Write `e2e/chat.spec.ts` (Flow 3):

```typescript
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

function getTestUser() {
  const fixturePath = path.join(__dirname, 'fixtures', 'test-user.json')
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
}

test.describe('Chat + AI response', () => {
  test('user can send a message and receive an AI response', async ({ page }) => {
    const { email, password } = getTestUser()

    // Log in via UI
    await page.goto('/login')
    await page.fill('[name="email"], [type="email"]', email)
    await page.fill('[name="password"], [type="password"]', password)
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL('/login', { timeout: 10000 })

    // Navigate to chat
    await page.goto('/')  // adjust to the actual chat URL

    // Send message
    const messageInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="Message"]').first()
    await messageInput.fill('Hello, this is an E2E test')
    await messageInput.press('Enter')  // or click send button

    // User message appears
    await expect(page.locator('text=Hello, this is an E2E test')).toBeVisible({ timeout: 5000 })

    // AI response appears within 30 seconds
    await expect(page.locator('[data-role="assistant"], .assistant-message').first()).toBeVisible({
      timeout: 30000,
    })

    // Response is not an error
    const responseText = await page.locator('[data-role="assistant"], .assistant-message').first().textContent()
    expect(responseText).not.toMatch(/Error|500|failed/i)

    // Messages persist after reload
    await page.reload()
    await expect(page.locator('text=Hello, this is an E2E test')).toBeVisible({ timeout: 5000 })
  })
})
```

**9.** Write `e2e/billing.spec.ts` (Flow 4):

```typescript
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

function getTestUser() {
  const fixturePath = path.join(__dirname, 'fixtures', 'test-user.json')
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
}

test.describe('Stripe billing portal', () => {
  test('manage subscription redirects to billing.stripe.com', async ({ page }) => {
    const { email, password } = getTestUser()

    // Log in via UI
    await page.goto('/login')
    await page.fill('[name="email"], [type="email"]', email)
    await page.fill('[name="password"], [type="password"]', password)
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL('/login', { timeout: 10000 })

    // Navigate to billing/account settings
    await page.goto('/account')  // adjust to actual billing settings URL

    // Click manage subscription
    const manageButton = page.locator('text=Manage subscription, text=Manage billing, button:has-text("Manage")').first()
    await manageButton.click()

    // Redirected to Stripe Customer Portal
    await expect(page).toHaveURL(/billing\.stripe\.com/, { timeout: 15000 })

    // Navigate back
    await page.goBack()

    // App still shows correct subscription status
    const statusEl = page.locator('[data-subscription-status], text=active, text=Active').first()
    await expect(statusEl).toBeVisible({ timeout: 5000 })
  })
})
```

**10.** Run all E2E tests locally:
```bash
npx playwright test
```

Expected: all 4 spec files run; Flow 1 may be skipped if `SKIP_STRIPE_E2E` is set. Fix any failures by adjusting selectors to match the actual UI.

**11.** Commit:
```bash
git add e2e/
git add .gitignore
git commit -m "test(e2e): add 4 Playwright flows for signup, auth, chat, and billing"
```

---

## Selector Adjustment Guide

The spec files above use approximate selectors. Adjust them to match the actual HTML in the RiseDial UI:

| Selector in spec | How to find the real selector |
|-----------------|-------------------------------|
| `[name="email"]` | Inspect the signup/login form input's `name` or `id` attribute |
| `[type="submit"]` | Inspect the submit button; use `button:has-text("Sign up")` if there are multiple submit buttons |
| `[data-role="assistant"]` | Inspect a rendered assistant message in the chat to find the correct attribute or class |
| `'/account'` | Check the app's navigation for the account/billing settings page URL |
| `text=Manage subscription` | Check the exact label on the billing management button |

Use `npx playwright test --debug` to open the Playwright inspector for interactive selector exploration.

---

## Post-conditions

- `npx playwright test` exits 0 locally with all 4 spec files running
- `e2e/fixtures/test-user.json` is created by globalSetup and deleted by globalTeardown
- `e2e/fixtures/` is in `.gitignore`
- Flow 1 is skippable via `SKIP_STRIPE_E2E=true`
- Ready to begin Module 8
