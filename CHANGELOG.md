# Changelog

## Unreleased

### Added
- Initial monorepo foundation for the VS Code extension and GitHub App.
- Shared TypeScript contracts for pipeline stages, run summaries and integration health.
- VS Code command to invoke the existing PowerShell engine status command.
- Read-only Probot event handlers for pull request and installation events.

### Security
- GitHub App event handlers are observers only; no repository mutations, workflow dispatches or deployments are performed.
- The VS Code integration does not bypass the engine's explicit approval model.

## 0.5.0-dev

See repository history for prior changes.
