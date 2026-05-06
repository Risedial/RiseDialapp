# Memory Profiling Modification Locations

Collected for step-04-collect-memory-context.
All line numbers and strings verified from direct file reads — no hallucination.

---

## File 1: messages.ts

**Absolute path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`

| Target | Line | Action | Old string (exact) | New string (exact) |
|--------|------|--------|--------------------|--------------------|
| Append new function after `countUserMessagesByChatId` | After line 104 | INSERT | (nothing — append after closing `}`) | New export function `countUserMessagesByChatIndexByChatId` (or `countIndexedUserMessagesByChatId`) for the trigger — see plan step-05 for final name |

**Context note:** The file currently ends at line 104 with the closing `}` of `countUserMessagesByChatId`. The new function must be inserted (appended) after this line. The new function will count only messages where `user_message_index IS NOT NULL` — mirroring the query in `trigger.ts` lines 13–18.

**Existing function for reference (lines 92–104):**
```
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

---

## File 2: trigger.ts

**Absolute path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`

| Target | Line(s) | Action | Old string (exact) | New string (exact) |
|--------|---------|--------|--------------------|--------------------|
| Import line — add `countIndexedUserMessagesByChatId` | Line 1 | REPLACE | `import { supabaseServer } from '@/lib/supabase/server';` | `import { supabaseServer } from '@/lib/supabase/server';` + add import from messages (see plan) |
| Inline Supabase query in `checkCompressionTrigger` | Lines 13–18 | REPLACE | Inline Supabase query block | Call to `countIndexedUserMessagesByChatId(chatId)` |

**Inline query to be replaced (lines 13–18, exact):**
```
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
```

**Replacement target:** Replace the above block with a single call to the new `countIndexedUserMessagesByChatId` helper, wrapped in try/catch (per the pattern in compress.ts and patch.ts).

**Lines involved:** 13–25 (from `const { count, error }` through `const userMessageCount = count ?? 0;`)

**Exact text of lines 13–25:**
```
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
```

---

## File 3: compress.ts

**Absolute path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`

| Target | Line | Action | Old string (exact) | New string (exact) |
|--------|------|--------|--------------------|--------------------|
| Import line | 3 | REPLACE | `import { getMessagesByChatId } from '../db/messages';` | `import { getMessagesByChatId, countIndexedUserMessagesByChatId } from '../db/messages';` |
| Call site | 41 | REPLACE | `    messages = await getMessagesByChatId(chatId);` | `    messages = await getMessagesByChatId(chatId);` (no change to call site — call site stays; change is in import or guard insertion before line 40) |

**Note:** The primary modification in compress.ts may be adding a guard before the `getMessagesByChatId` call using the new count function, OR replacing the unlimited fetch with a count-first pattern. See plan step-05 for the decision. The import line on line 3 is the definitive change anchor.

**Import line exact text (line 3):**
```
import { getMessagesByChatId } from '../db/messages';
```

**Call site exact text (line 41, 4-space indent):**
```
    messages = await getMessagesByChatId(chatId);
```

---

## File 4: patch.ts

**Absolute path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`

| Target | Line | Action | Old string (exact) | New string (exact) |
|--------|------|--------|--------------------|--------------------|
| Import line | 3 | REPLACE | `import { getMessagesByChatId } from '../db/messages';` | `import { getMessagesByChatId, countIndexedUserMessagesByChatId } from '../db/messages';` |
| Call site | 71 | NO CHANGE (or guard insertion before) | `    allMessages = await getMessagesByChatId(chatId);` | (see plan step-05) |

**Note:** Variable name at call site is `allMessages` (not `messages` — confirmed line 71). Import line (line 3) is identical to compress.ts.

**Import line exact text (line 3):**
```
import { getMessagesByChatId } from '../db/messages';
```

**Call site exact text (line 71, 4-space indent):**
```
    allMessages = await getMessagesByChatId(chatId);
```

---

## File 5: executor.ts

**Absolute path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

| Target | Line(s) | Action | Old string (exact) | New string (exact) |
|--------|---------|--------|--------------------|--------------------|
| Import block | 3–5 | NO CHANGE (imports are already correct) | Lines 3–5 as-is | No modification needed |
| `triggerResult` declaration | 43 | CONFIRMED `let` keyword | `    let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;` | (no change — `let` is correct) |
| Guard insertion point | After line 56 | INSERT | After closing `}` of early-return block | New guard block (see plan step-05) |

**Import block exact text (lines 3–5):**
```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
```

**`triggerResult` declaration exact text (line 43):**
```
    let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;
```

**Early-return block exact text (lines 54–56):**
```
    if (!triggerResult.shouldCompress) {
      return;
    }
```

**Line after early-return block (line 57):** blank line

**Insertion point:** immediately after line 56 (the closing `}` of the `if (!triggerResult.shouldCompress)` block), before the blank line at line 57 and before the Step 4 comment block starting at line 58.

---

## Summary Table

| File | Path | Primary Modification Type |
|------|------|--------------------------|
| messages.ts | `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts` | Append new `countIndexedUserMessagesByChatId` function after line 104 |
| trigger.ts | `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts` | Replace inline Supabase query (lines 13–25) with call to new helper; add import |
| compress.ts | `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts` | Update import on line 3; potential guard before call site on line 41 |
| patch.ts | `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts` | Update import on line 3; potential guard before call site on line 71 |
| executor.ts | `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts` | Guard insertion after line 56; imports confirmed correct |
