# Prompt 06: Execute Integration
**Mode:** EXECUTE
**Step ID:** step-06-execute-integration

## Prerequisites
- flags.integrationPlanDerived = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Plan file to read: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs — this step creates the integrated design document. Do NOT write to context/, plans/, or prompts/ directories.
2. **Token limit:** 32,000 tokens max. Split into multiple writes if needed.
3. **No truncation:** Write the complete integrated design document.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Verification gate:** integrated-design.md must exist and be non-empty after writing.
6. **Anti-hallucination:** All design decisions, constants, and patterns must come from context files and the plan — not from memory.
7. **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json

---

## Anti-Hallucination Protocol
Run before writing integrated-design.md:
1. Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md. Cannot execute without a verified plan. Do not proceed."
2. Read the plan file. The "Target file" field names C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md. Glob for directory C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs. If not found: stop and report "Target directory does not exist."
3. Both checks pass: proceed to Task.

---

## Task

1. Verify plan file exists: Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md. If not found: stop and report "Plan file missing — cannot execute without verified plan."

2. Read plan file at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\05-integration-plan.md completely. The After state specifies integrated-design.md must answer 7 design questions (Q1-Q7) with full detail, include the unified state schema with SESSION_BUDGET=6, the complete VISION.md 10-section template, the complete docs folder structure, the self-heal mechanism spec, and the runner body spec. Record these requirements exactly.

3. Read supporting context files:
   - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-facts.md
   - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\analysis-locations.md
   - C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md

4. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md with the complete integrated design. The file MUST contain ALL of the following sections:

   **## Q1 — Vision Capture Self-Answering Loop**
   Describe the exact self-answering loop for all prep-vision questions: search → evidence → derive → record. List every evidence source (Glob patterns, specific files to Read, Bash commands like `git log`). Specify the derive rule for each question type. Specify that "TBD" and "Unknown" are never acceptable — first-principles derivation always produces an answer from evidence in the codebase and tech stack context. For every question type, define what "first-principles derivation" means concretely (e.g., for "primary language": Glob for *.ts, *.js, *.py, count files, highest count wins). The loop is: Step 1 — read the question text; Step 2 — identify evidence sources for that question type; Step 3 — run Glob/Grep/Read/Bash commands to gather evidence; Step 4 — apply derive rule to evidence to produce an answer; Step 5 — record answer in VISION.md template slot; repeat for all questions.

   **## Q2 — Docs Structure Connection**
   Define the exact folder structure: [PROJECT_NAME]-Docs/ with subdirectories and files as follows:
   - 00-master-vision.md (the VISION.md output from Phase 1)
   - 01-build-order.md (the ordered module list derived from dependency analysis)
   - modules/ containing one subdirectory per module named NN-[module-name]/ where NN is zero-padded build order index
   - Each module subdirectory contains: SPEC.md (functional specification), SCHEMA.md (data models and types), FLOW.md (sequence diagrams and data flow), PROMPTS.md (agent prompt templates for building this module), BUILD-INSTRUCTIONS.md (step-by-step build checklist)
   - validation/ containing checklists/ containing one file per module named NN-[module-name]-checklist.md
   Define how vision-to-docs connects to docs-to-build-v2: the output directory [PROJECT_NAME]-Docs/ produced by vision-to-docs is passed as the DOCS_DIR argument to docs-to-build-v2. The docs-to-build-v2 command reads 00-master-vision.md and the modules/ structure to drive its orchestration. The connection is a directory path — no file format conversion needed.

   **## Q3 — Combined Orchestration Pattern**
   Describe how COLLECT→PLAN→EXECUTE from autonomous-system-builder1 combines with serial per-phase agents from docs-to-build-v2. Specify:
   - The macro pattern is COLLECT→PLAN→EXECUTE where COLLECT = Phase 0-4 (vision capture, docs generation, module manifest, context catalog, module fragments), PLAN = Phase 5-6 (synthesis, context file writing), EXECUTE = Phase 7-9 (orchestration generation, runner writing, commit)
   - Within EXECUTE, each module follows docs-to-build-v2's serial per-phase pattern: one agent per module per phase, completing fully before the next module's phase begins
   - TOTAL_STEPS = module_count × 3 (three EXECUTE phases per module: COLLECT module data, PLAN module build, EXECUTE module build)
   - STEP_IDS format: "step-NN-[phase-name]-[module-slug]" where NN is zero-padded index
   - Orchestration artifact generation spawns 4 agents simultaneously in a single batch: (1) COLLECT prompt template agent, (2) PLAN prompt template agent, (3) EXECUTE prompt template agent, (4) QC and self-heal spec agent
   - 13-point QC runs after each module's EXECUTE phase completes, with inline fix actions: if any QC check fails, spawn a fix agent immediately before advancing to the next module

   **## Q4 — Unified State Schema**
   Write the complete setup-state.json schema with all fields. The schema must include:
   - SESSION_BUDGET: 6 (integer, the maximum number of agent sessions before forcing a checkpoint)
   - session_count: 0 (integer, incremented each time the runner resumes)
   - resume_from_phase: 0 (integer, the phase index to start from on resume)
   - current_phase: "pending" (string)
   - phases: object with one key per phase (phase_0 through phase_9 and phase_selfheal), each with status field ("pending" | "in_progress" | "completed") and optional started_at, completed_at timestamps
   - artifacts: object with filesWritten array (absolute paths of all files written so far), filesModified array, filesDeleted array
   - flags: object with one boolean key per milestone flag (analysisPlanDerived, analysisDocWritten, integrationPlanDerived, integrationDocWritten, commandFilePlanDerived, allChangesCommitted)
   - pendingSteps: array of step ID strings not yet started
   - completedSteps: array of step ID strings that have completed successfully
   - project_slug: string (derived from PROJECT_DIR basename, lowercased, hyphens replacing spaces)
   - project_dir: string (absolute path to PROJECT_DIR)
   - last_updated: ISO 8601 timestamp string

   Include the exact resume logic:
   - If setup-state.json is absent: first run — write the file with all phases set to pending, session_count=0, resume_from_phase=0
   - If setup-state.json is present: increment session_count; if session_count > SESSION_BUDGET: stop and write a checkpoint report at outputs/checkpoint-[project_slug].md then exit; otherwise: skip all phases where status = "completed", start from the first phase where status = "pending" or "in_progress"

   **## Q5 — Hallucination Prevention Placement**
   Specify exactly where and how hallucination prevention operates:
   - Context catalog entries are written in Phase 7 of the pipeline, one file per catalog category. There are 5 categories: (1) schema_values — all database table names, column names, enum values; (2) auth_session — authentication provider names, session field names, token types; (3) api_contracts — all API endpoint paths, HTTP methods, request/response field names; (4) design_tokens — all CSS variables, color names, spacing values, font names; (5) external_services — all third-party service names, SDK import paths, environment variable names
   - Each context catalog file is written with an IMMUTABLE header: "# CONTEXT CATALOG — [CATEGORY] — DO NOT MODIFY THIS FILE\n# All values in this file are ground truth. Use them verbatim. Do not invent alternatives."
   - The Anti-Hallucination Protocol appears in the runner at the top of the execution loop, before every EXECUTE agent spawn. Its text is: "Before writing any code or file content: (1) Read all context catalog files in context/. (2) For every identifier you write (table names, column names, API paths, CSS variables, service names), verify it appears verbatim in a context catalog file. (3) If an identifier is not in the catalog: stop, do not guess, add it to the catalog first. Never invent identifiers."
   - Phase 1 (Vision Capture) applies hallucination prevention by requiring evidence citations for every VISION.md answer: each answer must include the source file path and line number that supports it
   - Phase 2 (Docs Generation) applies hallucination prevention by requiring that all module names, dependency names, and tech stack items in the docs folder come from direct reads of package.json, *.config.* files, and import statements — never from assumption

   **## Q6 — Zero User Interaction Gap Resolution**
   List every category of potential gap where a command might otherwise ask the user a question, and specify the resolution algorithm for each. The AskUserQuestion tool must never appear anywhere in vision-build-pipeline.md.

   Gap categories and resolution algorithms:

   - **Project name gap:** Search for name field in package.json (Read → JSON parse → .name). Fallback: basename of PROJECT_DIR with hyphens replacing spaces.
   - **Tech stack gap:** Glob for package.json, requirements.txt, Gemfile, go.mod, Cargo.toml, pom.xml. Read whichever exist. Extract dependency names. Fallback: infer from file extensions found via Glob("**/*.{ts,js,py,rb,go,rs,java}").
   - **Primary framework gap:** Read package.json dependencies and devDependencies. Match against known framework names (next, react, vue, angular, svelte, express, fastapi, django, rails). Highest-confidence match wins. Fallback: "unknown-framework" (never block on this).
   - **Database/ORM gap:** Glob for *.prisma, drizzle.config.*, knexfile.*, sequelize.config.*, alembic.ini. Read whichever exist. Fallback: search import statements via Grep for common ORM imports.
   - **Auth provider gap:** Grep for "supabase/auth", "next-auth", "clerk", "auth0", "firebase/auth" in src/. First match wins. Fallback: "no-auth-detected" (document in VISION.md, do not block).
   - **Deployment target gap:** Glob for vercel.json, netlify.toml, fly.toml, Dockerfile, render.yaml, .railway.*. First match wins. Fallback: infer from package.json scripts (build command patterns). Last fallback: "unknown-deployment".
   - **Module boundary gap:** Read existing directory structure in src/ (Glob for src/*/). Each top-level subdirectory = one module. Fallback: read all files and cluster by import relationships (Grep for import patterns).
   - **Environment variable gap:** Glob for .env.example, .env.local.example, .env.template. Read whichever exist. Extract variable names. Fallback: Grep for "process.env." and "import.meta.env." across src/.
   - **API endpoint gap:** Glob for src/app/api/**/*.ts, src/pages/api/**/*.ts, routes/**/*.*, src/**/*.router.ts. Read whichever exist. Extract path patterns. Fallback: Grep for "router.get|router.post|app.get|app.post".
   - **Build output gap:** Read package.json scripts.build. Parse the output directory flag (--outDir, --out, -o, "out:"). Fallback: Glob for dist/, build/, .next/, out/ and use whichever exists.

   For every gap type: if the primary search yields a result, use it. If not, apply the stated fallback. If the fallback also yields nothing, derive from first principles using the tech stack already identified. Never produce "Unknown" or "TBD" as a final answer — always commit to a derived value.

   **## Q7 — Self-Healing Mechanism**
   Specify the complete self-heal mechanism:
   - Trigger condition: any item in a verification checklist fails after a phase's EXECUTE agent completes
   - Detection: the runner reads the verification checklist embedded in each EXECUTE prompt and evaluates each item by running the specified check (Glob, Read, Grep) against the written file
   - Spawn mechanism: spawn ONE Agent with the self-heal prompt
   - Input to the self-heal agent: (1) the expected schema or content specification from the plan file, (2) the actual contents of the failing file (Read in full), (3) the specific checklist item that failed (quoted verbatim), (4) the phase number and step ID
   - Output from the self-heal agent: a file named fix-phaseN-[PROJECT_SLUG].md written to outputs/ where N is the phase number and PROJECT_SLUG is the project slug from state.json. This file must contain: "## What Failed" (the checklist item verbatim), "## Expected" (the expected value or structure from the plan), "## Found" (the actual content that was present), "## How to Repair" (step-by-step instructions for fixing the issue)
   - "PRIOR ATTEMPT FAILED" injection: before re-running the EXECUTE agent, inject the text "PRIOR ATTEMPT FAILED: Read fix-phaseN-[PROJECT_SLUG].md before writing. Address every item in How to Repair." at the top of the agent prompt
   - Constraint: the self-heal agent must write the fix file before any error is surfaced to the user. Never surface the error first. The fix file is the error report.
   - Retry limit: maximum 2 self-heal attempts per phase. If both fail: write a final-failure-phaseN-[PROJECT_SLUG].md to outputs/ and stop the pipeline, leaving state.json with the phase status = "failed".

   **## Unified State Schema (Full)**
   Write the complete setup-state.json as a JSON code block:

   ```json
   {
     "SESSION_BUDGET": 6,
     "session_count": 0,
     "resume_from_phase": 0,
     "current_phase": "pending",
     "project_slug": "",
     "project_dir": "",
     "last_updated": "",
     "phases": {
       "phase_0": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_1": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_2": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_3": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_4": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_5": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_6": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_7": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_8": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_9": { "status": "pending", "started_at": null, "completed_at": null },
       "phase_selfheal": { "status": "pending", "started_at": null, "completed_at": null }
     },
     "artifacts": {
       "filesWritten": [],
       "filesModified": [],
       "filesDeleted": []
     },
     "flags": {
       "analysisPlanDerived": false,
       "analysisDocWritten": false,
       "integrationPlanDerived": false,
       "integrationDocWritten": false,
       "commandFilePlanDerived": false,
       "allChangesCommitted": false
     },
     "pendingSteps": [],
     "completedSteps": []
   }
   ```

   **## Complete VISION.md Template**
   Write the complete 10-section VISION.md template with all section headings and slot descriptions. The 10 sections are:
   1. Project Identity (name, slug, one-line description, primary URL)
   2. Problem Statement (the problem being solved, who has it, why existing solutions are insufficient)
   3. Solution Overview (what the product does, the core value proposition, key differentiators)
   4. Tech Stack (primary language, framework, database, ORM, auth provider, deployment target, key dependencies)
   5. Architecture Overview (system components, their relationships, data flow between them)
   6. Module Map (ordered list of modules with name, purpose, dependencies, and build priority)
   7. Data Model (key entities, their fields, and relationships — derived from schema files or inferred from src/)
   8. API Surface (all API endpoints: path, method, purpose, auth requirement)
   9. Environment Configuration (all environment variables: name, purpose, example value)
   10. Build Constraints (performance requirements, security requirements, accessibility requirements, deployment constraints)

   **## Complete Docs Folder Structure**
   Write the exact folder structure as a tree:
   ```
   [PROJECT_NAME]-Docs/
   ├── 00-master-vision.md
   ├── 01-build-order.md
   ├── modules/
   │   ├── 01-[first-module-name]/
   │   │   ├── SPEC.md
   │   │   ├── SCHEMA.md
   │   │   ├── FLOW.md
   │   │   ├── PROMPTS.md
   │   │   └── BUILD-INSTRUCTIONS.md
   │   └── NN-[nth-module-name]/
   │       ├── SPEC.md
   │       ├── SCHEMA.md
   │       ├── FLOW.md
   │       ├── PROMPTS.md
   │       └── BUILD-INSTRUCTIONS.md
   └── validation/
       └── checklists/
           ├── 01-[first-module-name]-checklist.md
           └── NN-[nth-module-name]-checklist.md
   ```

   **## Runner Body Specification**
   Write the complete runner body specification with all literal values (no bracket placeholders). The runner must include:
   - Configuration block at top with SESSION_BUDGET = 6  # adjust only if project has more than 6 phases requiring agent work
   - State file path derived from PROJECT_DIR at runtime
   - Anti-Hallucination Protocol text (quoted in full, not referenced)
   - Execution loop structure: for each pending phase, run the phase agent, run verification checks, on failure trigger self-heal, on success update state
   - Completion Block: when all phases complete, write final-report.md to outputs/, set flags.allChangesCommitted = true, print "Pipeline complete. All phases finished. Report at: [outputs path]"
   - Next-Session Block: when SESSION_BUDGET is reached before completion, write checkpoint-[project_slug].md to outputs/ with current progress, set resume_from_phase to next pending phase index, print "Session budget reached. Resume with: /vision-build-pipeline [PROJECT_DIR]"

5. Write completely — no truncation, no "TBD", no "as described above".

6. Read the file after writing. Confirm all 7 Q-headings are present.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\integrated-design.md exists (Glob to confirm)
- [ ] integrated-design.md file size > 0 bytes (Read to confirm)
- [ ] integrated-design.md contains heading "## Q1" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q2" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q3" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q4" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q5" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q6" (Read to confirm)
- [ ] integrated-design.md contains heading "## Q7" (Read to confirm)
- [ ] integrated-design.md contains the text "SESSION_BUDGET=6" (Read to confirm)
- [ ] No protected path was modified (C:\Users\Alexb\Documents\RiseDialapp\src\, public\, package.json, .env*)

---

## State Update
After all 11 verification checks pass:
1. Set flags.integrationDocWritten = true in state.json
2. Move "step-06-execute-integration" from pendingSteps to completedSteps
3. Append to artifacts.filesWritten: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\outputs\\integrated-design.md"
4. Write STATE_FILE back preserving all other fields exactly
