# Plan: Memory Profiling Fixes
**Step:** step-05-plan-memory-fixes
**Mode:** PLAN
**Created:** 2026-05-05

All identifiers, paths, and verbatim text sourced exclusively from:
- `context/memory-facts.md`
- `context/memory-locations.md`
- Direct reads of the five target files

All five target files have been read and Before state verified as present.

---

## Edit A-1 — Add `getMessagesByUserId` to `lib/db/messages.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`

**Scope:** Append new exported function after the closing `}` of `countUserMessagesByChatId` on line 104.

**Before state** (verbatim — the entire `countUserMessagesByChatId` function, lines 88–104):

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

**After state** (the same function PLUS the new `getMessagesByUserId` function appended after it):

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
 * Fetch all messages across all chats belonging to a given user,
 * ordered by creation date ascending.
 * Used by memory compression functions to build cross-chat context.
 */
export async function getMessagesByUserId(userId: string): Promise<Message[]> {
  const { data: chats, error: chatError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (chatError) {
    throw new Error(`getMessagesByUserId failed to fetch chats: ${chatError.message}`);
  }

  const chatIds = (chats ?? []).map((c: { id: string }) => c.id);

  if (chatIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from('messages')
    .select('*')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`getMessagesByUserId failed: ${error.message}`);
  }

  return (data ?? []) as Message[];
}
```

**Edit operation:** Append the new `getMessagesByUserId` function after the closing `}` on line 104 of the current file.

**Verification test:**
- File contains `export async function getMessagesByUserId`
- File contains `.in('chat_id', chatIds)`
- `countUserMessagesByChatId` function remains unchanged

---

## Edit A-2 — Rewrite `checkCompressionTrigger` in `lib/memory/trigger.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`

**Scope:** Replace the entire inline Supabase query block (lines 13–25) with a cross-chat query using an array of `chatIds` derived from the `userId` parameter. The function signature already accepts `userId` (confirmed line 11).

**Before state** (verbatim — entire function, lines 9–36):

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

**After state** (new function body using cross-chat query via `chatIds` array):

```
export async function checkCompressionTrigger(
  chatId: string,
  userId: string
): Promise<CompressionTriggerResult> {
  // Fetch all chat IDs for this user to enable cross-chat message counting.
  const { data: chats, error: chatError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (chatError) {
    console.error('[checkCompressionTrigger] Failed to fetch chats for user:', chatError);
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

**Edit operation:** Replace the entire function body from line 9 through line 36 (end of file) with the new function body above. The function signature parameters (`chatId`, `userId`) remain unchanged.

**Note on `chatId` parameter:** The `chatId` parameter is retained in the signature for call-site compatibility (callers in executor.ts pass both `chatId` and `userId`), even though the new body uses `userId` to drive the query. `chatId` is no longer used inside the function body; TypeScript may issue an unused-variable warning — this is acceptable for now and can be suppressed with `void chatId;` if needed.

**Verification test:**
- File does NOT contain `.eq('chat_id', chatId)` in the messages query block
- File DOES contain `.in('chat_id', chatIds)`
- File DOES contain the chats-fetch block with `.eq('user_id', userId)`

---

## Edit A-3a — Change import in `lib/memory/compress.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`

**Scope:** Replace `getMessagesByChatId` with `getMessagesByUserId` in the import line (line 3).

**Before state** (verbatim import line, line 3):

```
import { getMessagesByChatId } from '../db/messages';
```

**After state:**

```
import { getMessagesByUserId } from '../db/messages';
```

**Edit operation:** Replace the entire import line on line 3 with the new import.

**Verification test:**
- File contains `import { getMessagesByUserId }` from `'../db/messages'`
- File does NOT contain `import { getMessagesByChatId }` from `'../db/messages'`

---

## Edit A-3b — Change call site in `lib/memory/compress.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`

**Scope:** Replace `getMessagesByChatId(chatId)` call with `getMessagesByUserId(userId)` at line 41 inside the `try` block.

**Before state** (verbatim call site line 41, with 4-space indent):

```
    messages = await getMessagesByChatId(chatId);
```

**Surrounding context for precision (lines 39–45):**

```
  let messages: Message[];
  try {
    messages = await getMessagesByChatId(chatId);
  } catch (err) {
    console.error('[generateInitialProfile] Failed to fetch messages:', err);
    return;
  }
```

**After state** (same line with `getMessagesByUserId(userId)` instead):

```
    messages = await getMessagesByUserId(userId);
```

**Edit operation:** Replace the call on line 41 only. The surrounding `try/catch` block structure remains unchanged.

**Verification test:**
- File does NOT contain `getMessagesByChatId` anywhere
- File contains `getMessagesByUserId(userId)` at the call site

---

## Edit A-4a — Change import in `lib/memory/patch.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`

**Scope:** Replace `getMessagesByChatId` with `getMessagesByUserId` in the import line (line 3).

**Before state** (verbatim import line, line 3):

```
import { getMessagesByChatId } from '../db/messages';
```

**After state:**

```
import { getMessagesByUserId } from '../db/messages';
```

**Edit operation:** Replace the entire import line on line 3 with the new import.

**Verification test:**
- File contains `import { getMessagesByUserId }` from `'../db/messages'`
- File does NOT contain `import { getMessagesByChatId }` from `'../db/messages'`

---

## Edit A-4b — Change call site in `lib/memory/patch.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`

**Scope:** Replace `getMessagesByChatId(chatId)` with `getMessagesByUserId(userId)` at line 71 inside the `try` block. Variable is `allMessages` (not `messages`).

**Before state** (verbatim call site line 71, with 4-space indent, including `allMessages =`):

```
    allMessages = await getMessagesByChatId(chatId);
```

**Surrounding context for precision (lines 69–75):**

```
  let allMessages: Message[];
  try {
    allMessages = await getMessagesByChatId(chatId);
  } catch (err) {
    console.error('[patchMemoryProfile] Failed to fetch messages for chatId:', chatId, err);
    return;
  }
```

**After state** (same line with `getMessagesByUserId(userId)` instead):

```
    allMessages = await getMessagesByUserId(userId);
```

**Edit operation:** Replace the call on line 71 only. The surrounding `try/catch` block structure remains unchanged. Note: the `catch` block error log references `chatId` — that reference in the log string is acceptable and does not need to be changed.

**Verification test:**
- File does NOT contain `getMessagesByChatId` anywhere
- File contains `getMessagesByUserId(userId)` at the call site
- Variable name `allMessages` is preserved

---

## Edit A-5a — Add import to `lib/memory/executor.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

**Scope:** Add `import { getMemoryProfileByUserId } from '../db/memory';` as a 4th import line after the existing 3-line import block (lines 3–5).

**Before state** (verbatim 3-line import block, lines 3–5):

```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
```

**After state** (same 3 lines PLUS new 4th import line):

```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
import { getMemoryProfileByUserId } from '../db/memory';
```

**Edit operation:** Append the new import line immediately after line 5 (the `import { patchMemoryProfile }` line), before the blank line separating imports from the rest of the file.

**Verification test:**
- File contains `import { getMemoryProfileByUserId } from '../db/memory';`
- The three original import lines remain unchanged

---

## Edit A-5b — Insert guard block in `lib/memory/executor.ts`

**Target file:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

**Scope:** Insert an `if (triggerResult.isPatch) { ... }` guard block between the Step 3 early-return block (closing `}` on line 56) and the Step 4 comment block (starting at line 58). The blank line at line 57 becomes part of the separator.

**Before state** (verbatim — the early-return block plus the surrounding context, lines 51–58, from memory-facts.md):

```
    // -----------------------------------------------------------------------
    // Step 3 — Early return if no compression is needed
    // -----------------------------------------------------------------------
    if (!triggerResult.shouldCompress) {
      return;
    }

    // -----------------------------------------------------------------------
    // Step 4 — Determine which compression function to call
```

**After state** (same content with the guard block inserted between Step 3 and Step 4):

```
    // -----------------------------------------------------------------------
    // Step 3 — Early return if no compression is needed
    // -----------------------------------------------------------------------
    if (!triggerResult.shouldCompress) {
      return;
    }

    // -----------------------------------------------------------------------
    // Step 3b — Guard: for patch runs, verify an existing profile exists
    // -----------------------------------------------------------------------
    if (triggerResult.isPatch) {
      let existingProfile: Awaited<ReturnType<typeof getMemoryProfileByUserId>>;
      try {
        existingProfile = await getMemoryProfileByUserId(userId);
      } catch (err) {
        console.error('[executeCompressionAsync] Failed to check existing memory profile for patch guard:', err);
        return;
      }
      if (existingProfile === null) {
        console.error('[executeCompressionAsync] Patch trigger fired but no base profile exists for userId:', userId, '— skipping patch.');
        return;
      }
    }

    // -----------------------------------------------------------------------
    // Step 4 — Determine which compression function to call
```

**Edit operation:** Insert the guard block (Step 3b comment through the closing `}` of the `if (triggerResult.isPatch)` block, plus a blank line after) between the existing blank line at line 57 and the Step 4 comment block. The insertion replaces the single blank separator line between Step 3 and Step 4 with the guard block followed by a blank line.

**Exact insertion anchor:** After the closing `}` of `if (!triggerResult.shouldCompress) {` (line 56 in original file), before the Step 4 comment (`// Step 4 — Determine which compression function to call`).

**Verification test:**
- File contains `import { getMemoryProfileByUserId } from '../db/memory';` (from Edit A-5a)
- File contains `if (triggerResult.isPatch) {` guard block
- File contains `getMemoryProfileByUserId(userId)` call inside the guard block
- The Step 3 `if (!triggerResult.shouldCompress)` block remains unchanged immediately before the guard
- The Step 4 `compressionFn` assignment remains unchanged immediately after the guard

---

## Prerequisite Verification

All five target files were read directly before writing this plan. Before state text verified present:

| Edit | Target File | Before State Found |
|------|-------------|-------------------|
| A-1 | `lib/db/messages.ts` (line 104 = closing `}` of `countUserMessagesByChatId`) | YES — confirmed lines 88–104 |
| A-2 | `lib/memory/trigger.ts` (`.eq('chat_id', chatId)` in messages query) | YES — confirmed lines 13–18 |
| A-3a | `lib/memory/compress.ts` (import line 3 = `import { getMessagesByChatId }`) | YES — confirmed line 3 |
| A-3b | `lib/memory/compress.ts` (call line 41 = `getMessagesByChatId(chatId)`) | YES — confirmed line 41 |
| A-4a | `lib/memory/patch.ts` (import line 3 = `import { getMessagesByChatId }`) | YES — confirmed line 3 |
| A-4b | `lib/memory/patch.ts` (call line 71 = `allMessages = await getMessagesByChatId(chatId)`) | YES — confirmed line 71 |
| A-5a | `lib/memory/executor.ts` (import block lines 3–5) | YES — confirmed lines 3–5 |
| A-5b | `lib/memory/executor.ts` (early-return block lines 54–56, Step 4 comment at line 58) | YES — confirmed lines 51–58 |

---

## Execution Order

The edits must be applied in this order to avoid broken intermediate states:

1. **A-1** — Add `getMessagesByUserId` to `messages.ts` (must exist before any import of it)
2. **A-2** — Rewrite `checkCompressionTrigger` in `trigger.ts` (independent of compress/patch changes)
3. **A-3a** then **A-3b** — Update import then call site in `compress.ts`
4. **A-4a** then **A-4b** — Update import then call site in `patch.ts`
5. **A-5a** then **A-5b** — Add import then insert guard block in `executor.ts`
