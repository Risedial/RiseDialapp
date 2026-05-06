# Vision Build Pipeline — Prompt for Claude Code

## Context

You are working inside the project at `C:\Users\Alexb\Documents\RiseDialapp`.

Four command files exist at the paths below. Your job is to:
1. Read all four files completely
2. Produce a structured analysis of each (pros, cons, overlaps, conflicts)
3. Derive an integrated design using the best of all four
4. Write a single new Claude Code command file that implements the integrated system

---

## Step 1 — Read All Four Source Commands

Read each file completely before doing anything else:

- `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md`
- `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md`
- `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md`
- `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md`

Do not proceed until all four are fully read.

---

## Step 2 — Produce a Full Analysis

For each of the four commands, extract and document:

**Per-command analysis (do all four):**

| Dimension | Details |
|-----------|---------|
| Core mechanism | What it fundamentally does |
| Input | What it requires to start |
| Output artifacts | Every file it produces and its schema |
| State management | Resume logic, session budgets, checkpointing |
| Agent strategy | Serial vs. parallel, how many, responsibilities |
| User interaction | Every point where it blocks waiting for a human answer |
| Hallucination prevention | How it stops agents from inventing values |
| Verification | How it validates its own output |
| Error recovery | What happens on failure |
| Strengths | What it does better than the others |
| Weaknesses | Gaps, missing features, design flaws |

**Cross-command analysis:**

1. **Overlap map** — list every feature, mechanism, or concept that appears in two or more commands. For each overlap, identify which command implements it best and why.
2. **Conflict map** — list every place where two commands make incompatible design choices (e.g., different SESSION_BUDGET values, different state schemas, different agent patterns). For each conflict, decide which approach to use in the integrated system and state the reason.
3. **Gap map** — list every capability that would make the system significantly better but does not exist in any of the four commands.

Print this full analysis before proceeding to Step 3. Do not skip or summarize — the analysis is a deliverable.

---

## Step 3 — Derive the Integrated Design

Using the analysis from Step 2, document the integrated design before writing any code. Answer each question explicitly:

1. **Vision capture** — prep-vision.md asks 40+ questions across 9 phases. The integrated system must answer all of them autonomously from codebase evidence instead of asking the user. What is the exact self-answering loop (search → evidence → derive → record) for every question?

2. **Docs structure** — vision-to-docs.md produces a `[ProjectName]-Docs/` folder. docs-to-build-v2.md consumes a docs folder. How do these connect in the integrated pipeline? What is the exact folder structure and file list?

3. **Orchestration pattern** — autonomous-system-builder1.md uses COLLECT→PLAN→EXECUTE step alternation with parallel agent spawning and 13-point QC. docs-to-build-v2.md uses serial agents with per-phase verification and self-heal. How are both combined?

4. **State management** — docs-to-build-v2.md uses `setup-state.json` with SESSION_BUDGET=6. autonomous-system-builder1.md uses `state.json` with flags and SESSION_BUDGET=3. The integrated system must use SESSION_BUDGET=6, a unified state schema, and full resume capability. What does the unified schema look like?

5. **Hallucination prevention** — docs-to-build-v2.md uses a context catalog with IMMUTABLE context files. autonomous-system-builder1.md uses an anti-hallucination protocol before every EXECUTE spawn. Both must be present. Where does each apply?

6. **Zero user interaction** — the integrated system must NEVER call AskUserQuestion. Every gap is resolved from codebase evidence (Glob, Read, Grep, Bash `git log`) or first-principles reasoning. Where in the pipeline could a gap appear that cannot be resolved automatically, and how is it handled?

7. **Self-healing** — docs-to-build-v2.md Phase 8 writes a fix prompt on verification failure. How does this apply across all phases of the integrated system?

Print the integrated design before proceeding to Step 4.

---

## Step 4 — Write the New Command File

Write the complete integrated command to:

```
C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md
```

### Required frontmatter (exactly these two fields, no others):

```
---
description: Self-directed vision-to-execution pipeline. Reads the codebase, self-answers all prep-vision discovery questions from evidence, generates full docs folder, builds COLLECT→PLAN→EXECUTE orchestration with anti-hallucination context catalog, 13-point QC, self-heal on failure, and writes a runner command. Zero user interaction required. Resume anytime: /vision-build-pipeline [PROJECT_DIR].
allowed-tools: Read Write Edit Bash Agent Glob Grep
---
```

### Required phases in order:

**Phase 0 — Path Resolution and Setup**
- Parse `$ARGUMENTS` to resolve PROJECT_ROOT, PROJECT_NAME, WORKSPACE_ROOT, BUILD_DIR, DOCS_DIR, PROJECT_SLUG, RUNNER_PATH
- If `$ARGUMENTS` is empty: run `pwd` in Bash to set PROJECT_ROOT
- If `$ARGUMENTS` points to an existing `-Docs` folder: set DOCS_DIR to that path and skip Phases 1–2
- Create directories: `BUILD_DIR/orchestration`, `BUILD_DIR/context`, `BUILD_DIR/plans`, `BUILD_DIR/prompts`
- Implement the setup-state.json resume system:
  - If absent (first run): write setup-state.json with all phases set to "pending" except "0_setup" = "completed", resume_from_phase = 1, session_count = 1, SESSION_BUDGET = 6
  - If present (resume): read it, increment session_count, skip all "completed" phases, proceed to first "pending" phase
  - Before each phase: set status to "in_progress"
  - After each phase: set status to "completed", increment resume_from_phase
  - After each phase: check session_phases_completed against SESSION_BUDGET (6). If reached: write state and output resume message, then stop.
- Print all resolved paths before proceeding

**Phase 1 — Self-Interview Vision Capture**

Spawn ONE Agent. The agent must work through all 9 phases of the prep-vision interview framework (every question from Q1.1 through Q9.1) and answer each question autonomously using this loop:

1. State the question verbatim as a labeled heading
2. Identify what codebase evidence would answer it
3. Search: Glob for relevant files, Read package.json, README.md, tsconfig.json, .env.example, existing docs, schema files, route files, component files; run `git log --oneline -20` via Bash
4. Record all evidence found with exact file paths and quoted values
5. State the derived answer — quote exact values where found
6. Apply the decomposition rule: if any part of the answer is still vague, sub-search and re-derive
7. If no evidence exists anywhere: derive from first principles based on tech stack and project type; record as "Derived (no evidence): [reasoning]"
8. Map the answer to its VISION.md template section

The agent must NEVER call AskUserQuestion, NEVER leave a template field blank, NEVER write "TBD" or "Unknown".

Output: `BUILD_DIR/VISION.md` using the complete 10-section template from prep-vision.md (Project Summary, System Overview, Module Specifications per module, Integration Map, Data Schemas, AI/LLM Specifications, Constraints, Build Order, Success Criteria, Open Decisions).

**Phase 2 — Docs Generation**

Spawn ONE Agent. The agent must:
- Read `BUILD_DIR/VISION.md`
- Scan for all 7 gap categories from vision-to-docs.md (unresolved technical decisions, missing integration details, ambiguous edge cases, scheduling/thresholds, user interaction touchpoints, data model gaps, measurement criteria)
- Resolve every gap from codebase evidence using the same search loop as Phase 1 — never ask the user
- Generate the complete docs folder at `BUILD_DIR/[PROJECT_NAME]-Docs/` with this structure:
  ```
  [PROJECT_NAME]-Docs/
  ├── 00-master-vision.md
  ├── 01-build-order.md
  └── modules/
      └── NN-[module-name]/
          ├── SPEC.md
          ├── SCHEMA.md       (only if module has data structures)
          ├── FLOW.md
          ├── PROMPTS.md      (only if module uses AI)
          └── BUILD-INSTRUCTIONS.md
  └── validation/
      └── checklists/
          └── NN-[module-name]-checklist.md   (5+ binary items each)
  ```
- 01-build-order.md must contain: ordered module list, explicit dependency per module, integration checkpoints, single observable "done" definition

**Phase 3 — Module Manifest**

Spawn ONE Agent. Read all docs files. Write `BUILD_DIR/module-manifest.json` with:
- `locked_tech`: every framework version, cookie name, JWT claim, algorithm name, table name, env var prefix found in the docs — values an agent would otherwise hallucinate
- `locked_constraints`: every verbatim MUST NOT / never / do not directive from any docs file
- `modules` array: every module with index, name, key, docs_files (absolute paths), output_files (absolute paths), parallel_safe, depends_on, spec_summary, verification_criteria (derived from the module's checklist)

**Phase 4 — Context Catalog**

Spawn ONE Agent. Read module-manifest.json and all docs files. Write `BUILD_DIR/context-catalog.json`. Entries organized into exactly five categories:
- `schema_values`: table names, column names, data types, enum strings, constraint strings
- `auth_session`: cookie names, JWT claim names, header names, algorithm strings, token formats
- `api_contracts`: request/response field names, HTTP status codes, endpoint paths
- `design_tokens`: CSS variable names, exact color hex values, font stacks, spacing values, breakpoints
- `external_services`: environment variable names, API key format patterns, service config values

Each entry: file_name, category, prevents (specific hallucination prevented), required_by_modules (module keys), values array.

**Phase 5 — Module Fragments** (serial — one agent per module)

For each module in module-manifest.json IN INDEX ORDER, spawn ONE Agent at a time and wait for completion before spawning the next.

Each agent writes `BUILD_DIR/module-fragment-NN.md` with sections: Role, Context (locked_tech + locked_constraints), What Must Be True After This Module, Files to Change (one subsection per output file with COMPLETE content in a code block — never "see docs" or "TBD"), Verification (every verification_criteria item as a checkbox), Failure Recovery (at least one entry per observable failure condition).

**Phase 6 — Synthesis**

Spawn ONE Agent. Read module-manifest.json and all module-fragment-NN.md files. Write `BUILD_DIR/refined-prompt.md` containing: `<role>`, `<context>`, `<build_order>` blocks followed by one `## MODULE NN` section per module with the full fragment content verbatim, and a Refinement Report section.

**Phase 7 — Context Files** (serial — one agent per catalog entry)

For each entry in context-catalog.json IN SEQUENCE, spawn ONE Agent at a time. Each writes `BUILD_DIR/context/[file_name]` with header fields: Role, Status (always "IMMUTABLE — do not modify during implementation phase"), Depends on (always "none"), Required by, Date. Followed by a Values section listing every key-value pair.

**Phase 8 — Orchestration** (four agents spawned simultaneously in a single batch)

Derive before spawning:
- TOTAL_STEPS = module count × 3 (one COLLECT, one PLAN, one EXECUTE per module)
- STEP_IDS: format `step-NN-mode-task`, strict collect→plan→execute alternation
- FLAG_NAMES: domain-specific camelCase flags from module names, always ending with "allChangesCommitted"
- VERIFICATION_GATE: derive from locked_tech — TypeScript/Next.js → `npx tsc --noEmit`; Python → `pytest`; JS/Node → `npm test`; no code → "File exists and is non-empty"

Spawn all four agents simultaneously:

- **Agent A — State Files**: Write `BUILD_DIR/orchestration/state.json` (completedSteps, pendingSteps as all STEP_IDS, flags all false, artifacts empty) and `BUILD_DIR/orchestration/step-plan.json` (every step with id, mode, task, prompt_file, outputs, prerequisites). Verify: completedSteps.length + pendingSteps.length = TOTAL_STEPS.

- **Agent B — COLLECT Prompts**: One `BUILD_DIR/orchestration/prompts/prompt-NN.md` per COLLECT step. Each must contain: Mode: COLLECT, Hard Constraints (write ONLY to `BUILD_DIR/context`), Prerequisites, Task (read state → locate files via Glob → extract with verbatim quotes and line numbers → write facts.md and locations.md), Verification (3 binary items), State Update.

- **Agent C — PLAN Prompts**: One `BUILD_DIR/orchestration/prompts/prompt-NN.md` per PLAN step. Each must contain: Mode: PLAN, Hard Constraints (write ONLY to `BUILD_DIR/plans`), Prerequisites (preceding COLLECT flag must be true), Task (read state → verify flags → read context files → write plan with Before state verbatim quote / After state exact content / Target file absolute path / Target location / Verification test → confirm Before state exists in target file), Verification (4 binary items), State Update.

- **Agent D — EXECUTE Prompts**: One `BUILD_DIR/orchestration/prompts/prompt-NN.md` per EXECUTE step. Each must contain: Mode: EXECUTE, Hard Constraints (write ONLY to application code in PROJECT_ROOT — never to context/, plans/, prompts/), Anti-Hallucination Protocol (1. Glob for plan file — if missing: stop and report. 2. Glob for target file named in plan — if missing: stop and report. 3. If both pass: proceed), Task (verify plan file → read plan → confirm Before state matches source file character-for-character → apply After state → run VERIFICATION_GATE → confirm After state in file), Verification (target file contains After state, VERIFICATION_GATE exits 0, git diff confirms no protected files modified), State Update.

After all four agents complete, run all 13 QC checks and fix each failure inline before moving to the next:

1. **QC1 Mode header match** — every prompt's Mode header matches step-plan.json mode field (COLLECT/PLAN/EXECUTE uppercase)
2. **QC2 Mode lock specificity** — Hard Constraint #1 names exactly one write directory
3. **QC3 PLAN precedes EXECUTE** — every EXECUTE step has an immediately preceding PLAN step in step-plan.json
4. **QC4 EXECUTE starts with verify** — Task step 1 in every EXECUTE file contains "Verify plan file" and "stop and report"
5. **QC5 Binary verification items** — no Verification item contains "correct", "appropriate", "looks right", or "seems" without an exact criterion
6. **QC6 EXECUTE verification gate present** — every EXECUTE Verification section contains the VERIFICATION_GATE command as a checklist item
7. **QC7 State update completeness** — every State Update section contains: exact flag name, "from pendingSteps to completedSteps", and at least one artifact path appended
8. **QC8 Anti-hallucination in every EXECUTE** — every EXECUTE prompt file contains the Anti-Hallucination Protocol section before the Task section
9. **QC9 No unverified identifiers** — every file path and flag name in the Task section is declared in Prerequisites or Hard Constraints
10. **QC10 Step count invariant** — completedSteps.length + pendingSteps.length = TOTAL_STEPS in state.json
11. **QC11 COLLECT outputs declared** — every COLLECT step's outputs array in step-plan.json lists the context files it will write
12. **QC12 Bootstrap wrote files only** — all writes during Phase 8 are under BUILD_DIR and RUNNER_PATH only
13. **QC13 All phases completed before runner** — setup-state.json shows phases 1–8 as "completed" before Phase 9 begins

Write `BUILD_DIR/orchestration/README.md` listing all steps with index, title, mode, and status.

**Self-Heal** (triggered on any verification failure in any phase — not part of the normal sequence)

When any phase's verification checklist has a failed item: immediately spawn ONE Agent. Pass: expected schema (from that phase's spec), actual artifact contents (or "nothing was written"), and the specific failed checklist item. The agent writes `BUILD_DIR/fix-phaseN-[PROJECT_SLUG].md` containing: What Failed (one sentence), What Was Expected (schema pasted inline), What Was Found (actual contents), How to Repair (the phase's agent prompt verbatim with "PRIOR ATTEMPT FAILED: [reason]. Avoid this by: [corrective instruction]" injected at top), Verification (checklist for that phase), Instructions for User. NEVER surface an error to the user before this file is written.

**Phase 9 — Runner Command**

Spawn ONE Agent. Read `BUILD_DIR/orchestration/state.json` — count entries in pendingSteps as TOTAL_STEPS. Write `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\run-[PROJECT_SLUG].md` with:

Frontmatter (exactly these two fields only):
```
---
description: Run the [PROJECT_NAME] build pipeline. Executes the next pending step and loops up to SESSION_BUDGET steps. Resume anytime: /run-[PROJECT_SLUG].
allowed-tools: Read Write Edit Bash Agent Glob Grep
---
```

Body (substitute ALL values literally — no bracket placeholders remaining):
```
## Configuration
SESSION_BUDGET  = 6  # adjust: floor(context_limit / avg_prompt_complexity)
STATE_FILE      = [BUILD_DIR]/orchestration/state.json
PROMPTS_DIR     = [BUILD_DIR]/orchestration/prompts
PLANS_DIR       = [BUILD_DIR]/plans
CONTEXT_DIR     = [BUILD_DIR]/context
TOTAL_STEPS     = [integer]
PROJECT_ROOT    = [absolute path]

## Anti-Hallucination Protocol (run before every EXECUTE-mode agent spawn)
1. Glob for the plan file in PLANS_DIR. If not found: spawn COLLECT recovery agent.
2. Read the plan file — Glob for the target file it names. If not found: spawn COLLECT recovery agent.
3. After any recovery: re-run both checks. If both pass: proceed. If either fails again: stop and report to user.

## Execution Loop
1. Read STATE_FILE. Parse completedSteps and pendingSteps.
2. steps_this_session = 0
3. If pendingSteps is empty: print Completion Block and stop.
4. LOOP — repeat while pendingSteps not empty AND steps_this_session < 6:
   a. current_step = pendingSteps[0]
   b. Read PROMPTS_DIR/[current_step].md in full
   c. If current_step contains "-execute-": run Anti-Hallucination Protocol first
   d. Spawn ONE Agent with the full prompt file contents as the agent prompt
   e. Wait for agent to complete
   f. Read STATE_FILE. If current_step is still in pendingSteps: stop and report "[current_step] did not update state.json. Manual inspection required."
   g. steps_this_session = steps_this_session + 1
   h. Print: "Step [current_step] complete ([steps_this_session]/6 this session, [completedSteps.length]/[TOTAL_STEPS] total)."
5. If pendingSteps empty: print Completion Block. If steps_this_session = 6 and pendingSteps not empty: print Next-Session Block.

## Completion Block
===========================================
BUILD COMPLETE — [PROJECT_NAME]
===========================================
All [TOTAL_STEPS] steps finished.
Review artifacts: see state.json > artifacts section.

## Next-Session Block
===========================================
SESSION BUDGET REACHED (6/6 this session)
===========================================
Open a new chat and run: /run-[PROJECT_SLUG]

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from the front
- completedSteps: append current_step to the end
- flags: set the flag for the completed step to true (reference step-plan.json for flag-to-step mapping)
```

After writing: verify no [bracket] placeholders remain in Configuration, Completion Block, or Next-Session Block. If any found: replace before finalizing.

---

## Step 5 — Verify the Written Command File

After writing `vision-build-pipeline.md`, verify every item below. Fix any failure inline before reporting completion:

- [ ] File exists at `.claude/commands/vision-build-pipeline.md` (Read to confirm)
- [ ] Frontmatter contains only `description` and `allowed-tools` — no other keys
- [ ] Phases 0 through 9 are all present, plus the Self-Heal phase
- [ ] Phase 0 contains the full setup-state.json schema with SESSION_BUDGET = 6
- [ ] Phase 0 implements Steps A–F of the resume system explicitly
- [ ] Phase 1 agent prompt lists all prep-vision questions Q1.1 through Q9.1
- [ ] Phase 1 agent prompt contains the 8-step self-answering loop
- [ ] Phase 1 agent prompt contains the complete VISION.md 10-section template
- [ ] Phase 2 agent prompt contains all 7 gap categories and the full docs folder structure
- [ ] Phase 8 spawns four agents simultaneously in a single batch
- [ ] Phase 8 contains all 13 QC checks with inline fix actions
- [ ] Phase 8 EXECUTE prompt template contains the Anti-Hallucination Protocol before the Task section
- [ ] Phase 9 runner body contains no [bracket] placeholders in Configuration, Completion Block, or Next-Session Block
- [ ] Phase 9 runner contains SESSION_BUDGET = 6 with the comment `# adjust: floor(context_limit / avg_prompt_complexity)`
- [ ] Phase 9 runner Anti-Hallucination Protocol is inside the execution loop, conditioned on "-execute-" in the step ID
- [ ] Self-Heal phase is present and triggered on verification failure without surfacing an error to the user first
- [ ] The word "AskUserQuestion" does not appear anywhere in the command file
- [ ] No section in the command file contains "TBD", "see docs", or "as described"

---

## Final Output

After completing Steps 1–5, print this completion report:

```
vision-build-pipeline.md written.

Location: C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md

Analysis completed:
  - 4 commands analyzed (prep-vision, vision-to-docs, docs-to-build-v2, autonomous-system-builder1)
  - Overlap map: [N items]
  - Conflict map: [N items resolved]
  - Gap map: [N new capabilities added]

Integrated system phases:
  Phase 0  — Setup + resume system (SESSION_BUDGET = 6)
  Phase 1  — Self-interview vision capture (0 user questions)
  Phase 2  — Docs generation (all 7 gap categories resolved autonomously)
  Phase 3  — Module manifest (locked_tech + locked_constraints)
  Phase 4  — Context catalog (5 categories, IMMUTABLE context files)
  Phase 5  — Module fragments (serial)
  Phase 6  — Synthesis
  Phase 7  — Context file writing (serial, IMMUTABLE headers)
  Phase 8  — Orchestration (4 agents parallel, 13-point QC)
  Phase 9  — Runner command
  Self-Heal — Triggered on any verification failure

To use: /vision-build-pipeline [PROJECT_DIR]
To run after: /run-[project-slug]
```
