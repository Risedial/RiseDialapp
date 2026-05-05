# Tech Facts — Anti-Hallucination Reference
**Status:** IMMUTABLE

- Framework: Next.js 14.2.35 (App Router)
- React: 18.x
- TypeScript: 5.9.3
- Styling: CSS-in-JS via inline `style` props + CSS variables (no Tailwind classes in components)
- Database: Supabase (supabase-js 2.x)
- Auth: Custom JWT in httpOnly cookie named `risedial_session`
- Message type: `{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }`
  (Note: API returns `created_at` snake_case, client type uses `createdAt` camelCase — check actual field name before writing)
- Sidebar CSS variables in use: `--color-surface`, `--color-border`, `--color-text-primary`,
  `--color-text-secondary`, `--color-text-muted`, `--color-surface-raised`, `--color-error`,
  `--color-accent-start`, `--color-accent-end`, `--font-family`, `--font-size-sm`,
  `--font-size-xs`, `--font-size-md`, `--font-weight-normal`, `--font-weight-medium`,
  `--font-weight-semibold`, `--radius-sm`, `--radius-md`, `--spacing-xs`, `--spacing-sm`,
  `--spacing-md`, `--spacing-lg`, `--tap-target-min`, `--transition-fast`, `--z-sidebar`, `--z-modal`
- Sidebar already imports: `useState`, `useEffect`, `useRef`, `useCallback`, `TouchEvent` from react;
  `useRouter`, `usePathname` from `next/navigation`
- DO NOT TOUCH: `middleware.ts`, `lib/auth/session.ts`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`
