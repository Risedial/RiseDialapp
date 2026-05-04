# Prompt 17: Write Subscription Status Endpoint

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-architecture.md` — auth flow, user data fields

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/api/subscription/status/route.ts` — a GET endpoint that:
1. Is auth-gated (reads user from JWT cookie, returns 401 error if missing)
2. Fetches the current user record from the database
3. Returns `{ subscription_status, plan_type, has_premium_memory, next_billing_date }`
4. Never exposes raw DB errors — catches all exceptions and returns `{ error: "Unable to retrieve subscription status." }`
5. Used by the checkout polling screen to detect when Stripe webhook has activated the subscription

Read `context/app-architecture.md` for auth gate pattern and user data fields.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/subscription/status/route.ts` exists with GET handler
- [ ] Auth gate is present
- [ ] Response includes `subscription_status`, `plan_type`, `has_premium_memory`, `next_billing_date`
- [ ] No raw DB errors returned to client
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-17-write-subscription-status-endpoint"` to `completedSteps`
2. Remove `"step-17-write-subscription-status-endpoint"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/subscription/status/route.ts"`
