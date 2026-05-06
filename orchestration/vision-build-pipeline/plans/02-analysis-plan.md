# Plan: 02 — Analysis
**Step ID:** step-02-plan-analysis
**Mode:** PLAN
**Date:** 2026-05-05
**Status:** IMMUTABLE after verification passes

---

**Scope:**
Write analysis.md at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md containing:
- Per-Command Analysis section for all 4 commands sourced from source-commands-locations.md, with all dimensions documented using verbatim quotes from source-commands-facts.md.
- Overlap Map section listing every feature or capability that appears in 2 or more commands, with the best implementation identified and justified.
- Conflict Map section listing every incompatible design choice found across the 4 commands, with a selected resolution stated explicitly.
- Gap Map section listing every capability that is missing from all 4 commands and is needed to fulfill the OBJECTIVE of the vision-build-pipeline system.

---

**Before state:**
"File C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md does not exist"

---

**After state:**
analysis.md must contain all of the following sections with the following content:

(a) ## Per-Command Analysis
One subsection for each of the 4 commands identified in source-commands-locations.md. Each subsection must document all analysis dimensions that are present in source-commands-facts.md for that command. Every quoted passage must be taken verbatim from source-commands-facts.md.

The 4 commands, confirmed verbatim from source-commands-locations.md Section 1, are:
1. prep-vision (path: C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md)
2. vision-to-docs (path: C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md)
3. docs-to-build-v2 (path: C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md)
4. autonomous-system-builder1 (path: C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md)

The dimensions to document per command, confirmed verbatim from the section headings in source-commands-facts.md, are:
- Core Mechanism (x.1)
- Input Requirements (x.2)
- Output Artifacts (x.3)
- State Management Approach (x.4)
- Agent Strategy (x.5)
- User Interaction Points (x.6)
- Hallucination Prevention Mechanisms (x.7)
- Verification Approach (x.8)
- Error Recovery Strategy (x.9)
- Strengths and Weaknesses (x.10)

Every dimension must be populated for each of the 4 commands, and every quoted passage must be taken verbatim from source-commands-facts.md.

(b) ## Overlap Map
A table or enumerated list of every feature, pattern, phase name, schema field, or mechanism that appears in 2 or more of the 4 commands. For each overlap entry: name the feature, list which commands contain it, quote the relevant passage from each command (verbatim from source-commands-facts.md), identify the best implementation, and state why it is selected.

Overlaps confirmed present in source-commands-facts.md:

1. **AskUserQuestion user interaction** — present in prep-vision (lines 27–192, all 9 phases), vision-to-docs (Phase 1, up to 12 questions), autonomous-system-builder1 (Phase 1, 7 questions in 3 batches). docs-to-build-v2 has it only in Phase 2 Ground (one optional grouped question).
2. **SESSION_BUDGET = 6** — present in docs-to-build-v2 (Phase 7 runner, hardcoded) and autonomous-system-builder1 ("SESSION_BUDGET = 6 / This is a hard constant. Never derive from user input. Always exactly 6." — lines 134–135).
3. **State file (resume mechanism)** — present in docs-to-build-v2 (setup-state.json) and autonomous-system-builder1 (state.json). prep-vision and vision-to-docs have no state persistence.
4. **Single-agent / no sub-agents** — present in prep-vision ("Single-agent only. No sub-agent spawning.") and vision-to-docs ("Single-agent only. No Agent tool spawning.").
5. **Serial sub-agents** — present in docs-to-build-v2 (Phases 3 and 5 serial per-module/per-entry agents). autonomous-system-builder1 uses parallel Phase 4 agents.
6. **Derived-decision disclosure / anti-hallucination** — present in all 4 commands with different mechanisms: prep-vision (decomposition rule), vision-to-docs (derived-decision disclosure rule, 7-category gap scan), docs-to-build-v2 (locked_constraints, context-catalog.json, Phase 3 isolation rule), autonomous-system-builder1 (DESIGN block interpolation, 13 QC checks, anti-hallucination protocol in runner).
7. **No state persistence** — present in prep-vision and vision-to-docs (both confirmed: "No state file, no session budgets, no checkpointing" and "No state file, no session budget, no resume mechanism").
8. **runner slash command output** — present in docs-to-build-v2 (Phase 7 Runner: `[WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md`) and autonomous-system-builder1 (Sub-agent 5: `[RUNNER_PATH]` = `[PROJECT_ROOT]/.claude/commands/run-[SYSTEM_NAME].md`).
9. **Verification checklist per phase/step** — present in docs-to-build-v2 (every phase has embedded verification checklist, failure triggers Phase 8) and autonomous-system-builder1 (13 QC checks in Phase 5).
10. **pendingSteps / completedSteps arrays** — present in docs-to-build-v2 (orchestration/state.json: `"pendingSteps": ["prompt-01", "prompt-02"], "completedSteps": []`) and autonomous-system-builder1 (state.json: `"completedSteps": [], "pendingSteps": [all STEP_IDS as JSON array]`).

(c) ## Conflict Map
A table or enumerated list of every incompatible design choice — cases where two or more commands specify contradictory behavior, naming, or structure for the same concern. For each conflict entry: name the concern, describe each command's position with verbatim quote, and state the selected resolution with justification.

Conflicts confirmed from source-commands-facts.md:

1. **Agent parallelism strategy** — docs-to-build-v2 mandates serial execution ("For each module in the modules array, IN INDEX ORDER, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next. Do not spawn multiple engineer agents simultaneously."); autonomous-system-builder1 mandates parallel ("Spawn all 5 agents simultaneously in a single batch using the `Agent` tool. Do not wait for one to complete before spawning the next"). Resolution: adopt autonomous-system-builder1's parallel strategy for Phase 4 bootstrap generation (simultaneous prompt file creation); adopt docs-to-build-v2's serial strategy for runtime execution steps (where ordering and isolation matter).

2. **State file schema naming** — docs-to-build-v2 uses `"schema_version": "1"`, `"project_slug"`, `"phases"`, `"resume_from_phase"`, `"session_count"` (setup-state.json); autonomous-system-builder1 uses `"version": "1.0.0"`, `"bootstrap_complete"`, `"project"`, `"buildTarget"`, `"orchestration_dir"`, `"completedSteps"`, `"pendingSteps"`, `"artifacts"`, `"flags"`, `"knownItems"` (state.json). Resolution: adopt autonomous-system-builder1's schema verbatim — it is the schema already in use in the current pipeline's state.json and contains richer tracking fields (flags, artifacts, knownItems).

3. **Session resume approach** — docs-to-build-v2 uses `resume_from_phase` (integer phase index); autonomous-system-builder1 uses `pendingSteps` array (ordered step IDs). Resolution: adopt autonomous-system-builder1's pendingSteps/completedSteps array — it supports arbitrary step ordering and is already implemented in the current pipeline.

4. **Error recovery mechanism** — docs-to-build-v2 has an automatic Phase 8 Self-Heal that writes a fix-prompt file ("This phase is NOT part of the normal execution sequence. It triggers automatically when any phase's output artifact fails its embedded verification checklist."); autonomous-system-builder1 has inline QC fix ("For each failure, fix inline before proceeding to the next check") plus runner-level anti-hallucination recovery. Resolution: adopt autonomous-system-builder1's inline QC fix for bootstrap generation; adopt docs-to-build-v2's Self-Heal pattern for runtime EXECUTE steps where writing a fix-prompt file is appropriate.

5. **Maximum clarifying questions** — vision-to-docs caps at 12 ("Ask no more than 12 questions"); prep-vision asks across 9 mandatory phases with no cap (Q1.1–Q9.1); autonomous-system-builder1 asks exactly 7 (Q1–Q7); docs-to-build-v2 allows at most 1 grouped question. Resolution: for the vision-build-pipeline's internal alignment step (analogous to Phase 1 in autonomous-system-builder1), adopt the 7-question structured approach from autonomous-system-builder1 — it is fully specified with exact question text and confirmation gate.

6. **TOTAL_STEPS derivation** — docs-to-build-v2 derives step count from module count in docs folder; autonomous-system-builder1 derives from Q5 answer (A→6, B→9, C→12, D→infer). Resolution: the vision-build-pipeline uses a fixed step sequence derived at bootstrap time, so total steps is fixed at design time — use the autonomous-system-builder1 pattern of computing TOTAL_STEPS once and storing it.

7. **Session budget hardcoded vs derived** — autonomous-system-builder1: "SESSION_BUDGET = 6 / This is a hard constant. Never derive from user input. Always exactly 6."; docs-to-build-v2 Phase 7 runner uses `SESSION_BUDGET=6` but does not state it as a hard constant. Resolution: treat SESSION_BUDGET = 6 as a hard constant per autonomous-system-builder1 — it provides the strongest anti-drift guarantee.

(d) ## Gap Map
An enumerated list of every capability that is absent from all 4 commands but is required to fulfill the vision-build-pipeline OBJECTIVE. For each gap entry: name the gap, explain why it is needed, and propose the minimal specification needed to fill it.

Gaps confirmed absent from all 4 commands and required for the vision-build-pipeline:

1. **Cross-step context accumulation** — None of the 4 commands defines a mechanism for a later step to read and build on the outputs of all prior steps without re-reading every artifact. The vision-build-pipeline needs analysis.md (step-03) to build on facts.md and locations.md (step-01). Minimal spec: each COLLECT step must append its output file path to `artifacts.filesWritten` in state.json; each PLAN/EXECUTE step reads `artifacts.filesWritten` to locate all prior context.

2. **Inter-step flag gating** — autonomous-system-builder1 defines flags in state.json but does not specify how a step verifies a prerequisite flag before starting. docs-to-build-v2 uses `resume_from_phase` but does not check capability flags. The pipeline requires that step-03 cannot start unless `analysisPlanDerived = true`. Minimal spec: each prompt file's Prerequisites section must list every flag that must be true before the step begins; the runner must read state.json and verify all prerequisite flags before spawning each step agent.

3. **Outputs directory lifecycle** — No command defines an `outputs/` directory: docs-to-build-v2 uses `context/` and `orchestration/`; autonomous-system-builder1 uses `context/`, `plans/`, `prompts/`. The vision-build-pipeline writes analysis.md, integration.md, and the final command file to an `outputs/` directory. Minimal spec: bootstrap must create `outputs/` at ORCH_DIR/outputs/ before step-03 runs; every EXECUTE step that writes to outputs/ must verify the directory exists before writing.

4. **Plan-before-execute enforcement at runner level** — autonomous-system-builder1 has QC3 ("PLAN always precedes EXECUTE") as a post-generation check; docs-to-build-v2 has no equivalent. Neither has a runtime enforcement mechanism in the runner that prevents an EXECUTE step from being spawned when its corresponding PLAN step has not set its flag. Minimal spec: the runner must check, before spawning any EXECUTE-mode step, that the corresponding PLAN flag is true in state.json; if false, spawn the PLAN step first.

5. **Verbatim-quote traceability in analysis outputs** — None of the 4 commands requires that analysis output documents cite the source file and line number for every factual claim. The vision-build-pipeline analysis.md must be auditable against source-commands-facts.md. Minimal spec: every quoted passage in analysis.md must be followed by a parenthetical citation in the form `(source-commands-facts.md §X.Y)`.

6. **Final integration step: unified command file** — No command defines how to merge the outputs of an analysis phase and an integration phase into a single slash command `.md` file. The vision-build-pipeline's end artifact is a merged command file. Minimal spec: the EXECUTE step for command file creation must read analysis.md and integration.md, apply the Conflict Map resolutions and Gap Map fill-ins, and write the merged command to `.claude/commands/run-vision-build-pipeline.md` — without touching any file in `src/`, `public/`, `package.json`, or `.env*`.

---

**Target file:** C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md

**Target location:** New file — does not exist yet. The OUTPUTS_DIR C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ must exist before writing. If it does not exist, create it before writing the file.

---

**Verification test:**
- Glob for analysis.md in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\ confirms the file exists.
- Read analysis.md and confirm it contains all 4 required section headings exactly as written: "## Per-Command Analysis", "## Overlap Map", "## Conflict Map", "## Gap Map".
- Read analysis.md and confirm file size > 0 bytes (content is present).

---

**DO NOT TOUCH:**
- C:\Users\Alexb\Documents\RiseDialapp\src\
- C:\Users\Alexb\Documents\RiseDialapp\public\
- C:\Users\Alexb\Documents\RiseDialapp\package.json
- C:\Users\Alexb\Documents\RiseDialapp\.env*

---

## Execution Notes for Step-03

When step-03-execute-analysis runs, it must:
1. Read this plan file first and verify it contains all required sections.
2. Verify the OUTPUTS_DIR exists; create it if absent.
3. Write analysis.md to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md.
4. Populate all 4 sections (Per-Command Analysis, Overlap Map, Conflict Map, Gap Map) using verbatim quotes sourced exclusively from source-commands-facts.md — no invented content.
5. After writing, verify all 4 section headings are present and file size > 0.
6. Set flags.analysisDocWritten = true in state.json.
7. Move step-03-execute-analysis from pendingSteps to completedSteps.
8. Append analysis.md path to artifacts.filesWritten in state.json.
