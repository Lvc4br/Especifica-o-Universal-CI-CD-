# Monorepo architecture

## Goal

Keep the existing PowerShell engine independent while adding two consumers:
- `integrations/vscode`: a Visual Studio Code extension for local project workflows.
- `integrations/github-app`: a Probot-based GitHub App for repository events and future Checks integration.
- `shared/contracts`: transport-neutral TypeScript contracts shared by integrations.

## Dependency direction

```text
VS Code extension ─────┐
                       ├── shared/contracts
GitHub App ────────────┘

VS Code extension ──> PowerShell CLI (local process boundary)
GitHub App ─────────> GitHub API (future checks/workflow orchestration)
```

The PowerShell engine remains the source of truth for detection, planning, adapters and local execution. TypeScript integrations must not duplicate pipeline logic.

## First milestone

- Root npm workspaces and shared TypeScript configuration.
- A VS Code command that locates `cicd.ps1` and invokes the existing `status` command through PowerShell 7.
- A Probot GitHub App entry point that observes pull request and installation events without mutating repositories.
- Initial shared pipeline result and integration health contracts.

## Security boundaries

- Never execute pull request code inside the GitHub App server.
- Do not store GitHub private keys, webhook secrets, access tokens or local `.env` files in the repository.
- Request only the GitHub App permissions required by a feature, and document each permission before enabling it.
- The initial GitHub App handlers are read-only observers. Check runs, workflow dispatch, comments and deployments are intentionally deferred.
- The VS Code extension invokes only the existing CLI status command in this milestone. Future execution commands must preserve the engine's explicit approval model.
- The PowerShell engine is not a sandbox. Untrusted project code must run on isolated, ephemeral infrastructure without secrets.

## Development

Requires Node.js 20+, npm workspaces and PowerShell 7.2+ for the VS Code-to-engine command.

```bash
npm install
npm run typecheck
npm run build
```

The GitHub App package exports a Probot app function; hosting, app registration, webhook configuration and deployment are separate operational steps and are not included in this scaffold.
