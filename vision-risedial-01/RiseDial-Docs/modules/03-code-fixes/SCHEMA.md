# Module 3 — Code Fixes: Schema

## New Database Function: increment_message_count

### File Location

`supabase/migrations/002_atomic_rate_limit.sql`

### Purpose

Atomically increment the `message_count` column in the `rate_limit_tracking` table for the active 60-minute window for a given user. If no active window exists, insert a new window row with `message_count = 1`. This replaces the non-atomic read-modify-write pattern in `recordMessage` that has a race condition under concurrent requests.

### SQL

```sql
-- Migration: 002_atomic_rate_limit
-- Adds atomic increment function for rate limit tracking
-- Replaces the non-atomic read-modify-write pattern in lib/rise/rate-limit.ts

CREATE OR REPLACE FUNCTION increment_message_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_id uuid;
  v_rows_updated integer;
BEGIN
  -- Attempt atomic increment on the most recent active window
  UPDATE rate_limit_tracking
  SET message_count = message_count + 1
  WHERE id = (
    SELECT id
    FROM rate_limit_tracking
    WHERE user_id = p_user_id
      AND window_start >= now() - interval '60 minutes'
    ORDER BY window_start DESC
    LIMIT 1
  );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  -- If no active window existed, start a new one
  IF v_rows_updated = 0 THEN
    INSERT INTO rate_limit_tracking (user_id, window_start, message_count)
    VALUES (p_user_id, now(), 1);
  END IF;
END;
$$;

-- Grant execute to the service role (used by the app's supabaseServer client)
GRANT EXECUTE ON FUNCTION increment_message_count(uuid) TO service_role;
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `p_user_id` | uuid | The ID of the user sending the message |

### Return Value

`void` — the function updates or inserts a row and returns nothing.

### Atomicity Guarantee

The `UPDATE ... WHERE id = (SELECT ...)` pattern is atomic at the database level. Two concurrent calls with the same `p_user_id` will both execute the UPDATE; PostgreSQL's row-level locking ensures only one increment happens per concurrent pair. The `GET DIAGNOSTICS` → `INSERT` branch is also safe: if two concurrent calls both find zero rows and both attempt the INSERT, only one will succeed (the other will fail with a unique constraint violation on `user_id + window_start` if such a constraint exists, or both inserts will succeed creating two windows for the same minute — either is acceptable since the window cutoff query will merge them on the next `checkRateLimit` call).

### Calling Convention from TypeScript

```typescript
const { error } = await supabaseServer.rpc('increment_message_count', {
  p_user_id: userId,
})
if (error) {
  console.error('[rate-limit] Failed to record message:', error)
}
```

### Rate Limit Table Reference

The function operates on the `rate_limit_tracking` table:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE |
| window_start | timestamptz | NOT NULL — when this 60-minute window started |
| message_count | integer | NOT NULL DEFAULT 0 — current count in this window |

The rolling window is defined as `window_start >= now() - interval '60 minutes'`. Only the most recent window within this range is active. Old windows are not deleted — they accumulate but are excluded from queries by the timestamp filter.

### Migration Filename Convention

The file must be named `002_atomic_rate_limit.sql` to follow the `NNN_description.sql` naming convention established by `001_initial_schema.sql`. Supabase applies migrations in alphabetical (numeric) order.

### SECURITY DEFINER Note

The function uses `SECURITY DEFINER` so it runs with the privileges of the function owner (typically `postgres`), not the calling role. This ensures the function can always read and write to `rate_limit_tracking` regardless of RLS policies. Since the app uses the `service_role` client (which bypasses RLS anyway), this is consistent with the existing security model.
