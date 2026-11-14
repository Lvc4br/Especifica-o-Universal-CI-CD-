# Universal CI/CD

Orquestrador modular de CI/CD para projetos de diferentes linguagens. Núcleo PowerShell 7.2+, multiplataforma, com detecção, planejamento, execução aprovada, timeout, captura de saída e relatórios JSON.

> Estado: 0.5.0-dev. Adaptadores iniciais para Python, JavaScript/TypeScript, Go, Rust, C#/.NET e Java (Maven/Gradle). A maturidade varia por ecossistema; consulte as limitações.

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
| Python | Ruff | pytest | Não implementado |
| JavaScript/TypeScript | npm lint (opcional) | npm test | npm build (opcional) |
| Go | go vet | go test ./... | go build ./... |
| Rust | cargo fmt --check | cargo test --workspace | cargo build --workspace |
| C#/.NET | dotnet format --verify-no-changes | dotnet test | dotnet build |
| Java/Maven | mvn validate | mvn test | mvn package |
| Java/Gradle | gradle check | gradle test | gradle build |

Ferramentas devem estar instaladas no PATH. Java exige `pom.xml` ou `build.gradle(.kts)`. Wrappers mvnw/gradlew, soluções .NET multi-projeto e monorepos ainda precisam de suporte dedicado.

## Segurança e limites
- Detecção e planejamento não executam código.
- Aprovar npm, Maven, Gradle, Cargo, Go ou dotnet pode executar scripts/plugins do projeto. Revise manifests e dependências.
- O executor não é sandbox. Para código não confiável, use VM/contêiner descartável sem credenciais.
- Mascaramento de segredos é heurístico.
- Cobertura consolidada, scanners de segurança, banco de dados, cache, paralelismo, isolamento de recursos e deploy ainda não estão implementados.
