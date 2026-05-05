# Module 6 — Unit & Integration Test Suite: SPEC

## Purpose

Write Vitest tests achieving 100% line, function, and branch coverage of all files in `lib/` and `app/api/`. All external dependencies (Supabase, Stripe, OpenAI) are mocked via `vi.mock()` at the module boundary. No real network calls are made.

---

## Trigger

**Type:** Module hand-off  
**Entry condition:** Module 5 complete — `npx vitest run` exits 0 on empty suite; `npx playwright test` exits 0 on empty e2e/

---

## Inputs

| Field | Type | Source | Required |
|-------|------|--------|----------|
| All files in `lib/` | TypeScript | Local filesystem | Yes |
| All files in `app/api/` | TypeScript | Local filesystem | Yes |
| `vitest.config.ts` | TypeScript | Project root | Yes |

---

## Outputs

| Field | Type | Destination |
|-------|------|-------------|
| Test files | TypeScript | `__tests__/` directory mirroring the source file structure |
| Coverage report | HTML + JSON | `coverage/` directory (gitignored) |

---

## Test Isolation Strategy

All tests use `vi.mock()` at the module level to replace external dependencies:

```typescript
vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    rpc: vi.fn(),
  },
}))
```

No test makes a real database call, real Stripe API call, or real OpenAI API call.

---

## Required Test Files

### `__tests__/lib/auth/session.test.ts`

**Covers:** `lib/auth/session.ts` — `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`

**Test cases:**

`createSession(userId, subscriptionStatus):`
- Returns a string in the format `header.payload.signature` (3 parts separated by `.`)
- The decoded payload contains `user_id` equal to the provided userId
- The decoded payload contains `subscription_status` equal to the provided subscriptionStatus
- The decoded payload contains `iat` (issued-at) timestamp close to `Math.floor(Date.now() / 1000)`
- The decoded payload contains `exp` (expiry) timestamp approximately 30 days (`30 * 24 * 60 * 60` seconds) after `iat`

`verifySession(token):`
- Returns `{ user_id: string, subscription_status: string }` for a valid, non-expired token created by `createSession`
- Returns `null` for a token with a tampered signature (change one character in the signature part)
- Returns `null` for an expired token (create a token, manually set exp to a past timestamp, re-sign with the correct key)
- Returns `null` for a string that is not a 3-part JWT (e.g., `"not.a.valid"` fails signature check; `"onlyone"` has only 1 part)
- Returns `null` for an empty string

`setSessionCookie(response, token):`
- Calls `response.cookies.set` with `httpOnly: true`
- Calls `response.cookies.set` with `sameSite: 'strict'`
- Calls `response.cookies.set` with `secure: true`
- Calls `response.cookies.set` with `maxAge` equal to 30 days in seconds (`2592000`)
- Calls `response.cookies.set` with `path: '/'`

`clearSessionCookie(response):`
- Calls `response.cookies.set` with `maxAge: 0`

**Mocking:** Mock `next/server` if needed. If `setSessionCookie` and `clearSessionCookie` accept a Next.js `NextResponse`, create a mock response object.

---

### `__tests__/lib/rise/rate-limit.test.ts`

**Covers:** `lib/rise/rate-limit.ts` — `checkRateLimit`, `recordMessage`

**Mocks:**
```typescript
vi.mock('@/lib/supabase/server')
```

**Test cases:**

`checkRateLimit(userId):`
- Returns `{ allowed: true, remaining: 60 }` when the Supabase query returns null data (no active window exists)
- Returns `{ allowed: true, remaining: 17 }` (60 - 43 = 17) when the active window has `message_count: 43`
- Returns `{ allowed: false, remaining: 0 }` when the active window has `message_count: 60`
- Returns `{ allowed: false, remaining: 0 }` when the active window has `message_count: 75` (over limit)
- Handles Supabase query error gracefully — returns `{ allowed: true, remaining: 60 }` as a safe default when the query errors (do not crash)

`recordMessage(userId):`
- Calls `supabaseServer.rpc('increment_message_count', { p_user_id: userId })`
- Does not throw when the RPC returns an error — logs the error instead
- Does not return a value (returns void)

---

### `__tests__/lib/memory/trigger.test.ts`

**Covers:** `lib/memory/trigger.ts` — `checkCompressionTrigger`

**Mocks:**
```typescript
vi.mock('@/lib/supabase/server')
```

**Test cases:**

`checkCompressionTrigger(userId, chatId):`
- Returns `{ shouldCompress: true, isInitial: true, isPatch: false }` when user message count for the chat is exactly 50
- Returns `{ shouldCompress: true, isInitial: false, isPatch: true }` when count is 60
- Returns `{ shouldCompress: true, isInitial: false, isPatch: true }` when count is 70
- Returns `{ shouldCompress: true, isInitial: false, isPatch: true }` when count is 80
- Returns `{ shouldCompress: false, isInitial: false, isPatch: false }` when count is 49
- Returns `{ shouldCompress: false, isInitial: false, isPatch: false }` when count is 51
- Returns `{ shouldCompress: false, isInitial: false, isPatch: false }` when count is 59
- Returns `{ shouldCompress: false, isInitial: false, isPatch: false }` when count is 61
- Returns `{ shouldCompress: false, isInitial: false, isPatch: false }` when Supabase query returns an error

---

### `__tests__/lib/memory/executor.test.ts`

**Covers:** `lib/memory/executor.ts` — `executeCompressionAsync`

**Mocks:**
```typescript
vi.mock('@/lib/memory/compress')
vi.mock('@/lib/memory/patch')
vi.mock('@/lib/memory/trigger')
```

**Test cases:**

`executeCompressionAsync(userId, chatId):`
- Does not throw under any circumstances (it is fire-and-forget; errors are swallowed)
- Calls `generateInitialProfile(userId, chatId)` when `checkCompressionTrigger` returns `{ shouldCompress: true, isInitial: true }`
- Calls `patchMemoryProfile(userId, chatId)` when `checkCompressionTrigger` returns `{ shouldCompress: true, isPatch: true }`
- Does NOT call either function when `checkCompressionTrigger` returns `{ shouldCompress: false }`
- Retries up to 3 times when `generateInitialProfile` throws (exponential backoff or fixed retry — whichever the implementation uses)
- Does not retry more than 3 times total
- Returns void / resolves without throwing even when all 3 retries fail

---

### `__tests__/lib/stripe/webhooks.test.ts`

**Covers:** `lib/stripe/webhooks.ts` — `verifyWebhookSignature`, `routeWebhookEvent`

**Mocks:**
```typescript
vi.mock('@/lib/supabase/server')
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  })),
}))
```

**Test cases:**

`verifyWebhookSignature(body, signature):`
- Calls `stripe.webhooks.constructEvent` with the provided body and signature
- Returns the event object that `constructEvent` returns
- Throws (propagates the error from `constructEvent`) when the signature is invalid

`routeWebhookEvent(event):`
- When event.type is `'checkout.session.completed'`: calls the checkout session handler; inserts into `webhook_events` table
- When event.type is `'customer.subscription.updated'`: calls the subscription updated handler
- When event.type is `'customer.subscription.deleted'`: calls the subscription deleted handler
- When event.type is `'invoice.payment_failed'`: calls the invoice failed handler
- When event.type is an unknown string (e.g., `'payment_intent.created'`): does nothing (silently ignored); does not throw
- Idempotency: when `webhook_events` already contains a row with the event's stripe_event_id, returns early without calling any handler
- Pre-insert: inserts into `webhook_events` BEFORE calling the handler function, not after

---

### `__tests__/lib/supabase/client.test.ts`

**Covers:** `lib/supabase/client.ts` — browser Supabase client creation

**Mocks:**
```typescript
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn().mockReturnValue({ mock: 'supabase-browser-client' }),
}))
```

**Test cases:**
- Imports the module without throwing (even without real env vars, because browser client reads `process.env.NEXT_PUBLIC_*` at runtime — the test env has these set via vitest.config.ts)
- The exported client (or factory function) calls `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Throws a descriptive error when `NEXT_PUBLIC_SUPABASE_URL` is absent (test by temporarily removing it from the mock env)

---

### `__tests__/app/api/chat/[chatId]/message/route.test.ts`

**Covers:** `app/api/chat/[chatId]/message/route.ts`

**Mocks:**
```typescript
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/rise/rate-limit')
vi.mock('@/lib/openai/client')
vi.mock('@/lib/memory/executor')
vi.mock('@/lib/memory/trigger')
```

**Test cases:**
- Returns `Response` with status 401 when the `x-user-id` header is absent
- Returns `Response` with status 429 when `checkRateLimit` returns `{ allowed: false, remaining: 0 }`
- Returns `Response` with status 400 when the request body is missing the `content` field
- Returns `Response` with status 200 containing the assistant message when all checks pass and `callRise` returns a valid response
- Calls `recordMessage(userId)` after successful message processing
- Calls `void executeCompressionAsync(userId, chatId)` after successful message processing (not awaited)
- Returns `Response` with status 500 when `callRise` throws an error

---

### `__tests__/app/api/webhooks/stripe/route.test.ts`

**Covers:** `app/api/webhooks/stripe/route.ts`

**Mocks:**
```typescript
vi.mock('@/lib/stripe/webhooks')
```

**Test cases:**
- Returns status 400 when `stripe-signature` header is absent
- Returns status 400 when `verifyWebhookSignature` throws (invalid signature)
- Returns `{ received: true }` with status 200 when `verifyWebhookSignature` succeeds and `routeWebhookEvent` resolves
- Returns status 200 on the second call with the same event (idempotency — handled inside `routeWebhookEvent`, so the route always returns 200)

---

### `__tests__/lib/env.test.ts`

**Covers:** `lib/env.ts` — environment schema validation

**Note:** This test file tests the zod schema in isolation, not the exported `env` object (since the env object is already parsed with the vitest.config.ts env vars). Instead, test the schema directly by importing zod and the schema separately, or by re-running the parse with controlled inputs.

**Test cases:**
- The schema rejects an empty object (`{}`) with a `ZodError`
- The schema accepts a fully valid env object (matching all 13 vars with correct formats)
- The schema rejects `JWT_SECRET` shorter than 32 characters
- The schema rejects `STRIPE_SECRET_KEY` not starting with `sk_`
- The schema rejects `STRIPE_WEBHOOK_SECRET` not starting with `whsec_`
- The schema rejects `OPENAI_API_KEY` not starting with `sk-`
- The schema rejects `SUPABASE_URL` that is not a valid URL (e.g., `"not-a-url"`)
- The ZodError identifies the exact field name in its `path` array

---

### All Other `app/api/` Route Files

For every route file in `app/api/` not listed above, write a test file covering:
- Happy path: valid inputs → correct response status and body shape
- Missing required headers (if route reads x-user-id etc.) → 401
- Invalid request body → 400
- Downstream service error → 500

---

## Coverage Configuration Reminder

From `vitest.config.ts`:
- **Included:** `lib/**/*.ts`, `app/api/**/*.ts`
- **Excluded:** `lib/env.ts`
- **NOT excluded:** `lib/supabase/client.ts` (must be covered)
- **Threshold:** 100% lines, functions, branches, statements

If any file is below 100%, add tests to cover the missing branches. Use `npx vitest run --coverage` and open `coverage/index.html` to see per-file coverage.

---

## AI/LLM Used

None.

---

## Data Stored

`coverage/` directory (generated by vitest --coverage). Add to `.gitignore`:
```
coverage/
```
