# Prompt 46: Write PWA Configuration

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

Context files to read before beginning:
- `context/app-architecture.md` — PWA configuration requirements

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

1. `risedial-production/public/manifest.json` — PWA manifest with:
   - `name`: "Rise"
   - `short_name`: "Rise"
   - `description`: "Your AI clarity companion"
   - `start_url`: "/"
   - `display`: "standalone"
   - `background_color`: "#0a0a0f"
   - `theme_color`: "#4f8ef7"
   - `orientation`: "portrait"
   - `icons` array: reference icons that exist in the prototype's public/ directory. Use these standard PWA icon sizes: 192x192 and 512x512 (maskable). Use filenames from `C:\Users\Alexb\Documents\RISEDIAL-PWA\RiseDial-Frontend-Demo\public\` directory — list them before writing to use correct filenames.

2. `risedial-production/next.config.js` — updated with next-pwa configuration:
   - Wraps the config with `withPWA` from next-pwa
   - `dest: 'public'` for service worker output
   - `disable: process.env.NODE_ENV === 'development'` (disable in dev)
   - Retain any existing Next.js config options from step 01

List the icon files in the prototype's public/ directory before writing manifest.json to use correct filenames.

Read `context/app-architecture.md` for PWA requirements.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/public/manifest.json` exists
- [ ] manifest.json contains `name: "Rise"` and `display: "standalone"`
- [ ] `risedial-production/next.config.js` includes withPWA wrapper
- [ ] No `// ... more`, ellipses, or placeholder comments appear in either file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-46-write-pwa-configuration"` to `completedSteps`
2. Remove `"step-46-write-pwa-configuration"` from `pendingSteps`
3. Set `flags.pwaConfigured` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/public/manifest.json"`, `"risedial-production/next.config.js"`
