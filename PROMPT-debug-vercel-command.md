Create a Claude Code project-level slash command at `.claude/commands/debug-vercel.md` in the working directory `c:\Users\Alexb\Documents\RiseDialapp`.

## Outcome

After this task completes, running `/debug-vercel` in any Claude Code session — with screenshots and/or Vercel log text pasted inline — must produce a ready-to-send `DEBUG-[slug].md` file in the project root. That file must be self-contained enough that a fresh Claude Code chat can execute it autonomously, fix the deployment issue, and verify success without asking the user a single question.

## Step 1 — Create the directory

Create `.claude/commands/` if it does not already exist.

## Step 2 — Write `.claude/commands/debug-vercel.md`

The file content is the prompt Claude Code runs when the user invokes `/debug-vercel`. Write it with the following behavior encoded precisely:

---

### A — Ingest all artifacts provided by the user

The user will invoke this command with screenshots and/or pasted log text. `$ARGUMENTS` contains any pasted text. Images are in context.

Extract from all sources:
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

### B — Read current project state (run all reads in parallel)

Read these files:
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

### C — Attempt Vercel MCP diagnostics

Use the Vercel MCP tools. Populate `teamId` from `.vercel/project.json` (`orgId`) or from the team slug visible in the screenshots. Try:

1. `get_deployment_build_logs(idOrUrl=[hash .vercel.app URL], teamId=[team slug], limit=200)`
2. `get_runtime_logs(projectId=[project slug], teamId=[team slug], level=["error"], since="2h")`
3. `get_deployment(idOrUrl=[hash .vercel.app URL], teamId=[team slug])`

If any call returns 403: record the exact error message (it will contain the real team ID, e.g. `team_XXXX`), then stop MCP attempts. Do not retry. Record in the document: "MCP returns 403 — token lacks team scope. Team ID extracted from error: `team_XXXX`. Do not attempt MCP calls in the fresh chat."

If MCP calls succeed: extract any error lines, function crash messages, or unsupported module names. Include them verbatim in the document.

---

### D — Diagnose using this decision tree

**Edge Runtime rejection** (`referencing unsupported modules @/lib/...` in build log):
→ Root cause: `middleware.ts` imports a local file via `@/` path alias. Vercel's Edge bundler does not inline `@/` paths — it leaves them as external `require()` calls which it then rejects.
→ Fix: Rewrite `middleware.ts` to be fully self-contained. Remove all `import` statements for local `@/` paths. Copy the needed logic directly into the file. Only `next/server` is a safe import.

**Infrastructure 404 + `.vercel.app` hash URL also 404s** (deployment shows Ready + Production):
→ Root cause: The Next.js build output is empty or invalid. Vercel packaged the deployment but has nothing to route requests to.
→ Investigate `next.config.js` for webpack-mutating wrappers (e.g., `next-pwa@5.x`, custom webpack plugins). These can corrupt the server bundle while still exiting code 0.
→ Fix: Remove the offending wrapper from `next.config.js`. Verify this resolves it, then replace with a maintained alternative.

**Infrastructure 404 + `.vercel.app` URL WORKS but custom domain 404s**:
→ Root cause: domain not assigned to this project, or DNS not pointing to Vercel.
→ Fix: In Vercel Settings → Domains, verify the domain is listed and shows a green checkmark. If missing, instruct the user to add it — Claude Code cannot add domains autonomously.

**Build failure** (deployment status is "Error"):
→ Find the first ERROR line in build logs.
→ If "Cannot find module": missing dependency or wrong import path.
→ If TypeScript error: type mismatch, fix the type.
→ If memory/timeout: build is too large or too slow, needs optimization.

**Deployment stuck "Building"**:
→ Do not generate a fix document. Tell the user to wait for the build to complete and then re-run `/debug-vercel`.

---

### E — Generate the DEBUG document

Write `DEBUG-[2-3-word-slug].md` in the project root. The slug must describe the specific issue (e.g., `DEBUG-nextpwa-build-output.md`, `DEBUG-edge-runtime-import.md`, `DEBUG-domain-assignment.md`).

The document must contain these sections in this order, with zero placeholders — every value must be real or explicitly noted as "could not be determined because [reason]":

````
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

[Exact verbatim error text. For a 404: include the request ID. For a build failure: include the full error line.]

**Error class:** [one of: Edge Runtime rejection / Infrastructure-level 404 / Build failure / Domain misconfiguration / Runtime crash]
**Why this class:** [one sentence explaining how the class was determined]

---

## Confirmed Facts (Do Not Re-Verify)

| Check | Status | Evidence |
|---|---|---|
[Every hypothesis that was ruled out, with evidence. Every confirmed fact.]

---

## Root Cause

[One specific thing. One paragraph. Evidence cited. No "possibly" or "maybe".]

---

## Vercel MCP Access Note

[Whether MCP calls will work in the fresh chat. If 403: state the team ID extracted from the error and say "do not attempt MCP calls." If MCP worked: state which calls are safe and what data they return.]

---

## Fix Plan — Execute in This Order

### Step 1 — [Action name]
[What to do. Then the exact code block, copy-paste ready, no placeholders.]

```[language]
[real code]
```

If this step fails: [specific failure mode and what to do]

### Step 2 — [Action name]
[etc.]

---

## Files to Know

| File | Action | Note |
|---|---|---|
| [path] | Change / Do not touch / Delete | [why] |

---

## Success Criteria

1. [Concrete, observable state — e.g. "https://www.risedial.com loads the Rise sign-in page"]
2. [etc.]

---

## What NOT to Do

- [Specific wrong move relevant to this exact issue]
- [etc.]
````

---

### F — Self-review before writing

Before writing the document, answer each question. If the answer to any is "no," fix it before writing:

1. Does every table cell in Project Identifiers contain a real value?
2. Does the Fix Plan contain zero `[placeholder]` strings?
3. Is the Root Cause section a single specific claim, not a list of possibilities?
4. Does the document tell the fresh Claude to work autonomously (no "ask the user" instructions)?
5. Does the Vercel MCP note accurately reflect whether MCP calls will succeed in a fresh chat with this same token?
6. Are all code blocks in the Fix Plan syntactically correct for the language?
7. Does each Fix Plan step include a "if this step fails" instruction?

---

### G — Output to the user after writing

Print exactly:
- `Created: DEBUG-[filename].md`
- Root cause: [one sentence]
- Fix: [one sentence describing what the plan does]
- `→ Send DEBUG-[filename].md to a fresh Claude Code chat to execute.`

---

## Step 3 — Verify the command file was written correctly

After writing `.claude/commands/debug-vercel.md`, read it back and confirm:
- It contains all sections A through G above
- The decision tree in section D covers all four error classes
- The document template in section E has all 8 required sections
- The self-review checklist in section F has all 7 questions

## Constraints

- Do not create any other files besides `.claude/commands/debug-vercel.md` and `.claude/commands/` directory
- Do not modify any existing project files
- The command file must work when the user provides screenshots only (no text), text only (no screenshots), or both together
- The generated DEBUG document must never require the user to take manual action mid-fix — if something requires manual action (like adding a domain in Vercel), the document must state that explicitly and stop the Fix Plan at that step with instructions
- Use PowerShell syntax for all shell commands in the Fix Plan (this project runs on Windows with PowerShell)
