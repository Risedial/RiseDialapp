-- Migration: 001_initial_schema
-- Date: 2026-05-02
-- Description: Initial database schema skeleton for RiseDial production.
--              Detailed CREATE TABLE statements are appended by steps 04-07.

-- Table: users
-- users

-- Table: chats
-- chats

-- Table: messages
-- messages

-- Table: memory_profiles
-- memory_profiles

-- Table: rate_limit_tracking
-- rate_limit_tracking

-- Table: webhook_events
-- webhook_events

-- NOTE: Detailed per-table CREATE TABLE statements are appended by steps 04-07.

-- ============================================================
-- Step 04: users table
-- ============================================================

CREATE TABLE users (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  text UNIQUE NOT NULL,
  password_hash          text NOT NULL,
  preferred_name         varchar(30) NULL,
  subscription_status    text NOT NULL CHECK (subscription_status IN ('active', 'lapsed', 'cancelled')),
  stripe_customer_id     text NULL,
  stripe_subscription_id text NULL,
  stripe_premium_item_id text NULL,
  plan_type              text NULL CHECK (plan_type IN ('monthly', 'annual')),
  has_premium_memory     boolean NOT NULL DEFAULT false,
  next_billing_date      timestamptz NULL,
  subscription_lapsed_at timestamptz NULL,
  created_at             timestamptz NOT NULL DEFAULT now(),
  password_reset_token   text NULL,
  password_reset_expires timestamptz NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own row
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: users can update their own row
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Step 05: chats table
-- ============================================================

CREATE TABLE chats (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

-- Indexes
CREATE INDEX idx_chats_user_id   ON chats (user_id);
CREATE INDEX idx_chats_deleted_at ON chats (deleted_at);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy: users can select their own chats
CREATE POLICY "chats_select_own"
  ON chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own chats
CREATE POLICY "chats_insert_own"
  ON chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own chats
CREATE POLICY "chats_update_own"
  ON chats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own chats
CREATE POLICY "chats_delete_own"
  ON chats
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Step 05: messages table
-- ============================================================

CREATE TABLE messages (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id            uuid    NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role               text    NOT NULL CHECK (role IN ('user', 'assistant')),
  content            text    NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  user_message_index integer NULL
);

-- Indexes
CREATE INDEX idx_messages_chat_id            ON messages (chat_id);
CREATE INDEX idx_messages_user_message_index ON messages (user_message_index);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: users can select messages belonging to their own chats
CREATE POLICY "messages_select_own"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND chats.user_id = auth.uid()
    )
  );

-- Policy: users can insert messages into their own chats
CREATE POLICY "messages_insert_own"
  ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND chats.user_id = auth.uid()
    )
  );

-- Policy: users can update messages in their own chats
CREATE POLICY "messages_update_own"
  ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND chats.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND chats.user_id = auth.uid()
    )
  );

-- Policy: users can delete messages in their own chats
CREATE POLICY "messages_delete_own"
  ON messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND chats.user_id = auth.uid()
    )
  );

-- ============================================================
-- Step 06: memory_profiles table
-- ============================================================

CREATE TABLE memory_profiles (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_json    jsonb        NOT NULL,
  source_chats    jsonb        NOT NULL DEFAULT '[]',
  version         integer      NOT NULL DEFAULT 1,
  generated_at    timestamptz  NOT NULL DEFAULT now(),
  last_updated_at timestamptz  NOT NULL DEFAULT now(),
  model_used      varchar(50)  NOT NULL
);

-- Enable Row Level Security
ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own memory profile
CREATE POLICY "memory_profiles_select_own"
  ON memory_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- Step 07: rate_limit_tracking table
-- ============================================================

CREATE TABLE rate_limit_tracking (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  window_start   timestamptz NOT NULL,
  message_count  integer     NOT NULL DEFAULT 0
);

-- Index for efficient per-user window lookups
CREATE INDEX idx_rate_limit_tracking_user_id_window_start
  ON rate_limit_tracking (user_id, window_start);

-- ============================================================
-- Step 07: webhook_events table
-- ============================================================

CREATE TABLE webhook_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text        UNIQUE NOT NULL,
  event_type      text        NOT NULL,
  processed_at    timestamptz NOT NULL DEFAULT now(),
  payload         jsonb       NOT NULL
);
