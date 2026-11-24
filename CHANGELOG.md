# Changelog

## Unreleased

### Added
- Declarative Policy & Trust assessment for UPS v1 plans: max job count, forbidden executable and required capability rules.
- Distinct block, human-review-required and warning findings; assessment explicitly does not authorize execution.
- Policy validation and tests for outcomes, malformed rules, and input immutability.

### Security
- Policy evaluation is assessment-only; no approvals, secrets, runner contact or command execution.

### Added
- Deterministic, analysis-only Pipeline Intelligence Engine for UPS v1 dependency graphs.
- Stable topological ordering, structural critical path, parallel waves, independent/terminal jobs, fan-out and actionable diagnostics.
- Tests for DAGs, cycles, missing/duplicate dependencies, malformed inputs, deterministic output and input immutability.

### Security
- Static graph analysis only; no command execution, runner communication/reservation, authorization, secrets or AI calls.

### Added
- Draft Universal Pipeline Specification v1: JSON Schema, example pipeline, portability and safety invariants.
- Initial ecosystem fixture validation matrix with honest planned status and acceptance criteria.
- Tree View nativa no Explorer com atalhos organizados por workspace, análise, execução e relatórios.
- Indicador de localização do motor PowerShell e atalhos para inicializar e descobrir projetos.
- Guia de instalação, configuração, comandos, testes e segurança da extensão VS Code.
- Estrutura de responsabilidades de Luca (mantenedor e base técnica), Higor (gerenciamento e validação) e Arthur (design e layout nas fases futuras).
- Adaptador PowerShell com allowlist de comandos, argumentos separados, timeout configurável, cancelamento e captura limitada de saída.
- Execução local de pipelines protegida por geração de plano e aprovação modal explícita.

### Security
- Nenhuma execução remota, dispatch de workflow GitHub ou integração de IA é habilitada nesta etapa.

## [0.5.0-dev] - 2026-11-16
- Adicionada licença MIT com aviso de copyright.
- Atualizadas as instruções de distribuição para refletir os termos da licença.
- Corrigida a estrutura do executor e removida duplicação/inconsistência no módulo de empacotamento de artefatos.
- Reforçadas exclusões do ZIP de código-fonte para diretórios de dependências, caches, credenciais comuns e links simbólicos.
- Corrigido o workflow de release para gerar e anexar o pacote ZIP sem linhas YAML escapadas incorretamente.
- Adicionado guia de distribuição beta, requisitos de avaliação, segurança e critérios de saída da beta.
- Adicionados modelos de issue para relatos de bugs e sugestões.
- Adicionada política de reporte responsável de vulnerabilidades.

## [0.5.0-dev] - 2026-11-14
- Expandido o planejamento e executor para Go (vet/test/build).
- Adicionado Rust (cargo fmt check/test/build).
- Adicionado C#/.NET (dotnet format/test/build).
- Adicionada Java via Maven e Gradle (validate/check, test, package/build).
- Adicionada etapa build para JavaScript/TypeScript via script npm.
- Relatórios identificam versão 0.5.0-dev.
- CLI aceita -ProjectPath e mantém configuração, planos e relatórios dentro do projeto-alvo.
- Adicionadas fixtures reais de Go, Rust, .NET e Maven e job de integração que executa check/test/build e valida os relatórios JSON.

## [0.4.0-dev] - 2026-11-14
- Runner de processos com argumentos separados, timeout e captura stdout/stderr.
- Executor allowlisted, aprovação explícita e relatórios JSON.

## Unreleased — UPS Execution Plan Generator
- Added deterministic UPS v1 planning, dependency waves, capability summary and explanatory rationale.
- Plan-only; no process execution.
- Added planner tests.

## Unreleased — Capability Resolution Engine
- Added deterministic, analysis-only runner capability matching, inventory validation, and unresolved-job reasons.
- Added defensive plan/job/runner validation, unknown-status diagnostics, and expanded edge-case tests.
- No runner execution, provisioning, authorization or secret handling.
