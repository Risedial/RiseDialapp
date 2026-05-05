# Parameter Extraction Algorithm
**Purpose:** Universal algorithm for extracting every parameter at every level from any artifact type
**Date:** 2026-03-26

---

## CORE PRINCIPLE

Parameter extraction is a systematic audit, not a reading comprehension exercise. The algorithm forces extraction at all five layers (meta-meta, meta, macro, micro, micro-micro) and surfaces both explicit parameters (directly stated) and implicit parameters (required but unstated — inferrable from structure and constraints).

---

## THE UNIVERSAL EXTRACTION ALGORITHM

Apply to any artifact: a prompt, a command, a context file, a specification document, a state file, a README.

### Phase 1: Identify Artifact Type and Role

```
What type is this artifact?
  → Command (e.g., /prompt, /refinep)
  → Specification document (e.g., design_decisions.md)
  → Prompt file (e.g., prompt-NN.md)
  → Context file (e.g., data-inventory.md)
  → State file (state.json)
  → Index/README

What role does this artifact play in the pipeline?
  → Input to which stage?
  → Output of which stage?
  → Consumed by which other artifacts?
  → Produces which other artifacts?
```

### Phase 2: Extract Layer by Layer

**Do not skip layers. Do not merge layers.**

#### Layer 1: meta-meta (governing rules)
Extract items that govern HOW the artifact works — its own self-referential logic.

Questions to ask:
- What rules does this artifact impose on itself?
- What constraints define what this artifact can and cannot be?
- What beliefs or first principles govern its design?
- What would violate its architectural integrity?
- What terms does it define that carry special meaning?

Explicit: Look for "must", "never", "always", "mandatory", "no exceptions", "verbatim", "cardinal"
Implicit: Look for structural patterns that encode unstated rules (e.g., an append-only array implies immutability of past state)

#### Layer 2: meta (purpose architecture)
Extract items that define WHY this artifact exists and how it connects to other components.

Questions to ask:
- What problem does this artifact solve?
- What failure mode does it prevent?
- What contract does it fulfill for other components?
- What does it consume? What does it produce?
- What happens if this artifact is absent?

Explicit: Look for stated purpose, "prevents", "solves", "enables", "required by"
Implicit: Look for what other artifacts reference this one — that reference defines an implicit contract

#### Layer 3: macro (outcome categories)
Extract the major deliverables and cross-file workflows this artifact participates in.

Questions to ask:
- What does this artifact contribute to the overall workflow?
- Which stages does it participate in?
- What are the major categories of work it covers?
- What checkpoints or gates does it create?

Explicit: Look for phase names, stage names, output declarations
Implicit: Look for references from other artifacts that reveal what this one produces

#### Layer 4: micro (discrete operations)
Extract every specific operation this artifact performs or defines.

Questions to ask:
- What exactly does this file do, step by step?
- What sections does it contain? What does each section do?
- What operations does it enable or require?
- What transformations occur?

Explicit: Look for numbered steps, section headers, operation descriptions
Implicit: Look for implied operations (e.g., a "Prerequisites" section implies a "read state.json and check flags" operation before any task)

#### Layer 5: micro-micro (all parameters)
Extract every individual parameter, variable, naming convention, decision condition, and edge case.

Questions to ask:
- What are the exact values? (not ranges — exact values)
- What are the naming conventions? (format strings, prefix/suffix patterns)
- What are the valid values for each field?
- What are the decision conditions at every branch?
- What are the edge cases and how are they handled?
- What is forbidden? (specific words, patterns, structures)

Explicit: Look for exact numbers, exact strings, format patterns, enumerated values
Implicit: Look for constraints that imply forbidden alternatives (e.g., "append-only" implies deletion is forbidden even if not stated)

### Phase 3: Extract Explicit vs Implicit

For every parameter found, classify it:

**Explicit:** Directly stated in the artifact. Can be quoted verbatim.
Label: `EXPLICIT: "[quoted text]"`

**Implicit:** Required by the artifact's structure, relationships, or constraints — but not stated directly.
Label: `IMPLICIT: [inferred requirement] — [reasoning: "because [observable structure/constraint]"]`

**Inferred:** A reasonable conclusion from multiple explicit facts.
Label: `[Inferred: reasoning]` — Use this label as used in source material to signal uncertainty.

### Phase 4: Map Relationships

For every parameter found, ask:
- Which other parameters does this one constrain?
- Which other artifacts does this parameter affect?
- What happens downstream if this parameter changes?

Build a parameter dependency map for any parameter with downstream effects.

---

## EXTRACTION TEMPLATES BY ARTIFACT TYPE

### Template: Command Extraction

```
ARTIFACT: [Command name]
TYPE: Command
ROLE IN PIPELINE: [Stage N input/output]

META-META PARAMETERS:
- Governing rule: [rule]
- Self-referential constraint: [constraint]
- Architectural belief: [belief]

META PARAMETERS:
- Problem solved: [problem]
- Failure mode prevented: [failure mode]
- Input contract: [what it consumes]
- Output contract: [what it produces]
- Absent behavior: [what fails if this command doesn't exist]

MACRO PARAMETERS:
- Stages participated in: [list]
- Major deliverables: [list]
- Gates created: [list]

MICRO PARAMETERS:
- Phases/sections: [ordered list]
- Operations per phase: [list per phase]
- Trigger conditions: [when each operation fires]

MICRO-MICRO PARAMETERS:
- Input format: [exact format]
- Output format: [exact format]
- Exact values: [list with values]
- Naming conventions: [patterns]
- Forbidden content: [list]
- Edge case handling: [case → handling]
- Decision conditions: [condition → branch]
```

### Template: Prompt File Extraction

```
ARTIFACT: prompt-NN.md
TYPE: Prompt file
ROLE: Stage 7 execution unit

META-META:
- Atomicity constraint: [one verifiable unit — what is that unit?]
- Hard constraints: [all 5, verbatim]
- Cardinal failure mode: [what must never happen in this prompt]

META:
- Step ID: [exact step ID]
- What this prompt does: [one sentence]
- What it prevents: [failure mode]

MACRO:
- Stage: 7 (sequential execution)
- Session type: fresh chat (mandatory)
- Dependency on prior steps: [list]
- Enables for subsequent steps: [list]

MICRO:
- Prerequisites section content: [exact flags and files]
- Task section: [exact instruction]
- Verification checks: [all checks listed]
- State mutations: [all mutations listed]

MICRO-MICRO:
- File path written: [exact path]
- Format of output: [exact format]
- Exact counts (if data batch): [N entries]
- Flags set: [exact flag names]
- Counters incremented: [exact amounts]
- Files recorded in filesWritten: [exact paths]
```

### Template: Context File Extraction

```
ARTIFACT: context/[filename].[ext]
TYPE: Context file
ROLE: Domain reference for sub-agents

META-META:
- Immutability constraint: immutable during implementation
- Redundancy rule: [which critical values are redundantly present]
- Source of truth for: [what domain values]

META:
- Failure mode prevented: [specific failure mode]
- Consumed by prompts: [list of prompt numbers]
- Dependency position in graph: [upstream / mid / downstream]

MACRO:
- Stage written: 6 (context file preparation)
- Stage consumed: 7 (sequential execution)

MICRO:
- Sections present: [list]
- Copy-paste code blocks: [list]
- Enumeration completeness: [is the list complete? expected count?]

MICRO-MICRO:
- Exact values: [list all canonical values with their identifiers]
- Naming conventions: [all naming patterns defined]
- Ordering constraints: [any required ordering]
- Format requirements: [exact format of entries]
```

### Template: State File Extraction

```
ARTIFACT: state.json
TYPE: State file
ROLE: Cross-session continuity mechanism

META-META:
- Initialization rule: pendingSteps fully populated at init (never extended)
- Append-only constraint: completedSteps never shrinks
- Immutability: past state (completedSteps) is never modified, only appended

META:
- Problem solved: continuity across isolated sessions
- Replaces: conversation memory (which is excluded by design)
- Source of truth for: build progress

MACRO:
- Written by: initialization prompt (prompt-01) + every subsequent session
- Read by: every session at start

MICRO:
- Fields: version, buildTarget, completedSteps, pendingSteps, artifacts, dataChunks, flags
- Mutations per session: append to completedSteps, remove from pendingSteps, set flags, increment counters

MICRO-MICRO:
- version: string "1.0.0"
- buildTarget: exact output directory path (trailing slash required)
- Step ID format: "step-NN-descriptive-name"
- Flag naming: past-participle pattern (e.g., "stateInitialized", "designTokensWritten")
- Completion condition: pendingSteps.length === 0 AND completedSteps.length === total_steps
```

---

## PARAMETER COMPLETENESS AUDIT

After extraction, run this audit to confirm no parameters were missed:

```
For each parameter extracted, ask:
  1. Is this the exact value or an approximation? → Exact values only
  2. Is this parameter's downstream effect documented? → Map it if not
  3. Is there an implicit counterpart? → State it explicitly (e.g., if X is required, Y is forbidden)
  4. Is there an edge case? → State how the edge case is handled
  5. Is this parameter's naming convention documented? → Extract the pattern

For the artifact as a whole, ask:
  1. Have I extracted parameters at ALL five layers? → Confirm each layer covered
  2. Have I extracted both explicit AND implicit parameters? → Confirm both extracted
  3. Have I mapped this artifact's relationships to all others it touches? → Confirm mapped
  4. Are there any "it depends" answers? → Resolve the dependency — what does it depend on?
```
