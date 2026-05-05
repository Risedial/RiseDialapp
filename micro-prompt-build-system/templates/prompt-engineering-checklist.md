# Prompt Engineering Checklists
**Purpose:** Standalone quality gates for the /prompt and /refinep pipeline
**Date:** 2026-03-26

---

## CHECKLIST A: 8-Rule Optimization (`/prompt` output quality gate)

Run this on any prompt BEFORE execution. If any answer is NO, revise.

| # | Rule | Check Question | Pass = |
|---|---|---|---|
| 1 | Lead with Outcome | Does the prompt state what should be TRUE after completion (not process steps)? | YES |
| 2 | Specify Scope | Are all files, directories, or systems explicitly in OR out of scope? | YES |
| 3 | Name Constraints | Are language, framework, style conventions, AND prohibited actions all stated? | YES |
| 4 | Break Compound Tasks | If multiple things must happen, are they numbered in sequence? | YES |
| 5 | Anticipate Edge Cases | Are specific failure conditions named with specific handling instructions? | YES |
| 6 | Use CC Conventions | Are all references concrete (exact file paths, function names, line numbers)? | YES |
| 7 | Avoid Vagueness | Are "improve/fix/update/enhance/clean up" replaced with observable, measurable actions? | YES |
| 8 | State Output Format | Is the expected artifact declared with exact file path, format, and structure? | YES |

---

## CHECKLIST B: 15-Item Self-Verification (`/refinep` Phase 5 release gate)

This checklist is the release condition for `refined-prompt.md`. All items must pass.

| # | Item | Pass = |
|---|---|---|
| 1 | Clear `<role>` with bounded expertise | Role assigned with knowledge domain bounded |
| 2 | XML tags separate distinct concerns | Each major concern in its own labeled XML section |
| 3 | Context/background appears before instructions | Data-first ordering: context → instructions → deliverable |
| 4 | Deliverable specification at end | Output spec is last section, not embedded in task |
| 5 | All ambiguous phrases replaced with specific language | No "good", "fast", "user-friendly" without measurable definition |
| 6 | All passive/wishful language converted to active directives | No "it would be great if" or "consider" constructions |
| 7 | Domain research findings woven naturally | Phase 3 research appears as specific terminology and anti-patterns |
| 8 | Explicit success criteria — minimum 5 conditions | At least 5 testable "should be able to" assertions |
| 9 | Defined output format with named sections | Section headings, order, content, and length guidance specified |
| 10 | Chain-of-thought phases defined (if multi-step) | Sequential reasoning phases named with goals (if applicable) |
| 11 | Constraint boundaries state IS and IS NOT | Both positive scope and exclusions explicitly stated |
| 12 | Negative constraints address common failure modes | Do NOT directives targeting domain-specific failure modes |
| 13 | Prompt is self-contained | Another Claude instance could execute without additional context |
| 14 | Spelling, grammar, terminology correct | Domain terminology from Phase 3 research applied correctly |
| 15 | Minimum structure — no unnecessary complexity | No sections added for appearance; every section earns its place |

---

## CHECKLIST C: Sub-Prompt Quality Gate (before adding to orchestration)

Run on every `prompt-NN.md` before finalizing the orchestration package.

| # | Item | Pass = |
|---|---|---|
| 1 | File named `prompt-NN.md` with zero-padded number | YES |
| 2 | Title follows `# Prompt [NN]: [Action in imperative form]` | YES |
| 3 | All 5 required sections present (Prerequisites, Hard Constraints, Task, Verification, State Update) | YES |
| 4 | Prerequisites section: either lists specific flags/files OR explicitly states "none" | YES |
| 5 | Hard Constraints: all five constraints present verbatim — no paraphrasing | YES |
| 6 | Task section: contains exactly ONE verifiable unit of work | YES |
| 7 | Task: imperative form, no compound verbs, no implicit scope, no undefined references | YES |
| 8 | Verification: all checks are measurable and binary (pass/fail), not subjective | YES |
| 9 | State Update: specifies exact mutations (append, remove, set, increment, record) | YES |
| 10 | No prerequisite references a file or flag created by a LATER prompt | YES |
| 11 | If PARALLEL: all sub-operations are independent (no shared state writes) | YES / N/A |
| 12 | Context files needed for this task are explicitly listed in Prerequisites | YES |

---

## CHECKLIST D: Orchestration Package Gate (before Stage 7 begins)

Run on the entire orchestration directory before executing any prompts.

| # | Item | Pass = |
|---|---|---|
| 1 | `state.json` exists with fully populated `pendingSteps` | YES — no empty array |
| 2 | `state.json.completedSteps` is empty | YES — `[]` |
| 3 | All `state.json.flags` are `false` | YES |
| 4 | `state.json.pendingSteps` count matches number of prompt files | YES |
| 5 | `README.md` exists with table covering all prompts | YES |
| 6 | README.md row count matches `pendingSteps` count | YES |
| 7 | Every `prompt-NN.md` file exists (count confirmed) | YES |
| 8 | All context files listed in any prompt's Prerequisites exist in `context/` | YES |
| 9 | No prompt has a Token estimate >30,000 without being flagged for splitting | YES |
| 10 | Step IDs in `state.json.pendingSteps` match step IDs referenced in State Update sections | YES |

---

## CHECKLIST E: "Perfectly Engineered for Claude" (11 Observable Conditions)

A prompt satisfies this standard when ALL are true:

1. Divided into XML-tagged sections with canonical tag names
2. Context appears before instructions; deliverable specification is last
3. Claude is assigned a named expert role with bounded knowledge domain
4. All reasoning guided through sequential phases with named goals
5. Every vague term replaced with a measurable specific
6. MUST / SHOULD / MAY gradients applied to requirements
7. IS / IS NOT constraint boundaries present
8. Do NOT directives address the specific failure modes of this domain
9. Output structure fully declared: section headings, order, format, length
10. 5+ measurable success criteria stated as testable assertions
11. Prompt is self-contained — another Claude instance could execute without additional context
