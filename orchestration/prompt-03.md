# Prompt 03: Write Environment Variables

## Prerequisites

state.json flags that must be true:
- `flags.projectInitialized` must be `true` (set by step-01-initialize-nextjs-project)

Context files to read before beginning:
- `context/app-architecture.md` — exact environment variable names

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/.env.local.example` with all 13 required environment variable names (exact names from design_decisions.md), empty values, and an inline comment explaining each variable.

The 13 variables in exact order:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
STRIPE_PRICE_PREMIUM_MONTHLY_ADDON=
STRIPE_PRICE_PREMIUM_ANNUAL_ADDON=
JWT_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
```

Each variable must have an inline `#` comment on the same line explaining what it is.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/.env.local.example` exists
- [ ] File contains exactly 13 environment variable entries
- [ ] Every entry has an inline comment
- [ ] All variable names match the exact list above
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-03-write-environment-variables"` to `completedSteps`
2. Remove `"step-03-write-environment-variables"` from `pendingSteps`
3. Append to `artifacts.filesWritten`: `"risedial-production/.env.local.example"`
