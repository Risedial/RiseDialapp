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
