# Prompt 15: Write Subscription Checkout Endpoint

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-stripe-config.md` — Stripe Checkout session configuration, success_url, cancel_url, line_items structure

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/api/subscription/checkout/route.ts` — a POST endpoint that:

1. Is auth-gated (reads user from JWT cookie)
2. Accepts `{ planType: 'monthly' | 'annual', hasPremiumAddon: boolean }` in request body
3. Creates or retrieves Stripe customer linked to user (check stripe_customer_id in users table; create if missing)
4. Creates a Stripe Checkout session with:
   - `mode: 'subscription'`
   - `line_items`: base plan price as first item; if hasPremiumAddon, premium add-on as second line item
   - `success_url`: `${process.env.NEXTAUTH_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `${process.env.NEXTAUTH_URL}/plan-selection`
   - `customer`: the Stripe customer ID
   - `metadata`: `{ user_id }`
5. Returns `{ url: checkoutSession.url }`

Read `context/app-stripe-config.md` for all configuration values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/api/subscription/checkout/route.ts` exists with POST handler
- [ ] Auth gate is present (returns error if no valid session)
- [ ] Stripe customer is created or retrieved before creating checkout session
- [ ] success_url includes `{CHECKOUT_SESSION_ID}` parameter
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-15-write-subscription-checkout-endpoint"` to `completedSteps`
2. Remove `"step-15-write-subscription-checkout-endpoint"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/api/subscription/checkout/route.ts"`
