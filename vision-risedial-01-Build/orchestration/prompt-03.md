# Step 03: M3-A — Fix A: Remove insecure JWT_SECRET fallback

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-03" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-03"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix A from Module 3: Remove the `"changeme-insecure-fallback"` string from `lib/auth/session.ts` and replace it with a startup throw if `JWT_SECRET` is absent.

**Constraint:** Do NOT add an import from `lib/env.ts` (it does not exist yet in this module). Read `process.env.JWT_SECRET` directly and throw at module initialization time if absent.

**Sub-step 1 — Read the current file:**
Read `C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts` in full before making any changes.

**Sub-step 2 — Write the corrected file:**
Write `C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts` with this change only:

Replace the current line 3:
```typescript
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-insecure-fallback";
```

With these lines:
```typescript
const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = _jwtSecret;
```

All other code in the file is completely unchanged. Write the full file — do not truncate.

The complete corrected file begins with:
```typescript
import { NextResponse } from "next/server";

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = _jwtSecret;
const COOKIE_NAME = "risedial_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
```
(then all helper functions and exports follow unchanged)

**Sub-step 3 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 4 — Commit:**
Stage: `git add lib/auth/session.ts`
Commit message: `fix(A): throw on absent JWT_SECRET instead of using insecure fallback`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\auth\session.ts` does not contain the string `"changeme-insecure-fallback"`
- [ ] The file contains `throw new Error('JWT_SECRET environment variable is not set')`
- [ ] The file still exports `createSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`
- [ ] `npx tsc --noEmit` exits 0 after this change
- [ ] `git log --oneline` shows a new commit with message containing `fix(A)`
- [ ] No other files were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-03" from pendingSteps to completedSteps
- Set steps["prompt-03"].status = "complete"
