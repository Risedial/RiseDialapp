# Prompt 05: Execute — Add Settings Footer to Sidebar
**Mode:** EXECUTE
**Step ID:** step-05-execute-sidebar-settings-fix

## Prerequisites
- `flags.codebaseVerified = true` in STATE_FILE
- Plan file must exist: `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\04-sidebar-settings-plan.md`
- Read these files before starting:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\04-sidebar-settings-plan.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Read the plan file first. Every identifier must be verified against the actual source file before writing. No invented values.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Never truncate a file write with `// ... more` or similar.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **TypeScript gate:** Run `npx tsc --noEmit` after writing. Fix all errors before marking complete.
6. **No duplicate imports:** The Sidebar already imports `useRouter` from `next/navigation`. Do NOT add another import for `useRouter` or any other already-imported symbol.
7. **Anti-hallucination:** Every CSS variable, prop name, and function call must be verified against the actual file content before inserting. Do not invent anything.
8. **DO NOT TOUCH:** `middleware.ts`, `lib/auth/session.ts`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Task

Add a Settings navigation footer to the Sidebar component.

**Step 1 — Verify plan file exists:**
Confirm `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\04-sidebar-settings-plan.md` exists. If not, stop and report.

**Step 2 — Read plan:**
Read the plan file. Note the insertion point (line number), the complete JSX to insert, and the list of what NOT to change.

**Step 3 — Read Sidebar source:**
Read `C:\Users\Alexb\Documents\RiseDialapp\components\Sidebar.tsx` in full.
- Confirm `useRouter` is already imported (do not add it again).
- Confirm `router` is already declared via `useRouter()`.
- Confirm `onClose` is a prop available in scope.
- Locate the insertion point from the plan. Verify the surrounding context matches what the plan described.

**Step 4 — Apply edit:**
Use the Edit tool to insert the footer JSX at the exact insertion point from the plan.
- The `old_string` must be the exact text immediately before the insertion point (enough context to be unique — at least 3–5 lines ending at the insertion point).
- The `new_string` must be that same text PLUS the footer JSX appended after it.
- Do not modify any other code.

**Step 5 — Verify structure:**
Read the modified `components/Sidebar.tsx`. Confirm:
- The footer `<div>` and `<button>` are present
- The button's `onClick` calls `onClose()` and `router.push('/settings')`
- The JSX nesting is correct — no unclosed tags, no extra closing tags
- No duplicate `import` statements were introduced

**Step 6 — Run TypeScript check:**
Run: `npx tsc --noEmit`
Working directory: `C:\Users\Alexb\Documents\RiseDialapp`
If any errors appear, read them carefully and fix them. Re-run until exit code 0.
Common issues to watch for:
- If `onClose` prop type doesn't match the call signature — check the component's Props interface
- If router type error — confirm `useRouter` from `next/navigation` is already imported (it should be)

---

## Verification
- [ ] `components/Sidebar.tsx` contains a footer `<div>` with a Settings `<button>`
- [ ] The button's `onClick` calls `onClose()` and `router.push('/settings')`
- [ ] No duplicate import statements were introduced
- [ ] JSX nesting is correct (component renders without syntax errors)
- [ ] `npx tsc --noEmit` exits with code 0

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Set `flags.settingsNavFixed = true`
3. Move `"step-05-execute-sidebar-settings-fix"` from `pendingSteps` to `completedSteps`
4. Append `"components/Sidebar.tsx"` to `artifacts.filesWritten`
5. Write STATE_FILE back with these changes (preserve all other fields exactly)
