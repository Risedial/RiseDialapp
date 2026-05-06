# Prompt 04: Collect Analysis Results
**Mode:** COLLECT
**Step ID:** step-04-collect-analysis-results

## Prerequisites
- flags.analysisDocWritten = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- File to read: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md

---

## Hard Constraints

1. **Mode lock — COLLECT:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers confirmed from actual file reads — not from memory.

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
CONTEXT_DIR = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context

---

## Task

1. Read STATE_FILE at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json. Verify "step-04-collect-analysis-results" is in pendingSteps. If not, stop and report "step-04-collect-analysis-results is not in pendingSteps — cannot proceed." Verify flags.analysisDocWritten = true. If false, stop and report "Prerequisite flag analysisDocWritten is false — do not proceed until step-03 completes."

2. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md completely. If the file does not exist, stop and report "analysis.md not found at expected path — step-03 may not have completed successfully."

3. Extract from analysis.md with verbatim quotes:
   - Every overlap identified (features/mechanisms appearing in 2+ commands, which command implements each best and why)
   - Every conflict identified (incompatible design choices between commands, which approach was selected and why)
   - Every gap identified (capabilities missing from all 4 commands)
   - Every design decision reached in the integrated design section
   - Every specific value, constant, schema, or pattern that the integrated command must implement

4. Record all findings with verbatim quotes and exact section/line references from analysis.md. Never paraphrase — quote exactly.

5. Write ALL findings to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-facts.md with sections: Overlaps (N items), Conflicts (N items with resolution), Gaps (N items), Design Decisions (all explicit decisions), Key Constants and Values. Write complete file — no truncation.

6. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-locations.md listing: every section heading in analysis.md with exact location, every design decision with its location in analysis.md, every constant/value referenced with exact quote and location.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-facts.md exists and file size > 0 bytes (Glob to confirm)
- [ ] analysis-facts.md contains sections for Overlaps, Conflicts, Gaps, and Design Decisions (Read and verify each section heading is present)
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-locations.md exists and file size > 0 bytes (Glob to confirm)
- [ ] The string "[placeholder]" does not appear in any context file written in this step (Grep for "\[placeholder\]" in CONTEXT_DIR)

---

## State Update
After all 4 verification checks pass:
1. Set flags.analysisResultsCollected = true in state.json
2. Move "step-04-collect-analysis-results" from pendingSteps to completedSteps
3. Append to artifacts.filesWritten:
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\analysis-facts.md"
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\analysis-locations.md"
4. Write STATE_FILE back preserving all other fields exactly
