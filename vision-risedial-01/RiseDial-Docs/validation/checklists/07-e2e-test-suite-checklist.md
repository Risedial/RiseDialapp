# Module 7 — E2E Test Suite: Validation Checklist

- [ ] `npx playwright test` exits 0 locally with all spec files running (or Flow 1 explicitly skipped via `SKIP_STRIPE_E2E=true`)
- [ ] `e2e/globalSetup.ts` creates `e2e/fixtures/test-user.json` before tests run — after `npx playwright test` completes, the file has been deleted (teardown ran); verify by running `ls e2e/fixtures/` immediately after a test run starts and before it ends
- [ ] The test user created by globalSetup has `subscription_status: 'active'` in the Supabase `risedial-test` database — verify in the Supabase dashboard under Table Editor > users during a test run
- [ ] `e2e/fixtures/` is listed in `.gitignore` — `grep "e2e/fixtures" .gitignore` returns a result
- [ ] `playwright-report/` is listed in `.gitignore` — `grep "playwright-report" .gitignore` returns a result
- [ ] Running `SKIP_STRIPE_E2E=true npx playwright test` exits 0 with Flow 1 (signup.spec.ts) reported as skipped, not failed
- [ ] All spec files exist: `e2e/signup.spec.ts`, `e2e/auth.spec.ts`, `e2e/chat.spec.ts`, `e2e/billing.spec.ts` — `ls e2e/*.spec.ts` shows all four
- [ ] After `npx playwright test` completes, no test user rows from the test run remain in the Supabase `risedial-test` `users` table — verify by checking for rows with email matching `*@risedial.test` pattern
