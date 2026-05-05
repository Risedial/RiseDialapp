# Sub-Prompt Schema Template
**Purpose:** Template for every atomic sub-prompt file in an orchestration directory
**File naming:** `prompt-NN.md` (zero-padded two-digit number)
**Date:** 2026-03-26

---

## USAGE INSTRUCTIONS

1. Copy this template for each atomic task in your orchestration plan
2. Replace ALL `[PLACEHOLDER]` values with specific content
3. Do NOT paraphrase Hard Constraints — copy them verbatim exactly as written below
4. The Task section must contain exactly ONE verifiable unit of work
5. Verification checks must be measurable and binary (pass/fail), not subjective

---

# Prompt [NN]: [Action Title in Imperative Form]

## Prerequisites

[List each prerequisite on its own line. For each prerequisite, specify its TYPE:]

state.json flags that must be true:
- `flags.[flagName]` must be `true` (set by step-[NN]-[name])

Files that must exist:
- `[exact/file/path.ext]` (created by Prompt [NN])

Context files to read before beginning (read these BEFORE executing Task):
- `context/[filename].[ext]`
- `context/[filename].[ext]`

[If no prerequisites of any type, write exactly:]
none

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

[Single, unambiguous instruction. Requirements:]
- One action only — no compound verbs ("build and then test" = two tasks)
- Imperative form — starts with a verb: "Write", "Create", "Initialize", "Validate"
- No implicit scope — name every file explicitly
- No undefined references — all terms defined in this prompt or in listed context files
- No "as discussed" or "as above" — this session has no prior context

[Example format:]
Write `[exact/output/path/filename.ext]` containing [specific content description].
Read context/[relevant-file].md for all [domain-specific] values.
Every [value type] must match context/[relevant-file].md exactly.

---

## Verification

[List measurable, binary checks. Each check must be answerable with YES or NO.]
[Minimum 1 check; recommended 2–4 checks.]
[Use objective, countable criteria — NOT "looks correct" or "seems complete".]

Before updating state.json, confirm ALL of the following:

- [ ] File `[exact/path/filename.ext]` exists
- [ ] File contains exactly [N] entries / [N] lines / [N] sections
- [ ] All values match those specified in `context/[filename].[ext]`
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file
- [ ] [Domain-specific check: e.g., "JSON is valid and parseable"]
- [ ] [Domain-specific check: e.g., "All CSS custom properties are defined in :root {}"]

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `state.json` after all Verification checks pass:

1. Append `"[step-NN-descriptive-name]"` to `completedSteps`
2. Remove `"[step-NN-descriptive-name]"` from `pendingSteps`
3. [If this step sets a prerequisite flag] Set `flags.[flagName]` to `true`
4. [If this step produces countable data items] Increment `artifacts.itemCount` by [N]
5. [If this step writes files] Append to `artifacts.filesWritten`:
   - `"[exact/path/filename1.ext]"`
   - `"[exact/path/filename2.ext]"`
6. [If this step writes data by category] Set `dataChunks.[categoryName].[key]` to `[value]`

[Remove any inapplicable lines 3–6 from the actual prompt file.]

---

## TEMPLATE NOTES (Remove from actual file)

**Atomicity test:** If you can write a single sentence in the Verification section for this prompt → likely atomic. If you need multiple unrelated sentences → it needs splitting.

**Prerequisite validation:** For every file or flag listed in Prerequisites, confirm:
- The creating step has a LOWER prompt number than this prompt
- No circular dependencies exist

**State Update completeness:** Every promise in Verification should be mirrored in State Update (if it produces countable output, increment the counter; if it writes files, list them).
