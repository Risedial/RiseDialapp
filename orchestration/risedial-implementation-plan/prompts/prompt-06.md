# Prompt 06: Execute Memory Profiling Fixes
**Mode:** EXECUTE
**Step ID:** step-06-execute-memory-fixes

## Prerequisites
- `flags.memoryPlanReady = true` in STATE_FILE
- Plan file to read: `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md`

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Write only to application code in `C:\Users\Alexb\Documents\RiseDialapp`. Do NOT write to context/, plans/, or prompts/ directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Verification gate:** Run `npx tsc --noEmit` after ALL edits complete. Fix all errors. Step cannot complete with TypeScript errors remaining.
6. **Anti-hallucination:** All identifiers must be confirmed from the plan file — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`

---

## Task

This step applies 7 edits across 5 files (Plan A). Apply them in the order listed in the plan file.

1. Verify plan file `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md` exists. Run Glob for that exact path. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md. Cannot execute without a verified plan. Do not proceed."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md` in full. For each of the 7 edit sections, record the exact Before state and After state verbatim.

3. For each edit, read the target source file and confirm it contains the plan's Before state text character-for-character before applying the edit. If any Before state does not match: stop and report "Source file [path] does not match plan's Before state for edit [edit-name]. Discrepancy must be investigated before execution. Do not attempt to resolve independently."

4. Apply all 7 edits using the Edit tool in this exact order:
   - Edit A-1: Append `getMessagesByUserId` function to `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`
   - Edit A-2: Replace `checkCompressionTrigger` body in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`
   - Edit A-3a: Replace import line in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - Edit A-3b: Replace call site in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - Edit A-4a: Replace import line in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - Edit A-4b: Replace call site in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - Edit A-5a: Add import line to `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`
   - Edit A-5b: Insert guard block in `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

5. Run `npx tsc --noEmit` from `C:\Users\Alexb\Documents\RiseDialapp`. If it exits with any TypeScript errors: read the error messages, diagnose the cause, fix the issue in the relevant file(s), and re-run `npx tsc --noEmit`. This step cannot complete with errors remaining.

6. Read each of the 5 target files. Confirm each contains its expected After state (check for key strings):
   - `lib/db/messages.ts`: contains `export async function getMessagesByUserId`
   - `lib/memory/trigger.ts`: contains `.in('chat_id', chatIds)` and does NOT contain `.eq('chat_id', chatId)` in the messages query
   - `lib/memory/compress.ts`: contains `getMessagesByUserId` in both import and call site; does NOT contain `getMessagesByChatId`
   - `lib/memory/patch.ts`: contains `getMessagesByUserId` in both import and call site; does NOT contain `getMessagesByChatId`
   - `lib/memory/executor.ts`: contains `getMemoryProfileByUserId` import and `if (triggerResult.isPatch) {` guard block

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts` contains the exact string `export async function getMessagesByUserId` (confirmed by reading the file)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts` contains `.in('chat_id', chatIds)` (confirmed by reading the file)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts` does NOT contain the string `getMessagesByChatId` (confirmed by Grep)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts` does NOT contain the string `getMessagesByChatId` (confirmed by Grep)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts` contains the string `getMemoryProfileByUserId` (confirmed by reading the file)
- [ ] `npx tsc --noEmit` exits with code 0 (run and confirm)
- [ ] `git diff --name-only` output contains exactly: lib/db/messages.ts, lib/memory/trigger.ts, lib/memory/compress.ts, lib/memory/patch.ts, lib/memory/executor.ts (and app/api/auth/signin/route.ts from prior step)

---

## State Update
After all verification checks pass:
1. Set `flags.memoryFixesApplied = true` in STATE_FILE
2. Move `"step-06-execute-memory-fixes"` from `pendingSteps` to `completedSteps`
3. Append to `artifacts.filesWritten`:
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.memoryFixesApplied, pendingSteps, completedSteps, artifacts.filesWritten)
