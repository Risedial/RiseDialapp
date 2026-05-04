# Prompt 22: Write OpenAI API Message Constructor

## Prerequisites

state.json flags that must be true:
- `flags.riseSystemPromptWritten` must be `true` (set by step-20-write-rise-system-prompt-module)

Context files to read before beginning:
- `context/app-rise-system.md` — exact API message structure (3-message format)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/rise/api-messages.ts` — exports `buildApiMessages(systemPrompt: string, memoryProfile: object | null, conversationWindow: Message[]): object[]`.

The function must construct the message array in EXACTLY this order (from context/app-rise-system.md):
1. `{ role: 'system', content: systemPrompt }` — always present
2. `{ role: 'system', content: 'User context profile: ' + JSON.stringify(memoryProfile) }` — OMITTED ENTIRELY (not null, not empty string) if memoryProfile is null
3. All messages from conversationWindow as alternating user/assistant pairs

NEVER concatenate messages into a text blob. Each message is a separate object in the array.

Read `context/app-rise-system.md` for the exact message structure and memory profile injection format.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/rise/api-messages.ts` exists
- [ ] `buildApiMessages` is exported
- [ ] When memoryProfile is null, the memory profile message is OMITTED ENTIRELY (array has no null entry)
- [ ] Messages are separate objects, not concatenated into a single text blob
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-22-write-openai-api-message-constructor"` to `completedSteps`
2. Remove `"step-22-write-openai-api-message-constructor"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/rise/api-messages.ts"`
