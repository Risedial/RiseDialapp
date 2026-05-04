# Prompt 37: Write Plan Selection Screen

## Prerequisites

Context files to read before beginning:
- `context/app-stripe-config.md` — exact prices ($25/mo, $199/yr, $6.25/mo add-on, $50/yr add-on)
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — "Save $101/year" callout badge text, price labels

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/(auth)/plan-selection/page.tsx` — the plan selection screen with:
- Two plan cards: Monthly ($25.00/month) and Annual ($199.00/year)
- Annual plan pre-selected by default
- "Save $101/year" callout badge on the Annual card — EXACT string from context/app-copy-strings.md
- Premium Memory add-on toggle showing:
  - When monthly selected + add-on on: "$31.25/month"
  - When annual selected + add-on on: "$249.00/year"
  - When add-on off: shows base plan price only
- "Continue to Checkout" button: calls POST /api/subscription/checkout with { planType, hasPremiumAddon }, redirects to the returned Stripe Checkout URL
- Loading state on the Continue button while awaiting checkout URL
- Dark layout using CSS custom properties from context/app-design-tokens.css
- All prices from context/app-stripe-config.md — no hardcoded prices that differ

Read all prices from `context/app-stripe-config.md` and all copy from `context/app-copy-strings.md`.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/(auth)/plan-selection/page.tsx` exists
- [ ] Annual is pre-selected by default
- [ ] "Save $101/year" badge text matches exactly
- [ ] Combined prices $31.25/month and $249.00/year shown correctly
- [ ] Checkout API call is made on Continue button
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-37-write-plan-selection-screen"` to `completedSteps`
2. Remove `"step-37-write-plan-selection-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/(auth)/plan-selection/page.tsx"`
