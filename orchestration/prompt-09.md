# Prompt 09: Write Auth Signup Endpoint

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

Write `risedial-production/app/api/auth/signup/route.ts` — a POST endpoint that:

1. Validates email and password using Zod (password minimum 8 characters)
2. Checks if email already exists (return 409 if so with message "An account with this email already exists.")
3. Hashes password with bcrypt at 12 rounds
4. Creates a new user record with subscription_status = 'lapsed' (active only after Stripe webhook)
5. Creates a JWT session token (HS256, 30-day expiry, payload: { user_id, subscription_status })
6. Returns the session token as an httpOnly, sameSite=strict, secure cookie named `risedial_session`
7. Returns `{ success: true }` — never exposes raw DB errors or stack traces

Read `context/app-architecture.md` for exact JWT payload structure, cookie name, and cookie flags.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/auth/signup/route.ts` exists
- [ ] File exports a `POST` handler
- [ ] Zod validation is present for email and password
- [ ] bcrypt is called with 12 rounds
- [ ] Response sets an httpOnly cookie named `risedial_session`
- [ ] No raw DB errors or stack traces returned to client
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-09-write-auth-signup-endpoint"` to `completedSteps`
2. Remove `"step-09-write-auth-signup-endpoint"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/auth/signup/route.ts"`
