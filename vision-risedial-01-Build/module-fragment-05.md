# Module Fragment 05 — Test Infrastructure (M5)

## Role

You are the **Test Infrastructure builder** for the RiseDial production app. Your sole responsibility in this module is to install and configure Vitest (unit/integration) and Playwright (E2E) so that both runners exit 0 on empty suites and all required npm scripts are present. You write config files, setup/teardown files, and update `package.json`. You do not write any tests. You do not change product code.

---

## Context

### Locked Technology Values

| Key | Value |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Unit test runner | Vitest |
| Unit test coverage provider | @vitest/coverage-v8 |
| E2E test runner | Playwright |
| E2E browser | Chromium (Desktop Chrome) |
| E2E base URL | http://localhost:3000 |
| E2E Supabase project | risedial-test |
| vitest_environment | jsdom |
| vitest_globals | true |
| vitest_setup_file | ./vitest.setup.ts |
| vitest_config_file | vitest.config.ts |
| vitest_coverage_provider | @vitest/coverage-v8 |
| vitest_coverage_include | ['lib/**/*.ts', 'app/api/**/*.ts'] |
| vitest_coverage_exclude | ['lib/env.ts'] |
| vitest_coverage_threshold | 100% lines, functions, branches, statements |
| playwright_config_file | playwright.config.ts |
| playwright_test_dir | ./e2e |
| playwright_global_setup | ./e2e/globalSetup.ts |
| playwright_global_teardown | ./e2e/globalTeardown.ts |
| playwright_retries_ci | 2 |
| playwright_workers_ci | 1 |
| playwright_trace | on-first-retry |
| playwright_browser | Chromium (Desktop Chrome) |
| node_version_ci | 20 |
| package_scripts:test | vitest run |
| package_scripts:test:watch | vitest |
| package_scripts:test:coverage | vitest run --coverage |
| package_scripts:test:e2e | playwright test |

### Vitest Test Environment Variables (all 13)

| Variable | Value |
|---|---|
| SUPABASE_URL | https://test.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | test-service-role-key |
| JWT_SECRET | test-jwt-secret-that-is-at-least-32-chars-long |
| STRIPE_SECRET_KEY | sk_test_key |
| STRIPE_WEBHOOK_SECRET | whsec_test |
| STRIPE_PRICE_MONTHLY | price_test_monthly |
| STRIPE_PRICE_ANNUAL | price_test_annual |
| STRIPE_PRICE_PREMIUM_MONTHLY_ADDON | price_test_premium_monthly |
| STRIPE_PRICE_PREMIUM_ANNUAL_ADDON | price_test_premium_annual |
| OPENAI_API_KEY | sk-test-openai-key |
| NEXT_PUBLIC_SUPABASE_URL | https://test.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | test-anon-key |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 |

### Locked Constraints (numbered)

1. Do not refactor surrounding code.
2. Do not touch surrounding code, do not refactor, do not rename anything.
3. No new product features may be added during this pipeline.
4. No UI changes.
5. No new features.
6. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
7. `lib/supabase/client.ts` does NOT import `lib/env.ts`.
8. `npx tsc --noEmit` must exit 0 after every commit in this module.
9. No API response shapes are changed.
10. Every fix is committed independently before the next fix begins.
11. After every fix, run `npx tsc --noEmit` before committing.
12. Tests that import files which depend on `lib/env.ts` must either set test env vars in vitest.config.ts or mock lib/env.ts.
13. No test makes a real database call, real Stripe API call, or real OpenAI API call.
14. Must use `--noEmit` not build for type checking.
15. Silent failure that results in an empty assistant message is not acceptable.
16. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
17. E2E tests target the `risedial-test` Supabase project.
18. Do not add `export const runtime = 'edge'` to Node.js-only routes.

---

## What Must Be True After This Module

Vitest and Playwright are installed and configured; both test runners exit 0 on empty test suites; all 4 npm test scripts are present in package.json.

---

## Files to Change

There are exactly 7 files to create or update. Each subsection contains the complete, verbatim file content to write. Do not add, omit, or modify any content relative to what is shown.

---

### C:\Users\Alexb\Documents\RiseDialapp\vitest.config.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
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

---

### C:\Users\Alexb\Documents\RiseDialapp\vitest.setup.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
import '@testing-library/jest-dom';
```

---

### C:\Users\Alexb\Documents\RiseDialapp\playwright.config.ts

This file does not currently exist. Create it from scratch with the content below.

```ts
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

---

### C:\Users\Alexb\Documents\RiseDialapp\package.json

This file currently exists. Replace it entirely with the content below. All existing dependencies are preserved; the four test scripts and test devDependencies are added.

```json
{
  "name": "risedial",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.x",
    "bcryptjs": "2.x",
    "jsonwebtoken": "9.x",
    "next": "14.x",
    "next-pwa": "5.x",
    "openai": "4.x",
    "react": "18.x",
    "react-dom": "18.x",
    "resend": "3.x",
    "stripe": "^22.1.0",
    "tailwindcss": "3.x",
    "typescript": "5.x",
    "zod": "3.x"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@testing-library/jest-dom": "^6.4.6",
    "@types/bcryptjs": "^2",
    "@types/jsonwebtoken": "^9",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitest/coverage-v8": "^1.6.0",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.x",
    "jsdom": "^24.1.0",
    "postcss": "^8",
    "vitest": "^1.6.0"
  }
}
```

---

### C:\Users\Alexb\Documents\RiseDialapp\package-lock.json

This file currently exists. After updating `package.json`, delete `package-lock.json` and regenerate it by running:

```
npm install
```

The executor agent must run `npm install` after writing `package.json` so that `package-lock.json` reflects the new devDependencies. The content of `package-lock.json` is machine-generated and must not be hand-authored. The step sequence is:

1. Write `package.json` (content above).
2. Run `npm install` in the project root.
3. Commit both `package.json` and the newly regenerated `package-lock.json`.

Do NOT paste a static `package-lock.json` — it will be wrong the moment any transitive dependency version differs from what npm resolves.

> **Note to executor:** If npm install fails due to peer dependency conflicts, add `--legacy-peer-deps` and retry.

---

### C:\Users\Alexb\Documents\RiseDialapp\e2e\globalSetup.ts

This file does not currently exist. Create the `e2e/` directory if needed, then create this file.

```ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key';

const TEST_USER_EMAIL = 'e2e-test-user@risedial-test.internal';
const TEST_USER_PASSWORD = 'E2eTestPassword!2024';

async function globalSetup(): Promise<void> {
  // Skip if SKIP_STRIPE_E2E is set (CI flow-1 skip)
  if (process.env.SKIP_STRIPE_E2E === 'true') {
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Remove any pre-existing test user to ensure a clean slate
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_USER_EMAIL)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('users').delete().eq('id', existing.id);
  }

  // Insert a fresh test user row with active subscription
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: TEST_USER_EMAIL,
      password_hash: 'e2e-placeholder-hash',
      subscription_status: 'active',
      subscription_plan: 'monthly',
      stripe_customer_id: 'cus_e2etest',
      stripe_subscription_id: 'sub_e2etest',
    })
    .select('id, email')
    .single();

  if (error || !user) {
    throw new Error(`globalSetup: failed to create test user — ${error?.message}`);
  }

  // Persist credentials for use in individual tests
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(fixturesDir, 'test-user.json'),
    JSON.stringify(
      { id: user.id, email: user.email, password: TEST_USER_PASSWORD },
      null,
      2,
    ),
  );
}

export default globalSetup;
```

---

### C:\Users\Alexb\Documents\RiseDialapp\e2e\globalTeardown.ts

This file does not currently exist. Create it in the same `e2e/` directory.

```ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://test.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key';

async function globalTeardown(): Promise<void> {
  // Skip if SKIP_STRIPE_E2E is set (CI flow-1 skip)
  if (process.env.SKIP_STRIPE_E2E === 'true') {
    return;
  }

  const fixturesPath = path.join(__dirname, 'fixtures', 'test-user.json');

  if (!fs.existsSync(fixturesPath)) {
    return;
  }

  const raw = fs.readFileSync(fixturesPath, 'utf-8');
  const { id } = JSON.parse(raw) as { id: string; email: string; password: string };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete the test user row; cascading foreign keys handle related data
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    console.error(`globalTeardown: failed to delete test user ${id} — ${error.message}`);
  }

  // Remove the fixtures file
  fs.unlinkSync(fixturesPath);
}

export default globalTeardown;
```

---

## Verification

After applying all file changes and running `npm install`, verify every item below is true before considering M5 complete.

- [ ] `vitest.config.ts` exists at project root
- [ ] `vitest.setup.ts` exists at project root and contains `import '@testing-library/jest-dom'`
- [ ] `playwright.config.ts` exists at project root
- [ ] `e2e/globalSetup.ts` exists
- [ ] `e2e/globalTeardown.ts` exists
- [ ] `package.json` scripts include: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"test:e2e": "playwright test"`
- [ ] `vitest.config.ts` env block contains all 13 required test environment variables with format-compliant values (STRIPE_SECRET_KEY starts with sk_, OPENAI_API_KEY starts with sk-, etc.)
- [ ] `vitest.config.ts` coverage include is `['lib/**/*.ts', 'app/api/**/*.ts']` and exclude is `['lib/env.ts']`
- [ ] `vitest.config.ts` coverage thresholds are 100% for lines, functions, branches, statements
- [ ] `vitest.config.ts` environment is `'jsdom'` and globals is `true`
- [ ] `playwright.config.ts` baseURL is `'http://localhost:3000'`
- [ ] `playwright.config.ts` references `'./e2e/globalSetup.ts'` and `'./e2e/globalTeardown.ts'`
- [ ] `npx vitest run` exits 0 (no tests found is acceptable)
- [ ] `npx playwright test` exits 0 (no tests found is acceptable)
- [ ] `npx tsc --noEmit` exits 0

---

## Failure Recovery

| Symptom | Recovery |
|---|---|
| `npx tsc --noEmit` fails after adding config files | Check that `@vitejs/plugin-react` and `vitest` types are installed (`npm install`). Confirm `tsconfig.json` includes/excludes do not conflict with the new config files. Do not change product source files. |
| `vitest run` exits non-zero with "no tests found" error | Add `passWithNoTests: true` to the `test` block in `vitest.config.ts`. Re-run `npx tsc --noEmit` before committing. |
| `playwright test` exits non-zero with "no tests found" error | Playwright ≥1.40 exits 0 when no test files are found. If an older version is installed, upgrade: `npm install @playwright/test@^1.44.0`. |
| `npm install` fails with peer dependency conflicts | Re-run with `npm install --legacy-peer-deps`. Commit `package-lock.json` from the result of this command. |
| `globalSetup` throws "failed to create test user" | Verify that the `users` table in the `risedial-test` Supabase project has the columns `email`, `password_hash`, `subscription_status`, `subscription_plan`, `stripe_customer_id`, `stripe_subscription_id`. If the schema differs, update only the `insert` payload in `e2e/globalSetup.ts` to match the actual column names — do not change product code. |
| `globalTeardown` fails to delete the test user | Confirm that the `users` table primary key is `id` (UUID). If cascading deletes are not configured in Supabase, add `ON DELETE CASCADE` to related foreign keys via a migration — this is infrastructure work, not product code. |
| `@testing-library/jest-dom` types not recognized in tests | Ensure `vitest.setup.ts` is listed in `setupFiles` in `vitest.config.ts` and that `@types/jest` is NOT installed (it conflicts). If `@types/jest` is present, remove it with `npm uninstall @types/jest`. |
| Coverage threshold failure (100% required) | Coverage thresholds only apply when actual test files exist and `vitest run --coverage` is executed. An empty test suite with no include-matched files will pass at 100% (nothing to measure). If real tests are added later and thresholds fail, add targeted unit tests — do not lower the thresholds. |
