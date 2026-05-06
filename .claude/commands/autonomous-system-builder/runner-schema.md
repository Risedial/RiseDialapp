# Runner Slash Command Schema

---

## Canonical runner schema

```
---
description: [One sentence: what it does, that it's resumable, how to invoke]
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

## Configuration
SESSION_BUDGET  = 3
STATE_FILE      = [absolute path to state.json]
PROMPTS_DIR     = [absolute path to prompts/]
PLANS_DIR       = [absolute path to plans/]
TOTAL_STEPS     = [N]

## Anti-Hallucination Protocol
Before spawning any EXECUTE-mode step:
1. Confirm the plan file for that step exists in PLANS_DIR
2. Read the plan file — verify the target file path it names exists on disk
3. If either check fails: spawn a COLLECT agent to re-locate the target, update the plan, then proceed

## Execution Loop
1. Read STATE_FILE. Parse pendingSteps and completedSteps.
2. steps_this_session = 0
3. If pendingSteps is empty → print completion block and stop.
4. LOOP while pendingSteps not empty AND steps_this_session < SESSION_BUDGET:
   a. current_step = pendingSteps[0]
   b. Find prompt file in PROMPTS_DIR whose Step ID matches current_step
   c. Read that prompt file in full
   d. [IF EXECUTE mode: run Anti-Hallucination Protocol before step e]
   e. Spawn ONE Agent with the full prompt file contents as its prompt
   f. Wait for agent to complete
   g. Read STATE_FILE. Verify current_step moved to completedSteps. If still in pendingSteps: report failure and stop.
   h. steps_this_session++
   i. Print: "✓ [current_step] done ([steps_this_session]/3 this session, [completedSteps.length]/[TOTAL_STEPS] total)"
5. If pendingSteps empty → print completion block
   If SESSION_BUDGET reached → print next-session block

## Completion Block
=====================================
✅ [SYSTEM_NAME] COMPLETE
=====================================
All [TOTAL_STEPS] steps completed.
Artifacts written: see state.json > artifacts.filesWritten

## Next-Session Block
=====================================
⏸ SESSION BUDGET REACHED
=====================================
Progress: [N]/[TOTAL_STEPS] steps complete.
Open a NEW chat and paste:
/run-[SYSTEM_NAME]

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from front
- completedSteps: append current_step
- flags: set relevant flag to true when its step completes
```

---

## Critical requirements

1. SESSION_BUDGET = 3 is a hard constant — never derive from user input
2. Next-Session Block must contain zero `[bracket]` variable placeholders — resolve all values before writing
3. Anti-Hallucination Protocol must appear inside the execution loop, triggered before each EXECUTE spawn — not once at startup
4. STATE_FILE, PROMPTS_DIR, PLANS_DIR values must be absolute paths with no variable placeholders
5. For ongoing systems (SYSTEM_TYPE = "ongoing"): Completion Block must instruct user to re-invoke the runner for the next cycle
6. For end-state systems (SYSTEM_TYPE = "end-state"): Completion Block must confirm the objective was achieved
