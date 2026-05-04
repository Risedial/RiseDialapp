# Prompt 33: Write Rise Opening Message Logic

## Prerequisites

Context files to read before beginning:
- `context/app-copy-strings.md` — exact opening message strings and name injection rule
- `context/app-rise-system.md` — confirms opening message is stored as assistant message in DB

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/rise/opening-message.ts` — exports `getOpeningMessage(isFirstEverChat: boolean, preferredName: string | null): string`.

The function must use these EXACT strings from `context/app-copy-strings.md`:

First-ever chat opening message:
`Hello{name}. I'm Rise. I'm here to think with you — not to judge, validate, or push you anywhere. Just to reflect back what you actually mean, when you're ready to look at it. What's on your mind?`

Subsequent new chats opening message:
`Welcome back{name}. I still remember where we left off. What's worth looking at today?`

Name injection rule (exact from design_decisions.md):
- `{name}` → `, [PreferredName]` if preferred name is set (comma + space + name)
- `{name}` → `` (empty string, no gap) if no preferred name set

Example: if preferredName = "Alex", first chat becomes:
`Hello, Alex. I'm Rise. I'm here to think with you...`

Read `context/app-copy-strings.md` for the exact strings — do not paraphrase.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/rise/opening-message.ts` exists
- [ ] `getOpeningMessage` is exported
- [ ] First-ever chat message matches exactly: starts with "Hello{name}."
- [ ] Subsequent message matches exactly: starts with "Welcome back{name}."
- [ ] When no preferred name, `{name}` is replaced with empty string (no visible gap)
- [ ] When preferred name is set, `{name}` is replaced with `, [name]` (comma + space + name)
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-33-write-rise-opening-message-logic"` to `completedSteps`
2. Remove `"step-33-write-rise-opening-message-logic"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/rise/opening-message.ts"`
