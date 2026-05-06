# Prompt 03: Execute Admin Fixes
**Mode:** EXECUTE
**Step ID:** step-03-execute-admin-fixes

## Prerequisites
- `flags.adminPlanReady = true` in STATE_FILE
- Plan file to read: `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md`

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Write only to application code in `C:\Users\Alexb\Documents\RiseDialapp`. Do NOT write to context/, plans/, or prompts/ directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Verification gate:** Run `npx tsc --noEmit` after writing. Fix all errors. Step cannot complete with TypeScript errors remaining.
6. **Anti-hallucination:** All identifiers must be confirmed from the plan file — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`

---

## Task

1. Verify plan file `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md` exists. Run Glob for that exact path. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md. Cannot execute without a verified plan. Do not proceed."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md` in full. Record the exact Before state and After state fields verbatim.

3. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`. Confirm its current content contains the plan's Before state text character-for-character. If it does not match exactly: stop and report "Source file C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts does not match plan's Before state. Discrepancy must be investigated before execution. Do not attempt to resolve independently."

4. Apply the edit using the Edit tool: replace the exact Before state string with the exact After state string in `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`. The After state inserts a try/catch upsert block between the `if (!adminUser)` guard closing `}` and the `let sessionToken: string;` declaration.

5. Run `npx tsc --noEmit` from `C:\Users\Alexb\Documents\RiseDialapp`. If it exits with any TypeScript errors: read the error messages, diagnose the cause, fix the issue in the file, and re-run `npx tsc --noEmit`. This step cannot complete with errors remaining.

6. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` again. Confirm it now contains the string "Keep admin DB row in sync" (from the inserted comment) and the `supabaseServer.from('users').update(` call.

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` contains the exact string `Keep admin DB row in sync` (confirmed by reading the file)
- [ ] `npx tsc --noEmit` exits with code 0 (run and confirm)
- [ ] `git diff --name-only` output contains `app/api/auth/signin/route.ts` and no unexpected files

---

## State Update
After all verification checks pass:
1. Set `flags.adminFixesApplied = true` in STATE_FILE
2. Move `"step-03-execute-admin-fixes"` from `pendingSteps` to `completedSteps`
3. Append `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` to `artifacts.filesWritten`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.adminFixesApplied, pendingSteps, completedSteps, artifacts.filesWritten)
