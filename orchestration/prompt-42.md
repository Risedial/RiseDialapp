# Prompt 42: Write Settings Screen

## Prerequisites

state.json flags that must be true:
- `flags.chatArchitectureComplete` must be `true` (set by step-31-write-chat-crud-endpoints)
- `flags.memorySystemComplete` must be `true` (set by step-29-write-async-compression-executor)

Context files to read before beginning:
- `context/app-stripe-config.md` — premium add-on prices for toggle display
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — "Deleted Chat — [date]" format, empty memory state copy

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/settings/page.tsx` — the Settings screen with 4 sections:

1. **Profile section**: preferred name field (editable inline, saves on blur/enter via PATCH, shows "Saved" confirmation briefly), email address (display-only)

2. **Subscription section**: current plan name (Monthly/Annual), next billing date, Premium Memory toggle (shows "+$6.25/month" or "+$50.00/year" based on plan, calls PATCH /api/subscription/premium-toggle on toggle), "Manage Billing" button (calls POST /api/subscription/portal, redirects to returned URL)

3. **Chat Memories section**: list of chats that contributed to memory profile. If chat is deleted, show "Deleted Chat — [date]" (exact format from context/app-copy-strings.md). Each entry has View button (opens ChatMemoriesModal) and Download button (triggers JSON file download). Empty state: "Your memory profile will appear here after your first extended conversation." (exact from context/app-copy-strings.md)

4. **Account section**: "Log Out" button (calls POST /api/auth/signout, redirects to /signin), "Delete Account" button (shows confirmation modal — modal asks for confirmation + shows GDPR data export option with "Download my data" button — on confirm: cancels Stripe subscription, deletes all data, logs out)

Read `context/app-copy-strings.md` for all exact strings.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/settings/page.tsx` exists
- [ ] All 4 sections are present: Profile, Subscription, Chat Memories, Account
- [ ] Premium Memory toggle shows correct prices based on plan type
- [ ] "Deleted Chat — [date]" format is used for deleted chats
- [ ] Delete Account requires confirmation modal
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-42-write-settings-screen"` to `completedSteps`
2. Remove `"step-42-write-settings-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/settings/page.tsx"`
