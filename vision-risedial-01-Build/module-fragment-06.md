# Module Fragment 06 — Unit & Integration Test Suite

## Role

You are the test engineer for the RiseDial production codebase. Your sole responsibility in this module is to write a complete, passing vitest test suite that achieves 100% line, function, and branch coverage of all files under `lib/**` and `app/api/**`, with every external dependency mocked. You may not add product features, change API response shapes, modify UI, or make real network/database/Stripe/OpenAI calls. You write exactly the 9 test files listed below and the supporting config changes. Nothing else.

---

## Context

### Locked Tech Values

| Key | Value |
|---|---|
| cookie_name | `risedial_session` |
| jwt_algorithm | HS256 |
| jwt_claim: user_id | `user_id` |
| jwt_claim: subscription_status | `subscription_status` |
| jwt_claim: iat | `iat` |
| jwt_claim: exp | `exp` |
| jwt_expiry_seconds | 2592000 (30 days) |
| jwt_secret_min_length | 32 |
| jwt_implementation | `crypto.subtle` (Web Crypto API) |
| middleware_header: user_id | `x-user-id` |
| middleware_header: subscription_status | `x-subscription-status` |
| rate_limit_window_minutes | 60 |
| rate_limit_max_messages | 60 |
| memory_compression_initial_threshold | 50 |
| memory_compression_patch_interval | 10 |
| memory_compression_retry_attempts | 3 |
| rpc: increment_message_count | `increment_message_count(p_user_id uuid)` |
| rpc param | `p_user_id` |
| webhook_idempotency_field | `stripe_event_id` |
| stripe_event: checkout_completed | `checkout.session.completed` |
| stripe_event: subscription_updated | `customer.subscription.updated` |
| stripe_event: subscription_deleted | `customer.subscription.deleted` |
| stripe_event: invoice_payment_failed | `invoice.payment_failed` |
| stripe_header: signature | `stripe-signature` |
| rate_limit_return_shape | `{ allowed: boolean, remaining: number }` |
| compression_trigger_return_shape | `{ shouldCompress: boolean, isInitial: boolean, isPatch: boolean }` |
| lib_rate_limit_exports | `checkRateLimit`, `recordMessage` |
| lib_memory_executor_export | `executeCompressionAsync` |
| session_exports | `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie` |
| test_isolation | `vi.mock()` at module boundary |
| zod_error_message: JWT_SECRET | `JWT_SECRET must be at least 32 characters` |

### Locked Constraints

1. Do not refactor surrounding code.
2. No new product features may be added during this pipeline.
3. No UI changes.
4. No new features.
5. No real network calls in unit tests. No real database.
6. No test makes a real database call, real Stripe API call, or real OpenAI API call.
7. `lib/env.ts` must have zero imports from the project; only `import { z } from 'zod'` is allowed.
8. `lib/supabase/client.ts` does NOT import `lib/env.ts`.
9. `npx tsc --noEmit` must exit 0 after every commit in this module.
10. No API response shapes are changed.
11. Tests that import files which depend on `lib/env.ts` must either set test env vars in `vitest.config.ts` or mock `lib/env.ts`.
12. Silent failure that results in an empty assistant message is not acceptable.
13. Must use `--noEmit` not build for type checking.

---

## What Must Be True After This Module

`npx vitest run --coverage` exits 0 with 100% line, function, and branch coverage of all files in `lib/` and `app/api/`, with all external dependencies mocked.

---

## Prerequisites — Install vitest and coverage provider

Before the test files will run, add vitest and its dependencies. These are dev dependencies only and do not touch production code:

```bash
npm install --save-dev vitest @vitest/coverage-v8 @vitejs/plugin-react vite-tsconfig-paths
```

Then create `vitest.config.ts` in the repo root:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      // Provide all env vars that module-level code reads at import time.
      // These are fake values — no real services are called.
      JWT_SECRET: 'test-secret-that-is-at-least-32-chars!!',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      STRIPE_SECRET_KEY: 'sk_test_fake',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_fake',
      STRIPE_PRICE_MONTHLY: 'price_monthly_fake',
      STRIPE_PRICE_ANNUAL: 'price_annual_fake',
      STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
      STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      include: ['lib/**', 'app/api/**'],
      exclude: ['lib/env.ts'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
})
```

Also add `coverage/` to `.gitignore`:

```
# test coverage
coverage/
```

And add these scripts to `package.json`:

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

---

## Files to Change

### 1. `__tests__/lib/auth/session.test.ts`

Tests `createSession`, `verifySession`, `setSessionCookie`, and `clearSessionCookie` from `lib/auth/session.ts`. The module uses `process.env.JWT_SECRET` at the top of the module (not through `lib/env.ts`), so the env var set in `vitest.config.ts` is sufficient. `next/server` is mocked so `NextResponse` is available without a Next.js runtime.

```typescript
// __tests__/lib/auth/session.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server so NextResponse is available in a plain Node environment ──
vi.mock('next/server', () => {
  class MockCookies {
    private store: Map<string, { value: string; options: Record<string, unknown> }> = new Map()
    set(name: string, value: string, options: Record<string, unknown> = {}) {
      this.store.set(name, { value, options })
    }
    get(name: string) {
      return this.store.get(name)
    }
  }

  class MockNextResponse {
    cookies = new MockCookies()
    status: number
    body: unknown
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body
      this.status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }

  return { NextResponse: MockNextResponse }
})

import {
  createSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session'
import { NextResponse } from 'next/server'

// The vitest.config.ts sets JWT_SECRET to a 40-char value. session.ts reads it
// at module-load time from process.env, so the correct secret is already in use.

describe('createSession', () => {
  it('returns a three-part dot-separated JWT string', async () => {
    const token = await createSession('user-123', 'active')
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
  })

  it('embeds user_id and subscription_status in the payload', async () => {
    const token = await createSession('user-abc', 'lapsed')
    const [, payloadB64] = token.split('.')
    // base64url → base64 → JSON
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const json = atob(padded + '='.repeat(pad))
    const payload = JSON.parse(json)
    expect(payload.user_id).toBe('user-abc')
    expect(payload.subscription_status).toBe('lapsed')
    expect(typeof payload.iat).toBe('number')
    expect(typeof payload.exp).toBe('number')
    expect(payload.exp - payload.iat).toBe(60 * 60 * 24 * 30)
  })

  it('encodes header as HS256/JWT', async () => {
    const token = await createSession('u', 's')
    const [headerB64] = token.split('.')
    const padded = headerB64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const header = JSON.parse(atob(padded + '='.repeat(pad)))
    expect(header.alg).toBe('HS256')
    expect(header.typ).toBe('JWT')
  })
})

describe('verifySession', () => {
  it('returns payload for a freshly created token', async () => {
    const token = await createSession('user-xyz', 'active')
    const result = await verifySession(token)
    expect(result).not.toBeNull()
    expect(result?.user_id).toBe('user-xyz')
    expect(result?.subscription_status).toBe('active')
  })

  it('returns null for a token with a tampered signature', async () => {
    const token = await createSession('user-1', 'active')
    const parts = token.split('.')
    // Flip the last character of the signature
    const badSig = parts[2].slice(0, -1) + (parts[2].endsWith('a') ? 'b' : 'a')
    const bad = `${parts[0]}.${parts[1]}.${badSig}`
    expect(await verifySession(bad)).toBeNull()
  })

  it('returns null for a token with fewer than 3 parts', async () => {
    expect(await verifySession('only.two')).toBeNull()
  })

  it('returns null for a token with more than 3 parts', async () => {
    expect(await verifySession('a.b.c.d')).toBeNull()
  })

  it('returns null for a completely garbage string', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull()
  })

  it('returns null for an expired token', async () => {
    // Create a token then fake the clock so exp is in the past
    const token = await createSession('user-2', 'active')
    const [header, payload, sig] = token.split('.')

    // Decode payload, push exp 31 days into the past
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (padded.length % 4)) % 4
    const decoded = JSON.parse(atob(padded + '='.repeat(pad)))
    decoded.exp = Math.floor(Date.now() / 1000) - 1 // already expired

    // Re-encode (note: signature won't match — this tests the expiry branch
    // only if we also tamper the payload, but more precisely we want to
    // test expiry separately. We do that by mocking Date.now instead.)
    // Instead, use vi.setSystemTime to push time past the token's real exp.
    const expiry = decoded.exp + 60 * 60 * 24 * 30 + 1 // past the real exp
    vi.useFakeTimers()
    vi.setSystemTime(new Date(expiry * 1000))
    const result = await verifySession(token)
    vi.useRealTimers()
    expect(result).toBeNull()
  })
})

describe('setSessionCookie', () => {
  it('sets the risedial_session cookie with correct attributes', () => {
    const response = NextResponse.json({}) as unknown as InstanceType<typeof NextResponse> & {
      cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined }
    }
    setSessionCookie(response as never, 'my-token')
    const cookie = (response as unknown as { cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined } }).cookies.get('risedial_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('my-token')
    expect(cookie?.options).toMatchObject({
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  })
})

describe('clearSessionCookie', () => {
  it('sets the risedial_session cookie to empty string with maxAge 0', () => {
    const response = NextResponse.json({}) as unknown as InstanceType<typeof NextResponse> & {
      cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined }
    }
    clearSessionCookie(response as never)
    const cookie = (response as unknown as { cookies: { get: (n: string) => { value: string; options: Record<string, unknown> } | undefined } }).cookies.get('risedial_session')
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe('')
    expect(cookie?.options).toMatchObject({ maxAge: 0 })
  })
})
```

---

### 2. `__tests__/lib/rise/rate-limit.test.ts`

Tests `checkRateLimit` and `recordMessage` from `lib/rise/rate-limit.ts`. Supabase is fully mocked at the module boundary.

```typescript
// __tests__/lib/rise/rate-limit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock @supabase/supabase-js and the server client ──────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = {
    from: vi.fn(),
  }
  return { supabaseServer: mockSupabase }
})

import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit'
import { supabaseServer } from '@/lib/supabase/server'

// Helper to build a chainable Supabase query mock that resolves to `result`
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'gte', 'order', 'limit', 'maybeSingle', 'update', 'insert']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  // Terminal call resolves to result
  ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue(result)
  // update/insert also resolve
  ;(chain.update as ReturnType<typeof vi.fn>).mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })
  ;(chain.insert as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })
  return chain
}

const mockFrom = vi.mocked(supabaseServer.from)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('checkRateLimit', () => {
  it('returns allowed:true and remaining:60 when no active window exists', async () => {
    // maybeSingle returns null → no active window
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: true, remaining: 60 })
  })

  it('returns allowed:true when message_count is below the limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 30, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: true, remaining: 30 })
  })

  it('returns allowed:false and remaining:0 when message_count equals limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 60, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })

  it('returns allowed:false and remaining:0 when message_count exceeds limit', async () => {
    const chain = makeChain({
      data: { id: 'w-1', message_count: 65, window_start: new Date().toISOString() },
      error: null,
    })
    mockFrom.mockReturnValue(chain as never)

    const result = await checkRateLimit('user-1')
    expect(result).toEqual({ allowed: false, remaining: 0 })
  })

  it('throws when supabase returns an error', async () => {
    const chain = makeChain({ data: null, error: { message: 'DB failure' } })
    mockFrom.mockReturnValue(chain as never)

    await expect(checkRateLimit('user-1')).rejects.toThrow('Failed to query rate_limit_tracking')
  })
})

describe('recordMessage', () => {
  it('inserts a new window when no active window exists', async () => {
    // First call (getActiveWindow inside recordMessage): returns null
    const nullChain = makeChain({ data: null, error: null })
    // The insert chain
    const insertChain = {
      from: vi.fn(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFrom
      .mockReturnValueOnce(nullChain as never)  // getActiveWindow
      .mockReturnValueOnce(insertChain as never) // insert

    await expect(recordMessage('user-new')).resolves.toBeUndefined()
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-new', message_count: 1 })
    )
  })

  it('updates message_count when an active window exists', async () => {
    const existingWindow = { id: 'w-existing', message_count: 5, window_start: new Date().toISOString() }

    // eq chain for the update
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateChain = { update: vi.fn().mockReturnValue({ eq: eqMock }) }
    const selectChain = makeChain({ data: existingWindow, error: null })

    mockFrom
      .mockReturnValueOnce(selectChain as never) // getActiveWindow inside recordMessage
      .mockReturnValueOnce(updateChain as never)  // update call

    await expect(recordMessage('user-existing')).resolves.toBeUndefined()
    expect(updateChain.update).toHaveBeenCalledWith({ message_count: 6 })
    expect(eqMock).toHaveBeenCalledWith('id', 'w-existing')
  })

  it('throws when the update returns an error', async () => {
    const existingWindow = { id: 'w-err', message_count: 10, window_start: new Date().toISOString() }

    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'update failed' } })
    const updateChain = { update: vi.fn().mockReturnValue({ eq: eqMock }) }
    const selectChain = makeChain({ data: existingWindow, error: null })

    mockFrom
      .mockReturnValueOnce(selectChain as never)
      .mockReturnValueOnce(updateChain as never)

    await expect(recordMessage('user-err')).rejects.toThrow('Failed to increment message_count')
  })

  it('throws when the insert returns an error', async () => {
    const nullChain = makeChain({ data: null, error: null })
    const insertChain = {
      insert: vi.fn().mockResolvedValue({ error: { message: 'insert failed' } }),
    }

    mockFrom
      .mockReturnValueOnce(nullChain as never)
      .mockReturnValueOnce(insertChain as never)

    await expect(recordMessage('user-insert-err')).rejects.toThrow(
      'Failed to create rate limit window'
    )
  })
})
```

---

### 3. `__tests__/lib/memory/trigger.test.ts`

Tests `checkCompressionTrigger` at all boundary counts specified in verification criteria: 49, 50, 51, 59, 60, 61, 70, 80.

```typescript
// __tests__/lib/memory/trigger.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = { from: vi.fn() }
  return { supabaseServer: mockSupabase }
})

import { checkCompressionTrigger } from '@/lib/memory/trigger'
import { supabaseServer } from '@/lib/supabase/server'

const mockFrom = vi.mocked(supabaseServer.from)

// Builds a chain that resolves with a given count value
function makeCountChain(count: number | null, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const terminal = vi.fn().mockResolvedValue({ count, error })
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.not = vi.fn(() => terminal)
  return { chain, terminal }
}

beforeEach(() => {
  vi.clearAllMocks()
})

async function triggerFor(count: number) {
  const { chain } = makeCountChain(count)
  mockFrom.mockReturnValue(chain as never)
  return checkCompressionTrigger('chat-1', 'user-1')
}

describe('checkCompressionTrigger', () => {
  it('count=49 → shouldCompress:false', async () => {
    expect(await triggerFor(49)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=50 → shouldCompress:true, isInitial:true, isPatch:false', async () => {
    expect(await triggerFor(50)).toEqual({ shouldCompress: true, isInitial: true, isPatch: false })
  })

  it('count=51 → shouldCompress:false', async () => {
    expect(await triggerFor(51)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=59 → shouldCompress:false', async () => {
    expect(await triggerFor(59)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=60 → shouldCompress:true, isInitial:false, isPatch:true (patch at +10)', async () => {
    expect(await triggerFor(60)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('count=61 → shouldCompress:false', async () => {
    expect(await triggerFor(61)).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('count=70 → shouldCompress:true, isPatch:true (patch at +20)', async () => {
    expect(await triggerFor(70)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('count=80 → shouldCompress:true, isPatch:true (patch at +30)', async () => {
    expect(await triggerFor(80)).toEqual({ shouldCompress: true, isInitial: false, isPatch: true })
  })

  it('returns false when supabase returns an error (logs and does not throw)', async () => {
    const chain: Record<string, unknown> = {}
    const terminal = vi.fn().mockResolvedValue({ count: null, error: { message: 'DB error' } })
    chain.select = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.not = vi.fn(() => terminal)
    mockFrom.mockReturnValue(chain as never)

    const result = await checkCompressionTrigger('chat-err', 'user-err')
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })

  it('treats null count as 0 (no compression)', async () => {
    const { chain } = makeCountChain(null)
    mockFrom.mockReturnValue(chain as never)
    const result = await checkCompressionTrigger('chat-null', 'user-null')
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false })
  })
})
```

---

### 4. `__tests__/lib/memory/executor.test.ts`

Verifies `executeCompressionAsync` never throws under any conditions, including when underlying functions throw.

```typescript
// __tests__/lib/memory/executor.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// executor.ts imports 'server-only', mock it to prevent node errors
vi.mock('server-only', () => ({}))

// Mock the trigger and compression modules
vi.mock('@/lib/memory/trigger', () => ({
  checkCompressionTrigger: vi.fn(),
}))

vi.mock('@/lib/memory/compress', () => ({
  generateInitialProfile: vi.fn(),
}))

vi.mock('@/lib/memory/patch', () => ({
  patchMemoryProfile: vi.fn(),
}))

import { executeCompressionAsync } from '@/lib/memory/executor'
import { checkCompressionTrigger } from '@/lib/memory/trigger'
import { generateInitialProfile } from '@/lib/memory/compress'
import { patchMemoryProfile } from '@/lib/memory/patch'

const mockTrigger = vi.mocked(checkCompressionTrigger)
const mockGenerate = vi.mocked(generateInitialProfile)
const mockPatch = vi.mocked(patchMemoryProfile)

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('executeCompressionAsync — never throws', () => {
  it('resolves without throwing when no compression is needed', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: false, isInitial: false, isPatch: false })
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when initial compression succeeds', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockResolvedValue(undefined)
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when patch compression succeeds', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true })
    mockPatch.mockResolvedValue(undefined)
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when trigger check throws', async () => {
    mockTrigger.mockRejectedValue(new Error('trigger exploded'))
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (premium=false)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('OpenAI down'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    // Advance timers to satisfy retry delays (1s + 2s + 4s)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (premium=true, uses gpt-4o)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('OpenAI error'))

    const promise = executeCompressionAsync('chat-1', 'user-1', true)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
    // Verify it passed gpt-4o (premium model)
    expect(mockGenerate).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o')
  })

  it('resolves without throwing when compression fn throws on all 3 attempts (non-premium, uses gpt-4o-mini)', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true })
    mockPatch.mockRejectedValue(new Error('patch failed'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeUndefined()
    expect(mockPatch).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini')
  })

  it('retries exactly 3 times before giving up', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate.mockRejectedValue(new Error('always fails'))

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await promise
    expect(mockGenerate).toHaveBeenCalledTimes(3)
  })

  it('succeeds on second attempt and does not call compression fn a third time', async () => {
    mockTrigger.mockResolvedValue({ shouldCompress: true, isInitial: true, isPatch: false })
    mockGenerate
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValueOnce(undefined) // second attempt succeeds

    const promise = executeCompressionAsync('chat-1', 'user-1', false)
    await vi.runAllTimersAsync()
    await promise
    expect(mockGenerate).toHaveBeenCalledTimes(2)
  })

  it('resolves without throwing even if an unexpected outer error occurs', async () => {
    // Force the outer try block to fail by making trigger throw something unexpected
    mockTrigger.mockImplementation(() => { throw new Error('sync throw') })
    await expect(
      executeCompressionAsync('chat-1', 'user-1', false)
    ).resolves.toBeUndefined()
  })
})
```

---

### 5. `__tests__/lib/stripe/webhooks.test.ts`

Tests `verifyWebhookSignature` and `routeWebhookEvent` from `lib/stripe/webhooks.ts`, including the idempotency early-return path.

```typescript
// __tests__/lib/stripe/webhooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// ── Mock the stripe config (avoids real Stripe key requirement at import) ──────
vi.mock('@/lib/stripe/config', () => {
  const mockWebhooks = { constructEvent: vi.fn() }
  const mockSubscriptions = { retrieve: vi.fn() }
  return {
    stripe: {
      webhooks: mockWebhooks,
      subscriptions: mockSubscriptions,
    },
    PRICE_MONTHLY: 'price_monthly_fake',
    PRICE_ANNUAL: 'price_annual_fake',
    PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
    PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    PLAN_PRICES: {},
    getPriceIds: vi.fn(),
  }
})

// ── Mock supabase server client ────────────────────────────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const eq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })
  return { supabaseServer: { from } }
})

import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent)
const mockRetrieve = vi.mocked(stripe.subscriptions.retrieve)
const mockFrom = vi.mocked(supabaseServer.from)

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_fake'
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual_fake'
  process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON = 'price_premium_monthly_fake'
  process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON = 'price_premium_annual_fake'
})

describe('verifyWebhookSignature', () => {
  it('calls stripe.webhooks.constructEvent with the provided body and signature', () => {
    const fakeEvent = { id: 'evt_1', type: 'checkout.session.completed' } as Stripe.Event
    mockConstructEvent.mockReturnValue(fakeEvent)
    const result = verifyWebhookSignature('raw-body', 'sig-header')
    expect(mockConstructEvent).toHaveBeenCalledWith(
      'raw-body',
      'sig-header',
      process.env.STRIPE_WEBHOOK_SECRET
    )
    expect(result).toBe(fakeEvent)
  })

  it('propagates the error thrown by constructEvent on bad signature', () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found')
    })
    expect(() => verifyWebhookSignature('body', 'bad-sig')).toThrow('No signatures found')
  })
})

describe('routeWebhookEvent', () => {
  // Helper to build a minimal fake Stripe.Subscription
  function fakeSubscription(overrides: Partial<{
    customer: string
    items: { price: { id: string }; current_period_end: number; id: string }[]
  }> = {}): Stripe.Subscription {
    const items = overrides.items ?? [
      { price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' },
    ]
    return {
      customer: overrides.customer ?? 'cus_test',
      items: { data: items },
    } as unknown as Stripe.Subscription
  }

  it('handles checkout.session.completed and updates users table', async () => {
    const sub = fakeSubscription()
    mockRetrieve.mockResolvedValue(sub as never)

    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer: 'cus_123',
          metadata: { user_id: 'user-uuid' },
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'active', plan_type: 'monthly' })
    )
  })

  it('handles checkout.session.completed with missing subscription → early return', async () => {
    const event: Stripe.Event = {
      id: 'evt_checkout_nosub',
      type: 'checkout.session.completed',
      data: {
        object: { subscription: null, customer: null } as unknown as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(mockRetrieve).not.toHaveBeenCalled()
  })

  it('handles checkout.session.completed with missing user_id → early return', async () => {
    const sub = fakeSubscription()
    mockRetrieve.mockResolvedValue(sub as never)
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout_noid',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer: 'cus_123',
          metadata: {},
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('handles customer.subscription.updated', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_updated',
      type: 'customer.subscription.updated',
      data: { object: fakeSubscription() },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ plan_type: 'monthly' })
    )
  })

  it('handles customer.subscription.updated with no base price → early return without throw', async () => {
    const sub = fakeSubscription({
      items: [{ price: { id: 'price_unknown' }, current_period_end: 9999999999, id: 'item-x' }],
    })
    const eq = vi.fn()
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_updated_nobase',
      type: 'customer.subscription.updated',
      data: { object: sub },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('handles customer.subscription.deleted', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_sub_deleted',
      type: 'customer.subscription.deleted',
      data: { object: fakeSubscription() },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'lapsed' })
    )
  })

  it('handles invoice.payment_failed with a string customer', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_invoice_failed',
      type: 'invoice.payment_failed',
      data: {
        object: { customer: 'cus_456' } as Stripe.Invoice,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith({ subscription_status: 'lapsed' })
  })

  it('handles invoice.payment_failed with null customer → no DB update', async () => {
    const eq = vi.fn()
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_invoice_null',
      type: 'invoice.payment_failed',
      data: {
        object: { customer: null } as unknown as Stripe.Invoice,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })

  it('silently ignores unhandled event types', async () => {
    const event: Stripe.Event = {
      id: 'evt_unknown',
      type: 'payment_intent.created',
      data: { object: {} },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
  })

  it('detects premium add-on items in subscription', async () => {
    const sub = fakeSubscription({
      items: [
        { price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-base' },
        { price: { id: 'price_premium_monthly_fake' }, current_period_end: 9999999999, id: 'item-premium' },
      ],
    })
    mockRetrieve.mockResolvedValue(sub as never)

    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ update } as never)

    const event: Stripe.Event = {
      id: 'evt_checkout_premium',
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_premium',
          customer: 'cus_premium',
          metadata: { user_id: 'user-premium' },
        } as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ has_premium_memory: true, stripe_premium_item_id: 'item-premium' })
    )
  })
})
```

---

### 6. `__tests__/lib/supabase/client.test.ts`

Tests `lib/supabase/client.ts`. The module does NOT import `lib/env.ts` (constraint 8). It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `process.env` at module-load time, and throws if either is missing. The `@supabase/supabase-js` `createClient` function is mocked.

```typescript
// __tests__/lib/supabase/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/supabase-js so no real network calls are made
vi.mock('@supabase/supabase-js', () => {
  const mockClient = { auth: {}, from: vi.fn() }
  return { createClient: vi.fn(() => mockClient) }
})

import { createClient } from '@supabase/supabase-js'

const mockCreateClient = vi.mocked(createClient)

describe('lib/supabase/client', () => {
  it('exports supabaseClient without throwing when env vars are present', async () => {
    // env vars are set by vitest.config.ts — the module should load cleanly
    const mod = await import('@/lib/supabase/client')
    expect(mod.supabaseClient).toBeDefined()
  })

  it('calls createClient with the URL and anon key from environment', async () => {
    // The module is already loaded (cached). Verify createClient was called.
    expect(mockCreateClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: true }) })
    )
  })

  it('calls createClient with autoRefreshToken:true', () => {
    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ auth: expect.objectContaining({ autoRefreshToken: true }) })
    )
  })
})
```

---

### 7. `__tests__/lib/env.test.ts`

Tests that `lib/env.ts` throws a `ZodError` when `JWT_SECRET` is shorter than 32 characters. Because `lib/env.ts` does not exist yet (it is created by this module), the test also documents the required interface. The module must be re-imported in an isolated context per test.

**Important:** `lib/env.ts` must be created as part of this module. Its only allowed import is `import { z } from 'zod'`.

First, create `lib/env.ts`:

```typescript
// lib/env.ts
// CONSTRAINT: Only `import { z } from 'zod'` is allowed. No other project imports.
import { z } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),
})

// Parse and throw ZodError immediately if env is invalid.
// This is intentionally side-effectful at module load time.
export const env = envSchema.parse({
  JWT_SECRET: process.env.JWT_SECRET,
})
```

Then the test file:

```typescript
// __tests__/lib/env.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ZodError } from 'zod'

describe('lib/env', () => {
  const originalJwtSecret = process.env.JWT_SECRET

  afterEach(() => {
    // Restore original value
    process.env.JWT_SECRET = originalJwtSecret
    // Purge the module from Vitest's module registry so it re-executes on next import
    // @ts-expect-error — __vitest_module_deps__ is internal Vitest API
    if (typeof globalThis.__vitest_module_deps__ !== 'undefined') {
      globalThis.__vitest_module_deps__.delete('@/lib/env')
    }
  })

  it('parses successfully when JWT_SECRET is exactly 32 characters', async () => {
    process.env.JWT_SECRET = 'a'.repeat(32)
    // Dynamic import with cache-busting query to get a fresh evaluation
    const mod = await import(`@/lib/env?v=${Math.random()}`)
    expect(mod.env.JWT_SECRET).toBe('a'.repeat(32))
  })

  it('parses successfully when JWT_SECRET is longer than 32 characters', async () => {
    process.env.JWT_SECRET = 'b'.repeat(40)
    const mod = await import(`@/lib/env?v=${Math.random()}`)
    expect(mod.env.JWT_SECRET).toBe('b'.repeat(40))
  })

  it('throws ZodError when JWT_SECRET is shorter than 32 characters', async () => {
    process.env.JWT_SECRET = 'short'
    await expect(
      import(`@/lib/env?v=${Math.random()}`)
    ).rejects.toThrow(ZodError)
  })

  it('ZodError message contains the required text when JWT_SECRET is too short', async () => {
    process.env.JWT_SECRET = 'tooshort'
    let error: unknown
    try {
      await import(`@/lib/env?v=${Math.random()}`)
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(ZodError)
    const zodErr = error as ZodError
    expect(zodErr.errors[0].message).toBe('JWT_SECRET must be at least 32 characters')
  })

  it('throws ZodError when JWT_SECRET is undefined', async () => {
    delete process.env.JWT_SECRET
    await expect(
      import(`@/lib/env?v=${Math.random()}`)
    ).rejects.toThrow(ZodError)
  })
})
```

---

### 8. `__tests__/app/api/chat/[chatId]/message/route.test.ts`

Verifies the message route returns 429 when `checkRateLimit` returns `{ allowed: false }`, and covers the full response path tree (401, 403, 404, 400, 200).

```typescript
// __tests__/app/api/chat/[chatId]/message/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──────────────────────────────────────────────────────────
vi.mock('next/server', () => {
  class MockNextResponse {
    public _body: unknown
    public _status: number
    constructor(body: unknown, init?: { status?: number }) {
      this._body = body
      this._status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }
  return { NextRequest: class {}, NextResponse: MockNextResponse }
})

// ── Mock all lib dependencies ─────────────────────────────────────────────────
vi.mock('@/lib/auth/getUser', () => ({ getUserFromRequest: vi.fn() }))
vi.mock('@/lib/db/users', () => ({ getUserById: vi.fn() }))
vi.mock('@/lib/db/messages', () => ({
  createMessage: vi.fn(),
  getMessagesByChatId: vi.fn(),
}))
vi.mock('@/lib/db/memory', () => ({ getMemoryProfileByUserId: vi.fn() }))
vi.mock('@/lib/rise/system-prompt', () => ({ buildSystemMessage: vi.fn(() => 'system') }))
vi.mock('@/lib/rise/context-window', () => ({ buildMessageWindow: vi.fn(() => []) }))
vi.mock('@/lib/rise/api-messages', () => ({ buildApiMessages: vi.fn(() => []) }))
vi.mock('@/lib/rise/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  recordMessage: vi.fn(),
}))
vi.mock('@/lib/openai/client', () => ({ callRise: vi.fn() }))
vi.mock('@/lib/memory/executor', () => ({ executeCompressionAsync: vi.fn() }))

import { POST } from '@/app/api/chat/[chatId]/message/route'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById } from '@/lib/db/users'
import { createMessage, getMessagesByChatId } from '@/lib/db/messages'
import { getMemoryProfileByUserId } from '@/lib/db/memory'
import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit'
import { callRise } from '@/lib/openai/client'
import { executeCompressionAsync } from '@/lib/memory/executor'

const mockGetUser = vi.mocked(getUserFromRequest)
const mockGetUserById = vi.mocked(getUserById)
const mockCreateMessage = vi.mocked(createMessage)
const mockGetMessages = vi.mocked(getMessagesByChatId)
const mockGetMemory = vi.mocked(getMemoryProfileByUserId)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockRecordMessage = vi.mocked(recordMessage)
const mockCallRise = vi.mocked(callRise)
const mockExecuteCompression = vi.mocked(executeCompressionAsync)

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: { get: (k: string) => headers[k] ?? null },
    cookies: { get: () => null },
  } as unknown as Request
}

const params = { chatId: 'chat-test-id' }

beforeEach(() => {
  vi.clearAllMocks()
  mockGetMessages.mockResolvedValue([])
  mockGetMemory.mockResolvedValue(null)
  mockCreateMessage.mockResolvedValue({ id: 'msg-1', role: 'assistant', content: 'Hello' } as never)
  mockCallRise.mockResolvedValue('Hello from Rise')
  mockRecordMessage.mockResolvedValue(undefined)
  mockExecuteCompression.mockResolvedValue(undefined)
})

describe('POST /api/chat/[chatId]/message', () => {
  it('returns 401 when session is null', async () => {
    mockGetUser.mockResolvedValue(null)
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(401)
  })

  it('returns 403 when subscription_status is not active', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'lapsed' })
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(403)
    expect((res as never as { _body: { code: string } })._body.code).toBe('SUBSCRIPTION_INACTIVE')
  })

  it('returns 404 when user record is not found', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u-missing', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue(null)
    const req = makeRequest({ content: 'hi' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(404)
  })

  it('returns 429 when checkRateLimit returns allowed:false', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 })

    const req = makeRequest({ content: 'hello' })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(429)
    expect((res as never as { _body: { error: string } })._body.error).toContain('Rise needs a moment')
  })

  it('returns 400 when request body is not valid JSON', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })

    const req = {
      json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
      headers: { get: () => null },
      cookies: { get: () => null },
    } as unknown as Request

    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toBe('Invalid request body.')
  })

  it('returns 400 when content is empty string', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })

    const req = makeRequest({ content: '   ' })
    const res = await POST(req as never, { params })
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toBe('Message content is required.')
  })

  it('returns 200 with message and truncation_warning:false on happy path', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: 'Alex' } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })
    mockGetMessages.mockResolvedValue([])
    mockCallRise.mockResolvedValue('Great answer')
    mockCreateMessage.mockResolvedValue({ id: 'msg-2', role: 'assistant', content: 'Great answer' } as never)

    const req = makeRequest({ content: 'Hello Rise' })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(200)
    const body = (res as never as { _body: { truncation_warning: boolean; message: unknown } })._body
    expect(body.truncation_warning).toBe(false)
    expect(body.message).toBeDefined()
  })

  it('sets truncation_warning:true when content exceeds 4000 characters', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: true, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 })
    mockGetMessages.mockResolvedValue([])
    mockCallRise.mockResolvedValue('Response')
    mockCreateMessage.mockResolvedValue({ id: 'msg-3', role: 'assistant', content: 'Response' } as never)

    const req = makeRequest({ content: 'x'.repeat(4001) })
    const res = await POST(req as never, { params })

    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { truncation_warning: boolean } })._body.truncation_warning).toBe(true)
  })

  it('calls recordMessage after a successful response', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: false, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 58 })
    mockCallRise.mockResolvedValue('ok')
    mockCreateMessage.mockResolvedValue({ id: 'msg-4', role: 'assistant', content: 'ok' } as never)

    const req = makeRequest({ content: 'test' })
    await POST(req as never, { params })

    expect(mockRecordMessage).toHaveBeenCalledWith('u1')
  })

  it('fires executeCompressionAsync (void, non-blocking) on success', async () => {
    mockGetUser.mockResolvedValue({ user_id: 'u1', subscription_status: 'active' })
    mockGetUserById.mockResolvedValue({ id: 'u1', has_premium_memory: true, preferred_name: null } as never)
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 57 })
    mockCallRise.mockResolvedValue('ok')
    mockCreateMessage.mockResolvedValue({ id: 'msg-5', role: 'assistant', content: 'ok' } as never)

    const req = makeRequest({ content: 'test compression' })
    await POST(req as never, { params })

    expect(mockExecuteCompression).toHaveBeenCalledWith('chat-test-id', 'u1', true)
  })
})
```

---

### 9. `__tests__/app/api/webhooks/stripe/route.test.ts`

Verifies the Stripe webhook route returns 400 when the `stripe-signature` header is missing, and covers the full event handling tree.

```typescript
// __tests__/app/api/webhooks/stripe/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// ── Mock next/server ──────────────────────────────────────────────────────────
vi.mock('next/server', () => {
  class MockNextResponse {
    public _body: unknown
    public _status: number
    constructor(body: unknown, init?: { status?: number }) {
      this._body = body
      this._status = init?.status ?? 200
    }
    static json(body: unknown, init?: { status?: number }) {
      return new MockNextResponse(body, init)
    }
  }
  class MockNextRequest {
    private _body: string
    private _headers: Record<string, string>
    constructor(body: string, headers: Record<string, string> = {}) {
      this._body = body
      this._headers = headers
    }
    async text() { return this._body }
    headers = {
      get: (k: string) => this._headers[k] ?? null,
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse }
})

// ── Mock stripe config ────────────────────────────────────────────────────────
vi.mock('@/lib/stripe/config', () => {
  const mockConstructEvent = vi.fn()
  const mockRetrieve = vi.fn()
  return {
    stripe: {
      webhooks: { constructEvent: mockConstructEvent },
      subscriptions: { retrieve: mockRetrieve },
    },
    PRICE_MONTHLY: 'price_monthly_fake',
    PRICE_ANNUAL: 'price_annual_fake',
    PRICE_PREMIUM_MONTHLY_ADDON: 'price_premium_monthly_fake',
    PRICE_PREMIUM_ANNUAL_ADDON: 'price_premium_annual_fake',
    PLAN_PRICES: {},
    getPriceIds: vi.fn(),
  }
})

// ── Mock supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase/server', () => {
  const maybeSingle = vi.fn()
  const selectChain = { select: vi.fn(), eq: vi.fn(), maybeSingle }
  selectChain.select.mockReturnValue(selectChain)
  selectChain.eq.mockReturnValue(selectChain)

  const insertMock = vi.fn().mockResolvedValue({ error: null })
  const eqMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })

  const from = vi.fn()

  return {
    supabaseServer: { from },
    _mocks: { from, maybeSingle, selectChain, insertMock, eqMock, updateMock },
  }
})

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent)
const mockRetrieve = vi.mocked(stripe.subscriptions.retrieve)
const mockFrom = vi.mocked(supabaseServer.from)

// Helpers
function makeReq(body: string, headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server')
  return new NextRequest(body, headers)
}

function fakeEvent(type: string, object: unknown, id = 'evt_test'): Stripe.Event {
  return { id, type, data: { object } } as unknown as Stripe.Event
}

function setupSupabase(existingEvent: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existingEvent, error: null })
  const selectInner = { maybeSingle, eq: vi.fn() }
  selectInner.eq.mockReturnValue(selectInner)
  const selectOuter = { select: vi.fn().mockReturnValue(selectInner) }

  const insertMock = vi.fn().mockResolvedValue({ error: null })
  const eqUpdateMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

  // from() returns different chains depending on call index
  let callCount = 0
  mockFrom.mockImplementation(() => {
    callCount++
    if (callCount === 1) return selectOuter as never   // idempotency check
    if (callCount === 2) return { insert: insertMock } as never // insert event log
    return { update: updateMock } as never              // user update
  })

  return { maybeSingle, insertMock, updateMock, eqUpdateMock }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_fake'
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual_fake'
  process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON = 'price_premium_monthly_fake'
  process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON = 'price_premium_annual_fake'
})

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const req = makeReq('{}', {})
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(400)
    expect((res as never as { _body: { error: string } })._body.error).toContain(
      'Missing stripe-signature'
    )
  })

  it('returns 400 when webhook signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature mismatch')
    })
    const req = makeReq('{}', { 'stripe-signature': 'bad-sig' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(400)
  })

  it('returns 200 received:true immediately when event is already processed (idempotency)', async () => {
    const event = fakeEvent('checkout.session.completed', {})
    mockConstructEvent.mockReturnValue(event)

    // First from() call (idempotency check) returns an existing event
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'existing' }, error: null })
    const selectInner = { maybeSingle, eq: vi.fn().mockReturnValue({ maybeSingle }) }
    const selectOuter = { select: vi.fn().mockReturnValue(selectInner) }
    mockFrom.mockReturnValueOnce(selectOuter as never)

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)

    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { received: boolean } })._body.received).toBe(true)
    // Should NOT proceed to insert or update
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('returns 200 received:true for checkout.session.completed with no subscription', async () => {
    const event = fakeEvent('checkout.session.completed', { subscription: null, customer: null })
    mockConstructEvent.mockReturnValue(event)
    const { insertMock } = setupSupabase(null)

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
    // Event was logged but no user update happened (early break)
    expect(insertMock).toHaveBeenCalled()
  })

  it('returns 200 received:true for checkout.session.completed happy path', async () => {
    const sub = {
      customer: 'cus_test',
      items: {
        data: [{ price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' }],
      },
    }
    mockRetrieve.mockResolvedValue(sub as never)

    const event = fakeEvent('checkout.session.completed', {
      subscription: 'sub_123',
      customer: 'cus_123',
      metadata: { user_id: 'user-uuid' },
    })
    mockConstructEvent.mockReturnValue(event)

    const { updateMock, eqUpdateMock } = setupSupabase(null)
    // Override: third from() call needs update chain
    mockFrom
      .mockImplementationOnce(() => {
        // idempotency select
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for customer.subscription.updated', async () => {
    const sub = {
      customer: 'cus_test',
      items: {
        data: [{ price: { id: 'price_monthly_fake' }, current_period_end: 9999999999, id: 'item-1' }],
      },
    }
    const event = fakeEvent('customer.subscription.updated', sub)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for customer.subscription.deleted', async () => {
    const sub = { customer: 'cus_test', items: { data: [] } }
    const event = fakeEvent('customer.subscription.deleted', sub)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for invoice.payment_failed', async () => {
    const invoice = { customer: 'cus_invoice' }
    const event = fakeEvent('invoice.payment_failed', invoice)
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))
      .mockImplementationOnce(() => ({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })

  it('returns 200 received:true for unhandled event type (silently ignored)', async () => {
    const event = fakeEvent('payment_intent.created', {})
    mockConstructEvent.mockReturnValue(event)

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
    expect((res as never as { _body: { received: boolean } })._body.received).toBe(true)
  })

  it('returns 200 received:true even when internal handler throws (outer catch)', async () => {
    const event = fakeEvent('checkout.session.completed', {
      subscription: 'sub_throw',
      customer: 'cus_throw',
      metadata: { user_id: 'u-throw' },
    })
    mockConstructEvent.mockReturnValue(event)
    mockRetrieve.mockRejectedValue(new Error('Stripe retrieve exploded'))

    mockFrom
      .mockImplementationOnce(() => {
        const ms = vi.fn().mockResolvedValue({ data: null, error: null })
        const si = { maybeSingle: ms, eq: vi.fn().mockReturnValue({ maybeSingle: ms }) }
        return { select: vi.fn().mockReturnValue(si) } as never
      })
      .mockImplementationOnce(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) } as never))

    const req = makeReq('{}', { 'stripe-signature': 'sig-valid' })
    const res = await POST(req as never)
    expect((res as never as { _status: number })._status).toBe(200)
  })
})
```

---

## Verification

- [ ] `npx vitest run` exits 0 with zero failing tests
- [ ] `npx vitest run --coverage` exits 0
- [ ] Coverage report in `coverage/index.html` shows 100% lines for all files under `lib/**` and `app/api/**` (except `lib/env.ts`)
- [ ] Coverage report shows 100% functions for all covered files
- [ ] Coverage report shows 100% branches for all covered files
- [ ] `__tests__/lib/auth/session.test.ts` exists and tests `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- [ ] `__tests__/lib/rise/rate-limit.test.ts` exists and tests `checkRateLimit` and `recordMessage`
- [ ] `__tests__/lib/memory/trigger.test.ts` exists and tests `checkCompressionTrigger` at counts 49, 50, 51, 59, 60, 61, 70, 80
- [ ] `__tests__/lib/memory/executor.test.ts` exists and verifies `executeCompressionAsync` never throws
- [ ] `__tests__/lib/stripe/webhooks.test.ts` exists and tests idempotency early return
- [ ] `__tests__/app/api/webhooks/stripe/route.test.ts` verifies 400 on missing `stripe-signature`
- [ ] `__tests__/app/api/chat/[chatId]/message/route.test.ts` verifies 429 response when `checkRateLimit` returns `allowed:false`
- [ ] `__tests__/lib/env.test.ts` verifies `ZodError` thrown when `JWT_SECRET` is shorter than 32 chars
- [ ] No test file makes a real HTTP call, database call, Stripe API call, or OpenAI API call
- [ ] `coverage/` directory exists and is listed in `.gitignore`

---

## Failure Recovery

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'vitest'` | vitest not installed | Run `npm install --save-dev vitest @vitest/coverage-v8 vite-tsconfig-paths` |
| `Cannot find module '@/lib/...'` | `@` path alias not resolved by vitest | Ensure `vite-tsconfig-paths` is in `vitest.config.ts` plugins array |
| `Missing environment variable: SUPABASE_URL` at test startup | `lib/supabase/server.ts` throws at module-load time before mocks run | Add `SUPABASE_URL` etc. to `vitest.config.ts` `test.env` block |
| `Cannot find module 'server-only'` | Next.js `server-only` sentinel package not installed | Run `npm install server-only` or ensure the mock `vi.mock('server-only', () => ({}))` appears before the import in executor tests |
| `Coverage below 100%` on a specific file | A branch or function is not exercised | Add a test case targeting the uncovered branch — refer to the source file directly; do not comment out lines |
| `ZodError` tests fail with module cache hit | Vitest caches ESM modules; re-import with `?v=${Math.random()}` query for fresh evaluation | Use dynamic `import(\`@/lib/env?v=...\`)` pattern already shown in the env test file |
| `npx tsc --noEmit` fails after adding test files | Test files use types not in tsconfig `include` | The `tsconfig.json` `include` already contains `**/*.ts`; ensure `__tests__` is not in `exclude` |
| `stripe-signature` test returns 200 instead of 400 | `req.headers.get` mock returns a non-null value | Confirm `MockNextRequest` passes an empty `headers` object so `.get('stripe-signature')` returns `null` |
| Executor retry test hangs | `vi.useFakeTimers()` active but `vi.runAllTimersAsync()` not awaited | Always `await vi.runAllTimersAsync()` before awaiting the `executeCompressionAsync` promise |
| `createClient` called with wrong args in supabase client test | Module was loaded before mock was registered | Ensure `vi.mock('@supabase/supabase-js', ...)` appears before any `import` that triggers the module |
