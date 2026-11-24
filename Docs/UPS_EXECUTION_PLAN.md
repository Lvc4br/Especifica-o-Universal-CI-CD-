# UPS Execution Plan Generator
Transforms a validated UPS v1 document into a deterministic plan. This is **plan-only**: it does not launch processes, resolve secrets, provision runners, grant permissions, or claim sandboxing.

## Guarantees
- UPS v1 schema and runtime validator enforce non-whitespace pipeline names/executables, valid job IDs, unique dependency/capability entries, and a maximum of 500 jobs and 100 steps per job.
- Validates first; invalid input returns issues and no plan.
- Topological job ordering, lexical tie-breaks for reproducibility.
- Parallel execution waves derived from dependency relationships.
- Executable and args remain separate; no shell command string is created.
- Preserves capabilities, dependencies, step settings and timeouts.
- Scheduling rationale and aggregate summary.

## API
`generateUpsExecutionPlan(value)` returns `{ valid, issues, plan? }`. Valid output includes `executionMode: "plan-only"`, ordered jobs, parallel groups and summary.

The plan is descriptive, not execution authorization. Runner policy, approval, credentials, environment handling and isolation remain separate.
