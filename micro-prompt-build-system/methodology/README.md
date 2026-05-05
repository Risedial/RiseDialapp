# BDE Extraction — Claude Code Methodology
**Source:** `claude-code-methodology.md`
**Date:** 2026-03-26

---

## START HERE

1. Open `00-inventory/system-map.md` — read the full pipeline dependency graph at the bottom. This gives you a complete map of how all components connect.

2. Decide what you want to do:
   - If you want to **use the methodology** → go to step 3
   - If you want to **understand the methodology** → open `04-meta-system/orchestration-spec.md`
   - If you want **templates to fill in** → go to step 8

---

## USING THE METHODOLOGY

3. Open `01-outcomes/outcome-registry.md`. Find the outcome that matches your goal. Note its "Fresh Chat vs Chain" classification.

4. Is your goal: optimize a single prompt?
   - **YES → go to step 5**
   - **NO, I'm running a large multi-session project → go to step 6**

5. Single prompt optimization path:
   - Open `02-reverse-engineered/prompt-engineering-pipeline-execution-plan.md`
   - Follow "STEP SEQUENCE: /prompt Application" (Steps 1–4)
   - If production-grade: continue to "/refinep Application" (Steps 1–7)
   - If task in refined-prompt.md is large/complex → go to step 6
   - **DONE.**

6. Multi-session project path:
   - Open `02-reverse-engineered/orchestration-decomposition-execution-plan.md`
   - Follow Steps 1–9 in order. Do not skip Step 1 (catalog units — mandatory pre-write).
   - **If YES, completed orchestration package → go to step 7**

7. Execution path:
   - Open `02-reverse-engineered/context-state-system-execution-plan.md`
   - Follow "STAGE 6: CONTEXT FILE WRITING" (Steps 1–5)
   - Then follow "STAGE 7: SEQUENTIAL EXECUTION" — Per-Session Protocol (Steps 1–12)
   - Each sub-prompt runs in a fresh chat. No exceptions.
   - When `state.json.pendingSteps` is empty → follow "STAGE 8: COMPLETION VERIFICATION"
   - **DONE.**

---

## USING TEMPLATES

8. What do you need?

   - Sub-prompt file (prompt-NN.md) → `03-templates/sub-prompt-schema-template.md`
   - state.json initialization → `03-templates/state-schema-template.md`
   - context/ directory file → `03-templates/context-file-template.md`
   - README.md execution index → `03-templates/readme-index-template.md`
   - Quality gate checklists (8-rule, 15-item, sub-prompt, package) → `03-templates/prompt-engineering-checklist.md`

---

## DECISION POINTS

9. Not sure which path to take?
   - Open `04-meta-system/approach-selection-decision-tree.md` → start at "PRIMARY DECISION TREE: WHAT DO I DO WITH THIS TASK?"
   - Follow branches. Every branch has a binary YES/NO. No "it depends" without resolution.

10. Not sure if something is fresh chat or chain?
    - Open `01-outcomes/fresh-chat-vs-chain-map.md` → find your operation in the table.
    - If still uncertain → go to the DECISION TREE section in that file.

11. A constraint or rule is being violated — what takes precedence?
    - Open `04-meta-system/system-integrity-rules.md` → find the rule in TIER 1 (non-overridable) or TIER 2 (strong)
    - Tier 1 rules cannot be overridden. Use the "compliance-while-responsive pattern" to accomplish the user's goal within the constraint.

---

## DIRECTORY REFERENCE

| Folder | Contents | When to Open |
|---|---|---|
| `00-inventory/` | `system-map.md` — complete inventory of all 38 components across 5 layers | Start here for orientation |
| `01-outcomes/` | `outcome-registry.md` — 10 outcomes classified and layered | Find your goal |
| `01-outcomes/` | `fresh-chat-vs-chain-map.md` — binary session strategy for every operation | Decide session type |
| `02-reverse-engineered/` | `prompt-engineering-pipeline-execution-plan.md` — Stages 1–4 | Single prompt work |
| `02-reverse-engineered/` | `orchestration-decomposition-execution-plan.md` — Stage 5 | Complex project decomposition |
| `02-reverse-engineered/` | `context-state-system-execution-plan.md` — Stages 6–8 | Context files, execution, completion |
| `03-templates/` | `sub-prompt-schema-template.md` | Writing prompt-NN.md files |
| `03-templates/` | `state-schema-template.md` | Writing state.json |
| `03-templates/` | `context-file-template.md` | Writing context/ files |
| `03-templates/` | `readme-index-template.md` | Writing orchestration README.md |
| `03-templates/` | `prompt-engineering-checklist.md` | Quality gates (A, B, C, D, E) |
| `04-meta-system/` | `approach-selection-decision-tree.md` | Choosing the right approach |
| `04-meta-system/` | `parameter-extraction-algorithm.md` | Extracting parameters from any artifact |
| `04-meta-system/` | `system-integrity-rules.md` | Rules that cannot be overridden |
| `04-meta-system/` | `orchestration-spec.md` | Full component interaction map + handoff contracts |

---

## QUICK REFERENCE: CARDINAL RULES

These five rules cannot be violated. If you are tempted to violate any of them, read `04-meta-system/system-integrity-rules.md` first.

1. **Every Stage 7 session = fresh chat.** No chaining. No exceptions.
2. **pendingSteps fully populated at initialization.** Never add steps mid-execution.
3. **Hard constraints verbatim in every prompt.** Copy-paste. No paraphrasing.
4. **One atomic task per prompt.** Combining two tasks = cardinal failure mode.
5. **State.json updated before session exit.** State update is the mandatory final step, conditional only on Verification passing.
