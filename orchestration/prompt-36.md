# Prompt 36: Write Sign In / Sign Up Screen

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-design-tokens.css` — all CSS custom property values (hex colors, spacing, typography)
- `context/app-copy-strings.md` — error messages, UI labels

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/(auth)/signin/page.tsx` — the Sign In / Sign Up screen with these requirements:
- Dark mobile-first layout using CSS custom properties from `context/app-design-tokens.css`
- Two modes: "Sign In" and "Create Account" — toggle between them with a single button/link
- Email field and password field (min 44px tap targets per --tap-target-min)
- Client-side validation: email format, password min 8 chars — inline error messages below fields
- Submit button calls /api/auth/signin (Sign In mode) or /api/auth/signup (Create Account mode)
- After successful signup: redirect to /plan-selection
- After successful signin: check subscription_status — if active → redirect to /chat/[lastChatId], if lapsed → /subscription-locked
- Error states: "Invalid email or password." (from context/app-copy-strings.md), server error ("Something went wrong. Please try again."), shown inline below form — never raw errors
- Link to /reset-password for "Forgot password?"
- `env(safe-area-inset-bottom)` on the submit button container
- No external auth options, no OAuth
- Tailwind classes using var(--) CSS custom properties

Read `context/app-design-tokens.css` for all color and spacing values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/(auth)/signin/page.tsx` exists
- [ ] Toggle between Sign In and Create Account modes is present
- [ ] Both fields have min 44px tap targets
- [ ] Safe-area-inset-bottom is applied
- [ ] No raw API errors shown to user
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-36-write-signin-signup-screen"` to `completedSteps`
2. Remove `"step-36-write-signin-signup-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/(auth)/signin/page.tsx"`
