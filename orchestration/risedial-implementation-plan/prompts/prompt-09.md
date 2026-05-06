# Prompt 09: Execute Commit and Push
**Mode:** EXECUTE
**Step ID:** step-09-execute-commit-push

## Prerequisites
- `flags.commitPlanReady = true` in STATE_FILE
- Plan file to read: `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md`

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Run git operations in `C:\Users\Alexb\Documents\RiseDialapp`. Do NOT write to context/, plans/, or prompts/ directories.
2. **Token limit:** 32,000 tokens max.
3. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
4. **Verification gate:** Run `npx tsc --noEmit` after staging to confirm no regressions before committing. Must exit 0.
5. **Anti-hallucination:** All file names and commit message text must come from the plan file — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`

---

## Task

1. Verify plan file `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` exists. Run Glob for that exact path. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md. Cannot execute without a verified plan. Do not proceed."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` in full. Record the Before state (expected git status), After state (expected git log), and the exact git commands to run.

3. Run `git status --short` from `C:\Users\Alexb\Documents\RiseDialapp`. Confirm the 6 expected files appear as modified (M or ?? prefix). The 6 files are: `app/api/auth/signin/route.ts`, `lib/db/messages.ts`, `lib/memory/trigger.ts`, `lib/memory/compress.ts`, `lib/memory/patch.ts`, `lib/memory/executor.ts`. If these files do NOT appear as modified: stop and report "Git status does not match plan's Before state. Expected 6 modified files but found: [actual output]. Discrepancy must be investigated. Do not proceed."

4. Run the git commands from the plan file in exact order:
   a. `git add app/api/auth/signin/route.ts lib/db/messages.ts lib/memory/trigger.ts lib/memory/compress.ts lib/memory/patch.ts lib/memory/executor.ts`
   b. Run `npx tsc --noEmit` from `C:\Users\Alexb\Documents\RiseDialapp`. If non-zero exit: stop and report "TypeScript errors detected during commit stage. Cannot commit broken code. Fix errors first."
   c. `git commit -m "feat: cross-chat memory profiling and admin premium DB sync

- Memory trigger now counts user messages across all chats globally
- Profile generation reads messages from all user chats, not just the active chat
- Profile patching reads new messages from all user chats since last update
- Executor falls back to initial profile build if patch fires but no profile exists
- Admin sign-in now upserts subscription_status=active and has_premium_memory=true on each login

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`
   d. `git push origin main`

5. Run `npx tsc --noEmit` to confirm final state is clean. Must exit 0.

6. Run `git log --oneline -1`. Confirm output contains the string "feat: cross-chat memory profiling and admin premium DB sync". Run `git status` — confirm working tree is clean with message "nothing to commit, working tree clean".

---

## Verification
- [ ] `git log --oneline -1` output contains the exact string `feat: cross-chat memory profiling and admin premium DB sync` (confirmed by running the command)
- [ ] `npx tsc --noEmit` exits with code 0 (run and confirm)
- [ ] `git status` shows "nothing to commit, working tree clean" (confirmed by running the command)

---

## State Update
After all verification checks pass:
1. Set `flags.allChangesCommitted = true` in STATE_FILE
2. Move `"step-09-execute-commit-push"` from `pendingSteps` to `completedSteps`
3. Append `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` to `artifacts.plansCreated` (recording the commit plan as executed)
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.allChangesCommitted, pendingSteps, completedSteps, artifacts.plansCreated)
