# State Schema — state.json

Use this schema verbatim when generating state.json. Replace all [bracketed] tokens with real values derived from the DESIGN block.

## Canonical schema

```json
{
  "version": "1.0.0",
  "bootstrap_complete": true,
  "project": "[SYSTEM_NAME]",
  "buildTarget": "[PROJECT_ROOT — absolute path]",
  "orchestration_dir": "[ORCH_DIR — absolute path]",
  "completedSteps": [],
  "pendingSteps": ["step-01-collect-[task]", "step-02-plan-[task]", "step-03-execute-[task]"],
  "artifacts": {
    "filesWritten": [],
    "plansCreated": []
  },
  "flags": {
    "[domainVerified]": false,
    "[task1Complete]": false,
    "allChangesCommitted": false
  },
  "knownItems": {}
}
```

## Token replacement rules

- [SYSTEM_NAME]: kebab-case slug from first 3–5 words of objective
- [PROJECT_ROOT]: absolute path to project (from pwd at invocation)
- [ORCH_DIR]: [PROJECT_ROOT]/orchestration/[SYSTEM_NAME]
- All step IDs: "step-NN-mode-task" where NN is zero-padded, mode is collect|plan|execute, task is kebab-case
- Flag names: derived from objective nouns — never generic names like "task1Done"

## Invariant

completedSteps.length + pendingSteps.length must equal TOTAL_STEPS at all times.
