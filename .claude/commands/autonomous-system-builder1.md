---
description: Builds a complete autonomous multi-step orchestration system for any objective. Accepts objective as inline text, file path, or folder path. Runs vision-alignment clarification then spawns sub-agents to generate state.json, context files, step plans, COLLECT/PLAN/EXECUTE prompt files, and a runner slash command.
allowed-tools: Read Write Bash Agent Glob Grep AskUserQuestion
---

## PHASE 0 — INPUT CAPTURE

Examine `$ARGUMENTS` and apply this detection order:

1. If `$ARGUMENTS` is empty: use `AskUserQuestion` — type free text — "What is the objective for this autonomous system? Describe what it should accomplish." Store the answer as OBJECTIVE.

2. If `$ARGUMENTS` ends in `.md`, `.txt`, `.json`, or contains a `/` or `\` character that resolves to an existing file: read the file with `Read`. Use the file contents as OBJECTIVE.

3. If `$ARGUMENTS` resolves to an existing directory: use `Glob` for `*.md` and `*.txt` inside it. Read the first result. Use its contents as OBJECTIVE.

4. Otherwise: treat `$ARGUMENTS` as inline text. Store verbatim as OBJECTIVE.

After capturing, print to user:
```
Objective captured: [first 300 chars of OBJECTIVE]... Beginning vision alignment.
```

---

## PHASE 1 — VISION ALIGNMENT

**CRITICAL: All 3 batches must complete before any Write call is issued. QC13 enforcement — no generation until alignment confirmed.**

### Batch 1 — Objective, type, stack

Ask the following 3 questions using `AskUserQuestion`:

**Q1 — type: free text**
"What does SUCCESS look like for this system? Describe the single observable outcome that proves it worked."

**Q2 — type: single-select**
"What type of system is this?"
Options:
- A) End-state — runs once to a defined completion (audit, migration, one-time transformation)
- B) Ongoing — runs repeatedly on new input indefinitely (monitoring, weekly processing, maintenance)
- C) Hybrid — one-time setup phase followed by recurring execution

**Q3 — type: single-select**
"What is the technology stack this system will operate on?"
Options:
- A) TypeScript / Next.js
- B) Python
- C) JavaScript / Node.js
- D) No code — content/data operations only
- E) Other (free text: "Describe the stack:")

Store answers as: Q1_SUCCESS, Q2_TYPE, Q3_STACK.

### Batch 2 — Constraints, scope, verification

Ask the following 3 questions using `AskUserQuestion`:

**Q4 — type: free text (multiline)**
"List files, folders, or systems this system must NEVER modify. One per line. Leave blank if none."

**Q5 — type: single-select**
"Approximately how many distinct steps does this objective require?"
Options:
- A) 3–6 steps (simple: one COLLECT→PLAN→EXECUTE cycle)
- B) 7–12 steps (moderate: two or three cycles)
- C) 13+ steps (complex: multiple cycles with multiple domains)
- D) Infer from the objective

**Q6 — type: single-select**
"What verification gate proves each code-modifying step completed correctly?"
Options:
- A) TypeScript: npx tsc --noEmit exits 0
- B) Python: pytest exits 0
- C) JavaScript: npm test exits 0
- D) No code changes — file creation/reads only
- E) Other (free text: "Specify the exact command:")

Store answers as: Q4_PROTECTED, Q5_STEPS, Q6_VERIFICATION.

### Batch 3 — Confirmation

Before asking Q7, display to user:
```
Alignment check before generation:

Objective: [OBJECTIVE truncated to 200 chars]
Success signal: [Q1_SUCCESS]
System type: [Q2_TYPE]
Tech stack: [Q3_STACK]
Steps estimate: [Q5_STEPS]
Verification gate: [Q6_VERIFICATION]
Protected files/folders: [Q4_PROTECTED or "None"]
```

**Q7 — type: single-select**
"Is this correct? Generation begins immediately after confirmation."
Options:
- A) Yes — begin generation
- B) No — let me revise

If Q7 = B: restart from Batch 1. Ask all questions again from Q1.
If Q7 = A: proceed to PHASE 2.

---

## PHASE 2 — SYSTEM DESIGN DERIVATION

Derive the DESIGN block. All sub-agents receive all values from this block. Derive each field using the rule specified:

```
SYSTEM_NAME
  Rule: take first 3–5 significant words from OBJECTIVE, convert to kebab-case
  Example: "fix all accessibility violations in Next.js app" → "accessibility-fix"

PROJECT_ROOT
  Rule: run Bash `pwd` to get the current absolute path at command invocation time

ORCH_DIR = [PROJECT_ROOT]/orchestration/[SYSTEM_NAME]
STATE_FILE = [ORCH_DIR]/state.json
CONTEXT_DIR = [ORCH_DIR]/context
PLANS_DIR = [ORCH_DIR]/plans
PROMPTS_DIR = [ORCH_DIR]/prompts

RUNNER_PATH
  Rule: check with Glob for .claude/commands/ in PROJECT_ROOT
        If .claude/commands/ exists: use [PROJECT_ROOT]/.claude/commands/run-[SYSTEM_NAME].md
        Otherwise: use [HOME]/.claude/commands/run-[SYSTEM_NAME].md

TOTAL_STEPS
  Derived from Q5_STEPS:
    A (3–6 steps)  → 6: collect-domain, plan-phase1, execute-phase1, collect-verify, plan-phase2, execute-phase2
    B (7–12 steps) → 9: three COLLECT→PLAN→EXECUTE cycles
    C (13+ steps)  → 12: four COLLECT→PLAN→EXECUTE cycles
    D (infer)      → analyze OBJECTIVE complexity: simple (one domain, clear scope) → 6; moderate → 9; complex → 12

SESSION_BUDGET = 6
  This is a hard constant. Never derive from user input. Always exactly 6.

STEP_IDS
  Rule: array of strings, format "step-NN-mode-task"
    NN: zero-padded number starting at 01
    mode: collect | plan | execute (must strictly alternate collect→plan→execute, repeat for each cycle)
    task: 1–3 word kebab-case description derived from OBJECTIVE for what this specific step does
  Sequence enforced: collect → plan → execute → collect → plan → execute (repeat per cycle)
  Example for TOTAL_STEPS=6:
    ["step-01-collect-codebase", "step-02-plan-audit-fix", "step-03-execute-fix",
     "step-04-collect-verify", "step-05-plan-commit", "step-06-execute-commit"]

FLAG_NAMES
  Rule: 3–5 domain-specific camelCase names derived from OBJECTIVE nouns
  Must reflect actual task milestones — never generic names like "task1Done" or "step3Complete"
  Always include "allChangesCommitted" as the last flag
  Example: ["codebaseVerified", "auditComplete", "fixesApplied", "allChangesCommitted"]

CONTEXT_FILES
  One per COLLECT step: [CONTEXT_DIR]/[domain]-facts.md, [CONTEXT_DIR]/[domain]-locations.md
  Domain derived from what that COLLECT step researches based on OBJECTIVE and step task

PLAN_FILES
  One per PLAN step: [PLANS_DIR]/[NN]-[task]-plan.md (NN matches the plan step number)

VERIFICATION_GATE
  Derived from Q6_VERIFICATION:
    A → "npx tsc --noEmit"
    B → "pytest"
    C → "npm test"
    D → "File exists and is non-empty"
    E → [exact text from Q6 free-text field]

PROTECTED_FILES
  Parsed from Q4_PROTECTED — one path per line — or empty list if blank

SYSTEM_TYPE
  Derived from Q2_TYPE:
    A → "end-state"
    B → "ongoing"
    C → "hybrid"
```

After deriving all fields, print the full DESIGN block to the user with all resolved values (no bracket placeholders — all values must be concrete).

Then state: "System design derived. Creating directory structure and spawning generation agents."

---

## PHASE 3 — DIRECTORY SETUP

1. Run `Bash`:
   ```bash
   mkdir -p [ORCH_DIR]/context [ORCH_DIR]/plans [ORCH_DIR]/prompts
   ```
   (Interpolate ORCH_DIR with the actual absolute path derived in PHASE 2 — no brackets in the command.)

2. Verify with `Glob` for `[ORCH_DIR]/**` — confirm context, plans, and prompts subdirectories appear in results.

3. Read all 4 reference schema files using `Read`:
   - `.claude/commands/autonomous-system-builder/state-schema.md` → store as SCHEMA_STATE
   - `.claude/commands/autonomous-system-builder/prompt-schema.md` → store as SCHEMA_PROMPT
   - `.claude/commands/autonomous-system-builder/runner-schema.md` → store as SCHEMA_RUNNER
   - `.claude/commands/autonomous-system-builder/principles.md` → store as SCHEMA_PRINCIPLES

**Validation gate:** All 4 Read calls must succeed. If any schema file is missing: stop and report:
```
Missing reference schema: [filename]. Re-run /autonomous-system-builder after restoring the autonomous-system-builder/ reference folder.
```

---

## PHASE 4 — PARALLEL AGENT SPAWN

**Spawn all 5 agents simultaneously in a single batch using the `Agent` tool. Do not wait for one to complete before spawning the next — all 5 are spawned in parallel. All inter-agent communication travels via files on disk — no agent waits for another's in-memory output.**

Before spawning, interpolate every [BRACKETED] placeholder in each sub-agent prompt below with the resolved values from the DESIGN block. No sub-agent receives unresolved brackets in its prompt.

### Sub-agent 1 — State Files

Prompt (interpolate all DESIGN values before passing):

```
You are generating two control files for an autonomous orchestration system. Write both files completely. No abbreviations.

SYSTEM_NAME: [SYSTEM_NAME]
PROJECT_ROOT: [PROJECT_ROOT]
ORCH_DIR: [ORCH_DIR]
STATE_FILE: [STATE_FILE]
TOTAL_STEPS: [TOTAL_STEPS]
SESSION_BUDGET: 6
STEP_IDS: [STEP_IDS as JSON array — all values resolved, no brackets]
FLAG_NAMES: [FLAG_NAMES as JSON array — all values resolved, no brackets]
SYSTEM_TYPE: [SYSTEM_TYPE]
OBJECTIVE: [OBJECTIVE]

STATE_SCHEMA_REFERENCE:
[SCHEMA_STATE — full file content]

## File 1: state.json

Write [STATE_FILE] with these contents — all bracketed tokens replaced with real values:

{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "[SYSTEM_NAME]",
  "buildTarget": "[PROJECT_ROOT]",
  "orchestration_dir": "[ORCH_DIR]",
  "completedSteps": [],
  "pendingSteps": [all STEP_IDS as JSON array],
  "artifacts": {
    "filesWritten": [],
    "plansCreated": []
  },
  "flags": {
    [each FLAG_NAME as "name": false — one per line]
    "allChangesCommitted": false
  },
  "knownItems": {}
}

After writing: verify that completedSteps.length + pendingSteps.length = [TOTAL_STEPS]. If not equal, recount STEP_IDS and fix pendingSteps before writing.

## File 2: step-plan.json

Write [ORCH_DIR]/step-plan.json:

{
  "version": "1.0.0",
  "system": "[SYSTEM_NAME]",
  "total_steps": [TOTAL_STEPS],
  "session_budget": 6,
  "steps": [
    {
      "id": "[step-id]",
      "mode": "COLLECT | PLAN | EXECUTE",
      "task": "[brief description of what this step does]",
      "prompt_file": "[PROMPTS_DIR]/prompt-[NN].md",
      "outputs": ["[files this step produces — absolute paths]"],
      "prerequisites": ["[flag names that must be true before this step]"]
    }
    ... one entry per step in STEP_IDS order
  ]
}

Rules for step-plan.json:
- mode field must match the mode component of the step-id exactly (collect|plan|execute → COLLECT|PLAN|EXECUTE)
- Every EXECUTE step must list the flag set by its preceding PLAN step as a prerequisite
- Every step after step-01 must have at least one prerequisite flag
- outputs for COLLECT: list context/ files to be created; for PLAN: list plans/ files; for EXECUTE: list app code files expected to change
- All prompt_file paths are absolute

Report when done: "State files written: [STATE_FILE] ([TOTAL_STEPS] steps), [ORCH_DIR]/step-plan.json"
```

### Sub-agent 2 — COLLECT Prompt Files

Prompt (interpolate all DESIGN values before passing):

```
You are generating COLLECT-mode prompt files for an autonomous orchestration system.

SYSTEM_NAME: [SYSTEM_NAME]
OBJECTIVE: [OBJECTIVE]
ORCH_DIR: [ORCH_DIR]
STATE_FILE: [STATE_FILE]
CONTEXT_DIR: [CONTEXT_DIR]
PROMPTS_DIR: [PROMPTS_DIR]
PROJECT_ROOT: [PROJECT_ROOT]
VERIFICATION_GATE: [VERIFICATION_GATE]
PROTECTED_FILES: [PROTECTED_FILES]
PLANS_DIR: [PLANS_DIR]
COLLECT_STEP_IDS: [STEP_IDS filtered to steps where mode=collect — e.g., ["step-01-collect-codebase", "step-04-collect-verify"]]
CONTEXT_FILES: [CONTEXT_FILES — each file with absolute path, one per COLLECT step]

PROMPT_SCHEMA_REFERENCE:
[SCHEMA_PROMPT — full file content]

PRINCIPLES_REFERENCE:
[SCHEMA_PRINCIPLES — full file content]

For each step ID in COLLECT_STEP_IDS, write one prompt file to [PROMPTS_DIR]/prompt-[NN].md where NN matches the step number.

Each file must follow the canonical prompt file schema from PROMPT_SCHEMA_REFERENCE exactly, with these specifics:

Mode: COLLECT
Hard Constraints mode lock: "Write only to [CONTEXT_DIR] — no other directories."
STATE_FILE constant: [STATE_FILE — absolute path, no brackets]
CONTEXT_DIR constant: [CONTEXT_DIR — absolute path, no brackets]

Task section: write 5–7 numbered sub-steps derived from OBJECTIVE that this COLLECT step should accomplish:
  1. Read STATE_FILE. Verify this step ID is in pendingSteps. If not, stop and report "[step-id] is not in pendingSteps — cannot proceed."
  2. Locate all relevant source files using Glob patterns derived from OBJECTIVE
  3. Read each located file; extract specific patterns, function names, line numbers relevant to the objective
  4. Record findings with verbatim quotes and exact line numbers — no paraphrase
  5. Write findings to [CONTEXT_DIR]/[domain]-facts.md as immutable reference (write completely — no truncation)
  6. Write a second context file [CONTEXT_DIR]/[domain]-locations.md listing every exact target with absolute path and line number

For step-01 specifically: Prerequisites section = "None. This is the first step."
For subsequent COLLECT steps: Prerequisites section lists the flag set by the preceding EXECUTE step (derive from FLAG_NAMES).

Verification section — 3 binary items:
  - [CONTEXT_DIR]/[domain]-facts.md exists and file size > 0 bytes (verify with Glob)
  - Every file path listed in facts.md resolves to an existing file on disk (verify each with Glob)
  - The string "[placeholder]" does not appear in any context file written this step (Grep to confirm)

State Update section (must be the last section):
  - Set flags.[relevantFlag] = true (use the FLAG_NAME from FLAG_NAMES that corresponds to this collect step — derive from FLAG_NAMES array position)
  - Move "[step-id]" from pendingSteps to completedSteps
  - Append each context file written to artifacts.filesWritten (absolute paths)
  - Write STATE_FILE back (preserve all other fields exactly — mutate only the 3 fields listed above)

Report when all COLLECT prompts are written: "COLLECT prompts written: [list of file paths]"
```

### Sub-agent 3 — PLAN Prompt Files

Prompt (interpolate all DESIGN values before passing):

```
You are generating PLAN-mode prompt files for an autonomous orchestration system.

SYSTEM_NAME: [SYSTEM_NAME]
OBJECTIVE: [OBJECTIVE]
ORCH_DIR: [ORCH_DIR]
STATE_FILE: [STATE_FILE]
CONTEXT_DIR: [CONTEXT_DIR]
PLANS_DIR: [PLANS_DIR]
PROMPTS_DIR: [PROMPTS_DIR]
PROTECTED_FILES: [PROTECTED_FILES]
PLAN_STEP_IDS: [STEP_IDS filtered to steps where mode=plan — e.g., ["step-02-plan-audit-fix", "step-05-plan-commit"]]
CONTEXT_FILES: [CONTEXT_FILES — each file with absolute path]
PLAN_FILES: [PLAN_FILES — each file with absolute path]

PROMPT_SCHEMA_REFERENCE:
[SCHEMA_PROMPT — full file content]

For each step ID in PLAN_STEP_IDS, write one prompt file to [PROMPTS_DIR]/prompt-[NN].md where NN matches the step number.

Mode: PLAN
Hard Constraints mode lock: "Write only to [PLANS_DIR] — no other directories."
STATE_FILE constant: [STATE_FILE — absolute path, no brackets]
PLANS_DIR constant: [PLANS_DIR — absolute path, no brackets]

Prerequisites section: list the flag set by the immediately preceding COLLECT step (derive from FLAG_NAMES — the flag corresponding to the COLLECT step that precedes this PLAN step in STEP_IDS order). List the context files that COLLECT step wrote.

Task section — 5–6 numbered sub-steps:
  1. Read STATE_FILE. Verify all prerequisite flags are true. If any is false: stop and report "Prerequisite flag [flag-name] is false — do not proceed until preceding step completes."
  2. Read [context files from the corresponding COLLECT step — list each with absolute path].
  3. From context, identify exact targets: absolute file paths, function names, line numbers. All identifiers from context files — never from memory.
  4. Write [PLANS_DIR]/[NN]-[task]-plan.md with these exact fields:
     - **Scope:** what will change (specific files and functions — no vague descriptions)
     - **Before state:** verbatim quote from source file (exact characters, not a description)
     - **After state:** exact target content after the change
     - **Target file:** absolute path (confirmed from context file)
     - **Target location:** line number or function name (confirmed from context file)
     - **Verification test:** exact command or assertion the EXECUTE step will run to confirm success
     - **DO NOT TOUCH:** [PROTECTED_FILES — repeat each path here]
  5. Verify: read the actual target file and confirm the Before state verbatim quote appears in it exactly. If not found: stop and report "Before state does not match target file — context file may be stale."

Verification section:
  - [PLANS_DIR]/[NN]-[task]-plan.md exists and file size > 0 bytes (Glob to confirm)
  - Plan file contains a "Before state" field with a verbatim quote (not a description)
  - Plan file contains an "After state" field with exact target content
  - Target file path named in plan exists on disk (Glob to confirm)

State Update section (must be the last section):
  - Set flags.[planCompleteFlag] = true (the FLAG_NAME corresponding to this plan step)
  - Move "[step-id]" from pendingSteps to completedSteps
  - Append plan file path to artifacts.plansCreated
  - Write STATE_FILE back (preserve all other fields exactly)

Report: "PLAN prompts written: [list of file paths]"
```

### Sub-agent 4 — EXECUTE Prompt Files

Prompt (interpolate all DESIGN values before passing):

```
You are generating EXECUTE-mode prompt files for an autonomous orchestration system.

SYSTEM_NAME: [SYSTEM_NAME]
OBJECTIVE: [OBJECTIVE]
ORCH_DIR: [ORCH_DIR]
STATE_FILE: [STATE_FILE]
PLANS_DIR: [PLANS_DIR]
PROMPTS_DIR: [PROMPTS_DIR]
PROJECT_ROOT: [PROJECT_ROOT]
CONTEXT_DIR: [CONTEXT_DIR]
VERIFICATION_GATE: [VERIFICATION_GATE]
PROTECTED_FILES: [PROTECTED_FILES]
EXECUTE_STEP_IDS: [STEP_IDS filtered to steps where mode=execute — e.g., ["step-03-execute-fix", "step-06-execute-commit"]]
PLAN_FILES: [PLAN_FILES — each file with absolute path]

PROMPT_SCHEMA_REFERENCE:
[SCHEMA_PROMPT — full file content]

For each step ID in EXECUTE_STEP_IDS, write one prompt file to [PROMPTS_DIR]/prompt-[NN].md where NN matches the step number.

Mode: EXECUTE
Hard Constraints mode lock: "Write only to application code in [PROJECT_ROOT]. Do NOT write to [CONTEXT_DIR], [PLANS_DIR], or [PROMPTS_DIR]."
STATE_FILE constant: [STATE_FILE — absolute path, no brackets]

DO NOT TOUCH (list each explicitly in Hard Constraints):
[PROTECTED_FILES — each on its own line with absolute path]

Prerequisites section: list the flag set by the immediately preceding PLAN step (derive from FLAG_NAMES).
Files to read: [corresponding PLANS_DIR plan file — absolute path].

Task section — these 6 steps are mandatory in this exact order for every EXECUTE prompt:
  1. Verify plan file [corresponding plan file absolute path] exists. Run Glob for that exact path. If not found: stop and report "Plan file missing at [path]. Cannot execute without a verified plan. Do not proceed."
  2. Read the plan file at [corresponding plan file absolute path]. Record the exact Before state and After state fields verbatim.
  3. Read the target source file specified in the plan's "Target file" field. Confirm its current content contains the plan's Before state character-for-character. If it does not match: stop and report "Source file does not match plan's Before state. Discrepancy must be investigated before execution. Do not attempt to resolve independently."
  4. Apply the change described in the plan's After state to the target file. Write the complete file — no truncation.
  5. Run [VERIFICATION_GATE]. If it exits with errors: fix them before proceeding. This step cannot complete with errors remaining.
  6. Read the target file again. Confirm it now contains the exact After state from the plan.

Stop and report any discrepancy between plan and reality — never attempt to resolve independently.

Verification section:
  - Target file contains exact After state content from the plan (Read the file and confirm the exact text is present)
  - `[VERIFICATION_GATE]` exits with code 0
  - No protected file was modified: run `git diff --name-only` and confirm none of [PROTECTED_FILES] appear in the output

State Update section (must be the last section):
  - Set flags.[executeCompleteFlag] = true (the FLAG_NAME corresponding to this execute step)
  - Move "[step-id]" from pendingSteps to completedSteps
  - Append each modified file's absolute path to artifacts.filesWritten
  - Write STATE_FILE back (preserve all other fields exactly)

Report: "EXECUTE prompts written: [list of file paths]"
```

### Sub-agent 5 — Runner Slash Command

Prompt (interpolate all DESIGN values before passing):

```
You are generating the runner slash command for an autonomous orchestration system.

SYSTEM_NAME: [SYSTEM_NAME]
OBJECTIVE: [OBJECTIVE]
STATE_FILE: [STATE_FILE — absolute path, no brackets]
PROMPTS_DIR: [PROMPTS_DIR — absolute path, no brackets]
PLANS_DIR: [PLANS_DIR — absolute path, no brackets]
CONTEXT_DIR: [CONTEXT_DIR — absolute path, no brackets]
PROJECT_ROOT: [PROJECT_ROOT — absolute path, no brackets]
TOTAL_STEPS: [TOTAL_STEPS — integer, no brackets]
SESSION_BUDGET: 6
STEP_IDS: [STEP_IDS — full array with all values resolved, no brackets]
SYSTEM_TYPE: [SYSTEM_TYPE]
RUNNER_PATH: [RUNNER_PATH — absolute path, no brackets]

RUNNER_SCHEMA_REFERENCE:
[SCHEMA_RUNNER — full file content]

Write [RUNNER_PATH] with this exact content — every [bracket] placeholder replaced with the real resolved value from above. No bracket placeholders may remain in the Configuration section, Completion Block, or Next-Session Block.

---
description: Runs [SYSTEM_NAME] orchestration system. Resumes from last completed step. Invoke: /run-[SYSTEM_NAME]
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

## Configuration
SESSION_BUDGET  = 6
STATE_FILE      = [STATE_FILE — literal absolute path, no brackets]
PROMPTS_DIR     = [PROMPTS_DIR — literal absolute path, no brackets]
PLANS_DIR       = [PLANS_DIR — literal absolute path, no brackets]
TOTAL_STEPS     = [TOTAL_STEPS — literal integer, no brackets]

## Anti-Hallucination Protocol
Run this check before spawning ANY EXECUTE-mode step agent:
1. Confirm the plan file for this step exists: Glob for the plan file path in PLANS_DIR
2. Read the plan file — verify the "Target file" path it names exists on disk: Glob for that path
3. If check 1 fails: spawn a COLLECT agent with this prompt: "Read [STATE_FILE]. The plan file [expected plan path] is missing. Locate [the target described in the objective] in [PROJECT_ROOT]. Write findings to [CONTEXT_DIR]/relocation-[step-id].md. Then regenerate the plan file at [expected plan path] with Before state, After state, Target file, Target location, and Verification test fields."
4. If check 2 fails: spawn a COLLECT agent with this prompt: "Read [STATE_FILE]. The target file named in [plan file path] cannot be found on disk. Locate the current path for [target description from objective] in [PROJECT_ROOT]. Update [plan file path] with the correct absolute path."
5. After any recovery spawn completes: re-run checks 1 and 2. If they now pass: proceed to spawn the EXECUTE agent. If they fail again: stop and report to user.

## Execution Loop
1. Read STATE_FILE at [STATE_FILE — literal path]. Parse completedSteps and pendingSteps arrays.
2. steps_this_session = 0
3. If pendingSteps is empty: print Completion Block and stop.
4. LOOP — repeat while pendingSteps is not empty AND steps_this_session < 6:
   a. current_step = pendingSteps[0]
   b. Find the prompt file in PROMPTS_DIR whose Step ID header matches current_step exactly
   c. Read that prompt file in full
   d. Determine mode: if current_step contains "-execute-": run Anti-Hallucination Protocol before step e
   e. Spawn ONE Agent tool call with the full prompt file contents as the prompt
   f. Wait for agent to complete
   g. Read STATE_FILE again. Verify current_step now appears in completedSteps. If it is still in pendingSteps: stop and report "Step [current_step] did not update state.json on completion. Manual inspection required."
   h. steps_this_session = steps_this_session + 1
   i. Print: "✓ [current_step] complete — [steps_this_session]/6 this session, [completedSteps.length]/[TOTAL_STEPS — literal integer] total"
5. After loop ends:
   If pendingSteps is empty: print Completion Block
   If steps_this_session = 6 and pendingSteps is not empty: print Next-Session Block

## Completion Block
=====================================
✅ [SYSTEM_NAME] COMPLETE
=====================================
[If SYSTEM_TYPE is "end-state": print "Objective achieved: [OBJECTIVE — first 120 chars]" and "All [TOTAL_STEPS] steps completed. Review artifacts: see state.json > artifacts section"]
[If SYSTEM_TYPE is "ongoing": print "Cycle complete. [TOTAL_STEPS] steps run." and "Run again for next cycle: /run-[SYSTEM_NAME]"]
[If SYSTEM_TYPE is "hybrid": print "Setup phase complete. Invoke /run-[SYSTEM_NAME] to begin recurring execution."]

## Next-Session Block
=====================================
⏸ SESSION BUDGET REACHED (6/6 steps this session)
=====================================
Progress: [completedSteps.length — evaluated at print time]/[TOTAL_STEPS] steps complete.
Open a NEW chat and paste this exact command:
/run-[SYSTEM_NAME]

## State File Write Rules
Preserve all fields. Mutate only these:
- pendingSteps: remove the current step from the front of the array
- completedSteps: append the current step to the end of the array
- flags: set the flag corresponding to the completed step to true (reference step-plan.json for flag-to-step mapping)
Do not modify: version, bootstrap_complete, project, buildTarget, orchestration_dir, artifacts, knownItems

After writing: Read [RUNNER_PATH]. Verify it contains no unresolved [bracket] placeholders in the Configuration section, Completion Block, or Next-Session Block. If any found: replace them with the resolved values from the inputs above.

Report when done: "Runner written to [RUNNER_PATH]"
```

---

## PHASE 5 — VALIDATION

Wait for all 5 sub-agents to complete. Then run all 13 QC checks in order. For each failure, fix inline before proceeding to the next check.

### QC1 — Mode header match
Action: for each prompt file in PROMPTS_DIR, read its Mode header. Read step-plan.json. Compare the mode field.
Pass: every prompt file's Mode header matches the mode field in step-plan.json exactly (COLLECT/PLAN/EXECUTE — uppercase).
Fail: rewrite the prompt file's Mode header to match step-plan.json.

### QC2 — Mode lock specificity
Action: for each prompt file, read the Hard Constraints section. Find Hard Constraint #1 (the mode lock).
Pass: exactly one directory is named for writing (either CONTEXT_DIR, PLANS_DIR, or PROJECT_ROOT — not a combination).
Fail: rewrite Hard Constraint #1 to name only the correct single directory for that step's mode.

### QC3 — PLAN precedes EXECUTE
Action: read step-plan.json. For each EXECUTE step, confirm the step immediately before it in the steps array has mode = PLAN.
Pass: every EXECUTE step has an immediately preceding PLAN step.
Fail: re-order the steps array and update state.json pendingSteps array to match.

### QC4 — EXECUTE task starts with verify
Action: for each EXECUTE prompt file, read the Task section. Check step 1.
Pass: step 1 of Task contains "Verify plan file" and "if not" and "stop and report".
Fail: prepend the correct step 1 text to the Task section.

### QC5 — Binary verification items only
Action: for each Verification section in every prompt file, read each checklist item.
Pass: no item contains the standalone words "correct", "appropriate", "looks right", or "seems" without an exact criterion following.
Fail: rewrite failing items to name an exact expected value (filename, flag name, exit code, or specific text string).

### QC6 — EXECUTE verification gate present
Action: for each EXECUTE prompt file, check that the VERIFICATION_GATE command appears in the Verification section.
Pass: the VERIFICATION_GATE command appears as a checklist item in the Verification section.
Fail: add "- [ ] `[VERIFICATION_GATE]` exits with code 0" to the Verification section.

### QC7 — State update completeness
Action: for each State Update section in every prompt file, check it contains: (1) exact flag name being set, (2) "from pendingSteps to completedSteps", (3) at least one artifact path appended to artifacts.filesWritten or artifacts.plansCreated.
Pass: all three are present.
Fail: rewrite the State Update section to include all three elements.

### QC8 — No placeholders in runner next-session block
Action: read RUNNER_PATH. Locate the Next-Session Block. Scan for any `[bracket]` patterns.
Pass: no bracket patterns found in the Next-Session Block.
Fail: replace each bracketed placeholder with the resolved value from the DESIGN block.

### QC9 — No unverified identifiers in prompts
Action: for each prompt file, scan the Task section for file paths, function names, or flag names not declared in that prompt's own Prerequisites or Hard Constraints sections.
Pass: all identifiers referenced in the Task section are declared locally in Prerequisites or Hard Constraints.
Fail: add the undeclared identifier to the Prerequisites section with the note "Confirmed from context file at [path]."

### QC10 — Anti-hallucination per EXECUTE spawn
Action: read RUNNER_PATH. Find all references to Anti-Hallucination Protocol. Confirm it is called conditionally inside the loop for EXECUTE steps — not once at startup or after the loop ends.
Pass: Anti-Hallucination Protocol is triggered inside the loop body, conditioned on the step mode being EXECUTE.
Fail: move the protocol check to the correct position inside the loop.

### QC11 — Step count invariant
Action: read STATE_FILE. Count completedSteps array length and pendingSteps array length.
Pass: their sum equals TOTAL_STEPS.
Fail: recount STEP_IDS. Rewrite the pendingSteps array in STATE_FILE to exactly match STEP_IDS (all steps should be in pendingSteps at bootstrap).

### QC12 — Bootstrap wrote files only
Action: confirm that no application code files in PROJECT_ROOT were Read or Modified during this generation session.
Pass: all file writes during this session were under ORCH_DIR and RUNNER_PATH only.
Fail: report "QC12 FAILED: application code was touched during bootstrap. Manual review required."

### QC13 — Clarification before generation
Action: confirm all AskUserQuestion calls (Q1–Q7) completed before the first Write tool call.
Pass: conversation ordering shows Q7 confirmation before any Write.
Fail: report "QC13 FAILED: generation began before alignment confirmed. Review command for PHASE ordering."

After all 13 pass: proceed to PHASE 6.

---

## PHASE 6 — COMPLETION REPORT

Print:

```
=====================================
✅ ORCHESTRATION SYSTEM BUILT
=====================================
System:    [SYSTEM_NAME]
Objective: [OBJECTIVE — first 150 chars]
Type:      [SYSTEM_TYPE]
Steps:     [TOTAL_STEPS]

Files generated:
  [STATE_FILE]
  [ORCH_DIR]/step-plan.json
  [PROMPTS_DIR]/prompt-01.md
  [PROMPTS_DIR]/prompt-02.md
  [list all prompt files]
  [RUNNER_PATH]

To run now:
  /run-[SYSTEM_NAME]

To resume after session budget in any future session:
  Open new chat → /run-[SYSTEM_NAME]
=====================================
```
