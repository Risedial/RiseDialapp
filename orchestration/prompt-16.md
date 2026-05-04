# Prompt 16: Write Stripe Webhook Handler

## Prerequisites

state.json flags that must be true:
- `flags.supabaseClientReady` must be `true` (set by step-08-write-supabase-client-utilities)

Context files to read before beginning:
- `context/app-stripe-config.md` — webhook events and their exact handling behavior
- `context/app-data-schema.md` — users table columns written by webhook

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/api/webhooks/stripe/route.ts` — a POST endpoint that:

1. Reads the raw request body and `stripe-signature` header
2. Verifies the Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`
3. Checks `webhook_events` table for existing `stripe_event_id` — if found, returns 200 immediately (idempotency)
4. Inserts the event into `webhook_events` table before processing
5. Handles exactly these 4 events:
   - `checkout.session.completed`: sets subscription_status='active', stripe_customer_id, stripe_subscription_id, plan_type, next_billing_date in users table
   - `customer.subscription.updated`: updates plan_type, has_premium_memory (check if premium add-on item exists in subscription), next_billing_date, stripe_premium_item_id
   - `customer.subscription.deleted`: sets subscription_status='lapsed', subscription_lapsed_at=now()
   - `invoice.payment_failed`: sets subscription_status='lapsed'
6. This endpoint is the SOLE writer of subscription_status — no other route may write it
7. Returns `{ received: true }` on success; never returns raw DB errors

Read `context/app-stripe-config.md` for exact event handling behavior per event type.
Read `context/app-data-schema.md` for exact column names.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/webhooks/stripe/route.ts` exists with POST handler
- [ ] Stripe signature verification is present on every request
- [ ] Idempotency check against webhook_events table is present
- [ ] All 4 webhook events are handled
- [ ] No other subscription_status writes exist in this file (webhook is sole writer)
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-16-write-stripe-webhook-handler"` to `completedSteps`
2. Remove `"step-16-write-stripe-webhook-handler"` from `pendingSteps`
3. Set `flags.stripeLayerComplete` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/app/api/webhooks/stripe/route.ts"`
