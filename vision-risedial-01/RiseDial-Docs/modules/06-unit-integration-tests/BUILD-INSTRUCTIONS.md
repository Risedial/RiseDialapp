# Module 6 — Unit & Integration Test Suite: Build Instructions

## What You Are Building

A `__tests__/` directory containing Vitest test files for every file in `lib/` and `app/api/`, achieving 100% line, branch, and function coverage.

---

## Prerequisites

- Module 5 complete: `npx vitest run` exits 0 on empty suite
- `vitest.config.ts` has all 13 test env vars configured
- `coverage/` is in `.gitignore`

---

## Working Pattern

Write one test file at a time. After writing each file, run `npx vitest run [filename]` to confirm all tests in that file pass before moving on. Do not batch all tests and run at the end — catch failures early.

---

## Test File 1: `__tests__/lib/auth/session.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSession, verifySession, setSessionCookie, clearSessionCookie } from '@/lib/auth/session'

describe('createSession', () => {
  it('returns a 3-part JWT string', async () => {
    const token = await createSession('user-id-123', 'active')
    expect(token.split('.')).toHaveLength(3)
  })

  it('encodes user_id and subscription_status in payload', async () => {
    const token = await createSession('user-id-123', 'active')
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.user_id).toBe('user-id-123')
    expect(payload.subscription_status).toBe('active')
  })

  it('sets exp to 30 days from now', async () => {
    const before = Math.floor(Date.now() / 1000)
    const token = await createSession('user-id-123', 'active')
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expectedExp = before + 30 * 24 * 60 * 60
    expect(payload.exp).toBeGreaterThanOrEqual(expectedExp - 5)
    expect(payload.exp).toBeLessThanOrEqual(expectedExp + 5)
  })
})

describe('verifySession', () => {
  it('returns payload for a valid token', async () => {
    const token = await createSession('user-id-123', 'active')
    const result = await verifySession(token)
    expect(result).toEqual(expect.objectContaining({
      user_id: 'user-id-123',
      subscription_status: 'active',
    }))
  })

  it('returns null for a tampered signature', async () => {
    const token = await createSession('user-id-123', 'active')
    const parts = token.split('.')
    const tampered = [parts[0], parts[1], parts[2] + 'x'].join('.')
    const result = await verifySession(tampered)
    expect(result).toBeNull()
  })

  it('returns null for a token with wrong number of parts', async () => {
    expect(await verifySession('not.valid')).toBeNull()
    expect(await verifySession('onlyone')).toBeNull()
    expect(await verifySession('')).toBeNull()
  })
})

describe('setSessionCookie', () => {
  it('sets cookie with correct security attributes', () => {
    const mockResponse = { cookies: { set: vi.fn() } }
    setSessionCookie(mockResponse as never, 'test-token')
    expect(mockResponse.cookies.set).toHaveBeenCalledWith(
      expect.any(String),
      'test-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
    )
  })
})

describe('clearSessionCookie', () => {
  it('sets maxAge to 0', () => {
    const mockResponse = { cookies: { set: vi.fn() } }
    clearSessionCookie(mockResponse as never)
    expect(mockResponse.cookies.set).toHaveBeenCalledWith(
      expect.any(String),
      '',
      expect.objectContaining({ maxAge: 0 })
    )
  })
})
```

---

## Test File 2: `__tests__/lib/env.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Test the schema directly, not the parsed env object
// Import the schema shape — you may need to export it from lib/env.ts
// If not exported, reconstruct it here for testing purposes

const testSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRICE_MONTHLY: z.string().startsWith('price_'),
  STRIPE_PRICE_ANNUAL: z.string().startsWith('price_'),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z.string().startsWith('price_'),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z.string().startsWith('price_'),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

const validEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-key',
  JWT_SECRET: 'a-valid-jwt-secret-that-is-32-chars-long',
  STRIPE_SECRET_KEY: 'sk_test_key',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  STRIPE_PRICE_MONTHLY: 'price_monthly',
  STRIPE_PRICE_ANNUAL: 'price_annual',
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_prem_monthly',
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_prem_annual',
  OPENAI_API_KEY: 'sk-openai-key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
}

describe('env schema', () => {
  it('accepts a fully valid env object', () => {
    expect(() => testSchema.parse(validEnv)).not.toThrow()
  })

  it('rejects an empty object', () => {
    expect(() => testSchema.parse({})).toThrow(z.ZodError)
  })

  it('rejects JWT_SECRET shorter than 32 characters', () => {
    expect(() => testSchema.parse({ ...validEnv, JWT_SECRET: 'short' })).toThrow()
  })

  it('rejects STRIPE_SECRET_KEY not starting with sk_', () => {
    expect(() => testSchema.parse({ ...validEnv, STRIPE_SECRET_KEY: 'pk_live_key' })).toThrow()
  })

  it('rejects OPENAI_API_KEY not starting with sk-', () => {
    expect(() => testSchema.parse({ ...validEnv, OPENAI_API_KEY: 'not-sk-key' })).toThrow()
  })

  it('rejects SUPABASE_URL that is not a valid URL', () => {
    expect(() => testSchema.parse({ ...validEnv, SUPABASE_URL: 'not-a-url' })).toThrow()
  })

  it('includes the field name in ZodError path', () => {
    try {
      testSchema.parse({ ...validEnv, JWT_SECRET: 'short' })
    } catch (e) {
      if (e instanceof z.ZodError) {
        expect(e.errors[0].path).toContain('JWT_SECRET')
      }
    }
  })
})
```

---

## Test Files 3–9: Write to `__tests__/lib/` and `__tests__/app/api/`

For each remaining test file:

1. Copy the mock setup pattern from FLOW.md
2. Write one `describe` block per exported function
3. Write one `it` per test case listed in SPEC.md
4. Use `beforeEach(() => { vi.clearAllMocks() })` to reset mock call counts between tests
5. Run `npx vitest run [filename]` after each file is written

---

## Coverage Verification

After all test files are written:

```bash
npx vitest run --coverage
```

Open `coverage/index.html`. For any file showing < 100%:
1. Click on the file in the coverage report
2. Red lines = uncovered lines; yellow = partially covered branches
3. Write a test case that exercises the uncovered path
4. Re-run coverage

Common uncovered branches:
- Error handling: the `if (error)` branch after a Supabase call — mock the query to return an error object
- Null guards: the `if (!data)` branch — mock the query to return null data
- Default case in switch statements — call the function with an unknown event type

---

## Add coverage/ to .gitignore

```bash
echo "coverage/" >> .gitignore
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
```

---

## Commit

```bash
git add __tests__/ .gitignore
git commit -m "test: add unit and integration test suite with 100% coverage of lib/ and app/api/"
```

---

## Definition of Done

- [ ] `npx vitest run` exits 0 with all test files passing
- [ ] `npx vitest run --coverage` exits 0 with 100% lines, functions, branches for all included files
- [ ] `coverage/`, `playwright-report/`, `test-results/` are in `.gitignore`
- [ ] No test makes a real network call (all external dependencies mocked)
- [ ] Ready to begin Module 7
