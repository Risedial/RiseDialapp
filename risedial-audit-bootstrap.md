# RiseDial Audit & Fix — Autonomous Bootstrap

> **Send this entire file as your message in a fresh Claude Code chat.**
> Everything Claude needs to know is contained here. After it runs, it will
> give you one command to copy. That command is the only thing you ever need
> to type again.

---

## Pre-Session Research: What Is Already Known

This section was populated by a prior session that read the full codebase.
Do NOT re-read files to rediscover these facts — they are confirmed.

### Project: RiseDial
- **Type:** AI coaching PWA (Next.js 14 App Router, deployed on Vercel)
- **Working directory:** `C:\Users\Alexb\Documents\RiseDialapp`
- **Git remote:** `github.com/Risedial/RiseDialapp` (branch: `main`)
- **Live URL:** `https://www.risedial.com` (currently debugging a Vercel 404 — separate from the bugs below)

### Tech Stack (from `package.json`)
| Package | Version |
|---------|---------|
| next | 14.x (running 14.2.35) |
| react | 18.x |
| typescript | 5.x (running 5.9.3) |
| @supabase/supabase-js | 2.x |
| openai | 4.x |
| stripe | ^22.1.0 |
| tailwindcss | 3.x |
| bcryptjs | 2.x |
| resend | 3.x |
| zod | 3.x |

### App Directory Structure (confirmed by file reads)
```
app/
├── page.tsx                        ← server redirect to /signin
├── layout.tsx                      ← root layout, references /manifest.json
├── loading.tsx
├── error.tsx
├── settings/
│   └── page.tsx                    ← FULLY IMPLEMENTED (Profile, Subscription, Memory, Account)
├── subscription-locked/page.tsx
├── (auth)/
│   ├── layout.tsx
│   ├── signin/page.tsx
│   ├── onboarding/page.tsx
│   ├── plan-selection/page.tsx
│   ├── checkout-success/page.tsx
│   └── reset-password/page.tsx
└── chat/
    ├── layout.tsx
    └── [chatId]/
        └── page.tsx                ← Main chat UI (client component)

components/
├── Sidebar.tsx                     ← Slide-out drawer (chat list only)
├── ChatMemoriesModal.tsx
├── SubscriptionBanner.tsx
├── SplashScreen.tsx
├── LoadingSkeletons.tsx
└── ErrorStates.tsx

lib/
├── auth/session.ts, getUser.ts, subscription-gate.ts
├── db/users.ts, chats.ts, messages.ts, memory.ts
├── supabase/client.ts, server.ts
├── stripe/subscription.ts, config.ts, webhooks.ts
├── rise/system-prompt.ts, context-window.ts, api-messages.ts, opening-message.ts, rate-limit.ts
├── memory/compress.ts, patch.ts, executor.ts, trigger.ts
├── chat/title.ts
├── user/onboarding.ts
├── openai/client.ts
└── env.ts

middleware.ts                       ← Edge Runtime JWT verification. DO NOT TOUCH.

app/api/
├── auth/signin, signup, signout, reset-request, reset-confirm
├── chats/route.ts, [chatId]/route.ts, [chatId]/messages/route.ts, [chatId]/title/route.ts
├── chat/[chatId]/message/route.ts
├── subscription/status, checkout, portal, premium-toggle
├── user/profile, initialize, preferred-name, memory, export-data, delete-account
└── webhooks/stripe/route.ts
```

---

## Confirmed Bugs (Root Causes Identified — No Discovery Needed)

### BUG-1: Chat messages display in reverse order on reload

**Symptom:** Opening an existing chat shows newest messages at top, oldest at bottom. Sending a new message resets to correct order.

**Root cause (confirmed by reading source):**
- File: `app/api/chats/[chatId]/messages/route.ts` **line 75**
- Code: `.order("created_at", { ascending: false })`
- This fetches messages **newest-first** from Supabase
- Client in `app/chat/[chatId]/page.tsx` line 289 stores them as-is: `setMessages(data.messages ?? [])`
- Messages render in array order → newest at index 0 → displays upside-down
- Sending a new message appends to the array correctly, which is why new messages appear right-side-up

**Fix (surgical — 1 character change):**
- In `app/api/chats/[chatId]/messages/route.ts` line 75, change `ascending: false` → `ascending: true`
- No client changes needed

**Confidence: HIGH**

---

### BUG-2: Settings page is unreachable from the chat UI

**Symptom:** After login, there is no way to click into settings. The settings page appears to be missing.

**Root cause (confirmed by reading source):**
- `app/settings/page.tsx` **is fully implemented** — Profile editing, Subscription management, Premium Memory toggle, Chat Memories view, Log Out, Delete Account — all working
- The Sidebar component (`components/Sidebar.tsx`) contains ONLY: "Chats" header, close button, "New Chat" button, and the chat list with delete functionality
- There is NO settings link anywhere in the sidebar
- The chat page header (`app/chat/[chatId]/page.tsx`) has only the Rise avatar/name and the hamburger menu button
- Users cannot navigate to `/settings` at all

**Fix:**
- Add a footer section to `components/Sidebar.tsx` (after the chat list, before closing `</div>`) containing:
  - A "Settings" button/link that calls `router.push('/settings')` and `onClose()`
  - Styled consistently with existing sidebar elements (same CSS variables)

**Confidence: HIGH**

---

### BUG-3: Sidebar has no user options (same root cause as BUG-2)

**Symptom:** When the chat sidebar opens, there are no user settings, profile info, or navigation options beyond the chat list.

**Root cause:** Same as BUG-2 — the sidebar simply was never given a user section or footer.

**Additional fix scope** (add to the same edit as BUG-2):
- The sidebar footer should include at minimum: a "Settings" link
- Optionally: display user email (already available via `/api/user/profile` which the settings page already calls)
- The existing sidebar already has all the styling patterns needed (same CSS variables, same button patterns)

**Confidence: HIGH**

---

## Vercel Deployment Status (Separate Issue — In Progress)

> This is a separate infrastructure issue, NOT a code bug. Do not conflate it with the 3 bugs above.

- **Current deployment:** commit `165cc90` — "fix: remove next-pwa to unblock Vercel deployment"
- **Status:** Deployment marked "Ready + Current + Production" but returns `404: NOT_FOUND` for all requests
- **What was tried:** Removed `next-pwa` wrapper from `next.config.js` (commit 165cc90). Didn't fix it.
- **Confirmed root cause:** No-cache Vercel build completes in 160ms with ZERO output ("Skipping cache upload because no files were prepared"). The Vercel framework builder is not being invoked — this is a Vercel project settings problem, not a code problem.
- **Next action needed (user must do this in Vercel dashboard):** Go to `vercel.com/risedials-projects/rise-dialapp` → Settings → General → "Build & Development Settings" and verify:
  - Framework Preset = Next.js
  - Build Command = (empty/default, or `npm run build`)
  - Output Directory = (empty/default)
- **What NOT to do:** Do not touch `middleware.ts`, do not add `vercel.json`, do not run `vercel deploy` from CLI, do not attempt Vercel MCP calls (token lacks team scope → 403)

---

## Files That Must NOT Be Touched

| File | Reason |
|------|--------|
| `middleware.ts` | Fixed in commit c79e468 — self-contained Edge Runtime JWT verification. Touching it risks breaking auth again. |
| `lib/auth/session.ts` | Correct, stable |
| `next.config.js` | Already fixed in commit 165cc90 — minimal config, no next-pwa |
| `app/layout.tsx` | Clean |
| `app/page.tsx` | Clean |

---

## Your Mission

You are the bootstrap orchestrator. Working directory: `C:\Users\Alexb\Documents\RiseDialapp`.

**Your job in this session:** Generate a complete orchestration system (prompt files, state.json, runner command) that will autonomously fix all 3 confirmed bugs. The bugs are already located — skip discovery. Go straight to orchestration generation.

**The user's only job after this session:** Copy one command and paste it into a new Claude Code chat. They repeat that one command each session until done.

---

## Path Configuration

```
PROJECT_ROOT = C:\Users\Alexb\Documents\RiseDialapp
ORCH_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit
CONTEXT_DIR  = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context
PROMPTS_DIR  = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\prompts
PLANS_DIR    = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans
STATE_FILE   = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json
RUNNER_FILE  = C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\run-risedial-audit.md
```

Create all directories:
```bash
mkdir -p "C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context"
mkdir -p "C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\prompts"
mkdir -p "C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans"
```

---

## Phase 0 — Idempotency Check

Read STATE_FILE.
- **Absent or `bootstrap_complete: false`:** Execute Phases 1–5.
- **`bootstrap_complete: true`:** Skip to Phase 5 (Output to User). Print: "Bootstrap already complete."

---

## Phase 1 — Write Context Files

**Mode: COLLECT — No application code writes.**

Write these 2 files now. All values come from the "Pre-Session Research" section above — do not read any project files to generate these.

### `CONTEXT_DIR/bug-locations.md`

```markdown
# Confirmed Bug Locations
**Status:** IMMUTABLE — verified by prior session

## BUG-1: Message Order
- File: `C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts`
- Line: 75
- Current code: `.order("created_at", { ascending: false })`
- Fix: Change `false` → `true`
- Why: API returns newest-first. Client renders in array order. Result: reversed display.
- Confidence: HIGH

## BUG-2 & BUG-3: Settings Unreachable / Sidebar Empty
- File to edit: `C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx`
- Problem: No footer, no settings link, no user navigation
- Settings page exists at: `C:\Users\Alexb\Documents\RiseDialapp\app\settings\page.tsx` (fully implemented)
- Fix: Add a footer section to the sidebar with a "Settings" button that calls `router.push('/settings')` then `onClose()`
- The sidebar already imports `useRouter` from `next/navigation` — it is available
- Sidebar already uses `router` for `handleNewChat` and `handleChatClick`
- CSS: use same variables as existing buttons (`--color-surface-raised`, `--color-border`, `--color-text-secondary`, `--font-family`, `--font-size-sm`, `--font-weight-medium`, `--radius-sm`, `--tap-target-min`, `var(--spacing-md)`)
- Confidence: HIGH
```

### `CONTEXT_DIR/tech-facts.md`

```markdown
# Tech Facts — Anti-Hallucination Reference
**Status:** IMMUTABLE

- Framework: Next.js 14.2.35 (App Router)
- React: 18.x
- TypeScript: 5.9.3
- Styling: CSS-in-JS via inline `style` props + CSS variables (no Tailwind classes in components)
- Database: Supabase (supabase-js 2.x)
- Auth: Custom JWT in httpOnly cookie named `risedial_session`
- Message type: `{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }`
  (Note: API returns `created_at` snake_case, client type uses `createdAt` camelCase — check actual field name before writing)
- Sidebar CSS variables in use: `--color-surface`, `--color-border`, `--color-text-primary`,
  `--color-text-secondary`, `--color-text-muted`, `--color-surface-raised`, `--color-error`,
  `--color-accent-start`, `--color-accent-end`, `--font-family`, `--font-size-sm`,
  `--font-size-xs`, `--font-size-md`, `--font-weight-normal`, `--font-weight-medium`,
  `--font-weight-semibold`, `--radius-sm`, `--radius-md`, `--spacing-xs`, `--spacing-sm`,
  `--spacing-md`, `--spacing-lg`, `--tap-target-min`, `--transition-fast`, `--z-sidebar`, `--z-modal`
- Sidebar already imports: `useState`, `useEffect`, `useRef`, `useCallback`, `TouchEvent` from react;
  `useRouter`, `usePathname` from `next/navigation`
- DO NOT TOUCH: `middleware.ts`, `lib/auth/session.ts`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`
```

---

## Phase 2 — Generate Step Plan

**Mode: PLAN — Write `ORCH_DIR/step-plan.json` only.**

The bugs are pre-located. Steps are tightly scoped:

```json
{
  "total_steps": 6,
  "steps": [
    {
      "id": "step-01-collect-verify-files",
      "mode": "COLLECT",
      "title": "Verify bug locations by reading exact lines from source files",
      "reads": [
        "app/api/chats/[chatId]/messages/route.ts",
        "components/Sidebar.tsx"
      ],
      "writes": "context/verified-locations.md",
      "verification": "context/verified-locations.md exists and confirms line 75 content and sidebar structure"
    },
    {
      "id": "step-02-plan-message-order-fix",
      "mode": "PLAN",
      "title": "Write surgical plan for message order fix",
      "reads": ["context/bug-locations.md", "context/verified-locations.md"],
      "writes": "plans/02-message-order-plan.md",
      "verification": "plan file names exact file, exact line, exact before/after"
    },
    {
      "id": "step-03-execute-message-order-fix",
      "mode": "EXECUTE",
      "title": "Fix ascending sort order for chat messages API",
      "reads": ["plans/02-message-order-plan.md"],
      "writes": "app/api/chats/[chatId]/messages/route.ts",
      "verification": "line 75 now reads `ascending: true`; `npx tsc --noEmit` exits 0"
    },
    {
      "id": "step-04-plan-sidebar-settings-fix",
      "mode": "PLAN",
      "title": "Write plan to add settings navigation to sidebar footer",
      "reads": ["context/bug-locations.md", "context/tech-facts.md", "context/verified-locations.md"],
      "writes": "plans/04-sidebar-settings-plan.md",
      "verification": "plan names exact insertion point in Sidebar.tsx, exact JSX to add"
    },
    {
      "id": "step-05-execute-sidebar-settings-fix",
      "mode": "EXECUTE",
      "title": "Add settings footer to Sidebar component",
      "reads": ["plans/04-sidebar-settings-plan.md"],
      "writes": "components/Sidebar.tsx",
      "verification": "Sidebar.tsx contains a button that navigates to /settings; `npx tsc --noEmit` exits 0"
    },
    {
      "id": "step-06-commit-and-push",
      "mode": "EXECUTE",
      "title": "Commit all fixes and push to main",
      "reads": ["orchestration/risedial-audit/state.json"],
      "writes": "git commit + push",
      "verification": "git log shows new commit; `git status` is clean"
    }
  ]
}
```

Write `ORCH_DIR/step-plan.json` with this exact content (substituting `TOTAL_STEPS = 6`).

---

## Phase 3 — Write All Prompt Files

**Mode: PLAN generating EXECUTE artifacts**

Write `PROMPTS_DIR/prompt-01.md` through `PROMPTS_DIR/prompt-06.md`.

Every file uses this schema:

```markdown
# Prompt NN: [Title]
**Mode:** COLLECT | PLAN | EXECUTE
**Step ID:** [step-NN-id]

## Prerequisites
[State flags required / files required / context files to read — or "none"]

---

## Hard Constraints

1. **Mode lock:** [COLLECT: Write only to CONTEXT_DIR — no app file edits.]
   [PLAN: Write only to PLANS_DIR — describe changes in precise prose, no code blocks with implementation.]
   [EXECUTE: Read the plan file first. Every identifier (function name, variable name, prop name) must be verified against the actual file before writing. No invented values.]
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **TypeScript gate (EXECUTE only):** Run `npx tsc --noEmit` after writing. Fix all errors. Step cannot complete with TypeScript errors.
6. **Anti-hallucination:** CSS variable names, component props, function signatures — all must be confirmed from the actual file being edited or from `CONTEXT_DIR/tech-facts.md`.

---

## Task
[Specific, named, bounded. Names exact files and exact actions.]

---

## Verification
- [ ] [Binary pass/fail check]
- [ ] [Binary pass/fail check]
- [ ] [EXECUTE only] `npx tsc --noEmit` exits with code 0

---

## State Update
1. Append "[step-id]" to completedSteps
2. Remove "[step-id]" from pendingSteps
3. Set flags.[relevant-flag] = true (if applicable)
4. Append written files to artifacts.filesWritten (EXECUTE only)
```

### prompt-01.md — COLLECT: Verify bug locations

**Task:** Read the following two files and confirm the exact code matches the pre-session research. Write `CONTEXT_DIR/verified-locations.md` with exact quotes of the relevant lines.

1. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts`. Find line 75. Quote the exact `.order(` call. Confirm it says `ascending: false`.
2. Read `C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx`. Find the bottom of the scrollable chat list div (the one with `role="list"`). Confirm there is no footer section after the list. Note the exact closing `</div>` pattern to use as the insertion point.
3. Write `CONTEXT_DIR/verified-locations.md` containing:
   - The exact quoted line from the messages route
   - The exact line number range for the end of the chat list in Sidebar.tsx (the closing of the list container, before the final `</div>` of the sidebar panel)
   - A note confirming the `useRouter` import is present in Sidebar.tsx

**Verification:**
- [ ] `CONTEXT_DIR/verified-locations.md` exists
- [ ] Contains exact quoted `.order(` line from messages route
- [ ] Contains line number for sidebar list closing tag

**State Update:** Set `flags.codebaseVerified = true`

---

### prompt-02.md — PLAN: Message order fix

**Prerequisites:** `flags.codebaseVerified = true`; read `CONTEXT_DIR/bug-locations.md`, `CONTEXT_DIR/verified-locations.md`

**Task:** Write `PLANS_DIR/02-message-order-plan.md` containing:
- File: exact absolute path to the messages route
- Line: exact line number (from verified-locations.md)
- Before state: the exact current line text (quoted from verified-locations.md)
- After state: the exact replacement line
- Why: one sentence explaining the causal chain (descending → array order → reversed display)
- Verification test: "After fix, the first element of the `messages` array returned by `GET /api/chats/[chatId]/messages` should be the oldest message (lowest `created_at`)"

Do NOT write any application code.

**Verification:**
- [ ] `PLANS_DIR/02-message-order-plan.md` exists
- [ ] Contains "Before state" and "After state" sections with exact line text

---

### prompt-03.md — EXECUTE: Fix message order

**Prerequisites:** `flags.codebaseVerified = true`; read `PLANS_DIR/02-message-order-plan.md`

**Task:**
1. Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts` in full.
2. Find the `.order("created_at", { ascending: false })` line (should be line ~75).
3. Use the Edit tool to change `ascending: false` to `ascending: true`. Change only this value — nothing else in the file.
4. Run `npx tsc --noEmit`. Fix any TypeScript errors if present (there should be none — this is a value change inside a Supabase query builder).

**Verification:**
- [ ] The file at `app/api/chats/[chatId]/messages/route.ts` contains `ascending: true` (not `false`)
- [ ] No other lines in the file were changed
- [ ] `npx tsc --noEmit` exits with code 0

**State Update:** Set `flags.messageOrderFixed = true`. Append `"app/api/chats/[chatId]/messages/route.ts"` to `artifacts.filesWritten`.

---

### prompt-04.md — PLAN: Sidebar settings fix

**Prerequisites:** `flags.codebaseVerified = true`; read `CONTEXT_DIR/bug-locations.md`, `CONTEXT_DIR/tech-facts.md`, `CONTEXT_DIR/verified-locations.md`

**Task:** Write `PLANS_DIR/04-sidebar-settings-plan.md` containing:

1. **Insertion point:** The exact location in `components/Sidebar.tsx` where the footer should be inserted (after the scrollable list div closes, before the final closing `</div>` of the sidebar panel). Use the line number range from `verified-locations.md`.

2. **JSX to insert:** A footer `<div>` containing a single "Settings" `<button>` element. The button must:
   - Call `onClose()` then `router.push('/settings')` on click
   - Use the existing `router` variable (already declared via `useRouter` at the top of the component)
   - Be styled with the same CSS variables as the existing "New Chat" button, but using `--color-surface-raised` background instead of gradient
   - Have `aria-label="Go to settings"`
   - Include a settings gear SVG icon (simple, 18x18, matching the style of other icons in the file) OR just the text "Settings"

3. **Style spec for footer container:**
   - `padding: var(--spacing-md)`
   - `borderTop: '1px solid var(--color-border)'`
   - `flexShrink: 0`

4. **Style spec for button:**
   - Match the "New Chat" button style but with `--color-surface-raised` background, `--color-border` border, `--color-text-secondary` text color
   - `width: '100%'`, `minHeight: 'var(--tap-target-min)'`

Write the plan with the exact JSX spelled out. Do not write to `components/Sidebar.tsx` yet.

**Verification:**
- [ ] `PLANS_DIR/04-sidebar-settings-plan.md` exists
- [ ] Contains exact insertion line number
- [ ] Contains complete JSX for the footer

---

### prompt-05.md — EXECUTE: Add settings to sidebar

**Prerequisites:** `flags.codebaseVerified = true`; read `PLANS_DIR/04-sidebar-settings-plan.md`

**Task:**
1. Read `C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx` in full.
2. Find the exact insertion point described in the plan (end of chat list div, before the panel's closing `</div>`).
3. Insert the footer JSX from the plan using the Edit tool.
4. Verify: the component still has correct structure (sidebar panel div closes correctly, no JSX nesting errors).
5. Run `npx tsc --noEmit`. Fix any TypeScript errors.

**Important:** The Sidebar component already has `useRouter` imported and `router` declared. Do not add duplicate imports.

**Verification:**
- [ ] `components/Sidebar.tsx` contains a footer section with a "Settings" navigation button
- [ ] The button's `onClick` calls `onClose()` and `router.push('/settings')`
- [ ] No duplicate `import` statements introduced
- [ ] `npx tsc --noEmit` exits with code 0

**State Update:** Set `flags.settingsNavFixed = true`. Append `"components/Sidebar.tsx"` to `artifacts.filesWritten`.

---

### prompt-06.md — EXECUTE: Commit and push

**Prerequisites:** `flags.messageOrderFixed = true`, `flags.settingsNavFixed = true`

**Task:**
1. Run `npx tsc --noEmit` one final time. If any errors appear, do not commit — report the error.
2. Run `git status` to confirm only the expected files are modified:
   - `app/api/chats/[chatId]/messages/route.ts`
   - `components/Sidebar.tsx`
3. Run:
   ```
   git add app/api/chats/[chatId]/messages/route.ts components/Sidebar.tsx
   git commit -m "fix: correct message sort order and add settings navigation to sidebar

   - Fix reversed chat history: change messages API to ascending sort (created_at ASC)
   - Add Settings footer to Sidebar component so users can reach /settings

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
   git push origin main
   ```
4. Run `git log --oneline -3` to confirm the commit appears.

**Verification:**
- [ ] `npx tsc --noEmit` exits 0
- [ ] `git status` shows working tree clean after push
- [ ] `git log --oneline -1` shows the new commit message

**State Update:** Set `flags.allChangesCommitted = true`.

---

## Phase 4 — Write state.json

Write STATE_FILE with exactly this content:

```json
{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "risedial",
  "buildTarget": "C:\\Users\\Alexb\\Documents\\RiseDialapp",
  "orchestration_dir": "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\risedial-audit",
  "completedSteps": [],
  "pendingSteps": [
    "step-01-collect-verify-files",
    "step-02-plan-message-order-fix",
    "step-03-execute-message-order-fix",
    "step-04-plan-sidebar-settings-fix",
    "step-05-execute-sidebar-settings-fix",
    "step-06-commit-and-push"
  ],
  "artifacts": {
    "filesWritten": [],
    "plansCreated": []
  },
  "flags": {
    "codebaseVerified": false,
    "messageOrderFixed": false,
    "settingsNavFixed": false,
    "allChangesCommitted": false
  },
  "knownBugs": {
    "MSG-ORDER": "pending",
    "SETTINGS-INVISIBLE": "pending",
    "SIDEBAR-EMPTY": "pending"
  }
}
```

---

## Phase 5 — Write Runner Command

Write `C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\run-risedial-audit.md` with this exact content:

```
---
description: Execute the RiseDial audit and fix pipeline. Runs the next pending step and loops up to SESSION_BUDGET steps. Resume anytime with /run-risedial-audit.
allowed-tools: Read Write Edit Bash Agent Glob Grep
---

You are executing /run-risedial-audit.

## Configuration

SESSION_BUDGET  = 3
STATE_FILE      = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json
PROMPTS_DIR     = C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\prompts
TOTAL_STEPS     = 6

## Anti-Hallucination Protocol

Before spawning any EXECUTE-mode step:
1. Confirm the plan file for that step exists in PLANS_DIR
2. Read the plan file — verify the target file path it names actually exists in the project
3. If the plan references a function or line that cannot be found: spawn a COLLECT agent first to re-locate it, update the plan, then proceed with EXECUTE

## Execution Loop

1. Read STATE_FILE. Parse pendingSteps and completedSteps.
2. steps_this_session = 0
3. If pendingSteps is empty → print completion block and stop.
4. LOOP while pendingSteps not empty AND steps_this_session < SESSION_BUDGET:
   a. current_step = pendingSteps[0]
   b. Derive prompt file: find prompt-NN.md in PROMPTS_DIR whose Step ID line matches current_step
   c. Read that prompt file in full
   d. Spawn ONE Agent with the full prompt file contents as its prompt
   e. Wait for agent to complete
   f. Read STATE_FILE. Move current_step from pendingSteps → completedSteps. Write STATE_FILE.
   g. steps_this_session++
   h. Print: "✓ [current_step] done ([steps_this_session]/SESSION_BUDGET this session, [completedSteps.length]/TOTAL_STEPS total)"
   i. Loop to 4a
5. After loop:
   - If pendingSteps empty → print completion block
   - If SESSION_BUDGET reached → print next-session block

## Completion Block

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ ALL 6 STEPS COMPLETE
  
  Fixes applied:
  - Chat message sort order corrected (ascending)
  - Settings navigation added to sidebar
  
  Push is done. Vercel will auto-deploy from main.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Next-Session Block

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SESSION COMPLETE: [completedSteps.length] / 6 steps done.

  1. CLOSE THIS CHAT
  2. OPEN A NEW CLAUDE CODE CHAT
  3. PASTE THIS COMMAND:

/run-risedial-audit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## State File Write Rules
Preserve all fields. Mutate only:
- pendingSteps: remove current_step from front
- completedSteps: append current_step
- flags: set relevant flag to true when its step completes
```

---

## Phase 6 — Output to User

After the runner file is written, print EXACTLY this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  BOOTSTRAP COMPLETE

  Steps planned: 6
  Bugs targeted:
    ✓ Chat message reverse-order on reload (1-line fix)
    ✓ Settings unreachable — adding navigation to sidebar
    ✓ Sidebar empty — adding settings footer

  ──────────────────────────────────────────────────────
  YOUR ONE JOB:

  1. CLOSE THIS CHAT
  2. OPEN A NEW CLAUDE CODE CHAT
  3. PASTE THIS COMMAND:

/run-risedial-audit

  ──────────────────────────────────────────────────────
  Claude runs 3 steps per session.
  When a session ends, you will see this same instruction.
  You never need to write code or make decisions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Global Rules

1. **Mode purity:** COLLECT steps read only (write to context/ only). PLAN steps write plans only (no app code). EXECUTE steps change application code only.
2. **No execution without a plan:** Every EXECUTE step reads its corresponding plan file first.
3. **TypeScript gate:** Every EXECUTE step runs `npx tsc --noEmit`. Step cannot mark itself complete with TypeScript errors.
4. **Verification before state update:** No step updates state.json until all its verification checkboxes pass.
5. **No invented values:** Prop names, CSS variables, function names — all come from the actual source file being edited or from `CONTEXT_DIR/tech-facts.md`.
6. **Do not touch:** `middleware.ts`, `lib/auth/session.ts`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`.
