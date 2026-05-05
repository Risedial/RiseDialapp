# Execution Plan: Context Files, Sequential Execution & Completion (Stages 6–8)
**Covers:** Outcomes 04, 05, 06, 10 — Context files, state threading, execution loop, build completion
**Date:** 2026-03-26
**Step:** 02 — Reverse-Engineering Pass

---

## MINIMUM CONTEXT TO EXECUTE

- `design_decisions.md` specification document — source of exact values for context files
- Completed orchestration package from Stage 5 (`state.json`, `README.md`, all `prompt-NN.md`)
- File write capability to `context/` directory
- Understanding of domain knowledge required by sub-agents

---

## STAGE 6: CONTEXT FILE WRITING

### Decision: Does a context file need to be created?

```
Is this a piece of domain knowledge that:
  (a) Is too large to embed repeatedly in each prompt?  → YES: Create context file
  (b) Is immutable during implementation phase?          → YES: Create context file
  (c) Is referenced by multiple sub-agents?              → YES: Create context file
  (d) Is domain-specific enough Claude would infer it?  → YES: Create context file

Is this task-specific knowledge used only once?
  → Embed in the prompt directly. Do not create a context file.
```

### Step Sequence: Writing Context Files

#### Step 1: Inventory Required Domain Knowledge
- **What to open:** `design_decisions.md` specification, `refined-prompt.md`, all `prompt-NN.md` prerequisites
- **What to do:** For each sub-agent that will execute, list every piece of domain knowledge it needs that it cannot reliably reconstruct from its prompt alone
- **Categories to check:**
  - Exact color hex codes, spacing values, easing curves → `design-tokens.css`
  - Complete data enumeration with canonical IDs → `data-inventory.md`
  - Navigation state machine semantics, architecture definitions → `app-architecture.md`
  - Component DOM structure, touch targets, component library → `ui-design-system.md`
  - Service worker lifecycle, manifest requirements → `pwa-technical.md`
  - CSS section ordering, JS initialization sequence → `build-manifest.md`
- **What to expect:** Complete list of context files needed with their content sources

#### Step 2: Apply Naming Convention
- **Format:** `[domain-prefix]-[descriptor].[type]`
- **Domain prefixes:** `app-` (application structure), `build-` (assembly/construction), `data-` (inventory/catalogs), `ui-` (interface specs), `pwa-` (PWA infrastructure)
- **Descriptor types:** `-architecture`, `-manifest`, `-inventory`, `-design-system`, `-technical`, `.css`
- **Examples:** `design-tokens.css`, `data-inventory.md`, `app-architecture.md`
- **What to expect:** All filenames chosen before writing begins

#### Step 3: Write Context Files in Dependency Order
- **Dependency order (write upstream files first):**
  1. `data-inventory.md` + `design-tokens.css` (data layer — upstream)
  2. `app-architecture.md` + `ui-design-system.md` (structure layer — mid)
  3. `pwa-technical.md` + `build-manifest.md` (build layer — downstream)
- **Why order matters:** Architecture files reference data files. Build files reference all others. Writing in order lets you cross-reference earlier files as you write later ones.
- **What to expect:** All context files in `context/` directory

#### Step 4: Apply Context File Structure Requirements
- **For each file, ensure:**
  - Copy-paste-ready code blocks for any code content
  - Exact values throughout — no approximations, no ranges where exact values are known
  - Critical information redundantly present (insurance for isolated sub-agent access)
  - Immutability header: note that this file is authoritative and immutable during implementation
- **Redundancy rule:** If a sub-agent loading ONLY this file would fail without a critical piece of information from another file → repeat that information in this file.

#### Step 5: Update Prompt Prerequisites
- **What to do:** Go through each `prompt-NN.md` Prerequisites section. Verify every context file it needs is explicitly listed by name.
- **Rule:** Context files are not automatically loaded. If the prompt doesn't name it, the sub-agent won't load it.
- **What to expect:** Every prompt that uses domain knowledge has an explicit "Read these context files before beginning:" instruction in its Task section.

---

## STAGE 7: SEQUENTIAL EXECUTION

### Per-Session Protocol (Every Session Without Exception)

#### Session Start
1. Open fresh Claude Code session — no prior context
2. Navigate to orchestration directory
3. Read `state.json` in full
4. Locate your assigned step ID in `pendingSteps`
   - **If found:** Proceed to execution
   - **If NOT found:** STOP. Do not execute. Either already complete or state inconsistent. Check `completedSteps`.
5. Read all context files listed in prompt's Prerequisites section

#### Session Execution
6. Execute the single Task in the prompt — exactly one action
7. Do not deviate from the Task section
8. Do not perform adjacent tasks, cleanup, or optimization not in the Task
9. If sub-agents are spawned (PARALLEL prompt): spawn them with complete self-contained instructions — no references to "as discussed above"

#### Session End
10. Run every check in the Verification section
    - **All checks pass:** Proceed to state update
    - **Any check fails:** Fix the issue. Re-run verification. Do not update state until all pass.
11. Perform State Update mutations to `state.json`:
    - Append step ID to `completedSteps`
    - Remove step ID from `pendingSteps`
    - Set any applicable flags to `true`
    - Increment any applicable `artifacts.itemCount`
    - Append any written file paths to `artifacts.filesWritten`
    - Set any applicable `dataChunks` values
12. Exit session.

### Decision Trees During Execution

#### Decision: What if verification fails?
```
Run verification check → FAIL

  Can I fix the issue within this session?
    → YES: Fix it. Re-run verification. If it passes → update state → exit.
    → NO: proceed

  Is the issue a missing prerequisite from a prior step?
    → YES: STOP. Do not update state. Check prior step's completedSteps entry.
           Re-run prior step if it didn't complete properly.
    → NO: proceed

  Is the issue an output that exceeded 32K tokens and truncated?
    → YES: This prompt needs to be split. Stop. Go back to Stage 5.
           Split this prompt into two atomic prompts. Re-initialize state.json with new step IDs.
    → NO: Fix the specific issue and re-verify.
```

#### Decision: How to handle parallel sub-agents?
```
This prompt is designated PARALLEL in README.

  Spawn each sub-agent with:
    - Task statement: one action, imperative form, self-contained
    - Complete context: all necessary info embedded — no references to "prior" context
    - Read scope: explicit list of context files it may read
    - Write scope: explicit list of files it may write
    - Verification condition: binary check for completion
    - Report back: what to return to parent agent

  When all sub-agents complete:
    - Collect outputs
    - Combine as specified in parent prompt
    - If two sub-agents report conflicting findings → preserve both, note discrepancy
    - Write aggregated result
    - Run parent Verification section
    - Update state.json from parent session
```

#### Decision: What if state.json seems inconsistent?
```
The step I'm supposed to execute is NOT in pendingSteps.
  AND it's NOT in completedSteps.

  → State file may be corrupted. Do NOT proceed.
  → Alert user. Manual inspection of state.json required.

The step IS in completedSteps.
  → This step was already executed successfully.
  → Do NOT re-execute. Proceed to next pending step.

The step IS in pendingSteps.
  → Proceed normally.
```

---

## STAGE 8: COMPLETION VERIFICATION

### When Execution Loop Ends

#### Step 1: Confirm Completion Criteria
- **What to check:**
  - `state.json.pendingSteps` is empty (length = 0)
  - `state.json.completedSteps` contains all expected step IDs
  - `state.json.completedSteps` count matches original `pendingSteps` count
- **Decision point:** If any step ID is missing from `completedSteps` → that step did not complete → re-run it.

#### Step 2: Verify Data Integrity
- **What to do:** Compare actual counts against expected counts:
  - `artifacts.itemCount` vs. expected total from `data-inventory.md`
  - `dataChunks` keys vs. expected categories
  - `artifacts.filesWritten` vs. expected file list from README
- **Decision point:** Count mismatch → identify which batch prompt under-wrote → re-run that prompt.

#### Step 3: Produce Final Chat Report
- **What to produce:** Chat report enumerating all artifacts
  ```
  Build complete.

  [orchestration-dir]/ contents:
    state.json           — [N] steps completed
    README.md            — [N] prompts executed
    prompt-01.md...      — [executed]

  [buildTarget]/ contents:
    [list all created files]

  Data coverage:
    [category1]: [actual count]/[expected count]
    [category2]: [actual count]/[expected count]

  Completion confirmed: completedSteps = [N], pendingSteps = []
  ```
- **What to expect:** User has a complete inventory of what was built and data integrity confirmation.

---

## STATE THREADING REFERENCE

Information passes between sessions via three mechanisms only:

| Mechanism | What It Carries | Who Writes | Who Reads |
|---|---|---|---|
| `state.json` | Completion status, flags, counters, data chunk keys | Every session (at end) | Every session (at start) |
| Written files | Application files, CSS, JS, data files | The session that wrote them | Sub-agents whose Prerequisites list them |
| Embedded context in prompt | All task-specific knowledge | Stage 5 (when prompt was written) | The session executing that prompt |

**Nothing else is shared between sessions.** Conversation history is excluded from the architecture by design.

---

## FAILURE MODE RECOVERY PROTOCOLS

### Failure: State not updated after a session
- **Symptom:** Next session attempts same step. No error on prior step.
- **Detection:** Step ID appears in both `completedSteps` AND `pendingSteps` (impossible state) OR step ID in `pendingSteps` but you know it executed.
- **Recovery:**
  1. Manually edit `state.json`: append step ID to `completedSteps`, remove from `pendingSteps`
  2. Verify artifacts from that session actually exist on disk
  3. Proceed to next step

### Failure: Context file not loaded by sub-agent
- **Symptom:** Sub-agent output has incorrect values, wrong colors, missing entries.
- **Detection:** Compare output against context file — values diverge.
- **Recovery:**
  1. Edit the prompt's Task section to explicitly add: "Read context/[file].md before beginning. All values must match this file exactly."
  2. Re-run the session. New session loads context file and corrects values.
  3. Check all sibling prompts for same omission.

### Failure: Step exceeds 32K token limit mid-execution
- **Symptom:** Output truncated. Task not complete.
- **Detection:** Response ends mid-task; no Verification or State Update executed.
- **Recovery:**
  1. State.json was not updated → step remains in `pendingSteps`
  2. Return to Stage 5: split this one prompt into two atomic prompts
  3. Insert both new step IDs into `pendingSteps` at the position of the original step
  4. Remove original step ID from `pendingSteps`
  5. Write the two new prompt files
  6. Update README.md to add new rows
  7. Continue sequential execution from the first new split step
