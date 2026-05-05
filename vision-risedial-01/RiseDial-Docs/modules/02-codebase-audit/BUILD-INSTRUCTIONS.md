# Module 2 — Codebase Audit: Build Instructions

## What You Are Building

`AUDIT.md` — a structured markdown file at the project root documenting every correctness problem in the RiseDial codebase across 14 concern areas. No code files are created or modified.

---

## Prerequisites

- Module 1 complete: `npx tsc --noEmit` exits 0; `npx next build` exits 0
- All source files are readable and in the project filesystem
- `supabase/migrations/001_initial_schema.sql` exists and is readable

---

## Step 1 — Create the AUDIT.md shell

Create `AUDIT.md` at the project root with this header:

```markdown
# RiseDial Codebase Audit — [date]

> **Status:** In progress  
> **Module:** 2 of 8

---

## Area 1 — Import and Module Resolution
[findings]

## Area 2 — TypeScript Strict Type Correctness
[findings]

## Area 3 — Runtime Environment Compatibility
[findings]

## Area 4 — Stripe Integration Correctness
[findings]

## Area 5 — Supabase Schema Validation
[findings]

## Area 6 — Authentication Flow
[findings]

## Area 7 — Subscription Flow
[findings]

## Area 8 — Memory Compression Pipeline
[findings]

## Area 9 — Rate Limiting
[findings]

## Area 10 — Dead Code and Duplication
[findings]

## Area 11 — Environment Variable Audit
[findings]

## Area 12 — PWA Correctness
[findings]

## Area 13 — Test Strategy
[findings]

## Area 14 — Fix Execution Plan
[ordered fix list]
```

---

## Step 2 — Execute each area check

Work through areas 1–12 sequentially using the commands and checks from FLOW.md.

**Useful grep commands:**

```bash
# Find all imports in lib/ and app/
grep -rn "^import" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"

# Find all process.env references
grep -rn "process\.env\." lib/ app/ middleware.ts --include="*.ts" --include="*.tsx" | grep -oP "process\.env\.\w+" | sort -u

# Find all Supabase table names
grep -rn "\.from\('" lib/ app/ --include="*.ts" | grep -oP "from\('\K[^']+"

# Find current_period_end usage (must all be items.data[0].current_period_end)
grep -rn "current_period_end" lib/ app/ --include="*.ts"

# Find jsonwebtoken imports
grep -rn "jsonwebtoken" lib/ app/ middleware.ts --include="*.ts" --include="*.tsx"

# Find runtime = 'edge' declarations  
grep -rn "runtime = 'edge'" app/ --include="*.ts"

# Find PREMIUM_PRODUCT_ID usages
grep -rn "PREMIUM_PRODUCT_ID" lib/ app/ --include="*.ts"

# Find all supabase table column operations (update/insert/select fields)
grep -rn "\.update\({" lib/ app/ --include="*.ts" -A 10
grep -rn "\.insert\({" lib/ app/ --include="*.ts" -A 10
grep -rn "\.select\('" lib/ app/ --include="*.ts"
```

---

## Step 3 — Write findings for each area

For each area, write one of:

**If a finding exists:**
```markdown
## Area N — [Name]

### Findings

- **BLOCKING:** [specific problem]. File: `[path]`, line [N]. Impact: [what breaks if not fixed].
- **WARNING:** [specific problem]. File: `[path]`. Impact: [what is suboptimal but not breaking].
```

**If no finding:**
```markdown
## Area N — [Name]

No finding.
```

---

## Step 4 — Write Area 14 (Fix Execution Plan)

This is the most important section. Module 3 reads it to know what to fix and in what order.

Format each fix as:
```markdown
## Area 14 — Fix Execution Plan

### Ordered Fix List

**Fix 1 — [short name]**
- What: Remove insecure JWT_SECRET fallback string
- Files: `lib/auth/session.ts`
- How: Delete `?? "changeme-insecure-fallback"` from line 3. Leave `process.env.JWT_SECRET` bare (Module 4 will add the zod import).
- Commit message: `fix(auth): remove insecure JWT_SECRET fallback`
- Classification: BLOCKING

**Fix 2 — [short name]**
- What: Delete unused PREMIUM_PRODUCT_ID constant
- Files: `app/api/webhooks/stripe/route.ts`
- How: Delete the `const PREMIUM_PRODUCT_ID = 'prod_...'` line.
- Commit message: `fix(stripe): remove unused PREMIUM_PRODUCT_ID dead code`
- Classification: BLOCKING

**Fix 3 — Consolidate webhook handlers**
- What: Move all 4 event handlers + idempotency logic from route file into lib/stripe/webhooks.ts
- Files: `lib/stripe/webhooks.ts`, `app/api/webhooks/stripe/route.ts`
- How: [detailed steps from Module 3 SPEC.md — webhook consolidation]
- Commit message: `fix(stripe): consolidate webhook handler into lib/stripe/webhooks.ts`
- Classification: BLOCKING

[... continue for all fixes ...]
```

---

## Step 5 — Review and finalize

Before completing the module:

1. Verify every section has content (not `[findings]` placeholder)
2. Count total BLOCKING findings — document the count in the header
3. Confirm Area 14 has one fix entry for every BLOCKING finding
4. Update the header status to `Complete`

---

## What to Test (Verification)

This module produces a document, not running code. Verify:

- [ ] `AUDIT.md` exists at the project root
- [ ] All 14 sections are populated with real content
- [ ] Every BLOCKING finding has a corresponding entry in Area 14's fix list
- [ ] Each fix in Area 14 specifies: what, which files, how, commit message, and classification
- [ ] No source code was modified (run `git diff` — it should show only the new `AUDIT.md`)

---

## Definition of Done

- [ ] `AUDIT.md` exists at `[project root]/AUDIT.md`
- [ ] Sections for all 14 areas are present and contain real findings or explicit "No finding"
- [ ] Area 14 contains an ordered fix list covering all BLOCKING findings
- [ ] `git status` shows only `AUDIT.md` as a new/modified file — no source changes
- [ ] Ready to begin Module 3

---

## What This Connects To

- **Output consumed by:** Module 3 (Code Fixes) — specifically Area 14's ordered fix list drives all of Module 3's work
- **Gate:** Module 3 will not start until all 14 areas in AUDIT.md are populated
