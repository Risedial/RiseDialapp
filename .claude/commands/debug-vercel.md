# /debug-vercel — Vercel Deployment Debugger

You are executing the `/debug-vercel` command. The user has provided screenshots and/or pasted log text describing a Vercel deployment failure. Your job is to ingest all evidence, diagnose the root cause, and write a self-contained `DEBUG-[slug].md` file in the project root that a fresh Claude Code chat can execute autonomously to fix the issue — without asking the user a single question.

`$ARGUMENTS` contains any text the user pasted. Images are in context.

---

## A — Ingest all artifacts provided by the user

Extract from all sources (screenshots + `$ARGUMENTS` + any pasted text):

- Exact verbatim error messages (including request IDs like `pdx1::...`)
- Deployment status (Ready / Error / Building / Cancelled)
- Whether a "Production" or "Latest" badge is present
- Domain configuration state (green checkmark = valid, red = broken, missing = unassigned)
- The `.vercel.app` hash URL of the failing deployment (visible in browser URL bar or deployment details)
- The `.vercel.app` git-branch alias URL
- The Vercel team slug and project slug (from browser URL bar: `vercel.com/[team-slug]/[project-slug]/...`)
- Number and text of any "Recommendations" badges on the deployment
- Any error lines visible in build logs (even partial)

Classify the error type before proceeding:

- **Edge Runtime rejection**: build log contains "referencing unsupported modules" or "@/lib/..."
- **Infrastructure 404**: Vercel CDN serves 404 with request ID prefix, not the Next.js app
- **Build failure**: deployment status is "Error"
- **Domain misconfiguration**: deployment is Ready but domain shows red/invalid
- **Runtime crash**: deployment is Ready, `.vercel.app` URL works, but app crashes on load

---

## B — Read current project state (run all reads in parallel)

Read these files simultaneously:
- `middleware.ts`
- `next.config.js`
- `package.json`
- `tsconfig.json`
- `app/page.tsx`
- `app/layout.tsx`
- `.vercel/project.json` (extract `projectId` and `orgId` if present)
- `vercel.json` (if present)

Run: `git log --oneline -10`

---

## C — Attempt Vercel MCP diagnostics

Use the Vercel MCP tools. Populate `teamId` from `.vercel/project.json` (`orgId`) or from the team slug visible in the screenshots. Try these calls:

1. `get_deployment_build_logs(idOrUrl=[hash .vercel.app URL], teamId=[team slug], limit=200)`
2. `get_runtime_logs(projectId=[project slug], teamId=[team slug], level=["error"], since="2h")`
3. `get_deployment(idOrUrl=[hash .vercel.app URL], teamId=[team slug])`

If any call returns 403: record the exact error message (it will contain the real team ID, e.g. `team_XXXX`), then stop MCP attempts. Do not retry. Record in the document: "MCP returns 403 — token lacks team scope. Team ID extracted from error: `team_XXXX`. Do not attempt MCP calls in the fresh chat."

If MCP calls succeed: extract any error lines, function crash messages, or unsupported module names. Include them verbatim in the document.

---

## D — Diagnose using this decision tree

**Edge Runtime rejection** (`referencing unsupported modules @/lib/...` in build log):
→ Root cause: `middleware.ts` imports a local file via `@/` path alias. Vercel's Edge bundler does not inline `@/` paths — it leaves them as external `require()` calls which it then rejects.
→ Fix: Rewrite `middleware.ts` to be fully self-contained. Remove all `import` statements for local `@/` paths. Copy the needed logic directly into the file. Only `next/server` is a safe import.

**Infrastructure 404 + `.vercel.app` hash URL also 404s** (deployment shows Ready + Production):
→ Root cause: The Next.js build output is empty or invalid. Vercel packaged the deployment but has nothing to route requests to.
→ Investigate `next.config.js` for webpack-mutating wrappers (e.g., `next-pwa@5.x`, custom webpack plugins). These can corrupt the server bundle while still exiting code 0.
→ Fix: Remove the offending wrapper from `next.config.js`. Verify this resolves it, then replace with a maintained alternative.

**Infrastructure 404 + `.vercel.app` URL WORKS but custom domain 404s**:
→ Root cause: domain not assigned to this project, or DNS not pointing to Vercel.
→ Fix: In Vercel Settings → Domains, verify the domain is listed and shows a green checkmark. If missing, the Fix Plan must stop and instruct the user to add it manually — Claude Code cannot add domains autonomously.

**Build failure** (deployment status is "Error"):
→ Find the first ERROR line in build logs.
→ If "Cannot find module": missing dependency or wrong import path.
→ If TypeScript error: type mismatch — fix the type.
→ If memory/timeout: build is too large or too slow, needs optimization.

**Deployment stuck "Building"**:
→ Do not generate a fix document. Tell the user: "The deployment is still building. Wait for it to complete, then re-run `/debug-vercel` with the final status."

**Runtime crash** (deployment Ready, `.vercel.app` works, app crashes on load):
→ Check runtime logs from MCP for the crash message and stack trace.
→ Root cause is almost always an environment variable missing in production or an API route throwing an unhandled exception.
→ Fix: identify the missing env var or crashing route from the stack trace.

---

## E — Generate the DEBUG document

Write `DEBUG-[2-3-word-slug].md` in the project root. The slug must describe the specific issue (e.g., `DEBUG-nextpwa-build-output.md`, `DEBUG-edge-runtime-import.md`, `DEBUG-domain-assignment.md`, `DEBUG-missing-env-var.md`).

The document must contain these sections in this order. Every value must be real or explicitly noted as "could not be determined because [specific reason]". Zero placeholders — if a value is unknown, say so and explain why.

````markdown
# TASK: Fix [specific issue name]

**For Claude Code:** Read this entire document before taking any action. Execute the Fix Plan autonomously. Do not ask the user to check any dashboard — all confirmed facts are provided below. Do not re-investigate anything listed under "Confirmed Facts."

---

## Project Identifiers

| Field | Value |
|---|---|
| Repo | [real GitHub URL] |
| Branch | main |
| Working directory | [absolute local path] |
| Vercel team slug | [real slug] |
| Vercel team ID | [real ID or "not found — use slug"] |
| Vercel project slug | [real slug] |
| Deployment hash URL | [real .vercel.app hash URL] |
| Git branch alias URL | [real .vercel.app branch URL] |
| Custom domains | [each domain and its config, e.g. "risedial.com → 307 → www.risedial.com"] |
| Latest commit | [hash + full commit message] |

---

## The Error

[Exact verbatim error text. For a 404: include the request ID. For a build failure: include the full error line from the build log.]

**Error class:** [one of: Edge Runtime rejection / Infrastructure-level 404 / Build failure / Domain misconfiguration / Runtime crash]
**Why this class:** [one sentence explaining exactly how this class was determined from the evidence]

---

## Confirmed Facts (Do Not Re-Verify)

| Check | Status | Evidence |
|---|---|---|
| [hypothesis or fact] | Ruled out / Confirmed | [specific evidence from logs, screenshots, or file reads] |

---

## Root Cause

[One specific thing. One paragraph. Evidence cited inline. No "possibly" or "maybe" — this is a definitive claim.]

---

## Vercel MCP Access Note

[One of these three statements, filled in accurately:
- "MCP calls succeeded. Safe calls: get_deployment_build_logs, get_runtime_logs. Use teamId=[real ID] and projectId=[real slug]."
- "MCP returns 403 — token lacks team scope. Team ID extracted from error: team_XXXX. Do not attempt MCP calls in the fresh chat."
- "MCP calls were not attempted because [reason — e.g. no hash URL was visible in the provided screenshots]."]

---

## Fix Plan — Execute in This Order

### Step 1 — [Action name]

[What to do. Then the exact code block, copy-paste ready, no placeholders. Use PowerShell syntax for all shell commands.]

```powershell
# example shell step
```

```typescript
// example code change
```

If this step fails: [specific failure mode and what to do — not "see error message", but a concrete instruction]

### Step 2 — [Action name]

[etc.]

### Step N — Push and verify

```powershell
git add [specific files changed]
git commit -m "fix: [specific description]"
git push origin main
```

Wait for the Vercel deployment to complete (approximately 2-3 minutes), then verify using the Success Criteria below.

If this step fails: if the push is rejected, run `git pull --rebase origin main` then retry.

---

## Files to Know

| File | Action | Note |
|---|---|---|
| [path] | Change / Do not touch / Delete | [why] |

---

## Success Criteria

1. [Concrete, observable state — e.g. "https://www.risedial.com loads the Rise sign-in page with HTTP 200"]
2. [etc. — each criterion must be verifiable without manual browser action from the user]

---

## What NOT to Do

- [Specific wrong move that is tempting but would not fix this issue or would make it worse]
- [etc. — each item must be specific to this exact issue, not generic advice]
````

---

## F — Self-review before writing

Before writing the document, answer each of these questions. If any answer is "no," fix it before writing.

1. Does every table cell in Project Identifiers contain a real value or an explicit "could not be determined because [reason]"?
2. Does the Fix Plan contain zero `[placeholder]` strings — every file path, URL, and code snippet is real?
3. Is the Root Cause section a single specific claim with evidence cited, not a list of possibilities?
4. Does every Fix Plan step include a concrete "If this step fails:" instruction?
5. Does the document instruct the fresh Claude to work autonomously — no "ask the user to check the dashboard" or "ask the user for X"?
6. Does the Vercel MCP note accurately reflect whether MCP calls will succeed in a fresh chat with this same token?
7. Are all code blocks syntactically correct for their declared language?
8. If the fix requires manual user action (e.g., adding a domain in Vercel), does the Fix Plan stop at that step with explicit instructions to the user and not continue past it?

---

## G — Output to the user after writing

Print exactly these four lines and nothing else:

```
Created: DEBUG-[filename].md
Root cause: [one sentence]
Fix: [one sentence describing what the Fix Plan does]
→ Send DEBUG-[filename].md to a fresh Claude Code chat to execute.
```
