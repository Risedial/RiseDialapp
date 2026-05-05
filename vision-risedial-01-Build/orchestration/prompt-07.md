# Step 07: M3-E — Fix E: Add atomic rate-limit SQL migration

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-07" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-07"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix E from Module 3: Create `supabase/migrations/002_atomic_rate_limit.sql` defining the `increment_message_count` PostgreSQL function.

Key values from context (do NOT invent):
- Migration file path: `supabase/migrations/002_atomic_rate_limit.sql` (from data-schema.md `migration_file_002`)
- RPC function name: `increment_message_count` (from data-schema.md)
- RPC parameter: `p_user_id uuid` (from data-schema.md `rpc:increment_message_count.param`)
- Table: `rate_limit_tracking` (from data-schema.md)
- Window duration: 60 minutes (from data-schema.md `rate_limit_window_minutes`)
- First migration: `supabase/migrations/001_initial_schema.sql` — do NOT modify it

**Sub-step 1 — Check existing schema for unique constraint:**
Read `C:\Users\Alexb\Documents\RiseDialapp\supabase\migrations\001_initial_schema.sql` to determine whether `rate_limit_tracking.user_id` has a UNIQUE constraint. If it does not, the migration must add one before the function definition.

**Sub-step 2 — Create the new migration file:**
Create `C:\Users\Alexb\Documents\RiseDialapp\supabase\migrations\002_atomic_rate_limit.sql` with this content:

```sql
-- Migration: 002_atomic_rate_limit
-- Date: 2026-05-04
-- Description: Adds increment_message_count RPC function for atomic rate-limit tracking.
--              Replaces the read-modify-write pattern in lib/rise/rate-limit.ts with
--              a single atomic upsert, preventing double-counting under concurrent requests.

CREATE OR REPLACE FUNCTION increment_message_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_cutoff timestamptz := now() - interval '60 minutes';
BEGIN
  -- Atomically insert a new window row or increment the existing one.
  -- A "current" window is one whose window_start is within the last 60 minutes.
  INSERT INTO rate_limit_tracking (user_id, window_start, message_count)
  VALUES (p_user_id, now(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    message_count = CASE
      WHEN rate_limit_tracking.window_start >= v_window_cutoff
        THEN rate_limit_tracking.message_count + 1
      ELSE 1
    END,
    window_start = CASE
      WHEN rate_limit_tracking.window_start >= v_window_cutoff
        THEN rate_limit_tracking.window_start
      ELSE now()
    END
  WHERE rate_limit_tracking.user_id = p_user_id;
END;
$$;
```

If the 001_initial_schema.sql check in sub-step 1 reveals that `rate_limit_tracking.user_id` does NOT have a UNIQUE constraint, prepend this statement before the function:
```sql
ALTER TABLE rate_limit_tracking ADD CONSTRAINT rate_limit_tracking_user_id_key UNIQUE (user_id);
```

Do NOT modify `001_initial_schema.sql`.

**Sub-step 3 — Type check (discipline gate):**
Run `npx tsc --noEmit`. SQL files do not affect TypeScript compilation, but run this as a discipline check to ensure no regression from a previous step.

**Sub-step 4 — Apply migration to Supabase (if available):**
If Supabase MCP tools are available, apply the migration to the remote project. If not available, document that manual application is required via `supabase db push` or the Supabase dashboard.

**Sub-step 5 — Commit:**
Stage: `git add supabase/migrations/002_atomic_rate_limit.sql`
Commit message: `fix(E): add 002_atomic_rate_limit.sql with increment_message_count RPC function`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\supabase\migrations\002_atomic_rate_limit.sql` exists
- [ ] The file contains `CREATE OR REPLACE FUNCTION increment_message_count`
- [ ] The function uses `SECURITY DEFINER`
- [ ] The function parameter is `p_user_id uuid`
- [ ] The function uses `INSERT INTO rate_limit_tracking ... ON CONFLICT (user_id) DO UPDATE`
- [ ] The window cutoff is `now() - interval '60 minutes'`
- [ ] `001_initial_schema.sql` was NOT modified
- [ ] `npx tsc --noEmit` exits 0
- [ ] `git log --oneline` shows a new commit with message containing `fix(E)`
- [ ] No source files in `lib/` or `app/` were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-07" from pendingSteps to completedSteps
- Set steps["prompt-07"].status = "complete"
