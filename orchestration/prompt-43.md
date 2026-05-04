# Prompt 43: Write Chat Memories Modal

## Prerequisites

state.json flags that must be true:
- `flags.memorySystemComplete` must be `true` (set by step-29-write-async-compression-executor)

Context files to read before beginning:
- `context/app-design-tokens.css` — CSS custom property values
- `context/app-copy-strings.md` — empty state copy

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/components/ChatMemoriesModal.tsx` — a modal component that:
- Accepts props: `{ isOpen: boolean, onClose: () => void, memoryProfile: object | null }`
- When `memoryProfile` is null or has no data: shows empty state "Your memory profile will appear here after your first extended conversation." (exact from context/app-copy-strings.md)
- When profile exists: renders memory profile in human-readable sections:
  - Core Themes (from coreThemes[])
  - Emotional Patterns (from emotionalPatterns[])
  - Worldview (from worldview[])
  - Challenges (from challenges[])
  - Values (from values[])
  - Blindspots (from blindspots[])
  - Memorable Statements (from memorableStatements[])
  - Rise's Observations (from clinicalObservations[])
- "Download Raw JSON" button: triggers browser file download of the raw profile JSON
- Close button (X) at top right
- Modal overlay with --z-modal z-index, backdrop tap closes
- Dark design using CSS custom property values

Read `context/app-copy-strings.md` for empty state string.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/components/ChatMemoriesModal.tsx` exists
- [ ] All 8 memory profile sections are rendered
- [ ] Empty state uses exact copy from context/app-copy-strings.md
- [ ] Download JSON button triggers file download
- [ ] Close button is present
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-43-write-chat-memories-modal"` to `completedSteps`
2. Remove `"step-43-write-chat-memories-modal"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/components/ChatMemoriesModal.tsx"`
