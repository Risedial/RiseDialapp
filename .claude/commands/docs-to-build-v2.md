---
description: Convert a project docs folder into a complete, orchestrated build system using serial specialized sub-agents. Separates reasoning (reading, synthesizing, cataloging) from execution (writing files). Each execution agent reads exactly one context artifact and writes its assigned output files. Invoke: /docs-to-build-v2 [docs_folder_path]
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

You are executing the /docs-to-build-v2 command. Parse $ARGUMENTS to get DOCS_DIR.

## Path Resolution

Resolve these variables before executing any phase. Do NOT use `pwd` to derive any path.

1. Set DOCS_DIR = $ARGUMENTS (the absolute path provided by the user)
2. Set PROJECT_NAME = basename of DOCS_DIR with any "-Docs", "-docs", "-Docs-v1", "-docs-v1", "-Docs-V1" suffix removed
3. Set WORKSPACE_ROOT = parent directory of DOCS_DIR (resolve this from the DOCS_DIR path string — derive by stripping the final path segment from DOCS_DIR, do NOT run `pwd`)
4. Set BUILD_DIR = WORKSPACE_ROOT/[PROJECT_NAME]-Build
5. Set MPBS_DIR = WORKSPACE_ROOT/micro-prompt-build-system
6. Set PROJECT_SLUG = PROJECT_NAME lowercased with all spaces replaced by hyphens

Print resolved paths before proceeding:

```
DOCS_DIR:       [resolved value]
PROJECT_NAME:   [resolved value]
WORKSPACE_ROOT: [resolved value]
BUILD_DIR:      [resolved value]
MPBS_DIR:       [resolved value]
PROJECT_SLUG:   [resolved value]
```

---

### Phase 0 — setup-state.json Resume Check

After resolving all paths above, execute this resume check before spawning any phase agent:

**Step A — Check for existing setup-state.json:**
Use the Read tool to check if `[BUILD_DIR]/setup-state.json` exists.

**Step B — If ABSENT (first run):**
Write `[BUILD_DIR]/setup-state.json` with the schema below, substituting the resolved PROJECT_SLUG and DOCS_DIR values. Set all phases to `"pending"` except `"0_setup"` which is `"completed"`. Set `resume_from_phase` to `1`. Set `session_count` to `1`. Proceed to Phase 1.

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

**Step C — If PRESENT (resume run):**
Read `[BUILD_DIR]/setup-state.json`. Extract `resume_from_phase` and `session_count`. Increment `session_count` by 1 and write it back. Output exactly:
> Resuming setup from Phase [resume_from_phase]. Phases 0–[resume_from_phase - 1] already completed. Session [session_count].

Skip all phases whose status is `"completed"`. Proceed to the first phase whose status is `"pending"`.

**Step D — Before starting each phase (Phases 1–7):**
Update that phase's status to `"in_progress"` in `setup-state.json` before spawning its agent.

**Step E — After each phase completes (Phases 1–7):**
Update that phase's status to `"completed"` in `setup-state.json`. Update `resume_from_phase` to the next phase index.

**Step F — SESSION_BUDGET check after each phase:**
Count the number of phases completed in this session (not total). If that count equals SESSION_BUDGET: write the current state to `setup-state.json`, then output exactly:
> SESSION_BUDGET reached. Setup paused after Phase [N]. Re-invoke `/docs-to-build-v2 [DOCS_DIR]` in a new Claude Code chat to continue from Phase [N+1].

Stop. Do not proceed to the next phase.

---

## Phase 0 — Setup

Create required directories and verify dependencies.

Run these Bash commands:
```bash
mkdir -p "[BUILD_DIR]/orchestration"
mkdir -p "[BUILD_DIR]/context"
```

Verify: MPBS_DIR exists. If absent, output: "ERROR: micro-prompt-build-system not found at [MPBS_DIR]. Copy it to WORKSPACE_ROOT before invoking this command." and stop.

Verify: DOCS_DIR contains at least one .md file. If empty or absent, output: "ERROR: DOCS_DIR [DOCS_DIR] is empty or does not exist." and stop.

Output: "Phase 0 complete. Directories ready. Build: [BUILD_DIR]"

**Verification:**
- [ ] BUILD_DIR/orchestration/ exists
- [ ] BUILD_DIR/context/ exists
- [ ] MPBS_DIR exists and is non-empty
- [ ] DOCS_DIR contains at least one .md file
- `[BUILD_DIR]/setup-state.json` resume check is present in Phase 0 — includes Steps A–F: absent-file initialization, present-file resume with phase-skip logic, in_progress update before each phase, completed update after each phase, and SESSION_BUDGET stop with resume message <!-- PATCH NOTE: insertion adjusted — no standalone final verification checklist section found; placed in Phase 0 verification block as nearest semantically equivalent location (item verifies Phase 0 resume-check content specifically) -->

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 1 — Map (Reasoning Agent)

Spawn ONE Agent with this exact prompt:

> You are a project mapper. Your ONLY output is the file `[BUILD_DIR]/module-manifest.json`. You do not write any other file.
>
> Read every file in `[DOCS_DIR]` recursively. Start with `00-master-vision.md` and `01-build-order.md` if they exist.
>
> Produce `[BUILD_DIR]/module-manifest.json` with this exact schema:
>
> ```json
> {
>   "project": "[PROJECT_NAME]",
>   "workspace_root": "[WORKSPACE_ROOT]",
>   "docs_dir": "[DOCS_DIR]",
>   "build_dir": "[BUILD_DIR]",
>   "locked_tech": {
>     "comment": "Extract every MUST NOT change, do not modify, and tech stack declaration from the docs",
>     "example_keys": ["framework", "language", "auth", "cookie_name", "jwt_header", "database"]
>   },
>   "locked_constraints": [
>     "Every MUST NOT, never, and do not directive found in ANY docs file — as verbatim strings"
>   ],
>   "modules": [
>     {
>       "index": 1,
>       "name": "[module name from 01-build-order.md]",
>       "key": "[module key, e.g. M1, M2, M8]",
>       "docs_files": ["[absolute path to every docs file for this module]"],
>       "output_files": ["[absolute path to every file this module creates or modifies]"],
>       "parallel_safe": true,
>       "depends_on": ["[module keys this module depends on — empty array if none]"],
>       "spec_summary": "[one sentence: what must be true after this module completes]",
>       "verification_criteria": ["[testable, observable assertion derived from the module SPEC.md]"]
>     }
>   ]
> }
> ```
>
> Rules:
> - Include ALL modules from 01-build-order.md, in build order, with index matching build order position
> - locked_tech must contain every value an execution agent would otherwise hallucinate: framework versions, cookie names, JWT claim names, algorithm names, table names, env var prefixes
> - locked_constraints must contain every "MUST NOT", "never", and "do not" directive from ANY docs file — copied verbatim as strings
> - Every module's verification_criteria must be a list of directly testable assertions (observable in the file system or via a browser check — not subjective)
> - Every module's docs_files must list absolute paths — do not use relative paths
> - Do not invent values not present in the docs — if a value is absent from the docs, write it as null
>
> After writing module-manifest.json, respond with exactly:
> Phase 1 complete. Module count: [N]. File: [BUILD_DIR]/module-manifest.json

Wait for the Phase 1 agent to complete before proceeding to Phase 2.

**Verification:**
- [ ] [BUILD_DIR]/module-manifest.json exists and is valid JSON
- [ ] modules array is non-empty
- [ ] Every module entry has index, name, key, docs_files, output_files, spec_summary, verification_criteria
- [ ] locked_tech is a non-empty object
- [ ] locked_constraints is a non-empty array of strings
- [ ] workspace_root value matches the resolved WORKSPACE_ROOT (not a placeholder)

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 2 — Ground (Reasoning Agent)

Spawn ONE Agent with this exact prompt:

> You are a context cataloger. Your ONLY output is `[BUILD_DIR]/context-catalog.json`. You do not write any other file.
>
> Read `[BUILD_DIR]/module-manifest.json` in full.
> Read every docs file listed in the manifest's modules[*].docs_files arrays.
>
> Identify every domain-specific value that sub-agents will need and cannot reliably generate. Organize by these five categories ONLY — do not invent additional categories:
>
> - Category 1 — schema_values: table names, column names, data types, enum strings, constraint strings, primary/foreign key names
> - Category 2 — auth_session: cookie names, JWT claim names, JWT header names, algorithm strings (e.g., "HS256"), session token formats
> - Category 3 — api_contracts: request/response field names, HTTP status codes used in the project, Supabase/third-party error codes, endpoint paths
> - Category 4 — design_tokens: CSS variable names, exact color hex values, font stacks, spacing scale values, breakpoint values
> - Category 5 — external_services: environment variable names, API key format patterns (e.g., "starts with re_"), service-specific config values
>
> For every required value NOT present in the docs files: list it as {"key": "...", "reason_needed": "...", "failure_if_missing": "what breaks if an agent guesses wrong"} and use AskUserQuestion ONCE for all missing values in a single grouped question before writing the catalog.
>
> Do NOT read any prompt-NN.md files or any files outside DOCS_DIR and module-manifest.json. Use module-manifest.json as the sole source for determining which modules need which values. The Required by fields come from the module keys in module-manifest.json.
>
> Produce `[BUILD_DIR]/context-catalog.json`:
>
> ```json
> {
>   "entries": [
>     {
>       "file_name": "[slug].md",
>       "category": "schema_values | auth_session | api_contracts | design_tokens | external_services",
>       "prevents": "[one sentence: the specific hallucination this context file prevents]",
>       "required_by_modules": ["[module key from manifest]"],
>       "values": [
>         { "key": "cookie_name", "value": "risedial_session" }
>       ]
>     }
>   ]
> }
> ```
>
> Rules:
> - One entry per context category that has at least one value to capture — skip empty categories
> - required_by_modules must list every module key that uses any value in this entry
> - file_name becomes the actual context file name: use slug format (e.g., "data-schema.md", "auth-values.md", "design-tokens.md")
> - The prevents field must name a specific hallucination (e.g., "prevents agents from inventing wrong Supabase column names"), not a generic statement
> - Do NOT write context files in this phase — only write context-catalog.json
>
> After writing, respond with exactly:
> Phase 2 complete. Context categories: [N]. File: [BUILD_DIR]/context-catalog.json

Wait for the Phase 2 agent to complete before proceeding to Phase 3.

**Verification:**
- [ ] [BUILD_DIR]/context-catalog.json exists and is valid JSON
- [ ] entries array is non-empty
- [ ] Every entry has file_name, category, prevents, required_by_modules, values
- [ ] No entry has an empty values array
- [ ] Every category value is one of the five permitted categories
- [ ] No entry file_name contains placeholder text

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 3 — Engineer (Serial Execution Agents, One Per Module)

Read `[BUILD_DIR]/module-manifest.json`. Extract the modules array.

For each module in the modules array, IN INDEX ORDER, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next. Do not spawn multiple engineer agents simultaneously.

For module at index NN, spawn ONE Agent with this exact prompt (substituting all bracketed values):

> You are a module prompt engineer. Your ONLY output is `[BUILD_DIR]/module-fragment-[NN].md` where NN is the zero-padded module index (e.g., 01, 02, 03).
>
> Your module slice — all information you need is contained below. Do NOT read any other file:
>
> [paste the full JSON object for this module from module-manifest.json, verbatim]
>
> Your locked constraints — apply ALL of these to every code block and instruction you write:
>
> [paste the locked_constraints array from module-manifest.json as a numbered list, verbatim]
>
> Required information checklist — your output MUST satisfy every item before you write the file:
> - [ ] A role statement: one sentence stating who is executing this module (e.g., "You are a Next.js 14 developer building the [module name] feature.")
> - [ ] A context block: all locked_tech values from your module slice as key: value pairs, plus all locked_constraints as a numbered list
> - [ ] A "What Must Be True After This Module" section: populated from spec_summary verbatim
> - [ ] A "Files to Change" section: every file in output_files listed as its own header, with the COMPLETE file content or complete edit instruction written inline using verbatim code blocks — do NOT say "see docs", "refer to spec", "TBD", or reference any external file
> - [ ] A "Verification" section: every item in verification_criteria as a markdown checkbox
> - [ ] A "Failure Recovery" section: at least one entry with format "If [observable failure condition]: [specific fix action]"
>
> Write `[BUILD_DIR]/module-fragment-[NN].md` with exactly this structure:
>
> ```
> # Module Fragment [NN]: [module name]
>
> ## Role
> [one sentence: who is executing this module]
>
> ## Context
> [all locked_tech values as key: value pairs]
> [all locked_constraints as a numbered list]
>
> ## What Must Be True After This Module
> [spec_summary from your module slice, verbatim]
>
> ## Files to Change
> ### [exact file path from output_files[0]]
> [COMPLETE file content or complete edit instruction in a verbatim code block]
>
> ### [exact file path from output_files[1]]
> [COMPLETE file content or complete edit instruction in a verbatim code block]
>
> [repeat for every file in output_files]
>
> ## Verification
> - [ ] [each item from verification_criteria]
>
> ## Failure Recovery
> - If [observable failure condition]: [specific fix action with exact command or file to check]
> ```
>
> Before writing the file, verify your draft passes this checklist:
> - One "### [file path]" subsection exists for every file listed in output_files — count them; if the count does not match output_files.length, add the missing sections before writing
> - Every verification_criteria item appears as a checkbox — if any are missing, add them
> - At least one Failure Recovery entry exists
> - No section says "see docs", "as described", "TBD", or references an external file
>
> After writing, respond with: Fragment [NN] complete. File: [BUILD_DIR]/module-fragment-[NN].md

Process every module sequentially in index order. After ALL modules are processed, proceed to Phase 4.

**Verification (after all fragments written):**
- [ ] One module-fragment-NN.md file exists per module in module-manifest.json
- [ ] Each fragment contains Role, Context, What Must Be True, Files to Change, Verification, and Failure Recovery sections
- [ ] No fragment contains "see docs", "TBD", "as described", or any placeholder text
- [ ] Fragment file count equals module-manifest.json modules array length

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 4 — Synthesize (Execution Agent)

Spawn ONE Agent with this exact prompt:

> You are a prompt synthesizer. Your ONLY output is `[BUILD_DIR]/refined-prompt.md`.
>
> Read `[BUILD_DIR]/module-manifest.json` in full (for ordering and locked_tech values).
> Read every `[BUILD_DIR]/module-fragment-NN.md` file in index order (01, 02, 03...).
>
> Do NOT read the original docs folder. All module content comes from the fragment files.
>
> Write `[BUILD_DIR]/refined-prompt.md` with this structure:
>
> ```
> <role>
> [Derive from locked_tech in manifest: "You are a [framework] developer building [project]. Your role is to implement each module exactly as specified, applying all locked constraints to every file you write."]
> </role>
>
> <context>
> [All locked_tech values as key: value pairs — one per line]
> [All locked_constraints as a numbered list]
> </context>
>
> <build_order>
> | Index | Module Name | Key | Parallel Safe | Depends On |
> |-------|-------------|-----|---------------|------------|
> [One row per module from manifest, in index order]
> </build_order>
>
> ## MODULE 01: [module name]
> [Full content of module-fragment-01.md, verbatim]
>
> ---
>
> ## MODULE 02: [module name]
> [Full content of module-fragment-02.md, verbatim]
>
> ---
>
> [Continue for every module in index order]
>
> ## Refinement Report
> ### Modules Covered: [N]
> ### Source Fragments: [list all fragment file names]
> ### Locked Tech Values Carried Forward: [count]
> ### Locked Constraints Applied: [count]
> ```
>
> Rules:
> - Every MODULE section must contain the complete fragment content — no abbreviation or summarization
> - Module sections must appear in index order matching module-manifest.json
> - locked_tech and locked_constraints in the context block must be copied verbatim from module-manifest.json
>
> After writing, respond with: Phase 4 complete. Modules: [N]. File: [BUILD_DIR]/refined-prompt.md

Wait for the Phase 4 agent to complete before proceeding to Phase 5.

**Verification:**
- [ ] [BUILD_DIR]/refined-prompt.md exists and is non-empty
- [ ] Contains `<role>`, `<context>`, `<build_order>` blocks
- [ ] Contains one `## MODULE` section per module (count matches module-manifest.json modules array length)
- [ ] Contains `## Refinement Report` section with module count
- [ ] No MODULE section says "see docs" or references an external file

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 5 — Write Context (Serial Execution Agents, One Per Context Category)

Read `[BUILD_DIR]/context-catalog.json`. Extract the entries array.

For each entry in the entries array, IN SEQUENCE, spawn ONE Agent at a time. Wait for each agent to complete before spawning the next. Do not spawn multiple context writer agents simultaneously.

For each entry, spawn ONE Agent with this exact prompt (substituting all bracketed values):

> You are a context file writer. Your ONLY output is `[BUILD_DIR]/context/[file_name]`.
>
> Your context entry — all information you need is contained below. Do NOT read any other file:
>
> [paste the full JSON object for this entry from context-catalog.json, verbatim]
>
> Write `[BUILD_DIR]/context/[file_name]` with exactly this structure:
>
> ```markdown
> # [file_name] — [category] Reference
>
> **Role:** [prevents value from entry]
> **Status:** IMMUTABLE — do not modify during implementation phase
> **Depends on:** none
> **Required by:** [required_by_modules list joined by comma]
> **Date:** [today's date in YYYY-MM-DD format]
>
> ---
>
> ## Values
>
> [For each value in entry.values, write one line per value:]
> **[key]:** `[value]`
> ```
>
> After writing, respond with: Context file complete. File: [BUILD_DIR]/context/[file_name]

Process every entry sequentially. After ALL context files are written, proceed to Phase 6.

**Verification (after all context files written):**
- [ ] One context file exists in BUILD_DIR/context/ per entry in context-catalog.json
- [ ] Every context file contains Role, Status, Depends on, Required by, Date header fields
- [ ] Status is "IMMUTABLE" in every file
- [ ] Every context file contains a Values section with all key-value pairs from its catalog entry
- [ ] Context file count equals context-catalog.json entries array length

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 6 — Orchestrate (Execution Agent)

Spawn ONE Agent with this exact prompt:

> You are an orchestration writer. Your ONLY outputs are: `[BUILD_DIR]/orchestration/state.json`, `[BUILD_DIR]/orchestration/README.md`, and `[BUILD_DIR]/orchestration/prompt-NN.md` files.
>
> Read `[BUILD_DIR]/refined-prompt.md` in full.
> Read `[BUILD_DIR]/context-catalog.json` for context file cross-references only — do NOT re-read context files themselves and do NOT re-read any file in the docs folder.
>
> Atomicity definition — a step is atomic if and only if ALL three conditions are true:
> (a) It reads only files that exist on disk before this step runs (not files created by other steps in the same build)
> (b) It writes only files that no other step in the build writes
> (c) Its verification checklist items are all directly testable without executing other steps or running the application
>
> Execute in this order:
>
> 1. Read refined-prompt.md. Identify all atomic build steps. Declare scale:
>    - SMALL: 1–5 steps
>    - MEDIUM: 6–15 steps
>    - LARGE: 16+ steps
>
> 2. Write `[BUILD_DIR]/orchestration/state.json` with this structure:
> ```json
> {
>   "project": "[PROJECT_NAME]",
>   "scale": "SMALL | MEDIUM | LARGE",
>   "totalSteps": 0,
>   "pendingSteps": ["prompt-01", "prompt-02"],
>   "completedSteps": [],
>   "steps": {
>     "prompt-01": {
>       "status": "pending",
>       "title": "[step title]",
>       "context_files": ["[context file name from catalog that this step uses]"]
>     }
>   }
> }
> ```
>
> 3. Write `[BUILD_DIR]/orchestration/README.md` listing all steps with their index, title, and pending status.
>
> 4. Write each `[BUILD_DIR]/orchestration/prompt-NN.md` file. Every file MUST contain exactly these five sections in this order:
>
> ```markdown
> # Step [NN]: [step title]
>
> ## Hard Constraints (apply to every action in this step)
> 1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
> 2. Do not truncate any file. Write each file completely or not at all.
> 3. After completing this step, update [BUILD_DIR]/orchestration/state.json: move "prompt-[NN]" from pendingSteps to completedSteps and set its status to "complete".
> 4. Do not install or import any package not already present in package.json.
> 5. Use the Write tool only. Do not use Edit on files that do not yet exist.
>
> ## Prerequisites
> State: `[BUILD_DIR]/orchestration/state.json` — pendingSteps must contain "prompt-[NN]"
> Context files (read these before executing — they contain values you must not invent):
> [list each context file name from context-catalog.json that applies to this step, with its full path]
>
> ## Task
> [Numbered sub-steps derived from the module content in refined-prompt.md. Each sub-step must specify:
> - The exact file path to write or edit
> - The specific observable action (not "fix", "update", "handle" — but precise actions like "write a React component that exports a default function named X with these props", "add the SQL migration that creates table Y with columns Z")]
>
> ## Verification
> - [ ] [testable assertion about the file system state after this step — verifiable by reading a file or running a specific command]
>
> ## State Update
> In `[BUILD_DIR]/orchestration/state.json`:
> - Move "prompt-[NN]" from pendingSteps to completedSteps
> - Set steps["prompt-[NN]"].status = "complete"
> ```
>
> 5. Final check: count pendingSteps in state.json and count prompt-NN.md files written. These counts MUST match. If they differ: write the missing prompt files before responding.
>
> After writing, respond with: Phase 6 complete. Scale: [SCALE]. Steps: [N]. Context refs added: [N] prompts.

Wait for the Phase 6 agent to complete before proceeding to Phase 7.

**Verification:**
- [ ] [BUILD_DIR]/orchestration/state.json exists and is valid JSON
- [ ] [BUILD_DIR]/orchestration/README.md exists and is non-empty
- [ ] One prompt-NN.md file exists per step in state.json.pendingSteps
- [ ] Every prompt-NN.md contains Hard Constraints, Prerequisites, Task, Verification, State Update sections
- [ ] state.json.pendingSteps.length equals the count of prompt-NN.md files in orchestration/

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 7 — Runner (Execution Agent)

Spawn ONE Agent with this exact prompt:

> You are a runner command writer. Your ONLY output is `[WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md`.
>
> Read ONLY: `[BUILD_DIR]/orchestration/state.json`. Count entries in pendingSteps. This is TOTAL_STEPS.
>
> Write `[WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md` with this EXACT frontmatter. The frontmatter MUST contain only these two fields — no other flags of any kind:
>
> ```
> ---
> description: Run the [PROJECT_NAME] build pipeline. Executes the next pending step, verifies state advancement, and loops up to SESSION_BUDGET steps. Resume anytime with /run-[PROJECT_SLUG].
> allowed-tools: Read Write Agent Bash
> ---
> ```
>
> After the frontmatter, write this command body, substituting all bracketed values with their resolved strings (no variables, no placeholders — write the actual values):
>
> ```
> You are executing the /run-[PROJECT_SLUG] build runner.
>
> ## Configuration
>
> SESSION_BUDGET = 6  # adjust: floor(context_limit / avg_prompt_complexity)
> STATE_FILE = [BUILD_DIR]/orchestration/state.json
> ORCHESTRATION_DIR = [BUILD_DIR]/orchestration
> TOTAL_STEPS = [TOTAL_STEPS — the integer count from state.json.pendingSteps]
> WORKSPACE_ROOT = [WORKSPACE_ROOT — the resolved absolute path, written literally here]
>
> IMPORTANT: WORKSPACE_ROOT above is the resolved absolute path written directly into this file. Do NOT run pwd or any shell command to derive it.
>
> ## Execution Loop
>
> Execute the following loop:
>
> 1. Read STATE_FILE. Parse pendingSteps array and completedSteps array.
> 2. Initialize steps_this_session = 0.
> 3. If pendingSteps is empty: output "Build complete. All TOTAL_STEPS steps finished." and stop.
> 4. LOOP — repeat while pendingSteps is not empty AND steps_this_session < SESSION_BUDGET:
>    a. Set current_step = pendingSteps[0]
>    b. Read ORCHESTRATION_DIR/[current_step].md in full.
>    c. Spawn ONE Agent with the full contents of [current_step].md as the agent prompt. Substitute:
>       - Any reference to WORKSPACE_ROOT → the literal value in this file's Configuration section
>       - Any reference to BUILD_DIR → derived as: WORKSPACE_ROOT/[PROJECT_NAME]-Build
>    d. Wait for the agent to complete.
>    e. Read STATE_FILE. Move current_step from pendingSteps to completedSteps. Set steps.[current_step].status = "complete". Write STATE_FILE with these mutations only — preserve all other fields.
>    f. Increment steps_this_session by 1.
>    g. Output: "Step [current_step] complete ([steps_this_session] of SESSION_BUDGET this session, [completedSteps.length] of TOTAL_STEPS total)."
>    h. Loop back to step 4a.
> 5. After loop exits:
>    - If pendingSteps is empty: output "Build complete. All TOTAL_STEPS steps finished."
>    - If steps_this_session >= SESSION_BUDGET AND pendingSteps is not empty:
>      Output: "Session budget reached (SESSION_BUDGET steps this session). [completedSteps.length]/TOTAL_STEPS steps complete. Resume: /run-[PROJECT_SLUG]"
>
> ## State File Write Format
>
> When updating STATE_FILE, preserve ALL existing JSON fields. Only mutate:
> - pendingSteps: remove current_step from the front of the array
> - completedSteps: append current_step to the array
> - steps.[current_step].status: set to "complete"
> ```
>
> Before finalizing, verify the written file:
> - Frontmatter contains ONLY the description and allowed-tools fields — count the frontmatter fields; if any additional field is present, remove it
> - STATE_FILE path contains the actual BUILD_DIR value (not a template variable)
> - TOTAL_STEPS is an integer matching state.json.pendingSteps.length
> - WORKSPACE_ROOT line contains the resolved absolute path written as a literal string
> - SESSION_BUDGET = 6 with the comment `# adjust: floor(context_limit / avg_prompt_complexity)` is present
> - No template variables in the form [BRACKETED_NAME] remain — all have been substituted with actual values
>
> After writing, respond with: Phase 7 complete. File: [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md. Steps: [TOTAL_STEPS]. Invoke: /run-[PROJECT_SLUG]

Wait for the Phase 7 agent to complete before writing the Completion Report.

**Verification:**
- [ ] [WORKSPACE_ROOT]/.claude/commands/run-[PROJECT_SLUG].md exists
- [ ] Frontmatter contains only `description` and `allowed-tools` fields
- [ ] SESSION_BUDGET = 6 with comment `# adjust: floor(context_limit / avg_prompt_complexity)` is present in the file
- [ ] WORKSPACE_ROOT in the file is the resolved absolute path (a literal string, not a variable)
- [ ] TOTAL_STEPS is an integer matching state.json.pendingSteps.length
- [ ] No bracketed template variables remain in the file

If this phase's output artifact fails verification: trigger Phase 8 immediately. Pass the expected schema, actual artifact contents, and the specific failed checklist item as inline text in the Phase 8 agent prompt. Do NOT surface an error or ask the user for input before Phase 8 has written the fix prompt.

---

## Phase 8 — Self-Heal (Triggered on Verification Failure)

This phase is NOT part of the normal execution sequence. It triggers automatically when any phase's output artifact fails its embedded verification checklist.

Spawn ONE Agent with this exact prompt, substituting [N], [PHASE_NAME], [BUILD_DIR], [PROJECT_SLUG], and the three inline inputs:

> You are a fix prompt writer. Your ONLY output is `[BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md`.
>
> You have been triggered because Phase [N] ([PHASE_NAME]) failed verification.
>
> Inputs provided to you (do NOT read any other file):
> - Expected artifact: [paste the expected output schema for the failed phase, verbatim from the phase spec above]
> - Actual artifact: [paste the full contents of what was written, or write "nothing was written" if the file is absent or empty]
> - Failure reason: [paste the specific verification checklist item that failed]
>
> Write `[BUILD_DIR]/fix-phase[N]-[PROJECT_SLUG].md` with exactly this structure:
>
> ```
> # Fix Prompt: Phase [N] — [PHASE_NAME]
>
> ## What Failed
> [One sentence: the specific verification item that failed and why.]
>
> ## What Was Expected
> [The expected output schema, pasted inline. No file references.]
>
> ## What Was Found
> [The actual artifact contents, or "nothing was written."]
>
> ## How to Repair
> [The Phase [N] agent prompt from the command spec, verbatim, with the following injected as an additional constraint at the top: "PRIOR ATTEMPT FAILED: [failure reason]. Avoid this by: [specific corrective instruction derived from the failure]."]
>
> ## Verification
> [The verification checklist for Phase [N] as a checkbox list.]
>
> ## Instructions for User
> Send this file to a fresh Claude Code session. It contains everything needed to re-run Phase [N] in isolation. No other files or context are required.
> ```
>
> After writing, respond with exactly:
> Fix prompt written. File: [full path]. Send it to a fresh Claude Code chat.

---

## Completion Report

After all phases complete (Phase 0 through Phase 7), output:

```
/docs-to-build-v2 complete.

Project:    [PROJECT_NAME]
Docs:       [DOCS_DIR]
Build:      [BUILD_DIR]

Phase 0 — Setup:         Directories created.
Phase 1 — Map:           1 agent → module-manifest.json ([N] modules)
Phase 2 — Ground:        1 agent → context-catalog.json ([N] categories)
Phase 3 — Engineer:      [N] serial agents → [N] module-fragment files
Phase 4 — Synthesize:    1 agent → refined-prompt.md
Phase 5 — Context:       [N] serial agents → [N] context files
Phase 6 — Orchestrate:   1 agent → state.json + README + [N] prompt files
Phase 7 — Runner:        1 agent → run-[PROJECT_SLUG].md

Total agents spawned: [sum of all agents across phases]
To run the build: /run-[PROJECT_SLUG]
```

<!-- PATCH NOTE: insertion adjusted — no "You Are Done When" success criteria list found; added as new section at end of file as nearest semantically equivalent location -->

## You Are Done When

1. Phase 0 in the written command contains the setup-state.json resume check as Steps A–F — present as a named sub-section with the schema embedded verbatim, not as a comment or summary
