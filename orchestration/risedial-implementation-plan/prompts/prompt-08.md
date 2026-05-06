# Prompt 08: Plan Commit and Push
**Mode:** PLAN
**Step ID:** step-08-plan-commit-push

## Prerequisites
- `flags.verifyOutputReady = true` in STATE_FILE
- Context files to read:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-facts.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-locations.md`

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans` — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers confirmed from context files — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
PLANS_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans`

---

## Task

1. Read STATE_FILE. Verify `flags.verifyOutputReady = true`. If false: stop and report "Prerequisite flag verifyOutputReady is false — do not proceed until step-07 completes."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-facts.md` and `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-locations.md` in full.

3. Check verify-facts.md: if it contains "FAIL" or exit code is non-zero: stop and report "TypeScript verification failed — fix errors before proceeding to commit. See verify-facts.md for details. Do not write commit plan."

4. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` with:

   ```
   ## Plan: Git Commit and Push

   **Scope:** Stage 6 modified files, commit with specified message, push to origin main.

   **Before state:** git status shows these 6 files as modified (unstaged or staged):
   - app/api/auth/signin/route.ts
   - lib/db/messages.ts
   - lib/memory/trigger.ts
   - lib/memory/compress.ts
   - lib/memory/patch.ts
   - lib/memory/executor.ts

   **After state:** git log --oneline -1 shows a commit with message starting "feat: cross-chat memory profiling and admin premium DB sync". All 6 files committed and pushed to origin main.

   **Git commands to run (in order):**
   1. cd C:\Users\Alexb\Documents\RiseDialapp
   2. git add app/api/auth/signin/route.ts lib/db/messages.ts lib/memory/trigger.ts lib/memory/compress.ts lib/memory/patch.ts lib/memory/executor.ts
   3. git commit -m "$(cat <<'EOF'
   feat: cross-chat memory profiling and admin premium DB sync

   - Memory trigger now counts user messages across all chats globally
   - Profile generation reads messages from all user chats, not just the active chat
   - Profile patching reads new messages from all user chats since last update
   - Executor falls back to initial profile build if patch fires but no profile exists
   - Admin sign-in now upserts subscription_status=active and has_premium_memory=true on each login

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"
   4. git push origin main

   **Verification test:** Run `git log --oneline -1` — output must contain "feat: cross-chat memory profiling and admin premium DB sync". Run `git status` — working tree must be clean.

   **DO NOT TOUCH:** (no protected files)

   **TypeScript verification status at plan time:** (paste the TypeScript check result line from verify-facts.md)
   ```

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] Plan file contains the string "git add app/api/auth/signin/route.ts" (confirming the exact stage command is present)
- [ ] Plan file contains the string "feat: cross-chat memory profiling" (confirming commit message is present)
- [ ] verify-facts.md shows TypeScript exit code = 0 (PASS)

---

## State Update
After all verification checks pass:
1. Set `flags.commitPlanReady = true` in STATE_FILE
2. Move `"step-08-plan-commit-push"` from `pendingSteps` to `completedSteps`
3. Append `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\08-plan-commit-push-plan.md` to `artifacts.plansCreated`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.commitPlanReady, pendingSteps, completedSteps, artifacts.plansCreated)
