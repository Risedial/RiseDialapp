# TASK: Fix risedial.com — 404 NOT_FOUND in Production

**For Claude Code:** Read this entire document before taking any action. Execute the Fix Plan at the bottom. Do not ask the user to check any dashboard — diagnose and fix autonomously using the confirmed facts provided here.

---

## Project Identifiers

| Field | Value |
|---|---|
| Repo | `github.com/Risedial/RiseDialapp` |
| Branch | `main` |
| Working directory | `c:\Users\Alexb\Documents\RiseDialapp` |
| Vercel team slug | `risedials-projects` |
| Vercel team ID | `team_KGrCcm7WoWqIirJKpvxpybwU` |
| Vercel project slug | `rise-dialapp` |
| Latest deployment URL | `rise-dialapp-hkvb53ihv-risedials-projects.vercel.app` |
| Git branch alias | `rise-dialapp-git-main-risedials-projects.vercel.app` |
| Custom domains | `risedial.com` (307 → www), `www.risedial.com` (Production) |
| Latest commit | `c79e468` — middleware Edge Runtime fix |

---

## The Error

Both `https://risedial.com` and the Vercel preview URL `https://rise-dialapp-hkvb53ihv-risedials-projects.vercel.app` return:

```
404: NOT_FOUND
Code: `NOT_FOUND`
ID: `pdx1::...`
```

This is **Vercel's infrastructure-level 404** — served by Vercel's CDN before any Next.js code runs. It is NOT the Next.js app's 404 handler.

---

## Confirmed Facts (Already Verified — Do Not Re-Check)

These have been confirmed via Vercel dashboard screenshots. Do not spend time re-verifying them.

| Check | Status | Notes |
|---|---|---|
| Deployment `c79e468` status | **Ready + Production + Current** | Build completed in 52s |
| `ƒ Middleware 26.9 kB` in build log | **Present** | Edge Runtime error is resolved |
| `risedial.com` domain assignment | **Valid Configuration** ✓ | 307 redirect to www |
| `www.risedial.com` domain assignment | **Valid Configuration** ✓ | Assigned to Production |
| CDN propagation delay | **Ruled out** | `.vercel.app` URL also 404s |
| DNS / domain misconfiguration | **Ruled out** | Both domains valid with blue checkmarks |
| Production branch mismatch | **Ruled out** | Source shows `main` branch, Production badge present |

**The deployment is alive but serving nothing.** Vercel cannot route any request — including requests to its own `.vercel.app` hash URL — to a valid Next.js handler.

---

## Root Cause

The Next.js build output is invalid or empty despite the build reporting success.

**Prime suspect: `next-pwa@5.x`**

`next.config.js` wraps the entire build with `next-pwa@5.x`:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

`next-pwa@5.x` was written for the Next.js Pages Router. It mutates the webpack configuration at build time. In Next.js 14 App Router, webpack runs in two separate compilation passes (server bundle and client bundle). `next-pwa@5.x` does not handle this dual-pass correctly and can corrupt the server bundle output while still exiting with code 0 — causing Vercel to mark the deployment "Ready" with nothing actually serveable.

Evidence supporting this:
- Build log shows correct route sizes and `ƒ Middleware 26.9 kB` (webpack ran successfully enough to generate the analysis table)
- But Vercel cannot route ANY request — including the `.vercel.app` URL — to the deployment
- The Vercel dashboard shows "2 Recommendations" on the deployment (likely flagging the `next-pwa` webpack mutation as a deprecation concern)
- `next-pwa@5.x` is unmaintained and its last release predates Next.js 14 App Router

---

## Vercel MCP Access Note

The Vercel MCP token is scoped to the personal account and **cannot access the `risedials-projects` team**. Calls with `teamId: "risedials-projects"` or `teamId: "team_KGrCcm7WoWqIirJKpvxpybwU"` will return 403. Do not waste turns attempting MCP tool calls — work directly in the codebase.

---

## Fix Plan — Execute in This Order

### Step 1 — Remove `next-pwa@5.x` from the build (diagnostic + immediate fix)

Rewrite `next.config.js` to remove the `next-pwa` wrapper entirely:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
```

This is the fastest way to unblock production. PWA features (service worker, offline support, install prompt) will stop working temporarily, but the app will serve correctly.

### Step 2 — Type check

```powershell
npx tsc --noEmit
```

Expected: no output, exit code 0.

### Step 3 — Commit and push

```powershell
git add next.config.js
git commit -m "fix: remove next-pwa to unblock Vercel deployment (next-pwa@5 corrupts App Router build output)"
git push origin main
```

### Step 4 — Verify deployment

Wait ~60 seconds for Vercel to build and promote. Then test:
- `https://rise-dialapp-git-main-risedials-projects.vercel.app` — should load the Rise sign-in page
- `https://www.risedial.com` — should load the Rise sign-in page
- `https://risedial.com` — should redirect (307) to `https://www.risedial.com`

If all three work: root cause confirmed, move to Step 5.  
If still 404: pull the Vercel build logs manually (114 lines) and look for errors not visible in the original screenshot — report findings before continuing.

### Step 5 — Restore PWA with the maintained fork

Once the site is live, replace `next-pwa@5.x` with `@ducanh2912/next-pwa` (the actively maintained App Router-compatible fork):

```powershell
npm uninstall next-pwa
npm install @ducanh2912/next-pwa
```

Rewrite `next.config.js`:

```javascript
// next.config.js
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

Run type check, commit, and push:

```powershell
npx tsc --noEmit
git add next.config.js package.json package-lock.json
git commit -m "fix: replace next-pwa@5 with @ducanh2912/next-pwa for Next.js 14 App Router compatibility"
git push origin main
```

---

## Files to Know

| File | Status | Notes |
|---|---|---|
| `next.config.js` | **Change this** | Remove `next-pwa` wrapper (Step 1) |
| `middleware.ts` | **Do not touch** | Fixed in `c79e468` — self-contained, no local imports |
| `lib/auth/session.ts` | **Do not touch** | Correct, untouched throughout |
| `lib/auth/verify.ts` | **Deleted** (c79e468) | Removed — do not recreate |
| `app/page.tsx` | Clean | Server redirect to `/signin` |
| `app/layout.tsx` | Clean | References `public/manifest.json` (exists) |
| `public/sw.js` | Generated at build | Not in git, regenerated by `next-pwa` on each build |

---

## Success Criteria

1. `https://www.risedial.com` loads the Rise sign-in page (gradient "Rise" heading, email/password form)
2. `https://risedial.com` redirects (307) to `https://www.risedial.com`
3. Vercel dashboard shows the new deployment as **Ready + Production**
4. No "referencing unsupported modules" error in build logs

---

## What NOT to Do

- Do not modify `middleware.ts` — it is correct
- Do not add `vercel.json` — not needed
- Do not run `vercel deploy` from the CLI — Vercel auto-deploys from `main` via GitHub
- Do not attempt Vercel MCP calls — the token lacks team scope and will 403
- Do not try to re-add `next-pwa@5.x` — it is the cause of this failure
