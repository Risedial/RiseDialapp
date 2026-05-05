# Module 1 — Build Error Resolution: Build Instructions

## What You Are Building

A clean TypeScript compilation state. No new files are created. Existing files are minimally edited to correct type errors and App Router incompatibilities. The output is two commands that both exit 0.

---

## Prerequisites

- Node.js 20 installed and on PATH
- `npm install` completed in the project root (all `node_modules/` packages present)
- You are in the project root directory
- Git working tree has no uncommitted changes from unrelated work

---

## Step 1 — Delete the stale build cache

```bash
rm tsconfig.tsbuildinfo
```

If the file does not exist, skip this step. If it does exist, delete it — it is confirmed stale and is the root cause of the phantom `@types/testing-library__jest-dom` error.

**Do not add `tsconfig.tsbuildinfo` to `.gitignore` yet** — that will be handled in Module 3 cleanup. Just delete the file now.

---

## Step 2 — Run tsc and read all errors before fixing anything

```bash
npx tsc --noEmit 2>&1 | tee /tmp/tsc-errors.txt
cat /tmp/tsc-errors.txt
```

Read the complete output before touching any file. Count the distinct errors. This is your complete fix list. Jumping to fix the first error without reading the rest risks applying a fix that conflicts with a later fix.

---

## Step 3 — Fix the `@types/testing-library__jest-dom` error (if present)

If the output contains:
```
error TS2688: Cannot find type definition file for 'testing-library__jest-dom'.
```

**Check if the package is installed:**
```bash
ls node_modules/@types/testing-library__jest-dom
```

**If the directory exists** — TypeScript is auto-discovering it as a transitive dependency. Restrict type discovery by editing `tsconfig.json`:

In the `compilerOptions` object, add:
```json
"types": ["node", "react", "react-dom"]
```

This tells TypeScript to only load those three `@types` packages automatically. All other type packages must be explicitly imported.

**If the directory does not exist:**
```bash
npm install --save-dev @types/testing-library__jest-dom
```

After either fix, re-run `npx tsc --noEmit` to confirm the error is gone before continuing.

---

## Step 4 — Fix each remaining error

Work through errors one at a time. For each:
1. Note the file path and line number
2. Open the file
3. Apply the minimal fix (see table below)
4. Save
5. Re-run `npx tsc --noEmit` to confirm the error is gone

**Fix reference table:**

| You see this error | Apply this fix |
|-------------------|---------------|
| `Cannot find module 'jsonwebtoken'` or `Module '"jsonwebtoken"' has no exported member` | Remove the `import ... from 'jsonwebtoken'` line. Replace `jwt.verify(token, secret)` with `verifySession(token)` from `lib/auth/session.ts`. Replace `jwt.sign(payload, secret, options)` with `createSession(userId, subscriptionStatus)` from `lib/auth/session.ts`. |
| `Type 'string \| Customer \| DeletedCustomer \| null' is not assignable to type 'string'` on a Stripe `customer` field | Change the narrowing: `const customerId = typeof customer === 'string' ? customer : customer?.id ?? null` |
| `Property 'X' does not exist on type 'PostgrestSingleResponse<null>'` | Add a null check: `if (!data || error) { ... }` before accessing `data`. |
| `Argument of type 'ArrayBuffer \| SharedArrayBuffer' is not assignable to parameter of type 'ArrayBuffer'` | Cast explicitly: `buffer as ArrayBuffer` |
| `Object is possibly 'null'` on a Supabase select result | Add `if (!data)` guard or use optional chaining `data?.field` |

---

## Step 5 — Confirm tsc exits 0

```bash
npx tsc --noEmit
```

The command must produce **zero output** and exit with **code 0**. If any output appears, you have remaining errors. Return to Step 4.

---

## Step 6 — Run next build and fix any additional errors

```bash
npx next build
```

`next build` performs additional checks that `tsc --noEmit` does not:

**If you see `export const config` error:**
- Open the indicated file (likely `app/api/webhooks/stripe/route.ts`)
- Remove the `export const config = { ... }` block
- This is Pages Router syntax; App Router does not use it
- Note: this was already fixed in the last session — verify it is not present

**If you see a runtime declaration error:**
- Do not add `export const runtime = 'edge'` to Node.js-only routes
- Only add it to routes that are truly Edge-compatible (no bcryptjs, no jsonwebtoken, no Node built-ins)

**If you see a `Duplicate page` or `Conflicting app and pages` error:**
- Check for any files in `pages/` directory that conflict with `app/` routes
- Move or delete the conflicting pages file

After each fix, re-run `npx next build`. Repeat until exit 0.

---

## Step 7 — Commit

Stage only the files you changed:

```bash
git add lib/ app/ middleware.ts tsconfig.json package.json package-lock.json
git status  # review what is staged
git commit -m "fix: resolve all TypeScript errors and next build blockers"
```

---

## What to Test

After this module is complete, run both verification commands and confirm:

```bash
npx tsc --noEmit
# Expected: no output, exit code 0

npx next build
# Expected: "Route (app)" table printed, "✓ Compiled successfully", exit code 0
```

---

## Definition of Done

- [ ] `npx tsc --noEmit` exits with code 0 and produces zero lines of output
- [ ] `npx next build` exits with code 0 and shows no compilation errors
- [ ] All changes committed to git with commit message `fix: resolve all TypeScript errors and next build blockers`
- [ ] No speculative changes — only the minimal edits required to clear errors
- [ ] No files created (only edited)
- [ ] `git diff HEAD~1` shows only type fixes, not logic changes or refactors

---

## What This Connects To

- **Output consumed by:** Module 2 (Codebase Audit) — the audit reads all source files and assumes they are in a type-correct state
- **Gate:** Module 2 will not start until both `npx tsc --noEmit` and `npx next build` exit 0
