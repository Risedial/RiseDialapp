# Prompt 11: Write Auth Middleware

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-architecture.md` — protected routes list, JWT verification, structured error format

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/middleware.ts` — Next.js middleware that:

1. Runs on all routes matching `/api/chat/:path*`, `/api/memory/:path*`, `/api/subscription/:path*`
2. Reads the `risedial_session` cookie from the request
3. Verifies the JWT (HS256) using JWT_SECRET
4. On missing cookie: returns `{ error: "Authentication required." }` as JSON (never raw HTTP 401 status text)
5. On invalid/expired token: returns `{ error: "Your session has expired. Sign in to continue." }` as JSON
6. On valid token: attaches user_id and subscription_status to request headers for downstream routes
7. Uses Next.js `matcher` config to only run on protected routes

Read `context/app-architecture.md` for the exact list of protected routes and error response format.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/middleware.ts` exists
- [ ] Middleware config `matcher` includes `/api/chat/:path*`, `/api/memory/:path*`, `/api/subscription/:path*`
- [ ] JWT verification is present
- [ ] Expired token error returns exact string: "Your session has expired. Sign in to continue."
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-11-write-auth-middleware"` to `completedSteps`
2. Remove `"step-11-write-auth-middleware"` from `pendingSteps`
3. Set `flags.authLayerComplete` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/middleware.ts"`
