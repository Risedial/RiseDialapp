# Prompt 19: Write Stripe Utilities

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

Context files to read before beginning:
- `context/app-stripe-config.md` — Stripe webhook events, subscription item management, proration behavior

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

1. `risedial-production/lib/stripe/subscription.ts` — exports:
   - `getOrCreateStripeCustomer(userId: string, email: string): Promise<string>` — retrieves existing stripe_customer_id or creates new Stripe customer and stores ID
   - `addPremiumAddon(subscriptionId: string, priceId: string): Promise<Stripe.SubscriptionItem>` — adds premium add-on SubscriptionItem to existing subscription
   - `removePremiumAddon(subscriptionItemId: string): Promise<void>` — cancels add-on SubscriptionItem
   - `getSubscriptionDetails(subscriptionId: string): Promise<Stripe.Subscription>` — fetches full subscription object

2. `risedial-production/lib/stripe/webhooks.ts` — exports:
   - `verifyWebhookSignature(body: string, signature: string): Stripe.Event` — verifies Stripe signature using STRIPE_WEBHOOK_SECRET, throws on failure
   - `routeWebhookEvent(event: Stripe.Event): Promise<void>` — routes the 4 handled event types to their handlers

Read `context/app-stripe-config.md` for all values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/stripe/subscription.ts` exists with all 4 exports
- [ ] File `risedial-production/lib/stripe/webhooks.ts` exists with both exports
- [ ] `verifyWebhookSignature` uses STRIPE_WEBHOOK_SECRET
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-19-write-stripe-utilities"` to `completedSteps`
2. Remove `"step-19-write-stripe-utilities"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/stripe/subscription.ts"`, `"risedial-production/lib/stripe/webhooks.ts"`
