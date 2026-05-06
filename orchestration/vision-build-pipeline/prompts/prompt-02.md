# Prompt 02: Plan Analysis
**Mode:** PLAN
**Step ID:** step-02-plan-analysis

## Prerequisites
- flags.sourceCommandsCollected = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Context files to read:
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-locations.md

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans — no other directories.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Write every file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All command names, phase names, schema fields, and line numbers must come from context files — not from memory.
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
   - Verify "step-02-plan-analysis" is in pendingSteps. If it is not present in pendingSteps, stop immediately and report: "step-02-plan-analysis is not in pendingSteps — already completed or not scheduled."
   - Verify flags.sourceCommandsCollected = true. If false, stop immediately and report: "Prerequisite flag sourceCommandsCollected is false — do not proceed until step-01 completes."

2. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md completely. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-locations.md completely.

3. From the context files, identify the exact structure of the analysis document to be written:
   - List every command name as confirmed from source-commands-locations.md (do not invent command names — only use names that appear verbatim in the context files).
   - List every dimension to analyze per command as confirmed from source-commands-facts.md (do not invent dimension names — only use dimensions that appear verbatim in source-commands-facts.md).
   - List every overlap, conflict, and gap found in source-commands-facts.md with verbatim quotes from that file.

4. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md with the following exact fields. Every field below must appear in the written file with the exact heading shown:

   **Scope:**
   Write analysis.md at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md containing:
   - Per-Command Analysis section for all 4 commands sourced from source-commands-locations.md, with all dimensions documented using verbatim quotes from source-commands-facts.md.
   - Overlap Map section listing every feature or capability that appears in 2 or more commands, with the best implementation identified and justified.
   - Conflict Map section listing every incompatible design choice found across the 4 commands, with a selected resolution stated explicitly.
   - Gap Map section listing every capability that is missing from all 4 commands and is needed to fulfill the OBJECTIVE of the vision-build-pipeline system.

   **Before state:**
   "File C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md does not exist"

   **After state:**
   analysis.md must contain all of the following sections with the following content:

   (a) ## Per-Command Analysis
   One subsection for each of the 4 commands identified in source-commands-locations.md. Each subsection must document all analysis dimensions that are present in source-commands-facts.md for that command, and every quoted passage must be taken verbatim from source-commands-facts.md. Dimensions include (at minimum) whatever dimension headings appear in source-commands-facts.md — do not add or remove dimensions; use only the ones confirmed from that context file.

   (b) ## Overlap Map
   A table or enumerated list of every feature, pattern, phase name, schema field, or mechanism that appears in 2 or more of the 4 commands. For each overlap entry: name the feature, list which commands contain it, quote the relevant passage from each command (from source-commands-facts.md), identify the best implementation, and state why it is selected.

   (c) ## Conflict Map
   A table or enumerated list of every incompatible design choice — cases where two or more commands specify contradictory behavior, naming, or structure for the same concern. For each conflict entry: name the concern, describe each command's position with verbatim quote, and state the selected resolution with justification.

   (d) ## Gap Map
   An enumerated list of every capability that is absent from all 4 commands but is required to fulfill the vision-build-pipeline OBJECTIVE. For each gap entry: name the gap, explain why it is needed, and propose the minimal specification needed to fill it.

   **Target file:** C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md

   **Target location:** New file — does not exist yet. The OUTPUTS_DIR C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ must exist before writing. If it does not exist, create it before writing the file.

   **Verification test:**
   - Glob for analysis.md in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ confirms the file exists.
   - Read analysis.md and confirm it contains all 4 required section headings exactly as written: "## Per-Command Analysis", "## Overlap Map", "## Conflict Map", "## Gap Map".
   - Read analysis.md and confirm file size > 0 bytes (content is present).

   **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

5. Since this is a new file creation (Before state = file does not exist), no "before state match" verification against an existing target file is needed. Instead, verify the plan file itself is complete:
   - Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md immediately after writing it.
   - Confirm it contains the heading "**Scope:**".
   - Confirm it contains the heading "**Before state:**".
   - Confirm it contains the heading "**After state:**".
   - Confirm the After state text names all 4 required sections: "Per-Command Analysis", "Overlap Map", "Conflict Map", "Gap Map".
   - Confirm it contains the heading "**Target file:**" with the exact path C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md.
   - Confirm it contains the heading "**Verification test:**".
   - Confirm it contains the heading "**DO NOT TOUCH:**".
   If any of the above are missing, rewrite the file until all are present.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md exists — use Glob to confirm the file is present in the PLANS_DIR.
- [ ] 02-analysis-plan.md file size > 0 bytes — use Read to confirm content is present (non-empty file).
- [ ] 02-analysis-plan.md contains a "Scope" field — use Read and confirm the exact text "**Scope:**" is present in the file.
- [ ] 02-analysis-plan.md contains an "After state" field listing all 4 required sections — use Read and confirm all 4 strings are present in the After state field: "Per-Command Analysis", "Overlap Map", "Conflict Map", "Gap Map".

---

## State Update
After all 4 verification checks pass:
1. Set flags.analysisPlanDerived = true in state.json.
2. Move "step-02-plan-analysis" from pendingSteps to completedSteps in state.json.
3. Append to artifacts.plansCreated the string: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\plans\\02-analysis-plan.md"
4. Write STATE_FILE back to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json preserving all other fields exactly as they were read — do not remove or alter any other key.
