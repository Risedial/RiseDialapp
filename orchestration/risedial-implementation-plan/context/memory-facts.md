# Memory Profiling Context Facts

Collected for step-04-collect-memory-context.
All content verified from direct file reads — no hallucination.

---

## messages.ts

**File path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\db\messages.ts`

### `countUserMessagesByChatId` — verbatim full function

Lines 88–104:

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

- **Function declaration:** line 92
- **Closing `}` of `countUserMessagesByChatId`:** line 104
- **Insertion point for new function:** immediately after line 104 (append after the closing `}` on line 104)

### Context around closing `}` (lines 101–104):

```
101:   if (error) {
102:     throw new Error(`countUserMessagesByChatId failed: ${error.message}`);
103:   }
104: 
105:   return count ?? 0;
106: }
```

Note: line 104 is blank, closing `}` is on line **104** per raw file output. Re-checking: file ends at line 104 with no trailing newline shown. The last lines are:
- Line 99: `  if (error) {`
- Line 100: `    throw new Error(\`countUserMessagesByChatId failed: ${error.message}\`);`
- Line 101: `  }`
- Line 102: (blank)
- Line 103: `  return count ?? 0;`
- Line 104: `}`

**Closing `}` is on line 104.** New function inserts after line 104.

---

## trigger.ts

**File path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\trigger.ts`

### `checkCompressionTrigger` — verbatim full function

Lines 9–36:

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

- **Function start:** line 9
- **Function end (closing `}`):** line 36

### 3-line context around function boundaries

**Before function (lines 6–9):**
```
6:   isPatch: boolean;
7: }
8: (blank)
9: export async function checkCompressionTrigger(
```

**After function closing `}` (lines 34–36):**
```
34:   return { shouldCompress: false, isInitial: false, isPatch: false };
35: }
36: (end of file)
```

Note: file has 37 lines per read output. Closing `}` of function is on line **35**. Line 36 is the last line of the `if` block. Re-checking from raw output:
- Line 34: `  return { shouldCompress: false, isInitial: false, isPatch: false };`
- Line 35: `}`
- Line 36: (blank — end of file per read)

**Closing `}` of `checkCompressionTrigger` is on line 35.**

---

## compress.ts

**File path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\compress.ts`

### Import line verbatim (line 3):

```
import { getMessagesByChatId } from '../db/messages';
```

### Call site verbatim (line 41, inside `try` block):

Surrounding context (lines 39–45):
```
39:   let messages: Message[];
40:   try {
41:     messages = await getMessagesByChatId(chatId);
42:   } catch (err) {
43:     console.error('[generateInitialProfile] Failed to fetch messages:', err);
44:     return;
45:   }
```

- **Exact call site line 41:** `    messages = await getMessagesByChatId(chatId);`
- **Indentation:** 4 spaces

---

## patch.ts

**File path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\patch.ts`

### Import line verbatim (line 3):

```
import { getMessagesByChatId } from '../db/messages';
```

### Call site verbatim (line 71, inside `try` block):

Surrounding context (lines 69–75):
```
69:   let allMessages: Message[];
70:   try {
71:     allMessages = await getMessagesByChatId(chatId);
72:   } catch (err) {
73:     console.error('[patchMemoryProfile] Failed to fetch messages for chatId:', chatId, err);
74:     return;
75:   }
```

- **Exact call site line 71:** `    allMessages = await getMessagesByChatId(chatId);`
- **Variable used:** `allMessages` (not `messages`)
- **Indentation:** 4 spaces

---

## executor.ts

**File path:** `C:\Users\Alexb\Documents\RiseDialapp\lib\memory\executor.ts`

### Import block verbatim (lines 3–5):

```
import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
```

- **Line 3:** `import { checkCompressionTrigger } from './trigger';`
- **Line 4:** `import { generateInitialProfile } from './compress';`
- **Line 5:** `import { patchMemoryProfile } from './patch';`

### `triggerResult` declaration line verbatim (line 43):

```
    let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;
```

- **Keyword used:** `let` (confirmed — NOT `const`)
- **Indentation:** 4 spaces

### Step 3 early-return block verbatim (lines 51–56):

```
51:     // -----------------------------------------------------------------------
52:     // Step 3 — Early return if no compression is needed
53:     // -----------------------------------------------------------------------
54:     if (!triggerResult.shouldCompress) {
55:       return;
56:     }
```

- **`if` condition line 54:** `    if (!triggerResult.shouldCompress) {`
- **`return` line 55:** `      return;`
- **Closing `}` line 56:** `    }`

### Line immediately after closing `}` of early-return block (line 57):

```
57: (blank line)
58:     // -----------------------------------------------------------------------
59:     // Step 4 — Determine which compression function to call
```

- **Line 57 is blank.** The guard/insertion point is immediately after line 56 (after the closing `}` of the early-return block).

### Surrounding context: `triggerResult` try/catch block (lines 43–56):

```
43:     let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;
44:     try {
45:       triggerResult = await checkCompressionTrigger(chatId, userId);
46:     } catch (err) {
47:       console.error('[executeCompressionAsync] Failed to check compression trigger:', err);
48:       return;
49:     }
50: (blank)
51:     // -----------------------------------------------------------------------
52:     // Step 3 — Early return if no compression is needed
53:     // -----------------------------------------------------------------------
54:     if (!triggerResult.shouldCompress) {
55:       return;
56:     }
57: (blank)
```
