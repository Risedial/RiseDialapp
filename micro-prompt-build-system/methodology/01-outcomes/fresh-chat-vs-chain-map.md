# Fresh Chat vs Chain Map
**Source:** `00-inventory/system-map.md`, `01-outcomes/outcome-registry.md`
**Date:** 2026-03-26
**Step:** 01 — Outcome Decomposition

---

## CLASSIFICATION LOGIC

**FRESH CHAT** — required when any of these conditions are true:
- Context from prior session would contaminate execution (noise > signal)
- Task produces many output files and benefits from clean working memory
- Task is explicitly designated as isolated by the methodology (Stage 7)
- Sub-agent execution (always isolated by definition)

**CHAIN** — permitted when all of these conditions are true:
- Task is stateless OR all required state is carried in files
- Task does not risk 32K token limit within the current session
- Context from prior steps in the same session is additive, not contaminating

---

## CLASSIFICATION TABLE

| Outcome / Operation | Classification | Reasoning |
|---|---|---|
| Applying 8-rule optimization (`/prompt`) | **CHAIN** | Stateless transformation. No accumulated context needed. Output is a single code block. |
| Applying `/refinep` Phase 1–2 (input + diagnostic) | **CHAIN** | Input capture + scoring. No web search yet. Fast. |
| Applying `/refinep` Phase 3 (domain research) | **CHAIN** | Web searches integrated; findings held in context for Phase 4. Must stay in same session as Phase 4. |
| Applying `/refinep` Phase 4–6 (technique application + verification + output) | **CHAIN** | Continues from Phase 3. All phases must run contiguously. |
| Entire `/refinep` for a simple prompt | **CHAIN** | All 6 phases fit comfortably in one session. |
| Entire `/refinep` for a very complex, domain-heavy prompt | **FRESH CHAT recommended** | Prior conversation from `/prompt` application adds noise. Research benefits from clean context. |
| Writing `design_decisions.md` (ideation/specification) | **NOT APPLICABLE** | User-authored document. Not a Claude session task. |
| Initial prompt formulation (Stage 2) | **CHAIN** | Low-complexity translation from spec to rough prompt. |
| Orchestration decomposition (Stage 5) | **FRESH CHAT** | Produces 30–45 files. Decomposition requires full attention. Prior refinement conversation = noise. |
| Writing context files (Stage 6) | **FRESH CHAT recommended** | Context files encode domain knowledge as authoritative references. Fresh session = no prior conversation bias. |
| Initializing state.json | **CHAIN (within Stage 5)** | Initialization happens as part of orchestration decomposition session. |
| Writing README.md index | **CHAIN (within Stage 5)** | Created alongside prompt files in same Stage 5 session. |
| Executing prompt-01 | **FRESH CHAT (mandatory)** | Stage 7 rule: every sub-prompt executes in isolated fresh session. No exceptions. |
| Executing prompt-02 through prompt-NN | **FRESH CHAT (mandatory)** | Same rule as prompt-01. Every prompt = fresh session. |
| Sub-agent spawned within a session | **FRESH CHAT (by definition)** | Sub-agents are isolated processes. They never inherit parent session context. |
| Post-execution verification (Verification section) | **CHAIN (within session)** | Runs at end of same session as the task. Must not be separated. |
| State.json update | **CHAIN (within session)** | Must happen in same session as task + verification. Final step before exit. |
| Final build completion verification (Stage 8) | **CHAIN (final Stage 7 session)** | Happens at end of last execution session. |
| Writing any sub-prompt file (prompt-NN.md) | **CHAIN (within Stage 5)** | All prompt files written in single Stage 5 session. |
| Reading context files within a sub-agent | **CHAIN (within sub-agent session)** | Files read at start of sub-agent session before any work begins. |

---

## CRITICAL CLASSIFICATIONS (NON-NEGOTIABLE)

These classifications are architectural constraints, not preferences:

1. **Stage 7 execution = ALWAYS FRESH CHAT** — explicitly named in methodology as "fresh chats with cleared contacts window." Prior context = noise. Attempting to chain Stage 7 sessions violates the foundational architecture.

2. **Sub-agent = ALWAYS FRESH CHAT** — sub-agents do not share memory with parent agent. This is a technical constraint, not a preference.

3. **Stage 5 (orchestration decomposition) = FRESH CHAT strongly recommended** — producing 30–45 files in a session already loaded with refinement conversation risks context degradation. Prior context from refinement is not useful for decomposition.

---

## DECISION TREE

```
START: Am I beginning a new task or continuing?

  → Continuing a task I started this session?
      → YES: CHAIN (unless explicitly marked as fresh-chat-only above)
      → NO: proceed to next question

  → Is this a Stage 7 sub-prompt execution?
      → YES: FRESH CHAT (mandatory)
      → NO: proceed to next question

  → Is this sub-agent work?
      → YES: FRESH CHAT (by definition)
      → NO: proceed to next question

  → Is this Stage 5 orchestration decomposition?
      → YES: FRESH CHAT (recommended)
      → NO: proceed to next question

  → Is this Stage 6 context file writing?
      → YES: FRESH CHAT (recommended)
      → NO: proceed to next question

  → Will this task produce output so large it risks 32K tokens in this session?
      → YES: FRESH CHAT
      → NO: CHAIN is permitted
```
