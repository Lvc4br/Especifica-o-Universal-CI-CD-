# Matriz de linguagens e ecossistemas

**Interpretação importante:** motor escrito em PowerShell; linguagens-alvo são testadas/checadas/buildadas por ferramentas externas, acionadas por adaptadores. A matriz indica comandos planejados ou inicializados no código, não compatibilidade garantida. Fixture real, ambiente e maturidade variam.

| Ecossistema | Check / lint | Testes | Build / validação |
|---|---|---|---|
| Python | Ruff | pytest | python -m build (quando build-system declarado) |
| JavaScript / TypeScript | npm run lint, se script existe | npm test, se script existe | npm run build, se script existe |
| Go | go vet | go test ./... | go build ./... |
| Rust | cargo fmt --check | cargo test --workspace | cargo build --workspace |
| C# / .NET | dotnet format --verify-no-changes | dotnet test | dotnet build |
| Java / Maven | mvn validate | mvn test | mvn package |
| Java / Gradle | gradle check | gradle test | gradle build |
| PHP / Composer | scripts declarados / lint | scripts declarados | composer validate |
| Ruby | RuboCop | RSpec | bundle check |
| Lua | Luacheck | Busted | — |
| C / C++ | CMake configure | CTest | CMake build |
| Kotlin | Gradle check | Gradle test | Gradle build |
| Swift | swift package diagnose | swift test | swift build |
| Dart | dart analyze | dart test | dart compile (quando aplicável) |
| HTML | HTMLHint | — | — |
| CSS | Stylelint | — | — |
| SQL | SQLFluff | — | — |

## Limitações e pré-requisitos
- Scripts ausentes são NOT_APPLICABLE, não sucesso fictício.
- Toolchains e executáveis precisam estar instalados e no PATH.
- npm, Gradle, Maven, Cargo, dotnet e outros sistemas podem executar código de build ou plugins; revise e aprove conscientemente.
- Wrappers Maven/Gradle, seleção de soluções .NET, cobertura consolidada, fixtures abrangentes Windows/OS e sandbox permanecem gaps.
- HTML/CSS/SQL são checks iniciais; não implicam testes funcionais completos.
- Suporte declarado é heurístico. A fixture real e CI determinam a maturidade.
- Executor local não é sandbox. Para código de terceiros, use ambiente isolado e sem credenciais.
