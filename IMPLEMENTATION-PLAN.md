# RiseDial Implementation Plan

## Project Context

- **Project root:** `C:\Users\Alexb\Documents\RiseDialapp`
- **Stack:** Next.js 14 App Router, TypeScript, Supabase (PostgreSQL), OpenAI API
- **Shell:** PowerShell on Windows 11

This plan contains two independent changes. Execute them in the order listed. Do not skip the TypeScript verification step. Do not execute anything outside what is described here.

---

## What This Plan Does

**Plan B (do first — 2 changes):** The admin sign-in bypass already mints a JWT with `subscription_status: 'active'`, which satisfies the subscription gate. But `has_premium_memory` is read directly from the database row (not the JWT) at `app/api/chat/[chatId]/message/route.ts` line 52. If that DB column is `false`, the admin gets the free-tier model for memory compression. Plan B fixes the DB row once via SQL, then adds code to re-enforce it on every admin login.

**Plan A (do second — 5 changes):** The memory profiling system currently counts messages per-chat and reads messages from only the triggering chat. Plan A changes the trigger to count across all of a user's chats globally, and changes profile generation and patching to read from all chats. A guard is also added so that if the global count skips over the exact trigger threshold (e.g. jumps from 19 to 21), the system still runs an initial profile build instead of silently failing.

---

## Execution Order

1. Plan B — Step 1: Run Supabase SQL
2. Plan B — Step 2: Edit `app/api/auth/signin/route.ts`
3. Plan A — Step 1: Edit `lib/db/messages.ts`
4. Plan A — Step 2: Edit `lib/memory/trigger.ts`
5. Plan A — Step 3: Edit `lib/memory/compress.ts` (two edits)
6. Plan A — Step 4: Edit `lib/memory/patch.ts` (two edits)
7. Plan A — Step 5: Edit `lib/memory/executor.ts` (two edits)
8. TypeScript verification
9. Git commit and push

---

---

# PLAN B — Admin Account Full Premium Access

---

## B-1: Supabase SQL (run first, before any code changes)

Open the Supabase dashboard for this project → SQL Editor → New Query. Paste and run the following exactly:

```sql
UPDATE users
SET subscription_status = 'active',
    has_premium_memory   = true
WHERE email = 'alexbitar@hotmail.com';
```

**Expected result:** "1 row affected". If the result is "0 rows affected", the admin account does not exist in the database yet. In that case, create the account via the app's sign-up page first, then re-run this SQL before proceeding.

---

## B-2: Edit `app/api/auth/signin/route.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`

**Tool:** Edit

**What this does:** Inserts a `supabaseServer.update()` call inside the admin bypass block, immediately after the `if (!adminUser)` guard and before the `let sessionToken` declaration. This ensures that every admin login re-sets `subscription_status = 'active'` and `has_premium_memory = true` in the DB row, even if a Stripe webhook previously reset those values.

Use the Edit tool with these exact strings:

**old_string:**
```
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      let sessionToken: string;
```

**new_string:**
```
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      // Keep admin DB row in sync — Stripe webhooks can reset these fields
      try {
        await supabaseServer
          .from('users')
          .update({ subscription_status: 'active', has_premium_memory: true })
          .eq('id', adminUser.id);
      } catch {
        // Non-fatal: session still created even if this update fails
      }

      let sessionToken: string;
```

**Verification after edit:** Read the file. Confirm:
- The try/catch block appears between the closing `}` of `if (!adminUser)` and `let sessionToken: string;`
- Indentation is 6 spaces (matching the surrounding code — count them)
- No existing lines were removed
- `supabaseServer` is already imported at the top of the file (it is — do not add another import)

---

---

# PLAN A — Cross-Chat Profile Contribution

---

## A-1: Add `getMessagesByUserId` to `lib/db/messages.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`

**Tool:** Edit

**What this does:** Appends a new exported function at the end of the file. This function fetches all messages across every chat belonging to a given user by: (1) querying the `chats` table for all chat IDs owned by that user, then (2) querying the `messages` table with `.in('chat_id', chatIds)`.

Use the Edit tool with these exact strings:

**old_string:**
```
/**
 * Count the number of user-role messages in a given chat.
 * Used by the rate limiting layer to track message consumption.
 */
export async function countUserMessagesByChatId(chatId: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user');

  if (error) {
    throw new Error(`countUserMessagesByChatId failed: ${error.message}`);
  }

  return count ?? 0;
}
```

**new_string:**
```
/**
 * Count the number of user-role messages in a given chat.
 * Used by the rate limiting layer to track message consumption.
 */
export async function countUserMessagesByChatId(chatId: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user');

  if (error) {
    throw new Error(`countUserMessagesByChatId failed: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Fetch all messages across every chat belonging to a given user,
 * ordered by creation date ascending. Used by cross-chat memory profiling.
 */
export async function getMessagesByUserId(userId: string): Promise<Message[]> {
  const { data: chats, error: chatsError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (chatsError) {
    throw new Error(`getMessagesByUserId (fetch chats) failed: ${chatsError.message}`);
  }

  if (!chats || chats.length === 0) return [];

  const chatIds = (chats as { id: string }[]).map((c) => c.id);

  const { data, error } = await supabaseServer
    .from('messages')
    .select('*')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`getMessagesByUserId (fetch messages) failed: ${error.message}`);
  }

  return (data ?? []) as Message[];
}
```

**Verification after edit:** Read the file. Confirm:
- `getMessagesByUserId` is exported and appears after `countUserMessagesByChatId`
- `countUserMessagesByChatId` is completely unchanged above it
- The new function takes `userId: string` and returns `Promise<Message[]>`
- The `Message` type used in the return type is already defined/imported at the top of the file (it is — no new import needed)

---

## A-2: Count across all user chats in `lib/memory/trigger.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`

**Tool:** Edit

**What this does:** Replaces the body of `checkCompressionTrigger`. The current implementation counts messages filtered by a single `chat_id`. The new implementation first fetches all chat IDs for the user from the `chats` table, then counts user messages across all of them using `.in('chat_id', chatIds)`. The `chatId` parameter remains in the function signature (callers pass it) but is no longer used inside the query — this is intentional and TypeScript-safe.

Use the Edit tool with these exact strings:

**old_string:**
```
export async function checkCompressionTrigger(
  chatId: string,
  userId: string
): Promise<CompressionTriggerResult> {
  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user')
    .not('user_message_index', 'is', null);

  if (error) {
    console.error('[checkCompressionTrigger] Supabase error:', error);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const userMessageCount = count ?? 0;

  if (userMessageCount === 20) {
    return { shouldCompress: true, isInitial: true, isPatch: false };
  }

  if (userMessageCount > 20 && (userMessageCount - 20) % 5 === 0) {
    return { shouldCompress: true, isInitial: false, isPatch: true };
  }

  return { shouldCompress: false, isInitial: false, isPatch: false };
}
```

**new_string:**
```
export async function checkCompressionTrigger(
  chatId: string,
  userId: string
): Promise<CompressionTriggerResult> {
  const { data: chats, error: chatsError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (chatsError) {
    console.error('[checkCompressionTrigger] Failed to fetch user chats:', chatsError);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const chatIds = (chats ?? []).map((c: { id: string }) => c.id);

  if (chatIds.length === 0) {
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('chat_id', chatIds)
    .eq('role', 'user')
    .not('user_message_index', 'is', null);

  if (error) {
    console.error('[checkCompressionTrigger] Supabase error:', error);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const userMessageCount = count ?? 0;

  if (userMessageCount === 20) {
    return { shouldCompress: true, isInitial: true, isPatch: false };
  }

  if (userMessageCount > 20 && (userMessageCount - 20) % 5 === 0) {
    return { shouldCompress: true, isInitial: false, isPatch: true };
  }

  return { shouldCompress: false, isInitial: false, isPatch: false };
}
```

**Verification after edit:** Read the file. Confirm:
- `.eq('chat_id', chatId)` is gone from the messages query
- `.in('chat_id', chatIds)` is present in the messages query
- `chatId` still appears in the function signature (first parameter)
- The thresholds (20, 5) are unchanged
- The import at the top of the file (`import { supabaseServer } from '@/lib/supabase/server';`) is unchanged

---

## A-3: Read from all chats in initial profile — `lib/memory/compress.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`

**Tool:** Edit — make two separate Edit calls in the order shown below.

**What this does:** Changes the initial profile generator to fetch messages from all of the user's chats instead of just the triggering chat.

### Edit 3a — Change the import line

**old_string:**
```
import { getMessagesByChatId } from '../db/messages';
```

**new_string:**
```
import { getMessagesByUserId } from '../db/messages';
```

### Edit 3b — Change the function call (do this after 3a)

**old_string:**
```
    messages = await getMessagesByChatId(chatId);
```

**new_string:**
```
    messages = await getMessagesByUserId(userId);
```

**Verification after both edits:** Read the file. Confirm:
- The string `getMessagesByChatId` does not appear anywhere in the file
- `getMessagesByUserId` appears in both the import and the function call
- All other code is unchanged

---

## A-4: Read from all chats in patch — `lib/memory/patch.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`

**Tool:** Edit — make two separate Edit calls in the order shown below.

**What this does:** Changes the profile patch function to fetch messages from all of the user's chats instead of just the triggering chat. The pairing logic (grouping user+assistant pairs, filtering by `last_updated_at`) works identically on the globally-ordered message list.

### Edit 4a — Change the import line

**old_string:**
```
import { getMessagesByChatId } from '../db/messages';
```

**new_string:**
```
import { getMessagesByUserId } from '../db/messages';
```

### Edit 4b — Change the function call (do this after 4a)

**old_string:**
```
    allMessages = await getMessagesByChatId(chatId);
```

**new_string:**
```
    allMessages = await getMessagesByUserId(userId);
```

**Verification after both edits:** Read the file. Confirm:
- The string `getMessagesByChatId` does not appear anywhere in the file
- `getMessagesByUserId` appears in both the import and the function call
- All other code is unchanged — the pairing logic, the `last_updated_at` filter, and the `updateMemoryProfile` call are all untouched

---

## A-5: Add profile-existence guard — `lib/memory/executor.ts`

**File:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

**Tool:** Edit — make two separate Edit calls in the order shown below.

**What this does:** Adds a guard that runs after the trigger check. When a user's global message count crosses the threshold of 20 without landing exactly on it (e.g. they send two messages quickly and jump from 19 to 21), the trigger returns `isPatch: true`. But `patchMemoryProfile` requires an existing base profile and silently returns early when none exists — leaving the user with no profile ever. The guard detects this scenario and forces an initial profile build instead.

Note: `triggerResult` is already declared with `let` in the original file (line 43: `let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;`). The guard reassigns it, which is valid.

### Edit 5a — Add import (do this first)

**old_string:**
```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
```

**new_string:**
```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
import { getMemoryProfileByUserId } from '../db/memory';
```

### Edit 5b — Insert guard block between Step 3 and Step 4 (do this after 5a)

**old_string:**
```
    // -----------------------------------------------------------------------
    // Step 3 — Early return if no compression is needed
    // -----------------------------------------------------------------------
    if (!triggerResult.shouldCompress) {
      return;
    }

    // -----------------------------------------------------------------------
    // Step 4 — Determine which compression function to call
    // -----------------------------------------------------------------------
    const compressionFn = triggerResult.isInitial
```

**new_string:**
```
    // -----------------------------------------------------------------------
    // Step 3 — Early return if no compression is needed
    // -----------------------------------------------------------------------
    if (!triggerResult.shouldCompress) {
      return;
    }

    // If the trigger fired as a patch but no profile exists yet (can happen
    // when the global count skips over the exact threshold), force initial.
    if (triggerResult.isPatch) {
      const existingProfile = await getMemoryProfileByUserId(userId);
      if (!existingProfile) {
        triggerResult = { shouldCompress: true, isInitial: true, isPatch: false };
      }
    }

    // -----------------------------------------------------------------------
    // Step 4 — Determine which compression function to call
    // -----------------------------------------------------------------------
    const compressionFn = triggerResult.isInitial
```

**Verification after both edits:** Read the file. Confirm:
- `getMemoryProfileByUserId` is imported from `'../db/memory'`
- The guard block (the `if (triggerResult.isPatch)` block) appears between the early-return block and the `compressionFn` assignment
- `triggerResult` is declared with `let` on line 43 (unchanged — do not touch it)
- All other code is unchanged

---

---

# TypeScript Verification

After completing all edits from both Plan B and Plan A, run this command from the project root:

```
npx tsc --noEmit
```

**Expected result:** Exit code 0 with no output.

**If errors appear**, the most likely causes are:

| Error | Fix |
|-------|-----|
| `getMessagesByUserId` not found | Check spelling in compress.ts and patch.ts imports and call sites |
| `getMemoryProfileByUserId` not found | Check spelling in executor.ts import |
| `Cannot assign to triggerResult` | The original file declares it with `let` — confirm it was not accidentally changed to `const` |
| Property does not exist on `chats` row | Confirm the `.map((c: { id: string }) => c.id)` type annotation is present in trigger.ts and messages.ts |

Do not commit until `npx tsc --noEmit` exits with code 0.

---

---

# Git Commit

Stage exactly these six files (do not use `git add .`):

```
git add app/api/auth/signin/route.ts lib/db/messages.ts lib/memory/trigger.ts lib/memory/compress.ts lib/memory/patch.ts lib/memory/executor.ts
```

Commit:

```
git commit -m "$(cat <<'EOF'
feat: cross-chat memory profiling and admin premium DB sync

- Memory trigger now counts user messages across all chats globally
- Profile generation reads messages from all user chats, not just the active chat
- Profile patching reads new messages from all user chats since last update
- Executor falls back to initial profile build if patch fires but no profile exists
- Admin sign-in now upserts subscription_status=active and has_premium_memory=true on each login

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Push:

```
git push origin main
```
