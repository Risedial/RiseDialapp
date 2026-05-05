# Module 6 — Unit & Integration Test Suite: Flow

## Pre-conditions
- Module 5 complete: `npx vitest run` exits 0; `npx playwright test` exits 0
- `npx tsc --noEmit` exits 0
- `coverage/` is in `.gitignore`

---

## Steps

**1.** Create the `__tests__/` directory structure mirroring the source:
```
__tests__/
  lib/
    auth/
      session.test.ts
    rise/
      rate-limit.test.ts
    memory/
      trigger.test.ts
      executor.test.ts
    stripe/
      webhooks.test.ts
    supabase/
      client.test.ts
    env.test.ts
  app/
    api/
      chat/
        [chatId]/
          message/
            route.test.ts
      webhooks/
        stripe/
          route.test.ts
      [... all other api routes ...]
```

**2.** Add `coverage/` to `.gitignore` if not already present.

**3.** Write tests for pure lib functions first (no mocks needed or simple mocks).

**Order:**

3a. `__tests__/lib/auth/session.test.ts` — tests `createSession` and `verifySession` using the `crypto.subtle` Web Crypto API (available in jsdom environment)

3b. `__tests__/lib/env.test.ts` — tests the zod schema in isolation

3c. `__tests__/lib/rise/rate-limit.test.ts` — mocks `@/lib/supabase/server`

3d. `__tests__/lib/memory/trigger.test.ts` — mocks `@/lib/supabase/server`

3e. `__tests__/lib/memory/executor.test.ts` — mocks `@/lib/memory/compress`, `@/lib/memory/patch`, `@/lib/memory/trigger`

3f. `__tests__/lib/stripe/webhooks.test.ts` — mocks `@/lib/supabase/server` and `stripe`

3g. `__tests__/lib/supabase/client.test.ts` — mocks `@supabase/ssr`

**4.** After each test file is written, run:
```bash
npx vitest run __tests__/lib/auth/session.test.ts
```
Confirm all tests in that file pass before moving to the next file.

**5.** Write tests for API route files.

5a. `__tests__/app/api/chat/[chatId]/message/route.test.ts`
5b. `__tests__/app/api/webhooks/stripe/route.test.ts`
5c. All remaining route files in `app/api/`

For each route file, run `npx vitest run [test file path]` to confirm tests pass.

**6.** Run the full test suite:
```bash
npx vitest run
```
All tests must pass. Fix any failures before continuing.

**7.** Run coverage:
```bash
npx vitest run --coverage
```
Open `coverage/index.html` in a browser to view per-file coverage. Any file below 100% needs additional test cases.

**8.** For each file below 100%:

8a. Identify the uncovered line or branch in the coverage report

8b. Write a test case that exercises that specific path

8c. Re-run coverage until all files show 100%

**9.** Final verification:
```bash
npx vitest run --coverage
# Expected: all tests pass; coverage shows 100% for all included files
npx tsc --noEmit
# Expected: exit 0
```

**10.** Commit:
```bash
git add __tests__/ coverage/ .gitignore
git commit -m "test: add unit and integration test suite with 100% coverage"
```

(Note: `coverage/` itself is gitignored, but the `.gitignore` update adding it is committed.)

---

## Decision Points

```
Create __tests__/ structure
  ▼
Write session.test.ts → vitest run [file] → pass?
  │ no → fix test or fix the bug it found → re-run
  │ yes → next
  ▼
Write env.test.ts → vitest run [file] → pass?
  ...
  ▼ (for each test file)
  ▼
npx vitest run (all tests)
  │ all pass → run coverage
  │ any fail → fix
  ▼
npx vitest run --coverage
  │ 100% → commit
  │ below 100% → identify uncovered path → add test → re-run coverage
```

---

## Mock Pattern Reference

Standard mock for supabaseServer:
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}))
```

Standard mock for Stripe client:
```typescript
vi.mock('stripe', () => {
  const mockStripe = {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  }
  return {
    default: vi.fn().mockImplementation(() => mockStripe),
  }
})
```

Standard mock for Next.js response (for cookie tests):
```typescript
const mockResponse = {
  cookies: {
    set: vi.fn(),
  },
}
```

Standard API route test setup:
```typescript
function makeRequest(options: {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}) {
  return new Request('http://localhost:3000/api/...', {
    method: options.method ?? 'POST',
    headers: new Headers(options.headers ?? {}),
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
}
```

---

## Post-conditions

- All test files in `__tests__/` exist and pass
- `npx vitest run` exits 0 with all tests passing
- `npx vitest run --coverage` exits 0 with 100% for all included files
- `coverage/` is in `.gitignore`
- Ready to begin Module 7
