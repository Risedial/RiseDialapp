# Approach Selection Decision Tree
**Purpose:** Autonomous approach selection for any sub-task in the methodology
**Date:** 2026-03-26

---

## PRIMARY DECISION TREE: WHAT DO I DO WITH THIS TASK?

```
INPUT: A task description or prompt

BRANCH 1: Do I have a fully written prompt ready to execute?
  → NO → Go to BRANCH 2 (Prompt Preparation)
  → YES → Go to BRANCH 5 (Execution Strategy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRANCH 2: Is the specification/ideation complete?

  → NO → STOP. Complete ideation first (design_decisions.md equivalent).
          Ideation produces: locked decisions, exact values, no hedging.
          Do not begin prompt formulation until ALL design decisions are made.

  → YES → Go to BRANCH 3 (Prompt Formulation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRANCH 3: What quality level does this task require?

  → QUICK / EXPLORATORY:
      Apply 8-rule mental checklist manually.
      Invoke /prompt [raw prompt].
      Use output directly.
      DONE.

  → PRODUCTION-GRADE / COMPLEX / MULTI-FILE:
      Apply 8-rule checklist manually OR invoke /prompt [raw prompt].
      Pipe output into /refinep.
      Use refined-prompt.md output.
      Go to BRANCH 4.

  → UNSURE:
      Default to PRODUCTION-GRADE path. Cost of refinement < cost of re-execution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRANCH 4: What does refined-prompt.md describe?

  → Single focused task, one primary output, <32K tokens:
      Execute refined-prompt.md directly.
      Fresh chat. Self-contained execution.
      DONE.

  → Large task with multiple verifiable units OR >32K token risk:
      Go to BRANCH 5 (Decomposition Path)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRANCH 5: Decomposition or Direct Execution?

  Does the task contain multiple discrete verifiable units?
    → YES → DECOMPOSE (Stage 5 path)
    → NO → proceed

  Would executing in one response risk >32,000 tokens?
    → YES → DECOMPOSE (Stage 5 path)
    → NO → proceed

  Am I uncertain?
    → BIAS: decompose. Over-split preferred to under-split.

  → DIRECT EXECUTION: Execute the single prompt in a fresh session.
    DONE.

  → DECOMPOSE: Go to DECOMPOSITION DECISION TREE below.
```

---

## DECOMPOSITION DECISION TREE

```
INPUT: Complex task ready for decomposition

STEP D1: Is meta-prompt.md / orchestration strategy documented?
  → NO → Document it first. Define: decomposition rationale, session model, constraints.
  → YES → Proceed.

STEP D2: Catalog discrete verifiable units (pre-write — mandatory, do not skip)
  For each potential unit, ask:
    "Can this be completed and verified independently?"
    → YES → It is one unit → one prompt
    → NO → It is not atomic → decompose further

  Atomicity test for data entries:
    Each batch of ≤20 entries per category = one unit

  Atomicity test for code:
    Each CSS section = one unit
    Each JS module = one unit
    Each standalone file = one unit
    Initialization steps = one unit
    Verification passes = one unit

STEP D3: Order units into dependency graph
  Rule: No unit may reference a prerequisite created by a later unit.
  Check: For every prerequisite → trace to the step that creates it.
         That step must have a LOWER number.
         If not → reorder.

STEP D4: Assign Sub-Agent Strategy
  For each unit:
    Are there multiple INDEPENDENT sub-operations within this unit?
    → NO → SOLO
    → YES, and parallelization improves results → PARALLEL
    → YES, but sub-operations share state → SOLO (sequential within session)

STEP D5: Size check
  For each unit, estimate token output.
    > 30,000 tokens → MUST split further before writing the prompt
    25,000–30,000 tokens → WARNING: flag for possible splitting
    < 25,000 tokens → acceptable

STEP D6: Write orchestration package (in this order)
  1. state.json (all step IDs in pendingSteps — fully populated)
  2. README.md (index table)
  3. prompt-01.md through prompt-NN.md (all files)

STEP D7: Write context files (Stage 6)
  1. data layer: data-inventory.md + design-tokens.css
  2. structure layer: app-architecture.md + ui-design-system.md
  3. build layer: pwa-technical.md + build-manifest.md

STEP D8: Begin sequential execution (Stage 7)
  Each prompt = fresh session.
  Session protocol: read state.json → confirm step in pendingSteps → execute → verify → update state → exit.
```

---

## TOOL SELECTION DECISION TREE

```
I need to accomplish a specific operation. Which tool/mechanism?

OPERATION: Optimize a prompt quickly
  → /prompt command
  → Output: single code block, no commentary

OPERATION: Produce a production-grade prompt with full diagnostic report
  → /refinep command
  → Output: refined-prompt.md + chat summary

OPERATION: Decompose a large task into atomic steps
  → Stage 5 (fresh chat)
  → Output: orchestration directory with state.json + README + prompt files

OPERATION: Pre-write domain knowledge for sub-agents
  → Stage 6 (fresh chat)
  → Output: context/ directory files

OPERATION: Execute one atomic task
  → Stage 7 single session (mandatory fresh chat)
  → Output: task artifact + updated state.json

OPERATION: Parallelize independent work within one session
  → Sub-agent spawning (within a PARALLEL-designated prompt)
  → Output: aggregated result from all sub-agents

OPERATION: Check whether I should continue or stop
  → Read state.json → check pendingSteps
  → pendingSteps empty → build complete
  → My step ID not in pendingSteps → do not execute
```

---

## APPROACH SELECTION FOR CONTEXT FILES

```
I need to provide domain knowledge to a sub-agent. Should I:

(A) Embed in the prompt?
  → YES if: used only once, short enough not to bloat the prompt, task-specific

(B) Create a context file?
  → YES if ANY of these are true:
    - Too large to embed repeatedly
    - Referenced by multiple sub-agents
    - Immutable during implementation (canonical values)
    - Domain-specific enough Claude would infer/hallucinate it

(C) Redundantly embed in BOTH?
  → YES if: the value is so critical that a wrong value invalidates the entire output
    Example: CSS section ordering, canonical data IDs, exact color hex codes

Decision: If in doubt → context file. The cost of creating an unnecessary context file
(a few KB of disk space) is negligible. The cost of a hallucinated value propagating
through 30 sessions of output is high.
```

---

## SESSION STRATEGY SELECTION

```
I'm about to begin work. Fresh chat or continue chaining?

Is this a Stage 7 execution session?
  → YES → FRESH CHAT (mandatory, no exceptions)

Is this a sub-agent?
  → YES → FRESH CHAT (by definition)

Is this Stage 5 (orchestration decomposition)?
  → YES → FRESH CHAT (strongly recommended)

Is this Stage 6 (context file writing)?
  → YES → FRESH CHAT (recommended)

Is the current context window heavily loaded from prior unrelated work?
  → YES → FRESH CHAT

Is this a continuation of the same /refinep session?
  → YES → CHAIN (all 6 phases run contiguously in one session)

Is this a quick /prompt optimization?
  → YES → CHAIN (stateless, fits comfortably in any session)

DEFAULT BIAS: When uncertain → FRESH CHAT. The cost of starting fresh is a few seconds.
The cost of context contamination across sessions is execution errors that require re-running sessions.
```

---

## INPUT VARIABLES TO ALL DECISIONS

Every approach selection decision is a function of these variables:

| Variable | Values | How It Affects Selection |
|---|---|---|
| Task complexity | simple / complex / large | Simple → /prompt only; Complex → /refinep; Large → decompose |
| Number of verifiable units | 1 / 2–5 / 6+ | 1 → direct; 2–5 → consider decompose; 6+ → always decompose |
| Token risk | <10K / 10–25K / 25–32K / >32K | <25K → direct; 25–32K → warning; >32K → must split |
| Domain knowledge required | none / light / heavy | Heavy → context files required |
| Session contamination risk | low / high | High → fresh chat |
| Quality requirement | exploratory / production | Exploratory → /prompt; Production → /refinep |
| Prior session context relevance | additive / noise | Additive → chain; Noise → fresh chat |
