# Universal Pipeline Specification (UPS) v1

Status: **Draft contract**. Not yet wired to the engine or remote orchestrator.

## Goals
- Platform-neutral, machine-readable pipeline representation.
- Explicit dependency graph and execution requirements.
- Commands expressed as executable + argument array (never shell-concatenated).
- Capability-based runner selection.
- Human-readable plan before execution; approval policy remains outside this schema.
- Portable subset with provider-specific capabilities clearly marked.

## Format
The JSON Schema lives at `shared/contracts/universal-pipeline.schema.json`.

Top-level fields:
- `version`: currently `1`.
- `name`, optional `description`.
- `trigger`: descriptive trigger declarations (provider adapter interpretation).
- `jobs`: map of job IDs to jobs.

Job fields:
- `needs`: dependency job IDs.
- `runsOn`: required runner capability labels.
- `timeoutSeconds`: upper bound.
- `steps`: ordered steps.
- `continueOnError`: explicit non-blocking behavior.

Step fields:
- `id`, optional `name`.
- `run.executable`: executable name/path.
- `run.args`: argument list, each element separate; no shell expansion.
- `run.cwd`: optional working directory.
- `run.env`: environment overrides.
- `timeoutSeconds`, `continueOnError`.

## Safety invariants
1. Providers must validate the document and reject unknown fields.
2. Do not interpolate executable/arguments into a shell command string.
3. Resolve executable and working-directory policy before execution.
4. Environment overrides must be allowlisted or policy-reviewed; secrets are not stored in pipeline documents.
5. Approval, secret injection, network access, sandboxing and deployment permissions are external policy decisions.
6. Pipeline specification alone is **not** a sandbox or trust boundary.
7. Never execute untrusted pull-request code in the app/webhook process.
8. Provider adapters must report unsupported semantics rather than silently ignore them.

## Dependency graph
- Job IDs are keys in `jobs`.
- `needs` forms a DAG; cycles and unknown dependencies must be rejected by validators.
- Execution order and parallelism are provider/engine decisions, respecting dependencies.

## Compatibility
The schema defines a portable subset. Providers may advertise capabilities; they must disclose unsupported features. A provider-specific extension mechanism is intentionally deferred pending design review.

## Example
See `Docs/examples/ups-python.json`.

## Status
Schema and illustrative fixture are committed as a first contract. Runtime validation, DAG validator, converters and engine integration remain subsequent work.
