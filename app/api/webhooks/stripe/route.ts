import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

const PREMIUM_PRODUCT_ID = 'prod_URPiU0OHsZuXvk'

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Idempotency check: return 200 immediately if this event was already processed
  const { data: existingEvent } = await supabaseServer
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ received: true })
  }

  // Insert event into webhook_events BEFORE processing (prevents double-processing on crash)
  await supabaseServer.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.subscription || !session.customer) {
          break
        }

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

        // Determine user_id from checkout session metadata
        const userId = session.metadata?.user_id
        if (!userId) break

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

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        let basePriceId: string
        try {
          basePriceId = getBasePriceId(subscription)
        } catch {
          break
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

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

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

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null

        if (!customerId) break

        await supabaseServer
          .from('users')
          .update({
            subscription_status: 'lapsed',
          })
          .eq('stripe_customer_id', customerId)

        break
      }

      default:
        // Unhandled event type — ignore silently
        break
    }
  } catch {
    // Never return raw errors — always return received: true
  }

  return NextResponse.json({ received: true })
}
