# Module 4 — Environment Validation: Validation Checklist

- [ ] `lib/env.ts` exists and exports an `env` object — `ls lib/env.ts` succeeds
- [ ] `lib/env.ts` contains a Zod schema with all 13 required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, STRIPE_PRICE_PREMIUM_MONTHLY_ADDON, STRIPE_PRICE_PREMIUM_ANNUAL_ADDON, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL — `grep -c "z\." lib/env.ts` returns 13 or more
- [ ] Starting the dev server with a missing env var (e.g., temporarily removing `JWT_SECRET` from `.env.local`) causes the process to exit immediately with a ZodError naming the missing variable — restore the var afterward
- [ ] `grep -rn "process\.env\." lib/ app/ --include="*.ts" --include="*.tsx" | grep -v "lib/env.ts" | grep -v "lib/supabase/client.ts"` returns zero results (all direct `process.env` access has been replaced with `env.VARNAME`)
- [ ] `.env.example` exists in the project root with all 13 variable names present and no real secret values — `ls .env.example` succeeds
- [ ] `npx tsc --noEmit` exits 0 after env.ts is added and all import sites are updated
- [ ] `git log --oneline -5` shows a commit with message starting with `feat:` or `refactor:` referencing env validation
