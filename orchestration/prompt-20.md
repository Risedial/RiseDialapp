# Prompt 20: Write Rise System Prompt Module

## Prerequisites

Context files to read before beginning:
- `context/app-rise-system.md` — frozen Rise system prompt (verbatim), preferred name injection format

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/rise/system-prompt.ts`. Read `context/app-rise-system.md` to get the frozen Rise system prompt content. Copy the system prompt string BYTE-FOR-BYTE into a TypeScript `const` export named `RISE_SYSTEM_PROMPT`. Also export `buildSystemMessage(preferredName: string | null): string` which returns the system prompt — if preferredName is set, appends the exact preferred name context line from `context/app-rise-system.md` after a newline. If no preferred name, returns prompt string alone.

CRITICAL: The `RISE_SYSTEM_PROMPT` const must be IDENTICAL to the source in `context/app-rise-system.md` — no paraphrasing, no reordering, no modification of any kind. Verify character-for-character after writing.

The preferred name context line (exact, from design_decisions.md):
`[User context: The user's preferred name is {name}. Use it naturally and sparingly — only when it adds warmth or specificity. Never use it gratuitously.]`

When preferredName is set, replace `{name}` with the actual name value.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/rise/system-prompt.ts` exists
- [ ] `RISE_SYSTEM_PROMPT` is exported as a const string
- [ ] `buildSystemMessage` function is exported
- [ ] The const string matches the system prompt in `context/app-rise-system.md` character-for-character
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-20-write-rise-system-prompt-module"` to `completedSteps`
2. Remove `"step-20-write-rise-system-prompt-module"` from `pendingSteps`
3. Set `flags.riseSystemPromptWritten` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/lib/rise/system-prompt.ts"`
