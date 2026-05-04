import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event

  try {
    event = verifyWebhookSignature(rawBody, signature)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    await routeWebhookEvent(event)
  } catch {
    // Never return raw errors — always return received: true
  }

  return NextResponse.json({ received: true })
}
