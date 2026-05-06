# Prompt 07: Collect TypeScript Verification Output
**Mode:** COLLECT
**Step ID:** step-07-collect-verify-output

## Prerequisites
- `flags.memoryFixesApplied = true` in `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`
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

1. Read STATE_FILE at `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`. Verify `flags.memoryFixesApplied = true`. If false: stop and report "Prerequisite flag memoryFixesApplied is false — do not proceed until step-06 completes." Also verify `"step-07-collect-verify-output"` is in `pendingSteps`.

2. Run `npx tsc --noEmit` from `C:\Users\Alexb\Documents\RiseDialapp`. Capture the full stdout and stderr output and the exit code.

3. Record the result: exit code (0 = success, non-zero = errors), full output text (all lines).

4. Use Glob to verify each of these 6 files exists on disk:
   - `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`
   - `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

5. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-facts.md` with:
   - **TypeScript check result:** PASS (exit 0) or FAIL (exit non-zero)
   - **Exit code:** (exact integer)
   - **Full tsc output:** (paste complete output — empty string if no output on success)
   - **Timestamp:** (current date/time)
   - **Action required:** If exit code = 0: "Proceed to step-08." If non-zero: "TypeScript errors must be resolved before commit. Do not proceed to step-08 until npx tsc --noEmit exits 0. Errors listed above."

6. Write `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-locations.md` with:
   - **All 6 modified files and their existence status** (each on a line: path + "EXISTS" or "MISSING")
   - **Git status summary:** Run `git status --short` from project root and paste the output

---

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-facts.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-locations.md` exists and file size > 0 bytes (confirmed via Glob)
- [ ] verify-facts.md contains the string "Exit code:" with an integer value (not a placeholder)
- [ ] The string `[placeholder]` does not appear in either context file (confirmed via Grep)

---

## State Update
After all verification checks pass:
1. Set `flags.verifyOutputReady = true` in STATE_FILE
2. Move `"step-07-collect-verify-output"` from `pendingSteps` to `completedSteps`
3. Append to `artifacts.filesWritten`:
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-facts.md`
   - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\context\verify-locations.md`
4. Write STATE_FILE back with these changes (preserve all other fields exactly — mutate only flags.verifyOutputReady, pendingSteps, completedSteps, artifacts.filesWritten)
