# Plan: Fix Message Order (BUG-1)
**Step ID:** step-02-plan-message-order-fix
**Mode:** PLAN
**Date:** 2026-05-05

---

## File

`C:\Users\Alexb\Documents\RiseDialapp\app\api\chats\[chatId]\messages\route.ts`

---

## Line

Line 76

---

## Before State

```
    .order("created_at", { ascending: false })
```

---

## After State

```
    .order("created_at", { ascending: true })
```

---

## Why This Fixes the Bug

Supabase `.order("created_at", { ascending: false })` returns rows newest-first (descending); the client stores this array as-is and renders messages in array order, so the newest message at index 0 appears at the top of the chat — the conversation is displayed upside down. Changing to `ascending: true` returns rows oldest-first, which matches the expected top-to-bottom chat display where the oldest message appears at the top and the newest at the bottom.

---

## Change Scope

ONLY the boolean value changes: `false` is replaced with `true` on line 76. No other lines are touched. No imports are added. No function signatures are changed. No other files are modified.

---

## Verification Test

After fix, the first element of the messages array returned by `GET /api/chats/[chatId]/messages` should be the oldest message (lowest `created_at` timestamp).

---

## TypeScript Impact

None expected — this is a value change inside a Supabase query builder chain. The type of the return value does not change.
