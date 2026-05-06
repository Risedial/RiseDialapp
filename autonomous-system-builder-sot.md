# SOT: Autonomous Orchestration System Design

> **Created by:** /dst:observe
> **Created:** 2026-05-05T00:00:00Z
> **Source:** Session artifacts — run-risedial-audit.md, state.json, step-plan.json, prompt-01 through prompt-06, orchestration/risedial-audit/ + bootstrap methodology from conversation
> **Consumed by:** /dst:blueprint to produce meta-prompts

---

## Part 1: Why This Domain Is Hard (The Core Problem)

AI agents executing multi-step tasks across multiple sessions degrade in reliability not because any single step is wrong, but because errors compound silently across session boundaries — an agent that invents a plausible file path in step 3 won't visibly fail until step 5, and by then the state log shows the system as healthy. The specific failure modes are: agents hallucinate identifiers (file paths, function names, line numbers) when cross-session context is absent; long-running sessions accumulate context until the agent confabulates rather than reasons; partial step execution is indistinguishable from complete execution without binary verification; mode contamination (planning and executing in one step) makes plans unfalsifiable; and the state file — meant to be the reliability anchor — becomes the primary corruption vector when steps update it before verification passes. What makes this domain uniquely hard is that all of these failures present as successes: the agent reports completion, the state file shows the step as done, and the error only surfaces when a later step tries to build on the corrupted foundation.

---

## Part 2: Universal Principles

**P1 — State as Source of Truth**
Every step reads state.json before acting and writes state.json only after its verification checklist fully passes.
**Why:** Without honest state, the system re-executes completed steps or skips incomplete ones — both silently and with no visible error.
**In practice:** READ state at step entry to check prerequisites and confirm the step is pending. WRITE state as the absolute last action, only after all verification items pass. Never update state mid-step.

**P2 — Mode Purity**
Each step operates in exactly one mode: COLLECT (read source, write only to context/), PLAN (write only to plans/), or EXECUTE (write only to application code). No step crosses modes.
**Why:** Mode mixing makes partial execution undetectable and allows EXECUTE-time assumptions to contaminate pre-research context, which then propagates as hallucinations to later steps.
**In practice:** Hard Constraint #1 in every prompt file is the mode lock — it names the exact directories the step may write to. Violation is not an error to handle; it is a sign the prompt was written incorrectly.

**P3 — Files as Context Transport**
No agent relies on memory from a prior session. Every fact required by a step — file paths, line numbers, code signatures, domain constants — must exist in a readable file before the step starts.
**Why:** LLM sessions have no persistent memory. An agent that "knows" a function signature from 10 turns ago will recall it with high confidence and 20% accuracy in a fresh session — silently wrong.
**In practice:** COLLECT steps write immutable context files. Every subsequent step lists the context files it reads in its Prerequisites section. Nothing is passed via conversation; everything travels as files.

**P4 — Stop-and-Report, Not Guess-and-Proceed**
When a step encounters any discrepancy between its plan and reality — wrong file path, missing function, unexpected code, shifted line number — it stops immediately and reports the discrepancy. It does not attempt to resolve or work around it.
**Why:** A guessed resolution is unverifiable. The agent cannot tell whether its guess was correct. A stopped step is recoverable; a silently wrong resolution corrupts state and is invisible.
**In practice:** Every EXECUTE task section includes explicit stop conditions: "If [plan reference] cannot be found in the file, stop and report the discrepancy — do not proceed."

**P5 — Idempotency by Design**
Every step can be re-run safely. The system detects already-completed steps via state.json and skips them without side effects.
**Why:** Session interruptions, network failures, and user-initiated stops are normal. A non-idempotent step that runs twice corrupts application code or produces duplicate artifacts.
**In practice:** bootstrap_complete flag prevents re-bootstrapping. pendingSteps/completedSteps dual-array prevents re-executing done steps. Flag prerequisites prevent steps from running out of order even if state is manually edited.

**P6 — Session Budget as Cognitive Reset**
An explicit SESSION_BUDGET caps the number of steps executed per session. When the budget is exhausted, the system instructs the user to open a fresh chat and paste the runner command.
**Why:** Context window accumulation is not linear — it reaches an inflection point where the agent begins confabulating. Fresh chats are a reliability mechanism, not a workaround. SESSION_BUDGET = 3 is the safety threshold, not a convenience.
**In practice:** Runner loop condition: `while pendingSteps not empty AND steps_this_session < SESSION_BUDGET`. After budget exhausts, print the next-session block with the exact command to paste — no variables, no decisions required from the user.

---

## Part 3: Domain-Specific Principles

**D1 — Bootstrap Separation**
System generation (bootstrap) is completely separate from system execution (runner). Bootstrap runs once and produces all artifacts: state.json, context files, step-plan.json, prompt files, and the runner slash command. It never executes any steps.
**Why:** Mixing bootstrap and execution means re-generating prompts on every run, which either overwrites in-progress state or creates version conflicts between the running system and its instructions.
**In practice:** Bootstrap has an idempotency gate at entry: read state.json; if `bootstrap_complete: true`, skip to output. The runner command is the artifact of bootstrap — it has no knowledge of how the system was built.

**D2 — Pre-Research Before Any Code Touch**
All facts needed for EXECUTE steps — file paths, line numbers, exact code signatures — are gathered in COLLECT steps before any code is written. The first EXECUTE step must never be the first step overall.
**Why:** An EXECUTE step that discovers its own targets will hallucinate when its first guess is wrong, then apply the hallucinated edit without knowing it was wrong.
**In practice:** COLLECT steps write context files with exact verbatim quotes from source files, exact line numbers, and confirmation of expected patterns. EXECUTE steps read these files as the first action after reading the plan.

**D3 — Plan Before Execute, Never Merge**
Every EXECUTE step has a corresponding PLAN step that precedes it. The PLAN step's output (a plan file) is the contract. The EXECUTE step reads it as step 1 and fulfills the contract.
**Why:** An agent that plans and executes in the same context cannot have its plan independently verified. The plan file makes the before/after state explicit and testable before any edit is applied.
**In practice:** Step numbering: COLLECT(01) → PLAN(02) → EXECUTE(03) → PLAN(04) → EXECUTE(05). Each plan file contains exact "Before state" and "After state" fields with verbatim quoted text from the source file.

**D4 — Immutable Context Files**
Context files written by COLLECT steps are never overwritten by later steps. PLAN and EXECUTE steps read context files; they never write to the context directory.
**Why:** A mutable context file allows EXECUTE steps to update pre-research with execution-time assumptions — contaminating the verification baseline for all subsequent steps.
**In practice:** Mode lock for PLAN steps: "write only to plans/." Mode lock for EXECUTE steps: "write only to application code." Neither may touch context/.

**D5 — Flag-Gated Prerequisites**
Every step except step-01 has explicit flag prerequisites declared in state.json that must be `true` before the step begins. A step whose prerequisite flag is `false` stops and reports — it does not skip ahead.
**Why:** Step ordering is enforced only by flags. Without them, a resumed session can proceed to step-05 with step-02's output missing, producing a silently broken result.
**In practice:** `flags.codebaseVerified = true` is a prerequisite for every post-COLLECT step. `flags.messageOrderFixed = true` is a prerequisite for the commit step. Flags are set in state.json only when the corresponding step's verification checklist passes.

**D6 — Anti-Hallucination Protocol at Execute Gate**
Before the runner spawns any EXECUTE-mode agent, it performs a 3-check protocol: (1) the plan file for this step exists, (2) the target file path named in the plan exists on disk, (3) if either check fails, spawn a COLLECT agent to re-locate the target before proceeding.
**Why:** An EXECUTE agent given a plan that references a renamed function or shifted line number will appear to succeed — it may edit nothing, or edit the wrong thing, and report completion.
**In practice:** Runner section "Anti-Hallucination Protocol" runs before every EXECUTE step spawn. It is not run at startup — it runs at the moment of spawning, using the current state of the plan file and the current state of the filesystem.

**D7 — Vision Alignment Before System Design**
Before generating any orchestration artifact, the system must achieve 100% alignment with the user on: objective, success criteria, ongoing vs. end-state nature, constraints, and protected artifacts. Clarification questions use AskUserQuestion with specific options — never open-ended text input alone.
**Why:** A system built for a misunderstood objective generates coherent-looking artifacts that execute the wrong goal. Discovering the misalignment at step 5 means re-generating from scratch.
**In practice:** The builder slash command asks clarifying questions using AskUserQuestion before generating any files. Questions are grouped — no single-question-at-a-time loops. User must confirm alignment before generation begins.

---

## Part 4: Canonical Anatomy / Structure Template

### Filesystem layout

```
[PROJECT_ROOT]/
└── orchestration/
    └── [system-name]/
        ├── state.json                      ← control loop; only file that mutates during execution
        ├── step-plan.json                  ← static declaration; never mutates after bootstrap
        ├── context/
        │   ├── [domain]-facts.md           ← IMMUTABLE: verified tech constants, protected files
        │   ├── [domain]-locations.md       ← IMMUTABLE: pre-researched targets with exact quotes
        │   └── verified-[topic].md         ← COLLECT output: verbatim source quotes + line numbers
        ├── plans/
        │   ├── [NN]-[task]-plan.md         ← PLAN output: before/after state, scope, verification test
        │   └── ...
        └── prompts/
            ├── prompt-01.md                ← COLLECT step
            ├── prompt-02.md                ← PLAN step (reads context, writes plan)
            ├── prompt-03.md                ← EXECUTE step (reads plan-02, writes app code)
            └── ...

[CLAUDE_DIR]/commands/
└── [runner-name].md                        ← slash command; references all paths above
```

### state.json schema

```json
{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "[name]",
  "buildTarget": "[absolute/path/to/project]",
  "orchestration_dir": "[absolute/path/to/orchestration/system-name]",
  "completedSteps": [],
  "pendingSteps": [
    "step-01-[mode]-[task]",
    "step-02-[mode]-[task]",
    "..."
  ],
  "artifacts": {
    "filesWritten": [],
    "plansCreated": []
  },
  "flags": {
    "[domain]Verified": false,
    "[task1]Complete": false,
    "[task2]Complete": false,
    "allChangesCommitted": false
  },
  "knownItems": {
    "ITEM-ID": "pending | complete | fixed"
  }
}
```

### Prompt file schema (every prompt follows this exactly)

```markdown
# Prompt NN: [Title]
**Mode:** COLLECT | PLAN | EXECUTE
**Step ID:** [step-NN-mode-task]   ← must match state.json and step-plan.json exactly

## Prerequisites
[State flags required — e.g., "flags.domainVerified = true in STATE_FILE"]
[Files to read before starting — listed with absolute paths]
[Or: "None. This is the first step."]

---

## Hard Constraints

1. **Mode lock — [MODE]:** Write only to [CONTEXT_DIR | PLANS_DIR | app code] — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **[EXECUTE only] TypeScript gate:** Run `npx tsc --noEmit` after writing. Fix all errors. Step cannot complete with TypeScript errors.
6. **Anti-hallucination:** All identifiers (names, paths, signatures) must be confirmed from actual file read or context files — not from memory.

[PATH CONSTANTS — re-declare here, do not assume the agent knows them]
STATE_FILE = [absolute path]
[CONTEXT_DIR or PLANS_DIR] = [absolute path]

---

## Task

[Numbered sub-steps. Each sub-step has one concrete action.]
[EXECUTE: Step 1 is always "Verify plan file exists — if not, stop and report."]
[EXECUTE: Step 2 is always "Read plan file. Note exact before/after state."]
[EXECUTE: Step 3 is always "Read source file. Confirm it matches plan's Before state exactly — if not, stop and report."]
[Stop-and-report pattern for every discrepancy.]

---

## Verification
- [ ] [Specific binary assertion — file exists, line contains exact text, etc.]
- [ ] [Specific binary assertion]
- [ ] [EXECUTE only] `npx tsc --noEmit` exits with code 0

---

## State Update
After all verification checks pass:
1. [Set flag] — e.g., Set `flags.domainVerified = true`
2. Move `"[step-id]"` from `pendingSteps` to `completedSteps`
3. [Append artifact] — e.g., Append `"path/to/file"` to `artifacts.filesWritten`
4. Write STATE_FILE back with these changes (preserve all other fields exactly)
```

### Runner slash command schema

```markdown
---
description: [One sentence: what it does, that it's resumable, how to invoke]
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

## Configuration
SESSION_BUDGET  = [N — typically 3]
STATE_FILE      = [absolute path to state.json]
PROMPTS_DIR     = [absolute path to prompts/]
TOTAL_STEPS     = [N]

## Anti-Hallucination Protocol
Before spawning any EXECUTE-mode step:
1. Confirm the plan file for that step exists in PLANS_DIR
2. Read the plan file — verify the target file path it names exists on disk
3. If check fails: spawn a COLLECT agent to re-locate the target, update the plan, then proceed

## Execution Loop
1. Read STATE_FILE. Parse pendingSteps and completedSteps.
2. steps_this_session = 0
3. If pendingSteps is empty → print completion block and stop.
4. LOOP while pendingSteps not empty AND steps_this_session < SESSION_BUDGET:
   a. current_step = pendingSteps[0]
   b. Find prompt file in PROMPTS_DIR whose Step ID matches current_step
   c. Read that prompt file in full
   d. Spawn ONE Agent with the full prompt file contents as its prompt
   e. Wait for agent to complete
   f. Read STATE_FILE. Move current_step from pendingSteps → completedSteps. Write STATE_FILE.
   g. steps_this_session++
   h. Print progress: "✓ [step] done ([N]/SESSION_BUDGET this session, [M]/TOTAL_STEPS total)"
5. If pendingSteps empty → print completion block
   If SESSION_BUDGET reached → print next-session block

## Completion Block
[Visual separator + success message + list of what was accomplished]

## Next-Session Block
[Visual separator + progress count + exact copy-paste command to resume — no variables]

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from front
- completedSteps: append current_step
- flags: set relevant flag to true when its step completes
```

---

## Part 5: Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Pattern |
|---|---|---|
| AP1: All steps written as EXECUTE | Agent invents file paths, function names, and line numbers mid-execution. No COLLECT step established ground truth, so every invented value is plausible-sounding and unverified. | COLLECT → PLAN → EXECUTE in strict sequence. Discovery before planning; planning before touching code. |
| AP2: Single mega-prompt for all steps | Partial completion is undetectable. State can't represent "80% through one giant step." Fresh-chat resumption has no safe re-entry point. | One prompt file per step. Each step has exactly one output artifact. Resumption reads pendingSteps[0] and picks up from there. |
| AP3: Trusting agent memory across sessions | Agents hallucinate identifiers with high confidence. A function name from 10 turns ago in this session is recalled at ~80% accuracy in a fresh session — silently wrong 20% of the time. | Write verified facts to immutable context files in COLLECT steps. Every subsequent step reads the file — never memory. |
| AP4: Updating state before verification passes | State shows step as complete. Next step builds on a corrupt foundation. Real failure surfaces 2–3 steps later, far from its cause and with no error trail. | Verification checklist must fully pass before any state mutation. State update is always the last action of a step. |
| AP5: Running all steps in one session | Context window inflates. By step 5–6, the agent operates on accumulated noise and begins confabulating edits it never made, verifications it never ran. | SESSION_BUDGET = 3 maximum. After budget, fresh chat mandatory. State file is the only context that crosses session boundaries. |
| AP6: Generic verification items ("confirm it looks correct") | Not binary. Agent auto-passes everything that plausibly looks right, including incorrect changes. Subjective verification is indistinguishable from no verification. | Every item must be a specific observable assertion: "file contains `ascending: true` at line 75" — not "the sort order change looks correct." |
| AP7: Merging PLAN and EXECUTE in one step | The plan becomes contaminated by execution-time assumptions. The "Before state" is recorded after the file was already changed. The plan is unfalsifiable. | Separate PLAN steps write plan files as contracts. EXECUTE steps fulfill the contract and can verify Before state against the plan before editing. |
| AP8: Skipping anti-hallucination check at execute gate | Runner spawns EXECUTE agent with a plan that references a renamed function or a file that was moved. Agent edits nothing, reports success, state updates to "complete." | Runner verifies plan file exists + target path exists before every EXECUTE spawn. Any failure → spawn COLLECT to re-locate → update plan → execute. |
| AP9: Open-ended user input for objective | User describes objective ambiguously. System builds a coherent orchestration system for the wrong goal. Misalignment discovered at step 5 = full rebuild. | AskUserQuestion with specific options before any generation. Confirm: objective, success criteria, ongoing/end-state, constraints, protected files. No generation until alignment confirmed. |
| AP10: Relative paths in state.json and prompts | Paths resolve differently depending on working directory at the time of execution. A step that runs from a different CWD silently edits the wrong file or fails to find its context. | All paths in state.json, prompt files, and runner are absolute. Working directory is declared as a constant in state.json (buildTarget). |

---

## Part 6: The Distillation

This system's reliability comes entirely from what it refuses to do: agents don't remember across sessions, steps don't cross mode boundaries, execution doesn't happen without a verified plan, and state only updates after binary verification passes — every robustness property is the absence of a permission, not the presence of a feature.

---

## Part 7: Required Inputs

| Input | Source | Why Required |
|-------|--------|--------------|
| User objective | Provided at builder invocation (inline text or file) | Every orchestration decision — step count, modes, domain — derives from this |
| Success criteria and system type | AskUserQuestion clarification before generation | Determines whether runner terminates (end-state) or loops indefinitely (ongoing) |
| Target project absolute path | User-provided or derived from working directory | All path constants must be absolute; relative paths fail across sessions |
| Protected file list | User-provided at vision-alignment phase | EXECUTE step "DO NOT TOUCH" lists come from here; without it, any file is fair game |
| Pre-researched facts (optional) | Prior session or user-provided | Populates immutable context files without a COLLECT step — reduces total steps needed |
| Domain-specific flag names | Derived from objective by the builder system | Flags must reflect actual task milestones — generic names ("task1Done") produce unreadable state |
| Verification gate per task | Derived from objective + tech stack | TypeScript check, lint, test run — depends on what "done correctly" means for this domain |

---

## Part 8: Quality Checklist

- [ ] Every prompt file has a Mode header that matches its step-plan.json mode field exactly
- [ ] Every prompt file's Hard Constraints block names the exact directories the step may write to — and only those
- [ ] Every EXECUTE step has a corresponding PLAN step immediately preceding it in pendingSteps order
- [ ] Every EXECUTE step's task section begins with "verify plan file exists — if not, stop and report"
- [ ] Every verification checklist item is a specific binary assertion with an exact expected value (not a judgment call)
- [ ] Every EXECUTE step runs the domain-appropriate type/lint/test check and cannot complete with errors
- [ ] State update section in every prompt lists every mutation in order with exact field names, exact values, exact array operations
- [ ] The runner's next-session block contains the exact copy-paste command to resume — no variables, no decisions required
- [ ] No step references any identifier (path, function, variable) not received from a context file or listed prerequisites
- [ ] The runner anti-hallucination protocol runs before every EXECUTE-mode spawn — not once at startup
- [ ] completedSteps.length + pendingSteps.length equals TOTAL_STEPS at all times in a valid state.json
- [ ] Bootstrap phase writes only files — it executes zero steps and touches zero application code
- [ ] The builder slash command asks all clarifying questions before generating any artifact — no partial generation
- [ ] Every context file is marked IMMUTABLE — no PLAN or EXECUTE step is permitted to write to context/
