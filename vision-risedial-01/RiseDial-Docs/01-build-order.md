# RiseDial — Build Order

## Module Sequence

| # | Module | One-Line Description | Requires |
|---|--------|----------------------|---------|
| 1 | Build Error Resolution | Delete stale tsbuildinfo, fix all tsc errors, confirm next build passes | Nothing |
| 2 | Codebase Audit | 14-area read-only review producing AUDIT.md | Module 1 |
| 3 | Code Fixes | Apply every AUDIT.md finding as an atomic git commit | Module 2 |
| 4 | Environment Variable Validation | Create lib/env.ts with zod; update all process.env call sites | Module 3 |
| 5 | Test Infrastructure | Install Vitest + Playwright; create config files; verify empty runs pass | Module 4 |
| 6 | Unit & Integration Test Suite | Write Vitest tests for 100% coverage of lib/ and app/api/ | Module 5 |
| 7 | E2E Test Suite | Write 4 Playwright flows against local dev server with risedial-test Supabase | Module 6 |
| 8 | CI Pipeline | Add .github/workflows/ci.yml; push; verify all 3 CI jobs pass | Module 7 |

---

## Dependency Statements

**Module 1 — Build Error Resolution**  
Requires: Nothing.  
This is the entry point. No other work is meaningful until the codebase compiles. Running `npx tsc --noEmit` on an error-producing codebase produces misleading output for the audit; `next build` cannot pass on Vercel until the TypeScript layer is clean. All subsequent modules assume a compilable state.

**Module 2 — Codebase Audit**  
Requires: Module 1 complete — `npx tsc --noEmit` exits 0; `next build` exits 0.  
The audit is a read-only pass that categorises all correctness problems. It must run after Module 1 so that the source files being read are in their post-fix state. Auditing a file with known type errors produces misleading findings about what needs to change.

**Module 3 — Code Fixes**  
Requires: Module 2 complete — `AUDIT.md` exists at project root with all 14 areas populated.  
Fixes are applied from AUDIT.md Area 14's ordered fix execution plan. Without a complete audit, the fix list is incomplete and fixes may be applied in the wrong dependency order (e.g., the webhook consolidation must happen before the idempotency logic is moved).

**Module 4 — Environment Variable Validation**  
Requires: Module 3 complete — all blocking AUDIT.md findings committed; `npx tsc --noEmit` still exits 0 after all fixes.  
`lib/env.ts` imports only `zod` and exports a typed `env` object. It is then imported by `lib/supabase/server.ts`, `lib/auth/session.ts`, and `lib/stripe/config.ts`. If those files still have type errors from unresolved Module 3 work, adding the `lib/env.ts` import may create confusing layered errors. A clean fix state is required first.

**Module 5 — Test Infrastructure**  
Requires: Module 4 complete — `lib/env.ts` committed; `npm run dev` starts at localhost:3000 without ZodError when `.env.local` is populated.  
`vitest.config.ts` includes `lib/**/*.ts` in the coverage scope. When Vitest imports those files, `lib/env.ts` runs its `envSchema.parse(process.env)` at module-load time. If test env vars are not set (via `vitest.config.ts` env or `.env.test`), every test will fail at import. The empty-run verification from Module 5 confirms the test runner can load the app modules cleanly.

**Module 6 — Unit & Integration Test Suite**  
Requires: Module 5 complete — `npx vitest run` exits 0 on an empty test suite; `npx playwright test` exits 0 on an empty `e2e/` directory.  
If the test runners themselves are misconfigured (wrong aliases, wrong environment, wrong setup files), every test written in Module 6 will fail for infrastructure reasons, not logic reasons. Validate the infrastructure first.

**Module 7 — E2E Test Suite**  
Requires: Module 6 complete — `npx vitest run --coverage` exits 0; coverage report shows 100% for all included files.  
E2E tests run against the real application stack. The unit tests in Module 6 confirm the application logic is correct before testing user flows end-to-end. Writing E2E tests before unit tests pass risks chasing integration failures that are actually logic bugs.

**Module 8 — CI Pipeline**  
Requires: Module 7 complete — `npx playwright test` exits 0 for all 4 flows against local dev server.  
The CI pipeline runs `npx tsc --noEmit`, `npx vitest run --coverage`, and `npx playwright test`. If any of these do not pass locally, adding CI creates a permanently red pipeline that is harder to diagnose remotely than locally.

---

## Integration Checkpoints

| After | Wire To | Verify By |
|-------|---------|-----------|
| Module 1 | Module 2 | `npx tsc --noEmit` exits 0, zero output; `npx next build` exits 0 |
| Module 2 | Module 3 | `AUDIT.md` present at project root; all 14 sections have content (findings or explicit "no finding noted") |
| Module 3 | Module 4 | `npx tsc --noEmit` exits 0 after all fix commits; `git log --oneline` shows one commit per fix |
| Module 4 | Module 5 | `npm run dev` starts at localhost:3000 without throwing ZodError when `.env.local` has all required vars |
| Module 5 | Module 6 | `npx vitest run` exits 0 (zero tests is acceptable); `npx playwright test` exits 0 with empty `e2e/` directory |
| Module 6 | Module 7 | `npx vitest run --coverage` exits 0; `coverage/index.html` shows 100% lines, functions, branches for `lib/**` and `app/api/**` |
| Module 7 | Module 8 | `npx playwright test` exits 0 locally; all 4 spec files pass; globalSetup.ts creates test user and globalTeardown.ts removes it |
| Module 8 | Done | GitHub Actions CI page for the latest push to main shows three green check marks |

---

## Project-Level "Done" Definition

The pipeline is complete when a single GitHub Actions CI run, triggered by a push to the `main` branch, completes with three green checks:

1. **typecheck** — `npx tsc --noEmit` exits 0 with no output
2. **unit-tests** — `npx vitest run --coverage` exits 0; all included files at 100% lines, functions, branches
3. **e2e-tests** — `npx playwright test` exits 0; Flows 2 (login), 3 (chat), and 4 (billing portal) pass; Flow 1 (signup) is skipped in CI via `SKIP_STRIPE_E2E=true` and is covered by unit tests for the webhook handler

Observable to anyone who opens the GitHub repository main branch and sees a green check next to the latest commit SHA.

---

## Notes on Open Decisions (Resolved Before Documentation)

| Decision | Resolution | Impact on Build |
|----------|-----------|----------------|
| E2E Supabase project | Separate `risedial-test` project | Module 7 globalSetup targets test project; Module 8 uses separate `SUPABASE_*_TEST` secrets |
| Stripe webhook in CI | Skip signup flow via `SKIP_STRIPE_E2E=true` | Module 7 signup spec uses `test.skip`; Module 6 covers webhook unit tests |
| E2E test user creation | Playwright `globalSetup.ts` inserts test user row directly via Supabase service role | Module 7 includes globalSetup.ts and globalTeardown.ts |
| NEXT_PUBLIC vars | Found 3: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` | Module 4 adds all 3 to lib/env.ts schema |
| lib/supabase/client.ts coverage | Included in coverage (not excluded) | Module 6 includes `__tests__/lib/supabase/client.test.ts` |
| orchestration/ directory | Excluded from tsconfig `exclude` array | Module 3 adds `"orchestration"` to tsconfig exclude |
| Rate limiter atomicity migration | `supabase/migrations/002_atomic_rate_limit.sql` | Module 3 creates this file |
| jsonwebtoken removal | Remove from package.json if grep finds zero imports | Module 3 includes this check and removal |
