# Prompt 28: Write Memory Profile Patch Logic

## Prerequisites

state.json flags that must be true:
- `flags.openaiClientReady` must be `true` (set by step-25-write-openai-client)

Context files to read before beginning:
- `context/app-openai-config.md` — patch model, memory profile schema
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

Write `risedial-production/lib/memory/patch.ts` — exports `patchMemoryProfile(chatId: string, userId: string, model: string): Promise<void>`.

The function must:
1. Fetch the existing memory profile JSON for the user
2. Fetch the 10 most recent new message pairs (user + assistant) from the chat that haven't been included in previous compression
3. Construct a patch prompt that instructs the model to:
   - Review the existing profile
   - Update it with insights from the 10 new message pairs
   - The update is ADDITIVE and REVISIONARY — early context is compressed into patterns, not deleted
   - Return the complete updated profile JSON with the same schema
4. Calls `callCompression(messages, model)`
5. Updates the existing profile using `updateMemoryProfile(userId, updatedProfileJson, model)` which also sets `last_updated_at = now()`

Read `context/app-openai-config.md` and `context/app-data-schema.md` for all values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/memory/patch.ts` exists
- [ ] `patchMemoryProfile` is exported
- [ ] Existing profile is fetched before calling OpenAI
- [ ] `updateMemoryProfile` is called with the updated profile
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-28-write-memory-profile-patch-logic"` to `completedSteps`
2. Remove `"step-28-write-memory-profile-patch-logic"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/memory/patch.ts"`
