# Prompt 32: Write Chat Title Auto-Generation

## Prerequisites

state.json flags that must be true:
- `flags.chatArchitectureComplete` must be `true` (set by step-31-write-chat-crud-endpoints)

Context files to read before beginning:
- `context/app-copy-strings.md` — first chat title string

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write 2 files:

1. `risedial-production/lib/chat/title.ts` — exports `generateTitle(firstMessage: string): string`:
   - Truncates to 40 characters at word boundary (do not cut mid-word)
   - Strips special characters (keep alphanumeric, spaces, apostrophes, hyphens)
   - Capitalizes first letter
   - Returns the cleaned, truncated string

2. `risedial-production/app/api/chats/[chatId]/title/route.ts` — POST endpoint that:
   - Is auth-gated
   - Accepts `{ title: string }` in body
   - Validates: title must be non-empty, truncate to 40 chars
   - Updates the chat title in the database
   - Returns `{ success: true, title }`

Read `context/app-copy-strings.md` for the exact first chat title string ("Your first conversation").

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/chat/title.ts` exists with `generateTitle` export
- [ ] File `risedial-production/app/api/chats/[chatId]/title/route.ts` exists with POST handler
- [ ] `generateTitle` truncates at word boundary (not mid-word)
- [ ] `generateTitle` capitalizes first letter
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-32-write-chat-title-auto-generation"` to `completedSteps`
2. Remove `"step-32-write-chat-title-auto-generation"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/chat/title.ts"`, `"risedial-production/app/api/chats/[chatId]/title/route.ts"`
