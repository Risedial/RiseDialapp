import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'
import { getUserById } from '@/lib/db/users'

/**
 * Retrieves existing stripe_customer_id for the user, or creates a new Stripe customer
 * and stores the resulting ID in the users table.
 * Returns the Stripe customer ID string.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  if (user.stripe_customer_id) {
    return user.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      user_id: userId,
    },
  })

  const { error } = await supabaseServer
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to store stripe_customer_id: ${error.message}`)
  }

  return customer.id
}

/**
 * Adds a premium add-on SubscriptionItem to an existing subscription.
 * Uses Stripe default proration behavior (immediate proration).
 * Returns the created SubscriptionItem.
 */
export async function addPremiumAddon(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.SubscriptionItem> {
  const subscriptionItem = await stripe.subscriptionItems.create({
    subscription: subscriptionId,
    price: priceId,
    quantity: 1,
    // proration_behavior defaults to 'create_prorations' (immediate proration)
  })

  return subscriptionItem
}

/**
 * Cancels (removes) a premium add-on SubscriptionItem from a subscription.
 * Uses proration_behavior: 'none' so deletion is effective at next billing period.
 */
export async function removePremiumAddon(subscriptionItemId: string): Promise<void> {
  await stripe.subscriptionItems.del(subscriptionItemId, {
    proration_behavior: 'none',
  })
}

/**
 * Fetches the full Stripe Subscription object for the given subscription ID.
 * Expands items.data.price for plan type and premium detection.
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  return subscription
}
