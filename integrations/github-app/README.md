# Universal CI/CD GitHub App

## Current behavior

The Probot entry point observes these events:

- `pull_request.opened`
- `pull_request.synchronize`
- `installation.created`

The handlers only log repository, pull request, head SHA, and installation metadata. They do not execute repository code, dispatch workflows, create deployments, or write comments.

Probot's webhook adapter is responsible for validating GitHub webhook signatures. Keep the webhook secret configured through the deployment secret manager; never commit it or log it.

## Check Run foundation

`src/check-runs.ts` exposes a pure payload builder for a future queued Check Run. It validates the full 40-character commit SHA and positive safe-integer identifiers, normalizes the SHA, and generates a deterministic correlation identifier.

The helper intentionally does not call the GitHub API. Before wiring it into webhook handlers, the integration must have:

1. Durable webhook-delivery deduplication (the correlation identifier is not an idempotency guarantee).
2. A persistent job state machine with retry and cancellation semantics.
3. A trusted execution provider using isolated, ephemeral runners.
4. A lifecycle that updates or completes each Check Run and handles stale head SHAs.
5. Explicit GitHub App permission review. Add `checks: write` only when Check Run creation is enabled.

## Security boundary

Never execute code from a pull request in the GitHub App web process. Do not check out or run untrusted PR content on a persistent application host. The future runner must be isolated and must receive only short-lived, narrowly scoped credentials.

AI remains optional and cannot approve execution or initiate deployment.
