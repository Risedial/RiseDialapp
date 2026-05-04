# Prompt 07: Write Rate Limit and Webhook Tables Schema

## Prerequisites

state.json flags that must be true:
- `flags.databaseSchemaWritten` must be `true` (set by step-04-write-users-table-schema)

Context files to read before beginning:
- `context/app-data-schema.md` — exact column names, types, constraints for rate_limit_tracking and webhook_events tables

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Append the `rate_limit_tracking` and `webhook_events` table CREATE TABLE statements to `risedial-production/supabase/migrations/001_initial_schema.sql`. Include all columns, types, constraints, and indexes. Every column name and type must match `context/app-data-schema.md` exactly.

rate_limit_tracking columns (exact):
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
window_start   timestamptz NOT NULL
message_count  integer NOT NULL DEFAULT 0
```

webhook_events columns (exact):
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
stripe_event_id text UNIQUE NOT NULL
event_type      text NOT NULL
processed_at    timestamptz NOT NULL DEFAULT now()
payload         jsonb NOT NULL
```

Include index on rate_limit_tracking(user_id, window_start).

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File contains CREATE TABLE rate_limit_tracking statement with all 4 columns
- [ ] File contains CREATE TABLE webhook_events statement with all 5 columns
- [ ] stripe_event_id has UNIQUE constraint for idempotency
- [ ] Index is defined on rate_limit_tracking(user_id, window_start)
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the appended SQL

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-07-write-rate-limit-webhook-tables-schema"` to `completedSteps`
2. Remove `"step-07-write-rate-limit-webhook-tables-schema"` from `pendingSteps`
