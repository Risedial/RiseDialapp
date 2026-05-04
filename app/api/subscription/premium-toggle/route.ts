import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById, updateUser } from '@/lib/db/users'
import { stripe, PLAN_PRICES } from '@/lib/stripe/config'

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  // Auth gate — read user from JWT cookie
  const session = await getUserFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }

  const { user_id } = session

  // Parse and validate request body
  let enable: boolean
  try {
    const body = await request.json()
    if (typeof body.enable !== 'boolean') {
      return NextResponse.json(
        { error: 'Request body must include "enable" as a boolean.' },
        { status: 400 }
      )
    }
    enable = body.enable
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body.' },
      { status: 400 }
    )
  }

  try {
    // Fetch current user record from the database
    const user = await getUserById(user_id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    if (!user.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found for this user.' },
        { status: 400 }
      )
    }

    if (enable) {
      // Enabling premium: add the premium add-on as a new SubscriptionItem
      if (user.has_premium_memory) {
        return NextResponse.json(
          { error: 'Premium memory is already enabled.' },
          { status: 400 }
        )
      }

      if (!user.plan_type) {
        return NextResponse.json(
          { error: 'Unable to determine plan type for premium add-on pricing.' },
          { status: 400 }
        )
      }

      // Determine the correct premium add-on price ID based on monthly/annual plan
      const premiumAddonPriceId = PLAN_PRICES[user.plan_type].premiumAddon

      // Add the premium add-on as a new SubscriptionItem on the existing subscription
      const subscriptionItem = await stripe.subscriptionItems.create({
        subscription: user.stripe_subscription_id,
        price: premiumAddonPriceId,
        quantity: 1,
      })

      // Update has_premium_memory and stripe_premium_item_id in users table
      await updateUser(user_id, {
        has_premium_memory: true,
        stripe_premium_item_id: subscriptionItem.id,
      })

      return NextResponse.json({
        success: true,
        has_premium_memory: true,
      })
    } else {
      // Disabling premium: remove the SubscriptionItem with stripe_premium_item_id
      if (!user.has_premium_memory) {
        return NextResponse.json(
          { error: 'Premium memory is not currently enabled.' },
          { status: 400 }
        )
      }

      if (!user.stripe_premium_item_id) {
        return NextResponse.json(
          { error: 'No premium subscription item found to remove.' },
          { status: 400 }
        )
      }

      // Delete the premium add-on SubscriptionItem, cancelling at period end
      await stripe.subscriptionItems.del(user.stripe_premium_item_id, {
        proration_behavior: 'none',
        clear_usage: undefined,
      })

      // Update has_premium_memory and stripe_premium_item_id in users table
      await updateUser(user_id, {
        has_premium_memory: false,
        stripe_premium_item_id: null,
      })

      return NextResponse.json({
        success: true,
        has_premium_memory: false,
      })
    }
  } catch {
    return NextResponse.json(
      { error: 'Unable to update premium memory subscription.' },
      { status: 500 }
    )
  }
}
