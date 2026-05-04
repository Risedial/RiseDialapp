import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById } from '@/lib/db/users'
import { stripe } from '@/lib/stripe/config'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth gate — read user from JWT cookie
  const session = await getUserFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }

  const { user_id } = session

  try {
    // Fetch current user record from the database
    const user = await getUserById(user_id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user.' },
        { status: 400 }
      )
    }

    // Create a Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.NEXTAUTH_URL + '/settings',
    })

    return NextResponse.json({ url: portalSession.url })
  } catch {
    return NextResponse.json(
      { error: 'Unable to create portal session.' },
      { status: 500 }
    )
  }
}
