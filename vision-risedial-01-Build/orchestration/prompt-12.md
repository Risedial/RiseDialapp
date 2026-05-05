# Step 12: M5-B — Test Infrastructure: Config files (vitest, playwright, e2e setup/teardown)

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-12" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-12"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Create the 5 test infrastructure config files: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `e2e/globalSetup.ts`, `e2e/globalTeardown.ts`.

Key values from context (do NOT invent):
- `vitest_environment`: `jsdom` (from external-services.md)
- `vitest_globals`: `true` (from external-services.md)
- `vitest_setup_file`: `./vitest.setup.ts` (from external-services.md)
- `vitest_coverage_provider`: `@vitest/coverage-v8` (from external-services.md)
- `vitest_coverage_include`: `['lib/**/*.ts', 'app/api/**/*.ts']` (from external-services.md)
- `vitest_coverage_exclude`: `['lib/env.ts']` (from external-services.md)
- `vitest_coverage_threshold`: 100% lines, functions, branches, statements (from external-services.md)
- All 13 vitest test env vars with exact values (from external-services.md `vitest_test_env:*`)
- `playwright_test_dir`: `./e2e` (from external-services.md)
- `playwright_global_setup`: `./e2e/globalSetup.ts` (from external-services.md)
- `playwright_global_teardown`: `./e2e/globalTeardown.ts` (from external-services.md)
- `playwright_retries_ci`: 2 (from external-services.md)
- `playwright_workers_ci`: 1 (from external-services.md)
- `playwright_trace`: `on-first-retry` (from external-services.md)
- `e2e_base_url`: `http://localhost:3000` (from external-services.md)
- `table:users` columns from data-schema.md for globalSetup insert

**Sub-step 1 — Create `C:\Users\Alexb\Documents\RiseDialapp\vitest.config.ts`:**
Create with this exact content (the `env` block must contain all 13 test env vars with format-compliant values — STRIPE_SECRET_KEY starts with `sk_`, OPENAI_API_KEY starts with `sk-`, etc.):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
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
  },
});
```

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\vitest.setup.ts`:**
Create with this exact content:
```typescript
import '@testing-library/jest-dom';
```

**Sub-step 3 — Create `C:\Users\Alexb\Documents\RiseDialapp\playwright.config.ts`:**
Create with this exact content:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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

**Sub-step 4 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts`:**
Create the `e2e/` directory if needed. Create the file with content that:
- Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from process.env
- Skips (returns early) if SKIP_STRIPE_E2E === 'true'
- Creates a test user in the `users` table with `subscription_status: 'active'`
- Writes credentials to `e2e/fixtures/test-user.json`
Use table name `users` and columns `email`, `password_hash`, `subscription_status` (from data-schema.md). The `subscription_status` enum value `'active'` is valid (from data-schema.md `enum:users.subscription_status`).

**Sub-step 5 — Create `C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts`:**
Create in the same `e2e/` directory. Content:
- Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from process.env
- Skips if SKIP_STRIPE_E2E === 'true'
- Reads `e2e/fixtures/test-user.json`
- Deletes the test user by `id` from the `users` table
- Removes the fixtures file

**Sub-step 6 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 7 — Verify runners exit 0 on empty suites:**
Run `npx vitest run` — "no tests found" is acceptable, exit code must be 0.
Run `npx playwright test` — "no tests found" is acceptable for Playwright ≥1.40, exit code must be 0.

**Sub-step 8 — Commit:**
Stage: `git add vitest.config.ts vitest.setup.ts playwright.config.ts e2e/globalSetup.ts e2e/globalTeardown.ts`
Commit message: `chore(test): add vitest config, playwright config, and e2e global setup/teardown`

## Verification
- [ ] `vitest.config.ts` exists at project root with `environment: 'jsdom'` and `globals: true`
- [ ] `vitest.config.ts` env block contains all 13 required test environment variables
- [ ] `vitest.config.ts` coverage include is `['lib/**/*.ts', 'app/api/**/*.ts']` and exclude is `['lib/env.ts']`
- [ ] `vitest.config.ts` coverage thresholds are 100% for lines, functions, branches, statements
- [ ] `vitest.setup.ts` exists and contains `import '@testing-library/jest-dom'`
- [ ] `playwright.config.ts` exists with `baseURL: 'http://localhost:3000'`
- [ ] `playwright.config.ts` references `'./e2e/globalSetup.ts'` and `'./e2e/globalTeardown.ts'`
- [ ] `e2e/globalSetup.ts` exists
- [ ] `e2e/globalTeardown.ts` exists
- [ ] `npx vitest run` exits 0
- [ ] `npx playwright test` exits 0
- [ ] `npx tsc --noEmit` exits 0

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-12" from pendingSteps to completedSteps
- Set steps["prompt-12"].status = "complete"
