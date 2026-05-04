# Prompt 01: Initialize Next.js Project

## Prerequisites

None.

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write the following files to `risedial-production/`:

- `package.json` with all required dependencies:
  ```json
  {
    "name": "risedial",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "next": "14.x",
      "react": "18.x",
      "react-dom": "18.x",
      "typescript": "5.x",
      "tailwindcss": "3.x",
      "next-pwa": "5.x",
      "@supabase/supabase-js": "2.x",
      "openai": "4.x",
      "stripe": "14.x",
      "bcryptjs": "2.x",
      "jsonwebtoken": "9.x",
      "zod": "3.x",
      "resend": "3.x"
    },
    "devDependencies": {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "@types/bcryptjs": "^2",
      "@types/jsonwebtoken": "^9",
      "autoprefixer": "^10",
      "postcss": "^8",
      "eslint": "^8",
      "eslint-config-next": "14.x"
    }
  }
  ```
- `next.config.js` (skeleton — Next.js 14 App Router config, PWA will be added in step 46)
- `tsconfig.json` (standard Next.js 14 TypeScript config with strict mode)
- `tailwind.config.ts` (skeleton — extend with design tokens in step 48)
- `.eslintrc.json` (eslint-config-next)

Read `context/app-architecture.md` for architecture context once it exists.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/package.json` exists and contains all 13 dependency entries
- [ ] File `risedial-production/next.config.js` exists
- [ ] File `risedial-production/tsconfig.json` exists
- [ ] File `risedial-production/tailwind.config.ts` exists
- [ ] File `risedial-production/.eslintrc.json` exists
- [ ] No `// ... more`, ellipses, or placeholder comments appear in any written file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-01-initialize-nextjs-project"` to `completedSteps`
2. Remove `"step-01-initialize-nextjs-project"` from `pendingSteps`
3. Set `flags.projectInitialized` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/package.json"`, `"risedial-production/next.config.js"`, `"risedial-production/tsconfig.json"`, `"risedial-production/tailwind.config.ts"`, `"risedial-production/.eslintrc.json"`
