# Universal CI/CD

Orquestrador modular de CI/CD para projetos de diferentes linguagens. Núcleo PowerShell 7.2+, multiplataforma, com detecção, planejamento, execução aprovada, timeout, captura de saída e relatórios JSON.

> Estado: 0.5.0-dev. Adaptadores iniciais para Python, JavaScript/TypeScript, Go, Rust, C#/.NET, Java (Maven/Gradle), PHP, Ruby, Lua, C/C++, Kotlin, Swift, Dart, HTML, CSS e SQL. A maturidade varia por ecossistema; consulte a matriz em Docs/ADAPTERS.md e as limitações.

## Uso em qualquer diretório
O script pode ficar em uma pasta central e operar em outro projeto:

```powershell
pwsh ./cicd.ps1 init -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 validate-config -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 detect -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 plan -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 run -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 run -ProjectPath "D:\Projetos\MeuApp" -Approve
```

Se `-ProjectPath` for omitido, o diretório de trabalho atual será usado. Sem `-Approve`, a execução é apenas simulada. Relatórios ficam no projeto-alvo em `.cicd/reports/`.

## Adaptadores iniciais
| Ecossistema | Check | Teste | Build |
|---|---|---|---|
| Python | Ruff | pytest | `python -m build` (quando `pyproject.toml` declara `[build-system]`) |
| JavaScript/TypeScript | `npm run lint` (se declarado) | `npm test` (se declarado) | `npm run build` (se declarado) |
| Go | go vet | go test ./... | go build ./... |
| Rust | cargo fmt --check | cargo test --workspace | cargo build --workspace |
| C#/.NET | dotnet format --verify-no-changes | dotnet test | dotnet build |
| Java/Maven | mvn validate | mvn test | mvn package |
| Java/Gradle | gradle check | gradle test | gradle build |
| PHP | Composer scripts (lint) | Composer scripts (test) | composer validate |
| Ruby | RuboCop | RSpec | bundle check |
| Lua | Luacheck | Busted | Não aplicável |
| C/C++ | CMake configure | CTest | CMake build |
| Kotlin | Gradle check | Gradle test | Gradle build |
| Swift | swift package diagnose | swift test | swift build |
| Dart | dart analyze | dart test | dart compile (quando há bin/main.dart) |
| HTML | HTMLHint | — | — |
| CSS | Stylelint | — | — |
| SQL | SQLFluff | — | — |

Scripts npm ausentes são marcados como `NOT_APPLICABLE`; eles nunca são tratados como comandos executados com sucesso. O build Python só é planejado para pacotes com seção `[build-system]` no `pyproject.toml`. Ferramentas devem estar instaladas no PATH. Java exige `pom.xml` ou `build.gradle(.kts)`. A descoberta e execução de projetos em workspaces/monorepos está disponível por `discover-projects` e `run-workspaces`. Wrappers `mvnw`/`gradlew` e seleção de soluções .NET específicas ainda precisam de suporte dedicado.

## Segurança e limites
- Detecção e planejamento não executam código.
- Aprovar npm, Maven, Gradle, Cargo, Go ou dotnet pode executar scripts/plugins do projeto. Revise manifests e dependências.
- O executor não é sandbox. Para código não confiável, use VM/contêiner descartável sem credenciais. O ZIP local exclui diretórios comuns de dependências, caches e nomes de arquivos de credenciais/segredos; revise o conteúdo antes de distribuir.
- Mascaramento de segredos é heurístico.
- Scanners Gitleaks, Trivy, Semgrep e OSV-Scanner estão disponíveis via `pipeline.security`. `pipeline.delivery` cria um pacote ZIP local do código-fonte; publicação remota e deploy ainda não estão implementados. Cobertura consolidada, banco de dados, cache, paralelismo e isolamento de recursos continuam pendentes.


## Integrações de CI externas

Modelos iniciais:
- GitHub Actions: `.github/workflows/ci.yml`
- GitLab CI: `.gitlab-ci.yml`
- Azure Pipelines: `azure-pipelines.yml`
- Jenkins: `Jenkinsfile`

Os modelos pressupõem PowerShell 7 e executam o pipeline com aprovação no próprio runner. Ajuste permissões, segredos, ambientes e regras de aprovação conforme a política da organização antes de usar em produção. Consulte [Docs/INTEGRATIONS.md](Docs/INTEGRATIONS.md).


## Distribuição e beta

O projeto está em desenvolvimento e ainda não deve ser usado em produção. Consulte [DISTRIBUTION.md](DISTRIBUTION.md) para requisitos, instalação de avaliação, segurança, feedback e critérios para uma futura beta. Releases empacotadas são artefatos de avaliação, não uma declaração de estabilidade.


## Licença

Este projeto é distribuído sob a licença [MIT](LICENSE). Consulte o arquivo `LICENSE` para os termos completos.
