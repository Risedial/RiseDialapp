# Prompt 39: Write Onboarding Screen

## Prerequisites

state.json flags that must be true:
- `flags.authLayerComplete` must be `true` (set by step-11-write-auth-middleware)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — "Rise is listening" heading, button labels

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/(auth)/onboarding/page.tsx` — the onboarding screen with:
- Heading: "Rise is listening" (from context/app-copy-strings.md)
- Preferred name entry field (text input, optional — not required to proceed)
- "Continue" button: submits preferred name (if entered) via PATCH to user API, then calls initializeNewUser (via server action or API call), then redirects to /chat/[newChatId]
- "Skip" button: prominently available, no guilt messaging — proceeds without setting preferred name, still calls initializeNewUser
- Field label: "What should Rise call you?" (from context/app-copy-strings.md)
- Note below field: "Optional. You can change this later in Settings."
- Dark layout using CSS custom properties
- Min 44px tap targets on both buttons

Read all copy from `context/app-copy-strings.md`.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/(auth)/onboarding/page.tsx` exists
- [ ] Skip button is present and prominent
- [ ] Preferred name is not required to proceed
- [ ] Both Continue and Skip paths call initializeNewUser and redirect to chat
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-39-write-onboarding-screen"` to `completedSteps`
2. Remove `"step-39-write-onboarding-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/(auth)/onboarding/page.tsx"`
