---
status: resolved
trigger: "Vercel build fails — middleware.ts imports jsonwebtoken, incompatible with Edge Runtime"
created: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
---

## Current Focus

hypothesis: The fix already exists in the working copy but is uncommitted — Vercel builds from the committed HEAD which still has `import jwt from 'jsonwebtoken'`
test: Confirmed via `git diff HEAD middleware.ts` — committed version has the jsonwebtoken import; working copy already has the jose-free crypto.subtle implementation
expecting: Committing the working copy fixes the Vercel build
next_action: Stage and commit both modified files (middleware.ts and app/api/chat/[chatId]/message/route.ts)

## Symptoms

expected: Next.js build succeeds and deploys to Vercel
actual: Build fails with webpack error — `jsonwebtoken` cannot be resolved in Edge Runtime
errors: |
  ./middleware.ts:2:1
  Module not found: Can't resolve 'jsonwebtoken'
  > Build failed because of webpack errors
reproduction: Push to main branch → Vercel build triggers → fails at Next.js compile step
started: Current — never worked on Vercel with this middleware

## Eliminated

- hypothesis: middleware.ts directly imports jsonwebtoken in the working copy
  evidence: Working copy of middleware.ts imports `verifySession` from `@/lib/auth/session`, not jsonwebtoken
  timestamp: 2026-05-04T00:00:00Z

- hypothesis: lib/auth/session.ts uses jsonwebtoken
  evidence: session.ts uses Web Crypto API (crypto.subtle) — fully Edge Runtime compatible, no external JWT library
  timestamp: 2026-05-04T00:00:00Z

- hypothesis: signup/signin routes use jsonwebtoken (possibly pulled in via middleware)
  evidence: Both routes use createSession from lib/auth/session, no jsonwebtoken import present
  timestamp: 2026-05-04T00:00:00Z

- hypothesis: jsonwebtoken is listed in package.json dependencies
  evidence: package.json has no jsonwebtoken entry at all — it was never a listed dependency
  timestamp: 2026-05-04T00:00:00Z

## Evidence

- timestamp: 2026-05-04T00:00:00Z
  checked: git diff HEAD middleware.ts
  found: Committed HEAD of middleware.ts has `import jwt from 'jsonwebtoken'` on line 2. Working copy replaces this with `import { verifySession } from '@/lib/auth/session'` and changes the function to async.
  implication: Vercel is building from the committed version. The local fix is correct and complete but not yet pushed.

- timestamp: 2026-05-04T00:00:00Z
  checked: lib/auth/session.ts
  found: Uses only Web Crypto API (crypto.subtle.importKey, crypto.subtle.sign, crypto.subtle.verify) — all available in Edge Runtime. No Node.js-only dependencies.
  implication: session.ts is already Edge Runtime compatible. The working copy fix is correct.

- timestamp: 2026-05-04T00:00:00Z
  checked: git diff HEAD app/api/chat/[chatId]/message/route.ts
  found: Committed version imports `recordRateLimitMessage` and destructures checkRateLimit result incorrectly (no object destructuring). Working copy fixes both: uses `recordMessage` and `{ allowed: rateLimitAllowed }` destructuring.
  implication: This route has two bugs in HEAD that the working copy already fixes.

- timestamp: 2026-05-04T00:00:00Z
  checked: package.json
  found: No `jsonwebtoken` or `jose` entry in dependencies or devDependencies.
  implication: jsonwebtoken was never installed as a proper dependency — confirms the working copy approach of using built-in Web Crypto is correct.

## Resolution

root_cause: middleware.ts in the committed HEAD (git) imports `jsonwebtoken`, which uses Node.js crypto APIs unavailable in Next.js Edge Runtime. Vercel builds from the committed version, not the working copy. The working copy already has the correct fix (using Web Crypto API via lib/auth/session.ts verifySession) but it was never committed.
fix: Commit the working copy changes to middleware.ts (replace jsonwebtoken with verifySession from lib/auth/session) and app/api/chat/[chatId]/message/route.ts (fix recordMessage import and checkRateLimit destructuring).
verification: Committed as c6ecc7e. Both files staged and committed. checkRateLimit returns { allowed, remaining } matching destructuring in route.ts. recordMessage export confirmed in rate-limit.ts. lib/auth/session.ts uses only Web Crypto API — fully Edge Runtime compatible.
files_changed:
  - middleware.ts
  - app/api/chat/[chatId]/message/route.ts
