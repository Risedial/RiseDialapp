# Prompt 38: Write Checkout Polling Screen

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — exact polling screen copy strings

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/(auth)/checkout-success/page.tsx` — the checkout polling screen with:
- Displays "Setting up your account..." (exact string from context/app-copy-strings.md) with a minimal subtle animation (CSS keyframe, no external libraries)
- Polls GET /api/subscription/status at 1-second intervals
- On `subscription_status === 'active'`: redirects to /onboarding
- After 10 failed polls (no active status): shows "Almost there — this is taking longer than expected" (exact from context/app-copy-strings.md) with a "Refresh" button
- The Refresh button retriggers polling (another 10 attempts)
- Dark layout using CSS custom properties
- No raw error states shown — only the two copy strings above

Read exact copy strings from `context/app-copy-strings.md`.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/(auth)/checkout-success/page.tsx` exists
- [ ] Polling interval is exactly 1 second
- [ ] Max polls before fallback is exactly 10
- [ ] Success redirects to /onboarding
- [ ] Fallback copy matches exactly: "Almost there — this is taking longer than expected"
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-38-write-checkout-polling-screen"` to `completedSteps`
2. Remove `"step-38-write-checkout-polling-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/(auth)/checkout-success/page.tsx"`
