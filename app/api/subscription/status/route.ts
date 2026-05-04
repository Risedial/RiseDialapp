import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/getUser'
import { getUserById } from '@/lib/db/users'

export async function GET(request: NextRequest): Promise<NextResponse> {
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
        { error: 'Unable to retrieve subscription status.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subscription_status: user.subscription_status,
      plan_type: user.plan_type,
      has_premium_memory: user.has_premium_memory,
      next_billing_date: user.next_billing_date,
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to retrieve subscription status.' },
      { status: 500 }
    )
  }
}
