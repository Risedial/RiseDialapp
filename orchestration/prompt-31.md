# Prompt 31: Write Chat CRUD Endpoints

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-architecture.md` — API routes, auth gate pattern
- `context/app-data-schema.md` — chats and messages table columns

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write 2 files and extend 1 existing file:

1. `risedial-production/app/api/chats/route.ts`:
   - GET handler: returns list of user's non-deleted chats ordered by most recent message timestamp (descending), auth-gated. Returns `{ chats: [{ id, title, created_at, last_message_at }] }`
   - POST handler: creates new chat with placeholder title "New conversation", returns `{ chat: { id, title, created_at } }`. Auth-gated.

2. `risedial-production/app/api/chats/[chatId]/messages/route.ts`:
   - GET handler: returns paginated messages for a chat, newest first. Query params: `limit` (default 50), `before` (cursor). Auth-gated. Verifies chat belongs to user. Returns `{ messages: [{ id, role, content, created_at }], hasMore: boolean }`

3. Extend `risedial-production/app/api/chats/[chatId]/route.ts` (created in step 30 with DELETE handler): add any missing handlers if needed. Do not overwrite the DELETE handler.

Read `context/app-architecture.md` for route paths and auth pattern.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/chats/route.ts` exists with GET and POST handlers
- [ ] File `risedial-production/app/api/chats/[chatId]/messages/route.ts` exists with GET handler
- [ ] GET /api/chats filters out deleted chats
- [ ] GET /api/chats/[chatId]/messages supports pagination
- [ ] DELETE handler from step 30 is preserved in [chatId]/route.ts
- [ ] No `// ... more`, ellipses, or placeholder comments appear in any file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-31-write-chat-crud-endpoints"` to `completedSteps`
2. Remove `"step-31-write-chat-crud-endpoints"` from `pendingSteps`
3. Set `flags.chatArchitectureComplete` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/app/api/chats/route.ts"`, `"risedial-production/app/api/chats/[chatId]/messages/route.ts"`
