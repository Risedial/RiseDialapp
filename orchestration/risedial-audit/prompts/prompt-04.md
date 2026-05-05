# Prompt 04: Plan — Sidebar Settings Footer
**Mode:** PLAN
**Step ID:** step-04-plan-sidebar-settings-fix

## Prerequisites
- `flags.codebaseVerified = true` in STATE_FILE
- Read these files before starting:
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\bug-locations.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\tech-facts.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\context\verified-locations.md`
  - `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`

---

## Hard Constraints

1. **Mode lock — PLAN:** Write only to `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans\` — no application file edits.
2. **Token limit:** 32,000 tokens max.
3. **No truncation:** Write the plan file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** CSS variable names, component props, function signatures — all must come from `tech-facts.md` or `verified-locations.md`. Do not invent prop names.
6. **No duplicate imports:** Sidebar already has `useRouter` imported. The plan must NOT add another `useRouter` import.

STATE_FILE = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\state.json`
PLANS_DIR = `C:\Users\Alexb\Documents\RiseDialapp\orchestration\risedial-audit\plans`

---

## Task

Write `PLANS_DIR/04-sidebar-settings-plan.md` describing exactly how to add a Settings footer to the Sidebar component.

The plan must include all of these sections:

**Target file:** Absolute path to `components/Sidebar.tsx`.

**Insertion point:** The exact line number where the footer JSX should be inserted (from verified-locations.md). State it as: "Insert immediately before line [N], which is the final closing `</div>` of the sidebar panel." Include 3–5 lines of surrounding code from verified-locations.md so the EXECUTE agent can orient itself.

**What to insert:** A footer section consisting of a wrapping `<div>` and a single `<button>` child. Write the complete JSX for the footer. Requirements:
- The wrapping `<div>` style: `{{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}`
- The `<button>`:
  - `onClick`: calls `onClose()` first, then `router.push('/settings')`
  - `aria-label`: `"Go to settings"`
  - Style: `{{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', width: '100%', minHeight: 'var(--tap-target-min)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer', transition: 'var(--transition-fast)' }}`
  - Content: A settings gear SVG icon (18×18) followed by the text "Settings". Use this exact SVG:
    ```
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
    ```

**What NOT to change:**
- Do not add any new imports (useRouter is already imported)
- Do not modify any existing JSX above the insertion point
- Do not change any existing state, effects, or handlers

**TypeScript notes:**
- `router.push('/settings')` — `router` is already typed via `useRouter()` from `next/navigation`
- `onClose` — already typed as a prop of the component; its type is `() => void`
- No new types needed

Do NOT write any application code. Do NOT edit any file outside PLANS_DIR.

---

## Verification
- [ ] `PLANS_DIR/04-sidebar-settings-plan.md` exists
- [ ] Contains exact insertion line number (sourced from verified-locations.md)
- [ ] Contains complete JSX for the footer div and button, including the SVG
- [ ] States explicitly that no new imports are needed
- [ ] All CSS variables used are listed in tech-facts.md

---

## State Update
After all verification checks pass:
1. Read STATE_FILE
2. Move `"step-04-plan-sidebar-settings-fix"` from `pendingSteps` to `completedSteps`
3. Append `"plans/04-sidebar-settings-plan.md"` to `artifacts.plansCreated`
4. Write STATE_FILE back with these changes (preserve all other fields exactly)
