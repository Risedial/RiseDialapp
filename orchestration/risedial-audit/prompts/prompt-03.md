# Prompt 03: Execute — Fix Message Sort Order
**Mode:** EXECUTE
**Step ID:** step-03-execute-message-order-fix

## Prerequisites
- `flags.codebaseVerified = true` in STATE_FILE
- Plan file must exist: `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\02-message-order-plan.md`
- Read these files before starting:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\02-message-order-plan.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Read the plan file first. Every identifier must be verified against the actual source file before writing. No invented values.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Never truncate a file write with `// ... more` or similar.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **TypeScript gate:** Run `npx tsc --noEmit` after writing. Fix all errors before marking complete. Step cannot complete with TypeScript errors.
6. **Surgical edit only:** Change ONLY the boolean value `false` to `true` in the `.order()` call. Touch no other code.
7. **DO NOT TOUCH:** `middleware.ts`, `lib/auth/session.ts`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Task

Fix the reversed message sort order in the chat messages API.

**Step 1 — Verify plan file exists:**
Confirm `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\02-message-order-plan.md` exists and is readable. If it does not exist, stop and report the missing plan file — do not proceed.

**Step 2 — Read plan:**
Read the plan file. Note the exact file path, line number, "Before state" text, and "After state" text.

**Step 3 — Read source file:**
Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts` in full.
Locate the `.order("created_at", { ascending: false })` line. Confirm it matches the "Before state" in the plan. If it does not match exactly, stop and report the discrepancy — do not edit.

**Step 4 — Apply edit:**
Use the Edit tool to change ONLY `ascending: false` to `ascending: true` in that line.
The old_string must be the exact text of that line (copy it verbatim from your file read).
The new_string must be identical except `false` → `true`.

**Step 5 — Verify edit:**
Read the file again at that line. Confirm it now reads `ascending: true`.

**Step 6 — Run TypeScript check:**
Run: `npx tsc --noEmit`
Working directory: `C:\Users\Alexb\Documents\RiseDialapp`
If any errors appear, read them carefully, fix them, and re-run until exit code 0.
If the fix introduces unexpected type errors, report them — do not guess at a resolution.

---

## Verification
- [ ] The file `app/api/chats/[chatId]/messages/route.ts` contains `ascending: true` (not `false`)
- [ ] No other lines in the file were changed
- [ ] `npx tsc --noEmit` exits with code 0

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Set `flags.messageOrderFixed = true`
3. Move `"step-03-execute-message-order-fix"` from `pendingSteps` to `completedSteps`
4. Append `"app/api/chats/[chatId]/messages/route.ts"` to `artifacts.filesWritten`
5. Write STATE_FILE back with these changes (preserve all other fields exactly)
