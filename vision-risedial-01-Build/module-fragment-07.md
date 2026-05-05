# Module Fragment 07 — E2E Test Suite

## Role

You are the build agent for **M7: E2E Test Suite**. Your sole job is to produce the six files listed in "Files to Change" so that `npx playwright test` exits 0 locally with all four E2E flows passing against a local dev server (`http://localhost:3000`) using the `risedial-test` Supabase project and Stripe test mode. You must not add product features, change UI, or alter API contract shapes. You must not add `export const runtime = 'edge'` to any file.

---

## Context

### Locked Tech Values

| Key | Value |
|-----|-------|
| cookie_name | `risedial_session` |
| e2e_base_url | `http://localhost:3000` |
| e2e_supabase_project | `risedial-test` |
| e2e_browser | Chromium (Desktop Chrome) |
| playwright_global_setup | `./e2e/globalSetup.ts` |
| playwright_global_teardown | `./e2e/globalTeardown.ts` |
| playwright_test_dir | `./e2e` |
| playwright_retries_ci | 2 |
| playwright_workers_ci | 1 |
| playwright_trace | `on-first-retry` |
| ci_skip_stripe_e2e_var | `SKIP_STRIPE_E2E` |
| stripe_test_card | `4242 4242 4242 4242` |
| e2e_test_user_fixture | `e2e/fixtures/test-user.json` |
| table:users | `users` |
| users.subscription_status | `text CHECK IN ('active','lapsed','cancelled') NOT NULL` |
| users.email | `text UNIQUE NOT NULL` |
| fk:chats.user_id | `REFERENCES users(id) ON DELETE CASCADE` |
| gitignore_entries | `.env.local`, `coverage/`, `playwright-report/`, `test-results/`, `e2e/fixtures/` |
| env_var:SUPABASE_URL | `SUPABASE_URL` |
| env_var:SUPABASE_SERVICE_ROLE_KEY | `SUPABASE_SERVICE_ROLE_KEY` |
| env_var:STRIPE_SECRET_KEY | `STRIPE_SECRET_KEY` |

### Locked Constraints (numbered)

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. All fixes must preserve existing API contract shapes.
6. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
7. E2E tests target the `risedial-test` Supabase project — a separate project created specifically for testing.
8. `npx tsc --noEmit` must exit 0 after every commit in this module.
9. Silent failure that results in an empty assistant message is not acceptable.
10. Do not add `export const runtime = 'edge'` to Node.js-only routes.

---

## What Must Be True After This Module

> `npx playwright test` exits 0 locally with all 4 E2E flows passing against a local dev server using the `risedial-test` Supabase project and Stripe test mode.

---

## Pre-requisites You Must Complete Before Writing Test Files

### 1. Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 2. Create `playwright.config.ts` in the project root

This file does not exist yet. Create it:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 3. Add entries to `.gitignore`

Append these lines to `.gitignore` if not already present:

```
coverage/
playwright-report/
test-results/
e2e/fixtures/
```

### 4. Add `@types/bcryptjs` if not present (already in devDependencies — no action needed)

### 5. Environment variables required at test runtime

The following must be set in `.env.local` (never committed) pointing at the **`risedial-test`** Supabase project:

```
SUPABASE_URL=<risedial-test project URL>
SUPABASE_SERVICE_ROLE_KEY=<risedial-test service role key>
STRIPE_SECRET_KEY=<stripe test mode secret key>
JWT_SECRET=<same value as production for local dev>
```

---

## Files to Change

### 1. `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts`

Creates a test user with `subscription_status: 'active'` directly in the `users` table via Supabase service role, then writes credentials to `e2e/fixtures/test-user.json` for use by the specs.

The `users` table stores `password_hash` (bcrypt). The test user is inserted with a known bcrypt hash so the login flow can authenticate via the app's `/api/auth/signin` endpoint. The password used is `E2eTestPassword1!`.

```typescript
// e2e/globalSetup.ts
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export default async function globalSetup(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'globalSetup: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Generate a unique test email to avoid collisions between runs
  const runId = crypto.randomBytes(4).toString('hex');
  const email = `e2e-test-${runId}@risedial-test.invalid`;
  const password = 'E2eTestPassword1!';

  const passwordHash = await bcrypt.hash(password, 10);

  // Insert test user directly into the users table
  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      subscription_status: 'active',
    })
    .select('id, email')
    .single();

  if (error || !inserted) {
    throw new Error(`globalSetup: failed to insert test user — ${error?.message ?? 'no data returned'}`);
  }

  // Ensure fixtures directory exists
  const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');
  fs.mkdirSync(fixturesDir, { recursive: true });

  // Write test user credentials to fixture file
  const fixture = {
    id: inserted.id as string,
    email: inserted.email as string,
    password,
  };

  fs.writeFileSync(
    path.join(fixturesDir, 'test-user.json'),
    JSON.stringify(fixture, null, 2),
    'utf-8'
  );

  console.log(`[globalSetup] Test user created: ${email} (id: ${inserted.id})`);
}
```

### 2. `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts`

Reads `e2e/fixtures/test-user.json`, deletes the test user by `id` (CASCADE removes all related rows — chats, messages, memory), then removes the fixture file.

```typescript
// e2e/globalTeardown.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export default async function globalTeardown(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[globalTeardown] Missing Supabase env vars — skipping cleanup.');
    return;
  }

  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');

  if (!fs.existsSync(fixturePath)) {
    console.warn('[globalTeardown] Fixture file not found — skipping cleanup.');
    return;
  }

  let fixture: { id: string; email: string; password: string };
  try {
    fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
      id: string;
      email: string;
      password: string;
    };
  } catch (err) {
    console.error('[globalTeardown] Could not parse fixture file:', err);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Delete user by id — FK ON DELETE CASCADE removes chats and all related rows
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', fixture.id);

  if (error) {
    console.error(`[globalTeardown] Failed to delete test user (id: ${fixture.id}):`, error.message);
  } else {
    console.log(`[globalTeardown] Test user deleted: ${fixture.email} (id: ${fixture.id})`);
  }

  // Remove fixture file
  try {
    fs.unlinkSync(fixturePath);
  } catch {
    // Non-fatal
  }
}
```

### 3. `C:\Users\Alexb\Documents\RiseDialapp\e2e\signup.spec.ts`

Flow 1 — Full signup with Stripe test card. Skipped entirely when `SKIP_STRIPE_E2E=true`.

The login page lives at `/signin` (the `(auth)/signin/page.tsx` route, accessible at `/signin`). The signup flow uses the same page toggled to "Create Account" mode. After account creation the app redirects to `/plan-selection`. Stripe Checkout is an external hosted page that loads the Stripe test card form.

```typescript
// e2e/signup.spec.ts
import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const SKIP = process.env.SKIP_STRIPE_E2E === 'true';

test.describe('Flow 1 — Signup with Stripe', () => {
  test.skip(SKIP, 'Skipped because SKIP_STRIPE_E2E=true');

  test('user can sign up, select a plan, and complete Stripe checkout', async ({ page }) => {
    const runId = crypto.randomBytes(4).toString('hex');
    const email = `e2e-signup-${runId}@risedial-test.invalid`;
    const password = 'E2eTestPassword1!';

    // --- Step 1: Navigate to sign-in page and switch to sign-up mode ---
    await page.goto('/signin');
    await expect(page.getByText('Create Account').first()).toBeVisible();

    // Toggle to Create Account mode
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Fill in credentials
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    // Submit — app routes to /plan-selection on success
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL('**/plan-selection', { timeout: 10_000 });

    // --- Step 2: Select monthly plan and proceed to Stripe ---
    await page.getByRole('button', { name: /Monthly/i }).click();
    await page.getByRole('button', { name: /Continue to Checkout/i }).click();

    // Stripe hosted checkout page
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });

    // --- Step 3: Fill in Stripe test card ---
    // Stripe checkout loads card fields in an iframe
    const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await cardFrame.locator('[placeholder="Card number"]').fill('4242 4242 4242 4242');
    await cardFrame.locator('[placeholder="MM / YY"]').fill('12 / 30');
    await cardFrame.locator('[placeholder="CVC"]').fill('123');
    await cardFrame.locator('[placeholder="ZIP"]').fill('10001');

    // Submit Stripe form
    await page.getByRole('button', { name: /Pay/i }).click();

    // --- Step 4: App redirects back to /checkout-success then /onboarding ---
    await page.waitForURL('**/onboarding', { timeout: 30_000 });
    await expect(page.getByText('Rise is listening')).toBeVisible();
  });
});
```

### 4. `C:\Users\Alexb\Documents\RiseDialapp\e2e\auth.spec.ts`

Flow 2 — Login with test user credentials, verify `risedial_session` cookie is set, and verify that after a page reload the user remains on the chat interface rather than being redirected to `/signin`.

The signin page is `/signin`. On successful login with `subscription_status: 'active'` and an existing `lastChatId`, the server redirects to `/chat/<chatId>`. Because the test user is freshly created with no chat history (`lastChatId` will be `null`), the signin route redirects to `/onboarding`. The spec must handle this by navigating through onboarding to reach a chat page, then verify persistence on reload.

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

test.describe('Flow 2 — Auth session persistence', () => {
  test('risedial_session cookie is set after login and page remains on chat after reload', async ({
    page,
    context,
  }) => {
    const { email, password } = loadFixture();

    // --- Step 1: Log in ---
    await page.goto('/signin');

    // Ensure we are in sign-in mode (heading visible)
    await expect(page.getByText('Sign In').first()).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // The test user has no chats yet, so the app redirects to /onboarding
    await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

    // If redirected to onboarding, skip through it to get a chat page
    if (page.url().includes('/onboarding')) {
      await page.getByRole('button', { name: 'Skip' }).click();
      await page.waitForURL('**/chat/**', { timeout: 10_000 });
    }

    // --- Step 2: Verify risedial_session cookie is set ---
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'risedial_session');
    expect(sessionCookie, 'risedial_session cookie should be set after login').toBeTruthy();
    expect(sessionCookie?.value.length).toBeGreaterThan(0);

    // --- Step 3: Capture current chat URL ---
    const chatUrl = page.url();
    expect(chatUrl).toMatch(/\/chat\//);

    // --- Step 4: Reload and verify page stays on chat interface (not redirected to /signin) ---
    await page.reload();
    await page.waitForURL(chatUrl, { timeout: 10_000 });

    // The chat page header contains the "Rise" identity and "Online" status
    await expect(page.getByText('Online').first()).toBeVisible();

    // Confirm we are NOT on /signin
    expect(page.url()).not.toContain('/signin');
    expect(page.url()).toContain('/chat/');
  });
});
```

### 5. `C:\Users\Alexb\Documents\RiseDialapp\e2e\chat.spec.ts`

Flow 3 — Send a message, wait up to 30 seconds for an AI assistant response, and verify both the user message and the assistant message persist after a page reload.

The chat page renders user messages in gradient right-aligned bubbles and assistant messages in left-aligned surface-color bubbles (with a "Rise" avatar). The `aria-label="Message input"` on the textarea and `aria-label="Send message"` on the send button are the correct selectors from the source.

```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

async function loginAndGetChatUrl(page: import('@playwright/test').Page): Promise<string> {
  const { email, password } = loadFixture();

  await page.goto('/signin');
  await expect(page.getByText('Sign In').first()).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.waitForURL('**/chat/**', { timeout: 10_000 });
  }

  return page.url();
}

test.describe('Flow 3 — Chat message persistence', () => {
  test('user message and assistant response both persist after page reload', async ({ page }) => {
    const chatUrl = await loginAndGetChatUrl(page);

    // --- Step 1: Send a message ---
    const testMessage = 'Hello Rise, this is an E2E test message.';

    const messageInput = page.getByLabel('Message input');
    await messageInput.fill(testMessage);
    await page.getByLabel('Send message').click();

    // --- Step 2: Verify user message appears immediately ---
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5_000 });

    // --- Step 3: Wait up to 30s for assistant response ---
    // The typing indicator has aria-label="Rise is typing" while waiting.
    // An assistant response is a non-empty text node inside a Rise bubble.
    // We wait for the typing indicator to disappear AND a second message to appear.
    await expect(page.getByRole('status', { name: 'Rise is typing' })).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('status', { name: 'Rise is typing' })).toBeHidden({
      timeout: 30_000,
    });

    // The assistant message container: the Rise bubble holds the response text.
    // We locate it by finding a div that follows a user message and contains non-empty text.
    // A simpler approach: the page should now have at least 2 message bubbles.
    // The last message is the assistant response — verify it is non-empty.
    const allMessages = page.locator('.chat-message-enter');
    await expect(allMessages.last()).toBeVisible({ timeout: 5_000 });

    // Capture the assistant response text before reload
    // We identify the Rise bubble by its aria-label="Rise is typing" sibling absence
    // and its left-aligned position. Use a broader selector: all text content of
    // the last visible message bubble.
    const lastBubbleText = await allMessages.last().textContent();
    expect(lastBubbleText?.trim().length).toBeGreaterThan(0);

    // --- Step 4: Reload the page ---
    await page.reload();
    await page.waitForURL(chatUrl, { timeout: 10_000 });

    // --- Step 5: Verify both messages persist after reload ---
    await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10_000 });

    // The assistant message also persisted — verify at least 2 messages are visible
    // by checking that the user message is not the only content
    const messagesAfterReload = page.locator('.chat-message-enter');
    // Wait for messages to load from API
    await expect(messagesAfterReload.first()).toBeVisible({ timeout: 10_000 });

    const messageCount = await messagesAfterReload.count();
    expect(messageCount, 'Both user and assistant messages should persist after reload').toBeGreaterThanOrEqual(2);
  });
});
```

### 6. `C:\Users\Alexb\Documents\RiseDialapp\e2e\billing.spec.ts`

Flow 4 — Navigate to the Settings page, click "Manage Billing", and verify the browser URL contains `billing.stripe.com`.

The Settings page is at `/settings`. The button text is "Manage Billing" (from `settings/page.tsx` line 1318). Clicking it calls `POST /api/subscription/portal` which returns a `{ url: string }` pointing to `billing.stripe.com`. The page then sets `window.location.href = data.url`.

Because Playwright blocks navigation to external domains by default, we intercept the route to the Stripe portal API and mock it to return a redirect URL, or alternatively listen for the navigation event. The cleanest approach for this test is to intercept `POST /api/subscription/portal` and return a `billing.stripe.com` URL, then verify the navigation.

```typescript
// e2e/billing.spec.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestUserFixture {
  id: string;
  email: string;
  password: string;
}

function loadFixture(): TestUserFixture {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as TestUserFixture;
}

async function loginAndNavigateToSettings(page: import('@playwright/test').Page): Promise<void> {
  const { email, password } = loadFixture();

  await page.goto('/signin');
  await expect(page.getByText('Sign In').first()).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 10_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.waitForURL('**/chat/**', { timeout: 10_000 });
  }

  // Navigate to settings
  await page.goto('/settings');
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 5_000 });
}

test.describe('Flow 4 — Billing portal redirect', () => {
  test('clicking Manage Billing redirects to billing.stripe.com', async ({ page }) => {
    // Intercept the portal API so we do not require a live Stripe account.
    // The mock returns a valid billing.stripe.com URL.
    const mockPortalUrl =
      'https://billing.stripe.com/p/session/test_e2e_mock_session_id';

    await page.route('**/api/subscription/portal', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: mockPortalUrl }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndNavigateToSettings(page);

    // Listen for the navigation to billing.stripe.com
    // window.location.href assignment triggers a navigation event.
    const navigationPromise = page.waitForURL(/billing\.stripe\.com/, {
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Manage Billing' }).click();

    await navigationPromise;

    // Verify the URL contains billing.stripe.com
    expect(page.url()).toContain('billing.stripe.com');
  });
});
```

---

## Verification

- [ ] `npx playwright test` exits 0 locally
- [ ] `e2e/signup.spec.ts` exists and is skipped when `SKIP_STRIPE_E2E=true`
- [ ] `e2e/auth.spec.ts` exists and verifies `risedial_session` cookie is set after login
- [ ] `e2e/chat.spec.ts` exists and verifies an AI assistant response appears within 30 seconds
- [ ] `e2e/billing.spec.ts` exists and verifies redirect URL contains `billing.stripe.com`
- [ ] `e2e/globalSetup.ts` creates a test user in the `users` table with `subscription_status: 'active'`
- [ ] `e2e/globalTeardown.ts` deletes the test user row (cascading all related data)
- [ ] `e2e/fixtures/` directory is listed in `.gitignore`
- [ ] `playwright-report/` is listed in `.gitignore`
- [ ] `test-results/` is listed in `.gitignore`
- [ ] Flow 2 (auth): page remains on chat interface after reload — not redirected to /login
- [ ] Flow 3 (chat): both user message and assistant message persist after page reload
- [ ] Flow 4 (billing): browser URL after clicking 'Manage subscription' contains `billing.stripe.com`

---

## Failure Recovery

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `globalSetup` throws "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set" | Environment variables not loaded | Ensure `.env.local` exists with the `risedial-test` project credentials. Playwright loads `.env.local` when running in Next.js projects only if you explicitly load it. Add `require('dotenv').config({ path: '.env.local' })` at the top of `globalSetup.ts` or run `npx dotenv -e .env.local -- npx playwright test`. |
| `globalSetup` throws "failed to insert test user" with `duplicate key` | A previous run did not clean up | Run teardown manually: delete the row from `users` where email matches `e2e-test-*@risedial-test.invalid` using the Supabase dashboard or CLI. |
| Flow 2 fails: `risedial_session` cookie not found | App uses `httpOnly: true` and `sameSite: strict` — Playwright can read httpOnly cookies via `context.cookies()` in the same browser context, so this should work. If missing, check that the signin API returned status 200 and examine `page.url()` after login. | Add `console.log(await context.cookies())` temporarily to debug. Ensure `JWT_SECRET` is set in `.env.local`. |
| Flow 2 fails: page redirected to `/signin` after reload | Session cookie not persisting across reload or `secure: true` blocking on HTTP localhost | The app sets `secure: true` on the cookie which blocks it over plain HTTP. Either set up HTTPS locally or temporarily set `secure: false` for the test environment by adding `NODE_ENV=test` guard in `lib/auth/session.ts`. Alternatively, use `page.context().addCookies()` to inject the session cookie with `secure: false` for localhost. |
| Flow 3 fails: assistant message never appears (typing indicator stays) | The `/api/chat/[chatId]/message` route is failing silently | Check the server console for errors. The route requires `JWT_SECRET` and an OpenAI API key (`OPENAI_API_KEY`). Ensure both are in `.env.local`. Silent failure resulting in empty assistant message violates constraint 9. |
| Flow 3 fails: messages not visible after reload | Messages loaded from API but `.chat-message-enter` class only applied to last message on initial render | Switch selector to a more stable one: `page.locator('[data-testid="message"]')` if testids are added, or query by text content directly. The fallback is to count visible text containing the known user message text. |
| Flow 4 fails: `waitForURL(/billing\.stripe\.com/)` times out | The route mock was not set up before navigation or the button text changed | Verify `Manage Billing` is the exact button text (confirmed in `app/settings/page.tsx` line 1318). Check that `page.route(...)` is called before `loginAndNavigateToSettings`. |
| `npx tsc --noEmit` fails on e2e files | TypeScript strict mode rejecting Playwright types | Ensure `@playwright/test` is in `devDependencies`. Add `"include": ["e2e/**/*"]` to `tsconfig.json` or create a separate `e2e/tsconfig.json` with `{ "extends": "../tsconfig.json", "include": ["./**/*"] }`. |
| `globalSetup` env vars not available | Playwright does not auto-load `.env.local` in global setup | Add this block at the top of `globalSetup.ts` (before any other code): `import * as dotenv from 'dotenv'; import * as path from 'path'; dotenv.config({ path: path.join(process.cwd(), '.env.local') });` and install `dotenv` as a devDependency. |
