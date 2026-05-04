# Prompt 40: Write Main Chat Screen

## Prerequisites

state.json flags that must be true:
- `flags.chatArchitectureComplete` must be `true` (set by step-31-write-chat-crud-endpoints)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — UI copy strings

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/app/chat/[chatId]/page.tsx` and required sub-components. If token output risks exceeding 25,000 tokens, stop after implementing the page skeleton + server logic and note in the completion message.

Requirements:
- Dark full-height mobile layout
- Header: Rise avatar (circular, use initials "R" as fallback) + "Rise" name text + green "Online" dot (--color-online) + sidebar trigger icon button
- Scrollable message list: user messages right-aligned with blue-teal gradient (--color-user-bubble-start to --color-user-bubble-end), Rise messages left-aligned with --color-rise-bubble surface
- Timestamps: always visible below each message at low opacity (--color-text-muted), format: "4:32 PM" same day, "Apr 22 · 4:32 PM" previous days
- Typing indicator: three animated dots (CSS keyframe animation) + Rise avatar, shown while awaiting response
- Input area: auto-expanding textarea (starts at 1 row, max 5 rows before internal scroll), min 44px height, safe-area-inset-bottom padding
- Send button: arrow icon, disabled state when input is empty (--color-disabled background)
- New message indicator: "New message ↓" button shown when user has scrolled up and new Rise response arrives
- Pull-to-refresh: disabled (overscroll-behavior: contain)
- Markdown rendering: bold (`**text**` → `<strong>`), italic (`*text*` → `<em>`), line breaks (rendered)
- On send: POST to /api/chat/[chatId]/message, show typing indicator while awaiting, append Rise response
- Load messages on mount from /api/chats/[chatId]/messages
- Keyboard handling: CSS fix for iOS Safari viewport height (use CSS env(keyboard-inset-height) or equivalent)

Read `context/app-design-tokens.css` for all color values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/app/chat/[chatId]/page.tsx` exists
- [ ] Header includes Rise avatar, "Rise" name, online dot, sidebar trigger
- [ ] User bubbles are right-aligned with gradient colors
- [ ] Rise bubbles are left-aligned with surface color
- [ ] Textarea auto-expands up to 5 rows
- [ ] Safe-area-inset-bottom is applied to input container
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-40-write-main-chat-screen"` to `completedSteps`
2. Remove `"step-40-write-main-chat-screen"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/app/chat/[chatId]/page.tsx"`
