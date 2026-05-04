# App OpenAI Configuration
**Role:** OpenAI model selections, token limits, compression schema, API call patterns — prevents sub-agents from using wrong models or approximations
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** Prompts 23, 25, 27–29
**Date:** 2026-05-02

---

## CRITICAL VALUES (Read before any other section)

| Parameter | Value |
|---|---|
| Chat model | `gpt-4o-mini` |
| Standard compression model | `gpt-4o-mini` |
| Premium compression model | `gpt-4o` |
| Rolling window max pairs | 40 user+assistant pairs |
| Rolling window max tokens | 12,000 tokens |
| Token approximation | 4 characters = 1 token (`Math.floor(content.length / 4)`) |
| Which limit wins | Whichever is reached first; oldest pairs dropped first |
| API timeout | 30,000 ms (30 seconds) |
| Streaming | `false` — non-streaming, response awaited in full |
| temperature | 0.7 |
| max_tokens (chat) | 1024 |
| top_p | 1 |
| frequency_penalty | 0 |
| presence_penalty | 0 |

---

## SECTION 1: CHAT API CALL PARAMETERS

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: messages,  // built by buildApiMessages()
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stream: false,
})
```

---

## SECTION 2: ROLLING CONTEXT WINDOW ALGORITHM

```typescript
function buildMessageWindow(
  messages: Message[],
  maxPairs: number = 40,
  maxTokens: number = 12000
): Message[] {
  // Token approximation: Math.floor(content.length / 4) per message
  // Start from most recent, work backwards
  // Drop oldest pairs (user + assistant) when either limit is hit
  // Return in chronological order (oldest first)
}
```

**Token counting:**
```typescript
function countTokens(content: string): number {
  return Math.floor(content.length / 4)
}
```

**Limits (both checked — whichever triggers first):**
- Pair limit: 40 user+assistant pairs
- Token limit: 12,000 total tokens across all messages in window

---

## SECTION 3: TIMEOUT IMPLEMENTATION

```typescript
async function callRise(messages: object[], timeout: number = 30000): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI request timeout')), timeout)
  )

  const apiPromise = openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  const response = await Promise.race([apiPromise, timeoutPromise])
  return response.choices[0].message.content ?? ''
}
```

---

## SECTION 4: MEMORY COMPRESSION MODELS

| User Plan | Compression Model |
|---|---|
| Base plan (standard) | `gpt-4o-mini` |
| With Premium Memory add-on | `gpt-4o` |

**Model selection logic:**
```typescript
const model = hasPremium ? 'gpt-4o' : 'gpt-4o-mini'
```

**Note:** Switching the add-on on/off does NOT regenerate the existing profile. The new model is used on the NEXT update cycle (next trigger at message 60, 70, etc.).

---

## SECTION 5: MEMORY COMPRESSION TRIGGER RULES

| Trigger | Condition | Type |
|---|---|---|
| Initial compression | `userMessageCount === 50` | `isInitial: true` |
| Patch update | `userMessageCount > 50 AND (userMessageCount - 50) % 10 === 0` | `isPatch: true` |
| No trigger | All other counts | `shouldCompress: false` |

Only user messages (role='user') are counted — assistant messages do not count toward the trigger.

---

## SECTION 6: RETRY BEHAVIOR FOR COMPRESSION

```typescript
const delays = [1000, 2000, 4000]  // ms

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    await compressionFunction(...)
    return  // success
  } catch (error) {
    if (attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, delays[attempt]))
    } else {
      console.error('[Memory compression failed after 3 retries]', error)
      // NEVER throw — this is fire-and-forget
    }
  }
}
```

**Failure policy:** 3 attempts total with 1s/2s/4s delays. After all 3 fail: server-side log only. NEVER surface to user. NEVER throw to calling context.

---

## SECTION 7: MEMORY PROFILE JSON SCHEMA (exact field names)

```json
{
  "version": 1,
  "generatedAt": "2026-05-02T00:00:00.000Z",
  "lastUpdatedAt": "2026-05-02T00:00:00.000Z",
  "sourceChats": [
    { "chat_id": "uuid-string", "deleted_at": null }
  ],
  "profile": {
    "coreThemes": ["string array"],
    "emotionalPatterns": ["string array"],
    "worldview": ["string array"],
    "challenges": ["string array"],
    "values": ["string array"],
    "blindspots": ["string array"],
    "memorableStatements": ["string array"],
    "clinicalObservations": ["string array"]
  }
}
```

**Field names are exact — do not rename, add, or remove any field.**

---

## SECTION 8: SERVER-ONLY GUARD

The OpenAI client (`lib/openai/client.ts`) MUST start with:

```typescript
import 'server-only'
```

This prevents the OpenAI API key from being exposed to the browser. The `server-only` package causes a build error if this file is imported in a client component.

---

## SECTION 9: COMPRESSION PROMPT STRUCTURE

### Initial profile generation prompt (for generateInitialProfile):
```
Analyze the following conversation between a user and Rise (an AI companion) and generate a structured JSON psychological profile of the user.

The profile must capture patterns, themes, and observations across the entire conversation.

Output ONLY valid JSON matching this exact schema:
{
  "version": 1,
  "generatedAt": "[current ISO-8601 timestamp]",
  "lastUpdatedAt": "[current ISO-8601 timestamp]",
  "sourceChats": [{ "chat_id": "[chatId]", "deleted_at": null }],
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

Conversation:
[messages]
```

### Patch update prompt (for patchMemoryProfile):
```
You are updating an existing psychological profile of a user based on 10 new message pairs from their conversation with Rise.

Existing profile:
[existingProfileJSON]

New messages:
[10 new message pairs]

Update the profile additively and revisionally:
- Add new insights, patterns, and themes you observe
- Refine or expand existing entries based on new evidence
- Early context is compressed into patterns — do not delete insights
- Update "lastUpdatedAt" to the current timestamp

Output ONLY the complete updated JSON profile matching the original schema exactly.
```

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. Chat model is always `gpt-4o-mini` — use exact string
3. Compression model is `hasPremium ? 'gpt-4o' : 'gpt-4o-mini'`
4. Token approximation is `Math.floor(content.length / 4)` — not a word counter
5. Timeout is 30,000 ms using Promise.race pattern
6. `import 'server-only'` must be first import in openai/client.ts
7. Memory compression NEVER throws to calling context — all errors caught internally
