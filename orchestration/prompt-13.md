# Prompt 13: Write Session Utilities

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write 2 files:

1. `risedial-production/lib/auth/session.ts` — exports:
   - `createSession(userId: string, subscriptionStatus: string): string` — creates HS256 JWT with 30-day expiry, payload `{ user_id, subscription_status }`
   - `verifySession(token: string): { user_id: string, subscription_status: string } | null` — verifies JWT, returns null on any error
   - `setSessionCookie(response: NextResponse, token: string): void` — sets httpOnly, sameSite=strict, secure cookie named `risedial_session` with 30-day maxAge
   - `clearSessionCookie(response: NextResponse): void` — clears `risedial_session` cookie

2. `risedial-production/lib/auth/getUser.ts` — exports:
   - `getUserFromRequest(request: NextRequest): { user_id: string, subscription_status: string } | null` — reads `risedial_session` cookie from request, verifies JWT, returns payload or null

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/auth/session.ts` exists with all 4 exports
- [ ] File `risedial-production/lib/auth/getUser.ts` exists with 1 export
- [ ] JWT algorithm is HS256
- [ ] Cookie name is `risedial_session`
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-13-write-session-utilities"` to `completedSteps`
2. Remove `"step-13-write-session-utilities"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/auth/session.ts"`, `"risedial-production/lib/auth/getUser.ts"`
