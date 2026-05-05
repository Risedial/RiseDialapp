# external-services.md — external_services Reference

**Role:** prevents agents from inventing wrong environment variable names, key format prefixes, or test configuration values that break startup validation and CI
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** M1, M2, M3, M4, M5, M6, M7, M8
**Date:** 2026-05-04

---

## Values

**env_var:SUPABASE_URL:** `SUPABASE_URL`
**env_var:SUPABASE_SERVICE_ROLE_KEY:** `SUPABASE_SERVICE_ROLE_KEY`
**env_var:JWT_SECRET:** `JWT_SECRET`
**env_var:STRIPE_SECRET_KEY:** `STRIPE_SECRET_KEY`
**env_var:STRIPE_WEBHOOK_SECRET:** `STRIPE_WEBHOOK_SECRET`
**env_var:STRIPE_PRICE_MONTHLY:** `STRIPE_PRICE_MONTHLY`
**env_var:STRIPE_PRICE_ANNUAL:** `STRIPE_PRICE_ANNUAL`
**env_var:STRIPE_PRICE_PREMIUM_MONTHLY_ADDON:** `STRIPE_PRICE_PREMIUM_MONTHLY_ADDON`
**env_var:STRIPE_PRICE_PREMIUM_ANNUAL_ADDON:** `STRIPE_PRICE_PREMIUM_ANNUAL_ADDON`
**env_var:OPENAI_API_KEY:** `OPENAI_API_KEY`
**env_var:NEXT_PUBLIC_SUPABASE_URL:** `NEXT_PUBLIC_SUPABASE_URL`
**env_var:NEXT_PUBLIC_SUPABASE_ANON_KEY:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**env_var:NEXT_PUBLIC_APP_URL:** `NEXT_PUBLIC_APP_URL`
**STRIPE_SECRET_KEY_prefix:** `sk_`
**STRIPE_WEBHOOK_SECRET_prefix:** `whsec_`
**STRIPE_PRICE_prefix:** `price_`
**OPENAI_API_KEY_prefix:** `sk-`
**SUPABASE_URL_format:** `valid URL (https://)`
**NEXT_PUBLIC_SUPABASE_URL_format:** `valid URL (https://)`
**NEXT_PUBLIC_APP_URL_format:** `valid URL`
**JWT_SECRET_min_length:** `32`
**zod_error_message:JWT_SECRET:** `JWT_SECRET must be at least 32 characters`
**zod_error_message:STRIPE_SECRET_KEY:** `STRIPE_SECRET_KEY must start with sk_`
**zod_error_message:STRIPE_WEBHOOK_SECRET:** `STRIPE_WEBHOOK_SECRET must start with whsec_`
**zod_error_message:STRIPE_PRICE:** `must start with price_`
**zod_error_message:OPENAI_API_KEY:** `OPENAI_API_KEY must start with sk-`
**zod_error_message:SUPABASE_URL:** `SUPABASE_URL must be a valid URL`
**lib_env_ts_allowed_imports:** `['zod']`
**lib_env_ts_export:** `export const env = envSchema.parse(process.env)`
**lib_supabase_client_must_not_import:** `lib/env.ts`
**vitest_test_env:SUPABASE_URL:** `https://test.supabase.co`
**vitest_test_env:SUPABASE_SERVICE_ROLE_KEY:** `test-service-role-key`
**vitest_test_env:JWT_SECRET:** `test-jwt-secret-that-is-at-least-32-chars-long`
**vitest_test_env:STRIPE_SECRET_KEY:** `sk_test_key`
**vitest_test_env:STRIPE_WEBHOOK_SECRET:** `whsec_test`
**vitest_test_env:STRIPE_PRICE_MONTHLY:** `price_test_monthly`
**vitest_test_env:STRIPE_PRICE_ANNUAL:** `price_test_annual`
**vitest_test_env:STRIPE_PRICE_PREMIUM_MONTHLY_ADDON:** `price_test_premium_monthly`
**vitest_test_env:STRIPE_PRICE_PREMIUM_ANNUAL_ADDON:** `price_test_premium_annual`
**vitest_test_env:OPENAI_API_KEY:** `sk-test-openai-key`
**vitest_test_env:NEXT_PUBLIC_SUPABASE_URL:** `https://test.supabase.co`
**vitest_test_env:NEXT_PUBLIC_SUPABASE_ANON_KEY:** `test-anon-key`
**vitest_test_env:NEXT_PUBLIC_APP_URL:** `http://localhost:3000`
**vitest_environment:** `jsdom`
**vitest_globals:** `true`
**vitest_setup_file:** `./vitest.setup.ts`
**vitest_config_file:** `vitest.config.ts`
**vitest_coverage_provider:** `@vitest/coverage-v8`
**vitest_coverage_include:** `['lib/**/*.ts', 'app/api/**/*.ts']`
**vitest_coverage_exclude:** `['lib/env.ts']`
**vitest_coverage_threshold:** `100% lines, functions, branches, statements`
**playwright_config_file:** `playwright.config.ts`
**playwright_test_dir:** `./e2e`
**playwright_global_setup:** `./e2e/globalSetup.ts`
**playwright_global_teardown:** `./e2e/globalTeardown.ts`
**playwright_retries_ci:** `2`
**playwright_workers_ci:** `1`
**playwright_trace:** `on-first-retry`
**playwright_browser:** `Chromium (Desktop Chrome)`
**node_version_ci:** `20`
**framework:** `Next.js 14 App Router`
**language:** `TypeScript (strict mode)`
**database:** `Supabase PostgreSQL via service role client`
**hosting:** `Vercel`
**ci:** `GitHub Actions`
**env_validation_library:** `zod`
**tsconfig_must_exclude:** `['node_modules', 'orchestration']`
**tsconfig_skipLibCheck:** `true`
**tsconfig_strict:** `true`
**package_scripts:test:** `vitest run`
**package_scripts:test:watch:** `vitest`
**package_scripts:test:coverage:** `vitest run --coverage`
**package_scripts:test:e2e:** `playwright test`
**gitignore_entries:** `.env.local, coverage/, playwright-report/, test-results/, e2e/fixtures/`
**env_example_file:** `.env.example`
**env_local_file:** `.env.local`
