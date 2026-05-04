# Prompt 27: Write Initial Memory Profile Generation

## Prerequisites

state.json flags that must be true:
- `flags.openaiClientReady` must be `true` (set by step-25-write-openai-client)
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-openai-config.md` — compression model, memory profile JSON schema
- `context/app-data-schema.md` — memory_profiles table columns

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/memory/compress.ts` — exports `generateInitialProfile(chatId: string, userId: string, model: string): Promise<void>`.

The function must:
1. Fetch all messages from the chat (both user and assistant) using the DB utility
2. Construct a compression prompt instructing the model to analyze the conversation and output a structured JSON profile
3. The JSON output schema must use EXACTLY these field names (from design_decisions.md):
   ```json
   {
     "version": 1,
     "generatedAt": "ISO-8601 timestamp",
     "lastUpdatedAt": "ISO-8601 timestamp",
     "sourceChats": [{ "chat_id": "uuid", "deleted_at": null }],
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
4. Calls `callCompression(messages, model)` from the OpenAI client
5. Stores the result in `memory_profiles` table using `createMemoryProfile(userId, profileJson, model)`

Read `context/app-openai-config.md` for the exact schema field names.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/memory/compress.ts` exists
- [ ] `generateInitialProfile` is exported
- [ ] All 8 profile field names are present: coreThemes, emotionalPatterns, worldview, challenges, values, blindspots, memorableStatements, clinicalObservations
- [ ] Profile is stored in memory_profiles table
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-27-write-initial-memory-profile-generation"` to `completedSteps`
2. Remove `"step-27-write-initial-memory-profile-generation"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/memory/compress.ts"`
