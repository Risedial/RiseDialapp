# Prompt 05: Write Chats and Messages Tables Schema

## Prerequisites

state.json flags that must be true:
- `flags.databaseSchemaWritten` must be `true` (set by step-04-write-users-table-schema)

Context files to read before beginning:
- `context/app-data-schema.md` — exact column names, types, constraints for chats and messages tables

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Append the `chats` and `messages` table CREATE TABLE statements to `risedial-production/supabase/migrations/001_initial_schema.sql`. Include all columns, types, constraints, foreign keys, indexes, and RLS policies for both tables. Every column name and type must match `context/app-data-schema.md` exactly.

chats columns (exact):
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
title       varchar(40) NOT NULL
created_at  timestamptz NOT NULL DEFAULT now()
deleted_at  timestamptz NULL
```

messages columns (exact):
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
chat_id             uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE
role                text NOT NULL CHECK (role IN ('user', 'assistant'))
content             text NOT NULL
created_at          timestamptz NOT NULL DEFAULT now()
user_message_index  integer NULL
```

Include indexes on: chats(user_id), chats(deleted_at), messages(chat_id), messages(user_message_index).
Include RLS for both tables: users can only access their own chats and messages.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File contains CREATE TABLE chats statement with all 5 columns
- [ ] File contains CREATE TABLE messages statement with all 6 columns
- [ ] Foreign key constraints are present on both tables
- [ ] Indexes are defined for the columns listed above
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the appended SQL

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-05-write-chats-messages-tables-schema"` to `completedSteps`
2. Remove `"step-05-write-chats-messages-tables-schema"` from `pendingSteps`
