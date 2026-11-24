# Orchestration primitives

This module provides pure job lifecycle logic and a storage interface. It does **not** implement a durable database, dispatch workflow, runner, or GitHub API integration.

- Delivery claiming must be atomic and durable in a real storage adapter.
- A production adapter must preserve delivery IDs, payload digest and receipt time; replay detection should be keyed by GitHub's delivery ID.
- Jobs are keyed by repository, PR number and head SHA so superseded revisions are distinguishable.
- State transitions are guarded; terminal states cannot be reopened.
- The runner must re-check the PR head before acting on results and discard stale results.
- The store must be durable and shared across application instances before webhook processing is enabled.
