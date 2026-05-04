-- Migration: 002_atomic_rate_limit
-- Date: 2026-05-04
-- Description: Adds increment_message_count RPC function for atomic rate-limit tracking.
--              Replaces the read-modify-write pattern in lib/rise/rate-limit.ts with
--              a single atomic upsert, preventing double-counting under concurrent requests.

ALTER TABLE rate_limit_tracking ADD CONSTRAINT rate_limit_tracking_user_id_key UNIQUE (user_id);

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
