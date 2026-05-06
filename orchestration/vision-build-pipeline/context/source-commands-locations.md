# Source Commands — Locations Reference
**Status:** IMMUTABLE — do not modify during pipeline execution
**Written by:** step-01-collect-source-commands
**Date:** 2026-05-05

This file contains every absolute path, output artifact path, schema structure, and phase/step name with exact line numbers extracted from all 4 source command files. All line numbers are from actual file reads.

---

## 1. Command File Absolute Paths

| Command | Absolute Path |
|---------|--------------|
| prep-vision | C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md |
| vision-to-docs | C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md |
| docs-to-build-v2 | C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md |
| autonomous-system-builder1 | C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md |

---

## 2. Output Artifact Paths Per Command

### 2.1 prep-vision.md Output Artifacts

| Artifact | Path Pattern | Notes |
|----------|-------------|-------|
| Vision folder | `[cwd]/vision-[custom-name]-[NN]/` | NN = next sequence number (01, 02, 03...) |
| VISION.md | `[cwd]/vision-[custom-name]-[NN]/VISION.md` | The only file written by this command |

Path determination logic (line 199): "Check the current working directory for existing folders matching `vision-*/` to determine the next sequence number"

---

### 2.2 vision-to-docs.md Output Artifacts

| Artifact | Path Pattern | Notes |
|----------|-------------|-------|
| Docs root folder | `[ProjectName]-Docs/` | In same dir as vision file, or cwd if inline |
| Master vision copy | `[ProjectName]-Docs/00-master-vision.md` | Exact copy, do not modify |
| Build order | `[ProjectName]-Docs/01-build-order.md` | Dependency map |
| Per-module SPEC | `[ProjectName]-Docs/modules/NN-[module-name]/SPEC.md` | Always present |
| Per-module SCHEMA | `[ProjectName]-Docs/modules/NN-[module-name]/SCHEMA.md` | Only if module has data structures |
| Per-module FLOW | `[ProjectName]-Docs/modules/NN-[module-name]/FLOW.md` | Always present |
| Per-module PROMPTS | `[ProjectName]-Docs/modules/NN-[module-name]/PROMPTS.md` | Only if module uses AI/LLM |
| Per-module BUILD-INSTRUCTIONS | `[ProjectName]-Docs/modules/NN-[module-name]/BUILD-INSTRUCTIONS.md` | Always present |
| Per-module checklist | `[ProjectName]-Docs/validation/checklists/NN-[module-name]-checklist.md` | One per module |

Path determination (lines 27–28): "Determine the output path from the vision (use the same directory the vision file is in, or the working directory if the vision was inline). Name the folder `[ProjectName]-Docs/`"

---

### 2.3 docs-to-build-v2.md Output Artifacts

All paths use resolved variables: BUILD_DIR = WORKSPACE_ROOT/[PROJECT_NAME]-Build

| Artifact | Absolute Path Pattern | Phase Produced |
|----------|----------------------|---------------|
| setup-state.json | `[BUILD_DIR]/setup-state.json` | Phase 0 |
| orchestration/ dir | `[BUILD_DIR]/orchestration/` | Phase 0 |
| context/ dir | `[BUILD_DIR]/context/` | Phase 0 |
| module-manifest.json | `[BUILD_DIR]/module-manifest.json` | Phase 1 |
| context-catalog.json | `[BUILD_DIR]/context-catalog.json` | Phase 2 |
| module-fragment-NN.md | `[BUILD_DIR]/module-fragment-[NN].md` (NN = zero-padded) | Phase 3 |
| refined-prompt.md | `[BUILD_DIR]/refined-prompt.md` | Phase 4 |
| context files | `[BUILD_DIR]/context/[file_name]` (from catalog entry file_name) | Phase 5 |
| orchestration state | `[BUILD_DIR]/orchestration/state.json` | Phase 6 |
| orchestration README | `[BUILD_DIR]/orchestration/README.md` | Phase 6 |
| prompt files | `[BUILD_DIR]/orchestration/prompt-NN.md` | Phase 6 |
| runner command | `[WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md` | Phase 7 |
| fix prompt (conditional) | `[BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md` | Phase 8 (on failure) |

---

### 2.4 autonomous-system-builder1.md Output Artifacts

All paths use resolved DESIGN block variables:
- ORCH_DIR = [PROJECT_ROOT]/orchestration/[SYSTEM_NAME]
- CONTEXT_DIR = [ORCH_DIR]/context
- PLANS_DIR = [ORCH_DIR]/plans
- PROMPTS_DIR = [ORCH_DIR]/prompts
- RUNNER_PATH = [PROJECT_ROOT]/.claude/commands/run-[SYSTEM_NAME].md (or [HOME]/.claude/commands/run-[SYSTEM_NAME].md)

| Artifact | Absolute Path Pattern | Sub-Agent |
|----------|----------------------|-----------|
| state.json | `[STATE_FILE]` = `[ORCH_DIR]/state.json` | Sub-agent 1 |
| step-plan.json | `[ORCH_DIR]/step-plan.json` | Sub-agent 1 |
| COLLECT prompt files | `[PROMPTS_DIR]/prompt-[NN].md` (for COLLECT steps) | Sub-agent 2 |
| PLAN prompt files | `[PROMPTS_DIR]/prompt-[NN].md` (for PLAN steps) | Sub-agent 3 |
| EXECUTE prompt files | `[PROMPTS_DIR]/prompt-[NN].md` (for EXECUTE steps) | Sub-agent 4 |
| runner slash command | `[RUNNER_PATH]` | Sub-agent 5 |
| context facts files | `[CONTEXT_DIR]/[domain]-facts.md` | Generated prompts write these at runtime |
| context locations files | `[CONTEXT_DIR]/[domain]-locations.md` | Generated prompts write these at runtime |
| plan files | `[PLANS_DIR]/[NN]-[task]-plan.md` | Generated prompts write these at runtime |

---

## 3. Schema Structures Defined Per Command

### 3.1 prep-vision.md Schemas

**VISION.md template structure** (lines 209–464):

```
# [PROJECT NAME] — Vision Document

<!-- METADATA -->
> Domain / Builder / Date / Status

## 1. PROJECT SUMMARY
  1.1 What This Builds
  1.2 The Problem It Solves
  1.3 Who Uses It
  1.4 End-to-End Success Signal

## 2. SYSTEM OVERVIEW
  2.1 Module List (table: # | Module Name | One-Line Description)
  2.2 System Boundary
       - Included
       - Explicitly NOT included
       - External dependencies (table: System | What It Provides | Required By Module)

## 3. MODULE SPECIFICATIONS (repeat 3.x per module)
  3.x [MODULE NAME]
    Purpose (one sentence)
    Trigger (table: Type | Specifics)
    Inputs (table: Field | Type | Source | Required? | Constraints)
    Outputs (table: Field | Type | Destination | Format / Example)
    Step-by-step process (numbered list with conditional branches)
    Edge cases (table: Scenario | System Behavior | User Notified? | Processing Continues?)
    Failure states (table: Failure Type | Recovery Action | Data Impact)
    AI/LLM used: Yes / No
    External integrations (table: Service | Purpose | Connection Method | Auth)
    Data stored (table: Field | Type | Storage Location | Retention Period)

## 4. INTEGRATION MAP
  4.1 Module Hand-offs (table: From | To | Data Passed | Timing | Condition)
  4.2 Full System Flow (numbered sequence)
  4.3 Parallel Execution

## 5. DATA SCHEMAS (repeat 5.x per entity)
  5.x [ENTITY NAME]
    Storage location
    Fields (table: Field | Type | Required | Constraints | Example Value)
    Lifecycle (Created by | Read by | Updated by | Deleted by)

## 6. AI/LLM SPECIFICATIONS (repeat 6.x per AI call)
  6.x [PROMPT NAME]
    Used in / Model / Temperature / Max output tokens / Task type
    System prompt (verbatim with {{variables}})
    User message template (verbatim with {{variables}})
    Injected variables (table: Variable | Type | Source Module/Field | Example Value)
    Expected output format (schema)
    Output validation
    On failure/unexpected output

## 7. CONSTRAINTS AND REQUIREMENTS
  7.1 Technology Decisions (table: Decision | Choice | Status | Reason)
  7.2 Performance Requirements (table: Metric | Requirement | Notes)
  7.3 Hard Constraints (list)

## 8. BUILD ORDER
  Table: # | Module | One-Line Description | Dependencies
  8.1 Integration Checkpoints (table: After Completing | Wire To | Verify By)

## 9. SUCCESS CRITERIA
  Table: # | Test Description | Pass Condition | Fail Condition
  9.1 End-to-End Smoke Test (numbered sequence)

## 10. OPEN DECISIONS
  Table: Decision | Options | Recommendation
```

---

### 3.2 vision-to-docs.md Schemas

**Folder structure schema** (lines 36–55): See Section 2.2 above.

**Per-document content requirements** (lines 63–74):
- SPEC.md: behavior, trigger, inputs, outputs, edge cases, failure states
- SCHEMA.md: field names, types, constraints, example values, relationships
- FLOW.md: numbered steps, explicit decision branches, external service names
- PROMPTS.md: actual prompts with {{variable_name}} injection points, expected output format
- BUILD-INSTRUCTIONS.md: sequential instructions, tooling, configuration, integration points, done criteria
- Checklists: binary pass/fail items, minimum 5 per module

**01-build-order.md required contents** (lines 95–101):
1. Ordered numbered list of modules with one-line description
2. Explicit dependency statement per module
3. Integration checkpoints
4. Single observable outcome confirming full system works

---

### 3.3 docs-to-build-v2.md Schemas

**setup-state.json schema** (lines 42–59):
```json
{
  "schema_version": "1",
  "project_slug": "[PROJECT_SLUG]",
  "docs_dir": "[DOCS_DIR]",
  "phases": {
    "0_setup": "completed",
    "1_map": "pending",
    "2_ground": "pending",
    "3_engineer": "pending",
    "4_synthesize": "pending",
    "5_write_context": "pending",
    "6_orchestrate": "pending",
    "7_runner": "pending"
  },
  "resume_from_phase": 1,
  "session_count": 1
}
```

**module-manifest.json schema** (lines 118–156):
```json
{
  "project": "[PROJECT_NAME]",
  "workspace_root": "[WORKSPACE_ROOT]",
  "docs_dir": "[DOCS_DIR]",
  "build_dir": "[BUILD_DIR]",
  "locked_tech": {
    "comment": "...",
    "example_keys": ["framework", "language", "auth", "cookie_name", "jwt_header", "database"]
  },
  "locked_constraints": ["...verbatim strings from docs..."],
  "modules": [
    {
      "index": 1,
      "name": "[module name]",
      "key": "[e.g. M1]",
      "docs_files": ["[absolute paths]"],
      "output_files": ["[absolute paths]"],
      "parallel_safe": true,
      "depends_on": ["[module keys]"],
      "spec_summary": "[one sentence]",
      "verification_criteria": ["[testable assertions]"]
    }
  ]
}
```

**context-catalog.json schema** (lines 196–217):
```json
{
  "entries": [
    {
      "file_name": "[slug].md",
      "category": "schema_values | auth_session | api_contracts | design_tokens | external_services",
      "prevents": "[specific hallucination prevented]",
      "required_by_modules": ["[module key]"],
      "values": [
        { "key": "cookie_name", "value": "risedial_session" }
      ]
    }
  ]
}
```

**module-fragment-NN.md structure** (lines 264–298):
```
# Module Fragment [NN]: [module name]
## Role
## Context (locked_tech + locked_constraints)
## What Must Be True After This Module
## Files to Change
  ### [exact file path]
  [COMPLETE file content in verbatim code block]
## Verification (checkboxes from verification_criteria)
## Failure Recovery
  If [condition]: [specific fix action]
```

**refined-prompt.md structure** (lines 327–360):
```
<role>...</role>
<context>locked_tech + locked_constraints</context>
<build_order>table: Index | Module Name | Key | Parallel Safe | Depends On</build_order>
## MODULE 01: [name]
[full fragment content verbatim]
---
## MODULE 02: [name]
[...]
## Refinement Report
  Modules Covered / Source Fragments / Locked Tech Values / Locked Constraints
```

**context file structure** (lines 396–414):
```markdown
# [file_name] — [category] Reference
**Role:** [prevents value]
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** [required_by_modules joined by comma]
**Date:** [YYYY-MM-DD]
---
## Values
**[key]:** `[value]`
```

**orchestration/state.json schema** (lines 453–466):
```json
{
  "project": "[PROJECT_NAME]",
  "scale": "SMALL | MEDIUM | LARGE",
  "totalSteps": 0,
  "pendingSteps": ["prompt-01", "prompt-02"],
  "completedSteps": [],
  "steps": {
    "prompt-01": {
      "status": "pending",
      "title": "[step title]",
      "context_files": ["[context file name]"]
    }
  }
}
```

**prompt-NN.md structure** (lines 474–498):
```markdown
# Step [NN]: [step title]
## Hard Constraints (5 items)
## Prerequisites
  State: [state.json path] — pendingSteps must contain "prompt-[NN]"
  Context files: [list each with full path]
## Task
  [Numbered sub-steps with exact file paths and specific observable actions]
## Verification
  - [ ] [testable assertion]
## State Update
  Move "prompt-[NN]" from pendingSteps to completedSteps
  Set steps["prompt-[NN]"].status = "complete"
```

**runner command frontmatter** (lines 528–532):
```
---
description: Run the [PROJECT_NAME] build pipeline. [...]
allowed-tools: Read Write Agent Bash
---
```

---

### 3.4 autonomous-system-builder1.md Schemas

**state.json schema** (lines 240–257):
```json
{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "[SYSTEM_NAME]",
  "buildTarget": "[PROJECT_ROOT]",
  "orchestration_dir": "[ORCH_DIR]",
  "completedSteps": [],
  "pendingSteps": [STEP_IDS array],
  "artifacts": {
    "filesWritten": [],
    "plansCreated": []
  },
  "flags": {
    "[FLAG_NAME]": false,
    "allChangesCommitted": false
  },
  "knownItems": {}
}
```

**step-plan.json schema** (lines 262–288):
```json
{
  "version": "1.0.0",
  "system": "[SYSTEM_NAME]",
  "total_steps": [integer],
  "session_budget": 6,
  "steps": [
    {
      "id": "[step-id]",
      "mode": "COLLECT | PLAN | EXECUTE",
      "task": "[description]",
      "prompt_file": "[PROMPTS_DIR]/prompt-[NN].md",
      "outputs": ["[absolute paths]"],
      "prerequisites": ["[flag names]"]
    }
  ]
}
```

**STEP_ID naming convention** (lines 140–148):
```
Format: "step-NN-mode-task"
  NN: zero-padded number starting at 01
  mode: collect | plan | execute (strictly alternating)
  task: 1–3 word kebab-case description
Example: ["step-01-collect-codebase", "step-02-plan-audit-fix", "step-03-execute-fix",
           "step-04-collect-verify", "step-05-plan-commit", "step-06-execute-commit"]
```

**Prompt file schema** (from SCHEMA_PROMPT reference — defined in `.claude/commands/autonomous-system-builder/prompt-schema.md`, loaded at line 199):
Each prompt file contains sections (per QC checks in lines 568–633):
- Mode header (QC1)
- Hard Constraints with mode lock (QC2)
- Prerequisites (flags + context files)
- Task (numbered sub-steps)
- Verification (binary items only — QC5)
- State Update (flag name + pendingSteps→completedSteps + artifact path — QC7)

**Runner slash command structure** (lines 496–558):
```
---
description: [...]
allowed-tools: Read Write Edit Bash Agent Glob Grep
---
## Configuration
SESSION_BUDGET  = 6
STATE_FILE      = [literal absolute path]
PROMPTS_DIR     = [literal absolute path]
PLANS_DIR       = [literal absolute path]
TOTAL_STEPS     = [integer]
## Anti-Hallucination Protocol (pre-EXECUTE checks)
## Execution Loop (steps 1–5)
## Completion Block
## Next-Session Block
## State File Write Rules
```

**DESIGN block variables** (lines 112–178):
```
SYSTEM_NAME       → first 3-5 significant words from OBJECTIVE, kebab-case
PROJECT_ROOT      → Bash pwd at invocation time
ORCH_DIR          → [PROJECT_ROOT]/orchestration/[SYSTEM_NAME]
STATE_FILE        → [ORCH_DIR]/state.json
CONTEXT_DIR       → [ORCH_DIR]/context
PLANS_DIR         → [ORCH_DIR]/plans
PROMPTS_DIR       → [ORCH_DIR]/prompts
RUNNER_PATH       → [PROJECT_ROOT]/.claude/commands/run-[SYSTEM_NAME].md (if .claude/commands/ exists)
                    OR [HOME]/.claude/commands/run-[SYSTEM_NAME].md (otherwise)
TOTAL_STEPS       → 6 (Q5=A), 9 (Q5=B), 12 (Q5=C), inferred (Q5=D)
SESSION_BUDGET    → always exactly 6 (hard constant)
STEP_IDS          → array of step ID strings
FLAG_NAMES        → 3-5 camelCase milestones + "allChangesCommitted" as last
CONTEXT_FILES     → one per COLLECT step: [CONTEXT_DIR]/[domain]-facts.md + [domain]-locations.md
PLAN_FILES        → one per PLAN step: [PLANS_DIR]/[NN]-[task]-plan.md
VERIFICATION_GATE → npx tsc --noEmit | pytest | npm test | "File exists and is non-empty" | custom
PROTECTED_FILES   → parsed from Q4 answer
SYSTEM_TYPE       → end-state | ongoing | hybrid
```

---

## 4. Phase/Step Names With Line Numbers

### 4.1 prep-vision.md Phases

| Phase Name | Line Number |
|-----------|------------|
| PHASE 1 — SYSTEM IDENTITY | 27 |
| PHASE 2 — COMPONENT DISCOVERY | 60 |
| PHASE 3 — PER-MODULE DEEP DIVE | 82 |
| PHASE 4 — INTEGRATION MAP | 125 |
| PHASE 5 — DATA SCHEMAS | 144 |
| PHASE 6 — AI/LLM SPECIFICATIONS | 155 |
| PHASE 7 — CONSTRAINTS AND DECISIONS | 169 |
| PHASE 8 — SUCCESS CRITERIA | 184 |
| PHASE 9 — SAVE | 193 |

### 4.2 vision-to-docs.md Phases

| Phase Name | Line Number |
|-----------|------------|
| Phase 1 — Resolve open implementation questions | 16 |
| Phase 2 — Generate the [ProjectName]-Docs/ folder | 26 |
| FOLDER STRUCTURE | 32 |
| WHAT EACH DOCUMENT MUST CONTAIN | 61 |
| HOW TO IDENTIFY OPEN QUESTIONS | 78 |
| BUILD ORDER RULES (for 01-build-order.md) | 93 |
| DOMAIN AGNOSTICISM | 104 |
| BEGIN | 117 |

### 4.3 docs-to-build-v2.md Phases

| Phase Name | Line Number |
|-----------|------------|
| Phase 0 — Setup (resume check section) | 32 |
| Phase 0 — Setup (main body) | 82 |
| Phase 1 — Map (Reasoning Agent) | 109 |
| Phase 2 — Ground (Reasoning Agent) | 173 |
| Phase 3 — Engineer (Serial Execution Agents) | 236 |
| Phase 4 — Synthesize (Execution Agent) | 313 |
| Phase 5 — Write Context (Serial Execution Agents) | 380 |
| Phase 6 — Orchestrate (Execution Agent) | 429 |
| Phase 7 — Runner (Execution Agent) | 518 |
| Phase 8 — Self-Heal (Triggered on Verification Failure) | 605 |
| Completion Report | 649 |
| You Are Done When | 675 |

### 4.4 autonomous-system-builder1.md Phases/Sections

| Phase/Section Name | Line Number |
|-------------------|------------|
| PHASE 0 — INPUT CAPTURE | 6 |
| PHASE 1 — VISION ALIGNMENT | 24 |
| Batch 1 — Objective, type, stack | 27 |
| Batch 2 — Constraints, scope, verification | 55 |
| Batch 3 — Confirmation | 81 |
| PHASE 2 — SYSTEM DESIGN DERIVATION | 106 |
| PHASE 3 — DIRECTORY SETUP | 186 |
| PHASE 4 — PARALLEL AGENT SPAWN | 209 |
| Sub-agent 1 — State Files | 215 |
| Sub-agent 2 — COLLECT Prompt Files | 293 |
| Sub-agent 3 — PLAN Prompt Files | 354 |
| Sub-agent 4 — EXECUTE Prompt Files | 416 |
| Sub-agent 5 — Runner Slash Command | 472 |
| PHASE 5 — VALIDATION | 565 |
| QC1 — Mode header match | 568 |
| QC2 — Mode lock specificity | 574 |
| QC3 — PLAN precedes EXECUTE | 579 |
| QC4 — EXECUTE task starts with verify | 584 |
| QC5 — Binary verification items only | 589 |
| QC6 — EXECUTE verification gate present | 594 |
| QC7 — State update completeness | 599 |
| QC8 — No placeholders in runner next-session block | 604 |
| QC9 — No unverified identifiers in prompts | 609 |
| QC10 — Anti-hallucination per EXECUTE spawn | 614 |
| QC11 — Step count invariant | 619 |
| QC12 — Bootstrap wrote files only | 623 |
| QC13 — Clarification before generation | 629 |
| PHASE 6 — COMPLETION REPORT | 638 |

---

## 5. Cross-Command File Path Dependencies

| Consumer Command | Requires Output From | File/Folder Path |
|-----------------|---------------------|-----------------|
| vision-to-docs | prep-vision | `[cwd]/vision-[name]-[NN]/VISION.md` |
| docs-to-build-v2 | vision-to-docs | `[ProjectName]-Docs/` folder with all files |
| docs-to-build-v2 | (external) | `[WORKSPACE_ROOT]/micro-prompt-build-system/` (MPBS_DIR) |
| autonomous-system-builder1 | (internal) | `.claude/commands/autonomous-system-builder/state-schema.md` |
| autonomous-system-builder1 | (internal) | `.claude/commands/autonomous-system-builder/prompt-schema.md` |
| autonomous-system-builder1 | (internal) | `.claude/commands/autonomous-system-builder/runner-schema.md` |
| autonomous-system-builder1 | (internal) | `.claude/commands/autonomous-system-builder/principles.md` |

**Note:** `autonomous-system-builder1.md` is a standalone command — it does NOT consume output from prep-vision or vision-to-docs. It builds its own orchestration system from a raw objective.
