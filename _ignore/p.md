You are a senior prompt engineer. Your task is to analyze four source command files already loaded in context, synthesize their best features into an integrated design, and write a single new command file at `.claude/commands/vision-build-pipeline.md`.

Do NOT ask the user any questions. Execute all steps autonomously.

---

## STEP 1 — EXTRACT FROM EACH COMMAND

For each of the four commands already in context (prep-vision.md, vision-to-docs.md, docs-to-build-v2.md, autonomous-system-builder1.md), extract and record internally:

1. Core mechanism (what it fundamentally does)
2. Input requirements
3. Output artifacts (file names and schemas)
4. State management strategy (resume, session budgets, in_progress/completed transitions)
5. Agent strategy (serial vs. parallel, how many agents, what each is responsible for)
6. Verification — how each phase validates its own output
7. Every user interaction point (AskUserQuestion calls) — note what question is asked and why
8. Hallucination prevention mechanisms (context catalogs, locked values, context files)
9. Error recovery (self-heal, Phase 8, QC fixes)
10. Weaknesses and design gaps

---

## STEP 2 — DERIVE THE INTEGRATED DESIGN

Synthesize a new design using these rules:

**From prep-vision.md — take:**
- All 9 interview phases with every sub-question (Q1.1 through Q9.1) — this becomes the self-interview blueprint
- The full VISION.md output template (all 10 sections, all tables, all subsections)
- All four core rules: decomposition rule, question clarity rule, completeness rule, no-skip rule
- The per-module 7-question deep dive format (Q3.x.1–Q3.x.7: trigger, inputs, outputs, steps, edge cases, failures, data storage)

**From vision-to-docs.md — take:**
- The 7-category gap-scanning logic (unresolved technical decisions, missing integration details, ambiguous edge cases, scheduling/thresholds, user interaction touchpoints, data model gaps, measurement/success criteria)
- The complete docs folder structure: `[ProjectName]-Docs/00-master-vision.md`, `01-build-order.md`, `modules/NN-[name]/`, `validation/checklists/`
- The 5-document-per-module standard: SPEC.md, SCHEMA.md (data structures only), FLOW.md, PROMPTS.md (AI only), BUILD-INSTRUCTIONS.md
- Binary validation checklists: 5+ pass/fail items per module, completable by running or reading the system
- Build order rules: true dependencies, integration checkpoints, single observable "done" definition

**From docs-to-build-v2.md — take:**
- The setup-state.json resume system exactly as Steps A–F: absent-file initialization, present-file resume with session_count increment, in_progress update before each phase, completed update after each phase, SESSION_BUDGET stop with exact resume message
- SESSION_BUDGET = 6 (not 3)
- module-manifest.json full schema: locked_tech, locked_constraints (verbatim MUST NOT/never/do not directives), modules array with index, name, key, docs_files, output_files, parallel_safe, depends_on, spec_summary, verification_criteria
- context-catalog.json schema: 5 categories only (schema_values, auth_session, api_contracts, design_tokens, external_services), each entry with file_name, category, prevents, required_by_modules, values array
- Context file structure: IMMUTABLE status header, Role/Status/Depends on/Required by/Date fields, Values section
- Phase 8 self-heal pattern: triggered immediately on any verification failure, writes `fix-phaseN-[slug].md` with What Failed / What Was Expected / What Was Found / How to Repair / Verification / Instructions for User — NEVER surfaces an error to the user before this file is written
- Per-phase embedded verification checklists with immediate Phase 8 trigger on failure

**From autonomous-system-builder1.md — take:**
- Parallel agent spawning: spawn all independent agents simultaneously in one batch using the Agent tool — never wait for one before spawning another when they are independent
- COLLECT→PLAN→EXECUTE step ID naming: format `step-NN-mode-task`, strict alternation collect→plan→execute per cycle
- Anti-hallucination protocol: before spawning any EXECUTE agent, (1) confirm plan file exists via Glob, (2) confirm the target file named in the plan exists via Glob — if either fails, spawn a recovery COLLECT agent before proceeding
- FLAG_NAMES: domain-specific camelCase milestone flags derived from OBJECTIVE nouns, always ending with "allChangesCommitted"
- state.json flags object with boolean per milestone
- step-plan.json schema: every step has id, mode, task, prompt_file, outputs, prerequisites
- The full 13-point QC framework (QC1–QC13): mode header match, mode lock specificity, PLAN precedes EXECUTE, EXECUTE starts with verify, binary verification items, EXECUTE verification gate present, state update completeness, no placeholders in runner, no unverified identifiers, anti-hallucination per EXECUTE spawn, step count invariant, bootstrap wrote files only, clarification before generation
- Fix each QC failure inline before moving to the next check

**KEY INTEGRATION INNOVATION — Self-Answering Vision Capture:**
Replace every AskUserQuestion call from prep-vision.md with this self-answering loop. For EACH question in Phases 1–8:
1. State the question verbatim as a labeled heading
2. Identify what evidence would answer it (which files to read, what to grep, what git history to inspect)
3. Search: Glob for relevant files, Read package.json / README / existing docs / .env.example / schema files / route files / component files / tsconfig.json / git log
4. Record evidence with exact file paths and line numbers or config values found
5. State the derived answer — quote exact values where found
6. Apply the decomposition rule internally: if the answer is still vague, decompose into 2–3 sub-searches and repeat
7. If no evidence exists anywhere: apply first-principles reasoning from the project type and tech stack, record as "Derived (no evidence): [reasoning]"
8. Record the final answer in the correct VISION.md template section

The system MUST NEVER block on user input. Zero AskUserQuestion calls in the final command file.

---

## STEP 3 — WRITE THE COMMAND FILE

Write the complete command to `.claude/commands/vision-build-pipeline.md`.

### Frontmatter — use exactly:
description: Self-directed vision-to-execution pipeline. Captures vision by self-answering prep-vision questions from codebase evidence, generates full docs folder, builds executable COLLECT→PLAN→EXECUTE orchestration system with anti-hallucination context catalog, 13-point QC, self-heal on failure, and writes a runner command. Zero user interaction. Resume anytime: /vision-build-pipeline [PROJECT_DIR]. allowed-tools: Read Write Edit Bash Agent Glob Grep


### Command body — write all phases below in order:

---

**PATH RESOLUTION BLOCK** (runs before any phase):

Parse `$ARGUMENTS`:
- If `$ARGUMENTS` ends in `-Docs` or `-Docs/` and resolves to an existing directory: set DOCS_DIR = that path, set SKIP_VISION_AND_DOCS = true, derive PROJECT_NAME by stripping the suffix
- If `$ARGUMENTS` resolves to a `.md` file: set VISION_FILE = that path, set SKIP_VISION = false, SKIP_DOCS = false
- If `$ARGUMENTS` resolves to a directory (not a Docs folder): set PROJECT_ROOT = that path
- If `$ARGUMENTS` is empty: run `pwd` in Bash and set PROJECT_ROOT to that result

Resolve all paths — derive from string manipulation of $ARGUMENTS, do NOT run pwd unless $ARGUMENTS is empty:
PROJECT_ROOT    = [resolved absolute path to project]
PROJECT_NAME    = [basename of PROJECT_ROOT]
WORKSPACE_ROOT  = [parent of PROJECT_ROOT]
BUILD_DIR       = [PROJECT_ROOT]/.pipeline
DOCS_DIR        = [BUILD_DIR]/[PROJECT_NAME]-Docs
PROJECT_SLUG    = [PROJECT_NAME lowercased, spaces→hyphens]
RUNNER_PATH     = [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md



Print all resolved paths before proceeding. Do not proceed if PROJECT_ROOT does not exist.

---

**PHASE 0 — SETUP**

1. Run Bash: `mkdir -p "[BUILD_DIR]/orchestration" "[BUILD_DIR]/context" "[BUILD_DIR]/plans" "[BUILD_DIR]/prompts"`
2. Implement setup-state.json resume system (Steps A–F):
   - Step A: Use Read to check if `[BUILD_DIR]/setup-state.json` exists
   - Step B (absent — first run): Write `[BUILD_DIR]/setup-state.json` with all phases set to "pending" except "0_setup" = "completed", resume_from_phase = 1, session_count = 1, session_phases_completed = 0. Proceed to Phase 1.
   - Step C (present — resume): Read the file. Extract resume_from_phase and session_count. Increment session_count by 1. Reset session_phases_completed to 0. Write back. Output: "Resuming from Phase [resume_from_phase]. Session [session_count]." Skip all phases with status "completed". Proceed to the first "pending" phase.
   - Step D: Before starting each phase: update that phase's status to "in_progress" in setup-state.json
   - Step E: After each phase completes: update status to "completed", increment resume_from_phase
   - Step F (SESSION_BUDGET check): After each phase completes, increment session_phases_completed. If session_phases_completed equals SESSION_BUDGET (6): write state, then output exactly: "SESSION_BUDGET reached. Pipeline paused after Phase [N]. Re-invoke `/vision-build-pipeline [PROJECT_ROOT]` in a new Claude Code chat to continue from Phase [N+1]." Stop.

setup-state.json schema:
```json
{
  "schema_version": "1",
  "project_slug": "[PROJECT_SLUG]",
  "project_root": "[PROJECT_ROOT]",
  "session_count": 1,
  "session_phases_completed": 0,
  "phases": {
    "0_setup": "completed",
    "1_vision_capture": "pending",
    "2_docs_generation": "pending",
    "3_manifest": "pending",
    "4_context_catalog": "pending",
    "5_fragments": "pending",
    "6_synthesis": "pending",
    "7_context_files": "pending",
    "8_orchestration": "pending",
    "9_runner": "pending"
  },
  "resume_from_phase": 1,
  "SESSION_BUDGET": 6
}
Verification:

 BUILD_DIR/orchestration/, context/, plans/, prompts/ all exist (Glob to confirm)
 setup-state.json exists and is valid JSON
 PROJECT_ROOT directory exists on disk
PHASE 1 — SELF-INTERVIEW VISION CAPTURE

Spawn ONE Agent with this complete prompt (substitute all bracketed values before spawning):

You are conducting a self-directed vision discovery session for the project at [PROJECT_ROOT]. Your output is ONE file: [BUILD_DIR]/VISION.md. Do not write any other file.

You will work through all 8 discovery phases below. For EVERY question, apply this loop:
(1) State the question as a labeled heading.
(2) State what evidence would answer it.
(3) Search: Glob for relevant files, then Read the most relevant ones (package.json, README.md, tsconfig.json, .env.example, existing docs, schema files, route/api files, component files, git log output via Bash git log --oneline -20).
(4) Record all evidence found with file paths and exact quoted values.
(5) State the derived answer. Quote exact values where found.
(6) Apply decomposition: if any part of the answer is still vague, sub-search and re-derive.
(7) If no evidence exists: write "Derived (no evidence): [first-principles reasoning based on tech stack and project type]".
(8) Map the answer to its VISION.md template section.

NEVER ask the user. NEVER leave any template field blank. NEVER write "TBD" or "Unknown".

PHASE 1 — SYSTEM IDENTITY:
Q1.1: What is the name of this project?
Q1.2: Complete this sentence — This system takes ___ as input and produces ___ as output.
Q1.3: What specific problem does this system eliminate? Who experiences it?
Q1.4: What is the single observable outcome that proves this system is fully working?
Q1.5: What type of system is this? (software product / AI pipeline / content operation / business system / hybrid)

PHASE 2 — COMPONENT DISCOVERY:
Q2.1: What are the major components or capabilities? Name each one with a single responsibility.
Q2.2: Does this system use any AI or LLM calls? Which components? What does the AI do in each?
Q2.3: What external services, APIs, databases, or third-party tools does it connect to? Name each and which component uses it.
Q2.4: Where does a human interact with this system? Name every touchpoint, what they see, what action they take, what happens next.

PHASE 3 — PER-MODULE DEEP DIVE:
For every module identified in Phase 2, answer all 7 questions:
Q3.x.1: What causes [module] to start running?
Q3.x.2: What data does [module] receive as input? Name each piece, its type, source, required/optional status, constraints.
Q3.x.3: What does [module] produce when it finishes? Name each output, its type, destination, format.
Q3.x.4: Walk through [module] step by step from input to output. For every decision point, state both branches explicitly.
Q3.x.5: What are the three most likely bad-input or unexpected-situation scenarios? What should the system do in each?
Q3.x.6: What are the ways [module] could fail even with valid input? What is the recovery action? What data state results?
Q3.x.7: Does [module] store any data? What? Where? How long?

PHASE 4 — INTEGRATION MAP:
Q4.1: For each pair of modules that interact — what exactly is passed between them? Is the handoff synchronous or asynchronous?
Q4.2: Walk through the full system from first user/external action to final output as a numbered sequence.
Q4.3: Do any modules run in parallel? What synchronizes them? What happens on timing mismatch?

PHASE 5 — DATA SCHEMAS:
Q5.x: For each data entity — what fields does it have? Type, required/optional, constraints, example values? Which module creates it, reads it, updates it, deletes it?

PHASE 6 — AI/LLM SPECIFICATIONS:
Q6.x: For each AI call — what is it doing? What input variables? What output format exactly? Which model? What happens on failure?
(If no AI: record "N/A — confirmed, no LLM calls in this system.")

PHASE 7 — CONSTRAINTS AND DECISIONS:
Q7.1: What technology choices are already fixed? (language, framework, database, auth provider, hosting)
Q7.2: Are there performance requirements? (response time, requests/day, concurrent users)
Q7.3: What hard constraints cannot be violated?
Q7.4: What does this system explicitly NOT do?

PHASE 8 — SUCCESS CRITERIA:
Q8.1: List 5–10 binary observable things you would check to confirm this system is fully working.
Q8.2: Describe the full end-to-end smoke test: first action to final observable success state.

After working through all phases, write [BUILD_DIR]/VISION.md using this exact template — populate every section:


# [PROJECT NAME] — Vision Document

> **Domain:** [software | automation | content | business-ops | physical | hybrid]
> **Builder:** Claude Code / Self-Directed Pipeline
> **Date:** [YYYY-MM-DD]
> **Status:** Ready for docs generation

## 1. PROJECT SUMMARY
### 1.1 What This Builds
### 1.2 The Problem It Solves
### 1.3 Who Uses It
### 1.4 End-to-End Success Signal

## 2. SYSTEM OVERVIEW
### 2.1 Module List (table: # | Module Name | One-Line Description)
### 2.2 System Boundary
**Included:** [list]
**Explicitly NOT included:** [list]
**External dependencies:** (table: System | What It Provides | Required By Module)

## 3. MODULE SPECIFICATIONS
[One 3.x section per module with: Purpose, Trigger, Inputs table, Outputs table, Step-by-step process, Edge cases table, Failure states table, AI/LLM used, External integrations table, Data stored table]

## 4. INTEGRATION MAP
### 4.1 Module Hand-offs (table: From | To | Data Passed | Timing | Condition)
### 4.2 Full System Flow (numbered sequence)
### 4.3 Parallel Execution

## 5. DATA SCHEMAS
[One 5.x section per entity with: Storage location, Fields table, Lifecycle]

## 6. AI/LLM SPECIFICATIONS
[One 6.x section per AI call with: Used in, Model, Temperature, Max tokens, Task type, System prompt, User message template, Injected variables table, Expected output format, Output validation, On failure]

## 7. CONSTRAINTS AND REQUIREMENTS
### 7.1 Technology Decisions (table: Decision | Choice | Status | Reason)
### 7.2 Performance Requirements (table or "No hard requirements")
### 7.3 Hard Constraints

## 8. BUILD ORDER
(table: # | Module | One-Line Description | Dependencies)
### 8.1 Integration Checkpoints (table: After Completing | Wire To | Verify By)

## 9. SUCCESS CRITERIA
(table: # | Test Description | Pass Condition | Fail Condition)
### 9.1 End-to-End Smoke Test (numbered sequence)

## 10. OPEN DECISIONS
(table: Decision | Options | Recommendation — empty = zero open decisions)
After writing, respond with exactly:
Phase 1 complete. Modules identified: [N]. File: [BUILD_DIR]/VISION.md

Verification:

 [BUILD_DIR]/VISION.md exists and is non-empty
 Contains all 10 top-level sections (1–10)
 Section 2.1 Module List contains at least 1 module
 Every Section 3.x exists for every module in Section 2.1
 No section contains "TBD", "Unknown", or blank table rows
 Section 9 Success Criteria contains at least 5 binary items
On failure: trigger self-heal phase immediately (see Self-Heal Phase below). Pass expected schema, actual file contents, and specific failed checklist item.

PHASE 2 — DOCS GENERATION

Spawn ONE Agent with this complete prompt:

You are a senior architect converting a completed vision into build-ready documentation. Your outputs are all files inside [BUILD_DIR]/[PROJECT_NAME]-Docs/. Do not write any other files.

Read [BUILD_DIR]/VISION.md in full.

Scan for these 7 categories of gaps:

Unresolved technical decisions (named capability but unspecified implementation)
Missing integration details (third-party systems without connection method)
Ambiguous edge cases (behavior on failure/out-of-range not stated)
Scheduling/frequency/thresholds that are vague
User interaction touchpoints where UX path is undefined
Data model gaps (fields or relationships implied but not named)
Measurement and success criteria missing observable assertions
For each gap: resolve it by searching the codebase at [PROJECT_ROOT]. Use Glob to find relevant files, Read them, extract evidence. Never ask the user. If no evidence: derive from first principles and record "Derived: [reasoning]".

Generate the complete docs folder at [BUILD_DIR]/[PROJECT_NAME]-Docs/ with this structure:


[PROJECT_NAME]-Docs/
├── 00-master-vision.md         ← exact copy of VISION.md
├── 01-build-order.md           ← ordered list + dependencies + integration checkpoints + "done" definition
└── modules/
    └── NN-[module-name]/
        ├── SPEC.md             ← behavior, triggers, inputs, outputs, edge cases, failure states
        ├── SCHEMA.md           ← only if module has data structures
        ├── FLOW.md             ← numbered steps, every decision branch explicit
        ├── PROMPTS.md          ← only if module uses AI (exact prompts, {{variable}} injection points)
        └── BUILD-INSTRUCTIONS.md ← literal sequential build instructions
└── validation/
    └── checklists/
        └── NN-[module-name]-checklist.md  ← 5+ binary pass/fail items per module
Rules:

01-build-order.md must contain: ordered numbered module list, explicit dependency statement per module, integration checkpoints (where two modules wire together), and the single observable "done" outcome
SPEC.md: no ambiguity — if a detail is unspecified, resolve it and note "derived decision"
FLOW.md: numbered steps only, every decision point has branches for all outcomes, every external service named explicitly
BUILD-INSTRUCTIONS.md: written so a builder who has never seen the project can build that module — what to create, where it lives, what it connects to, what to test, what "done" looks like
Checklist items: binary pass/fail, verifiable by running or reading the system, no subjective items
Minimum 5 checklist items per module
After writing all files, respond with exactly:
Phase 2 complete. Modules documented: [N]. Files written: [count]. Folder: [BUILD_DIR]/[PROJECT_NAME]-Docs/

Verification:

 [BUILD_DIR]/[PROJECT_NAME]-Docs/ exists and contains 00-master-vision.md and 01-build-order.md
 modules/ contains one subfolder per module from VISION.md Section 2.1
 Every module subfolder contains at minimum SPEC.md, FLOW.md, BUILD-INSTRUCTIONS.md
 validation/checklists/ contains one checklist per module with 5+ items each
 01-build-order.md contains integration checkpoints and "done" definition
 No file contains "TBD", "see docs", or blank sections
PHASE 3 — MODULE MANIFEST

Spawn ONE Agent with this prompt (DOCS_DIR = [BUILD_DIR]/[PROJECT_NAME]-Docs/):

You are a project mapper. Your ONLY output is [BUILD_DIR]/module-manifest.json.

Read every file in [BUILD_DIR]/[PROJECT_NAME]-Docs/ recursively. Start with 00-master-vision.md and 01-build-order.md.

Produce [BUILD_DIR]/module-manifest.json with this exact schema:


{
  "project": "[PROJECT_NAME]",
  "project_root": "[PROJECT_ROOT]",
  "docs_dir": "[BUILD_DIR]/[PROJECT_NAME]-Docs",
  "build_dir": "[BUILD_DIR]",
  "locked_tech": {
    "comment": "Every MUST NOT change, do not modify, and tech stack declaration from the docs"
  },
  "locked_constraints": [
    "Every MUST NOT, never, and do not directive from ANY docs file — verbatim strings"
  ],
  "modules": [
    {
      "index": 1,
      "name": "[module name]",
      "key": "M1",
      "docs_files": ["[absolute paths to every docs file for this module]"],
      "output_files": ["[absolute paths to every file this module creates or modifies]"],
      "parallel_safe": true,
      "depends_on": [],
      "spec_summary": "[one sentence: what must be true after this module completes]",
      "verification_criteria": ["[testable, observable assertion from the module checklist]"]
    }
  ]
}
Rules: include ALL modules from 01-build-order.md in build order. locked_tech must contain every value an agent would otherwise hallucinate (framework versions, cookie names, JWT claims, algorithm names, table names, env var prefixes). locked_constraints: every verbatim MUST NOT/never/do not directive from any docs file. verification_criteria: derived from the module's validation checklist. All paths: absolute. Values absent from docs: write as null.

After writing, respond with: Phase 3 complete. Module count: [N]. File: [BUILD_DIR]/module-manifest.json

Verification:

 [BUILD_DIR]/module-manifest.json exists and is valid JSON
 modules array is non-empty
 Every module has index, name, key, docs_files, output_files, spec_summary, verification_criteria
 locked_tech is a non-empty object
 locked_constraints is a non-empty array of strings
 project_root value matches the resolved PROJECT_ROOT (no placeholder)
PHASE 4 — CONTEXT CATALOG

Spawn ONE Agent with this prompt:

You are a context cataloger. Your ONLY output is [BUILD_DIR]/context-catalog.json.

Read [BUILD_DIR]/module-manifest.json in full. Read every docs file listed in the manifest's modules[*].docs_files arrays.

Identify every domain-specific value that sub-agents will need and cannot reliably generate. Organize by ONLY these five categories:

schema_values: table names, column names, data types, enum strings, constraint strings, primary/foreign key names
auth_session: cookie names, JWT claim names, JWT header names, algorithm strings, session token formats
api_contracts: request/response field names, HTTP status codes, endpoint paths, error codes
design_tokens: CSS variable names, exact color hex values, font stacks, spacing scale, breakpoints
external_services: environment variable names, API key format patterns, service-specific config values
Do NOT write context files in this phase — only write context-catalog.json.
Do NOT read any files outside the docs folder and module-manifest.json.


{
  "entries": [
    {
      "file_name": "[slug].md",
      "category": "schema_values | auth_session | api_contracts | design_tokens | external_services",
      "prevents": "[specific hallucination this context file prevents]",
      "required_by_modules": ["[module key]"],
      "values": [
        { "key": "[name]", "value": "[exact value]" }
      ]
    }
  ]
}
After writing, respond with: Phase 4 complete. Context categories: [N]. File: [BUILD_DIR]/context-catalog.json

Verification:

 [BUILD_DIR]/context-catalog.json exists and is valid JSON
 entries array is non-empty
 Every entry has file_name, category, prevents, required_by_modules, values
 No entry has an empty values array
 Every category is one of the five permitted values
 No file_name contains placeholder text
PHASE 5 — MODULE FRAGMENTS (Serial — one agent per module)

Read [BUILD_DIR]/module-manifest.json. Extract the modules array. For each module IN INDEX ORDER, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next.

For module at index NN, spawn ONE Agent with this prompt (substitute all values):

You are a module prompt engineer. Your ONLY output is [BUILD_DIR]/module-fragment-[NN].md.

Your module slice (all information you need — do NOT read any other file):
[paste the full JSON object for this module from module-manifest.json, verbatim]

Your locked constraints (apply ALL to every code block and instruction you write):
[paste the locked_constraints array as a numbered list, verbatim]

Write [BUILD_DIR]/module-fragment-[NN].md with exactly this structure:


# Module Fragment [NN]: [module name]
## Role
[one sentence: who is executing this module]
## Context
[all locked_tech values as key: value pairs]
[all locked_constraints as a numbered list]
## What Must Be True After This Module
[spec_summary verbatim]
## Files to Change
### [exact file path from output_files[0]]
[COMPLETE file content or complete edit instruction in a verbatim code block]
[repeat for every file in output_files]
## Verification
- [ ] [each item from verification_criteria]
## Failure Recovery
- If [observable failure condition]: [specific fix action with exact command or file to check]
Before writing: verify one "### [file path]" subsection exists for every file in output_files — count them; if count does not match, add missing sections. No section says "see docs", "TBD", "as described", or references an external file.

After writing, respond with: Fragment [NN] complete. File: [BUILD_DIR]/module-fragment-[NN].md

After ALL modules processed, verify:

 One module-fragment-NN.md file exists per module in module-manifest.json
 Each fragment contains Role, Context, What Must Be True, Files to Change, Verification, Failure Recovery sections
 No fragment contains "see docs", "TBD", "as described"
 Fragment file count equals module-manifest.json modules array length
PHASE 6 — SYNTHESIS

Spawn ONE Agent with this prompt:

You are a prompt synthesizer. Your ONLY output is [BUILD_DIR]/refined-prompt.md.

Read [BUILD_DIR]/module-manifest.json in full. Read every [BUILD_DIR]/module-fragment-NN.md file in index order.
Do NOT read the original docs folder. All module content comes from the fragment files.

Write [BUILD_DIR]/refined-prompt.md with this structure:


<role>
[From locked_tech: "You are a [framework] developer building [project]. Implement each module exactly as specified, applying all locked constraints to every file you write."]
</role>
<context>
[All locked_tech values as key: value pairs — one per line]
[All locked_constraints as a numbered list]
</context>
<build_order>
| Index | Module Name | Key | Parallel Safe | Depends On |
[One row per module from manifest, in index order]
</build_order>
## MODULE 01: [module name]
[Full content of module-fragment-01.md, verbatim]
---
## MODULE 02: [module name]
[Full content of module-fragment-02.md, verbatim]
---
[Continue for every module]
## Refinement Report
### Modules Covered: [N]
### Source Fragments: [list all fragment file names]
### Locked Tech Values Carried Forward: [count]
### Locked Constraints Applied: [count]
After writing, respond with: Phase 6 complete. Modules: [N]. File: [BUILD_DIR]/refined-prompt.md

Verification:

 refined-prompt.md exists and is non-empty
 Contains <role>, <context>, <build_order> blocks
 Contains one ## MODULE section per module (count matches manifest modules array length)
 Contains ## Refinement Report section
 No MODULE section says "see docs" or references an external file
PHASE 7 — CONTEXT FILES (Serial — one agent per catalog entry)

Read [BUILD_DIR]/context-catalog.json. For each entry IN SEQUENCE, spawn ONE Agent at a time:

You are a context file writer. Your ONLY output is [BUILD_DIR]/context/[file_name].

Your context entry (all information you need — do NOT read any other file):
[paste the full JSON object for this entry from context-catalog.json, verbatim]

Write [BUILD_DIR]/context/[file_name] with exactly this structure:


# [file_name] — [category] Reference
**Role:** [prevents value]
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** [required_by_modules joined by comma]
**Date:** [YYYY-MM-DD]
---
## Values
[For each value in entry.values:]
**[key]:** `[value]`
After writing, respond with: Context file complete. File: [BUILD_DIR]/context/[file_name]

After ALL context files written, verify:

 One context file exists per entry in context-catalog.json
 Every file contains Role, Status, Depends on, Required by, Date header fields
 Status is "IMMUTABLE" in every file
 Every file contains a Values section with all key-value pairs
 Context file count equals context-catalog.json entries array length
PHASE 8 — ORCHESTRATION (Parallel Agent Batch + 13-Point QC)

Read [BUILD_DIR]/module-manifest.json to derive:

TOTAL_STEPS: module count × 3 (one COLLECT, one PLAN, one EXECUTE per module)
STEP_IDS: array in format "step-NN-mode-task" with strict collect→plan→execute alternation per module
FLAG_NAMES: domain-specific camelCase flags from module names, ending with "allChangesCommitted"
VERIFICATION_GATE: derive from locked_tech — if TypeScript/Next.js: "npx tsc --noEmit"; if Python: "pytest"; if JS/Node: "npm test"; if no code: "File exists and is non-empty"
Spawn FOUR Agents simultaneously in a single batch:

Agent A — State Files:

Write [BUILD_DIR]/orchestration/state.json:


{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "[PROJECT_NAME]",
  "buildTarget": "[PROJECT_ROOT]",
  "orchestration_dir": "[BUILD_DIR]/orchestration",
  "completedSteps": [],
  "pendingSteps": [all STEP_IDS],
  "artifacts": { "filesWritten": [], "plansCreated": [] },
  "flags": { [each FLAG_NAME]: false, "allChangesCommitted": false },
  "knownItems": {}
}
After writing: verify completedSteps.length + pendingSteps.length = TOTAL_STEPS. If not: fix pendingSteps.

Write [BUILD_DIR]/orchestration/step-plan.json:


{
  "version": "1.0.0",
  "system": "[PROJECT_NAME]",
  "total_steps": TOTAL_STEPS,
  "session_budget": 6,
  "steps": [
    { "id": "[step-id]", "mode": "COLLECT|PLAN|EXECUTE", "task": "[description]",
      "prompt_file": "[BUILD_DIR]/orchestration/prompts/prompt-NN.md",
      "outputs": ["[files this step produces]"],
      "prerequisites": ["[flag names that must be true before this step]"] }
  ]
}
Rules: every EXECUTE step lists the flag from its preceding PLAN step as a prerequisite. Every step after step-01 has at least one prerequisite flag.

Agent B — COLLECT Prompt Files:

For each COLLECT step in STEP_IDS, write [BUILD_DIR]/orchestration/prompts/prompt-NN.md:


# Step [NN]: [task description]
## Mode: COLLECT
## Hard Constraints
1. Write ONLY to [BUILD_DIR]/context — no other directories.
2. Output file size MUST NOT exceed 32,000 tokens.
3. Do not truncate any file.
4. After completing, update [BUILD_DIR]/orchestration/state.json per State Update section.
## Prerequisites
[For step-01: "None. This is the first step."]
[For subsequent COLLECT steps: list the flag set by the preceding EXECUTE step]
Context files to read before executing: [list with absolute paths]
## Task
1. Read [BUILD_DIR]/orchestration/state.json. Verify this step ID is in pendingSteps. If not: stop and report "[step-id] not in pendingSteps."
2. Locate all relevant source files using Glob patterns derived from the module's objective
3. Read each located file; extract patterns, function names, line numbers relevant to this module
4. Record findings with verbatim quotes and exact line numbers — no paraphrase
5. Write findings to [BUILD_DIR]/context/[domain]-facts.md (complete — no truncation)
6. Write [BUILD_DIR]/context/[domain]-locations.md listing every exact target with absolute path and line number
## Verification
- [ ] [BUILD_DIR]/context/[domain]-facts.md exists and file size > 0 bytes (Glob to confirm)
- [ ] Every file path listed in facts.md resolves to an existing file on disk (Glob each)
- [ ] The string "[placeholder]" does not appear in any context file written this step (Grep to confirm)
## State Update
- Set flags.[relevantFlag] = true
- Move "[step-id]" from pendingSteps to completedSteps
- Append each context file written to artifacts.filesWritten (absolute paths)
- Write [BUILD_DIR]/orchestration/state.json (preserve all other fields exactly)
Agent C — PLAN Prompt Files:

For each PLAN step in STEP_IDS, write [BUILD_DIR]/orchestration/prompts/prompt-NN.md:


# Step [NN]: [task description]
## Mode: PLAN
## Hard Constraints
1. Write ONLY to [BUILD_DIR]/plans — no other directories.
2. Output file size MUST NOT exceed 32,000 tokens.
3. Do not truncate any file.
4. After completing, update state.json per State Update section.
## Prerequisites
Flag [preceding COLLECT flag] must be true. Context files: [list from the corresponding COLLECT step, with absolute paths]
## Task
1. Read [BUILD_DIR]/orchestration/state.json. Verify all prerequisite flags are true. If any false: stop and report "Prerequisite flag [name] is false."
2. Read [context files from corresponding COLLECT step — absolute paths].
3. From context, identify exact targets: absolute file paths, function names, line numbers. All identifiers from context files — never from memory.
4. Write [BUILD_DIR]/plans/NN-[task]-plan.md with these exact fields:
   - **Scope:** specific files and functions — no vague descriptions
   - **Before state:** verbatim quote from source file (exact characters)
   - **After state:** exact target content after the change
   - **Target file:** absolute path (confirmed from context file)
   - **Target location:** line number or function name (confirmed from context file)
   - **Verification test:** exact command the EXECUTE step will run to confirm success
   - **DO NOT TOUCH:** [PROTECTED_FILES if any]
5. Read the actual target file and confirm Before state appears exactly. If not found: stop and report "Before state does not match target file — context may be stale."
## Verification
- [ ] [BUILD_DIR]/plans/NN-[task]-plan.md exists and file size > 0 bytes
- [ ] Plan file contains a "Before state" field with a verbatim quote
- [ ] Plan file contains an "After state" field with exact target content
- [ ] Target file path named in plan exists on disk (Glob to confirm)
## State Update
- Set flags.[planCompleteFlag] = true
- Move "[step-id]" from pendingSteps to completedSteps
- Append plan file path to artifacts.plansCreated
- Write state.json (preserve all other fields exactly)
Agent D — EXECUTE Prompt Files:

For each EXECUTE step in STEP_IDS, write [BUILD_DIR]/orchestration/prompts/prompt-NN.md:


# Step [NN]: [task description]
## Mode: EXECUTE
## Hard Constraints
1. Write ONLY to application code in [PROJECT_ROOT]. Do NOT write to context/, plans/, or prompts/.
2. Output file size MUST NOT exceed 32,000 tokens.
3. Do not truncate any file. Write each file completely or not at all.
4. After completing, update state.json per State Update section.
5. Use Write tool only. Do not use Edit on files that do not yet exist.
## Prerequisites
Flag [preceding PLAN flag] must be true. Plan file: [absolute path to plan file].
## Anti-Hallucination Protocol (run before Task step 3)
1. Confirm plan file exists: Glob for [plan file absolute path]. If not found: stop and report "Plan file missing. Cannot execute."
2. Confirm the target file named in the plan exists: Glob for that path. If not found: stop and report "Target file not found. Discrepancy must be investigated."
3. After both pass: proceed to Task.
## Task
1. Verify plan file [absolute path] exists (Glob). If not found: stop and report.
2. Read the plan file. Record Before state and After state fields verbatim.
3. Read the target source file. Confirm it contains the plan's Before state character-for-character. If not: stop and report "Source does not match plan's Before state. Do not proceed."
4. Apply the change described in the plan's After state to the target file. Write the complete file — no truncation.
5. Run [VERIFICATION_GATE]. If exits with errors: fix them before proceeding. Cannot complete with errors remaining.
6. Read the target file again. Confirm it now contains the exact After state from the plan.
## Verification
- [ ] Target file contains exact After state content from the plan (Read and confirm)
- [ ] `[VERIFICATION_GATE]` exits with code 0
- [ ] No protected file was modified: `git diff --name-only` confirms no protected paths appear
## State Update
- Set flags.[executeCompleteFlag] = true
- Move "[step-id]" from pendingSteps to completedSteps
- Append each modified file's absolute path to artifacts.filesWritten
- Write state.json (preserve all other fields exactly)
Wait for all four agents to complete.

Run 13-Point QC — fix each failure inline before moving to the next:

QC1 — Mode header match: every prompt file's Mode header must match the mode in step-plan.json (COLLECT/PLAN/EXECUTE uppercase). Fix: rewrite header to match.
QC2 — Mode lock specificity: Hard Constraint #1 names exactly one directory. Fix: rewrite to name only the correct single directory.
QC3 — PLAN precedes EXECUTE: every EXECUTE step has an immediately preceding PLAN step in step-plan.json. Fix: re-order steps array and update state.json pendingSteps.
QC4 — EXECUTE starts with verify: Task step 1 in every EXECUTE file contains "Verify plan file" and "stop and report". Fix: prepend correct step 1.
QC5 — Binary verification items: no Verification item contains "correct", "appropriate", "looks right", or "seems" without an exact criterion. Fix: rewrite to name exact expected value.
QC6 — EXECUTE verification gate present: every EXECUTE Verification section contains the VERIFICATION_GATE command. Fix: add "- [ ] [VERIFICATION_GATE] exits with code 0".
QC7 — State update completeness: every State Update section contains (1) exact flag name, (2) "from pendingSteps to completedSteps", (3) artifact path appended. Fix: rewrite to include all three.
QC8 — Anti-hallucination per EXECUTE: every EXECUTE prompt file contains the Anti-Hallucination Protocol section. Fix: add the protocol before the Task section.
QC9 — No unverified identifiers: every file path and flag name in the Task section is declared in Prerequisites or Hard Constraints. Fix: add undeclared identifiers to Prerequisites.
QC10 — Step count invariant: completedSteps.length + pendingSteps.length = TOTAL_STEPS in state.json. Fix: rewrite pendingSteps to exactly match STEP_IDS.
QC11 — COLLECT outputs declared: every COLLECT step's outputs array in step-plan.json lists the context files it will write. Fix: add missing output paths.
QC12 — Bootstrap wrote files only: all file writes during this pipeline generation are under BUILD_DIR and RUNNER_PATH only. Fix: report "QC12 FAILED: application code touched during bootstrap. Manual review required."
QC13 — All phases completed before runner: confirm setup-state.json shows phases 1–8 as "completed" before Phase 9 spawns. Fix: report "QC13 FAILED: runner spawned before all phases complete."

After all 13 pass, write [BUILD_DIR]/orchestration/README.md listing all steps with index, title, mode, and pending status.

Phase 8 verification:

 [BUILD_DIR]/orchestration/state.json exists and is valid JSON
 [BUILD_DIR]/orchestration/step-plan.json exists and is valid JSON
 One prompt-NN.md file exists per step in state.json.pendingSteps
 Every prompt-NN.md contains Hard Constraints, Prerequisites, Anti-Hallucination Protocol (EXECUTE only), Task, Verification, State Update sections
 state.json.pendingSteps.length equals count of prompt-NN.md files
 All 13 QC checks passed (no failures remaining)
SELF-HEAL PHASE (triggered on verification failure in any phase — not in normal sequence)

Trigger: when any phase's verification checklist has a failed item.

Spawn ONE Agent with this prompt:

You are a fix prompt writer. Your ONLY output is [BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md.

You have been triggered because Phase [N] ([PHASE_NAME]) failed verification.

Inputs (do NOT read any other file):

Expected artifact: [paste expected output schema for the failed phase verbatim]
Actual artifact: [paste full contents of what was written, or "nothing was written"]
Failure reason: [paste the specific verification checklist item that failed]
Write [BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md:


# Fix Prompt: Phase [N] — [PHASE_NAME]
## What Failed
[One sentence: the specific verification item that failed and why.]
## What Was Expected
[Expected schema pasted inline.]
## What Was Found
[Actual artifact contents, or "nothing was written."]
## How to Repair
[The Phase [N] agent prompt verbatim, with this injected at top: "PRIOR ATTEMPT FAILED: [failure reason]. Avoid this by: [specific corrective instruction]."]
## Verification
[The verification checklist for Phase [N] as checkboxes.]
## Instructions for User
Send this file to a fresh Claude Code session. It contains everything needed to re-run Phase [N] in isolation.
After writing, respond with: Fix prompt written. File: [full path]. Send it to a fresh Claude Code chat.

PHASE 9 — RUNNER COMMAND

Spawn ONE Agent with this prompt:

You are a runner command writer. Your ONLY output is [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md.

Read ONLY: [BUILD_DIR]/orchestration/state.json. Count entries in pendingSteps. This is TOTAL_STEPS.

Write [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md with this exact frontmatter (only these two fields):


---
description: Run the [PROJECT_NAME] build pipeline. Executes the next pending step, verifies state advancement, and loops up to SESSION_BUDGET steps. Resume anytime: /run-[PROJECT_SLUG].
allowed-tools: Read Write Edit Bash Agent Glob Grep
---
Then write the command body — substitute ALL bracketed values with resolved strings. No variables, no placeholders:


## Configuration
SESSION_BUDGET  = 6  # adjust: floor(context_limit / avg_prompt_complexity)
STATE_FILE      = [BUILD_DIR]/orchestration/state.json
PROMPTS_DIR     = [BUILD_DIR]/orchestration/prompts
PLANS_DIR       = [BUILD_DIR]/plans
CONTEXT_DIR     = [BUILD_DIR]/context
TOTAL_STEPS     = [integer from state.json.pendingSteps.length]
PROJECT_ROOT    = [PROJECT_ROOT — literal absolute path]

IMPORTANT: PROJECT_ROOT above is the resolved absolute path written literally. Do NOT run pwd.

## Anti-Hallucination Protocol
Run before spawning ANY EXECUTE-mode step agent:
1. Glob for the plan file path in PLANS_DIR. If not found: spawn COLLECT recovery agent.
2. Read the plan file — Glob for the target file it names. If not found: spawn COLLECT recovery agent.
3. After any recovery: re-run both checks. If they pass: proceed. If they fail again: stop and report to user.

## Execution Loop
1. Read STATE_FILE. Parse completedSteps and pendingSteps.
2. steps_this_session = 0
3. If pendingSteps is empty: print Completion Block and stop.
4. LOOP — repeat while pendingSteps not empty AND steps_this_session < 6:
   a. current_step = pendingSteps[0]
   b. Read PROMPTS_DIR/[current_step].md in full (find by matching Step ID header)
   c. If current_step contains "-execute-": run Anti-Hallucination Protocol before step d
   d. Spawn ONE Agent with full prompt file contents as the prompt
   e. Wait for agent to complete
   f. Read STATE_FILE. Verify current_step is now in completedSteps. If still in pendingSteps: stop and report "Step [current_step] did not update state.json. Manual inspection required."
   g. steps_this_session = steps_this_session + 1
   h. Print: "Step [current_step] complete ([steps_this_session]/6 this session, [completedSteps.length]/[TOTAL_STEPS] total)."
5. If pendingSteps empty: print Completion Block. If steps_this_session = 6 and pendingSteps not empty: print Next-Session Block.

## Completion Block
====================================
BUILD COMPLETE — [PROJECT_NAME]
====================================
All [TOTAL_STEPS] steps finished. Review artifacts: see state.json > artifacts section.

## Next-Session Block
====================================
SESSION BUDGET REACHED (6/6 this session)
====================================
Open a new chat and run: /run-[PROJECT_SLUG]

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from front
- completedSteps: append current_step to end
- flags: set the flag for the completed step to true (reference step-plan.json for mapping)
Do not modify: version, bootstrap_complete, project, buildTarget, orchestration_dir, artifacts, knownItems
Before finalizing: verify no [bracket] placeholders remain in Configuration, Completion Block, or Next-Session Block. If any found: replace with resolved values.

After writing, respond with: Phase 9 complete. File: [RUNNER_PATH]. Steps: [TOTAL_STEPS]. Invoke: /run-[PROJECT_SLUG]

Phase 9 verification:

 [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md exists
 Frontmatter contains only description and allowed-tools — no other fields
 SESSION_BUDGET = 6 with comment # adjust: floor(context_limit / avg_prompt_complexity) is present
 PROJECT_ROOT is a literal absolute path string (not a variable or placeholder)
 TOTAL_STEPS is an integer matching state.json.pendingSteps.length
 No [bracket] placeholders remain in Configuration, Completion Block, or Next-Session Block
 Anti-Hallucination Protocol is inside the execution loop, conditioned on "-execute-" step mode
COMPLETION REPORT

After all phases complete, output:


/vision-build-pipeline complete.

Project:     [PROJECT_NAME]
Root:        [PROJECT_ROOT]
Build:       [BUILD_DIR]

Phase 0  — Setup:            Directories created, state initialized
Phase 1  — Vision Capture:   Self-interview complete (0 user questions asked) → VISION.md
Phase 2  — Docs:             [N] modules documented → [PROJECT_NAME]-Docs/
Phase 3  — Manifest:         module-manifest.json ([N] modules, [N] locked constraints)
Phase 4  — Context Catalog:  context-catalog.json ([N] categories)
Phase 5  — Fragments:        [N] module-fragment files (serial)
Phase 6  — Synthesis:        refined-prompt.md
Phase 7  — Context Files:    [N] context files — all IMMUTABLE (serial)
Phase 8  — Orchestration:    [N] prompt files, 13/13 QC checks passed (4 agents parallel)
Phase 9  — Runner:           run-[PROJECT_SLUG].md ([N] steps)

Total agents spawned: [sum]
To run the build:     /run-[PROJECT_SLUG]
To resume pipeline:   /vision-build-pipeline [PROJECT_ROOT]
STEP 4 — VERIFY THE WRITTEN FILE
After writing .claude/commands/vision-build-pipeline.md, verify all of the following. Fix any failure inline before reporting completion:

 File exists at .claude/commands/vision-build-pipeline.md and is non-empty (Read to confirm)
 Frontmatter contains only description and allowed-tools — no other keys
 All 10 phases (0–9) plus Self-Heal phase are present
 Phase 0 contains the full setup-state.json schema and Steps A–F
 Phase 1 agent prompt contains all 8 discovery phases with every sub-question listed (Q1.1–Q8.2)
 Phase 1 agent prompt contains the 8-step self-answering loop (search, evidence, derive, record)
 Phase 1 agent prompt contains the full VISION.md template with all 10 sections
 Phase 2 agent prompt contains the 7-category gap scan and the full docs folder structure
 Phase 8 spawns 4 agents simultaneously in a single batch
 Phase 8 contains all 13 QC checks with fix actions for each
 Phase 8 EXECUTE prompt template contains the Anti-Hallucination Protocol section
 Phase 9 runner contains SESSION_BUDGET = 6 with the comment
 Phase 9 runner contains the Anti-Hallucination Protocol inside the execution loop
 Self-Heal phase is present and triggered on verification failure, not in normal sequence
 SESSION_BUDGET = 6 appears in both setup-state.json schema (Phase 0) and the runner (Phase 9)
 No AskUserQuestion calls appear anywhere in the command file
 No [bracket] placeholder text remains in any section that gets written literally to disk
 Completion report is present with all phases listed