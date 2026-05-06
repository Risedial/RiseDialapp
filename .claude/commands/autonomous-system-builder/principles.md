# Autonomous System Builder — Principles, Anti-Patterns, and Distillation

## The 13 Principles

### P1 — State as Source of Truth

Every step reads state.json before acting and writes state.json only after its verification checklist fully passes. READ at step entry; WRITE as the absolute last action.

**Why:** If state.json is updated before verification, the next step builds on a corrupt foundation. A partially-completed step that crashes mid-execution leaves state.json claiming the step is done, causing the runner to skip it permanently.

**In practice:** Every prompt file's Task section begins with "Read STATE_FILE. Verify this step is in pendingSteps." Every prompt file's State Update section is always the last section — executed only after all Verification checklist items pass.

---

### P2 — Mode Purity

Each step operates in exactly one mode: COLLECT (write only to context/), PLAN (write only to plans/), or EXECUTE (write only to application code). Hard Constraint #1 in every prompt file is the mode lock.

**Why:** When a step can write anywhere, agents cross boundaries and contaminate later steps with assumptions that haven't been verified. A COLLECT step that writes a plan file means the plan was created without the full context the COLLECT step was supposed to gather.

**In practice:** Every prompt file's Hard Constraints section item #1 names exactly one directory the step may write to. No exceptions. Sub-agents generating COLLECT, PLAN, and EXECUTE prompts are separate agents that receive separate prompts — they cannot accidentally cross-contaminate.

---

### P3 — Files as Context Transport

No agent relies on memory from a prior session. Every fact required by a step must exist in a readable file before the step starts. COLLECT steps write immutable context files. Everything travels as files.

**Why:** LLM session memory is bounded, lossy across sessions, and unverifiable. An agent that "remembers" a function name from step 1 will hallucinate with increasing confidence as the session progresses. Files are durable, inspectable, and exact.

**In practice:** Every PLAN step's Task section lists the exact context files it must read, with absolute paths, as a declared prerequisite. EXECUTE steps read plan files, not context files — they receive exactly the Before state / After state they need, nothing more.

---

### P4 — Stop-and-Report

When a step encounters any discrepancy between its plan and reality, it stops immediately and reports. It does not attempt to resolve or work around it.

**Why:** An agent that encounters an unexpected state and "figures it out" introduces unverified decisions into the execution chain. Each workaround compounds with later steps. By step 5, the system is executing against a mutated plan that no human approved.

**In practice:** Every EXECUTE prompt step 3 is: "Read the target source file. Confirm it matches plan's Before state character-for-character. If it does not match: stop and report the discrepancy — do not attempt to resolve it."

---

### P5 — Idempotency by Design

Every step can be re-run safely. bootstrap_complete flag prevents re-bootstrapping. pendingSteps/completedSteps dual-array prevents re-executing done steps.

**Why:** Sessions fail. Network drops. Context limits hit mid-step. If re-running a step corrupts state or re-applies a change already applied, the system is fragile by design. Re-runability must be structural, not accidental.

**In practice:** The runner checks pendingSteps at loop entry — a step already in completedSteps is never spawned again. The bootstrap phase produces all files idempotently; re-running /autonomous-system-builder on an existing system triggers the collision check and asks the user before overwriting.

---

### P6 — Session Budget as Cognitive Reset

SESSION_BUDGET = 3 caps steps per session. After budget: user opens fresh chat and pastes runner command. Fresh chats are a reliability mechanism, not a workaround.

**Why:** LLM context quality degrades as the session grows. By step 6–8 of a long session, an agent has accumulated a context window full of prior tool outputs, intermediate reasoning, and incremental state — increasing hallucination risk on each subsequent spawn. The 3-step budget forces a context reset before degradation compounds.

**In practice:** The runner's SESSION_BUDGET constant is 3 and cannot be overridden. The Next-Session Block in the runner contains the exact command to paste — zero decisions required from the user.

---

### D1 — Bootstrap Separation

System generation (bootstrap) is completely separate from system execution (runner). Bootstrap runs once and produces all artifacts. It never executes any steps.

**Why:** Mixing generation with execution means the system has no stable checkpoint — partial generation leaves partial execution behind, and neither is recoverable. Clean separation means: generate everything first (verifiable), then execute against a complete system (resumable).

**In practice:** /autonomous-system-builder writes only orchestration files (state.json, step-plan.json, prompt files, runner). It touches zero application code. The runner (/run-[SYSTEM_NAME]) is the only entry point into execution.

---

### D2 — Pre-Research Before Any Code Touch

All facts needed for EXECUTE steps are gathered in COLLECT steps before any code is written. The first EXECUTE step must never be the first step overall.

**Why:** An EXECUTE step that discovers the codebase mid-execution makes unverified assumptions about the scope of its changes. COLLECT steps produce immutable, human-inspectable records of what exists before any mutation occurs.

**In practice:** STEP_IDS derivation enforces: step-01 is always a COLLECT step. The step sequence validation in PHASE 5 (QC3) catches any generated sequence where an EXECUTE step has no immediately preceding PLAN step.

---

### D3 — Plan Before Execute, Never Merge

Every EXECUTE step has a corresponding PLAN step that precedes it. The PLAN step's output (a plan file) is the contract the EXECUTE step fulfills.

**Why:** An EXECUTE step that plans as it executes merges two distinct cognitive modes — discovery and mutation — into one uncontrolled action. The plan file is both the specification and the audit trail.

**In practice:** Sub-agents 3 (PLAN) and 4 (EXECUTE) are explicitly separate. QC3 and QC4 verify that every EXECUTE step has a preceding PLAN step and that step 1 of every EXECUTE prompt verifies the plan file exists before acting.

---

### D4 — Immutable Context Files

Context files written by COLLECT steps are never overwritten by later steps. PLAN and EXECUTE steps read context files; they never write to the context directory.

**Why:** If a PLAN step can modify a context file, later COLLECT steps (in multi-cycle systems) may read a mutated version and produce plans based on state that no longer reflects the codebase. Immutability makes context files auditable.

**In practice:** PLAN and EXECUTE prompt files have mode locks that explicitly exclude context/ from their allowed write directories. QC2 verifies that each prompt's Hard Constraints block names only the correct directory for that mode.

---

### D5 — Flag-Gated Prerequisites

Every step except step-01 has explicit flag prerequisites declared in state.json that must be `true` before the step begins. A step whose flag is false stops and reports.

**Why:** Without flag gates, a step can run even when its dependency failed silently. A PLAN step that runs against incomplete COLLECT output produces a plan based on partial data — an error that propagates invisibly to EXECUTE.

**In practice:** Every prompt file except prompt-01 begins its Task section with "Read STATE_FILE. Verify [prerequisite flags] are true. If any is false: stop and report [specific flag name] — do not proceed."

---

### D6 — Anti-Hallucination Protocol at Execute Gate

Before the runner spawns any EXECUTE-mode agent, it performs: (1) plan file exists, (2) target file path named in the plan exists on disk, (3) if either fails, spawn COLLECT to re-locate.

**Why:** Between sessions, files move, refactors happen, and plans reference paths that no longer exist. An EXECUTE agent that applies changes to a nonexistent or wrong file causes silent corruption. The anti-hallucination check catches this before any mutation.

**In practice:** The anti-hallucination protocol is triggered inside the runner's execution loop — not once at startup — for every EXECUTE-mode step. QC10 verifies this placement.

---

### D7 — Vision Alignment Before System Design

Before generating any orchestration artifact, achieve 100% alignment with the user on objective, success criteria, ongoing vs. end-state, constraints, and protected artifacts using AskUserQuestion. No generation until alignment confirmed.

**Why:** A system built for the wrong objective is worse than no system — it creates work to undo. The 3 AskUserQuestion batches (objective+type+stack, constraints+scope+verification, confirmation) eliminate the most common sources of misalignment before any file is written.

**In practice:** PHASE 1 of /autonomous-system-builder completes all 3 AskUserQuestion batches and receives explicit Q7 confirmation before any Write tool call is issued. QC13 verifies this ordering.

---

## The 10 Anti-Patterns

| ID | Anti-Pattern | Correct Pattern |
|----|-------------|----------------|
| AP1 | All steps written as EXECUTE — agent invents file paths mid-execution | COLLECT → PLAN → EXECUTE in strict sequence |
| AP2 | Single mega-prompt for all steps — partial completion undetectable | One prompt file per step, one output artifact per step |
| AP3 | Trusting agent memory across sessions — hallucinated identifiers with high confidence | Immutable context files; every step reads the file, never memory |
| AP4 | Updating state before verification passes — next step builds on corrupt foundation | State update is always the last action of a step |
| AP5 | Running all steps in one session — context inflates, agent confabulates by step 5-6 | SESSION_BUDGET = 3 maximum; fresh chat after budget |
| AP6 | Generic verification ("confirm it looks correct") — agent auto-passes everything | Specific observable assertion with exact expected value |
| AP7 | Merging PLAN and EXECUTE in one step — plan contaminated by execution-time assumptions | Separate PLAN step writes plan file before EXECUTE step runs |
| AP8 | Skipping anti-hallucination check at execute gate — edits nothing, reports success | Runner verifies plan file + target path before every EXECUTE spawn |
| AP9 | Open-ended user input for objective — system built for wrong goal | AskUserQuestion with specific options before any generation |
| AP10 | Relative paths in state.json and prompts — resolve differently by CWD | All paths absolute; buildTarget declared as constant in state.json |

---

## SOT Distillation

> "This system's reliability comes entirely from what it refuses to do: agents don't remember across sessions, steps don't cross mode boundaries, execution doesn't happen without a verified plan, and state only updates after binary verification passes — every robustness property is the absence of a permission, not the presence of a feature."
