# Prompt 02: Plan — Message Order Fix
**Mode:** PLAN
**Step ID:** step-02-plan-message-order-fix

## Prerequisites
- `flags.codebaseVerified = true` in STATE_FILE
- Read these files before starting:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\bug-locations.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\verified-locations.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\` — no application file edits.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Write the plan file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Use verified data only:** All file paths, line numbers, and quoted text must come from `verified-locations.md`, not invented.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`
PLANS_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans`

---

## Task

Write `PLANS_DIR/02-message-order-plan.md` containing a surgical fix plan for BUG-1.

The plan must include all of these sections:

**File:** The exact absolute path to the messages route file (from verified-locations.md).

**Line:** The exact line number of the `.order(` call (from verified-locations.md).

**Before state:** The exact current line text, quoted verbatim from verified-locations.md. Wrap in a code block.

**After state:** The exact replacement line — identical to Before state except `false` changed to `true`. Wrap in a code block.

**Why this fixes the bug:** One to two sentences explaining the causal chain:
- Supabase `.order("created_at", { ascending: false })` returns rows newest-first
- The client stores the array as-is and renders messages in array order
- Result: newest message at index 0 appears at top of chat — upside down
- Changing to `ascending: true` returns oldest-first, which matches the expected top-to-bottom display

**Change scope:** State explicitly that ONLY the boolean value changes. No other lines are touched. No imports added. No function signatures changed.

**Verification test:** "After fix, the first element of the messages array returned by `GET /api/chats/[chatId]/messages` should be the oldest message (lowest `created_at` timestamp)."

**TypeScript impact:** None expected — this is a value change inside a Supabase query builder chain. The type of the return value does not change.

Do NOT write any application code. Do NOT edit any file outside PLANS_DIR.

---

## Verification
- [ ] `PLANS_DIR/02-message-order-plan.md` exists
- [ ] Contains "Before state" section with the exact quoted line from verified-locations.md
- [ ] Contains "After state" section with only `false` changed to `true`
- [ ] Contains "Change scope" section stating only the boolean changes

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Move `"step-02-plan-message-order-fix"` from `pendingSteps` to `completedSteps`
3. Append `"plans/02-message-order-plan.md"` to `artifacts.plansCreated`
4. Write STATE_FILE back with these changes (preserve all other fields exactly)
