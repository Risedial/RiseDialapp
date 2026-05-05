# Module 5 — Test Infrastructure: Build Instructions

## What You Are Building

Five configuration files plus npm devDependency installs. No application code is changed. The goal is two commands that exit 0 on empty test suites.

---

## Prerequisites

- Module 4 complete
- `npx tsc --noEmit` exits 0
- Node 20 on PATH

---

## Step 1 — Install devDependencies

```bash
npm install --save-dev \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  @playwright/test
```

---

## Step 2 — Create vitest.config.ts

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
      STRIPE_SECRET_KEY: 'sk_test_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      STRIPE_PRICE_MONTHLY: 'price_test_monthly',
      STRIPE_PRICE_ANNUAL: 'price_test_annual',
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_test_premium_monthly',
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_test_premium_annual',
      OPENAI_API_KEY: 'sk-test-openai-key',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'app/api/**/*.ts'],
      exclude: ['lib/env.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

**Critical:** The test env vars in the `env` block must satisfy the zod format constraints from `lib/env.ts`. If they do not, every test will fail with a `ZodError` when `lib/env.ts` is imported.

Format constraint reminders:
- `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_APP_URL`: must be valid URLs (include `https://` or `http://`)
- `STRIPE_SECRET_KEY`: must start with `sk_`
- `STRIPE_WEBHOOK_SECRET`: must start with `whsec_`
- `STRIPE_PRICE_*`: must start with `price_`
- `OPENAI_API_KEY`: must start with `sk-` (not `sk_`)
- `JWT_SECRET`: must be at least 32 characters

---

## Step 3 — Create vitest.setup.ts

Create `vitest.setup.ts` at the project root:

```typescript
import '@testing-library/jest-dom'
```

---

## Step 4 — Create playwright.config.ts

Create `playwright.config.ts` at the project root:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Step 5 — Add test scripts to package.json

In the `"scripts"` object, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

---

## Step 6 — Create e2e/ directory with placeholder files

```bash
mkdir e2e
```

Create `e2e/globalSetup.ts`:
```typescript
export default async function globalSetup() {}
```

Create `e2e/globalTeardown.ts`:
```typescript
export default async function globalTeardown() {}
```

These will be replaced in Module 7.

---

## Step 7 — Install Playwright browser binary

```bash
npx playwright install chromium
```

This downloads the Chromium browser that Playwright uses for tests (~200MB). This is a one-time operation per machine.

---

## Step 8 — Verify both test runners pass on empty suites

```bash
npx vitest run
# Expected: "No test files found, exiting with code 0" or equivalent

npx playwright test
# Expected: "No tests found" or exit 0

npx tsc --noEmit
# Expected: exit 0
```

**If vitest exits 1:**
- ZodError → the test env vars in vitest.config.ts violate the zod schema. Check format constraints above.
- `Cannot find module 'vitest/config'` → run `npm install vitest` again
- TypeScript parse error in vitest.config.ts → check the syntax

**If playwright exits 1:**
- globalSetup file not found → check `e2e/globalSetup.ts` exists
- Browser not found → run `npx playwright install chromium`

---

## Step 9 — Commit

```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts
git add e2e/globalSetup.ts e2e/globalTeardown.ts
git add package.json package-lock.json
git commit -m "feat(test-infra): install Vitest + Playwright; add test scripts and config files"
```

---

## Definition of Done

- [ ] `npx vitest run` exits 0 with message about no tests found (not a test failure)
- [ ] `npx playwright test` exits 0 with message about no tests found
- [ ] `npx tsc --noEmit` exits 0
- [ ] `vitest.config.ts` has all 13 test env vars in the `env` block
- [ ] `playwright.config.ts` references `e2e/globalSetup.ts` and `e2e/globalTeardown.ts`
- [ ] `package.json` has `test`, `test:watch`, `test:coverage`, `test:e2e` scripts
- [ ] Ready to begin Module 6
