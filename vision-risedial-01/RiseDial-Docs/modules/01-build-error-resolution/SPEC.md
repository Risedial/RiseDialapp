# Module 1 — Build Error Resolution: SPEC

## Purpose

Produce a state where `npx tsc --noEmit` exits 0 with no output and `npx next build` completes without error. This is the hard prerequisite for all subsequent modules. No audit, fix, or test work is meaningful until the codebase compiles.

---

## Trigger

**Type:** Manual  
**Initiator:** Developer runs `npx tsc --noEmit` in the project root  
**Frequency:** One pass; loop the fix-rerun cycle until both commands exit 0 in sequence

---

## Inputs

| Field | Type | Source | Required | Constraints |
|-------|------|--------|----------|-------------|
| TypeScript error output | Terminal text | `npx tsc --noEmit` | Yes | Use `--noEmit` — not `next build` — for type checking; `next build` will obscure type errors behind bundler output |
| `tsconfig.tsbuildinfo` | File | Project root | Yes | Confirmed stale; present in the git untracked list; must be deleted before the first tsc run |
| `tsconfig.json` | JSON | Project root | Yes | Contains `skipLibCheck: true` and `strict: true`; ground truth for compiler options |
| All `.ts` and `.tsx` source files | TypeScript | `lib/`, `app/`, `middleware.ts` | Yes | Do not read files in `orchestration/` — they will be excluded from tsconfig compilation in Module 3 |

---

## Outputs

| Field | Type | Destination | Pass Condition |
|-------|------|-------------|----------------|
| Clean tsc run | Terminal exit code | Local terminal | `npx tsc --noEmit` exits 0 and produces zero lines of output |
| Passing next build | Terminal exit code | Local terminal | `npx next build` exits 0; no compilation errors or invalid export errors in the output |
| Git commit | Commit hash | Repository | One commit: `fix: resolve all TypeScript errors and next build blockers` |

---

## Behavior

### Step 1 — Delete the stale build cache

Delete `tsconfig.tsbuildinfo` from the project root.

**Why:** This file is a TypeScript incremental build cache. The current copy is stale — it references type definitions that were once in `node_modules` but are no longer present. Despite `skipLibCheck: true` being set in `tsconfig.json`, the `tsbuildinfo` can cause the compiler to surface phantom errors from cached (now-removed) type entries:

```
error TS2688: Cannot find type definition file for 'testing-library__jest-dom'.
The file is in the program because:
  Entry point of type library 'testing-library__jest-dom' specified in compilerOptions
```

Deleting it forces TypeScript to start a fresh compilation pass without the stale cache.

### Step 2 — Handle the `@types/testing-library__jest-dom` phantom error (if it persists)

If the above error still appears after deleting `tsconfig.tsbuildinfo`, the package was installed by a transitive dependency and TypeScript's auto-discovery is picking it up.

**Branch A — Package exists in node_modules:**
```
ls node_modules/@types/testing-library__jest-dom
```
If found: add `"types": ["node", "react", "react-dom"]` to `compilerOptions` in `tsconfig.json`. This restricts TypeScript's automatic `@types` discovery to only those three packages, preventing it from auto-loading `@types/testing-library__jest-dom`.

**Branch B — Package does not exist in node_modules:**
Run:
```bash
npm install --save-dev @types/testing-library__jest-dom
```
TypeScript's auto-discovery cannot find a package that is not installed; installing it satisfies the resolution.

### Step 3 — Fix all remaining tsc errors

For each error reported by `npx tsc --noEmit`:

1. Navigate to the file and line number indicated
2. Read the error message carefully before touching any code
3. Apply the smallest possible change that removes the error
4. Do not touch surrounding code, do not refactor, do not rename anything
5. Save the file
6. Re-run `npx tsc --noEmit` and confirm that specific error is gone before moving to the next

**Known error categories and their fixes:**

| Error Pattern | Root Cause | Minimal Fix |
|--------------|------------|-------------|
| `jsonwebtoken` type error | `jsonwebtoken` is imported in a non-middleware file | Remove the import; replace any `jwt.verify()` / `jwt.sign()` calls with `verifySession()` / `createSession()` from `lib/auth/session.ts` |
| `Stripe.Invoice.customer` narrow cast | Stripe SDK v22 type is full union: `string \| Stripe.Customer \| Stripe.DeletedCustomer \| null` | Narrow with type guard before use; do not use `as string` — this is a real union |
| `Uint8Array.buffer` cast error | `SubtleCrypto.sign()` returns `ArrayBuffer` but some builds infer `SharedArrayBuffer` | Cast as `buffer as ArrayBuffer` |
| Supabase select return not narrowed | `.select()` returns `T[] \| null`; accessing without null check | Add `if (!data)` guard or use `data ?? []` |
| Import path not found | File does not exist at the imported path | Correct the path; if the file is genuinely missing, that is a blocking finding for Module 2 — document it and skip this error for now |

### Step 4 — Verify tsc is clean

Run `npx tsc --noEmit` and confirm:
- Exit code 0
- Zero lines of output

If any errors remain, return to Step 3.

### Step 5 — Run next build

Run `npx next build` locally. This catches a second class of errors not caught by `tsc --noEmit`:

- Invalid App Router exports (Pages Router `export const config` in an App Router file — already fixed in `app/api/webhooks/stripe/route.ts`)
- Missing or wrong `"use client"` / `"use server"` directives
- Invalid metadata export shapes in layout files
- Server Component importing a module that triggers Node.js / Edge Runtime conflicts at bundle time

For each `next build` error: identify the file, apply the minimal fix, re-run `next build`.

### Step 6 — Commit

When both commands exit 0:
```bash
git add lib/ app/ middleware.ts tsconfig.json package.json package-lock.json
git commit -m "fix: resolve all TypeScript errors and next build blockers"
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Deleting `tsconfig.tsbuildinfo` reveals new errors that were not previously visible | Those errors were pre-existing, masked by the stale cache. They are real errors. Fix them using the same process. |
| `next build` fails with an error that `tsc --noEmit` did not catch | These are distinct classes of checking. Fix the `next build` error independently. Re-verify that `tsc --noEmit` still exits 0 after the fix. |
| `jsonwebtoken` is still imported in a file that is not `middleware.ts` | Remove the import. Replace any usage with `verifySession` / `createSession` from `lib/auth/session.ts`, which uses `crypto.subtle` and is Edge-compatible. |
| A tsc error requires changing an exported interface that has 5+ call sites | Make the interface change in the defining file first. Then fix the call sites one at a time. This is not a refactor — it is a minimal type correction. Do not change behavior; change only types. |
| Deleting `tsconfig.tsbuildinfo` fixes all errors immediately | Happy path. Proceed directly to `next build` verification. |
| A tsc error in `orchestration/` directory | Do not fix it. The `orchestration/` directory will be excluded from TypeScript compilation in Module 3. If this error causes the clean tsc check to fail, add `"orchestration"` to the `exclude` array in `tsconfig.json` now, as a pre-Module-3 action. Document it. |

---

## Failure States

| Failure | Recovery Action |
|---------|----------------|
| A tsc error cannot be resolved without understanding the full call chain of the application | Do not speculate. Escalate to Module 2 (Codebase Audit). Document the error in the Module 2 audit under Area 1. Module 3 will apply the fix after the full call chain is understood. Do not leave a partially-changed file — revert any speculative edits before moving on. |
| `next build` fails due to a Vercel-specific configuration (vercel.json or next.config.ts) | Inspect `next.config.ts` for invalid or deprecated options. Check for `outputFileTracingRoot` pointing to a non-existent directory. Fix the configuration, not the application code. |

---

## AI/LLM Used

None.

---

## Data Stored

None. All changes committed to git only.

---

## Derived Decision

**orchestration/ directory:** The `orchestration/` directory contains AI prompt context files that are not part of the app runtime. It is excluded from TypeScript compilation by adding `"orchestration"` to the `exclude` array in `tsconfig.json`. This decision is applied in Module 3 but may be pre-applied in Module 1 if `orchestration/` files cause tsc errors.
