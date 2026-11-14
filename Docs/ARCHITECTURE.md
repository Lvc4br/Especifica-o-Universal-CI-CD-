# Arquitetura

```text
cicd.ps1
  |-- Core/Logger.ps1
  |-- Core/Result.ps1
  |-- Core/Process.ps1
  |-- Modules/Config/Config.ps1
  |-- Modules/Detector/Detector.ps1
  |-- Modules/Engine/Plan.ps1
  |-- Modules/Engine/Executor.ps1
```

## Fluxo
1. `init`: cria configuração sem sobrescrever.
2. `validate-config`: valida estrutura e tipos básicos.
3. `detect`: identifica tecnologias sem executar o projeto.
4. `plan`: gera plano declarativo e verifica ferramentas.
5. `run`: simula por padrão; `run -Approve` executa adaptadores reconhecidos.
6. Relatórios JSON são gravados em `.cicd/reports/`. Com `pipeline.delivery`, um ZIP de código-fonte é criado em `.cicd/artifacts/` após aprovação. Etapas de segurança podem executar Gitleaks e Trivy após aprovação explícita.

## Processo externo
`Core/Process.ps1` usa `System.Diagnostics.Process`, `UseShellExecute = false` e `ArgumentList`. Captura stdout/stderr, exit code, timestamps e duração, com timeout e tentativa de encerrar a árvore de processos.

## Allowlist atual
- `python-lint`: `ruff check .`
- `python-tests`: `pytest`
- `js-lint`: `npm run lint` (somente quando declarado no package.json)
- `js-tests`: `npm test` (somente quando declarado no package.json)

O executor não lê comandos arbitrários do plano/configuração. Scripts npm são código do projeto e serão executados após aprovação explícita. PHP/Composer, Ruby/Bundler, Lua, C/C++/CMake, Kotlin/Gradle, Swift e Dart possuem adaptadores iniciais com comandos fixos; a existência do adaptador não significa validação real da integração.

## Artefatos e entrega\nA etapa delivery cria um ZIP local do código-fonte, excluindo diretórios de dependências, builds, caches e `.cicd`. Isso não publica o artefato nem realiza deploy.\n\n## Limites
Detecção é heurística. O executor não isola processos em sandbox. Builds, segurança, cobertura, bancos de dados e delivery ainda não possuem adaptadores. O validador ainda não usa motor JSON Schema.
