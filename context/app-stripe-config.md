# App Stripe Configuration
**Role:** Stripe integration spec with actual price IDs, webhook events, subscription item management, proration behavior, and checkout configuration
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** Prompts 14–19, 37, 42
**Date:** 2026-05-02

---

## CRITICAL VALUES (Read before any other section)

### Stripe Price IDs (LIVE — actual values)

| Environment Variable | Price ID | Amount | Interval |
|---|---|---|---|
| `STRIPE_PRICE_MONTHLY` | `price_1TSWsnFPwzRLOpQRVaSCoz6G` | $25.00/month | month |
| `STRIPE_PRICE_ANNUAL` | `price_1TSWsoFPwzRLOpQRzbOBL8Ik` | $199.00/year | year |
| `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON` | `price_1TSWspFPwzRLOpQRSs8MXxW4` | $6.25/month | month |
| `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON` | `price_1TSWspFPwzRLOpQRclkgNGop` | $50.00/year | year |

### Stripe Product IDs (for reference)

| Product | Product ID |
|---|---|
| RiseDial Base Plan | `prod_URPiQHSlueJU5C` |
| RiseDial Premium Memory Add-on | `prod_URPiU0OHsZuXvk` |

### Stripe Account
- Account ID: `acct_1RVzvFFPwzRLOpQR`
- Account name: TheAlexBitar
- Mode: LIVE

---

## SECTION 1: PRICING DISPLAY VALUES

| Display Context | Value |
|---|---|
| Monthly base price | $25.00/month |
| Annual base price | $199.00/year |
| Annual savings callout badge | "Save $101/year" |
| Premium add-on (monthly) | +$6.25/month |
| Premium add-on (annual) | +$50.00/year |
| Monthly + Premium combined | $31.25/month |
| Annual + Premium combined | $249.00/year |

---

## SECTION 2: WEBHOOK EVENTS (exactly 4 — no more, no less)

### 1. `checkout.session.completed`
**Trigger:** User completes Stripe Checkout

**Actions:**
- Set `subscription_status = 'active'`
- Set `stripe_customer_id` from `session.customer`
- Set `stripe_subscription_id` from `session.subscription`
- Set `plan_type` — determine from subscription price ID: monthly → 'monthly', annual → 'annual'
- Set `next_billing_date` from subscription `current_period_end` (convert Unix timestamp to timestamptz)
- Check if premium add-on item exists on subscription → set `has_premium_memory` accordingly

### 2. `customer.subscription.updated`
**Trigger:** Subscription modified (plan change, add-on added/removed, renewal)

**Actions:**
- Update `plan_type` based on base plan price ID
- Update `has_premium_memory` (true if premium add-on SubscriptionItem exists on subscription)
- Update `next_billing_date` from `current_period_end`
- Update `stripe_premium_item_id` — set to add-on SubscriptionItem ID if present, null if removed

### 3. `customer.subscription.deleted`
**Trigger:** Subscription cancelled/deleted

**Actions:**
- Set `subscription_status = 'lapsed'`
- Set `subscription_lapsed_at = now()`
- Do NOT log user out — session preserved

### 4. `invoice.payment_failed`
**Trigger:** Recurring payment fails

**Actions:**
- Set `subscription_status = 'lapsed'`
- Do NOT log user out — session preserved

---

## SECTION 3: WEBHOOK HANDLER RULES

1. **Signature verification:** Every webhook request must verify `stripe-signature` header using `STRIPE_WEBHOOK_SECRET` before processing
2. **Idempotency:** Check `webhook_events` table for existing `stripe_event_id` — if found, return `{ received: true }` immediately without re-processing
3. **Record first:** Insert event into `webhook_events` table BEFORE processing (prevents double-processing on crash)
4. **Sole writer:** The webhook handler is the ONLY code that writes `subscription_status` — no other route may set this field
5. **Never return raw errors:** Always return `{ received: true }` on success; never expose DB errors or stack traces

---

## SECTION 4: CHECKOUT SESSION CONFIGURATION

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: stripeCustomerId,
  line_items: [
    {
      price: basePriceId,  // STRIPE_PRICE_MONTHLY or STRIPE_PRICE_ANNUAL
      quantity: 1,
    },
    // If hasPremiumAddon:
    {
      price: premiumPriceId,  // STRIPE_PRICE_PREMIUM_MONTHLY_ADDON or STRIPE_PRICE_PREMIUM_ANNUAL_ADDON
      quantity: 1,
    },
  ],
  success_url: `${process.env.NEXTAUTH_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXTAUTH_URL}/plan-selection`,
  metadata: {
    user_id: userId,
  },
})
```

---

## SECTION 5: PREMIUM ADD-ON SUBSCRIPTION ITEM MANAGEMENT

The Premium Memory add-on is a **separate SubscriptionItem** on the SAME Stripe subscription — NOT a separate subscription.

### Adding the add-on (enabling Premium Memory)
```typescript
const subscriptionItem = await stripe.subscriptionItems.create({
  subscription: stripeSubscriptionId,
  price: planType === 'monthly'
    ? process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON
    : process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON,
  quantity: 1,
  // proration_behavior defaults to 'create_prorations' (immediate proration)
})
// Store subscriptionItem.id in users.stripe_premium_item_id
// Set users.has_premium_memory = true
```

### Removing the add-on (disabling Premium Memory)
```typescript
await stripe.subscriptionItems.del(
  stripePremiuItemId,
  { proration_behavior: 'none' }  // effective at period end
)
// Set users.stripe_premium_item_id = null
// Set users.has_premium_memory = false
```

---

## SECTION 6: PRORATION BEHAVIOR

| Action | Proration |
|---|---|
| Enabling Premium add-on | Immediate proration (Stripe default — charged immediately for remainder of period) |
| Disabling Premium add-on | Effective at next billing period (no immediate refund) |
| Subscription cancellation | Immediate (only on account deletion) |

---

## SECTION 7: CUSTOMER PORTAL CONFIGURATION

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXTAUTH_URL}/settings`,
})
// Return portalSession.url to client for redirect
```

Portal allows users to: update payment method, view invoices, cancel subscription.

---

## SECTION 8: PLAN TYPE DETECTION FROM PRICE ID

```typescript
function getPlanTypeFromPriceId(priceId: string): 'monthly' | 'annual' {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly'
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual'
  throw new Error(`Unknown base price ID: ${priceId}`)
}
```

---

## USAGE INSTRUCTIONS FOR SUB-AGENTS

Before beginning any task in a fresh session:
1. Read this file in full
2. Use the actual price IDs from Section 1 — never use placeholders
3. All 4 webhook events must be handled — no more, no less
4. The webhook handler is the SOLE writer of subscription_status
5. Premium add-on is a SubscriptionItem — not a separate subscription
6. success_url MUST include `{CHECKOUT_SESSION_ID}` placeholder for Stripe to inject session ID
