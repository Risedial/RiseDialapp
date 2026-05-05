# data-schema.md — schema_values Reference

**Role:** prevents agents from inventing wrong Supabase table names, column names, or enum strings that do not exist in 001_initial_schema.sql
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** M2, M3, M6, M7
**Date:** 2026-05-04

---

## Values

**table:users:** `users`
**table:chats:** `chats`
**table:messages:** `messages`
**table:memory_profiles:** `memory_profiles`
**table:rate_limit_tracking:** `rate_limit_tracking`
**table:webhook_events:** `webhook_events`
**users.id:** `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
**users.email:** `text UNIQUE NOT NULL`
**users.password_hash:** `text NOT NULL`
**users.preferred_name:** `varchar(30) NULL`
**users.subscription_status:** `text CHECK IN ('active', 'lapsed', 'cancelled') NOT NULL`
**users.stripe_customer_id:** `text NULL`
**users.stripe_subscription_id:** `text NULL`
**users.stripe_premium_item_id:** `text NULL`
**users.plan_type:** `text CHECK IN ('monthly', 'annual') NULL`
**users.has_premium_memory:** `boolean NOT NULL DEFAULT false`
**users.next_billing_date:** `timestamptz NULL`
**users.subscription_lapsed_at:** `timestamptz NULL`
**users.created_at:** `timestamptz NOT NULL DEFAULT now()`
**users.password_reset_token:** `text NULL`
**users.password_reset_expires:** `timestamptz NULL`
**chats.id:** `uuid PRIMARY KEY`
**chats.user_id:** `uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE`
**chats.title:** `varchar(40) NOT NULL`
**chats.created_at:** `timestamptz NOT NULL DEFAULT now()`
**chats.deleted_at:** `timestamptz NULL`
**messages.id:** `uuid PRIMARY KEY`
**messages.chat_id:** `uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE`
**messages.role:** `text CHECK IN ('user', 'assistant') NOT NULL`
**messages.content:** `text NOT NULL`
**messages.created_at:** `timestamptz NOT NULL DEFAULT now()`
**messages.user_message_index:** `integer NULL`
**memory_profiles.id:** `uuid PRIMARY KEY`
**memory_profiles.user_id:** `uuid NOT NULL UNIQUE REFERENCES users(id)`
**memory_profiles.profile_json:** `jsonb NOT NULL`
**memory_profiles.source_chats:** `jsonb NOT NULL DEFAULT '[]'`
**memory_profiles.version:** `integer NOT NULL DEFAULT 1`
**memory_profiles.generated_at:** `timestamptz NOT NULL DEFAULT now()`
**memory_profiles.last_updated_at:** `timestamptz NOT NULL DEFAULT now()`
**memory_profiles.model_used:** `varchar(50) NOT NULL`
**rate_limit_tracking.id:** `uuid PRIMARY KEY`
**rate_limit_tracking.user_id:** `uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE`
**rate_limit_tracking.window_start:** `timestamptz NOT NULL`
**rate_limit_tracking.message_count:** `integer NOT NULL DEFAULT 0`
**webhook_events.id:** `uuid PRIMARY KEY`
**webhook_events.stripe_event_id:** `text UNIQUE NOT NULL`
**webhook_events.event_type:** `text NOT NULL`
**webhook_events.processed_at:** `timestamptz NOT NULL DEFAULT now()`
**webhook_events.payload:** `jsonb NOT NULL`
**enum:users.subscription_status:** `['active', 'lapsed', 'cancelled']`
**enum:users.plan_type:** `['monthly', 'annual']`
**enum:messages.role:** `['user', 'assistant']`
**constraint:memory_profiles.user_id:** `UNIQUE`
**constraint:webhook_events.stripe_event_id:** `UNIQUE NOT NULL`
**fk:chats.user_id:** `REFERENCES users(id) ON DELETE CASCADE`
**fk:messages.chat_id:** `REFERENCES chats(id) ON DELETE CASCADE`
**fk:memory_profiles.user_id:** `REFERENCES users(id)`
**fk:rate_limit_tracking.user_id:** `REFERENCES users(id) ON DELETE CASCADE`
**rpc:increment_message_count:** `increment_message_count(p_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER`
**rpc:increment_message_count.param:** `p_user_id`
**migration_file_001:** `supabase/migrations/001_initial_schema.sql`
**migration_file_002:** `supabase/migrations/002_atomic_rate_limit.sql`
**memory_conflict_target:** `user_id`
**webhook_idempotency_field:** `stripe_event_id`
**rate_limit_window_minutes:** `60`
**rate_limit_max_messages:** `60`
**memory_compression_initial_threshold:** `50`
**memory_compression_patch_interval:** `10`
**memory_compression_retry_attempts:** `3`
**subscription_billing_date_field:** `subscription.items.data[0].current_period_end`
**subscription_billing_date_field_FORBIDDEN:** `subscription.current_period_end`
