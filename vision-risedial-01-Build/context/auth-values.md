# auth-values.md — auth_session Reference

**Role:** prevents agents from using wrong cookie names, JWT claim names, algorithm strings, or session configuration that breaks the custom HS256 auth flow
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** M1, M2, M3, M4, M6, M7
**Date:** 2026-05-04

---

## Values

**cookie_name:** `risedial_session`
**cookie.httpOnly:** `true`
**cookie.sameSite:** `strict`
**cookie.secure:** `true`
**cookie.maxAge:** `2592000`
**cookie.path:** `/`
**jwt_algorithm:** `HS256`
**jwt_claim:user_id:** `user_id`
**jwt_claim:subscription_status:** `subscription_status`
**jwt_claim:iat:** `iat`
**jwt_claim:exp:** `exp`
**jwt_expiry_seconds:** `2592000`
**jwt_secret_min_length:** `32`
**jwt_implementation:** `crypto.subtle (Web Crypto API)`
**jwt_insecure_fallback_to_remove:** `changeme-insecure-fallback`
**middleware_header:user_id:** `x-user-id`
**middleware_header:subscription_status:** `x-subscription-status`
**middleware_matcher_paths:** `['/api/chat/:path*', '/api/memory/:path*', '/api/subscription/:path*', '/api/chats/:path*', '/api/user/:path*']`
**session_exports:** `createSession, verifySession, setSessionCookie, clearSessionCookie`
**session_file:** `lib/auth/session.ts`
