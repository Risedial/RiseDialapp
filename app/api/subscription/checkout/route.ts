import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById, updateUser } from '@/lib/db/users'
import { stripe, PLAN_PRICES } from '@/lib/stripe/config'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth gate — read user from JWT cookie
  const session = await getUserFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { user_id } = session

  // Parse and validate request body
  let planType: 'monthly' | 'annual'
  let hasPremiumAddon: boolean

  try {
    const body = await request.json()
    if (body.planType !== 'monthly' && body.planType !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid planType. Must be "monthly" or "annual".' },
        { status: 400 }
      )
    }
    if (typeof body.hasPremiumAddon !== 'boolean') {
      return NextResponse.json(
        { error: 'hasPremiumAddon must be a boolean.' },
        { status: 400 }
      )
    }
    planType = body.planType
    hasPremiumAddon = body.hasPremiumAddon
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  // Fetch full user record to get email and stripe_customer_id
  const user = await getUserById(user_id)
  if (!user) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    )
  }

  // Create or retrieve Stripe customer
  let stripeCustomerId = user.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id },
    })
    stripeCustomerId = customer.id

    // Persist the new customer ID back to the users table
    await updateUser(user_id, { stripe_customer_id: stripeCustomerId })
  }

  // Build line_items: base plan first, premium add-on second if requested
  const plan = PLAN_PRICES[planType]

  const lineItems: { price: string; quantity: number }[] = [
    {
      price: plan.base,
      quantity: 1,
    },
  ]

  if (hasPremiumAddon) {
    lineItems.push({
      price: plan.premiumAddon,
      quantity: 1,
    })
  }

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan-selection`,
    metadata: {
      user_id,
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
