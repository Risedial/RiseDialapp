# Prompt 01: Verify Bug Locations
**Mode:** COLLECT
**Step ID:** step-01-collect-verify-files

## Prerequisites
None. This is the first step.

Context files to read before starting:
- `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\bug-locations.md`
- `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Hard Constraints

1. **Mode lock — COLLECT:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\` — no application file edits whatsoever.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely. No `// ... more`.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **No invented values:** Every quoted line must come directly from the actual file read — not from memory or context files.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`
CONTEXT_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context`

---

## Task

Read two source files and confirm the exact code matches pre-session research. Write a verification document.

**Step 1 — Read the messages route:**
Read `C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts` in full.
- Find the `.order(` call that references `created_at`.
- Quote the exact line verbatim (including indentation).
- Note its line number.

**Step 2 — Read the Sidebar component:**
Read `C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx` in full.
- Find the scrollable chat list container — it should have `role="list"` or similar.
- Find where the list ends and what the surrounding JSX structure looks like near the bottom of the component's return statement.
- Confirm whether `useRouter` is imported and `router` is declared.
- Note the exact line numbers for:
  - The closing of the chat list container div
  - The final closing `</div>` of the sidebar panel (the outermost rendered container)

**Step 3 — Write verification file:**
Write `CONTEXT_DIR/verified-locations.md` with this structure:

```
# Verified Bug Locations
**Written by:** prompt-01 (COLLECT step)
**Date:** [today]

## BUG-1: Messages Route
- File: C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts
- Line number: [exact line]
- Exact quoted text: [paste the exact line]
- Confirmed: ascending: false → needs to be changed to ascending: true

## BUG-2/3: Sidebar Component
- File: C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx
- useRouter imported: [yes/no]
- router variable declared: [yes/no, and which line]
- Chat list closing tag line: [line number]
- Sidebar panel final closing tag line: [line number]
- Insertion point: Insert footer JSX at line [N], before the final closing </div> of the sidebar panel
- Exact JSX context at insertion point:
  [paste 3-5 lines of code surrounding the insertion point]
```

---

## Verification
- [ ] `CONTEXT_DIR/verified-locations.md` exists and was written by this step
- [ ] Contains exact quoted `.order(` line from the messages route (not paraphrased)
- [ ] Contains confirmed line numbers for the sidebar insertion point
- [ ] Contains confirmation that `useRouter` is imported in Sidebar.tsx

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Set `flags.codebaseVerified = true`
3. Move `"step-01-collect-verify-files"` from `pendingSteps` to `completedSteps`
4. Write STATE_FILE back with these changes (preserve all other fields exactly)
