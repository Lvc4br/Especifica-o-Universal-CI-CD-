# Capability Resolution Engine

## Purpose
Resolve job requirements in a valid UPS v1 plan against a declared runner inventory. This module is pure analysis: it does not contact runners, provision infrastructure, execute commands, authorize work or access secrets.

## Input validation
- Require a structurally identified UPS v1 plan-only object.
- Reject empty/duplicate job IDs and malformed required capability lists.
- Reject duplicate/empty runner IDs, invalid statuses, malformed capability strings and malformed optional labels.
- Empty runner inventories are valid and produce unresolved jobs.
- The resolver cannot independently prove that an arbitrary caller-created plan came from the UPS validator. Integrations must pass the actual output of `generateUpsExecutionPlan`; this API performs defensive structural checks, not cryptographic provenance verification.

## Runner inventory
Each runner declaration has a unique ID, non-empty capability strings and a status (`online`, `offline`, `unknown`). Optional labels are validated but are not currently used for selection.

## Resolution
A runner is compatible only if it is declared online and contains every required capability for a job. Candidate IDs and selection are deterministic: candidates are sorted lexically and the first is selected. Jobs with no online candidate remain unresolved. Matching offline and unknown-status candidates are reported as diagnostics, never selected. No resource capacity is reserved and this is not a scheduler.

## API
`resolvePlanCapabilities(plan, runners)` returns a validation result and resolution report. The report includes online/offline/unknown inventory counts and reasons for unresolved jobs. Inputs are not mutated.

## Safety boundary
Capability match is not permission. No network access, runner handshake, process execution, secret resolution, runner provisioning or authorization is implemented. Future execution work requires threat modeling, policy enforcement, explicit approval, isolation and lifecycle controls.
