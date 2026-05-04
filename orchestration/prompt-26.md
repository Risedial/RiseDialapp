# Prompt 26: Write Memory Compression Trigger

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-data-schema.md` — messages table (user_message_index column)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/memory/trigger.ts` — exports `checkCompressionTrigger(chatId: string, userId: string): Promise<{ shouldCompress: boolean, isInitial: boolean, isPatch: boolean }>`.

The function must:
1. Count user messages in the chat using the `user_message_index` column (count only role='user' messages)
2. Apply these exact trigger rules:
   - Initial trigger: `count === 50` → `{ shouldCompress: true, isInitial: true, isPatch: false }`
   - Patch trigger: `count > 50 AND (count - 50) % 10 === 0` → `{ shouldCompress: true, isInitial: false, isPatch: true }`
   - No trigger: `{ shouldCompress: false, isInitial: false, isPatch: false }`

Read `context/app-data-schema.md` for messages table column names.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/memory/trigger.ts` exists
- [ ] `checkCompressionTrigger` is exported
- [ ] Initial trigger is at count === 50
- [ ] Patch trigger is at (count - 50) % 10 === 0 AND count > 50
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-26-write-memory-compression-trigger"` to `completedSteps`
2. Remove `"step-26-write-memory-compression-trigger"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/memory/trigger.ts"`
