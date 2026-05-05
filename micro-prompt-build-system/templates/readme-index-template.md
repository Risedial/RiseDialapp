# README Index Template
**Purpose:** Template for orchestration directory README.md (execution index)
**Location:** `[orchestration-dir]/README.md`
**Date:** 2026-03-26

---

## RULES

1. Every prompt file must have a row in this table
2. Row order must match execution order in state.json pendingSteps
3. Prerequisites must reference specific state.json flags, not vague descriptions
4. Sub-Agent Strategy must be exactly "SOLO" or "PARALLEL" — no other values
5. This file and state.json must be consistent — step IDs must match exactly
6. Update this file if any prompt is split during execution (add new rows, update prerequisites)

---

## TEMPLATE

```markdown
# [Project Name] — Orchestration Index
**Date:** YYYY-MM-DD
**Total Steps:** [N]
**Build Target:** [exact/output/directory/path]

---

## Execution Index

| Prompt # | File | Purpose | Prerequisites | Est. Token Output | Sub-Agent Strategy |
|---|---|---|---|---|---|
| 01 | prompt-01.md | Initialize state file | none | ~500 | SOLO |
| 02 | prompt-02.md | Write design tokens CSS | flags.stateInitialized = true | ~2,000 | SOLO |
| 03 | prompt-03.md | Write data inventory: [Category A] | flags.stateInitialized = true | ~8,000 | SOLO |
| 04 | prompt-04.md | Write data inventory: [Category B] | flags.stateInitialized = true | ~8,000 | SOLO |
| 05 | prompt-05.md | Write app architecture | flags.designTokensWritten = true; flags.dataInventoryComplete = true | ~5,000 | SOLO |
| 06 | prompt-06.md | Write [component] CSS | flags.designTokensWritten = true; context/app-architecture.md exists | ~4,000 | SOLO |
| 07 | prompt-07.md | Write [module] JavaScript | flags.appArchitectureWritten = true | ~6,000 | PARALLEL |
| 08 | prompt-08.md | Write app shell HTML | flags.appArchitectureWritten = true | ~3,000 | SOLO |
| 09 | prompt-09.md | Validate and verify build | all flags = true; artifacts.filesWritten contains all expected files | ~1,000 | SOLO |

---

## Context Files

| File | Role | Required By |
|---|---|---|
| context/design-tokens.css | Source of truth for all colors, spacing, typography | Prompts 06, 07, 08 |
| context/data-inventory.md | Complete data enumeration with canonical IDs | Prompts 03, 04, 05 |
| context/app-architecture.md | Navigation model, state machine definitions | Prompts 05, 06, 07 |

---

## Sub-Agent Strategy Reference

**SOLO:** Prompt executes as single task in its session. No sub-agents spawned.
**PARALLEL:** Prompt may spawn sub-agents for independent parallel sub-operations.

---

## Progress Tracking

Update this section manually as steps complete, or read state.json for authoritative status.

| Step | Status |
|---|---|
| step-01-initialize-state | pending |
| step-02-write-design-tokens | pending |
| ... | ... |
```

---

## COLUMN DEFINITIONS

| Column | Required Content | Example |
|---|---|---|
| Prompt # | Zero-padded integer | `01`, `12`, `45` |
| File | Exact filename | `prompt-07.md` |
| Purpose | One-line imperative description | `Write symptom data: Energy & Fatigue category` |
| Prerequisites | State.json flags AND files that must exist; "none" if truly none | `flags.stateInitialized = true; context/design-tokens.css exists` |
| Est. Token Output | Rough estimate in tokens; flag if >25K for potential splitting | `~8,000`, `~28,000 ⚠️` |
| Sub-Agent Strategy | SOLO or PARALLEL | `SOLO` |

---

## TOKEN OUTPUT WARNING

If any prompt is estimated at >25,000 tokens:
- Add warning marker: `~28,000 ⚠️`
- Strongly consider splitting before execution
- 32,000 is the hard limit; approaching it risks truncation

If any prompt is estimated at >30,000 tokens:
- MUST split before execution
- Do not attempt to execute; return to Stage 5 and subdivide
