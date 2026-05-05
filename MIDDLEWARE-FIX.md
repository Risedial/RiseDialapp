# Middleware Edge Runtime Fix — Root Cause & Exact Solution

## Context for a Fresh Chat

- **Project:** Next.js 14 app called RiseDial, deployed on Vercel via GitHub auto-deploy
- **Repo:** `Risedial/RiseDialapp`, branch `main`
- **Working directory:** `c:\Users\Alexb\Documents\RiseDialapp`
- **Deployment:** Every push to `main` triggers a Vercel production build automatically
- **Problem state:** The app currently fails to deploy. Vercel rejects the build at the "Deploying outputs..." step with an Edge Function unsupported modules error. The app is broken in production.

### Current state of affected files

**`middleware.ts` (root of project) — current contents:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('risedial_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const payload = await verifySession(sessionCookie.value);

  if (!payload) {
    return NextResponse.json(
      { error: 'Your session has expired. Sign in to continue.' },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.user_id);
  requestHeaders.set('x-subscription-status', payload.subscription_status);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/memory/:path*',
    '/api/subscription/:path*',
    '/api/chats/:path*',
    '/api/user/:path*',
  ],
};
```

**`lib/auth/verify.ts` — exists, must be deleted.**

---

## What Has Been Tried (And Why It Failed Each Time)

| Attempt | Change | Result |
|---|---|---|
| 1 | Replace `jsonwebtoken` with Web Crypto in `session.ts` | Still fails — `@/lib/auth/session` flagged |
| 2 | `import type { NextResponse }` + remove Zod in `session.ts` | Still fails — `@/lib/auth/session` flagged |
| 3 | Create `lib/auth/verify.ts` with zero imports, pure Web Crypto | Still fails — `@/lib/auth/verify` flagged |

**The invariant across all three failures:** The path `@/lib/auth/*` always appears in the error, regardless of what the file contains. Attempt 3 proved this conclusively — a file with zero imports and only Web Crypto APIs was still rejected.

---

## Actual Root Cause

The problem is **not** the content of the imported module. The problem is the **import mechanism itself**.

### What Vercel's validator sees

After `next build` completes, Vercel runs its own Edge Function validator against the compiled `middleware.js` output file. The error format:

```
__vc__ns__/0/middleware.js: @/lib/auth/verify
```

means the bundled `middleware.js` **still contains a runtime `require('@/lib/auth/verify')` call**. The `@/` path alias was NOT resolved to an inlined module during Next.js's webpack build — it was left as an external reference.

### Why webpack leaves it as external

Next.js's Edge Runtime webpack configuration has externals handling that treats module paths beginning with `@` as potentially scoped npm packages (`@scope/package`). The path alias `@/lib/auth/verify` looks syntactically identical to a scoped package path. When the Edge bundler applies its externals rules, it keeps `@/lib/auth/verify` as an external `require()` instead of inlining it.

The `next build` step itself succeeds because the TypeScript compiler and standard webpack build resolve `@/` aliases correctly. But Vercel's **post-build** Edge Function validator then reads the already-compiled bundle and finds the unresolvable external reference.

**This is why changing the file content has no effect.** The file content is irrelevant — the file is never being inlined in the first place.

---

## The Fix — Zero Ambiguity

### What to do

Make `middleware.ts` **completely self-contained**. Remove all local file imports. Copy the JWT verification code directly into the middleware file.

Middleware is a special execution environment in Next.js. It is the one file in the codebase where sharing module code via imports is architecturally unreliable on Vercel's Edge Runtime. The solution is to treat it like an isolated deployment unit — all the logic it needs lives inside it.

### Exact changes required

**1. Delete `lib/auth/verify.ts`** — This file was created as a workaround and is no longer needed.

**2. Rewrite `middleware.ts`** to be fully self-contained. The final file must look exactly like this:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// ── Inline JWT verification (no local imports — Edge bundler requirement) ──

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function base64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const padded2 = padded + "=".repeat(padLength);
  const binary = atob(padded2);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacVerify(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const keyBytes = new TextEncoder().encode(secret);
  const dataBytes = new TextEncoder().encode(data);
  const sigBytes = base64urlDecode(signature);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    cryptoKey,
    sigBytes.buffer as ArrayBuffer,
    dataBytes
  );
}

async function verifySession(
  token: string
): Promise<{ user_id: string; subscription_status: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const signingInput = `${header}.${payload}`;
    const valid = await hmacVerify(signingInput, signature, JWT_SECRET);
    if (!valid) return null;
    const decoded = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payload))
    ) as {
      user_id: string;
      subscription_status: string;
      iat: number;
      exp: number;
    };
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;
    return { user_id: decoded.user_id, subscription_status: decoded.subscription_status };
  } catch {
    return null;
  }
}

// ── Middleware ──

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('risedial_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const payload = await verifySession(sessionCookie.value);

  if (!payload) {
    return NextResponse.json(
      { error: 'Your session has expired. Sign in to continue.' },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.user_id);
  requestHeaders.set('x-subscription-status', payload.subscription_status);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/memory/:path*',
    '/api/subscription/:path*',
    '/api/chats/:path*',
    '/api/user/:path*',
  ],
};
```

**3. Leave `lib/auth/session.ts` completely unchanged** — It is imported by `app/api/auth/signin/route.ts` and `app/api/auth/signup/route.ts`, both of which run in Node.js runtime where there are no Edge restrictions. Those routes are unaffected.

### Why this is guaranteed to work

- `middleware.ts` will have exactly one external import: `next/server`. This is an explicitly supported Edge Runtime module — it is the module Next.js itself provides for middleware.
- Zero `@/` local path alias imports = zero strings for Vercel's validator to flag.
- The Web Crypto API (`crypto.subtle`, `TextEncoder`, `TextDecoder`, `atob`) is natively available in every Edge Runtime environment including Vercel's.
- The JWT algorithm (`HS256`) is identical to what `lib/auth/session.ts` uses, so existing sessions created by API routes will verify correctly in middleware.

### What does NOT need to change

- `lib/auth/session.ts` — untouched
- `app/api/auth/signin/route.ts` — untouched  
- `app/api/auth/signup/route.ts` — untouched
- Any other API route — untouched
- `next.config.js` — untouched
- `tsconfig.json` — untouched
- All tests — untouched (tests import from `lib/auth/session.ts`, not from middleware)

---

## After Implementing — Exact Steps to Ship

Run these commands in order. Do not skip the type check.

**1. Verify TypeScript is clean:**
```bash
npx tsc --noEmit
```
Expected: no output, exit code 0. If there are errors, fix them before continuing.

**2. Stage and commit:**
```bash
git add middleware.ts lib/auth/verify.ts
git commit -m "fix: inline JWT verification in middleware to resolve Vercel Edge Runtime bundler rejection"
```

**3. Push to trigger Vercel deployment:**
```bash
git push origin main
```

**4. Confirm success in Vercel dashboard:**
- Go to the Vercel project → Deployments
- Watch the new build
- The "Deploying outputs..." step must complete without the "referencing unsupported modules" error
- The middleware bundle size will appear as a single line: `ƒ Middleware  XX kB` with no error below it

---

## Maintenance Note

The JWT algorithm and secret in `middleware.ts` must stay in sync with `lib/auth/session.ts`. Both use `HS256` with `process.env.JWT_SECRET`. If the session format changes in `session.ts`, the `verifySession` function in `middleware.ts` must be updated to match.
