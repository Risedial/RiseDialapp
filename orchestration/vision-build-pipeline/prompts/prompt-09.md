# Prompt 09: Execute Command File
**Mode:** EXECUTE
**Step ID:** step-09-execute-command-file

## Prerequisites
- flags.commandFilePlanDerived = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Plan file to read: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Write only to C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md — the target command file. Do NOT write to context/, plans/, prompts/, or outputs/ directories.
2. **Token limit:** 32,000 tokens max. If the command file content exceeds this, write in multiple passes using the Edit tool for subsequent sections.
3. **No truncation:** Write every phase completely. No "see docs", no "as described", no "TBD".
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Verification gate:** vision-build-pipeline.md must exist and pass all 18 Step 5 checks.
6. **Anti-hallucination:** All phase content, schemas, templates, and constants must come from the plan file — not from memory or prior context.
7. **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json

---

## Anti-Hallucination Protocol
Run before writing vision-build-pipeline.md:
1. Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md. Cannot execute without a verified plan. Do not proceed."
2. Read the plan file. The "Target file" field names C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md. Glob for directory C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\. If directory does not exist: stop and report "Target directory C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\ does not exist."
3. Both checks pass: proceed to Task.

---

## Task

1. Verify plan file exists: Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md. If not found: stop and report "Plan file missing — cannot execute without verified plan."

2. Read plan file at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\08-command-file-plan.md completely. The After state contains the complete content specification for vision-build-pipeline.md. Record the After state exactly.

3. Check if C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md already exists (Glob). If it already exists: read it to determine if it was from a prior partial attempt. If it is incomplete (missing phases), proceed with writing the complete version.

4. Write C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md with the complete content as specified in the plan's After state. The file MUST contain all of the following sections, each written completely with no truncation:

   **Frontmatter** (exactly these two fields only — no other frontmatter keys):
   ```
   ---
   description: Self-directed vision-to-execution pipeline. Reads the codebase, self-answers all prep-vision discovery questions from evidence, generates full docs folder, builds COLLECT→PLAN→EXECUTE orchestration with anti-hallucination context catalog, 13-point QC, self-heal on failure, and writes a runner command. Zero user interaction required. Resume anytime: /vision-build-pipeline [PROJECT_DIR].
   allowed-tools: Read Write Edit Bash Agent Glob Grep
   ---
   ```

   **Phase 0 — Path Resolution and Setup**
   Write complete content including:
   - Full setup-state.json schema written as a literal JSON block with SESSION_BUDGET = 6 as the first field, all phase status fields (phase_0 through phase_9 and phase_selfheal each with status/started_at/completed_at), all artifact arrays (filesWritten, filesModified, filesDeleted), all flag booleans (analysisPlanDerived, analysisDocWritten, integrationPlanDerived, integrationDocWritten, commandFilePlanDerived, allChangesCommitted), pendingSteps and completedSteps arrays, project_slug, project_dir, last_updated
   - Resume logic Steps A through F explicitly labeled:
     - Step A: Read $ARGUMENTS to get PROJECT_DIR. Validate it exists (Glob). If not found: stop and report "PROJECT_DIR does not exist: [value]."
     - Step B: Derive PROJECT_SLUG = basename of PROJECT_DIR, lowercased, spaces replaced with hyphens.
     - Step C: Derive STATE_FILE path = PROJECT_DIR/setup-state.json.
     - Step D: Glob for STATE_FILE. If absent: this is the first run. Write STATE_FILE with the complete schema above, all phases pending, session_count=0, project_slug and project_dir filled in, last_updated = current timestamp.
     - Step E: If STATE_FILE exists: Read it. Increment session_count. If session_count > SESSION_BUDGET: write checkpoint-[PROJECT_SLUG].md to PROJECT_DIR/outputs/ listing all completed and pending phases, then stop and print "Session budget of 6 reached. Resume with: /vision-build-pipeline [PROJECT_DIR]".
     - Step F: Set resume_from_phase = index of first phase where status is not "completed". All phases with status "completed" are skipped in the execution loop below.

   **Phase 1 — Self-Interview Vision Capture**
   Spawn ONE Agent with a complete prompt that includes:
   - The 8-step self-answering loop explicitly numbered:
     - Step 1: Read the question text.
     - Step 2: Identify evidence sources for this question type (Glob patterns, file paths, Bash commands).
     - Step 3: Run the evidence-gathering commands.
     - Step 4: Apply the derive rule to produce an answer.
     - Step 5: Record the answer with its evidence source (file path and line number).
     - Step 6: If the answer is "Unknown" or "TBD": re-run with a broader search strategy or derive from first principles using the identified tech stack.
     - Step 7: Verify the answer is concrete (a real value, not a placeholder).
     - Step 8: Write the answer into the corresponding VISION.md section slot.
   - All 9 phases of prep-vision questions listed explicitly. For each question, state: the question text, the evidence sources to search, and the derive rule. The questions span Q1.1 through Q9.1 and cover: Q1.1 Project name; Q1.2 Project slug; Q1.3 One-line description; Q2.1 Problem statement; Q2.2 Target user; Q3.1 Solution approach; Q3.2 Core value proposition; Q4.1 Primary language; Q4.2 Framework; Q4.3 Database; Q4.4 ORM; Q4.5 Auth provider; Q4.6 Deployment target; Q5.1 System components; Q5.2 Component relationships; Q6.1 Module list; Q6.2 Module dependencies; Q6.3 Build order; Q7.1 Key entities; Q7.2 Entity fields; Q7.3 Entity relationships; Q8.1 API endpoints; Q8.2 HTTP methods; Q8.3 Auth requirements; Q9.1 Environment variables
   - The AskUserQuestion tool must not appear anywhere in this prompt. Every question is answered by evidence search and derivation only.
   - The complete VISION.md 10-section template with all section headings:
     - # 1. Project Identity
     - # 2. Problem Statement
     - # 3. Solution Overview
     - # 4. Tech Stack
     - # 5. Architecture Overview
     - # 6. Module Map
     - # 7. Data Model
     - # 8. API Surface
     - # 9. Environment Configuration
     - # 10. Build Constraints
   - Output: write VISION.md to PROJECT_DIR/docs/VISION.md

   **Phase 2 — Docs Generation**
   Spawn ONE Agent with a complete prompt that includes:
   - All 7 gap categories listed explicitly with their resolution algorithms:
     - Gap 1 — Project name: search package.json name field; fallback: PROJECT_DIR basename
     - Gap 2 — Tech stack: search package.json, requirements.txt, Gemfile, go.mod; fallback: infer from file extensions
     - Gap 3 — Module boundaries: Glob src/*/; fallback: cluster by import relationships
     - Gap 4 — Auth provider: Grep for supabase/auth, next-auth, clerk, auth0, firebase/auth; fallback: "no-auth-detected"
     - Gap 5 — Deployment target: Glob for vercel.json, netlify.toml, fly.toml, Dockerfile; fallback: parse package.json scripts.build
     - Gap 6 — API endpoints: Glob src/app/api/**/*.ts, src/pages/api/**/*.ts; fallback: Grep for router.get, router.post, app.get, app.post
     - Gap 7 — Environment variables: Glob .env.example, .env.local.example; fallback: Grep for process.env. and import.meta.env.
   - The complete docs folder structure to produce:
     ```
     [PROJECT_NAME]-Docs/
     ├── 00-master-vision.md
     ├── 01-build-order.md
     ├── modules/
     │   └── NN-[module-name]/
     │       ├── SPEC.md
     │       ├── SCHEMA.md
     │       ├── FLOW.md
     │       ├── PROMPTS.md
     │       └── BUILD-INSTRUCTIONS.md
     └── validation/
         └── checklists/
             └── NN-[module-name]-checklist.md
     ```
   - Output: write all docs files to PROJECT_DIR/[PROJECT_NAME]-Docs/

   **Phase 3 — Module Manifest**
   Spawn ONE Agent with a complete prompt that includes:
   - Read VISION.md section 6 (Module Map) to get the module list
   - Read the docs folder 01-build-order.md to get the build order
   - Write module-manifest.json to PROJECT_DIR/orchestration/ with schema:
     ```json
     {
       "locked_tech": { "language": "", "framework": "", "database": "", "orm": "", "auth": "", "deployment": "" },
       "locked_constraints": [],
       "modules": [
         { "index": 1, "name": "", "slug": "", "dependencies": [], "build_priority": 1, "spec_path": "", "schema_path": "", "flow_path": "" }
       ]
     }
     ```
   - All values in locked_tech and modules must come directly from VISION.md — not invented

   **Phase 4 — Context Catalog**
   Spawn ONE Agent with a complete prompt that includes:
   - Read module-manifest.json and VISION.md
   - Read all schema files found in the docs folder modules/
   - Write context-catalog.json to PROJECT_DIR/orchestration/ with schema:
     ```json
     {
       "schema_values": { "tables": [], "columns": {}, "enums": {} },
       "auth_session": { "provider": "", "session_fields": [], "token_types": [] },
       "api_contracts": { "endpoints": [] },
       "design_tokens": { "css_variables": [], "colors": [], "spacing": [], "fonts": [] },
       "external_services": { "services": [], "sdk_imports": [], "env_vars": [] }
     }
     ```
   - All values must be read from actual source files — never invented

   **Phase 5 — Module Fragments**
   Run serially: one agent per module, in build order from module-manifest.json. For each module:
   - Spawn ONE Agent with a prompt that reads the module's SPEC.md, SCHEMA.md, FLOW.md, PROMPTS.md, and BUILD-INSTRUCTIONS.md from the docs folder
   - Reads context-catalog.json
   - Writes module-fragment-[NN]-[module-slug].md to PROJECT_DIR/orchestration/fragments/ with:
     - The module's complete build specification
     - A list of identifiers this module uses, each verified against context-catalog.json
     - Any gap identifiers that need to be added to context-catalog.json before building
   - Wait for each agent to complete before spawning the next

   **Phase 6 — Synthesis**
   Spawn ONE Agent with a complete prompt that includes:
   - Read all module fragments from PROJECT_DIR/orchestration/fragments/
   - Read context-catalog.json and module-manifest.json
   - Write refined-prompt.md to PROJECT_DIR/orchestration/ containing:
     - A unified system description (one paragraph)
     - The ordered build sequence with dependency justification
     - All cross-module contracts (shared types, shared API calls, shared database tables)
     - All identifier conflicts resolved (where two modules use different names for the same thing, pick one and document the decision)

   **Phase 7 — Context File Writing**
   Run serially: one agent per catalog category in context-catalog.json. For each category:
   - Spawn ONE Agent with a prompt that reads the category from context-catalog.json
   - Writes a context file to PROJECT_DIR/orchestration/context/[category-name].md
   - The first two lines of every context file must be:
     ```
     # CONTEXT CATALOG — [CATEGORY_NAME] — DO NOT MODIFY THIS FILE
     # All values in this file are ground truth. Use them verbatim. Do not invent alternatives.
     ```
   - Then lists all values in that category, one per line, formatted for easy reading
   - Wait for each agent to complete before spawning the next

   **Phase 8 — Orchestration**
   Spawn 4 agents simultaneously in a single batch (all 4 spawned at the same time, not sequentially):
   - Agent 1 — COLLECT prompt template: writes orchestration/prompts/collect-template.md containing the COLLECT phase prompt template for any module
   - Agent 2 — PLAN prompt template: writes orchestration/prompts/plan-template.md containing the PLAN phase prompt template for any module
   - Agent 3 — EXECUTE prompt template: writes orchestration/prompts/execute-template.md containing the EXECUTE phase prompt template for any module. This template MUST include the Anti-Hallucination Protocol before the Task section: "Before writing any code or file content: (1) Read all context catalog files in orchestration/context/. (2) For every identifier you write (table names, column names, API paths, CSS variables, service names), verify it appears verbatim in a context catalog file. (3) If an identifier is not in the catalog: stop, do not guess, add it to the catalog first. Never invent identifiers."
   - Agent 4 — QC and self-heal spec: writes orchestration/qc-spec.md containing all 13 QC checks and the self-heal trigger logic

   The 13 QC checks (QC1 through QC13) that Agent 4 must write:
   - QC1: Target file exists at expected path (Glob)
   - QC2: Target file is non-empty (Read — size > 0)
   - QC3: Target file contains required headings (Read — verify all headings)
   - QC4: All database table names in the file appear in context-catalog schema_values.tables (Grep + catalog read)
   - QC5: All column names in the file appear in context-catalog schema_values.columns (Grep + catalog read)
   - QC6: All API paths in the file appear in context-catalog api_contracts.endpoints (Grep + catalog read)
   - QC7: All CSS variable names in the file appear in context-catalog design_tokens.css_variables (Grep + catalog read)
   - QC8: All import paths match context-catalog external_services.sdk_imports (Grep + catalog read)
   - QC9: No placeholder patterns remain in the file (Grep for "[", "TODO", "TBD", "FIXME")
   - QC10: No AskUserQuestion calls in the file (Grep for "AskUserQuestion" — must return 0)
   - QC11: All environment variable names appear in context-catalog external_services.env_vars (Grep + catalog read)
   - QC12: TypeScript types are consistent with SCHEMA.md for the module (Read SCHEMA.md, Read file, compare type names)
   - QC13: The file does not import from paths outside the project (Grep for absolute paths or external URLs in import statements)

   Inline fix action for any failed QC check: spawn a fix agent immediately with: the QC check that failed, the expected value from the catalog, the actual value found in the file, and instruction to fix only that specific discrepancy.

   Also write orchestration/README.md explaining how to use the orchestration directory.

   **Self-Heal Phase**
   Triggered on verification failure at any phase. Write this phase as a conditional block in the runner that fires when any verification checklist item fails after an EXECUTE agent completes:
   - Trigger condition: any item in a verification checklist fails
   - Spawn ONE Agent with the self-heal prompt:
     - Input: (1) the expected schema or content spec from the plan, (2) the actual file contents (full Read), (3) the specific checklist item that failed (verbatim), (4) the phase number and step ID
     - Output: write fix-phaseN-[PROJECT_SLUG].md to orchestration/outputs/ with sections: "## What Failed" (checklist item verbatim), "## Expected" (expected value from plan), "## Found" (actual content present), "## How to Repair" (step-by-step repair instructions)
   - Before re-running the EXECUTE agent: inject "PRIOR ATTEMPT FAILED: Read fix-phaseN-[PROJECT_SLUG].md before writing. Address every item in How to Repair." at the top of the agent prompt
   - Constraint: the self-heal agent must write the fix file before any error is surfaced to the user. Never surface the error before the fix file is written.
   - Retry limit: maximum 2 self-heal attempts per phase. If both fail: write final-failure-phaseN-[PROJECT_SLUG].md to orchestration/outputs/ and stop the pipeline with phase status = "failed" in state.json.

   **Phase 9 — Runner Command**
   Spawn ONE Agent with a complete prompt that includes:
   - Read integrated-design.md runner body specification from orchestration/outputs/ (if it exists) or read the runner spec from the plan
   - Write the complete runner command to PROJECT_DIR/.claude/commands/run-[PROJECT_SLUG]-pipeline.md
   - The runner file must have this exact frontmatter (no other keys):
     ```
     ---
     description: Autonomous build runner for [PROJECT_NAME]. Executes all orchestration phases in order, resumes from last completed phase, enforces SESSION_BUDGET = 6. Run: /run-[PROJECT_SLUG]-pipeline
     allowed-tools: Read Write Edit Bash Agent Glob Grep
     ---
     ```
   - The runner body must contain all of the following with literal values (no bracket placeholders):
     - Configuration block:
       ```
       SESSION_BUDGET  = 6   # adjust only if project has more than 6 phases requiring agent work
       STATE_FILE      = PROJECT_DIR/setup-state.json
       ORCH_DIR        = PROJECT_DIR/orchestration
       OUTPUTS_DIR     = PROJECT_DIR/orchestration/outputs
       PROMPTS_DIR     = PROJECT_DIR/orchestration/prompts
       CONTEXT_DIR     = PROJECT_DIR/orchestration/context
       PROJECT_SLUG    = [derived from PROJECT_DIR basename at runtime]
       ```
       Note: PROJECT_DIR is resolved from $ARGUMENTS at runtime — all other paths derive from it.
     - State read: Read STATE_FILE at the start of every run. If absent: error — Phase 0 must run first.
     - Session budget check: if state.session_count >= SESSION_BUDGET: write checkpoint-[PROJECT_SLUG].md and stop.
     - Anti-Hallucination Protocol inside the execution loop (before every EXECUTE agent spawn):
       "Before writing any code or file content: (1) Read all context catalog files in CONTEXT_DIR. (2) For every identifier you write (table names, column names, API paths, CSS variables, service names), verify it appears verbatim in a context catalog file. (3) If an identifier is not in the catalog: stop, do not guess, add it to the catalog first. Never invent identifiers."
     - Execution loop: for each step in state.pendingSteps (in order), run the step's agent with the corresponding prompt from PROMPTS_DIR, run verification checks, on failure trigger Self-Heal Phase, on success update state.
     - Completion Block: when state.pendingSteps is empty: write final-report.md to OUTPUTS_DIR listing all completed steps and their output artifacts, set flags.allChangesCommitted = true in STATE_FILE, print "Pipeline complete. All phases finished. Report at: OUTPUTS_DIR/final-report.md".
     - Next-Session Block: when SESSION_BUDGET is reached before completion: write checkpoint-[PROJECT_SLUG].md to OUTPUTS_DIR with current progress (list completed steps, list remaining steps, current phase index), increment state.session_count, write STATE_FILE, print "Session budget reached. Resume with: /run-[PROJECT_SLUG]-pipeline [PROJECT_DIR]".

   **Step 5 — Verify the Written Command File**
   After writing vision-build-pipeline.md, run all 18 verification checks. For each check, if it fails: fix the specific issue before proceeding to the next check.

   The 18 checks:
   1. File exists at .claude/commands/vision-build-pipeline.md (Glob to confirm)
   2. Frontmatter contains only description and allowed-tools (Read — confirm no other keys in frontmatter)
   3. Phases 0 through 9 are all present plus Self-Heal (Read — confirm headings Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Self-Heal all exist)
   4. Phase 0 contains full setup-state.json schema with SESSION_BUDGET = 6 (Read — confirm "SESSION_BUDGET" and the value "6" appear in Phase 0)
   5. Phase 0 implements Steps A-F of resume system explicitly (Read — confirm labels "Step A" through "Step F" appear in Phase 0)
   6. Phase 1 agent prompt lists all prep-vision questions Q1.1 through Q9.1 (Read — confirm "Q1.1" and "Q9.1" both appear)
   7. Phase 1 agent prompt contains the 8-step self-answering loop (Read — confirm 8 numbered steps exist in Phase 1 agent prompt)
   8. Phase 1 agent prompt contains complete VISION.md 10-section template (Read — confirm all 10 section headings appear)
   9. Phase 2 agent prompt contains all 7 gap categories and full docs folder structure (Read — confirm "Gap 1" through "Gap 7" or equivalent gap names appear, and the docs folder tree appears)
   10. Phase 8 spawns four agents simultaneously in a single batch (Read — confirm "simultaneously" or "parallel" appears describing the 4 agents)
   11. Phase 8 contains all 13 QC checks with inline fix actions (Read — confirm "QC1" through "QC13" all appear)
   12. Phase 8 EXECUTE prompt template contains Anti-Hallucination Protocol before Task section (Read — confirm "Anti-Hallucination Protocol" text appears before "Task" in the execute-template description)
   13. Phase 9 runner body contains no bracket placeholders in Configuration, Completion Block, or Next-Session Block (Grep for pattern "\[" in those sections — must return 0 matches for literal bracket placeholders; runtime derivation notes in comments are acceptable)
   14. Phase 9 runner contains SESSION_BUDGET = 6 with comment (Read — confirm "SESSION_BUDGET" and "= 6" and "# adjust" all appear)
   15. Phase 9 runner Anti-Hallucination Protocol is inside the execution loop (Read — confirm the Anti-Hallucination Protocol text appears within the execution loop section of Phase 9)
   16. Self-Heal phase is present and triggered on verification failure (Read — confirm "Self-Heal" heading exists and "verification failure" or "checklist" trigger condition is stated)
   17. The word "AskUserQuestion" does not appear anywhere in the file (Grep for "AskUserQuestion" — must return zero matches)
   18. No section contains "TBD", "see docs", or "as described" (Grep for "TBD" — must return zero matches; Grep for "see docs" — must return zero matches; Grep for "as described" — must return zero matches)

   **Final Output**
   Write a completion report to outputs/ after this step completes:
   ```
   # vision-build-pipeline.md — Write Complete

   **File path:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md
   **Status:** All 18 verification checks passed
   **Phases written:** Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Self-Heal, Step 5, Final Output
   **Usage:** /vision-build-pipeline [PROJECT_DIR]
   ```

5. After writing: run all 18 verification checks from the plan's After state against the written file. For each check:
   - Read vision-build-pipeline.md
   - Confirm the specific condition listed in each check
   - If any check fails: fix that specific issue in the file before proceeding to the next check

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-build-pipeline.md exists (Glob to confirm at exact path)
- [ ] vision-build-pipeline.md file size > 0 bytes (Read to confirm)
- [ ] vision-build-pipeline.md frontmatter contains only "description" and "allowed-tools" keys (Read first 10 lines — confirm no other frontmatter keys)
- [ ] Phases 0 through 9 and Self-Heal are all present (Read — confirm heading "Phase 0" through "Phase 9" and "Self-Heal" exist)
- [ ] "AskUserQuestion" does not appear in the file (Grep for "AskUserQuestion" in vision-build-pipeline.md — must return 0 matches)
- [ ] "TBD" does not appear in the file (Grep for "TBD" — must return 0 matches)
- [ ] "see docs" does not appear in the file (Grep for "see docs" — must return 0 matches)
- [ ] SESSION_BUDGET = 6 appears in Phase 0 and Phase 9 (Grep for "SESSION_BUDGET" — must appear in both sections)
- [ ] No protected path was modified (C:\Users\Alexb\Documents\RiseDialapp\src\, public\, package.json, .env* were not written to)

---

## State Update
After all 9 verification checks pass:
1. Set flags.allChangesCommitted = true in state.json (this is the final flag — signals the objective was achieved)
2. Move "step-09-execute-command-file" from pendingSteps to completedSteps
3. Append to artifacts.filesWritten: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\.claude\\commands\\vision-build-pipeline.md"
4. Write STATE_FILE back preserving all other fields exactly
