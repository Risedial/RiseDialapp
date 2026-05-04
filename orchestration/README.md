# RiseDial Production — Orchestration Index
**Date:** 2026-05-01
**Total Steps:** 48
**Build Target:** `C:\Users\Alexb\Documents\RISEDIAL-PWA\RiseDial-Frontend-Demo\risedial-production\`
**Scale:** LARGE

---

## How to Execute

1. Open `README.md` (this file) to orient yourself
2. Check `state.json` — the first ID in `pendingSteps` is your next task
3. Open the corresponding `prompt-NN.md` file
4. Open a fresh Claude Code chat
5. Paste the full contents of `prompt-NN.md` and send
6. The sub-agent reads context files, executes the single task, verifies, updates `state.json`
7. Return here and repeat from step 2

Build is complete when `state.json.pendingSteps` is empty.

---

## Execution Index

| Prompt # | File | Purpose | Prerequisites | Est. Token Output | Sub-Agent Strategy |
|---|---|---|---|---|---|
| 01 | prompt-01.md | Initialize Next.js 14 project scaffold | none | ~1,500 | SOLO |
| 02 | prompt-02.md | Write Supabase migration file skeleton | flags.projectInitialized = true | ~1,000 | SOLO |
| 03 | prompt-03.md | Write .env.local.example | flags.projectInitialized = true | ~500 | SOLO |
| 04 | prompt-04.md | Write users table migration | flags.projectInitialized = true; context/app-data-schema.md exists | ~1,500 | SOLO |
| 05 | prompt-05.md | Write chats + messages tables migration | flags.databaseSchemaWritten = true (users); context/app-data-schema.md exists | ~1,500 | SOLO |
| 06 | prompt-06.md | Write memory_profiles table migration | flags.databaseSchemaWritten = true (users); context/app-data-schema.md exists | ~1,000 | SOLO |
| 07 | prompt-07.md | Write rate_limit_tracking + webhook_events tables migration | flags.databaseSchemaWritten = true (users); context/app-data-schema.md exists | ~1,000 | SOLO |
| 08 | prompt-08.md | Write Supabase client utilities + DB query helpers | flags.databaseSchemaWritten = true; context/app-architecture.md exists | ~4,000 | SOLO |
| 09 | prompt-09.md | Write POST /api/auth/signup endpoint | flags.supabaseClientReady = true; context/app-architecture.md exists | ~3,000 | SOLO |
| 10 | prompt-10.md | Write POST /api/auth/signin + POST /api/auth/signout endpoints | flags.supabaseClientReady = true; context/app-architecture.md exists | ~3,000 | SOLO |
| 11 | prompt-11.md | Write auth middleware.ts | flags.authLayerComplete = false; context/app-architecture.md exists | ~2,000 | SOLO |
| 12 | prompt-12.md | Write password reset flow endpoints | flags.supabaseClientReady = true; context/app-architecture.md exists | ~3,000 | SOLO |
| 13 | prompt-13.md | Write session utilities + getUser helper | flags.supabaseClientReady = true | ~2,500 | SOLO |
| 14 | prompt-14.md | Write Stripe configuration + price constants | context/app-stripe-config.md exists | ~2,000 | SOLO |
| 15 | prompt-15.md | Write POST /api/subscription/checkout endpoint | flags.authLayerComplete = true; context/app-stripe-config.md exists | ~3,000 | SOLO |
| 16 | prompt-16.md | Write POST /api/webhooks/stripe endpoint | flags.stripeLayerComplete = false; context/app-stripe-config.md exists; context/app-data-schema.md exists | ~5,000 | SOLO |
| 17 | prompt-17.md | Write GET /api/subscription/status endpoint | flags.authLayerComplete = true; context/app-architecture.md exists | ~1,500 | SOLO |
| 18 | prompt-18.md | Write POST /api/subscription/portal + PATCH /api/subscription/premium-toggle | flags.stripeLayerComplete = true; context/app-stripe-config.md exists | ~3,000 | SOLO |
| 19 | prompt-19.md | Write Stripe subscription + webhook utility libs | flags.stripeLayerComplete = false; context/app-stripe-config.md exists | ~2,500 | SOLO |
| 20 | prompt-20.md | Write Rise system prompt module | context/app-rise-system.md exists | ~2,000 | SOLO |
| 21 | prompt-21.md | Write rolling context window algorithm | flags.riseSystemPromptWritten = true; context/app-rise-system.md exists | ~2,000 | SOLO |
| 22 | prompt-22.md | Write OpenAI API message constructor | flags.riseSystemPromptWritten = true; context/app-rise-system.md exists | ~1,500 | SOLO |
| 23 | prompt-23.md | Write POST /api/chat/[chatId]/message endpoint | flags.openaiClientReady = true; flags.authLayerComplete = true; context/app-architecture.md; context/app-rise-system.md | ~5,000 | SOLO |
| 24 | prompt-24.md | Write server-side rate limiting module | flags.supabaseClientReady = true; context/app-data-schema.md exists | ~2,000 | SOLO |
| 25 | prompt-25.md | Write OpenAI client module | flags.riseSystemPromptWritten = true; context/app-openai-config.md exists | ~2,000 | SOLO |
| 26 | prompt-26.md | Write memory compression trigger logic | flags.supabaseClientReady = true; context/app-data-schema.md exists | ~2,000 | SOLO |
| 27 | prompt-27.md | Write initial memory profile generation | flags.openaiClientReady = true; flags.supabaseClientReady = true; context/app-openai-config.md | ~3,000 | SOLO |
| 28 | prompt-28.md | Write memory profile PATCH update logic | flags.memorySystemComplete = false; context/app-openai-config.md exists | ~2,500 | SOLO |
| 29 | prompt-29.md | Write async compression executor | flags.memorySystemComplete = false; context/app-openai-config.md exists | ~2,000 | SOLO |
| 30 | prompt-30.md | Write chat deletion memory preservation logic | flags.chatArchitectureComplete = false; context/app-data-schema.md exists | ~2,000 | SOLO |
| 31 | prompt-31.md | Write chat CRUD endpoints | flags.authLayerComplete = true; flags.supabaseClientReady = true; context/app-architecture.md | ~4,000 | SOLO |
| 32 | prompt-32.md | Write chat title auto-generation module + title endpoint | flags.chatArchitectureComplete = false; context/app-copy-strings.md exists | ~1,500 | SOLO |
| 33 | prompt-33.md | Write Rise opening message module | context/app-copy-strings.md exists; context/app-rise-system.md exists | ~1,500 | SOLO |
| 34 | prompt-34.md | Write subscription gating middleware module | flags.authLayerComplete = true; context/app-architecture.md exists | ~1,500 | SOLO |
| 35 | prompt-35.md | Write new user initialization + preferred name flow | flags.chatArchitectureComplete = true; context/app-copy-strings.md exists | ~2,000 | SOLO |
| 36 | prompt-36.md | Write Sign-in / Sign-up screen | flags.authLayerComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~6,000 | SOLO |
| 37 | prompt-37.md | Write Plan Selection screen | context/app-stripe-config.md; context/app-design-tokens.css; context/app-copy-strings.md | ~5,000 | SOLO |
| 38 | prompt-38.md | Write Checkout Polling screen | flags.authLayerComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~4,000 | SOLO |
| 39 | prompt-39.md | Write Onboarding screen | flags.authLayerComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~4,000 | SOLO |
| 40 | prompt-40.md | Write Main Chat screen + all sub-components | flags.chatArchitectureComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~12,000 ⚠️ | SOLO |
| 41 | prompt-41.md | Write Sidebar / Drawer component | flags.chatArchitectureComplete = true; context/app-design-tokens.css | ~5,000 | SOLO |
| 42 | prompt-42.md | Write Settings screen + all sub-components | flags.chatArchitectureComplete = true; context/app-stripe-config.md; context/app-design-tokens.css; context/app-copy-strings.md | ~8,000 | SOLO |
| 43 | prompt-43.md | Write Chat Memories Modal component | flags.memorySystemComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~4,000 | SOLO |
| 44 | prompt-44.md | Write Subscription Locked screen + SubscriptionBanner component | flags.authLayerComplete = true; context/app-design-tokens.css; context/app-copy-strings.md | ~3,500 | SOLO |
| 45 | prompt-45.md | Write Loading/Splash screen + global loading states | context/app-design-tokens.css | ~3,000 | SOLO |
| 46 | prompt-46.md | Write PWA configuration | flags.projectInitialized = true; context/app-architecture.md exists | ~2,500 | SOLO |
| 47 | prompt-47.md | Write all error state components + global error boundary | context/app-design-tokens.css; context/app-copy-strings.md | ~5,000 | SOLO |
| 48 | prompt-48.md | Write design system foundation (globals.css + tailwind.config.ts) + final integration check | flags.frontendScreensComplete = true; context/app-design-tokens.css | ~6,000 | SOLO |

---

## Context Files

| File | Role | Required By |
|---|---|---|
| context/app-architecture.md | API route map, auth flow, Supabase connection patterns | Prompts 08–19, 23–24, 30–35 |
| context/app-data-schema.md | Complete database table schemas with exact column names and types | Prompts 04–08, 16, 24, 26–30 |
| context/app-design-tokens.css | All CSS custom properties with exact hex values, spacing, typography | Prompts 36–48 |
| context/app-rise-system.md | Frozen Rise system prompt (99-line verbatim), preferred name injection format, API message structure | Prompts 20–23, 33 |
| context/app-stripe-config.md | Stripe price IDs, webhook events, subscription item management, proration behavior | Prompts 14–19, 37, 42 |
| context/app-openai-config.md | Model selections, token limits, compression schema, non-streaming API call pattern | Prompts 23, 25, 27–29 |
| context/app-copy-strings.md | All exact user-facing strings: opening messages, error messages, UI labels, screen copy | Prompts 32–33, 35–45, 47 |

---

## Sub-Agent Strategy Reference

**SOLO:** Prompt executes as single task in its session. All 48 prompts in this build use SOLO strategy. Memory compression execution (step 29) runs async within the app but the prompt writing it is SOLO.

---

## Group Summary

| Group | Steps | What Gets Built |
|---|---|---|
| A — Project Init | 01–03 | Next.js scaffold, migration skeleton, env vars |
| B — Database Schema | 04–08 | All 6 table migrations + Supabase client utilities |
| C — Authentication | 09–13 | Signup, signin, signout, password reset, JWT session |
| D — Stripe Integration | 14–19 | Checkout, webhooks, status, portal, premium toggle, utilities |
| E — Rise + OpenAI | 20–25 | System prompt module, context window, message constructor, chat endpoint, rate limiting, OpenAI client |
| F — Memory System | 26–30 | Compression trigger, initial generation, patch logic, async executor, deletion preservation |
| G — Chat Architecture | 31–35 | Chat CRUD, title generation, opening messages, subscription gate, user initialization |
| H — Frontend Screens | 36–45 | All 10 required screens + components |
| I — PWA + Error States | 46–48 | PWA config, error components, design system |

---

## Progress Tracking

| Step | Status |
|---|---|
| step-01-initialize-nextjs-project | pending |
| step-02-write-database-schema-migration | pending |
| step-03-write-environment-variables | pending |
| step-04-write-users-table-schema | pending |
| step-05-write-chats-messages-tables-schema | pending |
| step-06-write-memory-profiles-table-schema | pending |
| step-07-write-rate-limit-webhook-tables-schema | pending |
| step-08-write-supabase-client-utilities | pending |
| step-09-write-auth-signup-endpoint | pending |
| step-10-write-auth-signin-signout-endpoints | pending |
| step-11-write-auth-middleware | pending |
| step-12-write-password-reset-flow | pending |
| step-13-write-session-utilities | pending |
| step-14-write-stripe-configuration | pending |
| step-15-write-subscription-checkout-endpoint | pending |
| step-16-write-stripe-webhook-handler | pending |
| step-17-write-subscription-status-endpoint | pending |
| step-18-write-subscription-portal-premium-toggle | pending |
| step-19-write-stripe-utilities | pending |
| step-20-write-rise-system-prompt-module | pending |
| step-21-write-rolling-context-window-algorithm | pending |
| step-22-write-openai-api-message-constructor | pending |
| step-23-write-chat-message-endpoint | pending |
| step-24-write-server-side-rate-limiting | pending |
| step-25-write-openai-client | pending |
| step-26-write-memory-compression-trigger | pending |
| step-27-write-initial-memory-profile-generation | pending |
| step-28-write-memory-profile-patch-logic | pending |
| step-29-write-async-compression-executor | pending |
| step-30-write-chat-deletion-memory-preservation | pending |
| step-31-write-chat-crud-endpoints | pending |
| step-32-write-chat-title-auto-generation | pending |
| step-33-write-rise-opening-message-logic | pending |
| step-34-write-subscription-gating-middleware | pending |
| step-35-write-new-user-initialization-flow | pending |
| step-36-write-signin-signup-screen | pending |
| step-37-write-plan-selection-screen | pending |
| step-38-write-checkout-polling-screen | pending |
| step-39-write-onboarding-screen | pending |
| step-40-write-main-chat-screen | pending |
| step-41-write-sidebar-drawer-component | pending |
| step-42-write-settings-screen | pending |
| step-43-write-chat-memories-modal | pending |
| step-44-write-subscription-locked-screen | pending |
| step-45-write-loading-splash-screen | pending |
| step-46-write-pwa-configuration | pending |
| step-47-write-error-state-components | pending |
| step-48-write-design-system-foundation | pending |
