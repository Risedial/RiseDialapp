# Prompt 18: Write Subscription Portal and Premium Toggle

## Prerequisites

state.json flags that must be true:
- `flags.stripeLayerComplete` must be `true` (set by step-16-write-stripe-webhook-handler)

Context files to read before beginning:
- `context/app-stripe-config.md` — Stripe Customer Portal configuration, add-on subscription item management

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

1. `risedial-production/app/api/subscription/portal/route.ts` — POST endpoint that:
   - Is auth-gated
   - Fetches user's stripe_customer_id
   - Creates a Stripe Customer Portal session with `return_url: process.env.NEXTAUTH_URL + '/settings'`
   - Returns `{ url: portalSession.url }`

2. `risedial-production/app/api/subscription/premium-toggle/route.ts` — PATCH endpoint that:
   - Is auth-gated
   - Accepts `{ enable: boolean }` in body
   - Fetches user's stripe_subscription_id and stripe_premium_item_id
   - If enabling: adds the premium add-on as a new SubscriptionItem on the existing subscription (use correct price ID based on monthly/annual plan)
   - If disabling: removes the SubscriptionItem with stripe_premium_item_id (cancel at period end)
   - Updates `has_premium_memory` and `stripe_premium_item_id` in users table
   - Returns `{ success: true, has_premium_memory: boolean }`

Read `context/app-stripe-config.md` for premium add-on price IDs and subscription item management.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/subscription/portal/route.ts` exists with POST handler
- [ ] File `risedial-production/app/api/subscription/premium-toggle/route.ts` exists with PATCH handler
- [ ] Portal endpoint creates a Customer Portal session with return_url
- [ ] Premium toggle adds/removes SubscriptionItem on existing subscription
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-18-write-subscription-portal-premium-toggle"` to `completedSteps`
2. Remove `"step-18-write-subscription-portal-premium-toggle"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/subscription/portal/route.ts"`, `"risedial-production/app/api/subscription/premium-toggle/route.ts"`
