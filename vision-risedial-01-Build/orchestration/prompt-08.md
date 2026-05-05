# Step 08: M3-F — Fix F: Exclude orchestration/ from tsconfig

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-08" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-08"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix F from Module 3: Add `"orchestration"` to the `exclude` array in `tsconfig.json`.

Key values from context (do NOT invent):
- `tsconfig_must_exclude` values: `['node_modules', 'orchestration']` (from external-services.md)
- `tsconfig_skipLibCheck`: `true` (from external-services.md)
- `tsconfig_strict`: `true` (from external-services.md)

**Pre-condition (MANDATORY):** Before making this edit, run the following grep and confirm it returns zero results:
```
Select-String -Path "lib\**\*.ts","app\**\*.ts","middleware.ts" -Pattern "jsonwebtoken" -Recurse
```
If any result is returned, stop — Fix G (prompt-09) must resolve those imports first. Only proceed if grep returns zero results.

**Sub-step 1 — Read the current file:**
Read `C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json` in full.

**Sub-step 2 — Write the corrected file:**
Write `C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json` with `"orchestration"` added to the `exclude` array. The complete file after Fix F:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "orchestration"]
}
```

Note: If the file on disk already has `"types"` in compilerOptions (added during prompt-01 to fix a testing-library__jest-dom error), preserve that field. Do not remove it.

**Sub-step 3 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing. Errors in `orchestration/` should now be gone.

**Sub-step 4 — Commit:**
Stage: `git add tsconfig.json`
Commit message: `fix(F): exclude orchestration/ directory from TypeScript compilation`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\tsconfig.json` `exclude` array contains both `"node_modules"` and `"orchestration"`
- [ ] `npx tsc --noEmit` exits 0 after this change
- [ ] No TypeScript errors reference files in the `orchestration/` directory
- [ ] `git log --oneline` shows a new commit with message containing `fix(F)`
- [ ] No other files were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-08" from pendingSteps to completedSteps
- Set steps["prompt-08"].status = "complete"
