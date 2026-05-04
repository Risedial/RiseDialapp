# Prompt 02: Write Database Schema Migration

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/supabase/migrations/001_initial_schema.sql` — a skeleton migration file containing:

1. A migration header comment with the migration name and date
2. All 6 table names as SQL comments: `-- users`, `-- chats`, `-- messages`, `-- memory_profiles`, `-- rate_limit_tracking`, `-- webhook_events`
3. A note that detailed per-table CREATE TABLE statements are appended by steps 04–07

Do NOT write the full CREATE TABLE statements — those are written in steps 04–07.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/supabase/migrations/001_initial_schema.sql` exists
- [ ] File contains exactly 6 table name comments
- [ ] File does NOT contain any CREATE TABLE statements
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-02-write-database-schema-migration"` to `completedSteps`
2. Remove `"step-02-write-database-schema-migration"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/supabase/migrations/001_initial_schema.sql"`
