# Prompt 06: Write Memory Profiles Table Schema

## Prerequisites

state.json flags that must be true:
- `flags.databaseSchemaWritten` must be `true` (set by step-04-write-users-table-schema)

Context files to read before beginning:
- `context/app-data-schema.md` — exact column names, types, constraints for memory_profiles table

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Append the `memory_profiles` table CREATE TABLE statement to `risedial-production/supabase/migrations/001_initial_schema.sql`. Include all columns, types, constraints, and RLS policies. Every column name and type must match `context/app-data-schema.md` exactly.

memory_profiles columns (exact):
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
profile_json    jsonb NOT NULL
source_chats    jsonb NOT NULL DEFAULT '[]'
version         integer NOT NULL DEFAULT 1
generated_at    timestamptz NOT NULL DEFAULT now()
last_updated_at timestamptz NOT NULL DEFAULT now()
model_used      varchar(50) NOT NULL
```

Include RLS: users can only read their own memory profile.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File contains CREATE TABLE memory_profiles statement with all 8 columns
- [ ] UNIQUE constraint is on user_id (one profile per user)
- [ ] source_chats defaults to empty JSON array `'[]'`
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the appended SQL

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-06-write-memory-profiles-table-schema"` to `completedSteps`
2. Remove `"step-06-write-memory-profiles-table-schema"` from `pendingSteps`
