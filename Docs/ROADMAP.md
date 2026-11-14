# Roadmap

## Concluído
- [x] CLI, configuração, validação estrutural, detecção e plano JSON.
- [x] Executor de processos sem shell intermediário, aprovação explícita e timeout.
- [x] Relatórios JSON, stdout/stderr, exit code e duração.
- [x] Adaptadores iniciais Python e JavaScript/TypeScript.
- [x] Adaptadores iniciais Go: vet, test e build.
- [x] Adaptadores iniciais Rust: format check, test e build.
- [x] Adaptadores iniciais C#/.NET: format check, test e build.
- [x] Adaptadores iniciais Java Maven/Gradle: validate/check, test e package/build.
- [x] Testes de contrato para detecção/planejamento e mapeamento de comandos desses ecossistemas.
- [x] CLI pode operar em diretório externo com -ProjectPath, separando ferramenta e projeto-alvo.

## Próximas etapas prioritárias
- [x] Fixtures reais de Go, Rust, .NET e Maven executadas pelo pipeline em CI Ubuntu.
- [ ] Expandir validação real para Windows, Gradle e os demais ecossistemas.
- [x] Descoberta e execução individual de projetos em workspaces/monorepos.
- [ ] Wrappers (mvnw/gradlew) e seleção de soluções .NET específicas.
- [x] Validação estrutural expandida, com tipos e propriedades adicionais restritos.
- [ ] Validação integral usando motor JSON Schema.
- [ ] Testes unitários e integração dedicados por módulo.
- [ ] Cobertura consolidada, relatórios Markdown/HTML e histórico.
- [ ] Cancelamento interativo e limites de memória/CPU.
- [ ] Sandbox real para projetos não confiáveis.

## Adaptadores iniciais adicionados nesta etapa
- [x] PHP/Composer (lint/test/build via scripts e validação do manifesto).
- [x] Ruby/Bundler (RuboCop/RSpec/check).
- [x] Lua (Luacheck/Busted).
- [x] C/C++ com CMake/CTest.
- [x] Kotlin via Gradle.
- [x] Swift Package Manager.
- [x] Dart (analyze/test/compile).

Esses adaptadores estão implementados no planejador/executor, mas ainda não foram validados por fixtures reais.

## Adaptadores ainda ausentes
- [ ] PHP/PHPUnit/PHPStan.
- [ ] Ruby/RSpec/RuboCop.
- [ ] Lua.
- [x] HTML: validação inicial com HTMLHint.
- [x] CSS: lint inicial com Stylelint.
- [ ] Acessibilidade automatizada e auditorias visuais.
- [x] SQL lint inicial com SQLFluff.
- [ ] SQL com banco configurado e fixtures isoladas.
- [x] Varredura inicial de segredos com Gitleaks.
- [x] Varredura inicial de vulnerabilidades e misconfigurações com Trivy.
- [x] SAST inicial com Semgrep.
- [x] Verificação de vulnerabilidades conhecidas com OSV-Scanner.
- [ ] SAST específico por linguagem e verificação de licenças.
- [x] Empacotamento local do código-fonte em ZIP com exclusões.
- [ ] Publicação remota, cache, paralelismo e deploy com aprovação separada.

## Critério de suporte
Uma linguagem só será considerada validada após execução real de fixture reproduzível, em Windows e Linux quando aplicável. A existência de um adaptador e testes de contrato não prova, por si só, compatibilidade integral com todo projeto daquele ecossistema.
