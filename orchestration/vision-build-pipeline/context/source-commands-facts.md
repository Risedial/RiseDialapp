# Source Commands — Facts Reference
**Status:** IMMUTABLE — do not modify during pipeline execution
**Written by:** step-01-collect-source-commands
**Date:** 2026-05-05

This file contains verbatim extractions from all 4 source command files. Every quote is taken directly from the file at the exact line number cited. No paraphrasing.

---

## COMMAND 1: prep-vision.md

**File path:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md
**Total lines:** 465

---

### 1.1 Core Mechanism

What it fundamentally does (verbatim, lines 3–11):

> "Interviews you through structured AskUserQuestion sessions to produce a zero-ambiguity VISION.md document — ready to feed directly into /vision-to-docs with 0 clarifying questions needed."

> "You are a senior systems architect conducting a structured discovery session. Your job is to extract a complete, unambiguous vision from the user through AskUserQuestion tool calls, then write it into a finished VISION.md."

**Standard of done** (verbatim, lines 11–12):

> "The VISION.md you produce must cause `/vision-to-docs` to ask zero clarifying questions. Every gap that command scans for — technical decisions, integration details, edge cases, scheduling/thresholds, user interaction touchpoints, data models, and success criteria — must be pre-filled and specific."

---

### 1.2 Input Requirements

Input is entirely human-provided via AskUserQuestion tool calls across 9 phases (lines 27–192). No file path argument. The command is invoked without arguments; all content comes from interactive user responses.

Core rules governing input processing (verbatim, lines 17–24):

> "**Decomposition rule:** If any answer is vague, abstract, or contains words like 'probably', 'maybe', 'something like', 'I think', 'etc.', or names an unnamed component — immediately decompose into 2–3 concrete sub-questions using AskUserQuestion. Never transcribe a vague answer into the doc."

> "**Question clarity rule:** Every question you ask must be pre-analyzed. The user spends their mental energy ANSWERING, not INTERPRETING."

> "**Completeness rule:** Do not advance from one phase to the next until every answer in the current phase is specific and unambiguous."

> "**No-skip rule:** All phases are mandatory. If a phase seems irrelevant (e.g., no AI used), confirm this explicitly with the user and write 'N/A — confirmed' in the corresponding section."

---

### 1.3 Output Artifacts

Single output artifact: VISION.md (lines 193–204):

> "1. Check the current working directory for existing folders matching `vision-*/` to determine the next sequence number (01, 02, 03...).
> 2. Create the folder `vision-[custom-name]-[NN]/`
> 3. Write the completed VISION.md to `vision-[custom-name]-[NN]/VISION.md` using the template below
> 4. Confirm: 'Vision saved to `vision-[custom-name]-[NN]/VISION.md`. Run `/vision-to-docs vision-[custom-name]-[NN]/VISION.md` to generate full build documentation.'"

**VISION.md template structure** (lines 209–464) includes 10 top-level sections:
- Section 1: PROJECT SUMMARY (1.1 What This Builds, 1.2 The Problem It Solves, 1.3 Who Uses It, 1.4 End-to-End Success Signal)
- Section 2: SYSTEM OVERVIEW (2.1 Module List, 2.2 System Boundary)
- Section 3: MODULE SPECIFICATIONS (3.x per module, 7 sub-sections each)
- Section 4: INTEGRATION MAP (4.1 Hand-offs, 4.2 Full System Flow, 4.3 Parallel Execution)
- Section 5: DATA SCHEMAS (5.x per entity)
- Section 6: AI/LLM SPECIFICATIONS (6.x per AI call)
- Section 7: CONSTRAINTS AND REQUIREMENTS (7.1 Tech Decisions, 7.2 Performance, 7.3 Hard Constraints)
- Section 8: BUILD ORDER (build order table, 8.1 Integration Checkpoints)
- Section 9: SUCCESS CRITERIA (pass/fail table, 9.1 Smoke Test)
- Section 10: OPEN DECISIONS

---

### 1.4 State Management Approach

No state file, no session budgets, no checkpointing. This is a single-session interactive command. There is no resume logic. The session runs linearly through 9 phases and ends when VISION.md is written.

---

### 1.5 Agent Strategy

Single-agent only. No sub-agent spawning. The command is executed by one agent conducting all phases sequentially. No Agent tool calls specified.

---

### 1.6 User Interaction Points

Every phase is a user interaction point. The command is entirely driven by AskUserQuestion calls:

- **Phase 1** (lines 27–57): 5 questions (Q1.1–Q1.5) — project name, core function, problem/owner, success signal, domain type
- **Phase 2** (lines 60–79): 4 questions (Q2.1–Q2.4) — components, AI usage, external connections, user interaction
- **Phase 3** (lines 82–122): 7 sub-questions per module (Q3.x.1–Q3.x.7) — trigger, inputs, outputs, steps, edge cases, failures, data storage
- **Phase 4** (lines 125–141): 3 questions (Q4.1–Q4.3) — module hand-offs, full user journey, parallel execution
- **Phase 5** (lines 144–152): entity field questions per data entity
- **Phase 6** (lines 155–167): 5 questions per AI module (Q6.x.1–Q6.x.5)
- **Phase 7** (lines 170–181): 4 questions (Q7.1–Q7.4) — tech decisions, performance, hard constraints, scope boundary
- **Phase 8** (lines 184–191): 2 questions (Q8.1–Q8.2) — success criteria list, smoke test
- **Phase 9** (lines 193–201): 1 question (Q9.1) — custom name for vision folder

---

### 1.7 Hallucination Prevention Mechanisms

**No-skip rule** (verbatim, line 23): "All phases are mandatory. If a phase seems irrelevant (e.g., no AI used), confirm this explicitly with the user and write 'N/A — confirmed' in the corresponding section."

**Decomposition rule** (verbatim, lines 17–18): "If any answer is vague, abstract, or contains words like 'probably', 'maybe', 'something like', 'I think', 'etc.', or names an unnamed component — immediately decompose into 2–3 concrete sub-questions."

**Template completeness rule** (verbatim, line 207): "Populate every section with answers from the session. Never leave a section blank — if truly not applicable, write `N/A — confirmed by user` and the reason."

All content in VISION.md originates from AskUserQuestion responses — the agent does not infer or invent.

---

### 1.8 Verification Approach

No automated verification steps. Verification is social/interactive: the user confirms accuracy through the phased Q&A. The quality guarantee is the decomposition rule — answers must be concrete before advancing.

---

### 1.9 Error Recovery Strategy

No explicit error recovery. The decomposition rule handles vague answers by immediately re-asking with more specific sub-questions. No file write errors are anticipated since output is a single VISION.md file.

---

### 1.10 Strengths and Weaknesses

**Strengths:**
- Exhaustive 9-phase coverage prevents gaps in any vision document
- Decomposition rule enforces concrete specificity before writing
- No-skip rule prevents silently omitting sections
- Template produces a standardized output compatible with /vision-to-docs

**Weaknesses:**
- No state persistence — if session is interrupted, all progress is lost
- No session budget — very long sessions (many modules) have no pause mechanism
- Single-agent — cannot parallelize module deep-dives
- No verification checklist for the output VISION.md itself

---

## COMMAND 2: vision-to-docs.md

**File path:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md
**Total lines:** 125

---

### 2.1 Core Mechanism

What it fundamentally does (verbatim, lines 3–9):

> "Transforms any vision — software, business system, content operation, physical product, or anything else — into a complete folder of build-ready documentation."

> "You are a senior architect and systems thinker. Your job in this session is to take a completed vision and turn it into a full folder of build-ready documentation — specs, schemas, flow maps, prompt templates, and build instructions — so that whoever implements it can build every component without making architectural guesses or asking clarifying questions mid-build."

**The vision source** (verbatim, line 11): "The vision is: $ARGUMENTS"

---

### 2.2 Input Requirements

Input from $ARGUMENTS (verbatim, lines 12–14):

> "If `$ARGUMENTS` is a file path, read that file first. If it is inline text, treat it as the vision directly. If it references multiple documents, read all of them before proceeding."

The command has two phases:

**Phase 1** (verbatim, lines 16–24):

> "Every vision, no matter how complete, has implementation details that were deliberately or inadvertently left open. Your job is to identify those gaps, then ask the user each question one at a time using the `AskUserQuestion` tool."
> "Ask no more than 12 questions. Prioritise only the decisions that would block or meaningfully alter the build if left open."

**Phase 2** (verbatim, lines 26–29):

> "Once all questions are answered, generate a complete documentation folder. Determine the output path from the vision (use the same directory the vision file is in, or the working directory if the vision was inline). Name the folder `[ProjectName]-Docs/` where `[ProjectName]` is derived from the vision."

---

### 2.3 Output Artifacts

Complete docs folder structure (verbatim, lines 36–55):

```
[ProjectName]-Docs/
├── 00-master-vision.md          ← exact copy of the vision (do not modify)
├── 01-build-order.md            ← exact build sequence with dependency map
├── modules/
│   ├── 01-[module-name]/
│   │   ├── SPEC.md
│   │   ├── SCHEMA.md            ← only if this module has data structures
│   │   ├── FLOW.md
│   │   ├── PROMPTS.md           ← only if this module uses an AI/LLM API
│   │   └── BUILD-INSTRUCTIONS.md
│   ├── 02-[module-name]/
│   │   └── ...
│   └── [N]-[module-name]/
│       └── ...
└── validation/
    └── checklists/
        ├── 01-[module-name]-checklist.md
        └── ...
```

**Per-file specifications** (lines 63–74):
- **SPEC.md**: "Exact behavior of the component: what it does, what triggers it, what inputs it receives, what outputs it produces, all edge cases, all failure states, and what happens when it fails."
- **SCHEMA.md**: "Every data structure used by this module: field names, types, constraints, example values, and relationships to other schemas."
- **FLOW.md**: "Step-by-step process map of what happens in what order. Written as numbered steps, not prose."
- **PROMPTS.md**: "The exact, complete prompts used. Not descriptions of prompts — the actual prompts, ready to copy-paste."
- **BUILD-INSTRUCTIONS.md**: "Literal, sequential instructions for what to build."
- **Validation checklists**: "A numbered checklist for each module. Each item is a binary pass/fail test."

---

### 2.4 State Management Approach

No state file, no session budget, no resume mechanism. Single-session command. All output is written in one pass after Phase 1 Q&A completes.

---

### 2.5 Agent Strategy

Single-agent only. No Agent tool spawning. One agent reads the vision, asks up to 12 questions, then generates the entire docs folder.

---

### 2.6 User Interaction Points

**Phase 1 only** (verbatim, lines 18–23):

> "Provide full context so the user understands why this decision matters"
> "Offer 2-4 concrete options with trade-offs explained"
> "Ask no more than 12 questions."
> "If the user is uncertain, probe further with a follow-up question — do not accept 'I don't know' as a final answer"

**Confirmation before Phase 2** (verbatim, lines 119–124):

> "Start by confirming you have read and understood the vision. State:
> - What the vision is building
> - How many modules you identified and what they are
> - How many open questions you identified before asking them"

---

### 2.7 Hallucination Prevention Mechanisms

**7-category gap scan** (verbatim, lines 80–89):

> "1. **Unresolved technical decisions** — the vision names a capability but does not specify how it works
> 2. **Missing integration details** — third-party systems are referenced but connection method is unspecified
> 3. **Ambiguous edge cases** — behavior when something fails or is out of range is not stated
> 4. **Scheduling / frequency / thresholds** — any number or cadence that is 'TBD' or vague
> 5. **User interaction touchpoints** — anywhere the end user makes a decision and the UX path isn't defined
> 6. **Data model gaps** — fields or relationships implied but not explicitly defined
> 7. **Measurement and success criteria** — how the system knows it is working correctly"

**Derived-decision disclosure rule** (verbatim, line 64): "If a detail is not specified, resolve it using first principles and document that it was a derived decision."

---

### 2.8 Verification Approach

No automated verification. Verification checklists are output artifacts for human use. Each module's checklist items must be (verbatim, line 73): "binary pass/fail test... completable by running or reviewing the system and observing behavior — no subjective items. Minimum 5 items per checklist."

---

### 2.9 Error Recovery Strategy

No explicit error recovery mechanism. The Phase 1 Q&A catches issues before any documentation is written. The domain-agnosticism section (lines 105–114) ensures the agent adapts output format to match the project type.

---

### 2.10 Strengths and Weaknesses

**Strengths:**
- Domain-agnostic: works for software, business ops, content, physical, hybrid systems
- Up to 12 clarifying questions resolve ambiguity before writing begins
- Produces a complete standardized folder ready for /docs-to-build-v2
- Derived-decision disclosure rule prevents silent invention

**Weaknesses:**
- No state persistence — session interruption loses all progress
- No session budget — large systems with many modules could exhaust context
- Single-agent — cannot parallelize module documentation
- 12-question cap may leave genuine gaps in complex visions

---

## COMMAND 3: docs-to-build-v2.md

**File path:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md
**Total lines:** 678

---

### 3.1 Core Mechanism

What it fundamentally does (verbatim, frontmatter lines 1–3):

> "Convert a project docs folder into a complete, orchestrated build system using serial specialized sub-agents. Separates reasoning (reading, synthesizing, cataloging) from execution (writing files). Each execution agent reads exactly one context artifact and writes its assigned output files. Invoke: /docs-to-build-v2 [docs_folder_path]"

**Core separation of concerns** (verbatim, phase names):
- Reasoning agents: Phase 1 (Map), Phase 2 (Ground)
- Serial execution agents: Phase 3 (Engineer — one per module), Phase 4 (Synthesize), Phase 5 (Write Context — one per context category), Phase 6 (Orchestrate), Phase 7 (Runner)

---

### 3.2 Input Requirements

Input: $ARGUMENTS = absolute path to the docs folder (verbatim, line 7): "You are executing the /docs-to-build-v2 command. Parse $ARGUMENTS to get DOCS_DIR."

**Path resolution variables** (verbatim, lines 9–17):

> "1. Set DOCS_DIR = $ARGUMENTS (the absolute path provided by the user)
> 2. Set PROJECT_NAME = basename of DOCS_DIR with any '-Docs', '-docs', '-Docs-v1', '-docs-v1', '-Docs-V1' suffix removed
> 3. Set WORKSPACE_ROOT = parent directory of DOCS_DIR
> 4. Set BUILD_DIR = WORKSPACE_ROOT/[PROJECT_NAME]-Build
> 5. Set MPBS_DIR = WORKSPACE_ROOT/micro-prompt-build-system
> 6. Set PROJECT_SLUG = PROJECT_NAME lowercased with all spaces replaced by hyphens"

**Pre-requisite** (verbatim, lines 92–93): "Verify: MPBS_DIR exists. If absent, output: 'ERROR: micro-prompt-build-system not found at [MPBS_DIR].'"

---

### 3.3 Output Artifacts

**Phase 0 — Setup** (lines 82–96):
- `[BUILD_DIR]/orchestration/` directory
- `[BUILD_DIR]/context/` directory
- `[BUILD_DIR]/setup-state.json`

**Phase 1 — Map** (lines 109–158):
- `[BUILD_DIR]/module-manifest.json`

**Phase 2 — Ground** (lines 173–220):
- `[BUILD_DIR]/context-catalog.json`

**Phase 3 — Engineer** (lines 237–300):
- `[BUILD_DIR]/module-fragment-NN.md` (one per module, zero-padded)

**Phase 4 — Synthesize** (lines 315–366):
- `[BUILD_DIR]/refined-prompt.md`

**Phase 5 — Write Context** (lines 381–415):
- `[BUILD_DIR]/context/[file_name]` (one per context-catalog.json entry)

**Phase 6 — Orchestrate** (lines 430–500):
- `[BUILD_DIR]/orchestration/state.json`
- `[BUILD_DIR]/orchestration/README.md`
- `[BUILD_DIR]/orchestration/prompt-NN.md` (one per atomic build step)

**Phase 7 — Runner** (lines 519–589):
- `[WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md`

**Phase 8 — Self-Heal** (lines 606–645, triggered on verification failure):
- `[BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md`

---

### 3.4 State Management Approach

**setup-state.json resume logic** (verbatim, lines 36–78):

> "**Step A — Check for existing setup-state.json:**
> Use the Read tool to check if `[BUILD_DIR]/setup-state.json` exists."

> "**Step B — If ABSENT (first run):**
> Write `[BUILD_DIR]/setup-state.json` with the schema below... Set all phases to `'pending'` except `'0_setup'` which is `'completed'`. Set `resume_from_phase` to `1`. Set `session_count` to `1`."

> "**Step C — If PRESENT (resume run):**
> Read `[BUILD_DIR]/setup-state.json`. Extract `resume_from_phase` and `session_count`. Increment `session_count` by 1 and write it back."

> "**Step F — SESSION_BUDGET check after each phase:**
> Count the number of phases completed in this session (not total). If that count equals SESSION_BUDGET: write the current state to `setup-state.json`, then output exactly:
> 'SESSION_BUDGET reached. Setup paused after Phase [N]. Re-invoke `/docs-to-build-v2 [DOCS_DIR]` in a new Claude Code chat to continue from Phase [N+1].'"

State file schema (verbatim, lines 42–59):
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

---

### 3.5 Agent Strategy

**Serial sub-agents** — exactly one agent per phase (except Phase 3 and Phase 5 which spawn one agent per module/entry serially):

> Phase 1: "Spawn ONE Agent" (line 111)
> Phase 2: "Spawn ONE Agent" (line 175)
> Phase 3: "For each module in the modules array, IN INDEX ORDER, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next. Do not spawn multiple engineer agents simultaneously." (lines 239–241)
> Phase 4: "Spawn ONE Agent" (line 315)
> Phase 5: "For each entry in the entries array, IN SEQUENCE, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next." (lines 383–385)
> Phase 6: "Spawn ONE Agent" (line 431)
> Phase 7: "Spawn ONE Agent" (line 519)
> Phase 8 (self-heal): "Spawn ONE Agent" (line 609)

Total agents: 2 reasoning agents (Phases 1–2) + N engineer agents (Phase 3) + 1 synthesizer + M context agents (Phase 5) + 1 orchestrator + 1 runner writer + optional Phase 8 self-heal agents.

---

### 3.6 User Interaction Points

**Phase 2 Ground agent** — one optional AskUserQuestion (verbatim, lines 190–191):

> "For every required value NOT present in the docs files: list it as {'key': '...', 'reason_needed': '...', 'failure_if_missing': '...'} and use AskUserQuestion ONCE for all missing values in a single grouped question before writing the catalog."

No other user interaction points. This command is designed to run autonomously. All other decisions are derived from docs files.

---

### 3.7 Hallucination Prevention Mechanisms

**Phase 1 — locked_constraints** (verbatim, lines 152–154):

> "locked_constraints must contain every 'MUST NOT', 'never', and 'do not' directive from ANY docs file — copied verbatim as strings"

**Phase 2 — context-catalog.json** (verbatim, lines 186–188):

> "Identify every domain-specific value that sub-agents will need and cannot reliably generate."

**Phase 3 agent rule** (verbatim, lines 255–260):

> "Your module slice — all information you need is contained below. Do NOT read any other file"
> "No section says 'see docs', 'as described', 'TBD', or references an external file"

**Phase 6 prompt constraint** (verbatim, lines 475–477):

> "Do not truncate any file. Write each file completely or not at all."
> "Do not install or import any package not already present in package.json."

**Phase 8 Self-Heal** (lines 606–645): automatic fix-prompt generation on any verification failure — prevents silent failures.

---

### 3.8 Verification Approach

Every phase has an embedded verification checklist. Failure triggers Phase 8 Self-Heal automatically.

**Phase 0 verification** (lines 98–103): directories exist, MPBS_DIR exists, DOCS_DIR has .md files, setup-state.json resume check is present.

**Phase 1 verification** (lines 161–168): module-manifest.json is valid JSON, modules array non-empty, every module entry complete, locked_tech non-empty, locked_constraints non-empty.

**Phase 2 verification** (lines 224–231): context-catalog.json valid, entries non-empty, all required fields present, no empty values array, valid category strings.

**Phase 3 verification** (lines 303–308): one fragment per module, all sections present, no placeholder text, fragment count matches module count.

**Phase 4 verification** (lines 370–375): refined-prompt.md exists, contains role/context/build_order blocks, one MODULE section per module, Refinement Report present.

**Phase 5 verification** (lines 419–424): one context file per catalog entry, all header fields present, Status = IMMUTABLE, Values section complete.

**Phase 6 verification** (lines 507–512): state.json valid, README.md exists, one prompt per pending step, all required sections in prompts, counts match.

**Phase 7 verification** (lines 593–599): runner file exists, correct frontmatter, SESSION_BUDGET=6 present, WORKSPACE_ROOT literal, TOTAL_STEPS integer, no bracket placeholders.

---

### 3.9 Error Recovery Strategy

**Phase 8 — Self-Heal** (verbatim, lines 605–645):

> "This phase is NOT part of the normal execution sequence. It triggers automatically when any phase's output artifact fails its embedded verification checklist."

The self-heal agent writes a fix-prompt file: "Send this file to a fresh Claude Code session. It contains everything needed to re-run Phase [N] in isolation."

Each phase ends with (verbatim, lines 105–106, repeated per phase):

> "If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt."

---

### 3.10 Strengths and Weaknesses

**Strengths:**
- Full session resume via setup-state.json — can restart across multiple sessions
- SESSION_BUDGET prevents context exhaustion
- Phase 8 Self-Heal provides automatic error recovery
- Serial sub-agents enforce isolation — each agent has a single responsibility
- locked_constraints propagated verbatim to all engineer agents prevents hallucinated constraints
- Context catalog captures domain-specific values early to prevent later hallucination

**Weaknesses:**
- Requires micro-prompt-build-system (MPBS_DIR) to be present — external dependency
- No parallel execution in Phase 3 or Phase 5 — large projects take many serial agent turns
- Phase 7 runner uses hardcoded SESSION_BUDGET = 6
- runner command hardcoded to BUILD_DIR pattern — cannot easily reroute output

---

## COMMAND 4: autonomous-system-builder1.md

**File path:** C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md
**Total lines:** 666

---

### 4.1 Core Mechanism

What it fundamentally does (verbatim, frontmatter lines 1–3):

> "Builds a complete autonomous multi-step orchestration system for any objective. Accepts objective as inline text, file path, or folder path. Runs vision-alignment clarification then spawns sub-agents to generate state.json, context files, step plans, COLLECT/PLAN/EXECUTE prompt files, and a runner slash command."

**6-phase execution** (lines 6–666):
- Phase 0: Input capture
- Phase 1: Vision alignment (7 questions in 3 batches)
- Phase 2: System design derivation (DESIGN block)
- Phase 3: Directory setup
- Phase 4: Parallel agent spawn (5 simultaneous sub-agents)
- Phase 5: Validation (13 QC checks)
- Phase 6: Completion report

---

### 4.2 Input Requirements

**4-way input detection** (verbatim, lines 8–16):

> "1. If `$ARGUMENTS` is empty: use `AskUserQuestion` — type free text
> 2. If `$ARGUMENTS` ends in `.md`, `.txt`, `.json`, or contains a `/` or `\` character that resolves to an existing file: read the file with `Read`
> 3. If `$ARGUMENTS` resolves to an existing directory: use `Glob` for `*.md` and `*.txt` inside it. Read the first result.
> 4. Otherwise: treat `$ARGUMENTS` as inline text."

**7 vision-alignment questions** (lines 30–101):
- Q1: Success signal (free text)
- Q2: System type (end-state / ongoing / hybrid)
- Q3: Technology stack (TypeScript/Next.js, Python, JS/Node, no-code, other)
- Q4: Protected files/folders (multiline free text)
- Q5: Step count estimate (3-6, 7-12, 13+, infer)
- Q6: Verification gate command
- Q7: Confirmation (yes/no — if no, restart from Q1)

**Required reference schema files** (verbatim, lines 196–201):

> "Read all 4 reference schema files using `Read`:
>    - `.claude/commands/autonomous-system-builder/state-schema.md` → store as SCHEMA_STATE
>    - `.claude/commands/autonomous-system-builder/prompt-schema.md` → store as SCHEMA_PROMPT
>    - `.claude/commands/autonomous-system-builder/runner-schema.md` → store as SCHEMA_RUNNER
>    - `.claude/commands/autonomous-system-builder/principles.md` → store as SCHEMA_PRINCIPLES"

---

### 4.3 Output Artifacts

**DESIGN block variables determine all output paths** (verbatim, lines 113–178):

- `STATE_FILE = [ORCH_DIR]/state.json`
- `[ORCH_DIR]/step-plan.json`
- `[PROMPTS_DIR]/prompt-NN.md` (one per step — COLLECT, PLAN, EXECUTE types)
- `[RUNNER_PATH]` = `[PROJECT_ROOT]/.claude/commands/run-[SYSTEM_NAME].md` (if .claude/commands/ exists) or `[HOME]/.claude/commands/run-[SYSTEM_NAME].md`

**state.json schema** (verbatim, lines 240–257):
```json
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
    [each FLAG_NAME as "name": false],
    "allChangesCommitted": false
  },
  "knownItems": {}
}
```

**step-plan.json schema** (verbatim, lines 262–288):
```json
{
  "version": "1.0.0",
  "system": "[SYSTEM_NAME]",
  "total_steps": [TOTAL_STEPS],
  "session_budget": 6,
  "steps": [
    {
      "id": "[step-id]",
      "mode": "COLLECT | PLAN | EXECUTE",
      "task": "[brief description]",
      "prompt_file": "[PROMPTS_DIR]/prompt-[NN].md",
      "outputs": ["[files this step produces — absolute paths]"],
      "prerequisites": ["[flag names that must be true before this step]"]
    }
  ]
}
```

---

### 4.4 State Management Approach

**state.json** is the session resume file (verbatim, lines 554–556):

> "## State File Write Rules
> Preserve all fields. Mutate only these:
> - pendingSteps: remove the current step from the front of the array
> - completedSteps: append the current step to the end of the array
> - flags: set the flag corresponding to the completed step to true"

**SESSION_BUDGET = 6** (verbatim, lines 134–135):

> "SESSION_BUDGET = 6
>   This is a hard constant. Never derive from user input. Always exactly 6."

**TOTAL_STEPS derivation** (verbatim, lines 130–133):

> "Derived from Q5_STEPS:
>     A (3–6 steps)  → 6
>     B (7–12 steps) → 9
>     C (13+ steps)  → 12
>     D (infer)      → analyze OBJECTIVE complexity"

**State integrity check** (verbatim, lines 619–622):

> "### QC11 — Step count invariant
> Action: read STATE_FILE. Count completedSteps array length and pendingSteps array length.
> Pass: their sum equals TOTAL_STEPS.
> Fail: recount STEP_IDS."

---

### 4.5 Agent Strategy

**Phase 4: 5 parallel sub-agents** (verbatim, lines 210–214):

> "**Spawn all 5 agents simultaneously in a single batch using the `Agent` tool. Do not wait for one to complete before spawning the next — all 5 are spawned in parallel. All inter-agent communication travels via files on disk — no agent waits for another's in-memory output.**"

Sub-agents:
1. Sub-agent 1 — State Files (state.json + step-plan.json)
2. Sub-agent 2 — COLLECT Prompt Files
3. Sub-agent 3 — PLAN Prompt Files
4. Sub-agent 4 — EXECUTE Prompt Files
5. Sub-agent 5 — Runner Slash Command

**Anti-hallucination note** (verbatim, line 213): "Before spawning, interpolate every [BRACKETED] placeholder in each sub-agent prompt below with the resolved values from the DESIGN block. No sub-agent receives unresolved brackets in its prompt."

---

### 4.6 User Interaction Points

**Phase 1 — 7 AskUserQuestion calls** (lines 30–101):
- Q1: success signal (free text)
- Q2: system type (single-select, 3 options)
- Q3: tech stack (single-select, 5 options)
- Q4: protected files (multiline free text)
- Q5: step count (single-select, 4 options)
- Q6: verification gate (single-select, 5 options)
- Q7: confirmation (single-select, 2 options — yes/no with restart on no)

**Confirmation display before Q7** (verbatim, lines 83–92):

> "Alignment check before generation:
> Objective: [OBJECTIVE truncated to 200 chars]
> Success signal: [Q1_SUCCESS]
> System type: [Q2_TYPE]
> Tech stack: [Q3_STACK]
> Steps estimate: [Q5_STEPS]
> Verification gate: [Q6_VERIFICATION]
> Protected files/folders: [Q4_PROTECTED or 'None']"

No user interaction after Phase 1. All generation is autonomous.

---

### 4.7 Hallucination Prevention Mechanisms

**QC13 — Clarification before generation** (verbatim, lines 629–632):

> "Action: confirm all AskUserQuestion calls (Q1–Q7) completed before the first Write tool call.
> Pass: conversation ordering shows Q7 confirmation before any Write.
> Fail: report 'QC13 FAILED: generation began before alignment confirmed.'"

**DESIGN block interpolation rule** (verbatim, line 213):

> "Before spawning, interpolate every [BRACKETED] placeholder in each sub-agent prompt below with the resolved values from the DESIGN block. No sub-agent receives unresolved brackets in its prompt."

**QC9 — No unverified identifiers** (verbatim, lines 609–614):

> "Action: for each prompt file, scan the Task section for file paths, function names, or flag names not declared in that prompt's own Prerequisites or Hard Constraints sections.
> Pass: all identifiers referenced in the Task section are declared locally in Prerequisites or Hard Constraints.
> Fail: add the undeclared identifier to the Prerequisites section."

**QC12 — Bootstrap wrote files only** (verbatim, lines 623–627):

> "Action: confirm that no application code files in PROJECT_ROOT were Read or Modified during this generation session.
> Pass: all file writes during this session were under ORCH_DIR and RUNNER_PATH only.
> Fail: report 'QC12 FAILED: application code was touched during bootstrap.'"

**PRINCIPLES_REFERENCE** (loaded from `.claude/commands/autonomous-system-builder/principles.md`): passed to COLLECT prompt writer sub-agent as anti-hallucination guidance.

**Anti-hallucination Protocol in runner** (verbatim, lines 510–515):

> "Run this check before spawning ANY EXECUTE-mode step agent:
> 1. Confirm the plan file for this step exists: Glob for the plan file path in PLANS_DIR
> 2. Read the plan file — verify the 'Target file' path it names exists on disk: Glob for that path
> 3. If check 1 fails: spawn a COLLECT agent...
> 4. If check 2 fails: spawn a COLLECT agent..."

---

### 4.8 Verification Approach

**13 QC checks in Phase 5** (lines 568–633):
- QC1: Mode header matches step-plan.json
- QC2: Mode lock specificity (exactly one directory per prompt)
- QC3: PLAN always precedes EXECUTE
- QC4: EXECUTE task starts with "Verify plan file"
- QC5: Binary verification items only
- QC6: EXECUTE verification gate present
- QC7: State update completeness (flag name + pendingSteps→completedSteps + artifact path)
- QC8: No placeholders in runner next-session block
- QC9: No unverified identifiers in prompts
- QC10: Anti-hallucination protocol inside loop body (not outside)
- QC11: Step count invariant (completedSteps + pendingSteps = TOTAL_STEPS)
- QC12: Bootstrap wrote files only (no application code touched)
- QC13: Clarification before generation (all Q&A before first Write)

---

### 4.9 Error Recovery Strategy

**Phase 5 inline fix** (verbatim, lines 567–568):

> "Wait for all 5 sub-agents to complete. Then run all 13 QC checks in order. For each failure, fix inline before proceeding to the next check."

**Runner anti-hallucination recovery** (verbatim, lines 512–516):

> "3. If check 1 fails: spawn a COLLECT agent with this prompt: 'Read [STATE_FILE]. The plan file [expected plan path] is missing. Locate [the target described in the objective] in [PROJECT_ROOT]. Write findings to [CONTEXT_DIR]/relocation-[step-id].md. Then regenerate the plan file...'
> 4. If check 2 fails: spawn a COLLECT agent with this prompt: 'Read [STATE_FILE]. The target file named in [plan file path] cannot be found on disk...'"

**Q7 restart** (verbatim, line 101): "If Q7 = B: restart from Batch 1. Ask all questions again from Q1."

**State verification on step completion** (verbatim, lines 527–529):

> "g. Read STATE_FILE again. Verify current_step now appears in completedSteps. If it is still in pendingSteps: stop and report 'Step [current_step] did not update state.json on completion. Manual inspection required.'"

---

### 4.10 Strengths and Weaknesses

**Strengths:**
- Parallel Phase 4 spawn: 5 agents simultaneously generate all prompts — faster than serial
- 13 QC checks with inline fix: most errors self-corrected without user intervention
- Runner has anti-hallucination protocol for EXECUTE steps at runtime
- 7-question alignment + Q7 confirmation gate prevents generation on wrong objectives
- DESIGN block fully resolved before agent spawn — no bracket placeholders reach sub-agents
- SESSION_BUDGET = 6 hardcoded as constant prevents configuration drift

**Weaknesses:**
- Requires 4 external reference schema files — if any are missing, command stops
- Parallel agents cannot communicate in-memory — coordination via files only
- QC checks can only fix after-the-fact — if sub-agent output is severely wrong, QC may not be sufficient
- TOTAL_STEPS capped at 12 for complex systems — may be insufficient for very large objectives
- Hardcoded SESSION_BUDGET = 6 cannot be adjusted without editing the command file
