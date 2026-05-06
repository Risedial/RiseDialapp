# Prompt 03: Execute Analysis
**Mode:** EXECUTE
**Step ID:** step-03-execute-analysis

## Prerequisites
- flags.analysisPlanDerived = true in C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json
- Plan file to read: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md

---

## Hard Constraints

1. **Mode lock — EXECUTE:** Write only to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs — this step creates a new analysis document. Do NOT write to context/, plans/, or prompts/ directories.
2. **Token limit:** 32,000 tokens max. Split into multiple writes if the analysis document exceeds this limit.
3. **No truncation:** Write the complete analysis document. No summaries or "see above" references.
4. **State sync:** Read STATE_FILE at start. Update STATE_FILE before exiting.
5. **Verification gate:** analysis.md must exist and be non-empty after writing.
6. **Anti-hallucination:** All command names, phase names, schema fields, and values must come from the plan file and context files — not from memory.
7. **DO NOT TOUCH:**
   - C:\Users\Alexb\Documents\RiseDialapp\src\
   - C:\Users\Alexb\Documents\RiseDialapp\public\
   - C:\Users\Alexb\Documents\RiseDialapp\package.json
   - C:\Users\Alexb\Documents\RiseDialapp\.env*

STATE_FILE = C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json

---

## Anti-Hallucination Protocol
Run before writing analysis.md:
1. Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md. If not found: stop and report "Plan file missing at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md. Cannot execute without a verified plan. Do not proceed."
2. Read the plan file. The "Target file" field names C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md. Glob for the directory C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs. If the directory does not exist: stop and report "Target directory does not exist: C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs."
3. Both checks pass: proceed to Task.

---

## Task

1. Verify plan file exists: Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md. If not found: stop and report "Plan file missing — cannot execute without verified plan."

2. Read plan file at C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\plans\02-analysis-plan.md. The After state specifies that analysis.md must contain: Per-Command Analysis for all 4 commands, Overlap Map, Conflict Map, and Gap Map. Record these requirements exactly.

3. Before writing: confirm the Before state condition: Glob for C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md. If the file ALREADY exists: read it to confirm it is incomplete or empty before overwriting. This is a new file creation — proceed.

4. Also read the source command files to produce the analysis (you need their content):
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\prep-vision.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\vision-to-docs.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\docs-to-build-v2.md
   - C:\Users\Alexb\Documents\RiseDialapp\.claude\commands\autonomous-system-builder1.md
   Read the context file C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\context\source-commands-facts.md for extracted facts.

5. Write C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md with the complete analysis as specified in the plan's After state:

   The file must contain ALL of the following:

   a) **## Per-Command Analysis** with one subsection per command (4 total), each containing all 10 dimensions listed below. Use verbatim quotes with exact line numbers from the actual command files for every claim:
      - **Core mechanism:** What the command fundamentally does (the primary operation loop or main action)
      - **Input:** What the command receives as input (arguments, files, prior state)
      - **Output artifacts:** Every file the command writes (name, path, format)
      - **State management:** How the command tracks progress (state file schema, fields, update logic)
      - **Agent strategy:** How the command spawns and coordinates agents (count, parallelism, sequencing)
      - **User interaction:** Every point where the command asks the user a question or requires user input
      - **Hallucination prevention:** Every mechanism the command uses to prevent hallucination (context files, anti-hallucination protocols, source citations)
      - **Verification:** Every verification check the command performs on its own outputs
      - **Error recovery:** How the command handles failures (retry logic, self-heal, fallbacks)
      - **Strengths:** What this command does better than the others (with evidence from file content)
      - **Weaknesses:** What this command does worse or omits compared to the others (with evidence from file content)

   b) **## Overlap Map** — every feature, mechanism, or concept appearing in 2 or more of the 4 commands. For each overlap entry:
      - Name the overlapping concept
      - List which commands implement it and cite the exact lines where each does so
      - State which command implements it best and explain why based on actual file content (not assumptions)

   c) **## Conflict Map** — every place where two or more commands make incompatible design choices. Conflict examples include: different SESSION_BUDGET values, different state schema field names, different agent parallelism strategies, different verification approaches. For each conflict entry:
      - Name the conflicting design dimension
      - State what each command does (verbatim quote with line number)
      - State which approach to use in the integrated system and the reason (derive from actual content evidence)

   d) **## Gap Map** — every capability that would improve the integrated system but does not exist in any of the 4 commands. For each gap entry:
      - Name the missing capability
      - Explain why it is needed (what breaks or degrades without it)
      - Propose a minimal design that fills the gap (specific enough to implement)

   Write completely — no truncation, no "see above", no "TBD".

6. After writing: Read the file. Confirm it contains all four headings: "## Per-Command Analysis", "## Overlap Map", "## Conflict Map", "## Gap Map".

---

## Verification
- [ ] C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\outputs\analysis.md exists (Glob confirms file at exact path)
- [ ] analysis.md file size > 0 bytes (Read — confirm file contains content)
- [ ] analysis.md contains heading "## Per-Command Analysis" (Read to confirm)
- [ ] analysis.md contains heading "## Overlap Map" (Read to confirm)
- [ ] analysis.md contains heading "## Conflict Map" (Read to confirm)
- [ ] analysis.md contains heading "## Gap Map" (Read to confirm)
- [ ] No protected path was modified: C:\Users\Alexb\Documents\RiseDialapp\src\, public\, package.json, .env* were not written to during this step

---

## State Update
After all 7 verification checks pass:
1. Set flags.analysisDocWritten = true in state.json
2. Move "step-03-execute-analysis" from pendingSteps to completedSteps
3. Append to artifacts.filesWritten: "C:\\Users\\Alexb\\Documents\\RiseDialapp\\orchestration\\vision-build-pipeline\\outputs\\analysis.md"
4. Write STATE_FILE back to C:\Users\Alexb\Documents\RiseDialapp\orchestration\vision-build-pipeline\state.json preserving all other fields exactly
