# Prompt 48: Write Design System Foundation

## Prerequisites

state.json flags that must be true:
- `flags.frontendScreensComplete` must be `true` (set by step-45-write-loading-splash-screen)

Context files to read before beginning:
- `context/app-design-tokens.css` — ALL CSS custom property values (source of truth)

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

1. `risedial-production/app/globals.css` — CSS custom properties and global styles:
   - All CSS custom properties in `:root {}` (copy ALL values from `context/app-design-tokens.css` exactly)
   - Global reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
   - Body styles: `background: var(--color-bg); color: var(--color-text-primary); font-family: var(--font-family); -webkit-font-smoothing: antialiased;`
   - `@keyframes typing-dots`: for the 3-dot typing indicator (scale/opacity bounce, 3 dots staggered)
   - `@keyframes fade-in`: opacity 0 → 1 for splash screen
   - `@keyframes slide-in-left`: translateX(-100%) → translateX(0) for sidebar
   - `@keyframes pulse`: for skeleton loading states
   - `html { height: 100%; height: -webkit-fill-available; }` for iOS viewport fix
   - `body { min-height: 100vh; min-height: -webkit-fill-available; }`

2. `risedial-production/tailwind.config.ts` — Tailwind configuration:
   - Extends theme with all CSS custom property values as Tailwind tokens
   - Colors: all --color-* variables
   - Spacing: all --spacing-* variables
   - Font family, font sizes, font weights from design tokens
   - Border radius from --radius-* values
   - Transition timing from --transition-* values
   - Z-index from --z-* values
   - content paths: `['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']`
   - darkMode: 'class' (but always applied — no toggle)

Read ALL values from `context/app-design-tokens.css` — do not approximate any hex values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/globals.css` exists with :root {} block containing all CSS custom properties
- [ ] All 4 keyframe animations are present: typing-dots, fade-in, slide-in-left, pulse
- [ ] iOS viewport fix is present
- [ ] File `risedial-production/tailwind.config.ts` exists and extends theme with design tokens
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-48-write-design-system-foundation"` to `completedSteps`
2. Remove `"step-48-write-design-system-foundation"` from `pendingSteps`
3. Set `flags.designSystemWritten` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/app/globals.css"`, `"risedial-production/tailwind.config.ts"`
