# Changelog

## Unreleased

### Added
- VS Code 0.9.0: navegação do DAG UPS com rótulos de ondas, busca por nome/ID e zoom entre 50% e 200%, sem alterar o plano ou executar jobs.

### Added
- VS Code 0.8.0: painel gráfico interativo para DAG UPS v1, com ondas, arestas de dependência, caminho crítico estrutural, seleção de jobs e diagnósticos; atalho integrado à seção Inteligência de pipeline do dashboard.
- Visualização alimentada exclusivamente pelo UPS Validator, Execution Plan Generator e Pipeline Intelligence compartilhados; sem execução, runners ou telemetria simulada.
- UPS v1 schema e runtime validator alinhados para nomes/executáveis não vazios, IDs de jobs, unicidade de `needs`/`runsOn` e limite máximo de 500 jobs e 100 steps por job; testes de paridade e fixture end-to-end adicionados.
- VSIX agora verifica explicitamente a inclusão do runtime de `@universal-cicd/contracts` no pacote final.
- Testes de segurança para CSP restritiva, ausência de assets remotos, renderização por text nodes e navegação por teclado.
- Comando VS Code UPS Inspector: seleciona um documento UPS v1, valida pelos contratos compartilhados e apresenta DAG, ondas, caminho crítico estrutural e diagnósticos em modo somente leitura.
- Limites defensivos do inspector: arquivo até 1 MB, até 500 jobs e relatório até 100.000 caracteres; nenhuma etapa é executada.
- Extensão VS Code 0.7.0 passa a consumir `@universal-cicd/contracts`; CI compila os contratos antes do typecheck e inclui a dependência interna no VSIX.
- Dashboard VS Code atualiza o inspector automaticamente quando `.cicd/plans/latest-plan.json` é criado, alterado ou removido, inclusive por processos externos/CLI.
- Dashboard VS Code lê o último plano PowerShell salvo em `.cicd/plans/latest-plan.json` e apresenta tecnologias, etapas, status e motivos.
- Normalização defensiva do snapshot: schema `1.0`, limite de tamanho/quantidade de etapas, strings limitadas e estados desconhecidos tratados sem quebrar a interface.
- Testes automatizados para planos válidos/inválidos, dados excessivos e texto não confiável.

### Security
- O painel lê somente o arquivo de plano esperado dentro do workspace, rejeita symlinks/paths fora da raiz e limita a leitura a 1 MB.
- Campos do plano são renderizados via `textContent`; nenhum dado do arquivo é interpretado como HTML.


### Added
- First visual VS Code dashboard preview with workspace and PowerShell engine status, responsive UI, and shortcuts for existing local commands.
- Secure webview message allowlist and nonce-based Content Security Policy; no remote assets or simulated GitHub/runner telemetry.

### Security
- Opening the dashboard does not execute pipelines; operational actions continue through existing guarded commands.

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
