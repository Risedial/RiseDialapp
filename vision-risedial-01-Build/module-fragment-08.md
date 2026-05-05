# Module Fragment 08 — CI Pipeline (M8)

## Role Statement

You are the CI Pipeline engineer for RiseDial. Your sole responsibility in this module is to produce and commit `.github/workflows/ci.yml` so that every push to `main` and every pull request targeting `main` automatically runs three sequential jobs — `typecheck`, `unit-tests`, and `e2e-tests` — and reports green or red status checks back to GitHub. You touch no product code, no UI, and no API contracts. You only create the workflow file.

---

## Context

### Locked Tech Values

| Key | Value |
|-----|-------|
| CI system | GitHub Actions |
| Workflow file | `.github/workflows/ci.yml` |
| Typecheck job name | `typecheck` |
| Unit-test job name | `unit-tests` |
| E2E job name | `e2e-tests` |
| CI triggers | push to `main`, pull_request targeting `main` |
| Artifact retention | 7 days |
| Stripe E2E skip variable | `SKIP_STRIPE_E2E` |
| Node version (CI) | 20 |
| Hosting | Vercel |
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Unit test runner | Vitest |
| E2E test runner | Playwright |
| E2E browser | Chromium (Desktop Chrome) |
| Required env vars | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL |

### Locked Constraints

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. All fixes must preserve existing API contract shapes.
6. Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true`.
7. `npx tsc --noEmit` must exit 0 — must use `--noEmit` not build for type checking.
8. Silent failure that results in an empty assistant message is not acceptable.
9. No test makes a real database call, real Stripe API call, or real OpenAI API call.

---

## What Must Be True After This Module

`.github/workflows/ci.yml` is pushed to GitHub and all 3 CI jobs (`typecheck`, `unit-tests`, `e2e-tests`) show green checks on the latest push to main.

---

## Files to Change

### `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`

This is the complete, final workflow file. Write it exactly as shown.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type check
        run: npx tsc --noEmit

  unit-tests:
    name: Unit Tests
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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npx vitest run --coverage

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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### GitHub Repository Secrets Setup

Before the CI workflow can run successfully, all 12 secrets below must be configured in GitHub at:

**Repository > Settings > Secrets and variables > Actions > New repository secret**

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_URL` | Full Supabase project URL (e.g. `https://xxxx.supabase.co`) — used server-side for admin DB access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role JWT — bypasses Row Level Security; never expose client-side |
| `JWT_SECRET` | Secret used to sign/verify RiseDial session JWTs — must match the value in production |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_live_...` or `sk_test_...`) — used server-side only |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) — validates incoming webhook payloads |
| `STRIPE_PRICE_MONTHLY` | Stripe Price ID for the monthly subscription plan (`price_...`) |
| `STRIPE_PRICE_ANNUAL` | Stripe Price ID for the annual subscription plan (`price_...`) |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | Stripe Price ID for the premium monthly add-on (`price_...`) |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | Stripe Price ID for the premium annual add-on (`price_...`) |
| `OPENAI_API_KEY` | OpenAI API key (`sk-...`) — used server-side for AI coaching chat completions |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL as above — safe to expose; used by the client-side Supabase JS SDK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key — safe to expose; respects Row Level Security |

Note: `NEXT_PUBLIC_APP_URL` is hardcoded as `http://localhost:3000` directly in the workflow file and does not need to be a repository secret.

---

## Verification

- [ ] `.github/workflows/ci.yml` exists at `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`
- [ ] `ci.yml` defines exactly 3 jobs: `typecheck`, `unit-tests`, `e2e-tests`
- [ ] `typecheck` job runs `npx tsc --noEmit` on `ubuntu-latest` with Node 20
- [ ] `unit-tests` job has `needs: typecheck` and runs `npx vitest run --coverage`
- [ ] `e2e-tests` job has `needs: unit-tests` and runs `npx playwright test` with `SKIP_STRIPE_E2E: 'true'`
- [ ] `ci.yml` trigger is `push: branches: [main]` and `pull_request: branches: [main]`
- [ ] `e2e-tests` job uploads `playwright-report/` artifact on failure with `retention-days: 7`
- [ ] GitHub Actions CI page for the latest push to main shows three green check marks
- [ ] All 12 required GitHub repository secrets are configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] `ci.yml` `e2e-tests` job installs browsers with `npx playwright install --with-deps chromium`

---

## Failure Recovery

| Symptom | Recovery |
|---------|----------|
| `typecheck` job fails with TypeScript errors | Run `npx tsc --noEmit` locally, fix all type errors in source files before pushing. Do not suppress errors with `// @ts-ignore` unless the type is provably unreachable. |
| `unit-tests` job fails because Vitest cannot find test files | Confirm `vitest.config.ts` (or `vitest.config.js`) exists and its `include` glob matches your test file locations. Run `npx vitest run` locally to reproduce. |
| `unit-tests` job fails because a test calls a real external service | Add or fix the mock for that service in the test file. No test may make a real database, Stripe, or OpenAI call (constraint 9). |
| `e2e-tests` job fails and the playwright-report artifact is present | Download the artifact from the GitHub Actions run summary, open `index.html` in a browser, identify the failing test, and fix the underlying app or test code. |
| `e2e-tests` job fails with "browser not found" | Confirm the `npx playwright install --with-deps chromium` step runs before `npx playwright test`. Check that `playwright.config.ts` does not override the project browser list to something other than Chromium. |
| Stripe-related E2E test runs despite `SKIP_STRIPE_E2E=true` | Confirm the test file checks `process.env.SKIP_STRIPE_E2E === 'true'` and calls `test.skip()` accordingly. |
| Secrets not injected (env var is empty string in logs) | Verify all 12 secrets are set in GitHub repository Settings > Secrets and variables > Actions. Secret names are case-sensitive. |
| `npm ci` fails because `package-lock.json` is out of sync | Run `npm install` locally, commit the updated `package-lock.json`, and push. |
| Workflow never triggers on pull request | Confirm the PR targets `main` (not a different base branch). The trigger is `pull_request: branches: [main]`. |
