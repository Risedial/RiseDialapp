# Step 04: M3-B — Fix B: Consolidate Stripe webhook handlers into lib

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-04" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-04"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\data-schema.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix B from Module 3: Add idempotency pre-insert logic to `routeWebhookEvent` in `lib/stripe/webhooks.ts` so this lib file is the single source of truth for webhook processing.

**Do NOT move `verifyWebhookSignature`** — it is already in `lib/stripe/webhooks.ts`.

**Sub-step 1 — Read the current file:**
Read `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts` in full before making any changes.

**Sub-step 2 — Write the corrected file:**
Write `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts` with the idempotency check added to `routeWebhookEvent`. The complete file after Fix B:

- Imports: `Stripe`, `stripe` from `@/lib/stripe/config`, `supabaseServer` from `@/lib/supabase/server`
- Helper functions unchanged: `getPlanTypeFromPriceId`, `detectPremiumItem`, `getBasePriceId`
- Event handlers unchanged: `handleCheckoutSessionCompleted`, `handleSubscriptionUpdated`, `handleSubscriptionDeleted`, `handleInvoicePaymentFailed`
  - NOTE: `handleInvoicePaymentFailed` uses `(invoice.customer as Stripe.Customer)?.id ?? null` — this cast is permitted here (do NOT change it to `as string`)
- `verifyWebhookSignature` export: unchanged
- `routeWebhookEvent` export: add idempotency check at the top (before the switch statement):
  1. Query `webhook_events` table with `.select('id').eq('stripe_event_id', event.id).maybeSingle()`
  2. If `existingEvent` found: `return` immediately
  3. Pre-insert event: `supabaseServer.from('webhook_events').insert({ stripe_event_id: event.id, event_type: event.type, payload: event as unknown as Record<string, unknown> })`
  4. Then the existing switch statement for the 4 event types

The billing date field must use `subscription.items.data[0].current_period_end` — never `subscription.current_period_end`.
The idempotency field name is `stripe_event_id` (from data-schema.md).
The webhook table name is `webhook_events` (from data-schema.md).

**Sub-step 3 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 4 — Commit:**
Stage: `git add lib/stripe/webhooks.ts`
Commit message: `fix(B): add idempotency pre-insert to routeWebhookEvent in lib/stripe/webhooks.ts`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\lib\stripe\webhooks.ts` exports `verifyWebhookSignature` and `routeWebhookEvent`
- [ ] `routeWebhookEvent` contains an idempotency check querying `webhook_events` by `stripe_event_id`
- [ ] `routeWebhookEvent` inserts into `webhook_events` BEFORE processing the switch statement
- [ ] All 4 event types are handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Billing date uses `subscription.items.data[0].current_period_end` (not bare `current_period_end`)
- [ ] `npx tsc --noEmit` exits 0 after this change
- [ ] `git log --oneline` shows a new commit with message containing `fix(B)`
- [ ] No other files were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-04" from pendingSteps to completedSteps
- Set steps["prompt-04"].status = "complete"
