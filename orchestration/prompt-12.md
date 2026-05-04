# Prompt 12: Write Password Reset Flow

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-architecture.md` — API route paths, email provider (Resend)

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

1. `risedial-production/app/api/auth/reset-request/route.ts` — POST endpoint that:
   - Accepts email in body
   - Generates a cryptographically random reset token (crypto.randomBytes)
   - Stores the hashed token (SHA-256) and expiry (1 hour from now) in the users table columns `password_reset_token` and `password_reset_expires`
   - Sends email via Resend with the reset link
   - Always returns `{ success: true }` whether or not email exists (no user enumeration)

2. `risedial-production/app/api/auth/reset-confirm/route.ts` — POST endpoint that:
   - Accepts token and new_password
   - Looks up user by hashed token, checks expiry
   - On valid: hashes new password with bcrypt 12 rounds, updates password_hash, clears reset token fields
   - On invalid/expired: returns `{ error: "This reset link is invalid or has expired." }`
   - Never exposes DB errors

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/auth/reset-request/route.ts` exists with POST handler
- [ ] File `risedial-production/app/api/auth/reset-confirm/route.ts` exists with POST handler
- [ ] reset-request returns success regardless of whether email exists
- [ ] reset-confirm checks token expiry
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-12-write-password-reset-flow"` to `completedSteps`
2. Remove `"step-12-write-password-reset-flow"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/auth/reset-request/route.ts"`, `"risedial-production/app/api/auth/reset-confirm/route.ts"`
