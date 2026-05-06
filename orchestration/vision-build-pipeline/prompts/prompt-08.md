# Prompt 08: Plan Command File
**Mode:** PLAN
**Step ID:** step-08-plan-command-file

## Prerequisites
- flags.designReviewCollected = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Context files to read:
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-facts.md
  - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-locations.md

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans — no other directories.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Write every file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All phase content, phase names, schemas, templates, constants, and verification items must come from context files — not from memory.
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
   - Verify "step-08-plan-command-file" is in pendingSteps. If it is not present in pendingSteps, stop immediately and report: "step-08-plan-command-file is not in pendingSteps — already completed or not scheduled."
   - Verify flags.designReviewCollected = true. If false, stop immediately and report: "Prerequisite flag designReviewCollected is false — do not proceed until step-07 completes."

2. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-facts.md completely. Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\design-locations.md completely.

3. From design-facts.md, extract the exact specification for every section of vision-build-pipeline.md. All identifiers, phase names, step content, schema fields, template sections, and constants must be taken verbatim from design-facts.md. Extract:
   - The frontmatter fields (confirmed from design-facts.md — use only the fields present in that file, which are confirmed to be "description" and "allowed-tools").
   - The content of Phase 0 through Phase 9 (all 10 numbered phases), with every sub-step and sub-item as confirmed in design-facts.md.
   - The content of the Self-Heal phase, with every sub-step as confirmed in design-facts.md.
   - All 18 Step 5 verification items verbatim from design-facts.md.
   - The complete VISION.md 10-section template verbatim from design-facts.md.
   - The complete docs folder structure verbatim from design-facts.md.
   - The setup-state.json schema verbatim from design-facts.md.
   - The runner body with SESSION_BUDGET=6 verbatim from design-facts.md.

   If any of the above elements are not present in design-facts.md, do not fabricate them — stop and report exactly which elements are missing from the context file.

4. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md with the following exact fields. Every field below must appear in the written file with the exact heading shown:

   **Scope:**
   Write the command file at C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md containing the complete vision-build-pipeline Claude command. The command file must contain: the frontmatter block (description and allowed-tools fields confirmed from design-facts.md), all 11 phases (Phase 0 through Phase 9 plus the Self-Heal phase), all 18 Step 5 verification items, the complete VISION.md 10-section template, the complete docs folder structure, the setup-state.json schema, and the runner body with SESSION_BUDGET=6.

   **Before state:**
   "File C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md does not exist"

   **After state:**
   vision-build-pipeline.md must contain all of the following sections and elements with the content specified below. All content must be derived verbatim from design-facts.md — do not modify, summarize, or paraphrase.

   FRONTMATTER:
   The exact YAML frontmatter block as confirmed from design-facts.md. Must include the "description" field and the "allowed-tools" field. No other frontmatter fields may be added unless they appear in design-facts.md.

   PHASE 0:
   The complete content of Phase 0 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 1:
   The complete content of Phase 1 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 2:
   The complete content of Phase 2 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 3:
   The complete content of Phase 3 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 4:
   The complete content of Phase 4 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 5:
   The complete content of Phase 5 as confirmed from design-facts.md, including all 18 verification items verbatim and every other sub-step. The phase heading must match exactly what appears in design-facts.md.

   PHASE 6:
   The complete content of Phase 6 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 7:
   The complete content of Phase 7 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 8:
   The complete content of Phase 8 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   PHASE 9:
   The complete content of Phase 9 as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   SELF-HEAL PHASE:
   The complete content of the Self-Heal phase as confirmed from design-facts.md, including every sub-step and sub-item. The phase heading must match exactly what appears in design-facts.md.

   18 STEP 5 VERIFICATION ITEMS:
   All 18 verification items from Step 5 must appear verbatim as confirmed from design-facts.md. No item may be omitted or paraphrased. Each item must appear in the same order as in design-facts.md.

   VISION.md TEMPLATE:
   The complete 10-section VISION.md template as confirmed from design-facts.md. All 10 section headings must appear. No section may be omitted.

   DOCS FOLDER STRUCTURE:
   The complete docs folder structure as confirmed from design-facts.md. All entries must appear exactly as in design-facts.md.

   SETUP-STATE.JSON SCHEMA:
   The complete setup-state.json schema as confirmed from design-facts.md. All fields must appear exactly as in design-facts.md.

   RUNNER BODY:
   The complete runner body specification as confirmed from design-facts.md. The exact text "SESSION_BUDGET=6" must appear in this section.

   **Target file:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md

   **Target location:** New file — directory C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\ already exists on disk. Verify the directory exists before specifying the write location. If the directory does not exist, stop and report: "Target directory C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\ does not exist — cannot proceed."

   **Verification test:**
   Run all 18 verification items from design-facts.md against the written file. Each verification item must be executed as a Glob check or Read check as appropriate:
   - For each verification item in the list from design-facts.md that is a file existence check: use Glob to confirm the file exists.
   - For each verification item in the list from design-facts.md that is a content check: use Read and confirm the specified text or heading is present.
   - Confirm vision-build-pipeline.md exists at C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md (Glob).
   - Confirm vision-build-pipeline.md file size > 0 bytes (Read).
   - Confirm vision-build-pipeline.md contains headings for all 11 phases — Phase 0 through Phase 9 plus the Self-Heal phase heading — all confirmed from design-facts.md (Read).
   - Confirm vision-build-pipeline.md contains the exact text "SESSION_BUDGET=6" (Read).
   - Confirm vision-build-pipeline.md contains all 18 Step 5 verification items (Read — confirm either the number "18" appears in the verification section, or all specific item texts are present).

   **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

5. CRITICAL — After state completeness requirement: The After state in 08-command-file-plan.md must contain the complete content specification for vision-build-pipeline.md. This means every phase section specification in the After state must include the actual content that step-09 will write — not a summary or reference to "content from design-facts.md". Step-09 will read only 08-command-file-plan.md plus design-facts.md; it must not need to read any other source. Therefore:
   - The After state must quote every phase heading verbatim from design-facts.md.
   - The After state must include the complete 18-item verification list verbatim from design-facts.md.
   - The After state must include the complete VISION.md 10-section template verbatim from design-facts.md.
   - The After state must include the complete docs folder structure verbatim from design-facts.md.
   - The After state must include the complete setup-state.json schema verbatim from design-facts.md.
   - The After state must include the runner body verbatim from design-facts.md.

   After writing 08-command-file-plan.md, verify the plan file itself is complete:
   - Read C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md immediately after writing it.
   - Confirm it contains the heading "**Scope:**".
   - Confirm it contains the heading "**Before state:**".
   - Confirm it contains the heading "**After state:**".
   - Confirm the After state text contains headings or labels for all 11 phases: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, and the Self-Heal phase.
   - Confirm the After state text contains all 18 Step 5 verification items.
   - Confirm the After state text contains the exact string "SESSION_BUDGET=6".
   - Confirm it contains the heading "**Target file:**" with the exact path C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md.
   - Confirm it contains the heading "**Verification test:**".
   - Confirm it contains the heading "**DO NOT TOUCH:**".
   If any of the above are missing, rewrite the file until all are present.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md exists — use Glob to confirm the file is present in the PLANS_DIR.
- [ ] 08-command-file-plan.md file size > 0 bytes — use Read to confirm content is present (non-empty file).
- [ ] 08-command-file-plan.md "After state" field contains specifications for phases 0 through 9 plus Self-Heal — use Read and confirm all 11 phase labels are present in the After state: "PHASE 0", "PHASE 1", "PHASE 2", "PHASE 3", "PHASE 4", "PHASE 5", "PHASE 6", "PHASE 7", "PHASE 8", "PHASE 9", "SELF-HEAL PHASE" (or the equivalent phase headings verbatim from design-facts.md).
- [ ] 08-command-file-plan.md "After state" contains all 18 Step 5 verification items — use Read and confirm the text "18" appears in the After state alongside the Step 5 verification items section, or confirm all specific item texts are enumerated.
- [ ] 08-command-file-plan.md "Target file" is exactly "C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md" — use Read and confirm the exact path string appears under the "**Target file:**" heading.

---

## State Update
After all 5 verification checks pass:
1. Set flags.commandFilePlanDerived = true in state.json.
2. Move "step-08-plan-command-file" from pendingSteps to completedSteps in state.json.
3. Append to artifacts.plansCreated the string: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\plans\\08-command-file-plan.md"
4. Write STATE_FILE back to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json preserving all other fields exactly as they were read — do not remove or alter any other key.
