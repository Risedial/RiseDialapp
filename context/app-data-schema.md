# App Data Schema
**Role:** Source of truth for all database table schemas — exact column names, types, constraints, and indexes used by every sub-agent writing SQL or database queries
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** Prompts 04–08, 16, 24, 26–30
**Date:** 2026-05-02

---

## CRITICAL VALUES (Read before any other section)

Database: Supabase (PostgreSQL with Row Level Security)
Total tables: 6

Table names (exact):
1. `users`
2. `chats`
3. `messages`
4. `memory_profiles`
5. `rate_limit_tracking`
6. `webhook_events`

---

## users table

```sql
CREATE TABLE users (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   text UNIQUE NOT NULL,
  password_hash           text NOT NULL,
  preferred_name          varchar(30) NULL,
  subscription_status     text NOT NULL CHECK (subscription_status IN ('active', 'lapsed', 'cancelled')),
  stripe_customer_id      text NULL,
  stripe_subscription_id  text NULL,
  stripe_premium_item_id  text NULL,
  plan_type               text NULL CHECK (plan_type IN ('monthly', 'annual')),
  has_premium_memory      boolean NOT NULL DEFAULT false,
  next_billing_date       timestamptz NULL,
  subscription_lapsed_at  timestamptz NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);
```

**Column count:** 13
**subscription_status values:** 'active', 'lapsed', 'cancelled'
**plan_type values:** 'monthly', 'annual'
**Note:** subscription_status is written ONLY by the Stripe webhook handler — never by any other route

---

## chats table

```sql
CREATE TABLE chats (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       varchar(40) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL
);

CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_deleted_at ON chats(deleted_at);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own chats"
  ON chats FOR ALL
  USING (user_id = auth.uid());
```

**Column count:** 5
**Soft-delete:** `deleted_at` is set to now() on deletion; chat record is NOT hard-deleted
**Active chats filter:** `WHERE deleted_at IS NULL`

---

## messages table

```sql
CREATE TABLE messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id             uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role                text NOT NULL CHECK (role IN ('user', 'assistant')),
  content             text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  user_message_index  integer NULL
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_user_message_index ON messages(user_message_index);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access messages in own chats"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );
```

**Column count:** 6
**user_message_index:** integer counter for user messages only (NULL for assistant messages). Used for memory compression trigger logic.
**role values:** 'user', 'assistant'

---

## memory_profiles table

```sql
CREATE TABLE memory_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_json    jsonb NOT NULL,
  source_chats    jsonb NOT NULL DEFAULT '[]',
  version         integer NOT NULL DEFAULT 1,
  generated_at    timestamptz NOT NULL DEFAULT now(),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  model_used      varchar(50) NOT NULL
);

ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memory profile"
  ON memory_profiles FOR SELECT
  USING (user_id = auth.uid());
```

**Column count:** 8
**UNIQUE on user_id:** one profile per user account (never per-chat)
**source_chats:** jsonb array of `{ "chat_id": "uuid", "deleted_at": "ISO-8601 or null" }` objects
**profile_json:** full memory profile JSON object (see profile schema below)

### Memory Profile JSON Schema (exact field names)

```json
{
  "version": 1,
  "generatedAt": "ISO-8601 timestamp",
  "lastUpdatedAt": "ISO-8601 timestamp",
  "sourceChats": [
    { "chat_id": "uuid", "deleted_at": "ISO-8601 timestamp or null" }
  ],
  "profile": {
    "coreThemes": [],
    "emotionalPatterns": [],
    "worldview": [],
    "challenges": [],
    "values": [],
    "blindspots": [],
    "memorableStatements": [],
    "clinicalObservations": []
  }
}
```

---

## rate_limit_tracking table

```sql
CREATE TABLE rate_limit_tracking (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  window_start   timestamptz NOT NULL,
  message_count  integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_rate_limit_user_window ON rate_limit_tracking(user_id, window_start);
```

**Column count:** 4
**window_start:** timestamp when the current 60-minute window started
**message_count:** number of messages sent in this window
**Rate limit:** 60 messages per 60-minute rolling window

---

## webhook_events table

```sql
CREATE TABLE webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type      text NOT NULL,
  processed_at    timestamptz NOT NULL DEFAULT now(),
  payload         jsonb NOT NULL
);
```

**Column count:** 5
**stripe_event_id UNIQUE:** prevents duplicate processing (idempotency)
**Check before processing:** query `WHERE stripe_event_id = $1` — if found, return 200 without processing

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. All column names used in SQL or TypeScript MUST match this file exactly
3. Do not add columns not listed here
4. Do not rename columns
5. If a column appears in your prompt but not here — it does not exist; check the prompt for errors

ORDERING CONSTRAINT: When building migration SQL, tables must be created in this order (foreign key dependencies):
1. `users` (no dependencies)
2. `chats` (depends on users)
3. `messages` (depends on chats)
4. `memory_profiles` (depends on users)
5. `rate_limit_tracking` (depends on users)
6. `webhook_events` (no dependencies)
