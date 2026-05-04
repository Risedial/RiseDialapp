# Prompt 23: Write Chat Message Endpoint

## Prerequisites

state.json flags that must be true:
- `flags.openaiClientReady` must be `true` (set by step-25-write-openai-client)
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-architecture.md` — API route structure, auth gate pattern
- `context/app-rise-system.md` — API message structure
- `context/app-openai-config.md` — model, timeout, non-streaming config

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/api/chat/[chatId]/message/route.ts` — a POST endpoint that:
1. Is auth-gated and subscription-gated (return structured error if not active)
2. Checks rate limit via `checkRateLimit(userId)` — if not allowed, returns `{ error: "Rise needs a moment. Try again in a few seconds." }`
3. Reads message content from body; if > 4000 chars, truncates to 4000 and sets `truncation_warning = true`
4. Persists the user message to the database with `user_message_index`
5. Fetches memory profile for user
6. Fetches rolling window of messages
7. Builds API message array using `buildApiMessages()`
8. Calls OpenAI non-streaming with 30-second timeout using `callRise()`
9. Persists the assistant message to the database
10. Triggers async compression check: `void executeCompressionAsync(chatId, userId, hasPremium)` — non-blocking
11. Records the message in rate limit tracking
12. Returns `{ content: assistantMessage, truncation_warning: boolean }`

Read `context/app-openai-config.md` for model and timeout values.
Read `context/app-rise-system.md` for message structure.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/chat/[chatId]/message/route.ts` exists with POST handler
- [ ] Auth gate is present
- [ ] Rate limit check is present with exact error message
- [ ] Truncation at 4000 chars with truncation_warning flag
- [ ] `executeCompressionAsync` is called with `void` (non-blocking fire-and-forget)
- [ ] No streaming — response awaited in full
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-23-write-chat-message-endpoint"` to `completedSteps`
2. Remove `"step-23-write-chat-message-endpoint"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/chat/[chatId]/message/route.ts"`
