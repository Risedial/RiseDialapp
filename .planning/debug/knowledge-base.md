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

