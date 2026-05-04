# Prompt 34: Write Subscription Gating Middleware

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-architecture.md` — auth flow, subscription_status values

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/auth/subscription-gate.ts` — exports `requireActiveSubscription(userId: string): Promise<{ allowed: boolean, status: string }>`.

The function must:
1. Fetch the user record from the database
2. Check `subscription_status` field
3. If `subscription_status === 'active'`: return `{ allowed: true, status: 'active' }`
4. If status is 'lapsed' or 'cancelled': return `{ allowed: false, status: subscription_status }`
5. On database error: return `{ allowed: false, status: 'error' }` — NEVER throw or return raw DB error

This function is used by the chat message endpoint to gate access to Rise.

Read `context/app-architecture.md` for subscription_status values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/auth/subscription-gate.ts` exists
- [ ] `requireActiveSubscription` is exported
- [ ] Function returns `{ allowed: true }` only for `subscription_status === 'active'`
- [ ] Errors return `{ allowed: false }` — never thrown
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-34-write-subscription-gating-middleware"` to `completedSteps`
2. Remove `"step-34-write-subscription-gating-middleware"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/auth/subscription-gate.ts"`
