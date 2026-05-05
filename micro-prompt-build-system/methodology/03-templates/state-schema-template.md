# State File Schema Template
**Purpose:** Template for `state.json` initialization file
**Location:** `[orchestration-dir]/state.json`
**Date:** 2026-03-26

---

## RULES BEFORE USING THIS TEMPLATE

1. ALL step IDs must be finalized BEFORE writing state.json
2. `pendingSteps` must be FULLY POPULATED at initialization — never empty, never partial
3. `completedSteps` starts as empty array — never pre-populate
4. All `flags` start as `false`
5. All counters start as `0`
6. Do not add step IDs mid-execution — all steps must be known at initialization time
7. `buildTarget` must be the exact output directory path — prevents hardcoding in each prompt

---

## TEMPLATE

```json
{
  "version": "1.0.0",
  "buildTarget": "[exact/path/to/output/directory/]",
  "completedSteps": [],
  "pendingSteps": [
    "step-01-[descriptive-name]",
    "step-02-[descriptive-name]",
    "step-03-[descriptive-name]",
    "step-04-[descriptive-name]",
    "step-05-[descriptive-name]"
  ],
  "artifacts": {
    "itemCount": 0,
    "filesWritten": []
  },
  "dataChunks": {
    "[category1-name]": {},
    "[category2-name]": {},
    "[category3-name]": {}
  },
  "flags": {
    "[prerequisite-flag-1]": false,
    "[prerequisite-flag-2]": false,
    "[prerequisite-flag-3]": false
  }
}
```

---

## FIELD REFERENCE

| Field | Type | Starts As | Mutated By | Purpose |
|---|---|---|---|---|
| `version` | string | `"1.0.0"` | Never | Schema version for future migration |
| `buildTarget` | string | Set at init | Never | Output directory path — shared reference for all prompts |
| `completedSteps` | array | `[]` | Every session (append only) | Append-only log of completed step IDs |
| `pendingSteps` | array | ALL step IDs | Every session (remove on complete) | Ordered execution queue; empty = build complete |
| `artifacts.itemCount` | number | `0` | Data batch prompts (increment) | Total count of data entries written |
| `artifacts.filesWritten` | array | `[]` | Every session (append files written) | Audit trail of all output files |
| `dataChunks` | object | Category keys, empty objects | Data batch prompts | Tracks which data entries written per category |
| `flags` | object | All `false` | Setup prompts (set to true) | Boolean prerequisites for dependent prompts |

---

## STEP ID NAMING CONVENTION

Format: `"step-[NN]-[descriptive-action-name]"`

- `NN`: zero-padded two-digit number matching prompt file number
- `descriptive-action-name`: kebab-case description of what this step does

**Examples:**
```
"step-01-initialize-state"
"step-02-write-design-tokens"
"step-03-write-data-inventory-symptoms"
"step-04-write-data-inventory-conditions"
"step-15-write-app-shell-html"
"step-16-write-css-variables"
```

---

## FLAG NAMING CONVENTION

Flags should be named to describe what prerequisite is now satisfied:

**Pattern:** `[past-participle-of-what-was-done]`

**Examples:**
```json
"flags": {
  "stateInitialized": false,
  "designTokensWritten": false,
  "dataInventoryComplete": false,
  "appShellCreated": false,
  "serviceWorkerRegistered": false
}
```

---

## COMPLETION CHECK

When a session begins, it should execute this logic:

```
1. Read state.json
2. Check: is my step ID in pendingSteps?
   → YES: proceed to execute
   → NO, but it's in completedSteps: this step was already done — do not re-execute
   → NO, and not in completedSteps: state inconsistency — alert user, do not proceed
3. Execute task
4. Run verification
5. Update state.json before exiting
```

Build is complete when: `pendingSteps.length === 0` AND `completedSteps.length === [total step count]`
