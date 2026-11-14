# Universal CI/CD

Orquestrador modular de CI/CD para projetos de diferentes linguagens. Núcleo PowerShell 7.2+, multiplataforma, com detecção, planejamento, execução aprovada, timeout, captura de saída e relatórios JSON.

> Estado: 0.5.0-dev. Adaptadores iniciais para Python, JavaScript/TypeScript, Go, Rust, C#/.NET e Java via Maven/Gradle. A maturidade varia por ecossistema; consulte as limitações abaixo.

## Início rápido
```powershell
pwsh ./cicd.ps1 init
# Edite .cicd/config.json para habilitar check/test/build.
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 run
pwsh ./cicd.ps1 run -Approve
pwsh ./cicd.ps1 run -Approve -TimeoutSeconds 900
```
Sem `-Approve`, o comando apenas simula. Os relatórios ficam em `.cicd/reports/`.

## Adaptadores iniciais
| Ecossistema | Check | Teste | Build |
|---|---|---|---|
| Python | Ruff | pytest | Ainda não implementado |
| JavaScript/TypeScript | npm lint (opcional) | npm test | npm build (opcional) |
| Go | go vet | go test ./... | go build ./... |
| Rust | cargo fmt --check | cargo test --workspace | cargo build --workspace |
| C#/.NET | dotnet format --verify-no-changes | dotnet test | dotnet build |
| Java/Maven | mvn validate | mvn test | mvn package |
| Java/Gradle | gradle check | gradle test | gradle build |

Ferramentas devem estar instaladas e disponíveis no PATH. Java exige `pom.xml` ou `build.gradle(.kts)`. A seleção atual usa executáveis globais; wrappers `mvnw`, `gradlew` e soluções com múltiplos projetos ainda precisam de tratamento dedicado.

## Recursos do núcleo
- CLI, configuração sem sobrescrita, validação estrutural, detecção e plano JSON.
- Processo externo sem shell intermediário, argumentos separados e timeout.
- Allowlist estática e aprovação explícita.
- Captura de stdout/stderr, exit code, duração e relatório JSON.
- Mascaramento heurístico de padrões comuns de segredos.

## Segurança e limitações
- `detect` e `plan` não executam código.
- Aprovar npm, Maven, Gradle, Cargo, Go ou dotnet pode executar scripts, plugins e código de build do projeto. Revise manifests e dependências.
- O executor não é sandbox. Use VM/contêiner descartável, sem credenciais, para código não confiável.
- A redação de segredos é heurística e não garante remover todos os dados sensíveis.
- Não há ainda isolamento de recursos, cache, paralelismo, cobertura consolidada, scanners de segurança, banco de dados ou deploy.
- Etapas ignoradas/bloqueadas/não implementadas nunca devem ser interpretadas como aprovadas.

## Documentação
[Arquitetura](Docs/ARCHITECTURE.md) · [Roadmap](Docs/ROADMAP.md) · [Segurança](Docs/SECURITY.md) · [Comandos](Docs/COMMANDS.md)
