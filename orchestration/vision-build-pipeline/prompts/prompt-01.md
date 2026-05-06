# Prompt 01: Collect Source Commands
**Mode:** COLLECT
**Step ID:** step-01-collect-source-commands

## Prerequisites
None. This is the first step.

---

## Hard Constraints

1. **Mode lock — COLLECT:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context — no other directories.
2. **Token limit:** 32,000 tokens max. Split if at risk.
3. **No truncation:** Write every file completely.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Anti-hallucination:** All identifiers confirmed from actual file reads — not from memory.

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
CONTEXT_DIR = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context

---

## Task

1. Read STATE_FILE at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json. Verify "step-01-collect-source-commands" appears in pendingSteps array. If it is not in pendingSteps, stop and report "step-01-collect-source-commands is not in pendingSteps — cannot proceed."

2. Read all 4 source command files completely using the Read tool:
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md
   If any file is missing, stop and report the exact path that was not found.

3. For each of the 4 files, extract and record with verbatim quotes and exact line numbers:
   - Core mechanism (what it fundamentally does)
   - Input requirements (what it needs to start)
   - Output artifacts (every file it produces with schema)
   - State management approach (resume logic, session budgets, checkpointing)
   - Agent strategy (serial vs parallel, count, responsibilities)
   - User interaction points (every AskUserQuestion or blocking prompt)
   - Hallucination prevention mechanisms
   - Verification approach (how it validates output)
   - Error recovery strategy
   - Strengths and weaknesses

4. Record all findings with verbatim quotes from the actual file content at exact line numbers. Never paraphrase — quote exactly.

5. Write ALL findings to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md as an immutable reference. Include: one section per command, each section containing all 10 extracted dimensions with verbatim quotes. Write the complete file — no truncation.

6. Write a second file C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-locations.md listing:
   - Every command file's absolute path
   - Every output artifact path each command produces
   - Every schema structure defined in each command
   - Every phase/step name with the line number where it appears
   All paths must be absolute. All line numbers must be from actual reading.

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md exists (Glob to confirm: pattern "source-commands-facts.md" in CONTEXT_DIR)
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md file size > 0 bytes (Read the file — confirm it contains content for all 4 commands)
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-locations.md exists and file size > 0 bytes (Glob to confirm)
- [ ] All 4 source command file paths listed in source-commands-locations.md resolve to existing files on disk (Glob each path to verify)
- [ ] The string "[placeholder]" does not appear in any context file written in this step (Grep for "\[placeholder\]" in CONTEXT_DIR)

---

## State Update
After all 5 verification checks pass:
1. Set flags.sourceCommandsCollected = true in state.json
2. Move "step-01-collect-source-commands" from pendingSteps array to completedSteps array
3. Append to artifacts.filesWritten:
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\source-commands-facts.md"
   - "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\context\\source-commands-locations.md"
4. Write STATE_FILE back to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json preserving all other fields exactly (version, bootstrap_complete, project, buildTarget, orchestration_dir, other flags, knownItems — do not modify any field except the 3 listed above)
