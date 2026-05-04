# Prompt 44: Write Subscription Locked Screen

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — subscription locked copy, banner copy

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write 2 files:

1. `risedial-production/app/subscription-locked/page.tsx` — shown when subscription_status = lapsed:
   - Warm messaging: "Your access has paused. Resubscribe to continue." (exact from context/app-copy-strings.md)
   - "Resubscribe" CTA button → redirects to /plan-selection
   - Note: user is NOT logged out — session is preserved
   - Note: user's data is intact — do NOT show any data loss messaging
   - Dark layout using CSS custom properties

2. `risedial-production/components/SubscriptionBanner.tsx` — non-blocking banner component:
   - Props: `{ isVisible: boolean }`
   - Displays at top of screen when subscription expires mid-session
   - Message: "Your subscription has lapsed. Resubscribe to continue." with "Resubscribe" link
   - Does NOT block or interrupt current message exchange
   - Dismiss button (X) to hide banner for current session
   - z-index: --z-banner

Read exact copy from `context/app-copy-strings.md`.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/subscription-locked/page.tsx` exists
- [ ] File `risedial-production/components/SubscriptionBanner.tsx` exists
- [ ] Locked screen does NOT log user out
- [ ] Banner uses --z-banner z-index
- [ ] Locked screen copy matches: "Your access has paused. Resubscribe to continue."
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-44-write-subscription-locked-screen"` to `completedSteps`
2. Remove `"step-44-write-subscription-locked-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/subscription-locked/page.tsx"`, `"risedial-production/components/SubscriptionBanner.tsx"`
