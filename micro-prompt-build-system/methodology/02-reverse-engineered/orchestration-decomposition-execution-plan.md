# Execution Plan: Orchestration Decomposition (Stage 5)
**Covers:** Outcome 03 — Fully Decomposed Orchestration Package
**Date:** 2026-03-26
**Step:** 02 — Reverse-Engineering Pass

---

## MINIMUM CONTEXT TO EXECUTE

- `refined-prompt.md` (from `/refinep` output) — MUST exist before starting
- `meta-prompt.md` (orchestration strategy document) — governs decomposition decisions
- Full understanding of all discrete verifiable units within the task
- File write capability to orchestration directory
- Decision: what to name the orchestration directory (e.g., `connect-da-dots/`)

---

## DECISION TREE: IS DECOMPOSITION NECESSARY?

```
Does the task in refined-prompt.md involve multiple discrete verifiable units?
  → YES: Decompose (Stage 5)
  → NO: proceed

Would executing the task risk exceeding 32,000 tokens in a single response?
  → YES: Decompose (Stage 5)
  → NO: Execute directly without Stage 5

BIAS: When in doubt, decompose. Over-splitting preferred to under-splitting.
```

---

## STEP SEQUENCE

### Step 1: Catalog All Discrete Verifiable Units (Pre-Write — Do Not Skip)
- **What to open:** `refined-prompt.md`, `design_decisions.md` specification
- **What to do:** List every atomic unit of work that the task requires. Apply the atomicity test to each: "Can this be completed and verified independently?"
  - Each CSS section → one unit
  - Each JavaScript module → one unit
  - Each batch of ≤20 data entries → one unit
  - Each standalone file (manifest.json, etc.) → one unit
  - Initialization steps → one unit
  - Verification passes → one unit
- **What to expect:** A complete list of discrete units in rough execution order
- **Gate:** List must be exhaustive. Do not proceed until you are confident no unit is missing.
- **Decision point:** If a unit seems large → subdivide further. Cardinal failure mode = combining two atomic tasks into one prompt.

### Step 2: Group Data Entries Into Batches
- **What to do:** For any task involving data entries, group them into batches of ≤20 entries each
- **Naming rule:** Use category names for batches, NOT batch numbers
  - CORRECT: `# Prompt 12: Write Symptom Data: Energy & Fatigue Category`
  - INCORRECT: `# Prompt 12: Write Symptom Data Batch 3`
- **What to expect:** Data-heavy tasks may produce 15–30 data batch prompts alone

### Step 3: Establish Execution Order and Dependency Graph
- **What to do:** Order all units into a sequence where:
  - No unit references a file or flag created by a later unit (DAG acyclicity — mandatory)
  - Setup/initialization prompts come first
  - Data foundation prompts precede prompts that use that data
  - Build/assembly prompts come last
- **Dependency graph check:** For every prerequisite in every prompt → trace back to which earlier step creates it. If you cannot trace it → it's a forward reference → reorder.
- **What to expect:** A linear or near-linear execution order. Some prompts may be parallelizable within a session.

### Step 4: Determine Sub-Agent Strategy Per Prompt
- **For each prompt, decide:** SOLO or PARALLEL
  - **SOLO:** Prompt executes as a single task in its session. No sub-agents spawned.
  - **PARALLEL:** Prompt may spawn sub-agents to execute independent sub-tasks simultaneously. Use when: multiple independent operations can run concurrently AND parallelization produces better/faster results.
- **Record decisions:** Sub-Agent Strategy column in README.md will encode these

### Step 5: Initialize State File Schema
- **What to do:** Design the state.json schema for this project:
  - List all step IDs (format: `step-NN-descriptive-name`)
  - List all boolean flags needed (one per major setup prerequisite that other steps check)
  - List all dataChunks keys needed (one per data category)
  - Determine buildTarget path
- **Critical rule:** ALL step IDs must be finalized BEFORE writing state.json. Never add steps mid-execution.
- **What to expect:** Complete schema design on paper/in notes before writing any file.

### Step 6: Write `state.json` (Initialization File)
- **What to do:** Write state.json with:
  ```json
  {
    "version": "1.0.0",
    "buildTarget": "[exact output directory path]",
    "completedSteps": [],
    "pendingSteps": ["step-01-id", "step-02-id", ..., "step-NN-id"],
    "artifacts": { "itemCount": 0, "filesWritten": [] },
    "dataChunks": { "[category1]": {}, "[category2]": {} },
    "flags": { "[flag1]": false, "[flag2]": false }
  }
  ```
- **Gate:** `pendingSteps` must contain ALL step IDs. Never empty. Never partial.
- **What to expect:** `[orchestration-dir]/state.json` written successfully.

### Step 7: Write `README.md` (Execution Index)
- **What to do:** Write README.md with execution index table:
  ```
  | Prompt # | File | Purpose | Prerequisites | Est. Token Output | Sub-Agent Strategy |
  |---|---|---|---|---|---|
  | 01 | prompt-01.md | [purpose] | none | [estimate] | SOLO |
  | 02 | prompt-02.md | [purpose] | state.json: step-01-id complete | [estimate] | SOLO |
  ...
  ```
- **Column definitions:**
  - `Prompt #`: zero-padded number (01, 02, 03...)
  - `File`: exact filename (prompt-NN.md)
  - `Purpose`: one-line imperative description of what this prompt does
  - `Prerequisites`: state.json flags that must be true AND files that must exist
  - `Est. Token Output`: rough estimate — flag any prompt estimated >25K tokens for potential splitting
  - `Sub-Agent Strategy`: SOLO or PARALLEL
- **What to expect:** `[orchestration-dir]/README.md` written successfully.

### Step 8: Write All `prompt-NN.md` Files
- **What to do:** Write every prompt file following the canonical schema:

  **File naming:** `prompt-NN.md` (zero-padded two-digit number)
  **Title format:** `# Prompt [NN]: [Action Title in imperative form]`

  **Required sections in order:**
  ```markdown
  ## Prerequisites
  [List state.json flags that must be true AND files that must exist.
   If none, write: "none"]

  ## Hard Constraints
  1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
  2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
  3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
  4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
  5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

  ## Task
  [Single, unambiguous instruction — one action, stated precisely.
   Imperative form. No compound verbs. No implicit scope. No undefined references.]

  ## Verification
  [Measurable, binary pass/fail checks that must all pass before state.json update.
   Example: "File [path] exists and contains [N] entries." NOT: "File looks correct."]

  ## State Update
  Perform these exact mutations to state.json:
  1. Append "[step-NN-id]" to completedSteps
  2. Remove "[step-NN-id]" from pendingSteps
  3. [If applicable] Set flags.[flagName] to true
  4. [If applicable] Increment artifacts.itemCount by [N]
  5. [If applicable] Append "[filename]" to artifacts.filesWritten
  6. [If applicable] Set dataChunks.[category].[key] to [value]
  ```

- **Hard constraint verbatim rule:** Copy the five constraints EXACTLY as written above. Word-for-word. No paraphrasing. No reordering. No omission.
- **What to expect:** All `prompt-NN.md` files written to `[orchestration-dir]/`

### Step 9: Verify the Complete Package
- **What to check:**
  - [ ] `state.json` exists with ALL step IDs in `pendingSteps`
  - [ ] `README.md` exists with table covering all prompts
  - [ ] Every `prompt-NN.md` exists (count matches pendingSteps count)
  - [ ] Every prompt has all 5 required sections
  - [ ] No prompt's Prerequisites references a file created by a later prompt
  - [ ] Hard constraints appear verbatim in every prompt
  - [ ] README Sub-Agent Strategy designations match prompt file content
  - [ ] No prompt's Task section contains more than one verifiable unit of work
- **Decision point:** Any check fails → fix before proceeding to Stage 6.

---

## SPLIT POINTS

**Split point: Within Step 8 (writing prompt files)**
- Condition: 45+ prompt files to write risks context window
- Handoff prompt for continuation:
  ```
  Read [orchestration-dir]/state.json and [orchestration-dir]/README.md.
  Continue writing prompt files starting from [prompt-NN.md].
  All prompts from prompt-01 through prompt-[NN-1] are already written.
  Follow the canonical schema exactly. Hard constraints must appear verbatim.
  When all prompt files are written, confirm count matches README.
  ```

---

## DECISION TREES WITHIN DECOMPOSITION

### Decision: Is this task atomic enough?
```
Does the task have exactly ONE verifiable completion condition?
  → YES: It's atomic. Write it as one prompt.
  → NO: Split it. Each verifiable condition = one prompt.

Can I write a single sentence in the Verification section for this task?
  → YES: Probably atomic.
  → NO: Split it — you have multiple verification conditions, meaning multiple tasks.
```

### Decision: Should this prompt be SOLO or PARALLEL?
```
Does this prompt's task involve multiple independent sub-operations?
  → NO: SOLO

Will parallelizing contribute to better results AND faster execution?
  → NO: SOLO
  → YES: proceed

Are all sub-operations independent (no shared state writes)?
  → NO: SOLO (sequential within session)
  → YES: PARALLEL
```

### Decision: Is a prerequisite valid?
```
Does this prerequisite reference a file or flag?
  → FLAG: Is that flag set by a prompt with a LOWER number than this one?
      → YES: Valid prerequisite
      → NO: Forward reference — reorder prompts or redesign
  → FILE: Is that file written by a prompt with a LOWER number than this one?
      → YES: Valid prerequisite
      → NO: Forward reference — reorder prompts or redesign
```
