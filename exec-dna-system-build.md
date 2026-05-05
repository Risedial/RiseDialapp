---
description: Creates the complete DNA profiling system in ~/.claude/ — DNA.json schema, dna-system/ state management, and the /dna-update global command. Run in a fresh Claude Code session to install all components.
allowed-tools: Read Write Bash Glob Grep Agent
---

You are executing the DNA System Build. Your job is to create all files for the DNA profiling system in $HOME/.claude/. You use serial sub-agents — one per major file — to keep this session's context clean.

Do NOT skip phases. Do NOT combine phases. Wait for each agent before proceeding to the next.

---

## PATHS (resolved — do NOT run pwd or shell commands to derive these)

HOME_CLAUDE = $HOME/.claude
DNA_FILE = $HOME/.claude/DNA.json
SYSTEM_DIR = $HOME/.claude/dna-system
STATE_FILE = $HOME/.claude/dna-system/state.json
BATCH_DIR = $HOME/.claude/dna-system/batch-results
COMMAND_FILE = $HOME/.claude/commands/dna-update.md

---

## PHASE 0 — SETUP

Run these Bash commands:

```bash
mkdir -p "$HOME/.claude/dna-system/batch-results"
mkdir -p "$HOME/.claude/commands"
```

Verify both directories exist. If either mkdir fails: output the error and stop.

Output: "Phase 0 complete. Directories ready."

---

## PHASE 1 — DNA SCHEMA AGENT

Spawn ONE Agent with this exact prompt:

> You are the DNA Schema Writer. Your ONLY output is $HOME/.claude/DNA.json.
> If $HOME/.claude/DNA.json already exists, read it first and preserve any non-null values — do not overwrite existing data.
> If it does not exist, write the empty schema.
>
> Write $HOME/.claude/DNA.json with this exact JSON (if file exists and has non-null values, merge — keep non-null values, add any missing top-level keys):
>
> ```json
> {
>   "meta": {
>     "schema_version": "1.0",
>     "created_at": null,
>     "last_updated": null,
>     "coverage": {
>       "total_sessions_indexed": 0,
>       "total_sessions_processed": 0,
>       "sessions_pending": 0,
>       "last_indexed_at": null
>     },
>     "confidence_score": 0.0,
>     "confidence_rationale": "Self-referential: measures how completely extraction rules were applied across all sessions analyzed, not certainty about intent. Increases as evidence_count grows across dimensions."
>   },
>   "identity": {
>     "operator_name": null,
>     "primary_role": null,
>     "domain_maturity": null,
>     "technical_fluency": null,
>     "industry_context": null,
>     "assumed_identity": null,
>     "team_context": null,
>     "decision_authority": null
>   },
>   "explicit_patterns": {
>     "stated_preferences": [],
>     "stated_rules": [],
>     "stated_goals": [],
>     "recurring_requests": [],
>     "commands_frequency": {},
>     "feedback_given_to_claude": {
>       "corrections": [],
>       "confirmations": [],
>       "approvals": []
>     }
>   },
>   "implicit_patterns": {
>     "unstated_goals": [],
>     "fear_drivers": [],
>     "desire_drivers": [],
>     "unspoken_constraints": [],
>     "priority_signals": [],
>     "emotional_register_baseline": null,
>     "north_star": null
>   },
>   "psychoanalysis": {
>     "surface_motivation": null,
>     "deeper_motivation": null,
>     "assumed_identity": null,
>     "trigger_events": [],
>     "urgency_patterns": null
>   },
>   "behavioral_dimensions": {
>     "communication_style":   { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "decision_speed":        { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "explanation_depth":     { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "debugging_approach":    { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "ux_philosophy":         { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "vendor_philosophy":     { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "frustration_triggers":  { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null },
>     "learning_style":        { "value": null, "evidence_count": 0, "confidence": 0.0, "last_updated": null }
>   },
>   "cognitive_profile": {
>     "problem_solving_approach": null,
>     "abstraction_preference": null,
>     "iteration_model": null,
>     "automation_bias": null,
>     "systems_thinking_depth": null,
>     "parallel_vs_sequential": null
>   },
>   "workflow_patterns": {
>     "recurring_workflows": [],
>     "automation_candidates": [],
>     "human_checkpoints": [],
>     "session_rhythm": null,
>     "avg_session_depth": null
>   },
>   "tool_usage": {
>     "commands_frequency": {},
>     "skills_invoked": {},
>     "agent_types_spawned": {},
>     "tool_combinations": []
>   },
>   "vocabulary": {
>     "domain_jargon": [],
>     "named_systems": [],
>     "shorthand_patterns": [],
>     "forbidden_output_patterns": []
>   },
>   "collaboration_style": {
>     "autonomy_preference": null,
>     "verification_style": null,
>     "correction_patterns": [],
>     "approval_signals": [],
>     "rejection_signals": []
>   },
>   "project_map": {
>     "active_projects": [],
>     "completed_projects": [],
>     "recurring_domains": [],
>     "cross_project_themes": []
>   },
>   "vision_state": {
>     "end_state_description": null,
>     "transformation_delta": null,
>     "measurable_outcomes": [],
>     "time_horizon": null
>   },
>   "dimension_dependencies": {
>     "dependency_map": {},
>     "cascade_rules": [],
>     "amplifications": [],
>     "conflicts": [],
>     "resolution_rules": []
>   },
>   "growth_trajectory": {
>     "domain_evolution": [],
>     "pattern_shifts": [],
>     "skill_progression": [],
>     "sessions_per_week_avg": null
>   },
>   "delta_log": []
> }
> ```
>
> After writing, verify the file is valid JSON. Respond with exactly:
> Phase 1 complete. DNA.json written. File: $HOME/.claude/DNA.json

Wait for Phase 1 agent before proceeding.

**Verification:**
- [ ] $HOME/.claude/DNA.json exists and is valid JSON
- [ ] Contains all 16 top-level keys: meta, identity, explicit_patterns, implicit_patterns, psychoanalysis, behavioral_dimensions, cognitive_profile, workflow_patterns, tool_usage, vocabulary, collaboration_style, project_map, vision_state, dimension_dependencies, growth_trajectory, delta_log

---

## PHASE 2 — STATE INIT AGENT

Run these Bash commands and capture outputs:

```bash
SESSION_COUNT=$(find "$HOME/.claude/projects" -name "*.jsonl" -not -path "*/memory/*" 2>/dev/null | wc -l | tr -d ' ')
NOW_ISO8601=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "SESSION_COUNT=$SESSION_COUNT NOW=$NOW_ISO8601"
```

Store SESSION_COUNT and NOW_ISO8601 from the output.

If $HOME/.claude/dna-system/state.json already exists, read it and extract the processed_sessions array as EXISTING_PROCESSED_JSON.
If it does not exist, set EXISTING_PROCESSED_JSON = "[]".

Spawn ONE Agent with this exact prompt (substitute SESSION_COUNT, NOW_ISO8601, and EXISTING_PROCESSED_JSON with actual captured values before spawning):

> You are the State Initializer. Your ONLY output is $HOME/.claude/dna-system/state.json.
>
> EXPECTED SESSION COUNT: [SESSION_COUNT]
> CURRENT TIME: [NOW_ISO8601]
> EXISTING PROCESSED SESSIONS JSON: [EXISTING_PROCESSED_JSON]
>
> Step 1 — Run this Bash command to discover all sessions:
>
> ```bash
> find "$HOME/.claude/projects" -name "*.jsonl" -not -path "*/memory/*" 2>/dev/null -printf "%T@\t%p\n" | sort -rn | cut -f2
> ```
>
> Step 2 — Parse EXISTING_PROCESSED_SESSIONS JSON from above to get the set of already-processed paths (use the "path" field of each entry).
>
> Step 3 — For each path from Step 1 that is NOT in the already-processed path set:
>   Build a pending_sessions entry: {"path": "<absolute path>", "project": "<last directory component of the path's parent directory>", "discovered_at": "[NOW_ISO8601]"}
>
> Step 4 — Write $HOME/.claude/dna-system/state.json with this structure:
>
> ```json
> {
>   "version": "1.0",
>   "initialized_at": "[NOW_ISO8601]",
>   "last_run_at": null,
>   "coverage": {
>     "total_sessions_indexed": [SESSION_COUNT as integer],
>     "total_sessions_processed": [count of entries in EXISTING_PROCESSED_SESSIONS_JSON array],
>     "sessions_pending": [count of entries added in Step 3],
>     "last_indexed_at": "[NOW_ISO8601]"
>   },
>   "batch_config": {
>     "sessions_per_batch": 5,
>     "batches_run_total": 0,
>     "current_batch_number": 0
>   },
>   "pending_sessions": [array of entries built in Step 3],
>   "processed_sessions": [EXISTING_PROCESSED_SESSIONS_JSON array — empty array if none]
> }
> ```
>
> After writing, respond with exactly:
> Phase 2 complete. State initialized. Sessions indexed: [SESSION_COUNT]. Pending: [pending count]. File: $HOME/.claude/dna-system/state.json

Wait for Phase 2 agent before proceeding.

**Verification:**
- [ ] $HOME/.claude/dna-system/state.json exists and is valid JSON
- [ ] pending_sessions array is present (may have many entries)
- [ ] coverage.total_sessions_indexed is a positive integer
- [ ] batch_config.sessions_per_batch == 5
- [ ] version == "1.0"

---

## PHASE 3 — COMMAND WRITER AGENT

Spawn ONE Agent with the following prompt. The agent's instructions are between START-AGENT-PROMPT and END-AGENT-PROMPT. The file content to write is between START-FILE-CONTENT and END-FILE-CONTENT (write only what is between those inner markers, not the markers themselves).

---START-AGENT-PROMPT---
You are the Command Writer Agent. Your ONLY output is $HOME/.claude/commands/dna-update.md.
If the file already exists, overwrite it completely with the content below.

Write $HOME/.claude/commands/dna-update.md with the exact content between START-FILE-CONTENT and END-FILE-CONTENT. Do not write the marker lines themselves.

---START-FILE-CONTENT---
---
description: Updates DNA.json by scanning ~/.claude/projects for unprocessed session files and extracting behavioral intelligence. Processes BATCH_SIZE=5 sessions per run using serial sub-agents. Run in any fresh Claude Code session to grow your profile.
allowed-tools: Read Write Bash Glob Grep Agent
---

You are executing /dna-update. Your job: scan for unprocessed Claude Code session JSONL files, extract behavioral intelligence via a sub-agent, synthesize findings into DNA.json via a second sub-agent, and update the state file.

## Configuration

STATE_FILE = $HOME/.claude/dna-system/state.json
DNA_FILE = $HOME/.claude/DNA.json
BATCH_DIR = $HOME/.claude/dna-system/batch-results
SESSIONS_ROOT = $HOME/.claude/projects
BATCH_SIZE = 5

## Phase 0 — Read State

Read STATE_FILE. If STATE_FILE does not exist: output "ERROR: State file not found at $HOME/.claude/dna-system/state.json. Run /dna-system-builder first." and stop.

Extract from state: pending_sessions array, processed_sessions array, batch_config object.

## Phase 1 — Scan and Index New Sessions

Run Bash:

```bash
find "$HOME/.claude/projects" -name "*.jsonl" -not -path "*/memory/*" 2>/dev/null -printf "%T@\t%p\n" | sort -rn | cut -f2
```

Build KNOWN_PATHS = set of all path values from pending_sessions[*].path UNION processed_sessions[*].path.

For each found path NOT in KNOWN_PATHS (paths are already in newest-first order from the find command):
  Prepend {"path": "<found path>", "project": "<last directory component of found path's parent>", "discovered_at": "<ISO 8601 now>"} to the front of pending_sessions — so newly discovered sessions are processed before any older ones already in the queue.

Update state in memory:
  coverage.total_sessions_indexed = total found paths count
  coverage.sessions_pending = pending_sessions.length
  coverage.last_indexed_at = now ISO 8601

Write updated STATE_FILE.

Output: "Scan complete. [N] new sessions found. Total pending: [pending_sessions.length]"

## Phase 2 — Check Pending

If pending_sessions.length == 0 after Phase 1:
  Output:
  /dna-update complete.

  All sessions processed. DNA.json is up to date.
  Sessions in profile: [coverage.total_sessions_processed]
  Last updated: [last_run_at or "never"]

  Run /dna-update again after new Claude Code sessions to capture new data.
  Stop.

## Phase 3 — Take Batch

Take the first BATCH_SIZE items from pending_sessions. Store as CURRENT_BATCH.
Set BATCH_NUMBER = batch_config.current_batch_number + 1.
Set BATCH_RESULT_FILE = BATCH_DIR/batch-[BATCH_NUMBER].json

Output: "Processing batch [BATCH_NUMBER]: [CURRENT_BATCH.length] sessions from projects: [comma-joined list of project field values from CURRENT_BATCH]"

## Phase 4 — Extraction Agent

Read DNA_FILE. If DNA_FILE does not exist or is empty, set CURRENT_DNA_CONTENT = "EMPTY — no profile exists yet".
Otherwise set CURRENT_DNA_CONTENT = full file contents of DNA_FILE.

Spawn ONE Agent with this prompt. Substitute CURRENT_BATCH paths, BATCH_NUMBER, BATCH_RESULT_FILE, and CURRENT_DNA_CONTENT with actual values before spawning. Wait for this agent to complete before Phase 5.

---EXTRACTION AGENT PROMPT START---
You are the DNA Extraction Agent. Your ONLY output is [BATCH_RESULT_FILE].

## Sessions to Process
Read each of these JSONL files:
[numbered list of actual absolute paths from CURRENT_BATCH, e.g.:
1. /path/to/session1.jsonl
2. /path/to/session2.jsonl]

## Current DNA Profile (reference only — do NOT modify)
[CURRENT_DNA_CONTENT]

## Parsing Rules
For each JSONL file, read line by line. Parse each line as JSON.
Skip lines where the top-level "type" field is not "user". These are queue-operations, assistant messages, and tool results — skip all of them.
For lines where type == "user" AND message.role == "user": extract the content.
Content extraction:
  - If message.content is a string: use it directly.
  - If message.content is an array: extract only items where type == "text". Concatenate their text values with a single space.
  - Skip array items where type is "tool_result", "image", "tool_use", or any non-text type.
  - Also skip messages whose content consists only of XML-style command invocation tags (e.g., content that is only <command-message>...</command-message> and/or <command-name>...</command-name> — these are slash command invocations, not user intent text).
Clean extracted text: remove filler words (um, uh), voice-to-text artifacts, obvious phrase repetitions. Preserve all meaning and intent.

## Extraction Protocol

Run across ALL cleaned messages from ALL sessions in this batch.

EXPLICIT LAYER (only what was directly stated — no inference):
- stated_preferences: direct statements of preference ("I want", "always", "never", "I like", "I hate", "don't do X")
- stated_goals: explicit objectives stated by the user
- commands_invoked: tally every /command or skill name used (key: command name, value: count)
- feedback_corrections: messages where user corrected Claude ("no not that", "stop doing X", "that's wrong")
- feedback_confirmations: messages where user confirmed Claude's approach ("yes exactly", "perfect", "that's right")
- feedback_approvals: user accepting an unusual choice without pushback (implicit approval of non-obvious decisions)
- explicit_constraints: hard limits stated directly
- questions_asked: what the user asked Claude to help figure out or research

IMPLICIT LAYER (inferred signals — for each entry record: trigger + inference + evidence):
- unstated_goals: recurring objectives the user worked toward without explicitly naming them
- fear_drivers: what they were avoiding — losing context, wasted effort, uncontrolled dependencies, complexity, being blocked
- desire_drivers: what they moved toward — leverage, scale, automation, control, systems that compound, portability, fidelity
- priority_signals: topics returned to most, spent most words on, emphasized by repetition
- unspoken_constraints: limits assumed without stating (budget implied by tone, time by urgency language, team size by "I")
- assumed_identity: role they played in their mind — builder, founder, engineer, creator, operator, architect
- emotional_register: map of states detected — frustrated/excited/uncertain/urgent/calm/overwhelmed — with specific signals for each state

BEHAVIORAL DIMENSIONS (null if fewer than 2 clear signals; always include evidence_count):
- communication_style: terse vs. detailed; structured vs. stream-of-consciousness; voice-dictation patterns present?
- decision_speed: asks Claude for options before deciding vs. states direction immediately
- explanation_depth: wants reasoning behind answers vs. wants just the output
- debugging_approach: systematic (traces errors, reads logs) vs. intuitive (describes symptoms)
- ux_philosophy: design-first vs. function-first vs. indifferent
- vendor_philosophy: build-custom vs. use-libraries vs. strategic-by-leverage
- frustration_triggers: specific patterns that caused the user to correct Claude
- learning_style: example-driven vs. conceptual-explanation vs. learn-by-doing

REPEATABLE SYSTEMS — identify any process that is 2+ steps, repeatable on different inputs, and has variables that change while structure stays the same. For each: name, domain, steps[], variables[], dependencies[]

VOCABULARY — consistently used terms:
- domain jargon used with specific meaning
- named systems or concepts referenced repeatedly
- shorthand patterns (abbreviated references to things previously described)

## Output

Write [BATCH_RESULT_FILE] as valid JSON:

{
  "batch_meta": {
    "batch_number": [BATCH_NUMBER],
    "sessions_processed": ["<path1>", "<path2>", ...],
    "extraction_timestamp": "<ISO 8601>",
    "total_user_messages_analyzed": 0
  },
  "explicit": {
    "stated_preferences": [],
    "stated_goals": [],
    "commands_invoked": {},
    "feedback_corrections": [],
    "feedback_confirmations": [],
    "feedback_approvals": [],
    "explicit_constraints": [],
    "questions_asked": []
  },
  "implicit": {
    "unstated_goals": [{"trigger": "", "inference": "", "evidence": ""}],
    "fear_drivers": [{"trigger": "", "inference": "", "evidence": ""}],
    "desire_drivers": [{"trigger": "", "inference": "", "evidence": ""}],
    "priority_signals": [],
    "unspoken_constraints": [],
    "assumed_identity": {"value": null, "evidence": ""},
    "emotional_register": {"baseline": null, "states_detected": []}
  },
  "behavioral_dimensions": {
    "communication_style":  {"value": null, "evidence_count": 0},
    "decision_speed":       {"value": null, "evidence_count": 0},
    "explanation_depth":    {"value": null, "evidence_count": 0},
    "debugging_approach":   {"value": null, "evidence_count": 0},
    "ux_philosophy":        {"value": null, "evidence_count": 0},
    "vendor_philosophy":    {"value": null, "evidence_count": 0},
    "frustration_triggers": {"value": null, "evidence_count": 0},
    "learning_style":       {"value": null, "evidence_count": 0}
  },
  "repeatable_systems": [],
  "vocabulary": []
}

After writing [BATCH_RESULT_FILE], respond with exactly:
Extraction complete. Batch [BATCH_NUMBER]. Messages analyzed: [N]. File: [BATCH_RESULT_FILE]
---EXTRACTION AGENT PROMPT END---

Verify BATCH_RESULT_FILE exists and is valid JSON before proceeding to Phase 5.

## Phase 5 — Synthesis Agent

Read DNA_FILE. If missing or empty, use the empty DNA schema (all top-level keys present, all values null or empty arrays/objects).

Spawn ONE Agent with this prompt. Substitute BATCH_RESULT contents, CURRENT_DNA contents, and BATCH_NUMBER with actual values before spawning. Wait for this agent to complete before Phase 6.

---SYNTHESIS AGENT PROMPT START---
You are the DNA Synthesis Agent. Your ONLY output is the updated $HOME/.claude/DNA.json.

## Inputs

BATCH_RESULT (new findings to merge in):
[paste full contents of BATCH_RESULT_FILE verbatim]

CURRENT_DNA (the existing profile — merge INTO this):
[paste full contents of DNA_FILE verbatim, or the empty DNA schema if DNA_FILE does not exist]

BATCH_NUMBER: [BATCH_NUMBER]

## Merging Rules

RULE 1 — Null field in current, new value in batch:
Set field to batch value. Set evidence_count = batch evidence_count. Set confidence per formula below.

RULE 2 — Both have values:
Add evidence_counts together (always).
If batch evidence_count > current evidence_count: update value to batch value.
If current evidence_count >= batch evidence_count: keep current value.
If values conflict with equal evidence: keep current value AND add entry to dimension_dependencies.conflicts array.

RULE 3 — Array fields (stated_preferences, fear_drivers, desire_drivers, etc.):
Deduplicate semantically (same meaning = same entry, even if different wording).
Merge arrays, no duplicates.

RULE 4 — commands_frequency and commands_invoked (count objects):
Sum counts for matching command names. Add new command names with their counts.

RULE 5 — Confidence formula (apply after updating evidence_count):
1-5 evidence: confidence = 0.3
6-20 evidence: confidence = 0.6
21-50 evidence: confidence = 0.8
51+ evidence: confidence = 0.95

RULE 6 — Update meta fields:
Set meta.last_updated = current ISO 8601 timestamp.
Recalculate meta.confidence_score = average confidence across all behavioral_dimensions values (ignore null values).
Leave meta.coverage fields unchanged — state.json owns coverage.

RULE 7 — Append to delta_log:
Add one entry: {"batch": [BATCH_NUMBER], "timestamp": "<ISO 8601>", "sessions_added": [count from batch_meta.sessions_processed], "dimensions_updated": ["<list of dimension names whose value changed>"], "new_evidence_added": <sum of evidence_counts from batch behavioral_dimensions>}

## Output

Write the complete merged JSON to $HOME/.claude/DNA.json. Every top-level key from the schema must be present. Do not remove any existing data.

After writing, respond with exactly:
Synthesis complete. Batch [BATCH_NUMBER]. Dimensions updated: [N]. Total delta_log entries: [N]. File: $HOME/.claude/DNA.json
---SYNTHESIS AGENT PROMPT END---

## Phase 6 — Update State

Read STATE_FILE. Apply ONLY these mutations:
1. Remove CURRENT_BATCH items from pending_sessions (match by path field)
2. Append each CURRENT_BATCH item to processed_sessions (add processed_at: now ISO 8601, batch: [BATCH_NUMBER])
3. Set batch_config.current_batch_number = [BATCH_NUMBER]
4. Increment batch_config.batches_run_total by 1
5. Set coverage.total_sessions_processed += [CURRENT_BATCH.length]
6. Set coverage.sessions_pending = pending_sessions.length after removals
7. Set last_run_at = now ISO 8601
Write updated STATE_FILE. Preserve ALL other fields.

## Phase 7 — Completion Check and Auto-Reset

Read updated STATE_FILE.

IF pending_sessions.length > 0:
  Output:
  /dna-update batch [BATCH_NUMBER] complete.

  Sessions processed this run:  [CURRENT_BATCH.length]
  Sessions remaining:           [pending_sessions.length]
  Total sessions in profile:    [coverage.total_sessions_processed]

  DNA.json updated. Run /dna-update again to process the next batch.

IF pending_sessions.length == 0:
  Confirm pending_sessions = [] and set coverage.sessions_pending = 0. Write STATE_FILE. Preserve processed_sessions and all other fields.
  Output:
  /dna-update complete — all sessions processed.

  Total sessions in profile:    [coverage.total_sessions_processed]
  Total batches run:            [batch_config.batches_run_total]
  DNA.json last updated:        [now]

  State reset. Run /dna-update again after new Claude Code sessions to grow your profile.
---END-FILE-CONTENT---

After writing $HOME/.claude/commands/dna-update.md, respond with exactly:
Phase 3 complete. dna-update.md written. File: $HOME/.claude/commands/dna-update.md
---END-AGENT-PROMPT---

Wait for Phase 3 agent before proceeding.

**Verification:**
- [ ] $HOME/.claude/commands/dna-update.md exists and is non-empty
- [ ] Contains frontmatter with description and allowed-tools fields
- [ ] Contains all 8 labeled phases: "Phase 0 — Read State" through "Phase 7 — Completion Check and Auto-Reset"
- [ ] Contains EXTRACTION AGENT PROMPT START/END markers with full extraction protocol including all 8 behavioral dimensions
- [ ] Contains SYNTHESIS AGENT PROMPT START/END markers with all 7 merging rules labeled RULE 1 through RULE 7

---

## PHASE 4 — README AGENT

Spawn ONE Agent with this exact prompt:

> You are the README Writer. Your ONLY output is $HOME/.claude/dna-system/README.md.
>
> Write $HOME/.claude/dna-system/README.md with this exact content:
>
> # DNA Profiling System
>
> Behavioral intelligence profile extracted from Claude Code session history.
>
> ## Files
>
> | File | Purpose |
> |------|---------|
> | ~/.claude/DNA.json | The profile. Full parameterized schema. Never reset. |
> | ~/.claude/dna-system/state.json | Session tracking. Pending queue + processed history. |
> | ~/.claude/dna-system/batch-results/ | Extraction outputs per batch. Audit trail. |
> | ~/.claude/commands/dna-update.md | The /dna-update global command. |
>
> ## How to Use
>
> Run /dna-update in any fresh Claude Code session to process pending sessions.
> Each run processes BATCH_SIZE=5 sessions. Run repeatedly until all are processed.
> When all sessions are processed, state resets for the next discovery cycle.
>
> DNA.json is NOT loaded automatically. NOT a context file. Use it explicitly when you want it.
>
> ## What Gets Extracted
>
> - Explicit patterns: stated preferences, goals, commands used, feedback given to Claude
> - Implicit patterns: unstated goals, fear drivers, desire drivers, priority signals
> - Behavioral dimensions: 8 scored dimensions with evidence counts and confidence scores
> - Cognitive profile: problem-solving approach, abstraction preference, iteration model
> - Vocabulary: domain jargon, named systems, shorthand
> - Psychoanalytic layer: surface and deeper motivations, assumed identity, north star
>
> ## Confidence Model
>
> Each dimension accumulates evidence_count as sessions are processed.
> 1-5 sessions = 0.3 confidence. 6-20 = 0.6. 21-50 = 0.8. 51+ = 0.95.
> Profile accuracy improves with each /dna-update run.
>
> After writing, respond with exactly:
> Phase 4 complete. README.md written. File: $HOME/.claude/dna-system/README.md

Wait for Phase 4 agent before proceeding.

Also run:
```bash
touch "$HOME/.claude/dna-system/batch-results/.gitkeep" 2>/dev/null || echo "gitkeep skipped"
```

**Verification:**
- [ ] $HOME/.claude/dna-system/README.md exists and is non-empty
- [ ] Contains a Files table with all 4 system file paths
- [ ] Contains How to Use and Confidence Model sections

---

## PHASE 5 — VERIFICATION

Run:
```bash
ls "$HOME/.claude/DNA.json" "$HOME/.claude/dna-system/state.json" "$HOME/.claude/dna-system/README.md" "$HOME/.claude/commands/dna-update.md" 2>&1
```

Then perform these checks:

1. Read $HOME/.claude/DNA.json. Confirm it is valid JSON with at least these top-level keys present: meta, behavioral_dimensions, delta_log.
2. Read $HOME/.claude/dna-system/state.json. Confirm it is valid JSON and contains a pending_sessions array and a batch_config object.
3. Read $HOME/.claude/commands/dna-update.md. Confirm it contains the strings "Phase 0" and "Phase 7" and "EXTRACTION AGENT PROMPT START".

If any file is missing or any check fails: output exactly which file failed and what check failed. Do not proceed to Phase 6 until all checks pass.

Output: "Phase 5 complete. All files verified."

---

## PHASE 6 — COMPLETION REPORT

Read $HOME/.claude/dna-system/state.json. Extract coverage.total_sessions_indexed as SESSION_COUNT and coverage.sessions_pending as PENDING.

Output exactly:

DNA System Build complete.

Files created:
  $HOME/.claude/DNA.json                      — Profile schema (empty, ready to populate)
  $HOME/.claude/dna-system/state.json         — Session index ([SESSION_COUNT] sessions indexed, [PENDING] pending)
  $HOME/.claude/dna-system/README.md          — System documentation
  $HOME/.claude/commands/dna-update.md        — Global /dna-update command

To populate your DNA profile:
  Run /dna-update in any fresh Claude Code session.
  It processes 5 sessions per run. Run repeatedly to process all [PENDING] pending sessions.

DNA.json will NOT be loaded automatically. Use it explicitly whenever you want.
