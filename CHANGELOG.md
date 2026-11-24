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
- Adicionado Java via Maven e Gradle (validate/check, test, package/build).
- Adicionada etapa build para JavaScript/TypeScript via script npm.
- Relatórios identificam versão 0.5.0-dev.
- CLI aceita -ProjectPath e mantém configuração, planos e relatórios dentro do projeto-alvo.
- Adicionadas fixtures reais de Go, Rust, .NET e Maven e job de integração que executa check/test/build e valida os relatórios.
- Smoke tests ampliados para verificar detecção/planejamento e allowlists desses ecossistemas.

## [0.4.0-dev] - 2026-11-14
- Runner de processos com argumentos separados, timeout e captura stdout/stderr.
- Executor allowlisted, aprovação explícita e relatórios JSON.

## 0.5.0-dev — integração Python e JavaScript

- Adicionado build de pacotes Python por `python -m build`, condicionado à presença de `[build-system]` em `pyproject.toml`.
- Removido o comportamento permissivo `npm --if-present`; scripts npm inexistentes são `NOT_APPLICABLE`.
- Adicionadas fixtures com testes e builds reais para Python e JavaScript.
- CI agora executa pipelines completos dos dois ecossistemas e valida os resultados no relatório JSON.
- Smoke tests cobrem a detecção de scripts npm ausentes e o planejamento do build Python.

