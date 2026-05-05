# Orchestration Specification
**Purpose:** How all components connect; sequencing rules; handoff contracts; audit trail conventions
**Date:** 2026-03-26

---

## SYSTEM OVERVIEW

The Claude Code Methodology is a multi-stage pipeline that transforms a raw idea into executed, verified, multi-file output. Every stage produces an artifact. Every handoff is explicit, written, and verifiable. Nothing passes implicitly between stages.

---

## COMPONENT REGISTRY

| Component | Type | Stage | Produces | Consumes |
|---|---|---|---|---|
| `design_decisions.md` | Specification | 1 | Locked design decisions | Prior thinking/ideation |
| `/prompt` command | Command | 3 | Single optimized prompt (code block) | Raw prompt text |
| `/refinep` command | Command | 4 | `refined-prompt.md` | Optimized prompt |
| `refined-prompt.md` | File | 4 output | Refined prompt + Refinement Report | `/refinep` output |
| `meta-prompt.md` | Strategy doc | 5 input | Decomposition decisions | User-authored |
| `state.json` | State file | 5 init | Cross-session state | Stage 5 (init), Stage 7 (read/write) |
| `README.md` (orchestration) | Index file | 5 | Execution index | Stage 5 (init), Stage 7 (reference) |
| `prompt-NN.md` files | Prompt files | 5 | Atomic sub-prompts | Stage 7 (execution) |
| Context files | Domain refs | 6 | Domain knowledge for sub-agents | Stage 7 (sub-agent reads) |
| Build output files | Deliverables | 7 | Application files | Stage 7 (writes) |
| Final chat report | Completion artifact | 8 | Build summary + integrity counts | Stage 8 |

---

## HANDOFF CONTRACTS

### Handoff 1: Stage 1 → Stage 2
**From:** `design_decisions.md` (locked specification)
**To:** Initial prompt formulation
**Contract:** All design decisions are locked. No ambiguity. Exact values present.
**Verification:** "Can a developer implement this without asking clarifying questions?" → YES required
**Handoff mechanism:** User translates specification into raw prompt text

### Handoff 2: Stage 2 → Stage 3
**From:** Raw prompt (any quality)
**To:** `/prompt` command
**Contract:** A prompt exists expressing the task (minimum requirement)
**Verification:** None required — quality is deliberately not required at this stage
**Handoff mechanism:** User invokes `/prompt [raw prompt]`

### Handoff 3: Stage 3 → Stage 4
**From:** `/prompt` output (single code block)
**To:** `/refinep` command
**Contract:** Optimized prompt passes 8-rule checklist
**Verification:** 8-rule checklist (Checklist A in prompt-engineering-checklist.md)
**Handoff mechanism:** User invokes `/refinep [optimized prompt]` OR `/refinep [file path]`

### Handoff 4: Stage 4 → Stage 5
**From:** `refined-prompt.md`
**To:** Orchestration decomposition
**Contract:** Prompt passes 15-item Phase 5 self-verification. Prompt is self-contained.
**Verification:** 15-item checklist (Checklist B) — embedded in `/refinep` Phase 5 (automatic)
**Handoff mechanism:** User reads `refined-prompt.md` → determines if decomposition needed → opens fresh chat for Stage 5
**Decision gate:** If single-session task → skip Stage 5 → execute `refined-prompt.md` directly

### Handoff 5: Stage 5 → Stage 6
**From:** Orchestration package (state.json + README.md + prompt-NN.md files)
**To:** Context file writing
**Contract:** All step IDs in pendingSteps. All prompt files exist. No forward references.
**Verification:** Orchestration package gate (Checklist D in prompt-engineering-checklist.md)
**Handoff mechanism:** User opens fresh chat for context file writing

### Handoff 6: Stage 6 → Stage 7
**From:** Context files in `context/` directory
**To:** Sequential execution
**Contract:** Every domain knowledge item that sub-agents would otherwise infer is pre-written and accessible as a named file.
**Verification:** Every prompt's Prerequisites section lists context files → confirm each file exists
**Handoff mechanism:** User begins Stage 7 sequential execution (fresh chat per prompt)

### Handoff 7: Stage 7 Session N → Stage 7 Session N+1
**From:** Updated `state.json` (step N marked complete)
**To:** Next execution session
**Contract:** state.json updated: step N in completedSteps, removed from pendingSteps. Output files from step N exist on disk.
**Verification:** Next session reads state.json → confirms its step ID is in pendingSteps → proceeds
**Handoff mechanism:** state.json read at start of each session (automatic per protocol)

### Handoff 8: Stage 7 → Stage 8
**From:** Final state.json (pendingSteps empty)
**To:** Completion verification
**Contract:** pendingSteps.length === 0. completedSteps contains all step IDs.
**Verification:** Stage 8 checks count and completeness → data integrity audit
**Handoff mechanism:** Final session produces chat report

---

## SEQUENCING RULES

### Mandatory Sequence
```
Stage 1 → Stage 2 → Stage 3 → Stage 4 → [decision: complex?] → Stage 5 → Stage 6 → Stage 7 → Stage 8
                                              ↓ (not complex)
                                         Direct Execution
```

### Within Stage 7: Strict Execution Order
- Prompts execute in the order defined by `pendingSteps` in `state.json`
- No prompt may execute before its prerequisites are satisfied
- PARALLEL-designated prompts may spawn sub-agents concurrently within one session
- Sequential order between sessions is mandatory

### Within Stage 5: Internal Sequencing
```
1. Catalog all discrete verifiable units (pre-write — mandatory first)
2. Establish execution order and dependency graph
3. Design state.json schema (all step IDs finalized)
4. Write state.json (initialization)
5. Write README.md (index)
6. Write prompt-01.md through prompt-NN.md (all files)
```

### Context File Dependency Order
```
Write: data-inventory.md + design-tokens.css    (upstream — no dependencies)
  ↓ then write:
Write: app-architecture.md + ui-design-system.md (references upstream files)
  ↓ then write:
Write: pwa-technical.md + build-manifest.md      (references all others)
```

---

## AUDIT TRAIL CONVENTIONS

### What Gets Recorded and Where

| Event | Recorded In | Field | Entry Format |
|---|---|---|---|
| Step completed | state.json | completedSteps | `"step-NN-descriptive-name"` (appended) |
| Step begins | state.json | pendingSteps | (item removed) |
| Prerequisite satisfied | state.json | flags | `"flagName": true` |
| Data items written | state.json | artifacts.itemCount | integer increment |
| File written | state.json | artifacts.filesWritten | `"exact/path/file.ext"` (appended) |
| Data chunk written | state.json | dataChunks | category-keyed entry |
| Build complete | chat report | — | Full artifact enumeration + integrity counts |

### Verification Trail

Each session produces a verification trail through its Verification section. The verification section documents:
- What was checked (binary pass/fail)
- What counts were confirmed
- What format was confirmed

State.json update is the final confirmation that verification passed. An entry in completedSteps is a record that:
1. The task was executed
2. The verification section passed
3. The state was correctly updated

### Discrepancy Handling

If state.json shows inconsistency:
- Step in completedSteps AND pendingSteps → impossible state → manual inspection required
- Step in neither → corrupted state → manual inspection required
- Count in artifacts.itemCount less than expected → data batch prompt under-wrote → re-run that prompt

---

## COMPONENT INTERACTION DIAGRAM

```
USER INPUT
  │
  ▼
[design_decisions.md] ──────────────────────────────────────────────┐
  │                                                       │
  ▼                                                       │
[Raw Prompt] → /prompt → [Optimized Prompt]              │
                              │                           │
                              ▼                           │
                          /refinep                        │
                              │                           │
                              ▼                           │
                    [refined-prompt.md]                   │
                              │                           │
               ┌──────────────┘                           │
               │ (complex task)                           │
               ▼                                          │
      [meta-prompt.md] ──────────────────────────┐       │
               │                                  │       │
               ▼                                  │       │
      Stage 5: Decomposition                      │       │
         ├── [state.json] ◄────────────────────── │ ─────┘
         ├── [README.md]                          │
         └── [prompt-01.md ... prompt-NN.md]      │
                    │                             │
                    ▼                             │
         Stage 6: Context Files ──────────────────┘
         [context/]
           ├── design-tokens.css
           ├── data-inventory.md
           ├── app-architecture.md
           ├── ui-design-system.md
           ├── pwa-technical.md
           └── build-manifest.md
                    │
                    ▼
         Stage 7: Sequential Execution (fresh chat per prompt)
         ┌─────────────────────────────────────────────┐
         │ Session: read state.json                     │
         │ → confirm step in pendingSteps               │
         │ → read context files from Prerequisites      │
         │ → execute Task                               │
         │ → run Verification                           │
         │ → update state.json                          │
         │ → exit                                       │
         └─────────────────────────────────────────────┘
                    │ (repeat for each pending step)
                    ▼
         Stage 8: Completion
         [pendingSteps = []] → Final chat report
```

---

## FAILURE RECOVERY MAP

| Failure | Detected By | Recovery Mechanism | Returns To |
|---|---|---|---|
| Prompt exceeds 32K tokens mid-execution | Truncated output, no Verification/State Update executed | Split the prompt; update state.json and README.md | Stage 5 (edit orchestration) |
| Forward reference in prerequisites | Stage 5 audit / execution failure (file not found) | Reorder prompts to put creating step before depending step | Stage 5 (reorder) |
| Context file not loaded | Output contains incorrect domain values | Edit prompt's Task section to explicitly name file; re-run session | Stage 7 (re-run session) |
| State not updated after session | Next session attempts same step | Manually update state.json; verify artifacts exist on disk | Stage 7 (continue) |
| Data batch incomplete (truncated at <N entries) | Verification fails: count < expected | State not updated; re-run the session; it remains in pendingSteps | Stage 7 (re-run same step) |
| Two tasks combined in one prompt | Output partial or truncated | Return to Stage 5: split into two prompts, update state.json, README.md | Stage 5 |
| State.json corrupted | Session cannot find its step ID | Manual state.json inspection and repair | Stage 7 (after repair) |
