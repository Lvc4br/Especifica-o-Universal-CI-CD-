# Changelog

## Unreleased

### Added
- Criada a fundação monorepo para a extensão VS Code e o GitHub App.
- Adicionados contratos TypeScript compartilhados para etapas, execuções e saúde das integrações.
- Adicionado comando da extensão VS Code para consultar o status do motor PowerShell existente.
- Adicionados handlers observadores do Probot para eventos de Pull Request e instalação.

### Security
- Os handlers iniciais do GitHub App são somente observadores; não executam workflows, criam checks ou fazem deploy.
- A extensão consulta apenas o status do motor nesta etapa.


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
