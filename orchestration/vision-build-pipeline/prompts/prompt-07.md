# Prompt 07: Collect Design Review
**Mode:** COLLECT
**Step ID:** step-07-collect-design-review

## Prerequisites
- flags.integrationDocWritten = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- File to read: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md

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

1. Read STATE_FILE. Verify "step-07-collect-design-review" is in pendingSteps. If not, stop and report. Verify flags.integrationDocWritten = true. If false, stop and report "Prerequisite flag integrationDocWritten is false — do not proceed until step-06 completes."

2. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md completely. If missing, stop and report "integrated-design.md not found."

3. Extract from integrated-design.md with verbatim quotes every requirement for the vision-build-pipeline.md command file:
   - Every phase name, number, and description
   - Every agent spawning pattern (serial vs parallel, conditions)
   - Every schema structure (state file, module manifest, context catalog, etc.)
   - Every verification requirement (all 18 Step 5 check items verbatim)
   - Every constant (SESSION_BUDGET, budget formula, threshold values)
   - Every "must never" / "must always" directive
   - The complete VISION.md template (all 10 sections)
   - The complete docs folder structure
   - The complete setup-state.json schema with all fields
   - Every gap resolution mechanism (no AskUserQuestion, no TBD, derive from codebase)
   - The self-heal mechanism specification
   - The runner command body specification (Configuration, Anti-Hallucination, Loop, Completion Block, Next-Session Block)

4. Record all findings with verbatim quotes and exact locations. Never paraphrase.

5. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-facts.md with all extracted requirements organized by section. Write complete file — no truncation.

6. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-locations.md listing every requirement with its exact section in integrated-design.md and verbatim quote.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-facts.md exists and file size > 0 bytes (Glob to confirm)
- [ ] design-facts.md contains: VISION.md template (10 sections), docs folder structure, setup-state.json schema, all 18 Step 5 verification items (Read and verify each is present)
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-locations.md exists and file size > 0 bytes (Glob to confirm)
- [ ] The string "[placeholder]" does not appear in any context file written this step (Grep to confirm)

---

## State Update
After all 4 verification checks pass:
1. Set flags.designReviewCollected = true in state.json
2. Move "step-07-collect-design-review" from pendingSteps to completedSteps
3. Append to artifacts.filesWritten:
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\design-facts.md"
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\design-locations.md"
4. Write STATE_FILE back preserving all other fields exactly
