# Prompt 45: Write Loading and Splash Screen

## Prerequisites

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values (--color-bg, --color-accent-start, --color-accent-end)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write 3 files:

1. `risedial-production/app/loading.tsx` — Next.js route loading file that renders the SplashScreen component

2. `risedial-production/components/SplashScreen.tsx` — Rise brand mark splash screen:
   - Full screen dark background (--color-bg)
   - "Rise" wordmark centered, styled with blue-teal gradient text (--color-accent-start to --color-accent-end)
   - Subtle fade-in animation (opacity 0 → 1, 300ms ease-out)
   - No visible delay under 500ms
   - No spinner, no loading bar — minimal and calm

3. `risedial-production/components/LoadingSkeletons.tsx` — skeleton components:
   - `MessageSkeleton`: pulsing dark skeleton block mimicking a message bubble (both user and Rise variants)
   - `ButtonSkeleton`: pulsing dark skeleton block for loading button states
   - Use CSS animation `@keyframes pulse` with opacity oscillation — no external library

Read `context/app-design-tokens.css` for all color values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/loading.tsx` exists
- [ ] File `risedial-production/components/SplashScreen.tsx` exists with fade-in animation
- [ ] File `risedial-production/components/LoadingSkeletons.tsx` exists with MessageSkeleton and ButtonSkeleton
- [ ] No external animation libraries used
- [ ] No `// ... more`, ellipses, or placeholder comments appear in any file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-45-write-loading-splash-screen"` to `completedSteps`
2. Remove `"step-45-write-loading-splash-screen"` from `pendingSteps`
3. Set `flags.frontendScreensComplete` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/app/loading.tsx"`, `"risedial-production/components/SplashScreen.tsx"`, `"risedial-production/components/LoadingSkeletons.tsx"`
