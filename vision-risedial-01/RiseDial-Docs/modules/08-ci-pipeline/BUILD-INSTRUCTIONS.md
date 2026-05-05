# Module 8 — CI Pipeline: Build Instructions

## What You Are Building

One YAML file at `.github/workflows/ci.yml` plus GitHub repository secret configuration. This is the final module.

---

## Prerequisites

- Module 7 complete: `npx playwright test` exits 0 locally
- GitHub repository exists at `github.com/Risedial/RiseDialapp`
- You have admin access to the repository (required to configure secrets)

---

## Step 1 — Configure GitHub repository secrets

Navigate to: `github.com/Risedial/RiseDialapp` > Settings > Secrets and variables > Actions > Repository secrets

Create each secret (click "New repository secret" for each):

| Secret Name | Value |
|-------------|-------|
| `SUPABASE_URL` | Your `risedial-test` Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your `risedial-test` service role key |
| `JWT_SECRET` | Same value as your `.env.local` JWT_SECRET |
| `STRIPE_SECRET_KEY` | Stripe test key (`sk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe test webhook secret (`whsec_*`) |
| `STRIPE_PRICE_MONTHLY` | Price ID from Stripe test dashboard |
| `STRIPE_PRICE_ANNUAL` | Price ID from Stripe test dashboard |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | Price ID from Stripe test dashboard |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | Price ID from Stripe test dashboard |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your `risedial-test` anon key |

**Note:** `NEXT_PUBLIC_APP_URL` is NOT a secret — it is hardcoded to `http://localhost:3000` in the workflow file.

---

## Step 2 — Create the workflow file

Create the directory and file:
```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml` with this exact content:

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

## Step 3 — Commit and push

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow with typecheck, unit tests, and e2e tests"
git push origin main
```

---

## Step 4 — Monitor the GitHub Actions run

Navigate to: `github.com/Risedial/RiseDialapp` > Actions > CI

The run is triggered by the push. Watch for:
- ✅ TypeScript (1–2 min)
- ✅ Unit & Integration Tests (2–4 min)
- ✅ E2E Tests (4–8 min)

---

## Troubleshooting

**Unit tests fail with ZodError:**
One or more GitHub secrets are missing, empty, or have the wrong format. Check:
- Secret value starts with the required prefix (e.g., `sk_test_` for STRIPE_SECRET_KEY)
- SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL include `https://`
- JWT_SECRET is at least 32 characters

**E2E tests fail:**
1. Click on the failing e2e-tests job
2. Scroll to the bottom to find the failed step
3. Download the `playwright-report` artifact from the job summary
4. Open `playwright-report/index.html` locally to see screenshots and traces
5. Identify the selector that did not match and update the spec file

**npm ci fails:**
`package-lock.json` is out of sync with `package.json`. Run `npm install` locally and commit the updated lock file.

---

## Definition of Done

- [ ] `.github/workflows/ci.yml` exists and is committed to the repository
- [ ] 12 GitHub repository secrets are configured
- [ ] GitHub Actions run shows three green jobs: TypeScript, Unit & Integration Tests, E2E Tests
- [ ] Green check is visible next to the latest commit SHA on the main branch
- [ ] Pipeline is complete — the full audit, fix, and test pipeline has been delivered
