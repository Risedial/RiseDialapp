# App Architecture
**Role:** API route map, auth flow, Supabase connection patterns, middleware protection rules, and file structure — prevents sub-agents from inventing route paths or using wrong client patterns
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** Prompts 08–19, 23–24, 30–35
**Date:** 2026-05-02

---

## CRITICAL VALUES (Read before any other section)

Framework: Next.js 14 with App Router
Language: TypeScript
Database: Supabase (PostgreSQL with RLS)
Auth: JWT (HS256), 30-day expiry, httpOnly cookie
Cookie name: `risedial_session`
JWT payload: `{ user_id: string, subscription_status: string }`
Protected routes (middleware runs on): `/api/chat/*`, `/api/memory/*`, `/api/subscription/*`

---

## SECTION 1: API ROUTES (exact paths — do not invent new paths)

### Auth Routes (NOT protected by middleware — public)
```
POST   /api/auth/signup           → app/api/auth/signup/route.ts
POST   /api/auth/signin           → app/api/auth/signin/route.ts
POST   /api/auth/signout          → app/api/auth/signout/route.ts
POST   /api/auth/reset-request    → app/api/auth/reset-request/route.ts
POST   /api/auth/reset-confirm    → app/api/auth/reset-confirm/route.ts
```

### Chat Management Routes (auth-gated in handler, not in middleware)
```
GET    /api/chats                      → app/api/chats/route.ts
POST   /api/chats                      → app/api/chats/route.ts
DELETE /api/chats/[chatId]             → app/api/chats/[chatId]/route.ts
GET    /api/chats/[chatId]/messages    → app/api/chats/[chatId]/messages/route.ts
POST   /api/chats/[chatId]/title       → app/api/chats/[chatId]/title/route.ts
```

### Chat Message Route (protected by middleware)
```
POST   /api/chat/[chatId]/message      → app/api/chat/[chatId]/message/route.ts
```

### Subscription Routes (protected by middleware)
```
GET    /api/subscription/status        → app/api/subscription/status/route.ts
POST   /api/subscription/checkout     → app/api/subscription/checkout/route.ts
POST   /api/subscription/portal       → app/api/subscription/portal/route.ts
PATCH  /api/subscription/premium-toggle → app/api/subscription/premium-toggle/route.ts
```

### Webhook Route (NOT protected by middleware — Stripe verifies signature)
```
POST   /api/webhooks/stripe            → app/api/webhooks/stripe/route.ts
```

---

## SECTION 2: MIDDLEWARE CONFIGURATION

File: `risedial-production/middleware.ts`

```typescript
export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/memory/:path*',
    '/api/subscription/:path*',
  ]
}
```

**What middleware does:**
1. Reads `risedial_session` cookie from request
2. Verifies JWT signature with `JWT_SECRET`
3. On missing cookie: returns `{ error: "Authentication required." }` (JSON, not raw 401)
4. On expired/invalid token: returns `{ error: "Your session has expired. Sign in to continue." }` (JSON)
5. On valid token: sets `x-user-id` and `x-subscription-status` request headers for downstream routes

**Structured error format** (used on ALL middleware failures):
```json
{ "error": "message string here" }
```
Never return raw HTTP status text. Always return JSON.

---

## SECTION 3: SUPABASE CLIENT USAGE PATTERNS

### Server-side (API routes) — use service role client
```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Client-side (React components) — use anon client
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Rule:** API routes ALWAYS use `supabaseAdmin` (service role). Client components use `supabaseClient` (anon). Never expose service role key to client.

---

## SECTION 4: AUTH ARCHITECTURE

### JWT Configuration
- Algorithm: HS256
- Secret: `process.env.JWT_SECRET`
- Expiry: 30 days (`'30d'`)
- Payload: `{ user_id: string, subscription_status: string }`
- Cookie name: `risedial_session`
- Cookie flags: `httpOnly: true`, `sameSite: 'strict'`, `secure: true`, `maxAge: 60 * 60 * 24 * 30`

### Session Flow
1. User signs up or signs in → API creates JWT → sets `risedial_session` cookie
2. All subsequent requests to protected routes include cookie automatically
3. Middleware verifies JWT → extracts user_id and subscription_status
4. API routes read `x-user-id` header to get authenticated user ID
5. Sign out: sets `risedial_session` cookie with `maxAge: 0` to clear it

### Auth Gate Pattern (for handlers that do their own auth check)
```typescript
import { getUserFromRequest } from '@/lib/auth/getUser'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }
  // proceed with user.user_id
}
```

---

## SECTION 5: SUBSCRIPTION STATUS VALUES

| Value | Meaning |
|---|---|
| `'active'` | User has active Stripe subscription — full chat access |
| `'lapsed'` | Subscription expired or payment failed — show locked gate screen |
| `'cancelled'` | User explicitly cancelled and deleted account |

**Access rules:**
- `active`: full access to all routes
- `lapsed`: redirect to /subscription-locked (do NOT log out — session preserved)
- `cancelled`: treated same as lapsed for access purposes

**Who writes subscription_status:** ONLY the Stripe webhook handler (`/api/webhooks/stripe`). No other route may write this field.

---

## SECTION 6: ENVIRONMENT VARIABLES (exact names)

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key (server-side only)
OPENAI_API_KEY                    # OpenAI API key (server-side only)
STRIPE_SECRET_KEY                 # Stripe secret key (server-side only)
STRIPE_WEBHOOK_SECRET             # Stripe webhook signing secret
STRIPE_PRICE_MONTHLY              # price_1TSWsnFPwzRLOpQRVaSCoz6G
STRIPE_PRICE_ANNUAL               # price_1TSWsoFPwzRLOpQRzbOBL8Ik
STRIPE_PRICE_PREMIUM_MONTHLY_ADDON # price_1TSWspFPwzRLOpQRSs8MXxW4
STRIPE_PRICE_PREMIUM_ANNUAL_ADDON  # price_1TSWspFPwzRLOpQRclkgNGop
JWT_SECRET                        # Secret for signing JWT tokens
NEXTAUTH_URL                      # App base URL (e.g., https://risedial.com)
RESEND_API_KEY                    # Resend email API key
```

Total: 13 environment variables

---

## SECTION 7: FILE STRUCTURE (source files only)

```
app/
  (auth)/
    signin/page.tsx
    plan-selection/page.tsx
    checkout-success/page.tsx
    onboarding/page.tsx
  chat/[chatId]/page.tsx
  settings/page.tsx
  subscription-locked/page.tsx
  globals.css
  layout.tsx
  loading.tsx
  error.tsx
  api/
    auth/signup/route.ts
    auth/signin/route.ts
    auth/signout/route.ts
    auth/reset-request/route.ts
    auth/reset-confirm/route.ts
    chats/route.ts
    chats/[chatId]/route.ts
    chats/[chatId]/messages/route.ts
    chats/[chatId]/title/route.ts
    chat/[chatId]/message/route.ts
    subscription/status/route.ts
    subscription/checkout/route.ts
    subscription/portal/route.ts
    subscription/premium-toggle/route.ts
    webhooks/stripe/route.ts

lib/
  supabase/server.ts
  supabase/client.ts
  db/users.ts
  db/chats.ts
  db/messages.ts
  db/memory.ts
  auth/session.ts
  auth/getUser.ts
  auth/subscription-gate.ts
  stripe/config.ts
  stripe/subscription.ts
  stripe/webhooks.ts
  rise/system-prompt.ts
  rise/context-window.ts
  rise/api-messages.ts
  rise/opening-message.ts
  rise/rate-limit.ts
  openai/client.ts
  memory/trigger.ts
  memory/compress.ts
  memory/patch.ts
  memory/executor.ts
  chat/title.ts
  user/onboarding.ts

components/
  Sidebar.tsx
  ChatMemoriesModal.tsx
  ErrorStates.tsx
  SplashScreen.tsx
  LoadingSkeletons.tsx
  SubscriptionBanner.tsx

middleware.ts

public/
  manifest.json
  sw.js (generated by next-pwa)

supabase/
  migrations/
    001_initial_schema.sql

.env.local.example
next.config.js
tailwind.config.ts
tsconfig.json
package.json
.eslintrc.json
```

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. All API route paths used in code MUST match Section 1 exactly
3. Use `supabaseAdmin` in all API routes — never expose service role key to client
4. JWT cookie name is always `risedial_session`
5. If you need to protect a route, use the auth gate pattern from Section 4
6. Do not create routes that are not listed in Section 1
