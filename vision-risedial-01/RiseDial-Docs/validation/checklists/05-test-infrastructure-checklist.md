# Module 5 — Test Infrastructure: Validation Checklist

- [ ] `vitest.config.ts` exists in the project root — `ls vitest.config.ts` succeeds
- [ ] `playwright.config.ts` exists in the project root — `ls playwright.config.ts` succeeds
- [ ] `playwright.config.ts` references both `globalSetup` and `globalTeardown` — `grep "globalSetup\|globalTeardown" playwright.config.ts` returns two results
- [ ] `npx vitest run` exits 0 with the message "No test files found" or runs zero test files (no errors about missing configuration)
- [ ] `npx playwright test` exits 0 with the message "No tests found" or skips all placeholder tests (no errors about missing configuration)
- [ ] `package.json` contains scripts for `test`, `test:coverage`, `test:e2e`, and `test:e2e:ui` — `grep -c "\"test" package.json` returns 4 or more
- [ ] Chromium browser is installed for Playwright — `npx playwright install chromium` exits 0 (idempotent; safe to run again)
- [ ] `npx tsc --noEmit` exits 0 with both config files present
