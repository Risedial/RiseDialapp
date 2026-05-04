import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getPlanTypeFromPriceId(priceId: string): 'monthly' | 'annual' {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly'
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual'
  throw new Error(`Unknown base price ID: ${priceId}`)
}

function detectPremiumItem(subscription: Stripe.Subscription): {
  hasPremiumMemory: boolean
  premiumItemId: string | null
} {
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (
      priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON ||
      priceId === process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON
    ) {
      return { hasPremiumMemory: true, premiumItemId: item.id }
    }
  }
  return { hasPremiumMemory: false, premiumItemId: null }
}

function getBasePriceId(subscription: Stripe.Subscription): string {
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (
      priceId === process.env.STRIPE_PRICE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ANNUAL
    ) {
      return priceId
    }
  }
  throw new Error('No base plan price found on subscription')
}

// ─── Event Handlers ────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (!session.subscription || !session.customer) return

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer.id

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  const basePriceId = getBasePriceId(subscription)
  const planType = getPlanTypeFromPriceId(basePriceId)
  const { hasPremiumMemory, premiumItemId } = detectPremiumItem(subscription)
  const nextBillingDate = new Date(subscription.items.data[0].current_period_end * 1000).toISOString()

  const userId = session.metadata?.user_id
  if (!userId) return

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_type: planType,
      next_billing_date: nextBillingDate,
      has_premium_memory: hasPremiumMemory,
      stripe_premium_item_id: premiumItemId,
    })
    .eq('id', userId)
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  let basePriceId: string
  try {
    basePriceId = getBasePriceId(subscription)
  } catch {
    return
  }

  const planType = getPlanTypeFromPriceId(basePriceId)
  const { hasPremiumMemory, premiumItemId } = detectPremiumItem(subscription)
  const nextBillingDate = new Date(subscription.items.data[0].current_period_end * 1000).toISOString()

  await supabaseServer
    .from('users')
    .update({
      plan_type: planType,
      has_premium_memory: hasPremiumMemory,
      next_billing_date: nextBillingDate,
      stripe_premium_item_id: premiumItemId,
    })
    .eq('stripe_customer_id', customerId)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'lapsed',
      subscription_lapsed_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : (invoice.customer as Stripe.Customer)?.id ?? null

  if (!customerId) return

  await supabaseServer
    .from('users')
    .update({
      subscription_status: 'lapsed',
    })
    .eq('stripe_customer_id', customerId)
}

// ─── Public Exports ────────────────────────────────────────────────────────────

/**
 * Verifies the Stripe webhook signature using STRIPE_WEBHOOK_SECRET.
 * Throws if the signature is invalid.
 * Returns the parsed Stripe.Event on success.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

/**
 * Routes a verified Stripe.Event to the appropriate handler.
 * Handles exactly 4 event types:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_failed
 *
 * Implements idempotency: skips processing if the event has already been
 * recorded in webhook_events, otherwise pre-inserts before dispatching.
 *
 * Unhandled event types are silently ignored.
 */
export async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
  // ── Idempotency check ──────────────────────────────────────────────────────
  const { data: existingEvent } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent) return

  // ── Pre-insert event record ────────────────────────────────────────────────
  await supabaseServer
    .from('webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    })

  // ── Dispatch to handler ────────────────────────────────────────────────────
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice
      )
      break

    default:
      // Unhandled event type — ignore silently
      break
  }
}
