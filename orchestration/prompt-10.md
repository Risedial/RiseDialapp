# Prompt 10: Write Auth Signin and Signout Endpoints

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-architecture.md` — auth flow, JWT session format, cookie flags

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

1. `risedial-production/app/api/auth/signin/route.ts` — POST endpoint that:
   - Validates email + password with Zod
   - Fetches user by email
   - Compares password with bcrypt
   - On mismatch: returns `{ error: "Invalid email or password." }` — never reveal which field is wrong
   - On success: creates JWT (HS256, 30-day expiry, payload: { user_id, subscription_status })
   - Sets httpOnly sameSite=strict secure cookie named `risedial_session`
   - Returns `{ success: true, subscription_status }`

2. `risedial-production/app/api/auth/signout/route.ts` — POST endpoint that:
   - Clears the `risedial_session` cookie (set maxAge=0)
   - Returns `{ success: true }`

Read `context/app-architecture.md` for exact JWT payload, cookie name, and flags.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/auth/signin/route.ts` exists with POST handler
- [ ] File `risedial-production/app/api/auth/signout/route.ts` exists with POST handler
- [ ] Signin does NOT differentiate between wrong email vs wrong password in error response
- [ ] Signout clears the cookie
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-10-write-auth-signin-signout-endpoints"` to `completedSteps`
2. Remove `"step-10-write-auth-signin-signout-endpoints"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/auth/signin/route.ts"`, `"risedial-production/app/api/auth/signout/route.ts"`
