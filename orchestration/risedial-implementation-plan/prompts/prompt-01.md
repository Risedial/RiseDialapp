# Prompt 01: Collect Admin Context
**Mode:** COLLECT
**Step ID:** step-01-collect-admin-context

## Prerequisites
None. This is the first step.

---

## Hard Constraints

1. **Mode lock — COLLECT:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context` — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers (names, paths, signatures) must be confirmed from actual file read — not from memory.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
CONTEXT_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context`
SOURCE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` (declared from implementation plan objective — this is the file to read in Task)

---

## Task

1. Read STATE_FILE at `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`. Verify `"step-01-collect-admin-context"` is in `pendingSteps`. If not found: stop and report "step-01-collect-admin-context is not in pendingSteps — cannot proceed."

2. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` in full. Record:
   - All import statements at the top of the file
   - The exact admin bypass block starting at `if (!adminUser)` and ending at `let sessionToken: string;` — quote the exact lines verbatim including all whitespace/indentation
   - The line numbers of `if (!adminUser) {` and `let sessionToken: string;`
   - Confirm `supabaseServer` is imported (note which line)

3. Record all findings verbatim from the file — exact characters, exact indentation (count spaces). Do not paraphrase.

4. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-facts.md` with these sections:
   - **File:** `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`
   - **supabaseServer import line:** (exact line text and line number)
   - **Admin bypass block (verbatim):** paste the exact block from `if (!adminUser)` through `let sessionToken: string;` with original indentation
   - **Indentation of surrounding code:** (number of spaces before `if (!adminUser) {`)

5. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-locations.md` with these sections:
   - **Target file:** `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`
   - **Insertion point:** line number of `let sessionToken: string;` (the new block inserts immediately before this line)
   - **old_string start line:** line number of `      if (!adminUser) {`
   - **old_string end line:** line number of `      let sessionToken: string;`

6. Verify both context files exist and are non-empty using Glob.

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-facts.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-locations.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts` exists on disk (confirmed via Glob)
- [ ] The string `[placeholder]` does not appear in either context file (confirmed via Grep)

---

## State Update
After all verification checks pass:
1. Set `flags.adminContextCollected = true` in STATE_FILE
2. Move `"step-01-collect-admin-context"` from `pendingSteps` to `completedSteps`
3. Append to `artifacts.filesWritten`:
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-facts.md`
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\admin-locations.md`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.adminContextCollected, pendingSteps, completedSteps, artifacts.filesWritten)
