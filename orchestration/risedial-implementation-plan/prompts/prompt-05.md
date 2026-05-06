# Prompt 05: Plan Memory Profiling Fixes
**Mode:** PLAN
**Step ID:** step-05-plan-memory-fixes

## Prerequisites
- `flags.memoryContextCollected = true` in STATE_FILE
- Context files to read:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-facts.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-locations.md`

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

1. Read STATE_FILE. Verify `flags.memoryContextCollected = true`. If false: stop and report "Prerequisite flag memoryContextCollected is false — do not proceed until step-04 completes."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-facts.md` and `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-locations.md` in full.

3. From context files, identify for each of the 5 Plan A edits: exact target file path, exact Before state text (from memory-facts.md), exact After state text (the replacement), and line numbers.

4. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md` with one section per edit (5 total):

   **Edit A-1 — Add getMessagesByUserId to lib/db/messages.ts**
   - Scope: Append new exported function after `countUserMessagesByChatId` closing `}`
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`
   - Before state: (verbatim from memory-facts.md — the entire `countUserMessagesByChatId` function)
   - After state: (the same function PLUS the new `getMessagesByUserId` function appended after it)
   - Verification test: File contains `export async function getMessagesByUserId` and `import { getMessagesByUserId }` does NOT still reference the old function

   **Edit A-2 — Rewrite checkCompressionTrigger in lib/memory/trigger.ts**
   - Scope: Replace entire function body to use `.in('chat_id', chatIds)` instead of `.eq('chat_id', chatId)`
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`
   - Before state: (verbatim from memory-facts.md — entire function)
   - After state: (new function body with cross-chat query using chatIds array)
   - Verification test: File does NOT contain `.eq('chat_id', chatId)` in the messages query; file DOES contain `.in('chat_id', chatIds)`

   **Edit A-3a — Change import in lib/memory/compress.ts**
   - Scope: Replace `getMessagesByChatId` with `getMessagesByUserId` in import line
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - Before state: (verbatim import line from memory-facts.md)
   - After state: same line with `getMessagesByUserId` instead of `getMessagesByChatId`
   - Verification test: File contains `import { getMessagesByUserId }` from `'../db/messages'`

   **Edit A-3b — Change call site in lib/memory/compress.ts**
   - Scope: Replace `getMessagesByChatId(chatId)` call with `getMessagesByUserId(userId)`
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - Before state: (verbatim call line from memory-facts.md)
   - After state: same line with `getMessagesByUserId(userId)` instead of `getMessagesByChatId(chatId)`
   - Verification test: File does NOT contain `getMessagesByChatId` anywhere

   **Edit A-4a — Change import in lib/memory/patch.ts**
   - Scope: Replace `getMessagesByChatId` with `getMessagesByUserId` in import line
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - Before state: (verbatim import line from memory-facts.md)
   - After state: same line with `getMessagesByUserId` instead of `getMessagesByChatId`

   **Edit A-4b — Change call site in lib/memory/patch.ts**
   - Scope: Replace `getMessagesByChatId(chatId)` with `getMessagesByUserId(userId)` (variable is `allMessages`)
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - Before state: (verbatim call line from memory-facts.md — includes `allMessages =`)
   - After state: same line with `getMessagesByUserId(userId)` instead of `getMessagesByChatId(chatId)`
   - Verification test: File does NOT contain `getMessagesByChatId` anywhere

   **Edit A-5a — Add import to lib/memory/executor.ts**
   - Scope: Add `import { getMemoryProfileByUserId } from '../db/memory';` after existing 3 imports
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`
   - Before state: (verbatim 3-line import block from memory-facts.md)
   - After state: same 3 lines PLUS new 4th import line

   **Edit A-5b — Insert guard block in lib/memory/executor.ts**
   - Scope: Insert `if (triggerResult.isPatch) { ... }` guard block after early-return and before compressionFn assignment
   - Target file: `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`
   - Before state: (verbatim block from Step 3 comment through `if (!triggerResult.shouldCompress)` block and up to Step 4 comment, from memory-facts.md)
   - After state: same content PLUS the guard block inserted between Step 3 and Step 4
   - Verification test: File contains `getMemoryProfileByUserId` import and `if (triggerResult.isPatch) {` guard

5. For each edit, read the actual target file and confirm the Before state text appears exactly in it. If any Before state does not match: stop and report which file/edit mismatches — do not write the plan.

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] Plan file contains the string "Edit A-1" (confirming all 5 edit sections are present)
- [ ] Plan file contains a "Before state:" field for each of the 5 edits with verbatim quoted text
- [ ] All 5 target file paths listed in the plan exist on disk (Glob each)

---

## State Update
After all verification checks pass:
1. Set `flags.memoryPlanReady = true` in STATE_FILE
2. Move `"step-05-plan-memory-fixes"` from `pendingSteps` to `completedSteps`
3. Append `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans\05-plan-memory-fixes-plan.md` to `artifacts.plansCreated`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.memoryPlanReady, pendingSteps, completedSteps, artifacts.plansCreated)
