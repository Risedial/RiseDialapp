# Prompt 29: Write Async Compression Executor

## Prerequisites

state.json flags that must be true:
- `flags.openaiClientReady` must be `true` (set by step-25-write-openai-client)

Context files to read before beginning:
- `context/app-openai-config.md` — model selection (standard vs premium), retry behavior (3 retries, 1s/2s/4s backoff)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/memory/executor.ts` — exports `executeCompressionAsync(chatId: string, userId: string, hasPremium: boolean): Promise<void>`.

The function must:
1. Select compression model: `hasPremium ? 'gpt-4o' : 'gpt-4o-mini'`
2. Call `checkCompressionTrigger(chatId, userId)` to determine if/what type of compression to run
3. If `shouldCompress === false`, return immediately
4. Implement 3-retry logic with exponential backoff:
   - Attempt 1: immediate
   - On failure, wait 1000ms before attempt 2
   - On failure, wait 2000ms before attempt 3
   - On failure, wait 4000ms — then log to server console and give up
5. For initial compression: call `generateInitialProfile(chatId, userId, model)`
6. For patch: call `patchMemoryProfile(chatId, userId, model)`
7. NEVER throws to the calling context — all errors caught internally
8. Designed to be called as `void executeCompressionAsync(...)` — fire-and-forget

Read `context/app-openai-config.md` for exact retry values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/memory/executor.ts` exists
- [ ] `executeCompressionAsync` is exported
- [ ] Model selection uses `hasPremium` to choose gpt-4o vs gpt-4o-mini
- [ ] Retry logic: 3 attempts with 1s/2s/4s backoff
- [ ] Function never throws (all errors caught with try/catch)
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-29-write-async-compression-executor"` to `completedSteps`
2. Remove `"step-29-write-async-compression-executor"` from `pendingSteps`
3. Set `flags.memorySystemComplete` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/lib/memory/executor.ts"`
