# System Integrity Rules
**Purpose:** Constraints that survive all future user instructions; enforcement logic; compliance-while-responsive pattern
**Date:** 2026-03-26

---

## WHAT SYSTEM INTEGRITY MEANS

System integrity rules are the constraints that, if violated, compromise the entire methodology — not just individual outputs. They are not preferences, not defaults that can be overridden by user instructions, and not negotiable based on context. They exist because their violation was observed to cause cascading failures that invalidate the work of multiple sessions.

---

## TIER 1: ARCHITECTURAL CONSTRAINTS (Non-overridable)

These constraints are architectural — violating them breaks the system, not just the output.

### RULE 1: Fresh Chat for Stage 7 (No Exceptions)
**Rule:** Every Stage 7 sub-prompt execution must occur in a fresh Claude session.
**Why it's architectural:** Sequential isolation is the design mechanism that prevents context contamination across sessions. Chaining sessions in Stage 7 reintroduces the exact problem the methodology was designed to eliminate.
**Enforcement:** If a user asks you to "just continue from here" for a Stage 7 prompt → refuse. Explain that a fresh chat is required by design. Open a new session.
**Compliance-while-responsive pattern:** "This step requires a fresh chat to maintain session isolation. Here is the exact content to paste into a new session: [provide the prompt-NN.md content]."

### RULE 2: pendingSteps Fully Populated at Initialization (No Exceptions)
**Rule:** state.json must be initialized with ALL step IDs in pendingSteps before any session executes.
**Why it's architectural:** Adding step IDs mid-execution breaks the invariant that any session can determine the full scope of remaining work at any time. It also creates audit inconsistency between README.md and state.json.
**Enforcement:** If step IDs are added after initialization has begun → return to Stage 5, redesign the complete step list, and re-initialize state.json from scratch.
**Compliance-while-responsive pattern:** "I need to add a step that wasn't in the original plan. To maintain state integrity, I'll go back to Stage 5 and update the complete step list before any execution resumes."

### RULE 3: Hard Constraints Verbatim (No Paraphrasing)
**Rule:** The five hard constraints must appear word-for-word in every sub-prompt. No paraphrasing, no summarizing, no reordering.
**Why it's architectural:** Paraphrased constraints have been observed (evidenced in source material) to be interpreted as soft suggestions rather than absolute rules. The exact wording is the enforcement mechanism.
**Enforcement:** If a prompt file contains a paraphrased version of any constraint → rewrite it verbatim before executing.
**Compliance-while-responsive pattern:** "I notice the constraint reads '[paraphrase]' instead of the required verbatim text. I'm updating it to the exact required wording before proceeding."

### RULE 4: One Atomic Task Per Prompt (Cardinal Failure Mode)
**Rule:** Each prompt-NN.md must contain exactly one verifiable unit of work in its Task section.
**Why it's architectural:** Named explicitly as "the cardinal failure mode" — the single most consequential error. Combining tasks either truncates output (hitting 32K limit) or produces partial correct output (some sections complete, others abbreviated).
**Enforcement:** If a Task section contains more than one verifiable completion condition → the prompt must be split before execution.
**Compliance-while-responsive pattern:** "This task has two verifiable units. I'll split it into two prompts to prevent the cardinal failure mode, and update state.json and README.md accordingly."

### RULE 5: No Forward References in Prerequisites (DAG Acyclicity)
**Rule:** A prompt may never list as a prerequisite a file or flag created by a prompt that runs AFTER it.
**Why it's architectural:** Forward references create circular dependencies that make execution order underdetermined. The entire sequential execution model depends on a valid dependency DAG.
**Enforcement:** For every prerequisite → trace to the creating step → confirm that step has a LOWER number. If not → reorder prompts.
**Compliance-while-responsive pattern:** "Prompt [NN] references [flag/file] which isn't created until Prompt [MM]. I need to reorder these steps so [MM] runs before [NN]."

### RULE 6: State Update Before Session Exit (No Exceptions)
**Rule:** state.json must be updated (completedSteps appended, pendingSteps item removed) before any session exits, and only after the Verification section passes.
**Why it's architectural:** A session that executes without updating state leaves the pipeline inconsistent. The next session will attempt to repeat the same step, causing duplicate work or conflicts.
**Enforcement:** If a session completes without state update → do not proceed to next step. Manually update state.json. Verify the step's artifacts exist on disk before marking complete.
**Compliance-while-responsive pattern:** "I completed the task but haven't updated state.json yet. Performing state update now before exiting: [mutations]."

---

## TIER 2: QUALITY CONSTRAINTS (Strong — override requires explicit justification)

These constraints define quality standards. They can be deviated from only with explicit justification and awareness of the tradeoff.

### RULE 7: Context Before Instructions (Data-First Ordering)
**Rule:** In any well-formed prompt, context/background appears before instructions, which appear before the deliverable specification.
**Why it's a quality constraint:** Anthropic testing cited in source: up to 30% improvement in comprehension on complex inputs. Reversing order degrades output fidelity.
**Override condition:** Only if the prompt is so simple that ordering is irrelevant (single instruction with no context). Otherwise, maintain data-first ordering.

### RULE 8: Explicit Scope Boundaries (IS / IS NOT)
**Rule:** Every prompt that modifies files must explicitly state which files are in scope AND which are out of scope.
**Why it's a quality constraint:** Scope absence = implicit permission for overreach. Claude will act on anything it infers as in-scope unless boundaries are explicit.
**Override condition:** Only for prompts with trivially obvious scope (e.g., "write a single file with no other file interactions"). Still recommended even then.

### RULE 9: Negative Constraints Equal to Positive (Do NOT directives)
**Rule:** Every prompt must include at least one Do NOT directive addressing a domain-specific failure mode.
**Why it's a quality constraint:** Absence of negative constraints = implicit permission for all approaches. Negative constraints prevent specific failure modes; general positive requirements do not.
**Override condition:** Only for prompts with no known failure modes. This is rare — almost every domain has known anti-patterns.

### RULE 10: Sub-Agents Receive Complete Self-Contained Instructions
**Rule:** Sub-agent instructions must embed all necessary context — no references to "as discussed" or "prior analysis" or any implied shared context.
**Why it's a quality constraint:** Sub-agents do not share memory with parent agent. Any reference to prior context is invisible to the sub-agent and will cause hallucination or errors.
**Override condition:** None. Sub-agents always require self-contained instructions.

---

## TIER 3: PROCESS STANDARDS (Recommended — deviation reduces quality)

### RULE 11: Ideation Complete Before Prompt Formulation
**Standard:** Do not begin prompt formulation until all design decisions are locked (design_decisions.md equivalent complete).
**Consequence of deviation:** Prompts will contain implicit decisions that Claude must resolve, introducing uncertainty and increasing error rate.

### RULE 12: Context Files Written Before Stage 7 Begins
**Standard:** All context files for a project must exist in context/ before any Stage 7 session executes.
**Consequence of deviation:** Sub-agents will infer domain values that should have been pre-written, producing incorrect output.

### RULE 13: Over-Splitting Preferred to Under-Splitting
**Standard:** When uncertain about atomicity, split into smaller units.
**Consequence of deviation:** Under-split prompts risk truncation or combined errors that are harder to diagnose and correct.

---

## COMPLIANCE-WHILE-RESPONSIVE PATTERNS

When a user instruction appears to conflict with a Tier 1 rule, use this pattern:

1. **Acknowledge the request:** "I understand you want to [user's request]."
2. **Name the constraint:** "This conflicts with [Rule N] because [reason the rule exists]."
3. **Offer the compliant alternative:** "I can accomplish the same goal by [compliant approach]."
4. **Explain the consequence of violating:** "Without [the rule], the risk is [specific failure mode]."

**Example:**
> User: "Just add step 12 to the list and keep going."
> Response: "I understand you want to add step 12. Adding step IDs after initialization violates Rule 2 (pendingSteps fully populated at init) because any session that already ran may have made decisions based on the prior step count being final. To do this safely, I'll update state.json by inserting the new step ID in the correct position in pendingSteps, and update README.md with a new row. No sessions need to be re-run; the new step will be picked up at the correct execution point."

---

## INTEGRITY AUDIT

Before beginning Stage 7 execution, run this audit:

| Rule | Check | Pass Condition |
|---|---|---|
| Rule 1 | Is Stage 7 execution planned for fresh chats? | YES |
| Rule 2 | Are all step IDs in pendingSteps now? | YES — count matches total prompts |
| Rule 3 | Do all prompts contain verbatim hard constraints? | YES — spot-check 3 random prompts |
| Rule 4 | Does every Task section contain exactly one unit? | YES — each has one Verification sentence |
| Rule 5 | Do all prerequisites point backward (not forward)? | YES — traced all prerequisites |
| Rule 6 | Does every State Update section exist and is complete? | YES — all five mutation types accounted for |
