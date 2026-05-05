# Module 1 — Build Error Resolution: Flow

## Pre-conditions
- Working directory is the project root (`c:\Users\Alexb\Documents\RiseDialapp` or equivalent)
- `npm install` has been run; `node_modules/` is populated
- Git working tree is clean (or changes are staged)

---

## Steps

**1.** Check whether `tsconfig.tsbuildinfo` exists in the project root.
- File exists → go to step 2
- File does not exist → go to step 3

**2.** Delete the stale build cache.
```bash
rm tsconfig.tsbuildinfo
```
Continue to step 3.

**3.** Run TypeScript type checking.
```bash
npx tsc --noEmit 2>&1
```
Capture the full output. Read all error lines before taking any action.
- Exit code 0, zero output → go to step 8
- Exit code 1 → go to step 4

**4.** Categorise the errors.
- Output contains `Cannot find type definition file for 'testing-library__jest-dom'` → go to step 5
- Output contains only other errors → go to step 6
- Output contains both categories → go to step 5 first, then step 6

**5.** Resolve the `@types/testing-library__jest-dom` phantom error.

Check if the package is installed:
```bash
ls node_modules/@types/testing-library__jest-dom
```

Branch A — directory exists (installed as a transitive dependency):
- Open `tsconfig.json`
- In `compilerOptions`, add: `"types": ["node", "react", "react-dom"]`
- Save
- Go to step 3

Branch B — directory does not exist:
```bash
npm install --save-dev @types/testing-library__jest-dom
```
Go to step 3.

**6.** Fix each remaining tsc error.

For each error (one at a time, in order of appearance):

6a. Read the error: note the file path, line number, and error message.

6b. Open the file at the specified line.

6c. Identify the error type and apply the appropriate minimal fix:

| Error pattern | Action |
|--------------|--------|
| `jsonwebtoken` import or usage | Remove the import line. Replace any `jwt.verify()` with `verifySession()` from `lib/auth/session.ts`. Replace any `jwt.sign()` with `createSession()` from `lib/auth/session.ts`. |
| Stripe `Invoice.customer` cast to `string` | Change the cast to handle the full union: `string \| Stripe.Customer \| Stripe.DeletedCustomer \| null`. Narrow with a type guard: `typeof customer === 'string' ? customer : customer?.id`. |
| Supabase `.select()` result used without null check | Add `if (!data) return` or use `data ?? []` before accessing the array. |
| Any other type cast error | Correct the cast. Do not use `as unknown as X` to silence the error — understand and fix the underlying type mismatch. |
| Import resolves to a missing file | If the file is confirmed missing, document it as a finding for Module 2 Area 1 and skip this error for now. Do not create the file speculatively. |

6d. Save the file.
Go to step 3.

**7.** Confirm tsc is clean.
```bash
npx tsc --noEmit
```
- Exit code 0, zero output → go to step 8
- Exit code 1 → unexpected; read new errors carefully. If they are caused by a fix from step 6, that fix was incorrect — revert it and find the real minimal fix. Then go to step 6.

**8.** Run Next.js production build.
```bash
npx next build
```
- Exit code 0 → go to step 10
- Exit code 1 → go to step 9

**9.** Fix `next build` errors.

For each error in the build output:

9a. Identify the error type:

| Error pattern | Action |
|--------------|--------|
| `export const config` in an App Router file | Remove the `export const config = { ... }` block entirely. This is Pages Router syntax and is invalid in App Router files. (Already fixed in `app/api/webhooks/stripe/route.ts` — verify it is gone.) |
| Missing `"use client"` directive | Add `'use client'` as the first line of the file. |
| Invalid `generateMetadata` or `metadata` export shape | Correct the export to match Next.js 14 App Router metadata API. |
| Server component importing a client-only module | Move the import to a Client Component or use dynamic imports with `ssr: false`. |

9b. Save the file.
Go to step 8.

**10.** Stage and commit all changes.
```bash
git add lib/ app/ middleware.ts tsconfig.json package.json package-lock.json
git commit -m "fix: resolve all TypeScript errors and next build blockers"
```

---

## Decision Points

```
start
  │
  ▼
tsconfig.tsbuildinfo exists?
  │ yes → delete it
  │ no  → continue
  ▼
npx tsc --noEmit
  │ exit 0 → run next build
  │ exit 1 → read errors
             │
             ├─ testing-library__jest-dom error?
             │    │ yes → check node_modules/@types/testing-library__jest-dom
             │    │         exists → add "types" to tsconfig → retry tsc
             │    │         not exists → npm install @types/... → retry tsc
             │    │ no  → fix each error minimally → retry tsc
             │
             └─ loop until exit 0
  ▼
npx next build
  │ exit 0 → commit → DONE
  │ exit 1 → fix build error → retry next build → loop
```

---

## Post-conditions

- `npx tsc --noEmit` exits 0 with no output (verifiable)
- `npx next build` exits 0 (verifiable)
- All changes committed to the `main` branch
- `tsconfig.tsbuildinfo` is absent from the project root (or added to `.gitignore` to prevent it re-appearing)
- Ready to begin Module 2
