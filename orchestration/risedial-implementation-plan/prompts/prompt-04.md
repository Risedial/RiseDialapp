# Prompt 04: Collect Memory Profiling Context
**Mode:** COLLECT
**Step ID:** step-04-collect-memory-context

## Prerequisites
- `flags.adminFixesApplied = true` in `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
- Confirmed from STATE_FILE before proceeding

---

## Hard Constraints

1. **Mode lock — COLLECT:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context` — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers (names, paths, signatures) must be confirmed from actual file read — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
CONTEXT_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context`

---

## Task

1. Read STATE_FILE at `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`. Verify `flags.adminFixesApplied = true`. If false: stop and report "Prerequisite flag adminFixesApplied is false — do not proceed until step-03 completes." Also verify `"step-04-collect-memory-context"` is in `pendingSteps`.

2. Read each of these 5 files in full, recording exact content, line numbers, and function signatures:
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts` — locate `countUserMessagesByChatId` function (entire function body)
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts` — locate `checkCompressionTrigger` function (entire function body)
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts` — locate import line for `getMessagesByChatId` and the call site `messages = await getMessagesByChatId(chatId)`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts` — locate import line for `getMessagesByChatId` and the call site `allMessages = await getMessagesByChatId(chatId)`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts` — locate import block (lines with `checkCompressionTrigger`, `generateInitialProfile`, `patchMemoryProfile`), and the `triggerResult` declaration line

3. For each file, record verbatim: the exact text of every line that will be modified (including surrounding context of 3 lines before and after). Count leading spaces for indentation.

4. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-facts.md` with these sections per file:

   **messages.ts:**
   - File path: (absolute)
   - `countUserMessagesByChatId` function: verbatim full function (all lines from `export async function countUserMessagesByChatId` through closing `}`)
   - Line number of the closing `}` of `countUserMessagesByChatId` (this is where the new function appends)

   **trigger.ts:**
   - File path: (absolute)
   - `checkCompressionTrigger` entire function: verbatim (from `export async function checkCompressionTrigger` through closing `}`)
   - Line numbers: function start and end

   **compress.ts:**
   - File path: (absolute)
   - Import line verbatim: the line containing `getMessagesByChatId` (exact text)
   - Call site verbatim: the line containing `getMessagesByChatId(chatId)` (exact text with indentation)

   **patch.ts:**
   - File path: (absolute)
   - Import line verbatim: the line containing `getMessagesByChatId`
   - Call site verbatim: the line containing `getMessagesByChatId(chatId)` (note: variable is `allMessages`, not `messages`)

   **executor.ts:**
   - File path: (absolute)
   - Import block verbatim: the 3 lines importing from `./trigger`, `./compress`, `./patch`
   - `triggerResult` declaration line verbatim (confirm it uses `let`, not `const`)
   - Step 3 early-return block verbatim: from `// --- Step 3` comment through `if (!triggerResult.shouldCompress) { return; }` (or equivalent)
   - Line immediately after the early-return block's closing `}` (this is where the guard inserts)

5. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-locations.md` with a table per file:
   - File absolute path
   - Each modification target: line number, exact string to replace (old), exact replacement string (new)

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-facts.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-locations.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] All 5 source file paths listed in memory-locations.md resolve to existing files on disk (confirmed via Glob for each)
- [ ] The string `[placeholder]` does not appear in either context file (confirmed via Grep)

---

## State Update
After all verification checks pass:
1. Set `flags.memoryContextCollected = true` in STATE_FILE
2. Move `"step-04-collect-memory-context"` from `pendingSteps` to `completedSteps`
3. Append to `artifacts.filesWritten`:
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-facts.md`
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\memory-locations.md`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.memoryContextCollected, pendingSteps, completedSteps, artifacts.filesWritten)
