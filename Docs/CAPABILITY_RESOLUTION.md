# Capability Resolution Engine

## Purpose
Resolve job requirements in a valid UPS plan against a declared runner inventory. This module is pure analysis and does not contact runners, provision infrastructure, execute commands, authorize work or access secrets.

## Runner inventory
Each runner declaration has a unique ID, capability strings and a status (`online`, `offline`, `unknown`). Labels are reserved for future filtering.

## Resolution
A runner is compatible only if it is declared online and contains every required capability for a job. Candidate IDs and selection are deterministic: candidates are sorted lexically and the first is selected. Jobs with no candidate remain unresolved, with explanatory reasons. This is not a scheduler and does not reserve runner capacity.

## API
`resolvePlanCapabilities(plan, runners)` returns a validation result and resolution report. Input must be a valid plan-only execution plan. Duplicate IDs and malformed inventory are rejected.

## Safety boundary
Capability match is not permission. No network access, runner handshake, process execution, secret resolution, runner provisioning or authorization is implemented. Future execution work requires threat modeling, policy, isolation, approval and lifecycle controls.
