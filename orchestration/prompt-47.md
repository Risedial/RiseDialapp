# Prompt 47: Write Error State Components

## Prerequisites

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — exact error message strings

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

1. `risedial-production/components/ErrorStates.tsx` — containing 6 named exports:
   - `InlineError({ message, onRetry }: { message: string, onRetry?: () => void })`: inline error adjacent to failed message with optional retry button
   - `NetworkOfflineBanner()`: persistent header indicator "You're offline. Check your connection.", uses --z-banner
   - `SessionExpiredRedirect()`: component that calls router.push('/signin') on mount and shows "Your session has expired. Sign in to continue." (exact from context/app-copy-strings.md)
   - `RateLimitMessage()`: shows exact copy: "Rise needs a moment. Try again in a few seconds." (from context/app-copy-strings.md)
   - `APITimeoutRetry({ onRetry }: { onRetry: () => void })`: 30-second timeout indicator with retry button
   - `TruncationWarning()`: shows exact copy: "Your message was shortened to fit." (from context/app-copy-strings.md)

2. `risedial-production/app/error.tsx` — Next.js global error boundary:
   - Catches unhandled errors
   - Shows a calm user-facing message: "Something went wrong. Please refresh the page."
   - Shows a "Refresh" button that calls `window.location.reload()`
   - Does NOT show raw error messages, stack traces, or error.message

Read all exact copy strings from `context/app-copy-strings.md`.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/components/ErrorStates.tsx` exists with all 6 named exports
- [ ] File `risedial-production/app/error.tsx` exists
- [ ] RateLimitMessage shows exact string: "Rise needs a moment. Try again in a few seconds."
- [ ] TruncationWarning shows exact string: "Your message was shortened to fit."
- [ ] SessionExpiredRedirect shows exact string: "Your session has expired. Sign in to continue."
- [ ] No raw error messages or stack traces in error.tsx
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-47-write-error-state-components"` to `completedSteps`
2. Remove `"step-47-write-error-state-components"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/components/ErrorStates.tsx"`, `"risedial-production/app/error.tsx"`
