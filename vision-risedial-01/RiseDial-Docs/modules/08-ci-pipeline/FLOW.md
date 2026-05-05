# Module 8 — CI Pipeline: Flow

## Pre-conditions
- Module 7 complete: `npx playwright test` exits 0 locally for all 4 flows
- GitHub repository exists and is connected to the project
- GitHub repository secrets are not yet configured

---

## Steps

**1.** Configure GitHub repository secrets.

In the GitHub web interface:
- Navigate to: Repository > Settings > Secrets and variables > Actions > New repository secret

Create one secret for each:
- `SUPABASE_URL` — risedial-test project URL
- `SUPABASE_SERVICE_ROLE_KEY` — risedial-test service role key
- `JWT_SECRET` — same as .env.local JWT_SECRET (min 32 chars)
- `STRIPE_SECRET_KEY` — Stripe test mode secret key (`sk_test_*`)
- `STRIPE_WEBHOOK_SECRET` — Stripe test webhook secret (`whsec_*`)
- `STRIPE_PRICE_MONTHLY` — price ID
- `STRIPE_PRICE_ANNUAL` — price ID
- `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` — price ID
- `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` — price ID
- `OPENAI_API_KEY` — valid OpenAI key
- `NEXT_PUBLIC_SUPABASE_URL` — same as SUPABASE_URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — risedial-test anon key

(`NEXT_PUBLIC_APP_URL` is hardcoded to `http://localhost:3000` in the workflow — not a secret.)

**2.** Create the `.github/workflows/` directory:
```bash
mkdir -p .github/workflows
```

**3.** Create `.github/workflows/ci.yml` with the exact content from SPEC.md.

**4.** Run `npx tsc --noEmit` to verify the YAML file does not introduce TypeScript issues (it won't — YAML is not compiled by TypeScript, but the check confirms the overall project is still clean).

**5.** Commit:
```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow with typecheck, unit tests, and e2e tests"
```

**6.** Push to main:
```bash
git push origin main
```

**7.** Monitor the GitHub Actions run.

Navigate to: Repository > Actions > CI (the workflow name)

Expected:
- `TypeScript` job: green within ~1 minute
- `Unit & Integration Tests` job: green within ~3 minutes
- `E2E Tests` job: green within ~5 minutes

If any job fails:
- Click on the failing job to see logs
- For `unit-tests` failure: read the ZodError or test failure output; likely a missing secret or test logic issue
- For `e2e-tests` failure: download the `playwright-report` artifact from the summary page; open `playwright-report/index.html` to see screenshots and traces

---

## Decision Points

```
Configure 12 GitHub secrets
  ▼
Create .github/workflows/ci.yml
  ▼
Commit + push to main
  ▼
GitHub Actions run triggered
  ▼
TypeScript job
  │ green → continues to unit-tests
  │ red → tsc error; fix in code; push again
  ▼
Unit & Integration Tests job
  │ green → continues to e2e-tests
  │ red → read logs:
  │   ZodError → secret is missing or wrong format → fix secret value
  │   Test failure → logic bug found in CI env → fix test/code → push
  ▼
E2E Tests job
  │ green → PIPELINE COMPLETE
  │ red → download playwright-report artifact → inspect screenshots/traces
  │        Fix selector or timing issue → push
```

---

## Diagnosing CI Failures

**ZodError in unit-tests:**
The secret value does not satisfy the zod schema constraint. Check:
- `SUPABASE_URL` — must be a valid URL with `https://`
- `STRIPE_SECRET_KEY` — must start with `sk_`
- `STRIPE_WEBHOOK_SECRET` — must start with `whsec_`
- `OPENAI_API_KEY` — must start with `sk-`
- `JWT_SECRET` — must be at least 32 characters

**Playwright timeout in e2e-tests:**
- Selectors may be wrong in CI (different rendering timing on Ubuntu)
- Increase timeout values in the failing test: `{ timeout: 30000 }` instead of `{ timeout: 10000 }`
- Download the `playwright-report` artifact and open it locally; it shows a screenshot of the page at the moment of timeout

**dev server not starting:**
- The `webServer` config in `playwright.config.ts` waits for `http://localhost:3000` to respond
- If `npm run dev` fails in CI, check the logs for the webServer startup output
- Common cause: missing env var causing ZodError during server startup → fix the secret

---

## Post-conditions

- `.github/workflows/ci.yml` exists and is committed to the repository
- GitHub Actions shows green for all 3 jobs on the latest push to main
- The green check is visible next to the latest commit SHA on the main branch
- Pipeline complete
