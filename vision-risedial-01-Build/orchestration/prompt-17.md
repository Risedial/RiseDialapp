# Step 17: M8 — CI Pipeline (.github/workflows/ci.yml)

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-17" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-17"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Create `.github/workflows/ci.yml` — the complete GitHub Actions CI workflow. Touch no product code, no UI, no API contracts.

Key values from context (do NOT invent):
- `ci_workflow_file`: `.github/workflows/ci.yml` (from api-contracts.md)
- `ci_typecheck_job`: `typecheck` (from api-contracts.md)
- `ci_unit_test_job`: `unit-tests` (from api-contracts.md)
- `ci_e2e_job`: `e2e-tests` (from api-contracts.md)
- `ci_triggers`: push to main, pull_request targeting main (from api-contracts.md)
- `ci_artifact_retention_days`: 7 (from api-contracts.md)
- `ci_skip_stripe_e2e_var`: `SKIP_STRIPE_E2E` (from api-contracts.md)
- `node_version_ci`: 20 (from external-services.md)
- All 13 required env var names (from external-services.md)

**Sub-step 1 — Create `.github/workflows/` directory if needed:**
Verify or create the directory `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\`.

**Sub-step 2 — Create `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`:**
Write the complete workflow file exactly as follows:

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

**Sub-step 3 — Configure GitHub repository secrets:**
After committing the workflow, all 12 secrets must be configured in GitHub at:
Repository > Settings > Secrets and variables > Actions > New repository secret

Required secrets (do NOT commit real values — these are set in GitHub only):
| Secret Name | Description |
|---|---|
| SUPABASE_URL | Full Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service-role JWT |
| JWT_SECRET | Session JWT signing secret (min 32 chars) |
| STRIPE_SECRET_KEY | Stripe secret API key (sk_...) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret (whsec_...) |
| STRIPE_PRICE_MONTHLY | Stripe Price ID for monthly plan (price_...) |
| STRIPE_PRICE_ANNUAL | Stripe Price ID for annual plan (price_...) |
| STRIPE_PRICE_PREMIUM_MONTHLY_ADDON | Stripe Price ID for premium monthly add-on (price_...) |
| STRIPE_PRICE_PREMIUM_ANNUAL_ADDON | Stripe Price ID for premium annual add-on (price_...) |
| OPENAI_API_KEY | OpenAI API key (sk-...) |
| NEXT_PUBLIC_SUPABASE_URL | Same as SUPABASE_URL (safe to expose) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |

Note: `NEXT_PUBLIC_APP_URL` is hardcoded as `http://localhost:3000` in the workflow and does not need a secret.

**Sub-step 4 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 5 — Commit:**
Stage: `git add .github/workflows/ci.yml`
Commit message: `ci: add GitHub Actions workflow with typecheck, unit-tests, and e2e-tests jobs`

**Sub-step 6 — Push and verify:**
Push to GitHub: `git push origin main`
Navigate to the repository's Actions tab and verify all 3 CI jobs show green checks on the latest push.

## Verification
- [ ] `.github/workflows/ci.yml` exists at `C:\Users\Alexb\Documents\RiseDialapp\.github\workflows\ci.yml`
- [ ] `ci.yml` defines exactly 3 jobs: `typecheck`, `unit-tests`, `e2e-tests`
- [ ] `typecheck` job runs `npx tsc --noEmit` on `ubuntu-latest` with Node 20
- [ ] `unit-tests` job has `needs: typecheck` and runs `npx vitest run --coverage`
- [ ] `e2e-tests` job has `needs: unit-tests`, runs `npx playwright test` with `SKIP_STRIPE_E2E: 'true'`
- [ ] `ci.yml` trigger is `push: branches: [main]` and `pull_request: branches: [main]`
- [ ] `e2e-tests` job uploads `playwright-report/` artifact on failure with `retention-days: 7`
- [ ] `e2e-tests` job installs browsers with `npx playwright install --with-deps chromium`
- [ ] All 12 required GitHub repository secrets are configured
- [ ] GitHub Actions CI page shows three green check marks on latest push to main
- [ ] `npx tsc --noEmit` exits 0

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-17" from pendingSteps to completedSteps
- Set steps["prompt-17"].status = "complete"
