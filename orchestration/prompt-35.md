# Prompt 35: Write New User Initialization Flow

## Prerequisites

state.json flags that must be true:
- `flags.chatArchitectureComplete` must be `true` (set by step-31-write-chat-crud-endpoints)

Context files to read before beginning:
- `context/app-copy-strings.md` — first chat title, first-ever opening message
- `context/app-data-schema.md` — users and chats table columns

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/user/onboarding.ts` — exports 2 functions:

1. `initializeNewUser(userId: string): Promise<{ chatId: string }>`:
   - Creates first chat titled `"Your first conversation"` (exact from context/app-copy-strings.md)
   - Stores Rise's first-ever-chat opening message as the first assistant message in the database (role='assistant', user_message_index=null)
   - Returns `{ chatId }` of the new chat

2. `setPreferredName(userId: string, name: string): Promise<{ success: boolean }>`:
   - Validates: name must be ≤ 30 characters (server-side)
   - Updates `preferred_name` in users table
   - Returns `{ success: true }` on success
   - Returns `{ success: false, error: "Name must be 30 characters or fewer." }` on validation failure
   - Never exposes DB errors

Read `context/app-copy-strings.md` for the exact first chat title and opening message strings.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/user/onboarding.ts` exists
- [ ] `initializeNewUser` is exported and creates chat titled "Your first conversation"
- [ ] `setPreferredName` is exported with 30-char validation
- [ ] Opening message is stored as assistant message in DB
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-35-write-new-user-initialization-flow"` to `completedSteps`
2. Remove `"step-35-write-new-user-initialization-flow"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/user/onboarding.ts"`
