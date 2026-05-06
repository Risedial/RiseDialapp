---
description: Runs the vision-build-pipeline orchestration system. Executes the next pending step and loops up to 3 steps per session. Resumes from last completed step. Invoke: /run-vision-build-pipeline
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

## Configuration
SESSION_BUDGET  = 3
STATE_FILE      = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
PROMPTS_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\prompts
PLANS_DIR       = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans
CONTEXT_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context
TOTAL_STEPS     = 9
PROJECT_ROOT    = C:\Users\Alexb\Documents\RiseDialapp

## Execution Loop
1. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json. Parse completedSteps and pendingSteps arrays.
2. steps_this_session = 0
3. If pendingSteps is empty: print Completion Block and stop.
4. LOOP — repeat while pendingSteps is not empty AND steps_this_session < 3:
   a. current_step = pendingSteps[0]
   b. Find the prompt file in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\prompts whose Step ID header matches current_step exactly. Use Glob for prompt-NN.md files, then Read each to find the matching Step ID.
   c. Read that prompt file in full.
   d. Determine mode: if current_step contains "execute" in its name, run the Anti-Hallucination Protocol before step e:
      ANTI-HALLUCINATION PROTOCOL:
      i.   Glob for the expected plan file in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans that corresponds to current_step.
      ii.  Read the plan file. Locate the "Target file" field. Glob for that path. For new-file-creation steps: verify the TARGET DIRECTORY exists (not the file itself).
      iii. If check i fails (plan file missing): spawn ONE Agent with this prompt: "Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json. The plan file for step current_step is missing from C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans. Locate the relevant source files in C:\Users\Alexb\Documents\RiseDialapp using Glob and Read. Write a context file to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\relocation-[current_step].md. Then regenerate the plan file with Before state, After state, Target file, Target location, and Verification test fields." Then re-run checks i and ii. If both pass: proceed. If either still fails: stop and report to user.
      iv.  If check ii fails (target path not found): spawn ONE Agent with this prompt: "Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json. The target file named in the plan file for step current_step cannot be found at the path listed. Locate the correct current path within C:\Users\Alexb\Documents\RiseDialapp. Update the plan file with the correct absolute path." Then re-run checks i and ii. If both pass: proceed. If either still fails: stop and report to user.
   e. Spawn ONE Agent tool call with the full prompt file contents as the prompt.
   f. Wait for agent to complete.
   g. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json again. Verify current_step now appears in completedSteps array. If current_step is still in pendingSteps: stop and report "Step current_step did not update state.json on completion. Manual inspection required at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json."
   h. steps_this_session = steps_this_session + 1
   i. Print: "✓ current_step complete — steps_this_session/3 this session, completedSteps.length/9 total"
5. After loop ends:
   - If pendingSteps is empty: print Completion Block
   - If steps_this_session = 3 and pendingSteps is not empty: print Next-Session Block

## Completion Block
=====================================
✅ vision-build-pipeline COMPLETE
=====================================
Objective achieved: vision-build-pipeline.md has been written to C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md and all 9 steps completed.
All 9 steps completed. Review artifacts: see C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json > artifacts section.

To use the generated command:
  /vision-build-pipeline [PROJECT_DIR]

## Next-Session Block
=====================================
⏸ SESSION BUDGET REACHED (3/3 steps this session)
=====================================
Progress: see state.json completedSteps for current count out of 9 steps total.
Open a NEW chat and paste this exact command:
/run-vision-build-pipeline

## State File Write Rules
Preserve all fields in state.json. Mutate only these three:
- pendingSteps: remove current_step from the front of the array
- completedSteps: append current_step to the end of the array
- flags: set the flag corresponding to the completed step to true (reference C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\step-plan.json for the sets_flag field per step)
Do NOT modify: version, bootstrap_complete, project, buildTarget, orchestration_dir, artifacts, knownItems
