# Prompt 21: Write Rolling Context Window Algorithm

## Prerequisites

state.json flags that must be true:
- `flags.riseSystemPromptWritten` must be `true` (set by step-20-write-rise-system-prompt-module)

Context files to read before beginning:
- `context/app-rise-system.md` — API message structure
- `context/app-openai-config.md` — rolling window parameters (40 pairs max, 12,000 tokens max)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/rise/context-window.ts` — exports `buildMessageWindow(messages: Message[], maxPairs: number = 40, maxTokens: number = 12000): Message[]`.

The function must:
1. Accept an array of messages (alternating user/assistant pairs)
2. Count tokens using the approximation: 4 characters = 1 token (sum all content lengths)
3. Start with the most recent messages and work backwards
4. Drop oldest pairs first when either limit is hit (40 pairs OR 12,000 tokens)
5. Return messages in chronological order (oldest first in result array)
6. Define a `Message` interface/type: `{ role: 'user' | 'assistant', content: string }`

Read `context/app-openai-config.md` for the exact token approximation and window limits.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/rise/context-window.ts` exists
- [ ] `buildMessageWindow` is exported
- [ ] Token approximation is `content.length / 4` (4 chars = 1 token)
- [ ] Both the 40-pair limit and 12,000-token limit are enforced (whichever first)
- [ ] Result is returned in chronological order
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-21-write-rolling-context-window-algorithm"` to `completedSteps`
2. Remove `"step-21-write-rolling-context-window-algorithm"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/rise/context-window.ts"`
