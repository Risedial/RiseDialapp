# Outcome Registry
**Source:** `00-inventory/system-map.md`
**Date:** 2026-03-26
**Step:** 01 — Outcome Decomposition

---

## REGISTRY FORMAT

Each outcome is classified, layered across all five extraction levels, dependency-mapped, and flagged for session strategy.

---

## OUTCOME-01: Single Optimized Prompt

**Classification:** deliverable
**Description:** A raw prompt transformed into a precise, scoped, constrained, executable prompt via the 8-rule optimization process.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Belief: precision is a property of the prompt artifact, not Claude's inference capability. Vague language = information destruction. |
| **meta** | `/prompt` command is the mechanism. Analyzes explicit AND implicit intent before applying 8 rules. Output is single code block — no commentary. |
| **macro** | Workflow: user provides raw prompt → command applies 8 rules → returns one optimized prompt → user executes or pipes to `/refinep` |
| **micro** | 8 rules applied in sequence: (1) Lead with Outcome, (2) Specify Scope, (3) Name Constraints, (4) Break Compound Tasks, (5) Anticipate Edge Cases, (6) Use Claude Code Conventions, (7) Avoid Vagueness, (8) State Output Format |
| **micro-micro** | Rule triggers: compound verbs → numbered steps; "improve/fix/update" → observable actions; implicit scope → explicit file list; missing output spec → exact path + format + structure |

### Dependencies
- Input: raw prompt (any quality level)
- Tools: none (stateless)
- Implicit dependency: user must have at least implicit intent

### Fresh Chat vs Chain
**CHAIN** — stateless; no context accumulation required; fast transformation

---

## OUTCOME-02: Production-Grade Refined Prompt

**Classification:** deliverable
**Description:** A fully engineered prompt in `refined-prompt.md` that passes all 15 Phase 5 verification items, with complete Refinement Report.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | A "perfectly engineered" prompt is defined by 11 observable, testable conditions. Self-verification is a release condition, not an audit. |
| **meta** | `/refinep` command executes 6-phase pipeline. Domain research is mandatory regardless of user request. Output file is `refined-prompt.md`. Displays summary in chat. |
| **macro** | Workflow: RAW_PROMPT → 25-item diagnostic → web research → 25-technique application → 15-item self-verification → file write + chat summary |
| **micro** | Phase 2 scores 25 diagnostic items Adequate/Partial/Not at all. Phase 4 applies applicable techniques from categories A→G in order. Phase 5 iterates until all 15 items pass. |
| **micro-micro** | Technique selection logic: judgment-based — only techniques that add value applied; simple prompt may use 3–4 sections; complex prompt may use 8+. Revision loop in Phase 5: fail any item → revise → re-verify → repeat. |

### Dependencies
- Input: RAW_PROMPT (from `$ARGUMENTS`, file path, or AskUserQuestion)
- Upstream: OUTCOME-01 (optimized prompt fed in; optional but recommended)
- Tools: web search (Phase 3), file write (Phase 6)
- Implicit: web search capability must be available

### Fresh Chat vs Chain
**CHAIN** for straightforward prompts — the refinement is self-contained.
**FRESH CHAT recommended** for complex, domain-heavy tasks where Phase 3 web research is extensive — reduces context contamination.

---

## OUTCOME-03: Fully Decomposed Orchestration Package

**Classification:** deliverable
**Description:** Complete orchestration directory containing state.json (all pendingSteps populated), prompt-01.md through prompt-NN.md (atomic sub-prompts), and README.md index.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Cardinal failure mode: combining two atomic tasks into one prompt. Atomicity principle is non-negotiable. "Be obsessive" about decomposition — over-split preferred to under-split. |
| **meta** | meta-prompt.md strategy governs decomposition. 30–45 target range for medium-large projects. state.json must be fully populated at initialization — never extended mid-execution. |
| **macro** | Workflow: refined-prompt.md → catalog all discrete verifiable units → group into data batches (≤20 entries each) → write state.json → write README.md → write prompt-NN.md files |
| **micro** | File naming: `prompt-NN.md` (zero-padded two-digit). Titles: `# Prompt [NN]: [Action Title in imperative form]`. Data batch naming: use category names, not batch numbers. Each prompt: 5 required sections (Prerequisites, Hard Constraints, Task, Verification, State Update). |
| **micro-micro** | State.json initialization: pendingSteps = ALL step IDs in execution order; completedSteps = []; flags all false; artifacts all zero. Hard constraints: verbatim text, no paraphrasing. Prerequisites: must trace each resource to the step that creates it. |

### Dependencies
- Input: `refined-prompt.md` (OUTCOME-02)
- Input: `meta-prompt.md` (strategy document)
- Tool: file write (multiple files)
- Implicit: full task specification must be complete before decomposition begins

### Fresh Chat vs Chain
**FRESH CHAT** — context-heavy; produces many files; decomposition strategy requires full attention; context contamination risk from prior refinement conversation

---

## OUTCOME-04: Domain Context File Set

**Classification:** system
**Description:** Pre-written domain reference files in `context/` directory that sub-agents load before executing assigned tasks.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Principle: every piece of domain knowledge sub-agents would need to infer, guess, or hallucinate must be pre-written. Context files are the architectural solution to Claude's inability to reliably reconstruct domain-specific knowledge from prompts alone. |
| **meta** | Files are immutable during implementation. Changes require re-evaluation of all dependents. Critical information redundantly present across multiple files (insurance for isolated access). |
| **macro** | Dependency graph: data files upstream → architecture files mid → build files downstream. All files written before Stage 7 begins. Sub-agents must explicitly reference files by name. |
| **micro** | Naming convention: `[domain-prefix]-[descriptor].[type]`. Domain prefixes: app-, build-, data-, ui-, pwa-. Descriptor types: -architecture, -manifest, -inventory, -design-system, -technical, .css. |
| **micro-micro** | Warrant for creating a context file vs embedding in prompt: (a) too large to embed repeatedly, (b) immutable during implementation, (c) referenced by multiple prompts, OR (d) domain-specific enough that Claude would need to infer it. |

### Dependencies
- Input: `design_decisions.md` specification (Stage 1 artifact — contains exact values)
- Must precede: Stage 7 (sequential execution)
- Tool: file write

### Fresh Chat vs Chain
**CHAIN** (if domain knowledge already in context from refinement session) OR **FRESH CHAT** (if starting fresh from specification document)

---

## OUTCOME-05: Initialized State File

**Classification:** system
**Description:** `state.json` with all step IDs pre-populated in `pendingSteps` before first execution session begins.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Initialization rule: pendingSteps MUST be fully populated at init. Empty pendingSteps = explicitly forbidden. This is architectural — not stylistic. |
| **meta** | State file is the only thread connecting isolated sessions. Conversation memory explicitly excluded from architecture. Source of truth for build progress. |
| **macro** | Created by initialization prompt (prompt-01.md, first in execution order). All subsequent sessions read this file to determine what to do and confirm their step is pending. |
| **micro** | Schema: version, buildTarget, completedSteps[], pendingSteps[all IDs], artifacts{itemCount, filesWritten[]}, dataChunks{}, flags{all false} |
| **micro-micro** | pendingSteps ordering: exact execution sequence. Step ID format: "step-NN-descriptive-name" or similar. flags: boolean toggles for setup prerequisites. dataChunks: category-keyed object. |

### Dependencies
- Input: complete list of all step IDs (from OUTCOME-03 orchestration package)
- Tool: file write
- Implicit: ALL step IDs must be known before initialization

### Fresh Chat vs Chain
**CHAIN** within OUTCOME-03 — state file initialized as part of orchestration decomposition session

---

## OUTCOME-06: Sequential Execution of One Atomic Step

**Classification:** process
**Description:** One micro-prompt executed in a fresh session, completing its single task with verification and state update.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Sequential isolation is architectural choice. Fresh chats eliminate accumulated context noise. State file is the only information passing between sessions. |
| **meta** | Protocol: read state.json → confirm step in pendingSteps → execute Task → run Verification → update state.json → exit. |
| **macro** | Each session is fully independent. Sub-agents may be spawned within a session (PARALLEL-designated prompts). State update is the final mandatory step before exit. |
| **micro** | Verification checks: measurable, binary pass/fail. State update mutations: append to completedSteps, remove from pendingSteps, set flags, increment counters, record filesWritten. |
| **micro-micro** | Guard condition: if step ID NOT in pendingSteps → do not execute (either already done or state inconsistent). Parallel sub-agents within session: only write non-overlapping state portions (separate flags, separate dataChunk keys). |

### Dependencies
- Input: specific prompt-NN.md file
- Input: state.json (must be readable at session start)
- Input: context files (those named in Prerequisites section)
- Tool: read (state.json, context files), write (output files + state.json update)

### Fresh Chat vs Chain
**MUST FRESH CHAT** — by design. This is the foundational architectural constraint of Stage 7.

---

## OUTCOME-07: Sub-Agent Instruction (Unambiguous)

**Classification:** template
**Description:** An instruction for a sub-agent that is self-contained, precisely bounded, and produces a defined output with a verification condition.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Sub-agents do not share memory with parent agent. Everything the sub-agent needs must be explicitly embedded. References to prior conversation are invisible to sub-agents. |
| **meta** | Criteria for spawning: (1) parallelization benefit, (2) context isolation benefit, (3) specialization benefit. Do NOT spawn when: simpler inline, depends on current session state, coordination overhead > parallelization benefit. |
| **macro** | Structure: (1) bounded task statement, (2) complete context, (3) explicit file access scope, (4) expected output format + path, (5) verification condition, (6) reporting instructions |
| **micro** | Read scope: only assigned context files. Write scope: only assigned output files. Task scope: ends when specified output produced — no adjacent tasks, no cleanup, no optimization. |
| **micro-micro** | Aggregation (parallel sub-agents): collect outputs, combine as specified, conflict resolution = preserve both + note discrepancy (neither silently dropped), write to specified aggregate location. |

### Dependencies
- Input: parent prompt's task definition
- Input: context files (explicitly named, explicitly loaded)
- Tool: depends on sub-task (read, write)

### Fresh Chat vs Chain
**FRESH CHAT** — sub-agents always operate in isolated context by definition

---

## OUTCOME-08: Constraint-Engineered Prompt Section

**Classification:** template
**Description:** The `<constraints>` section of a prompt, containing IS, IS NOT, and Do NOT statements addressing specific failure modes.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Constraint absence = implicit permission. Negative constraints carry equal weight as positive requirements. Dedicated `<constraints>` section at same structural level as `<requirements>`. |
| **meta** | Two constraint types: explicit (stated as prohibitions/requirements) and implicit (encoded through high specificity that forecloses alternative interpretations). |
| **macro** | Three-part IS/IS NOT/Do NOT structure. "This is NOT" prevents scope creep. "Do NOT" prevents execution errors. These address different failure modes and are not redundant. |
| **micro** | Six constraint types: technical hard limits, data completeness mandates, scope boundaries, process sequencing, prerequisite forward-reference prohibition, failure mode prohibitions. |
| **micro-micro** | Cardinal failure mode naming: elevates the most consequential error above general caution list. "Do NOT combine two atomic tasks into one prompt file — this is the cardinal failure mode." The word "cardinal" is load-bearing — not interchangeable with "important" or "critical." |

### Dependencies
- Input: domain knowledge (what failure modes are specific to this task)
- Input: Phase 3 domain research (anti-patterns for this domain)
- Produced by: `/refinep` Phase 4 techniques D4, D5

### Fresh Chat vs Chain
**CHAIN** — produced within `/refinep` execution

---

## OUTCOME-09: Complete Output Specification

**Classification:** template
**Description:** The output declaration in a prompt specifying exact file path, format, section structure, section content, naming conventions, forbidden content, chat report format, and verification checklist.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Under-specification = permission for divergence. Every element not specified is a decision Claude makes independently — and independently-made decisions may be wrong. |
| **meta** | Eight elements required: (1) file path, (2) format, (3) section structure, (4) section content, (5) naming conventions, (6) forbidden content, (7) chat report format, (8) verification checklist. |
| **macro** | Divergences from under-specification: wrong directory, omitted sections, `// ... more` abbreviations, inconsistent naming, missing chat report, state not updated. |
| **micro** | File path: exact, absolute. Section structure: ordered list of required sections with heading levels. Chat report: specific markdown structure with exact field names. |
| **micro-micro** | Forbidden content list: `// ... more`, placeholder comments, truncated data, forward-looking prerequisites, inconsistent naming. Each item in forbidden list targets a specific observed failure mode. |

### Dependencies
- Input: task specification (what files should be produced)
- Produced by: `/refinep` Phase 4 technique F1 (Output Format Specification)

### Fresh Chat vs Chain
**CHAIN** — produced within `/refinep` execution

---

## OUTCOME-10: Verified Build Completion

**Classification:** process
**Description:** State where `pendingSteps` is empty, `completedSteps` contains all step IDs, and a final chat report enumerates all created artifacts with data integrity counts.

### Five-Layer Breakdown
| Layer | Content |
|---|---|
| **meta-meta** | Completion is defined by state.json — not by Claude's assertion. pendingSteps = [] AND completedSteps = all IDs = completion. |
| **meta** | Final chat report is required output of Stage 8. Enumerates all created artifacts and confirms data integrity counts (e.g., how many entries per data category). |
| **macro** | Sequential execution loop terminates when no steps remain in pendingSteps. |
| **micro** | Final report structure: list of all files created, data integrity counts per category, confirmation that completedSteps matches expected full set. |
| **micro-micro** | Data integrity verification: compare artifact.itemCount against expected counts from data-inventory.md. Compare dataChunks keys against expected categories. |

### Dependencies
- Input: all previous stages completed
- Input: state.json (final state)
- Tool: read

### Fresh Chat vs Chain
**CHAIN** — final session of Stage 7 produces this as its output

---

## SUMMARY TABLE

| # | Outcome | Classification | Fresh Chat | Chain | Trigger Condition |
|---|---|---|---|---|---|
| 01 | Single Optimized Prompt | deliverable | — | YES | Any prompt needing optimization |
| 02 | Production-Grade Refined Prompt | deliverable | For complex | YES for simple | Any production-grade task |
| 03 | Fully Decomposed Orchestration Package | deliverable | YES | — | Complex task OR >32K token risk |
| 04 | Domain Context File Set | system | Recommended | If already loaded | Multi-session project with domain knowledge |
| 05 | Initialized State File | system | — | YES (within 03) | Any multi-session project |
| 06 | Sequential Execution of One Atomic Step | process | MUST | — | Every sub-prompt execution |
| 07 | Sub-Agent Instruction | template | MUST (sub-agent) | — | Parallel work within a session |
| 08 | Constraint-Engineered Prompt Section | template | — | YES (within 02) | Any prompt with failure modes to prevent |
| 09 | Complete Output Specification | template | — | YES (within 02) | Any prompt producing file artifacts |
| 10 | Verified Build Completion | process | — | YES (final step) | When all prompts executed |
