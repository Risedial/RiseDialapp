# Prompt 02: Plan Admin Fixes
**Mode:** PLAN
**Step ID:** step-02-plan-admin-fixes

## Prerequisites
- `flags.adminContextCollected = true` in STATE_FILE
- Context files to read:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-facts.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-locations.md`

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans` — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers (names, paths, line numbers) must come from the context files — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
PLANS_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans`

---

## Task

1. Read STATE_FILE at `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`. Verify `flags.adminContextCollected = true`. If false: stop and report "Prerequisite flag adminContextCollected is false — do not proceed until step-01 completes."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-facts.md` and `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-locations.md` in full.

3. From the context files, identify:
   - The exact text of the admin bypass block (the `old_string` for the edit)
   - The exact text of the replacement block (the `new_string` — adds try/catch upsert after `if (!adminUser)` guard and before `let sessionToken: string;`)
   - The target file absolute path
   - The line numbers from admin-locations.md

4. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md` with these exact fields:

   ```
   ## Plan: Admin Signin Upsert (Plan B-2)

   **Scope:** Insert try/catch upsert block in app/api/auth/signin/route.ts to re-set subscription_status and has_premium_memory on every admin login.

   **Target file:** C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts

   **Target location:** After the closing } of `if (!adminUser)` guard and before `let sessionToken: string;` (line numbers from admin-locations.md)

   **Before state:** (paste verbatim from admin-facts.md — exact characters including whitespace)
   [exact old_string block from admin-facts.md]

   **After state:** (exact replacement — add the try/catch upsert block between the guard and sessionToken)
         if (!adminUser) {
           return NextResponse.json(
             { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
             { status: 401 }
           );
         }

         // Keep admin DB row in sync — Stripe webhooks can reset these fields
         try {
           await supabaseServer
             .from('users')
             .update({ subscription_status: 'active', has_premium_memory: true })
             .eq('id', adminUser.id);
         } catch {
           // Non-fatal: session still created even if this update fails
         }

         let sessionToken: string;

   **Verification test:** Read the file after edit. Confirm the string "Keep admin DB row in sync" appears in the file. Run `npx tsc --noEmit` from C:\Users\Alexb\Documents\RiseDialapp — must exit 0.

   **DO NOT TOUCH:** (no protected files)
   ```

5. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`. Confirm the Before state text from admin-facts.md appears in it exactly (character-for-character). If not found: stop and report "Before state does not match target file — context file may be stale. Do not write plan."

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] Plan file contains the string "Before state:" with verbatim quoted text (not a description)
- [ ] Plan file contains the string "After state:" with exact target content including the try/catch block
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` exists on disk (confirmed via Glob)

---

## State Update
After all verification checks pass:
1. Set `flags.adminPlanReady = true` in STATE_FILE
2. Move `"step-02-plan-admin-fixes"` from `pendingSteps` to `completedSteps`
3. Append `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\02-plan-admin-fixes-plan.md` to `artifacts.plansCreated`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.adminPlanReady, pendingSteps, completedSteps, artifacts.plansCreated)
