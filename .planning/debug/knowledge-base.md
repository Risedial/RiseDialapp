# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## middleware-edge-runtime-jsonwebtoken — middleware imports jsonwebtoken breaking Vercel Edge Runtime build
- **Date:** 2026-05-04
- **Error patterns:** jsonwebtoken, Edge Runtime, Module not found, webpack, middleware, Can't resolve
- **Root cause:** middleware.ts in committed HEAD imported `jsonwebtoken` (Node.js-only crypto APIs) while Next.js middleware runs in Edge Runtime. The working copy already had the fix but it was never committed — Vercel was building from the stale committed version.
- **Fix:** Committed working copy changes: middleware.ts now uses `verifySession()` from `lib/auth/session` (Web Crypto API / crypto.subtle, Edge Runtime compatible). Also fixed app/api/chat/[chatId]/message/route.ts: corrected `checkRateLimit` destructuring to `{ allowed }` and replaced removed `recordRateLimitMessage` export with `recordMessage`.
- **Files changed:** middleware.ts, app/api/chat/[chatId]/message/route.ts
---

## middleware-edge-runtime-session-module — lib/auth/session.ts NextResponse value import and zod env import break Edge bundling
- **Date:** 2026-05-04
- **Error patterns:** Edge Runtime, unsupported modules, @/lib/auth/session, middleware, referencing unsupported modules, next/server, zod, env
- **Root cause:** lib/auth/session.ts imported `NextResponse` as a value (not type) from "next/server" — a CJS module with Node.js dist internals — and imported `{ env }` from "@/lib/env" which runs zod validation at module init. Vercel's Edge Function bundler traced the middleware import chain through @/lib/auth/session and flagged it as unsupported because next/server is a value import in a shared module context.
- **Fix:** Changed `import { NextResponse }` to `import type { NextResponse }` in lib/auth/session.ts (type-only imports are erased at compile time, produce zero runtime require() calls). Removed `import { env } from '@/lib/env'` and replaced `env.JWT_SECRET` with `process.env.JWT_SECRET ?? ""` to eliminate the zod module-init side-effect from the Edge import chain.
- **Files changed:** lib/auth/session.ts
---

