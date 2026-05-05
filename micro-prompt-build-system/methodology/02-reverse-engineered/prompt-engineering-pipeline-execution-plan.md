# Execution Plan: Prompt Engineering Pipeline (Stages 1–4)
**Covers:** Outcomes 01, 02 — `/prompt` application, `/refinep` application
**Date:** 2026-03-26
**Step:** 02 — Reverse-Engineering Pass

---

## MINIMUM CONTEXT TO EXECUTE

- Access to the raw task description or raw prompt text
- (For `/refinep`) Web search capability
- (For `/refinep`) File write capability to workspace root
- No state files required — this pipeline is stateless

---

## DECISION TREE: WHICH PIPELINE TO USE?

```
Do you have a prompt that needs optimization?
  → YES

  Is this a quick, single-session, simple task?
    → YES: Use /prompt only (OUTCOME-01). Execute directly.
    → NO: proceed

  Is this a production-grade, complex, or multi-file task?
    → YES: Use /prompt THEN /refinep (OUTCOMES 01 + 02)
    → UNSURE: Default to /prompt + /refinep. Cost of refinement < cost of re-execution.

  Does the refined prompt describe a large task (>32K tokens OR multiple discrete units)?
    → YES: Pipe refined-prompt.md into Stage 5 (Orchestration Decomposition)
    → NO: Execute refined-prompt.md directly
```

---

## STEP SEQUENCE: `/prompt` Application

### Step 1: Produce Raw Prompt
- **What to open:** Your specification document (design_decisions.md equivalent) or task description
- **What to do:** Write a raw prompt expressing what Claude Code should do. Quality is deliberately not required.
- **What to expect:** A rough statement of the task. May contain vague verbs, implicit scope, no output spec.
- **Gate:** A prompt exists that expresses the task. Proceed.

### Step 2: Apply 8-Rule Mental Checklist
Before invoking the command, manually check or let `/prompt` handle these:

| Rule | Check Question | If NO: Transform |
|---|---|---|
| 1. Lead with Outcome | Does it state what should be TRUE after completion? | Reorder: front-load end state |
| 2. Specify Scope | Are files/systems explicitly in or out of scope? | Add: "only in /path/. Do not modify /other/." |
| 3. Name Constraints | Are language, framework, style, and DON'T items stated? | Add declarative positive + negative constraint statements |
| 4. Break Compound Tasks | If multiple things happen, are they sequenced? | Decompose into numbered substeps |
| 5. Anticipate Edge Cases | Are failure conditions named with specific handling? | Add: "If [condition], then [specific action]." |
| 6. Use CC Conventions | Are file paths, function names, line numbers concrete? | Replace generic refs with addressable identifiers |
| 7. Avoid Vagueness | Are "improve/fix/update/enhance" replaced with observable actions? | Replace with measurable outcome: "reduce from X to Y" |
| 8. State Output Format | Is the expected artifact declared with path + format? | Add: exact file path, structure, format constraints |

### Step 3: Invoke `/prompt [raw prompt]`
- **What to do:** Run the command with the raw prompt as argument
- **What to expect:** A single markdown code block containing the optimized prompt. No text outside the block.
- **Decision point:** If output contains any commentary outside the code block → the command failed its output contract. Re-run.

### Step 4: Evaluate Output
- **What to check:** Does the output pass all 8 rules (see Step 2 table)?
- **If YES:** Proceed to either execute directly (simple task) or pipe into `/refinep` (complex task)
- **If NO:** Note which rules failed; the command should have caught them, but if not, manually revise before proceeding

---

## STEP SEQUENCE: `/refinep` Application

### Step 1: Establish RAW_PROMPT
- **Option A:** Invoke `/refinep [optimized prompt from /prompt]` — recommended
- **Option B:** Invoke `/refinep [file path]` — if raw prompt is in a file
- **Option C:** Invoke `/refinep` with no arguments → AskUserQuestion triggers → type prompt or provide file path
- **What to expect:** RAW_PROMPT established. Phase 2 begins.

### Step 2: Phase 2 — Diagnostic (25 items scored)
- **What happens:** Command evaluates RAW_PROMPT against 25 items across 7 categories
- **Scoring:** Adequate / Partial / Not at all
- **Your role:** Nothing. Command executes autonomously.
- **What to expect:** Every Partial or Not at all item flagged for Phase 4 correction.
- **Implicit check:** If almost everything scores Adequate → prompt was already well-formed (from `/prompt` pipeline). Refinement will still apply technique library.

### Step 3: Phase 3 — Domain Research (mandatory)
- **What happens:** Command identifies primary domain → executes 2–3 web searches
  - Search 1: Domain best practices + current standards (current year in query)
  - Search 2: Framework/methodology deep-dive (if specific tools referenced)
  - Search 3: Common pitfalls and anti-patterns
- **Your role:** Nothing. Research is automatic and mandatory.
- **What NOT to expect:** Research results are NOT shown to you. They are integrated directly into Phase 4.
- **What to expect:** Research happens invisibly. Phase 4 output will contain domain-accurate terminology and anti-patterns.

### Step 4: Phase 4 — Technique Application (25 techniques)
- **What happens:** Command applies applicable techniques in category order A → B → C → D → E → F → G
- **Category sequence (mandatory order):**
  - A: Structural (XML tags, data-first, nesting, progressive disclosure)
  - B: Role & Identity (role assignment, expertise scoping, audience awareness)
  - C: Reasoning & Thinking (chain-of-thought, self-verification directives, thinking process)
  - D: Clarity & Precision (ambiguity elimination, active directives, MUST/SHOULD/MAY, IS/IS NOT, Do NOT, spelling/grammar)
  - E: Context & Research (domain research integration, few-shot examples, reference anchoring)
  - F: Output Control (format spec, success criteria, tone/voice)
  - G: Meta-Techniques (permission to expand, uncertainty allowance, task decomposition)
- **Judgment rule:** Not all 25 techniques applied to every prompt. Simple prompts: 3–4 techniques. Complex prompts: 8+.
- **What to expect:** Prompt substantially transformed. XML structure added. Role defined. Constraints explicit. Success criteria stated.

### Step 5: Phase 5 — Self-Verification (15-item checklist)
- **What happens:** Command validates refined prompt against 15-item checklist
- **Decision gate:** Any unchecked item → command revises prompt → re-verifies → loop until all pass
- **Your role:** Nothing. Gate executes automatically.
- **What to expect:** You will NOT see a partially-verified prompt. Either all 15 pass, or the loop continues invisibly.

### Step 6: Phase 6 — Output
- **What happens:** Command writes `refined-prompt.md` to workspace root
- **File structure:**
  ```
  # Refined Prompt
  > [optimization note]
  ## The Prompt
  [full refined prompt — copy-paste ready]
  ## Refinement Report
  ### Original Prompt [quoted in full]
  ### Diagnostic Results [table: Item | Status | How Addressed]
  ### Techniques Applied [table: # | Technique | How Applied | Category]
  ### Domain Research Conducted [summary]
  ```
- **Chat display:** File location + diagnostic improvement count (X/25) + techniques applied count + domain research summary
- **What to expect:** `refined-prompt.md` exists in workspace root. Chat shows summary.

### Step 7: Use the Output
- **Decision point:** Is the task in `## The Prompt` large/complex (>32K tokens OR multiple verifiable units)?
  - **YES → If YES → go to:** Orchestration Decomposition execution plan
  - **NO → If NO → proceed:** Copy prompt from `## The Prompt` section. Execute directly in Claude Code.

---

## SPLIT POINTS

**Split point 1:** Between `/prompt` and `/refinep`
- Condition: Always optional split; recommended for complex tasks
- Handoff: Copy code block content from `/prompt` output → use as input to `/refinep`

**Split point 2:** Between `/refinep` and Stage 5 (Orchestration Decomposition)
- Condition: Task in refined-prompt.md is complex/large
- Handoff: `refined-prompt.md` → input to fresh chat running Orchestration Decomposition

---

## DECISION TREE: WHAT TO DO WITH `refined-prompt.md`

```
Read ## The Prompt section of refined-prompt.md.

Does it describe a task with multiple discrete verifiable units?
  → YES: Go to orchestration-decomposition-execution-plan.md

Would executing it in a single response risk exceeding 32K tokens?
  → YES: Go to orchestration-decomposition-execution-plan.md

Is it a single, focused task producing one primary output?
  → YES: Execute directly. Copy from ## The Prompt. Paste into fresh Claude Code.
  → DONE.
```

---

## FRESH CHAT PROMPTS FOR THIS PIPELINE

### Fresh Chat Handoff: Pipe `/prompt` output into `/refinep`

```
Read the following optimized prompt and apply /refinep to it:

[PASTE CONTENT OF CODE BLOCK FROM /prompt OUTPUT HERE]

Output refined-prompt.md to workspace root. Do not display any text outside of the chat summary specified by the /refinep command.
```

### Fresh Chat Handoff: Use `refined-prompt.md` for direct execution

```
Read c:/[workspace]/refined-prompt.md.
Execute the prompt in the ## The Prompt section.
All constraints, output specifications, and success criteria are embedded in the prompt — follow them exactly.
```
