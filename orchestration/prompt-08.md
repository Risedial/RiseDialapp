# Prompt 08: Write Supabase Client Utilities

## Prerequisites

state.json flags that must be true:
- `flags.databaseSchemaWritten` must be `true` (set by step-04-write-users-table-schema)

Context files to read before beginning:
- `context/app-architecture.md` — Supabase client usage patterns (server.ts vs client.ts)
- `context/app-data-schema.md` — table/column names for typed query helpers

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write the following 6 utility files to `risedial-production/lib/`:

1. `lib/supabase/server.ts` — creates and exports the Supabase service role client using SUPABASE_SERVICE_ROLE_KEY. Used in all API routes.
2. `lib/supabase/client.ts` — creates and exports the Supabase anon client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Used in client components.
3. `lib/db/users.ts` — exports typed query helpers: `getUserById(id: string)`, `getUserByEmail(email: string)`, `createUser(data)`, `updateUser(id: string, data)`. Uses server client.
4. `lib/db/chats.ts` — exports: `getChatsByUserId(userId: string)` (excludes deleted), `getChatById(id: string)`, `createChat(userId: string, title: string)`, `softDeleteChat(id: string)`. Uses server client.
5. `lib/db/messages.ts` — exports: `getMessagesByChatId(chatId: string, limit?: number)`, `createMessage(chatId: string, role: string, content: string, userMessageIndex?: number)`, `deleteMessagesByChatId(chatId: string)`, `countUserMessagesByChatId(chatId: string)`. Uses server client.
6. `lib/db/memory.ts` — exports: `getMemoryProfileByUserId(userId: string)`, `createMemoryProfile(userId: string, profileJson: object, modelUsed: string)`, `updateMemoryProfile(userId: string, profileJson: object, modelUsed: string)`. Uses server client.

All functions return typed results. Use TypeScript throughout.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/supabase/server.ts` exists
- [ ] File `risedial-production/lib/supabase/client.ts` exists
- [ ] File `risedial-production/lib/db/users.ts` exists with all 4 exports
- [ ] File `risedial-production/lib/db/chats.ts` exists with all 4 exports
- [ ] File `risedial-production/lib/db/messages.ts` exists with all 4 exports
- [ ] File `risedial-production/lib/db/memory.ts` exists with all 3 exports
- [ ] No `// ... more`, ellipses, or placeholder comments appear in any file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-08-write-supabase-client-utilities"` to `completedSteps`
2. Remove `"step-08-write-supabase-client-utilities"` from `pendingSteps`
3. Set `flags.supabaseClientReady` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/lib/supabase/server.ts"`, `"risedial-production/lib/supabase/client.ts"`, `"risedial-production/lib/db/users.ts"`, `"risedial-production/lib/db/chats.ts"`, `"risedial-production/lib/db/messages.ts"`, `"risedial-production/lib/db/memory.ts"`
