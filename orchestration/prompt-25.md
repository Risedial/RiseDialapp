# Prompt 25: Write OpenAI Client

## Prerequisites

state.json flags that must be true:
- `flags.riseSystemPromptWritten` must be `true` (set by step-20-write-rise-system-prompt-module)

Context files to read before beginning:
- `context/app-openai-config.md` — model, temperature, max_tokens, timeout, non-streaming config

---

## Hard Constraints

1. 32,000 token output limit — Neither Claude Code nor any sub-agent it spawns may output more than 32,000 tokens in a single response. If a task risks exceeding this, split it into further sub-tasks and stop after the first sub-task completes.
2. No truncation — When writing data entries, write ALL entries for that batch. Never use `// ... more`, ellipses, or placeholder comments.
3. State sync required — Read the state file at the start of every session. Complete the single assigned task. Update the state file to mark that step complete before exiting.
4. No external dependencies — No CDN, no npm, no external URLs in any generated file.
5. File writes only via Write tool — Never use bash heredoc or shell redirection to write application files.

---

## Task

Write `risedial-production/lib/openai/client.ts` — OpenAI client module that:
1. Starts with `import 'server-only'` at the very top (prevents client-side import)
2. Initializes OpenAI SDK with `process.env.OPENAI_API_KEY`
3. Exports `callRise(messages: object[], timeout: number = 30000): Promise<string>` — calls gpt-4o-mini non-streaming (stream: false), uses Promise.race with a timeout, returns response content string. On timeout or API error, throws a typed error (never swallows).
   Parameters: temperature: 0.7, max_tokens: 1024, top_p: 1, frequency_penalty: 0, presence_penalty: 0
4. Exports `callCompression(messages: object[], model: string): Promise<object>` — calls the specified model (gpt-4o-mini or gpt-4o), expects JSON response, returns parsed JSON object. Used for memory compression calls.

Read `context/app-openai-config.md` for exact model names and parameter values.

---

## Verification

Before updating state.json, confirm ALL of the following:

- [ ] File `risedial-production/lib/openai/client.ts` exists
- [ ] `import 'server-only'` is the first import
- [ ] `callRise` is exported with Promise.race timeout pattern
- [ ] `callCompression` is exported
- [ ] Temperature is 0.7, max_tokens is 1024
- [ ] No `// ... more`, ellipses, or placeholder comments appear in the file

If any check fails: fix the issue, then re-run ALL verification checks before proceeding.

---

## State Update

Perform these exact mutations to `risedial-production/orchestration/state.json`:

1. Append `"step-25-write-openai-client"` to `completedSteps`
2. Remove `"step-25-write-openai-client"` from `pendingSteps`
3. Set `flags.openaiClientReady` to `true`
4. Append to `artifacts.filesWritten`: `"risedial-production/lib/openai/client.ts"`
