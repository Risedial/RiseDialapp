# Prompt File Schema

Every prompt file follows this schema exactly. No exceptions.

---

## Canonical prompt file schema

```
# Prompt NN: [Title]
**Mode:** COLLECT | PLAN | EXECUTE
**Step ID:** [step-NN-mode-task]

## Prerequisites
[State flags required — e.g., "flags.domainVerified = true in STATE_FILE"]
[Files to read before starting — listed with absolute paths]
[Or: "None. This is the first step."]

---

## Hard Constraints

1. **Mode lock — [MODE]:** Write only to [CONTEXT_DIR | PLANS_DIR | app code] — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **[EXECUTE only] Verification gate:** Run `[VERIFICATION_GATE]` after writing. Fix all errors. Step cannot complete with errors.
6. **Anti-hallucination:** All identifiers (names, paths, signatures) must be confirmed from actual file read or context files — not from memory.

STATE_FILE = [absolute path]
[CONTEXT_DIR or PLANS_DIR] = [absolute path]

---

## Task

[Numbered sub-steps. Each sub-step has one concrete action.]
[EXECUTE: Step 1 is always "Verify plan file exists — if not, stop and report."]
[EXECUTE: Step 2 is always "Read plan file. Note exact before/after state."]
[EXECUTE: Step 3 is always "Read source file. Confirm it matches plan's Before state exactly — if not, stop and report."]

---

## Verification
- [ ] [Specific binary assertion — file exists, line contains exact text, etc.]
- [ ] [EXECUTE only] `[VERIFICATION_GATE]` exits with code 0

---

## State Update
After all verification checks pass:
1. [Set flag — exact field name, exact value]
2. Move `"[step-id]"` from `pendingSteps` to `completedSteps`
3. [Append artifact path to artifacts.filesWritten or artifacts.plansCreated]
4. Write STATE_FILE back with these changes (preserve all other fields exactly)
```

---

## EXECUTE-specific rules (apply to every EXECUTE prompt)

- Task section step 1: ALWAYS "Verify plan file [path] exists in PLANS_DIR. If not found: stop and report 'Plan file missing — cannot execute without verified plan.'"
- Task section step 2: ALWAYS "Read the plan file. Record exact Before state and After state."
- Task section step 3: ALWAYS "Read the target source file. Confirm it matches plan's Before state character-for-character. If it does not match: stop and report the discrepancy — do not attempt to resolve it."
- DO NOT TOUCH: list PROTECTED_FILES explicitly in Hard Constraints

## Verification rule

Every item in the Verification section must be a binary assertion with an exact expected value. Forbidden words: "correct", "appropriate", "looks", "seems", "valid" (unless followed by an exact criterion).

## State Update rule

State Update section is always the LAST section. The state.json write is the last action of the step.
