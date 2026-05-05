# Module 6 — Unit & Integration Tests: Validation Checklist

- [ ] `npx vitest run --coverage` exits 0 with all tests passing and zero failures reported
- [ ] Coverage report shows 100% for Statements, Branches, Functions, and Lines — the summary table in the terminal output shows no red rows
- [ ] Test file `__tests__/session.test.ts` (or equivalent) exists and contains tests for `createSession`, `verifySession`, `setSessionCookie`, and `clearSessionCookie` — `grep -c "verifySession\|createSession\|setSessionCookie\|clearSessionCookie" __tests__/session.test.ts` returns 4
- [ ] Test file `__tests__/message/route.test.ts` (or equivalent) exists and contains test cases for HTTP 401 (unauthenticated), HTTP 429 (rate limited), HTTP 400 (bad input), and HTTP 200 (success) — `grep -c "401\|429\|400\|200" __tests__/message/route.test.ts` returns 4 or more
- [ ] Test file `__tests__/webhooks/route.test.ts` (or equivalent) verifies idempotency — `grep "idempoten\|duplicate\|already processed" __tests__/webhooks/route.test.ts` returns a result
- [ ] Test file `__tests__/trigger.test.ts` (or equivalent) tests the 50-message threshold boundary — `grep "50\|threshold" __tests__/trigger.test.ts` returns a result
- [ ] No test file imports from a real Supabase or Stripe client without `vi.mock()` at the top of the file — `grep -rn "createClient\|new Stripe" __tests__/` shows only mocked usages
- [ ] `git log --oneline -5` shows a commit with message starting with `test:` referencing unit or integration tests
