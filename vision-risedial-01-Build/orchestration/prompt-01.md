# Step 01: M1 — Build Error Resolution

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-01" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-01"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\auth-values.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

This step resolves all TypeScript compilation errors so that `npx tsc --noEmit` and `npx next build` both exit 0.

**Pre-flight action (mandatory first step):**
Delete `tsconfig.tsbuildinfo` before running any tsc command:
```
Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
```

**Sub-step 1 — Run the type checker to discover all errors:**
Run `npx tsc --noEmit` and read every line of output before touching any file.

**Sub-step 2 — Fix `app/api/webhooks/stripe/route.ts` if tsc reports a type error on `invoice.customer`:**
The line `(invoice.customer as Stripe.Customer)?.id ?? null` must be replaced with `invoice.customer?.id ?? null` (the `.id` property exists on both `Stripe.Customer` and `Stripe.DeletedCustomer`; no cast needed). Do not change any other code in this file.

Exact file to write: `C:\Users\Alexb\Documents\RiseDialapp\app\api\webhooks\stripe\route.ts`
Write the complete file content as shown in the refined-prompt.md M1 section (the corrected version with `invoice.customer?.id ?? null` on the invoice.payment_failed handler line). All other code is unchanged.

**Sub-step 3 — Fix `lib/auth/session.ts` only if tsc reports a specific error in that file:**
The file is already correct as-is (`as ArrayBuffer` cast is present). Do not change this file unless tsc reports a specific error at a specific line number. If tsc reports an error here, read the exact message before touching anything.

**Sub-step 4 — Fix `tsconfig.json` conditionally:**
- If tsc reports `error TS2688: Cannot find type definition file for 'testing-library__jest-dom'` AND `node_modules/@types/testing-library__jest-dom` exists: add `"types": ["node", "react", "react-dom"]` to compilerOptions.
- If tsc reports errors in any file under `orchestration/`: add `"orchestration"` to the `exclude` array.
- Apply only what is needed; do not apply both changes if only one is needed.

File to write (if changed): `C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json`

**Sub-step 5 — Remove `jsonwebtoken` from `package.json` conditionally:**
Before editing, run this grep to confirm zero remaining imports:
```
Select-String -Path "lib\**\*.ts","app\**\*.ts","app\**\*.tsx","middleware.ts" -Pattern "jsonwebtoken" -Recurse
```
Only if grep returns zero results: write `C:\Users\Alexb\Documents\RiseDialapp\package.json` with `jsonwebtoken` removed from dependencies and `@types/jsonwebtoken` removed from devDependencies. Then run `npm install` to regenerate `package-lock.json`.

**Sub-step 6 — Verify clean build:**
After all edits, run `npx tsc --noEmit`. It must exit 0. Then run `npx next build`. It must exit 0 with no compilation errors.

**Sub-step 7 — Commit:**
Stage only the files that were actually changed. Do NOT stage `tsconfig.tsbuildinfo`.
Commit message: `fix: resolve all TypeScript errors and next build blockers`
Rule: Do not batch multiple logical fixes into one commit if they touch different files for different reasons. If both the stripe route fix and tsconfig fix were needed, they may be in the same commit only if both are minimal type fixes with no logic changes.

## Verification
- [ ] `npx tsc --noEmit` exits with code 0 and produces zero lines of output
- [ ] `npx next build` exits with code 0 and shows no compilation errors in terminal output
- [ ] `tsconfig.tsbuildinfo` does not exist in the project root
- [ ] `git log --oneline` shows exactly one new commit with message containing 'fix: resolve all TypeScript errors and next build blockers'
- [ ] No speculative code changes exist — `git diff HEAD~1` shows only minimal type fixes, no logic changes
- [ ] No files are created — only existing files are edited (except package-lock.json if package.json changed)

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-01" from pendingSteps to completedSteps
- Set steps["prompt-01"].status = "complete"
