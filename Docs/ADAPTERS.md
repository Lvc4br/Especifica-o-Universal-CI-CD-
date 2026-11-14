# Matriz de adaptadores

A matriz descreve o que o planejador e o executor reconhecem hoje. Implementado não significa validado em todos os sistemas operacionais ou formatos de projeto. O suporte só deve ser anunciado como validado após fixtures reais e execução repetível.

| Ecossistema | Etapas reconhecidas | Pré-requisitos/limitações |
|---|---|---|
| Python | Ruff, pytest, python -m build | Build somente com seção [build-system] em pyproject.toml |
| JavaScript | npm lint/test/build | Cada script precisa existir em package.json |
| TypeScript | npm lint/test/build | Usa scripts npm do projeto; compilador/framework depende do manifesto |
| Go | vet, test, build | Usa go.mod e padrão ./... |
| Rust | fmt, test, build | Cargo workspace |
| C#/.NET | format, test, build | Projetos/soluções simples; seleção multi-solução pendente |
| Java/Maven | validate, test, package | Usa Maven global; mvnw ainda não integrado |
| Java/Gradle | check, test, build | Usa Gradle global; gradlew ainda não integrado |
| PHP | Composer lint/test/validate | lint e test só quando scripts estão definidos no composer.json |
| Ruby | RuboCop, RSpec, bundle check | Depende de Gemfile e gems instaladas |
| Lua | Luacheck, Busted | Build genérico não definido |
| C/C++ | CMake configure/build, CTest | Requer CMakeLists.txt e testes registrados |
| Kotlin | Gradle check/test/build | Requer build.gradle(.kts); wrappers pendentes |
| Swift | swift package diagnose/test/build | Requer Package.swift; normalmente runner macOS |
| Dart | analyze/test/compile | Compilação executável só quando bin/main.dart existe |
| HTML | HTMLHint | Requer htmlhint no PATH |
| CSS | Stylelint | Requer stylelint no PATH |
| SQL | SQLFluff lint | Não executa testes contra banco; banco isolado ainda pendente |

## Segurança

- Gitleaks: busca de segredos.
- Trivy: vulnerabilidades e misconfigurações.
- Semgrep: análise estática.
- OSV-Scanner: vulnerabilidades conhecidas nas dependências.

## Entrega

- ZIP local de código-fonte em .cicd/artifacts/.
- O ZIP exclui diretórios de dependências, caches, .cicd, diretórios de credenciais comuns e arquivos com extensões típicas de chaves/certificados.
- Publicação remota, assinatura de artefatos e deploy ainda não fazem parte do executor.

## Maturidade

Todos os adaptadores adicionais implementados recentemente (PHP, Ruby, Lua, C/C++, Kotlin, Swift, Dart, HTML, CSS e SQL) ainda precisam de fixtures e validação final. Não use a lista como garantia de compatibilidade para qualquer projeto.
