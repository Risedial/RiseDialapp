# Module 5 — Test Infrastructure: SPEC

## Purpose

Install and configure Vitest and Playwright. Add npm test scripts. Verify both test runners execute successfully with zero tests. This module does not write any actual tests — it validates that the test infrastructure works before Module 6 and 7 populate it.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 4 complete — `lib/env.ts` committed; `npm run dev` starts without ZodError when `.env.local` is populated

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| `package.json` | JSON | Project root | Yes |
| `tsconfig.json` | JSON | Project root | Yes |

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `vitest.config.ts` | Project root | Vitest configuration with jsdom env, coverage settings, test env vars, path aliases |
| `vitest.setup.ts` | Project root | Imports `@testing-library/jest-dom` |
| `playwright.config.ts` | Project root | Playwright configuration for localhost:3000, Chromium only, globalSetup |
| Updated `package.json` | Project root | 4 new test scripts |
| Installed devDependencies | `node_modules/` | See list below |

### devDependencies to Install

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

## vitest.config.ts Specification

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      // Test values — must satisfy lib/env.ts zod schema format constraints
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
      exclude: ['lib/env.ts', 'lib/supabase/client.ts'],
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

**Coverage exclusions:**
- `lib/env.ts` — excluded because it calls `envSchema.parse(process.env)` at module level; testing it is done separately in `__tests__/lib/env.test.ts` by manipulating `process.env`
- `lib/supabase/client.ts` — excluded per session decision; it is a thin browser client wrapper with no logic to meaningfully unit test

Wait — the session decision was to INCLUDE `lib/supabase/client.ts` in coverage. Update: remove `lib/supabase/client.ts` from the exclusion list. It will be tested in `__tests__/lib/supabase/client.test.ts`.

**Corrected coverage exclusions:**
- `lib/env.ts` only

**Why jsdom environment:** Several lib files use Web APIs (e.g., `crypto.subtle` in `lib/auth/session.ts`). Vitest's `jsdom` environment provides a browser-like global scope including `crypto.subtle`. Without it, session tests would fail trying to use `crypto.subtle.sign()`.

**Why globals: true:** Allows using `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` without importing them in every test file.

---

## vitest.setup.ts Specification

```typescript
import '@testing-library/jest-dom'
```

This single import makes all `@testing-library/jest-dom` matchers available globally (e.g., `expect(element).toBeInTheDocument()`).

---

## playwright.config.ts Specification

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

**Global setup/teardown:** `globalSetup.ts` and `globalTeardown.ts` will be created in Module 7. They will not exist yet when this config is created. Playwright ignores missing globalSetup/globalTeardown files if they are not yet needed — BUT the empty `e2e/` directory verification step will confirm the config works regardless.

To avoid a "file not found" error during the Module 5 verification step, create placeholder files:
- `e2e/globalSetup.ts`: `export default async function globalSetup() {}`
- `e2e/globalTeardown.ts`: `export default async function globalTeardown() {}`

These will be replaced in Module 7.

---

## package.json Scripts

Add these scripts to the `"scripts"` object in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

---

## Verification Steps

After configuring everything, run:

```bash
# Verify Vitest finds no tests but exits 0
npx vitest run
# Expected: "No test files found" or "0 tests passed", exit 0

# Verify Playwright finds no tests but exits 0
npx playwright test
# Expected: "No tests found" or exits 0

# Install Playwright browser binary
npx playwright install chromium
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| `vitest.config.ts` env vars do not satisfy zod schema format constraints | Vitest will fail at import with `ZodError` before any test runs. Update the test env vars to match the constraints (e.g., STRIPE_SECRET_KEY must start with `sk_`, OPENAI_API_KEY must start with `sk-`). |
| `@testing-library/jest-dom` has a TypeScript definition conflict with the existing `@types/testing-library__jest-dom` | Remove the explicitly installed type package if it conflicts. The `@testing-library/jest-dom` package includes its own types. |
| Playwright globalSetup file not found | Create placeholder files as described above. |
| jsdom does not provide `crypto.subtle` | Vitest 1.x provides `crypto.subtle` via the `jsdom` environment on Node 20. If not: add `import { webcrypto } from 'node:crypto'; vi.stubGlobal('crypto', webcrypto)` to `vitest.setup.ts`. |

---

## AI/LLM Used

None.

---

## Data Stored

None beyond committed configuration files.
