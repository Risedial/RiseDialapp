# Prompt 05: Plan Integration
**Mode:** PLAN
**Step ID:** step-05-plan-integration

## Prerequisites
- flags.analysisResultsCollected = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Context files to read:
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-facts.md
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-locations.md

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans — no other directories.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Write every file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All design decisions, constants, patterns, section names, and schema fields must come from context files — not from memory.
6. **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
PLANS_DIR = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans

---

## Task

1. Read STATE_FILE at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json.
   - Verify "step-05-plan-integration" is in pendingSteps. If it is not present in pendingSteps, stop immediately and report: "step-05-plan-integration is not in pendingSteps — already completed or not scheduled."
   - Verify flags.analysisResultsCollected = true. If false, stop immediately and report: "Prerequisite flag analysisResultsCollected is false — do not proceed until step-04 completes."

2. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-facts.md completely. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-locations.md completely.

3. From context files, identify the exact content needed for the integrated design document. The integrated design must answer all 7 design questions. The 7 questions are confirmed from analysis-facts.md — use the verbatim question text from that file. The questions correspond to the following concerns (each of which must be confirmed verbatim in analysis-facts.md before being written into the plan):
   - Q1: The vision capture self-answering loop mechanism
   - Q2: The docs structure connection between the vision-to-docs phase and the docs-to-build-v2 phase
   - Q3: The combined orchestration pattern integrating autonomous-system-builder with docs-to-build-v2
   - Q4: The unified state schema including the SESSION_BUDGET=6 constant
   - Q5: The hallucination prevention placement (context catalog and anti-hallucination protocol)
   - Q6: The resolution of the zero user interaction gap
   - Q7: The self-healing mechanism spanning all phases

   If any of the 7 questions are not present in analysis-facts.md verbatim, do not fabricate them — stop and report which questions are missing from the context file.

4. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md with the following exact fields. Every field below must appear in the written file with the exact heading shown:

   **Scope:**
   Write integrated-design.md at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md containing:
   - All 7 numbered design answers (Q1 through Q7), each with a complete specification derived from analysis-facts.md and analysis-locations.md.
   - The unified state schema confirmed from analysis-facts.md, including the SESSION_BUDGET=6 constant, all phase statuses, and session_count.
   - The complete VISION.md 10-section template confirmed from analysis-facts.md.
   - The complete docs folder structure confirmed from analysis-facts.md.
   - The self-heal mechanism specification confirmed from analysis-facts.md.
   - The runner body specification with SESSION_BUDGET=6 confirmed from analysis-facts.md.

   **Before state:**
   "File C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md does not exist"

   **After state:**
   integrated-design.md must contain all of the following sections with the following content:

   (a) ## Q1 — Vision Capture Self-Answering Loop
   Complete specification for the mechanism by which the vision capture phase produces structured, self-validating outputs. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q1" or begin with "## Q1".

   (b) ## Q2 — Docs Structure Connection
   Complete specification for how the documentation structure produced by vision-to-docs connects to and is consumed by docs-to-build-v2. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q2" or begin with "## Q2".

   (c) ## Q3 — Combined Orchestration Pattern
   Complete specification for the combined orchestration pattern integrating autonomous-system-builder with docs-to-build-v2. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q3" or begin with "## Q3".

   (d) ## Q4 — Unified State Schema
   Complete specification for the unified state schema including the SESSION_BUDGET=6 constant, all phase statuses, and session_count. The text "SESSION_BUDGET=6" must appear verbatim in this section. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q4" or begin with "## Q4".

   (e) ## Q5 — Hallucination Prevention Placement
   Complete specification for where the context catalog and anti-hallucination protocol are placed across the pipeline. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q5" or begin with "## Q5".

   (f) ## Q6 — Zero User Interaction Gap Resolution
   Complete specification for how the zero-user-interaction gap identified in the analysis phase is resolved in the integrated design. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q6" or begin with "## Q6".

   (g) ## Q7 — Self-Healing Mechanism
   Complete specification for the self-healing mechanism and how it spans all phases of the pipeline. All specification details must be derived verbatim from analysis-facts.md. The section heading must be exactly "## Q7" or begin with "## Q7".

   (h) ## Unified State Schema
   The complete state schema as confirmed from analysis-facts.md. Must include SESSION_BUDGET=6, session_count field, and all phase statuses.

   (i) ## VISION.md Template
   The complete 10-section VISION.md template as confirmed from analysis-facts.md. Must contain all 10 section headings.

   (j) ## Docs Folder Structure
   The complete docs folder structure as confirmed from analysis-facts.md.

   (k) ## Self-Heal Mechanism
   The complete self-heal mechanism specification as confirmed from analysis-facts.md.

   (l) ## Runner Body
   The complete runner body specification with SESSION_BUDGET=6 as confirmed from analysis-facts.md. The text "SESSION_BUDGET=6" must appear verbatim.

   **Target file:** C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md

   **Target location:** New file — does not exist yet. The OUTPUTS_DIR C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ must exist before writing. If it does not exist, create it before writing the file.

   **Verification test:**
   - Glob for integrated-design.md in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ confirms the file exists.
   - Read integrated-design.md and confirm it contains all 7 required Q-headings: a heading beginning with "## Q1", "## Q2", "## Q3", "## Q4", "## Q5", "## Q6", "## Q7".
   - Read integrated-design.md and confirm it contains the exact text "SESSION_BUDGET=6".
   - Read integrated-design.md and confirm file size > 0 bytes (content is present).

   **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

5. Since this is a new file creation (Before state = file does not exist), no "before state match" verification against an existing target file is needed. Instead, verify the plan file itself is complete:
   - Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md immediately after writing it.
   - Confirm it contains the heading "**Scope:**".
   - Confirm it contains the heading "**Before state:**".
   - Confirm it contains the heading "**After state:**".
   - Confirm the After state text explicitly names all 7 design questions: "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7".
   - Confirm the After state text contains the exact string "SESSION_BUDGET=6".
   - Confirm it contains the heading "**Target file:**" with the exact path C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md.
   - Confirm it contains the heading "**Verification test:**".
   - Confirm it contains the heading "**DO NOT TOUCH:**".
   If any of the above are missing, rewrite the file until all are present.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md exists — use Glob to confirm the file is present in the PLANS_DIR.
- [ ] 05-integration-plan.md file size > 0 bytes — use Read to confirm content is present (non-empty file).
- [ ] 05-integration-plan.md "After state" field explicitly names all 7 design questions Q1 through Q7 — use Read and confirm all 7 strings are present: "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7".
- [ ] 05-integration-plan.md "After state" specifies SESSION_BUDGET=6 — use Read and confirm the exact text "SESSION_BUDGET=6" is present in the file.

---

## State Update
After all 4 verification checks pass:
1. Set flags.integrationPlanDerived = true in state.json.
2. Move "step-05-plan-integration" from pendingSteps to completedSteps in state.json.
3. Append to artifacts.plansCreated the string: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\plans\\05-integration-plan.md"
4. Write STATE_FILE back to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json preserving all other fields exactly as they were read — do not remove or alter any other key.
