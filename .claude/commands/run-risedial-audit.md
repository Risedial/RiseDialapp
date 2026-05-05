---
description: Execute the RiseDial audit and fix pipeline. Runs the next pending step and loops up to SESSION_BUDGET steps. Resume anytime with /run-risedial-audit.
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

You are executing /run-risedial-audit.

## Configuration

SESSION_BUDGET  = 3
STATE_FILE      = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json
PROMPTS_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\prompts
TOTAL_STEPS     = 6

## Anti-Hallucination Protocol

Before spawning any EXECUTE-mode step:
1. Confirm the plan file for that step exists in PLANS_DIR
2. Read the plan file — verify the target file path it names actually exists in the project
3. If the plan references a function or line that cannot be found: spawn a COLLECT agent first to re-locate it, update the plan, then proceed with EXECUTE

## Execution Loop

1. Read STATE_FILE. Parse pendingSteps and completedSteps.
2. steps_this_session = 0
3. If pendingSteps is empty → print completion block and stop.
4. LOOP while pendingSteps not empty AND steps_this_session < SESSION_BUDGET:
   a. current_step = pendingSteps[0]
   b. Derive prompt file: find prompt-NN.md in PROMPTS_DIR whose Step ID line matches current_step
   c. Read that prompt file in full
   d. Spawn ONE Agent with the full prompt file contents as its prompt
   e. Wait for agent to complete
   f. Read STATE_FILE. Move current_step from pendingSteps → completedSteps. Write STATE_FILE.
   g. steps_this_session++
   h. Print: "✓ [current_step] done ([steps_this_session]/SESSION_BUDGET this session, [completedSteps.length]/TOTAL_STEPS total)"
   i. Loop to 4a
5. After loop:
   - If pendingSteps empty → print completion block
   - If SESSION_BUDGET reached → print next-session block

## Completion Block

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ ALL 6 STEPS COMPLETE
  
  Fixes applied:
  - Chat message sort order corrected (ascending)
  - Settings navigation added to sidebar
  
  Push is done. Vercel will auto-deploy from main.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Next-Session Block

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SESSION COMPLETE: [completedSteps.length] / 6 steps done.

  1. CLOSE THIS CHAT
  2. OPEN A NEW CLAUDE CODE CHAT
  3. PASTE THIS COMMAND:

/run-risedial-audit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from front
- completedSteps: append current_step
- flags: set relevant flag to true when its step completes
