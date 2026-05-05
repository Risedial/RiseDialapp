---
description: Run the vision-risedial-01 build pipeline. Executes the next pending step, verifies state advancement, and loops up to SESSION_BUDGET steps. Resume anytime with /run-vision-risedial-01.
allowed-tools: Read Write Agent Bash
---

You are executing the /run-vision-risedial-01 build runner.

## Configuration

SESSION_BUDGET = 6  # adjust: floor(context_limit / avg_prompt_complexity)
STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json
ORCHESTRATION_DIR = C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration
TOTAL_STEPS = 17
WORKSPACE_ROOT = C:\Users\Alexb\Documents\RiseDialapp

IMPORTANT: WORKSPACE_ROOT above is the resolved absolute path written directly into this file. Do NOT run pwd or any shell command to derive it.

## Execution Loop

Execute the following loop:

1. Read STATE_FILE. Parse pendingSteps array and completedSteps array.
2. Initialize steps_this_session = 0.
3. If pendingSteps is empty: output "Build complete. All 17 steps finished." and stop.
4. LOOP — repeat while pendingSteps is not empty AND steps_this_session < SESSION_BUDGET:
   a. Set current_step = pendingSteps[0]
   b. Read ORCHESTRATION_DIR/[current_step].md in full.
   c. Spawn ONE Agent with the full contents of [current_step].md as the agent prompt. Substitute:
      - Any reference to WORKSPACE_ROOT → C:\Users\Alexb\Documents\RiseDialapp
      - Any reference to BUILD_DIR → C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build
   d. Wait for the agent to complete.
   e. Read STATE_FILE. Move current_step from pendingSteps to completedSteps. Set steps.[current_step].status = "complete". Write STATE_FILE with these mutations only — preserve all other fields.
   f. Increment steps_this_session by 1.
   g. Output: "Step [current_step] complete ([steps_this_session] of SESSION_BUDGET this session, [completedSteps.length] of 17 total)."
   h. Loop back to step 4a.
5. After loop exits:
   - If pendingSteps is empty: output "Build complete. All 17 steps finished."
   - If steps_this_session >= SESSION_BUDGET AND pendingSteps is not empty:
     Output: "Session budget reached (SESSION_BUDGET steps this session). [completedSteps.length]/17 steps complete. Resume: /run-vision-risedial-01"

## State File Write Format

When updating STATE_FILE, preserve ALL existing JSON fields. Only mutate:
- pendingSteps: remove current_step from the front of the array
- completedSteps: append current_step to the array
- steps.[current_step].status: set to "complete"
