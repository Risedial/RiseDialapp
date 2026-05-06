---
description: Runs risedial-implementation-plan orchestration system. Resumes from last completed step. Invoke: /run-risedial-implementation-plan
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

## Configuration
SESSION_BUDGET  = 6
STATE_FILE      = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json
PROMPTS_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\prompts
PLANS_DIR       = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans
TOTAL_STEPS     = 9

## Anti-Hallucination Protocol
Run this check before spawning ANY EXECUTE-mode step agent:
1. Confirm the plan file for this step exists: Glob for the plan file path in PLANS_DIR (C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans)
2. Read the plan file — verify the "Target file" path it names exists on disk: Glob for that path
3. If check 1 fails (plan file missing): spawn a COLLECT agent with this prompt: "Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json. The plan file for the current EXECUTE step is missing from C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans. Re-collect context from C:\Users\Alexb\Documents\RiseDialapp and write the missing plan file with Before state, After state, Target file, Target location, and Verification test fields to the correct path in C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\plans."
4. If check 2 fails (target file not on disk): spawn a COLLECT agent with this prompt: "Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json. The target file named in the current plan cannot be found on disk. Locate the current path for the target in C:\Users\Alexb\Documents\RiseDialapp and update the plan file with the correct absolute path."
5. After any recovery spawn completes: re-run checks 1 and 2. If they now pass: proceed to spawn the EXECUTE agent. If they fail again: stop and report to user.

## Execution Loop
1. Read STATE_FILE at `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json`. Parse `completedSteps` and `pendingSteps` arrays.
2. Set steps_this_session = 0
3. If pendingSteps is empty: print Completion Block and stop.
4. LOOP — repeat while pendingSteps is not empty AND steps_this_session < 6:
   a. current_step = pendingSteps[0]
   b. Find the prompt file in `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\prompts` whose **Step ID** header matches current_step exactly (e.g., current_step = "step-03-execute-admin-fixes" → read prompt-03.md)
   c. Read that prompt file in full
   d. If current_step contains "-execute-": run Anti-Hallucination Protocol before step e
   e. Spawn ONE Agent tool call with the full prompt file contents as the prompt
   f. Wait for the agent to complete
   g. Read STATE_FILE again. Verify current_step now appears in completedSteps. If it is still in pendingSteps: stop and report "Step [current_step] did not update state.json on completion. Manual inspection required before continuing."
   h. steps_this_session = steps_this_session + 1
   i. Print: "✓ [current_step] complete — [steps_this_session]/6 this session, [completedSteps.length]/9 total"
5. After loop ends:
   - If pendingSteps is empty: print Completion Block
   - If steps_this_session = 6 and pendingSteps is not empty: print Next-Session Block

## Completion Block
=====================================
✅ risedial-implementation-plan COMPLETE
=====================================
Objective achieved: RiseDial Implementation Plan — 7 code edits applied, npx tsc --noEmit passed, changes committed and pushed to main.
All 9 steps completed.
Review artifacts: see C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-implementation-plan\state.json > artifacts section

## Next-Session Block
=====================================
⏸ SESSION BUDGET REACHED (6/6 steps this session)
=====================================
Progress: see state.json for current completedSteps count out of 9 total steps.
Open a NEW chat and paste this exact command:
/run-risedial-implementation-plan

## State File Write Rules
Preserve all fields. Mutate only these:
- pendingSteps: remove the current step from the front of the array
- completedSteps: append the current step to the end of the array
- flags: set the flag corresponding to the completed step to true (reference step-plan.json for flag-to-step mapping)
Do not modify: version, bootstrap_complete, project, buildTarget, orchestration_dir, artifacts, knownItems
