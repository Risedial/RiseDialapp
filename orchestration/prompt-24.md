# Prompt 24: Write Server-Side Rate Limiting

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-data-schema.md` — rate_limit_tracking table columns

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/rise/rate-limit.ts` — exports 2 functions:

1. `checkRateLimit(userId: string): Promise<{ allowed: boolean, remaining: number }>` — using the rate_limit_tracking table:
   - Finds or creates the current 60-minute window record for the user
   - A window starts when the first message is sent; window_start is that timestamp
   - 60-minute rolling window: if window_start is > 60 minutes ago, start a new window
   - Returns `{ allowed: message_count < 60, remaining: Math.max(0, 60 - message_count) }`

2. `recordMessage(userId: string): Promise<void>` — increments message_count in current window (or creates new window if expired). Called after a message is successfully sent.

Rate limit: 60 messages per 60-minute rolling window, enforced server-side.

Read `context/app-data-schema.md` for exact column names in rate_limit_tracking.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/rise/rate-limit.ts` exists
- [ ] `checkRateLimit` is exported
- [ ] `recordMessage` is exported
- [ ] 60-message limit and 60-minute window are used
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-24-write-server-side-rate-limiting"` to `completedSteps`
2. Remove `"step-24-write-server-side-rate-limiting"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/rise/rate-limit.ts"`
