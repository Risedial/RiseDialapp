# Prompt 06: Execute — Commit and Push All Fixes
**Mode:** EXECUTE
**Step ID:** step-06-commit-and-push

## Prerequisites
- `flags.messageOrderFixed = true` in STATE_FILE
- `flags.settingsNavFixed = true` in STATE_FILE
- Both flags must be true. If either is false, stop and report which fix is incomplete.
- Read STATE_FILE before starting.

---

## Hard Constraints

1. **Mode lock — EXECUTE (git only):** This step only runs git commands. No application file edits.
2. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
3. **TypeScript gate first:** Run `npx tsc --noEmit` before committing. Do not commit if there are TypeScript errors.
4. **Exact files only:** Stage ONLY the two modified files. Do not use `git add .` or `git add -A`.
5. **Do not push to a different branch:** Push to `origin main` only.
6. **Do not force push:** Use plain `git push origin main` only.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Task

Commit the two bug fixes and push to the remote repository.

**Step 1 — Final TypeScript check:**
Run: `npx tsc --noEmit`
Working directory: `C:\Users\Alexb\Documents\RiseDialapp`
If any errors appear, stop immediately. Report the errors. Do not commit.

**Step 2 — Verify modified files:**
Run: `git status`
Confirm the output shows modifications to ONLY these two files:
- `app/api/chats/[chatId]/messages/route.ts`
- `components/Sidebar.tsx`

If any unexpected files appear as modified or staged:
- Investigate before proceeding
- Do not stage unexpected files
- Report what you found

**Step 3 — Stage the two files:**
Run:
```
git add "app/api/chats/[chatId]/messages/route.ts" "components/Sidebar.tsx"
```

**Step 4 — Commit:**
Run this exact commit command:
```
git commit -m "$(cat <<'EOF'
fix: correct message sort order and add settings navigation to sidebar

- Fix reversed chat history: change messages API to ascending sort (created_at ASC)
- Add Settings footer to Sidebar component so users can reach /settings

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**Step 5 — Push:**
Run: `git push origin main`
Wait for push to complete. If push fails (e.g. remote has changes ahead), report the error — do not force push.

**Step 6 — Verify:**
Run: `git log --oneline -3`
Confirm the new commit appears at the top with the expected message.

Run: `git status`
Confirm working tree is clean.

---

## Verification
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `git status` shows working tree clean after push
- [ ] `git log --oneline -1` shows the new commit with "fix: correct message sort order" in the message
- [ ] Push completed without errors

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Set `flags.allChangesCommitted = true`
3. Set `knownBugs.MSG-ORDER` to `"fixed"`
4. Set `knownBugs.SETTINGS-INVISIBLE` to `"fixed"`
5. Set `knownBugs.SIDEBAR-EMPTY` to `"fixed"`
6. Move `"step-06-commit-and-push"` from `pendingSteps` to `completedSteps`
7. Write STATE_FILE back with these changes (preserve all other fields exactly)
