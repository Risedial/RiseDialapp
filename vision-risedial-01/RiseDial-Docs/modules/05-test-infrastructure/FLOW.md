# Module 5 — Test Infrastructure: Flow

## Pre-conditions
- Module 4 complete: `lib/env.ts` committed; `npm run dev` starts without ZodError
- `npx tsc --noEmit` exits 0

---

## Steps

**1.** Install devDependencies:
```bash
npm install --save-dev \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  @playwright/test
```

**2.** Create `vitest.config.ts` at the project root.

Use the exact content from SPEC.md. Ensure:
- `environment: 'jsdom'`
- `globals: true`
- `setupFiles: ['./vitest.setup.ts']`
- All 13 test env vars are set in the `env` block (matching lib/env.ts zod format constraints)
- Coverage includes `lib/**/*.ts` and `app/api/**/*.ts`
- Coverage excludes only `lib/env.ts` (NOT `lib/supabase/client.ts` — that is included)
- Coverage thresholds: 100% for lines, functions, branches, statements
- Alias: `'@'` resolves to the project root

**3.** Create `vitest.setup.ts` at the project root:
```typescript
import '@testing-library/jest-dom'
```

**4.** Update `package.json` scripts.

In the `"scripts"` object, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

**5.** Create the `e2e/` directory with placeholder global setup files:

`e2e/globalSetup.ts`:
```typescript
export default async function globalSetup() {}
```

`e2e/globalTeardown.ts`:
```typescript
export default async function globalTeardown() {}
```

**6.** Create `playwright.config.ts` at the project root.

Use the exact content from SPEC.md. Ensure:
- `testDir: './e2e'`
- `globalSetup: './e2e/globalSetup.ts'`
- `globalTeardown: './e2e/globalTeardown.ts'`
- `baseURL: 'http://localhost:3000'`
- Only Chromium project
- `webServer` configured for `npm run dev`

**7.** Install Playwright browser binary:
```bash
npx playwright install chromium
```

**8.** Run Vitest on the empty `__tests__/` directory (directory does not exist yet — this is fine):
```bash
npx vitest run
```
- Expected: "No test files found" or similar; exit 0
- If exit 1: read the error. Common causes:
  - ZodError from lib/env.ts → fix the test env var values in vitest.config.ts
  - TypeScript error in vitest.config.ts → fix the config syntax
  - Missing module → install the missing package

**9.** Run Playwright on the empty `e2e/` directory:
```bash
npx playwright test
```
- Expected: "No tests found" or exit 0
- If exit 1: read the error. Common causes:
  - Missing globalSetup file → verify placeholder files exist
  - Browser binary not installed → run `npx playwright install chromium`
  - Port 3000 not available → check if a process is using port 3000

**10.** Run TypeScript check:
```bash
npx tsc --noEmit
```
Expected: exit 0. The new config files must not introduce type errors.

**11.** Create `__tests__/` directory (empty, as a placeholder for Module 6):
```bash
mkdir __tests__
```

**12.** Commit:
```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts
git add e2e/globalSetup.ts e2e/globalTeardown.ts
git add __tests__/
git add package.json package-lock.json
git commit -m "feat(test-infra): install Vitest + Playwright; add test scripts and config files"
```

---

## Decision Points

```
npm install devDependencies
  ▼
Create vitest.config.ts with env block + coverage config
  ▼
Create vitest.setup.ts
  ▼
Add 4 scripts to package.json
  ▼
Create e2e/ directory with placeholder globalSetup/globalTeardown
  ▼
Create playwright.config.ts
  ▼
npx playwright install chromium
  ▼
npx vitest run
  │ exit 0 → continue
  │ exit 1 → read error:
  │   ZodError → fix test env vars in vitest.config.ts
  │   Type error → fix config syntax
  │   Missing module → npm install
  ▼
npx playwright test
  │ exit 0 → continue
  │ exit 1 → read error:
  │   globalSetup not found → create placeholder files
  │   browser not installed → playwright install chromium
  ▼
npx tsc --noEmit → exit 0
  ▼
commit
```

---

## Post-conditions

- `vitest.config.ts` exists with jsdom env, test env vars, coverage config, and `@` alias
- `vitest.setup.ts` exists with `@testing-library/jest-dom` import
- `playwright.config.ts` exists with localhost:3000 config, globalSetup/globalTeardown references
- `e2e/globalSetup.ts` and `e2e/globalTeardown.ts` exist as placeholders
- `package.json` has `test`, `test:watch`, `test:coverage`, `test:e2e` scripts
- `npx vitest run` exits 0 on empty test suite
- `npx playwright test` exits 0 on empty e2e/ directory
- `npx tsc --noEmit` exits 0
- Ready to begin Module 6
