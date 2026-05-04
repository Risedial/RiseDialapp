# Prompt 30: Write Chat Deletion with Memory Preservation

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-data-schema.md` — chats, messages, memory_profiles table columns

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write the DELETE handler in `risedial-production/app/api/chats/[chatId]/route.ts`. This file will be extended in step 31 with additional handlers — write only the DELETE handler now.

The DELETE handler must:
1. Be auth-gated (reads user from JWT cookie)
2. Verify the chat belongs to the requesting user
3. Soft-delete the chat: `UPDATE chats SET deleted_at = now() WHERE id = chatId AND user_id = userId`
4. Hard-delete all messages: `DELETE FROM messages WHERE chat_id = chatId`
5. Update the memory profile's `source_chats` jsonb array: for the entry with this chat_id, set its `deleted_at` field to the current timestamp (JSON PATCH operation on the jsonb column)
6. The memory profile's `profile_json` is NEVER modified — only `source_chats` is updated
7. Returns `{ success: true }`

Read `context/app-data-schema.md` for exact column names.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/chats/[chatId]/route.ts` exists with DELETE handler
- [ ] Soft-delete is used for chats (sets deleted_at, does not hard-delete)
- [ ] Hard-delete is used for messages
- [ ] memory_profiles.source_chats is updated with deleted_at timestamp
- [ ] memory_profiles.profile_json is NOT modified
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-30-write-chat-deletion-memory-preservation"` to `completedSteps`
2. Remove `"step-30-write-chat-deletion-memory-preservation"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/chats/[chatId]/route.ts"`
