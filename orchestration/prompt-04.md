# Prompt 04: Write Users Table Schema

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

Context files to read before beginning:
- `context/app-data-schema.md` — exact column names, types, and constraints for the users table

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Append the complete `users` table CREATE TABLE statement to `risedial-production/supabase/migrations/001_initial_schema.sql`. Include all columns with exact names and types from `context/app-data-schema.md`, all constraints, and RLS policies (enable RLS, policy for users to read/update their own row). Every column name and type must match `context/app-data-schema.md` exactly.

The users table columns (exact):
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
email                   text UNIQUE NOT NULL
password_hash           text NOT NULL
preferred_name          varchar(30) NULL
subscription_status     text NOT NULL CHECK (subscription_status IN ('active', 'lapsed', 'cancelled'))
stripe_customer_id      text NULL
stripe_subscription_id  text NULL
stripe_premium_item_id  text NULL
plan_type               text NULL CHECK (plan_type IN ('monthly', 'annual'))
has_premium_memory      boolean NOT NULL DEFAULT false
next_billing_date       timestamptz NULL
subscription_lapsed_at  timestamptz NULL
created_at              timestamptz NOT NULL DEFAULT now()
```

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/supabase/migrations/001_initial_schema.sql` contains a CREATE TABLE users statement
- [ ] All 13 column definitions are present with correct names and types
- [ ] RLS is enabled on the users table
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the appended SQL

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-04-write-users-table-schema"` to `completedSteps`
2. Remove `"step-04-write-users-table-schema"` from `pendingSteps`
3. Set `flags.databaseSchemaWritten` to `true`
