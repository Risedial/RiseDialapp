# Module 3 — Code Fixes: Validation Checklist

- [ ] `grep -r "JWT_SECRET.*||" lib/auth/` returns zero results — no fallback default exists for JWT_SECRET
- [ ] `grep -r "PREMIUM_PRODUCT_ID" app/ lib/` returns zero results — dead code is removed
- [ ] A single file handles all Stripe webhook event routing (e.g., `lib/stripe/webhooks.ts`) — `grep -r "checkout.session.completed" app/ lib/` returns exactly one file
- [ ] `lib/stripe/webhooks.ts` (or equivalent) checks for an existing row in `webhook_events` before processing — `grep "webhook_events" lib/stripe/webhooks.ts` returns a result
- [ ] `supabase/migrations/002_atomic_rate_limit.sql` exists and contains `GET DIAGNOSTICS` — `grep "GET DIAGNOSTICS" supabase/migrations/002_atomic_rate_limit.sql` returns a result
- [ ] The `increment_message_count` function exists in the Supabase `risedial-test` database — verify in Supabase dashboard under Database > Functions
- [ ] `npx tsc --noEmit` exits 0 after all fixes are applied
- [ ] `git log --oneline -8` shows individual fix commits (one per fix A–G) with `fix:` prefix messages
