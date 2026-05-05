# System Map — Claude Code Methodology Brain Dump
**Source:** `claude-code-methodology.md`
**Date:** 2026-03-26
**Step:** 00 — Inventory Pass

---

## INVENTORY LEGEND

| Layer | Meaning |
|---|---|
| **meta-meta** | System's self-referential logic — governing rules, self-knowledge, recursive constraints |
| **meta** | Purpose architecture — component roles, inter-component dependencies, system contracts |
| **macro** | Outcome categories — cross-file workflows, major user-facing deliverables |
| **micro** | Discrete operations — what each file owns, exact operations performed |
| **micro-micro** | All parameters, variables, naming conventions, decision conditions, edge cases |

---

## SECTION 1: COMMANDS

### ITEM-01: `/prompt` Command
- **Identifier:** `/prompt`
- **Layer:** meta
- **Explicit Content:** Takes raw prompt as input via `$ARGUMENTS`. Analyzes explicit intent (what user asked) AND implicit intent (what user actually needs). Applies 8 transformation rules. Returns single markdown code block with optimized prompt. No surrounding commentary.
- **Implicit Dependencies:** User must provide at least implicit intent. No state files required — stateless.
- **Parameters Controlled:**
  - Input: `$ARGUMENTS` placeholder (raw prompt text)
  - Output: single markdown code block; no text outside block
  - 8 rules: Lead with Outcome, Specify Scope, Name Constraints, Break Compound Tasks, Anticipate Edge Cases, Use Claude Code Conventions, Avoid Vagueness, State Output Format
- **Relationships:** Entry point of pipeline. Output feeds `/refinep`. For simple tasks, output used directly.

### ITEM-02: `/refinep` Command
- **Identifier:** `/refinep`
- **Layer:** meta
- **Explicit Content:** 6-phase systematic refinement pipeline. Phases: (1) Input Capture → (2) Diagnostic Analysis 25 criteria → (3) Domain Research mandatory → (4) Technique Application 25 techniques → (5) Self-Verification 15 items → (6) Structured Output to file. Writes `refined-prompt.md` to workspace root. Displays summary in chat after writing.
- **Implicit Dependencies:** Requires RAW_PROMPT (from $ARGUMENTS, file path, or AskUserQuestion). Requires web search capability for Phase 3. Requires file write capability for Phase 6.
- **Parameters Controlled:**
  - Phase 1: `$ARGUMENTS` → `RAW_PROMPT`; AskUserQuestion if empty (two options: type directly or provide file path)
  - Phase 2: 25 diagnostic items across 7 categories; scoring: Adequate / Partial / Not at all; every Partial/Not at all flagged for Phase 4
  - Phase 3: 2–3 web searches; current year in queries; results NOT shown to user; integrated directly into Phase 4
  - Phase 4: 25 techniques in 7 categories (A→G); applied in category order; judgment applied on which add value
  - Phase 5: 15-item checklist; revision loop if any fail; does not proceed until all pass
  - Phase 6: Writes `refined-prompt.md`; displays file location, diagnostic improvement count (X/25), techniques applied count, domain research summary
- **Relationships:** Secondary command in pipeline. Consumes output of `/prompt`. Produces `refined-prompt.md`. For complex tasks, `refined-prompt.md` feeds Stage 5 (Orchestration Decomposition).

---

## SECTION 2: FILES

### ITEM-03: `refined-prompt.md`
- **Identifier:** `refined-prompt.md` (workspace root)
- **Layer:** macro
- **Explicit Content:** Output artifact of `/refinep`. Structure:
  - Header block (optimization note)
  - `## The Prompt` — full refined prompt, copy-paste ready, immediately executable
  - `## Refinement Report`
    - `### Original Prompt` — RAW_PROMPT quoted in full
    - `### Diagnostic Results` — table: Item | Original Status | How Addressed
    - `### Techniques Applied` — table: # | Technique | How Applied | Category
    - `### Domain Research Conducted` — summary of topics and key findings integrated
- **Implicit Dependencies:** Written by `/refinep` Phase 6. Read by user before execution. May feed meta-prompt decomposition.
- **Parameters Controlled:** Full prompt structure, Refinement Report format, all technique documentation
- **Relationships:** Output of `/refinep`. Input to meta-prompt decomposition (Stage 5). End artifact for simple/medium tasks.

### ITEM-04: `meta-prompt.md`
- **Identifier:** `meta-prompt.md`
- **Layer:** meta
- **Explicit Content:** Defines orchestration strategy. Contains: decomposition rationale (30–45 micro-prompts), fresh chat execution model ("fresh chats with cleared contacts window"), 32K token hard limit stated as never-breaks, state.json initialization rules, sub-agent spawning criteria, parallel vs sequential logic, README Sub-Agent Strategy column.
- **Implicit Dependencies:** Produced by user prior to Stage 5. Informs decomposition decisions. References refined-prompt.md as input.
- **Parameters Controlled:** Number of micro-prompts target range (30–45), token limit (32,000), session isolation model, sub-agent criteria (parallelization / context isolation / specialization), README column definitions
- **Relationships:** Source artifact governing Stage 5 behavior. Informs state.json schema design. Provides "be obsessive" decomposition bias.

### ITEM-05: `all-prompt.md`
- **Identifier:** `all-prompt.md`
- **Layer:** meta
- **Explicit Content:** Source artifact. Listed as one of seven source files used to reconstruct the methodology. Content not described in detail — role inferred as consolidated prompt archive.
- **Implicit Dependencies:** Listed alongside other source artifacts.
- **Parameters Controlled:** [Insufficient data — not described in detail in source]
- **Relationships:** Source artifact for methodology reconstruction.

### ITEM-06: `design_decisions.md`
- **Identifier:** `design_decisions.md`
- **Layer:** micro
- **Explicit Content:** Ideation/specification document. Contains complete decisions with exact values: color codes, pixel values, data counts. No hedging language ("should", "consider", "maybe"). No design questions. Represents "pre-execution specification at the threshold of implementation."
- **Implicit Dependencies:** Produced entirely before prompt formulation begins. All major decisions resolved before writing begins. Not exploratory — output of prior thinking, not the process of thinking.
- **Parameters Controlled:** Architecture choices, data structures, UX flows, constraints, design values, exact color codes, pixel values, data counts
- **Relationships:** Stage 1 output. Input to Stage 2 (Initial Prompt Formulation). Equivalent to formal implementation-ready requirements document.

### ITEM-07: `state.json`
- **Identifier:** `state.json` (workspace root or build directory)
- **Layer:** micro
- **Explicit Content:** JSON file tracking execution state across isolated sessions.
  ```json
  {
    "version": "1.0.0",
    "buildTarget": "path/to/output/directory/",
    "completedSteps": [],
    "pendingSteps": ["step-01-id", "step-02-id", "...all step IDs"],
    "artifacts": { "itemCount": 0, "filesWritten": [] },
    "dataChunks": { "category1": {}, "category2": {} },
    "flags": { "flagName1": false, "flagName2": false }
  }
  ```
- **Implicit Dependencies:** Created by initialization prompt (first in execution order). Must be fully populated at creation — pendingSteps must contain ALL step IDs from start. Never extended mid-execution.
- **Parameters Controlled:**
  - `version`: schema version string (enables migration)
  - `buildTarget`: prevents hardcoding output path in each prompt
  - `completedSteps`: append-only; never shrinks; grows with each completed step
  - `pendingSteps`: ordered; fully populated at init; items removed on completion
  - `artifacts.itemCount`: integer; incremented by data batch prompts
  - `artifacts.filesWritten`: array of file paths; appended by each prompt
  - `dataChunks`: tracks which data entries written per category
  - `flags`: boolean toggles; prerequisites check these before executing
- **Relationships:** Shared by all sessions via filesystem. Read at start of every session. Written at end of every session. Guards against duplicate execution (step not in pendingSteps → do not execute).

### ITEM-08: `README.md` (Orchestration Directory)
- **Identifier:** `[orchestration-dir]/README.md`
- **Layer:** micro
- **Explicit Content:** Index table with required columns:
  - Prompt # | File | Purpose | Prerequisites | Est. Token Output | Sub-Agent Strategy
  - Sub-Agent Strategy values: SOLO or PARALLEL
- **Implicit Dependencies:** Created during Stage 5 alongside prompt files. Must match pendingSteps order. Step IDs must be consistent with state.json.
- **Parameters Controlled:** Execution order, sub-agent strategy per prompt, prerequisite chain documentation, token output estimates per prompt
- **Relationships:** Created alongside prompt files in Stage 5. Used by user to navigate execution. Sub-Agent Strategy column is authoritative for parallelization decisions.

---

## SECTION 3: DIRECTORIES

### ITEM-09: `context/` Directory
- **Identifier:** `context/`
- **Layer:** meta
- **Explicit Content:** Pre-written domain reference files. Loaded by sub-agents before executing assigned tasks. Naming convention: `[domain-prefix]-[descriptor].[type]`. All files designated immutable during implementation phase. Critical information redundantly present across files (insurance for isolated access).
- **Implicit Dependencies:** Created in Stage 6 before sequential execution begins. Every file written before any sub-agent runs. Sub-agents must explicitly reference files by name to load them — not automatically available.
- **Parameters Controlled:**
  - Domain prefixes: `app-`, `build-`, `data-`, `ui-`, `pwa-`
  - Descriptor types: `-architecture`, `-manifest`, `-inventory`, `-design-system`, `-technical`, `.css`
  - Scope: global by default (applies to all sub-agents)
  - Immutability constraint: changes require re-evaluation of all dependent components
- **Relationships:** All context files feed sub-agents. Forms directed dependency graph (data files upstream, build files downstream).

### ITEM-10: `connect-da-dots/` (Orchestration Directory)
- **Identifier:** `connect-da-dots/` (example; project-specific name)
- **Layer:** macro
- **Explicit Content:** Contains state.json, prompt-01.md through prompt-NN.md, README.md. Houses all orchestration artifacts for a multi-phase build.
- **Implicit Dependencies:** Created during Stage 5. Requires refined-prompt.md as input. Named by user per project.
- **Parameters Controlled:** Directory name (project-specific), number of prompt files, zero-padded two-digit file numbering
- **Relationships:** Output of Stage 5. Input consumed during Stage 7 (Sequential Execution).

---

## SECTION 4: CONTEXT FILES

### ITEM-11: `design-tokens.css`
- **Identifier:** `context/design-tokens.css`
- **Layer:** micro-micro
- **Explicit Content:** Single `:root {}` block with CSS custom properties. Encodes exact color hex codes, spacing values, easing curves. Ready for direct inclusion into implementation files.
- **Failure Mode Prevented:** Color inconsistency, incorrect spacing, wrong easing curves
- **Relationships:** Upstream in context dependency graph. Referenced by multiple sub-agents.

### ITEM-12: `data-inventory.md`
- **Identifier:** `context/data-inventory.md`
- **Layer:** micro-micro
- **Explicit Content:** Complete enumeration catalog with canonical IDs. All data entries with exact names and identifiers. No gaps or partial entries.
- **Failure Mode Prevented:** Missing entries, incorrect IDs, partial data sets
- **Relationships:** Upstream in context dependency graph. Foundation for data batch prompts.

### ITEM-13: `app-architecture.md`
- **Identifier:** `context/app-architecture.md`
- **Layer:** micro-micro
- **Explicit Content:** Navigation state machine definitions, structural specifications, JavaScript pseudocode for architecture patterns. Semantics of all state fields defined explicitly.
- **Failure Mode Prevented:** Navigation model divergence, state machine field misinterpretation
- **Relationships:** Consumes data from data-inventory.md and design-tokens.css. Consumed by ui-design-system.md.

### ITEM-14: `ui-design-system.md`
- **Identifier:** `context/ui-design-system.md`
- **Layer:** micro-micro
- **Explicit Content:** Component specifications with DOM structure and CSS patterns. Touch target sizes. Component library definitions.
- **Failure Mode Prevented:** Component structure inconsistency, wrong touch target sizes
- **Relationships:** Downstream from app-architecture.md. Consumed by build-manifest.md.

### ITEM-15: `pwa-technical.md`
- **Identifier:** `context/pwa-technical.md`
- **Layer:** micro-micro
- **Explicit Content:** PWA infrastructure references. Service worker lifecycle patterns. Manifest installability requirements.
- **Failure Mode Prevented:** Service worker lifecycle errors, manifest installability failures
- **Relationships:** Downstream from app-architecture.md and ui-design-system.md.

### ITEM-16: `build-manifest.md`
- **Identifier:** `context/build-manifest.md`
- **Layer:** micro-micro
- **Explicit Content:** Assembly checklist with ordered build instructions. HTML, CSS, JS examples ready for copy-paste. CSS section ordering (11 sections — exact order is required). JS initialization sequence.
- **Failure Mode Prevented:** CSS ordering errors, wrong JS initialization sequence
- **Relationships:** Downstream — consumes all other context files. Most downstream file in context dependency graph.

---

## SECTION 5: PIPELINE STAGES

### ITEM-17: Stage 1 — Ideation and Specification Lock
- **Layer:** macro
- **Explicit Content:** Produces informal specification document (design_decisions.md equivalent). All design decisions locked. Exact values present. No hedging language. Complete enough for a developer to implement without clarifying questions. This stage is the OUTPUT of prior thinking — not the process of thinking.
- **Transition Condition:** All design decisions locked; specification complete.
- **Implicit:** Stage begins only after all exploration/ideation is done. Not an exploratory stage.

### ITEM-18: Stage 2 — Initial Prompt Formulation
- **Layer:** macro
- **Explicit Content:** Translates Stage 1 specification into a raw prompt. May contain vague verbs, implicit scope, missing constraints, no output specification. Quality deliberately not required.
- **Transition Condition:** A prompt exists expressing the task.

### ITEM-19: Stage 3 — `/prompt` Application
- **Layer:** macro
- **Explicit Content:** Apply `/prompt` command to raw prompt. Produces single optimized prompt in markdown code block.
- **Transition Condition:** Prompt is precise, scoped, constrained, sequenced, has declared output format, immediately executable without clarification loop.
- **Decision Gate:** Appropriate for quick optimization. For production-grade, Stage 4 follows immediately.

### ITEM-20: Stage 4 — `/refinep` Application
- **Layer:** macro
- **Explicit Content:** Apply `/refinep` command. Produces `refined-prompt.md` with full Refinement Report.
- **Transition Condition:** `refined-prompt.md` passes all 15 Phase 5 self-verification items.

### ITEM-21: Stage 5 — Orchestration Decomposition
- **Layer:** macro
- **Explicit Content:** Decompose into 30–45 atomic micro-prompts. Initialize state.json with ALL step IDs fully populated. Write README.md index. Write all prompt-NN.md files.
- **Transition Condition:** pendingSteps fully populated with all step IDs. Every prompt follows canonical schema. No forward-reference prerequisites.
- **Trigger:** EITHER complex task with multiple discrete verifiable units OR task risking >32K tokens in single response.

### ITEM-22: Stage 6 — Context File Preparation
- **Layer:** macro
- **Explicit Content:** Write all context files to context/ directory before execution begins. Pre-write all domain knowledge that sub-agents would otherwise need to infer.
- **Transition Condition:** Every piece of domain knowledge that sub-agent would guess/hallucinate has been pre-written and is accessible as a named file.

### ITEM-23: Stage 7 — Sequential Execution
- **Layer:** macro
- **Explicit Content:** Each micro-prompt executes in fresh Claude session. Protocol per session: read state.json → confirm step ID in pendingSteps → execute one task → run Verification section → update state.json → exit.
- **Transition Condition per step:** Verification checks pass. State update completes successfully.
- **Parallel sub-agents:** Only within a single session, only for prompts designated PARALLEL in README.

### ITEM-24: Stage 8 — Completion Verification
- **Layer:** macro
- **Explicit Content:** When pendingSteps is empty AND completedSteps contains all step IDs → build complete. Final chat report enumerates all created artifacts and confirms data integrity counts.

---

## SECTION 6: SUB-PROMPT SCHEMA

### ITEM-25: Canonical Sub-Prompt Schema (5 Required Sections)
- **Layer:** micro-micro
- **Explicit Content:** Required sections in order:
  1. `## Prerequisites` — list state.json flags that must be true AND files that must exist; if none, state "none" explicitly
  2. `## Hard Constraints` — five constraints verbatim (no paraphrasing, no exceptions)
  3. `## Task` — single unambiguous instruction, one action, imperative form, no compound verbs, no implicit scope
  4. `## Verification` — measurable checks that must pass before state.json update
  5. `## State Update` — exact state.json mutations: completedSteps append, pendingSteps remove, flags set, artifact counts increment
- **Relationships:** Template for every sub-prompt file in orchestration directory.

### ITEM-26: Five Hard Constraints (Verbatim)
- **Layer:** meta-meta
- **Explicit Content (verbatim as required):**
  1. "32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes."
  2. "No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments."
  3. "State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting."
  4. "No external dependencies — No CDN, no npm, no external URLs in any generated file."
  5. "File writes only via Write tool — Never use bash heredoc or shell redirection to write application files."
- **Critical Rule:** Verbatim inclusion in every sub-prompt. No paraphrasing. No exceptions.

---

## SECTION 7: TECHNIQUE LIBRARY (25 TECHNIQUES)

### ITEM-27: `/refinep` Master Technique Library
- **Layer:** meta
- **Application Order:** A → B → C → D → E → F → G (mandatory category order)
- **Judgment Rule:** Not every technique applied to every prompt; command exercises judgment on which add value

**Category A — Structural (4 techniques):**
- **A1:** XML Tag Sectioning — canonical tags: `<role>`, `<context>`, `<research_directives>`, `<requirements>`, `<constraints>`, `<thinking_process>`, `<output_format>`, `<success_criteria>`, `<examples>`, `<tone>`
- **A2:** Data-First Ordering — context position 1, instructions position 2, deliverable specification position 3
- **A3:** Hierarchical Nesting — parent tags grouping related items (e.g., `<core_features>`, `<optional_features>`, `<excluded_features>` within `<requirements>`)
- **A4:** Progressive Disclosure — high-level goal → key context/constraints → detailed specifications → edge cases

**Category B — Role & Identity (3 techniques):**
- **B1:** Role Assignment — template: "You are a [ROLE TITLE] specializing in [DOMAIN 1] and [DOMAIN 2]. You combine [SKILL 1] with [SKILL 2] and approach problems through [METHODOLOGY]. Your goal is to [PRIMARY OBJECTIVE]."
- **B2:** Expertise Scoping — adds: "You are an expert in X, Y, Z. If asked about topics outside [DOMAIN], acknowledge the boundary rather than speculating."
- **B3:** Audience Awareness — defines intended reader's technical level, role, and use case

**Category C — Reasoning & Thinking (3 techniques):**
- **C1:** Chain-of-Thought Phasing — patterns: Research→Analyze→Synthesize→Articulate; Understand→Plan→Execute→Verify
- **C2:** Self-Verification Directives — template: "Before finalizing, verify that every [REQUIREMENT] is addressed. Cross-check your output against the success criteria. If you find gaps, revise before presenting the final output."
- **C3:** Thinking Process Definition — template: "Consider multiple approaches before committing to one. Weigh trade-offs explicitly when making design decisions. If information is insufficient, flag it rather than assuming."

**Category D — Clarity & Precision (6 techniques):**
- **D1:** Ambiguity Elimination — converts: "good" → specific criteria list; "fast" → "responds within X seconds"; "user-friendly" → "requires no technical knowledge; all actions achievable in ≤3 clicks"
- **D2:** Active Directives — converts: "It would be great if..." → "Include [X]."; "Something like..." → "Specifically, [X] with [Y] characteristics."
- **D3:** Specificity Gradients — labels: MUST (non-negotiable) / SHOULD (strong preference) / MAY (optional enhancement)
- **D4:** Constraint Boundaries — template: "This IS a [type]. This is NOT a [excluded type]."
- **D5:** Negative Constraints — template: "Do NOT [common mistake].", "Avoid [anti-pattern].", "Never [failure mode]."
- **D6:** Spelling/Grammar Correction — applies correct domain terminology from Phase 3 research

**Category E — Context & Research (3 techniques):**
- **E1:** Domain Research Integration — weaves Phase 3 research as specific directives, named frameworks, correct terminology
- **E2:** Few-Shot Examples — 1–3 examples in `<examples>` tags covering simple case, complex case, edge case
- **E3:** Reference Anchoring — converts vague framework references to explicit citations with application instructions

**Category F — Output Control (3 techniques):**
- **F1:** Output Format Specification — declares: section headings and order, content expectations per section, length guidance, format (prose vs bullets vs tables)
- **F2:** Success Criteria — 5–10 testable assertions: "A [TARGET_READER] reading this should be able to [SPECIFIC_ACTION]"
- **F3:** Tone/Voice Calibration — specifies register (formal/conversational/technical/persuasive), perspective (first/third/imperative), density (concise/thorough/exhaustive)

**Category G — Meta-Techniques (3 techniques):**
- **G1:** Permission to Expand — template: "Identify elements I haven't mentioned but that logically belong in this [OUTPUT_TYPE]. If you discover important considerations during research, include them."
- **G2:** Uncertainty Allowance — template: "If information is insufficient to make a definitive recommendation, note the uncertainty and provide conditional guidance. Mark assumptions explicitly so they can be validated."
- **G3:** Task Decomposition — template: "First, [SUB_TASK_1] and produce [INTERMEDIATE_OUTPUT_1]. Using [INTERMEDIATE_OUTPUT_1], then [SUB_TASK_2]. Finally, synthesize into [FINAL_DELIVERABLE]."

---

## SECTION 8: DIAGNOSTIC FRAMEWORK (25 ITEMS)

### ITEM-28: `/refinep` Phase 2 Diagnostic
- **Layer:** meta
- **Scoring:** Adequate / Partial / Not at all; every Partial or Not at all flagged for correction in Phase 4

**Structural Quality (4):** XML/Section Structure, Data-First Ordering, Hierarchical Nesting, Progressive Disclosure

**Role & Identity (3):** Role Assignment, Expertise Scoping, Audience Awareness

**Reasoning & Thinking (3):** Chain-of-Thought Phasing, Self-Verification Directives, Thinking Process Definition

**Clarity & Precision (6):** Ambiguity Elimination, Active Directives, Specificity Gradients, Constraint Boundaries, Negative Constraints, Spelling/Grammar

**Context & Research (3):** Domain Context Sufficiency, Few-Shot Examples, Reference Anchoring

**Output Control (3):** Output Format Specification, Success Criteria, Tone/Voice Calibration

**Meta-Techniques (3):** Permission to Expand, Uncertainty Allowance, Task Decomposition

---

## SECTION 9: GOVERNING AXIOMS

### ITEM-29: Three First Principles
- **Layer:** meta-meta
1. **Complexity requires decomposition** — trigger: large complex task → decompose always
2. **Token limits are architectural constraints** — 32K hard limit; never breaks; never relaxes
3. **Sequential isolation improves accuracy** — fresh chats; prior conversation context = noise; all context loaded explicitly from files

### ITEM-30: Core Design Beliefs
- **Layer:** meta-meta
- Precision eliminates ambiguity as precondition to execution (not Claude's inference capability)
- Vague language is information destruction (generic verbs lose the specificity needed for execution)
- Scope absence = implicit permission for overreach (undefined scope = unlimited scope)
- Context must precede instructions (data-first ordering; up to 30% comprehension improvement per Anthropic testing)
- Negative constraints carry equal weight as positive instructions (dedicated `<constraints>` section at same structural level as `<requirements>`)

---

## SECTION 10: QA LOOP

### ITEM-31: Three-Level QA System
- **Layer:** meta

**Level 1 — Pre-execution gate:** `/refinep` Phase 5 self-verification (15 items). Command will not write `refined-prompt.md` until all 15 pass. Revision loop until all pass.

**Level 2 — Pre-submission gate:** Sub-prompt schema verification (5 required sections present). Missing section = fails success criteria.

**Level 3 — Post-execution gate:** Verification section measurable checks pass → state.json updated. If verification fails → state unchanged → step can be retried without duplication.

### ITEM-32: 15-Item Self-Verification Checklist
- **Layer:** micro-micro
```
[ ] Clear <role> with bounded expertise
[ ] XML tags separate distinct concerns
[ ] Context/background appears before instructions (data-first ordering)
[ ] Deliverable specification at end
[ ] All ambiguous phrases replaced with specific language
[ ] All passive/wishful language converted to active directives
[ ] Domain research findings woven naturally
[ ] Explicit success criteria (minimum 5 conditions)
[ ] Defined output format with named sections
[ ] Chain-of-thought phases defined (if multi-step)
[ ] Constraint boundaries clearly state IS and IS NOT
[ ] Negative constraints address common failure modes
[ ] Prompt is self-contained — Claude can execute without additional context
[ ] Spelling, grammar, terminology correct throughout
[ ] Minimum structure needed — no unnecessary complexity
```

---

## SECTION 11: CONSTRAINT TAXONOMY

### ITEM-33: Six Constraint Types
- **Layer:** meta-meta
1. **Technical hard limits** — 32K token output; Write tool only; no external URLs. No exceptions.
2. **Data completeness mandates** — no truncation; write ALL entries; no `// ... more`.
3. **Scope boundaries** — IS/IS NOT framing. Prevents scope creep and exclusion gaps.
4. **Process sequencing constraints** — do not begin Phase 2 until Phase 1 complete. Prevents phase-skipping.
5. **Prerequisite forward-reference prohibition** — never reference a file created by a later step. Enforces DAG acyclicity.
6. **Failure mode prohibitions** — cardinal failure mode named explicitly. Named = elevated above general caution list.

### ITEM-34: IS / IS NOT Framing Pattern
- **Layer:** micro-micro
```
This IS:
- [Affirmative statements of what the output is and does]

This is NOT:
- [Explicit exclusions: types of content, actions, scope out of bounds]

Do NOT:
- [Specific prohibited actions targeting known failure modes]
```
Three-part structure covers distinct failure modes: "This is NOT" → prevents scope creep; "Do NOT" → prevents execution errors.

---

## SECTION 12: VOCABULARY/TERMS OF ART

### ITEM-35: Domain Vocabulary
- **Layer:** meta-meta

| Term | Definition |
|---|---|
| **Atomic** | Single, bounded, verifiable unit of work. Binary completion state. Cannot be subdivided without losing verifiability. |
| **Self-contained** | Executable in fresh session with no prior conversation context. All necessary context explicitly embedded. |
| **Source of truth** | Designated authoritative reference. When conflict exists, source of truth takes precedence. |
| **Cardinal failure mode** | Single most consequential error pattern. Named explicitly. Architecturally disqualifying — not merely inconvenient. |
| **Verbatim** | Exactly as written. No paraphrasing, reordering, or omission. Preserves constraint force. |
| **Hard constraint** | Rule with no exceptions. Maps to MUST in MUST/SHOULD/MAY gradient. |
| **Zero information loss** | All source content present. No summarization, no selection, no compression that loses content. |
| **Fidelity** | Accuracy of reproduction relative to source. 100% fidelity = no interpretation/paraphrase/omission. |
| **No truncation** | Never abbreviate data sets. Never write `// ... more` or `/* see spec */`. |

### ITEM-36: MUST / SHOULD / MAY Gradient
- **Layer:** meta-meta
- **MUST** — non-negotiable; failure to include is disqualifying error
- **SHOULD** — strong preference; deviation requires explicit justification
- **MAY** — optional enhancement; include only if adds value without complexity cost
- **Purpose:** Communicates precisely which requirements are load-bearing vs aspirational. Without this, Claude guesses — and the guess may be wrong.

---

## SECTION 13: FAILURE MODES

### ITEM-37: Six Named Failure Modes (Correction Protocol)
- **Layer:** micro-micro

| # | Name | Symptom | Diagnosis | Correction |
|---|---|---|---|---|
| 1 | Compound atomic tasks | Output truncated or partially correct | Task section has >1 verifiable unit | Split into one prompt per unit |
| 2 | Implicit prerequisites | Session fails — references nonexistent file/flag | Prerequisites section empty or wrong | Trace each resource to creating step; add that step's flag as prerequisite |
| 3 | Paraphrased hard constraints | Sub-agents treat constraints as suggestions | Hard Constraints section uses paraphrased/summarized versions | Replace with verbatim text word-for-word |
| 4 | Missing output format spec | Files in wrong directory; wrong sections; inconsistent format | Prompt specifies WHAT but not WHERE/FORMAT | Add exact file path, required sections in order, naming convention, chat report format |
| 5 | State not updated | Next session repeats same step; wrong completion count | State Update section skipped or not executed | Treat state update as mandatory final step; never conditional except on Verification passing |
| 6 | Context not loaded | Incorrect values, inconsistent naming, missing data | Prompt doesn't explicitly reference context files | Every sub-agent instruction must explicitly name which context files to read, with instruction to read before beginning work |

---

## SECTION 14: SCALABILITY PARAMETERS

### ITEM-38: Scale Tiers
- **Layer:** macro

| Scale | Prompt Count | State File | Context Files | Parallel Sub-agents |
|---|---|---|---|---|
| Small | 1–5 | Not needed | Not needed | No |
| Medium | 10–30 | Minimal schema | 2–3 files | Selective |
| Large | 30–45+ | Full schema with dataChunks + flags | 5–6 files | PARALLEL-designated prompts |

**Constants across all scales:**
1. Atomicity principle (one verifiable unit per prompt)
2. Self-containment requirement (fresh session, no prior context)
3. Verbatim hard constraint inclusion (five constraints every sub-prompt)

**Variables with scale:** context file granularity, state file schema complexity, parallel sub-agent use

---

## CONTEXT DEPENDENCY GRAPH

```
data-inventory.md + design-tokens.css          (upstream — data layer)
  ↓
app-architecture.md + ui-design-system.md      (mid — structure layer)
  ↓
pwa-technical.md + build-manifest.md           (downstream — build layer)
  ↓
implementation
```

---

## FULL PIPELINE DEPENDENCY GRAPH

```
[design_decisions.md]                                      Stage 1: Ideation Lock
  ↓
[Raw Prompt]                                   Stage 2: Initial Formulation
  ↓ /prompt
[Optimized Prompt]                             Stage 3: /prompt Application
  ↓ /refinep
[refined-prompt.md]                            Stage 4: /refinep Application
  ↓ meta-prompt.md strategy
[orchestration-dir/]                           Stage 5: Orchestration Decomposition
  ├── state.json (all pendingSteps populated)
  ├── README.md (execution index + Sub-Agent Strategy)
  └── prompt-01.md ... prompt-NN.md
      ↓ (context files written first)
[context/]                                     Stage 6: Context Preparation
  ├── design-tokens.css
  ├── data-inventory.md
  ├── app-architecture.md
  ├── ui-design-system.md
  ├── pwa-technical.md
  └── build-manifest.md
      ↓ (each in fresh session)
[Sequential Execution Loop]                    Stage 7: Execution
  read state.json → confirm step in pendingSteps
  → execute one atomic task
  → run Verification section
  → update state.json
  → exit
      ↓
[completedSteps = all pendingSteps]            Stage 8: Completion
  → final chat report
  → data integrity counts
  → DONE
```

---

*Inventory complete. All 38 items catalogued across five layers. Gate condition met. Proceed to Step 01.*
