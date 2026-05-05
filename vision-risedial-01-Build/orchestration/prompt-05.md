# Step 05: M3-C — Fix C: Make webhook route a thin dispatcher

## Hard Constraints (apply to every action in this step)
1. Output file size MUST NOT exceed 32,000 tokens. If output would exceed this limit, split into multiple files and create a follow-up step.
2. Do not truncate any file. Write each file completely or not at all.
3. After completing this step, update C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json: move "prompt-05" from pendingSteps to completedSteps and set its status to "complete".
4. Do not install or import any package not already present in package.json.
5. Use the Write tool only. Do not use Edit on files that do not yet exist.

## Prerequisites
State: `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json` — pendingSteps must contain "prompt-05"
Context files (read these before executing — they contain values you must not invent):
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\api-contracts.md
- C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\context\external-services.md

## Task

Apply Fix C from Module 3: Replace `app/api/webhooks/stripe/route.ts` with a thin dispatcher that delegates to `verifyWebhookSignature` and `routeWebhookEvent` from `lib/stripe/webhooks.ts`.

Remove all inline handler functions, dead `PREMIUM_PRODUCT_ID` constant, and duplicate idempotency logic. The route becomes a minimal POST handler only.

**Sub-step 1 — Confirm the lib is ready:**
Verify that `lib/stripe/webhooks.ts` exports `verifyWebhookSignature` and `routeWebhookEvent` (completed in prompt-04).

**Sub-step 2 — Write the new thin dispatcher file:**
Write `C:\Users\Alexb\Documents\RiseDialapp\app\api\webhooks\stripe\route.ts` with this exact content:

```typescript
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
```

This file must contain:
- No `PREMIUM_PRODUCT_ID` constant
- No `getPlanTypeFromPriceId`, `detectPremiumItem`, `getBasePriceId` helper functions
- No inline switch statement for event types
- No idempotency check (now in the lib)
- No imports of `Stripe`, `stripe`, or `supabaseServer`
- The `stripe-signature` header name (from api-contracts.md) is `stripe-signature`
- The error responses match api-contracts.md: `{ error: 'Missing stripe-signature header' }` and `{ received: true }`

**Sub-step 3 — Type check:**
Run `npx tsc --noEmit`. It must exit 0 before committing.

**Sub-step 4 — Commit:**
Stage: `git add app/api/webhooks/stripe/route.ts`
Commit message: `fix(C): reduce stripe webhook route to thin dispatcher; move all logic to lib/stripe/webhooks.ts`
Do not batch any other changes into this commit.

## Verification
- [ ] `C:\Users\Alexb\Documents\RiseDialapp\app\api\webhooks\stripe\route.ts` contains no `PREMIUM_PRODUCT_ID` string
- [ ] The file contains no inline handler functions
- [ ] The file imports only from `next/server` and `@/lib/stripe/webhooks`
- [ ] The file contains `verifyWebhookSignature` and `routeWebhookEvent` calls
- [ ] Missing `stripe-signature` returns `{ error: 'Missing stripe-signature header' }` with status 400
- [ ] Success returns `{ received: true }`
- [ ] `npx tsc --noEmit` exits 0 after this change
- [ ] `git log --oneline` shows a new commit with message containing `fix(C)`
- [ ] No other files were modified

## State Update
In `C:\Users\Alexb\Documents\RiseDialapp\vision-risedial-01-Build\orchestration\state.json`:
- Move "prompt-05" from pendingSteps to completedSteps
- Set steps["prompt-05"].status = "complete"
