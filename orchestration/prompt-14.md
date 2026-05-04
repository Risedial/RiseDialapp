# Prompt 14: Write Stripe Configuration

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

Context files to read before beginning:
- `context/app-stripe-config.md` — Stripe price IDs, product/price mapping

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/stripe/config.ts` — Stripe client initialization file that:

1. Initializes the Stripe SDK with `process.env.STRIPE_SECRET_KEY`
2. Exports the Stripe client instance
3. Exports 4 price ID constants read from environment variables:
   - `PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY!`
   - `PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL!`
   - `PRICE_PREMIUM_MONTHLY_ADDON = process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON!`
   - `PRICE_PREMIUM_ANNUAL_ADDON = process.env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON!`
4. Exports a `PLAN_PRICES` object mapping plan_type to base price ID and premium add-on price ID
5. Exports a `getPriceIds(planType: 'monthly' | 'annual', hasPremium: boolean)` utility function

Read `context/app-stripe-config.md` for all Stripe configuration values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/stripe/config.ts` exists
- [ ] All 4 price ID constants are exported
- [ ] Stripe client is initialized with STRIPE_SECRET_KEY environment variable
- [ ] `getPriceIds` function is exported
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-14-write-stripe-configuration"` to `completedSteps`
2. Remove `"step-14-write-stripe-configuration"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/lib/stripe/config.ts"`
