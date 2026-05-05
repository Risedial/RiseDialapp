# Module 8 — CI Pipeline: SPEC

## Purpose

Add a GitHub Actions workflow that automatically runs type checking, unit tests with coverage, and E2E tests on every push to `main` and every pull request targeting `main`. The pipeline reflects the locally-verified state from Modules 1–7.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 7 complete — `npx playwright test` exits 0 for all 4 flows locally

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| All test files | TypeScript | Local filesystem | Yes — must all pass locally before CI is added |
| GitHub repository secrets | Key-value | GitHub Settings > Secrets and variables > Actions | Yes — all 13 env vars plus NEXT_PUBLIC vars |

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | GitHub Actions workflow with 3 jobs |

---

## GitHub Actions Workflow Specification

### Trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Job 1: typecheck

Runs TypeScript compilation check with no build artifacts.

- Ubuntu latest
- Node 20 with npm cache
- Steps: checkout, setup-node, npm ci, npx tsc --noEmit
- No env vars needed (tsc runs without environment variables)

### Job 2: unit-tests

Runs Vitest with coverage. Requires all 13 env vars (because `lib/env.ts` runs at module load time even in tests, and vitest.config.ts `env` block sets test values — but the CI job also sets them as environment variables for the process).

**Note:** The test env vars in `vitest.config.ts` should be sufficient for unit tests because they are set in the `env` block of the vitest config. However, the GitHub Actions env block provides an additional layer in case any test bypasses vitest.config.ts.

- `needs: typecheck` (does not run if typecheck fails)
- All 13 env vars set from GitHub secrets

### Job 3: e2e-tests

Runs Playwright against a dev server started by Playwright's webServer config. Sets `SKIP_STRIPE_E2E=true` to skip Flow 1 (signup).

- `needs: unit-tests` (sequential — e2e runs after unit tests pass)
- All 13 env vars set from GitHub secrets
- `SKIP_STRIPE_E2E: 'true'` set explicitly
- `NEXT_PUBLIC_APP_URL: 'http://localhost:3000'` can be hardcoded for CI (the Stripe checkout flow is skipped)
- Installs Playwright browsers with `--with-deps` (required on Ubuntu CI)
- Uploads playwright-report as an artifact on failure (7-day retention)

---

## GitHub Secrets Required

These must be configured in GitHub Settings > Secrets and variables > Actions > New repository secret:

| Secret Name | Value Source |
|-------------|-------------|
| `SUPABASE_URL` | risedial-test Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | risedial-test service role key |
| `JWT_SECRET` | Same value as .env.local (min 32 chars) |
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe test webhook secret (`whsec_*`) |
| `STRIPE_PRICE_MONTHLY` | Price ID for monthly base plan |
| `STRIPE_PRICE_ANNUAL` | Price ID for annual base plan |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | Price ID for premium monthly add-on |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | Price ID for premium annual add-on |
| `OPENAI_API_KEY` | OpenAI API key (`sk-*`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as SUPABASE_URL for risedial-test |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | risedial-test anon key |

`NEXT_PUBLIC_APP_URL` is hardcoded to `http://localhost:3000` in the e2e-tests job (not a secret).

---

## Full ci.yml Content

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: TypeScript
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit

  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: typecheck
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_PRICE_MONTHLY: ${{ secrets.STRIPE_PRICE_MONTHLY }}
      STRIPE_PRICE_ANNUAL: ${{ secrets.STRIPE_PRICE_ANNUAL }}
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON }}
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx vitest run --coverage

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      STRIPE_PRICE_MONTHLY: ${{ secrets.STRIPE_PRICE_MONTHLY }}
      STRIPE_PRICE_ANNUAL: ${{ secrets.STRIPE_PRICE_ANNUAL }}
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON }}
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: ${{ secrets.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON }}
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      SKIP_STRIPE_E2E: 'true'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| A GitHub secret is missing or empty | The unit-tests job fails with `ZodError` identifying the missing var by name. Add the secret to GitHub Settings > Secrets. |
| E2E tests fail in CI but pass locally | Download the `playwright-report` artifact from the failed run. Open the report to see screenshots and traces. Common causes: different timing on Ubuntu (increase timeouts), selector mismatches (check the screenshot of the failed assertion). |
| `SKIP_STRIPE_E2E=true` does not skip Flow 1 | Verify the spec file uses `if (SKIP_STRIPE) { test.skip(true, '...') }` inside the test body (not `test.skip` at the `test.describe` level, which has different behavior). |
| npm ci fails because package-lock.json is out of sync | Run `npm install` locally and commit the updated `package-lock.json`. |

---

## AI/LLM Used

None.

---

## Data Stored

GitHub Actions artifacts: `playwright-report` on test failure, retained 7 days.
