# Prompt 41: Write Sidebar Drawer Component

## Prerequisites

state.json flags that must be true:
- `flags.chatArchitectureComplete` must be `true` (set by step-31-write-chat-crud-endpoints)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values (--z-sidebar, --transition-standard, colors)

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/components/Sidebar.tsx` — a slide-in drawer component with:
- Slides in from left on trigger (swipe-right gesture or icon tap from header)
- Backdrop: dark overlay behind sidebar, tap to close
- Sidebar width: 80% of screen width, max 320px
- "New Chat" button at top: calls POST /api/chats, redirects to new chat
- Chat list: scrollable, each item shows title + last message preview (truncated to ~50 chars) + relative timestamp ("2 hours ago", "Yesterday", date)
- Active chat: highlighted with --color-surface-raised background
- Delete button on each chat item: shows confirmation before calling DELETE /api/chats/[chatId]
- Slide animation using CSS transitions (--transition-standard)
- z-index: --z-sidebar
- Touch gesture: detect swipe-right from left edge (touchstart x < 20px, touchmove diff > 50px) to open; swipe-left to close

Read `context/app-design-tokens.css` for animation timing and z-index values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/components/Sidebar.tsx` exists
- [ ] Slide animation is CSS-based (no external animation library)
- [ ] Backdrop tap closes sidebar
- [ ] Chat delete requires confirmation
- [ ] Active chat is highlighted
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-41-write-sidebar-drawer-component"` to `completedSteps`
2. Remove `"step-41-write-sidebar-drawer-component"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/components/Sidebar.tsx"`
