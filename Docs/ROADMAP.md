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
- [ ] Suporte a wrappers (mvnw/gradlew), soluções .NET e monorepos.
- [x] Validação estrutural expandida, com tipos e propriedades adicionais restritos.\n- [ ] Validação integral usando motor JSON Schema.
- [ ] Testes unitários e integração dedicados por módulo.
- [ ] Cobertura consolidada, relatórios Markdown/HTML e histórico.
- [ ] Cancelamento interativo e limites de memória/CPU.
- [ ] Sandbox real para projetos não confiáveis.

## Adaptadores iniciais adicionados nesta etapa\n- [x] PHP/Composer (lint/test/build via scripts e validação do manifesto).\n- [x] Ruby/Bundler (RuboCop/RSpec/check).\n- [x] Lua (Luacheck/Busted).\n- [x] C/C++ com CMake/CTest.\n- [x] Kotlin via Gradle.\n- [x] Swift Package Manager.\n- [x] Dart (analyze/test/compile).\n\nEsses adaptadores estão implementados no planejador/executor, mas ainda não foram validados por fixtures reais.\n\n## Adaptadores ainda ausentes
- [ ] PHP/PHPUnit/PHPStan.
- [ ] Ruby/RSpec/RuboCop.
- [ ] Lua.
- [x] HTML: validação inicial com HTMLHint.\n- [x] CSS: lint inicial com Stylelint.\n- [ ] Acessibilidade automatizada e auditorias visuais.
- [x] SQL lint inicial com SQLFluff.\n- [ ] SQL com banco configurado e fixtures isoladas.
- [x] Varredura inicial de segredos com Gitleaks.\n- [x] Varredura inicial de vulnerabilidades e misconfigurações com Trivy.\n- [ ] SAST específico por linguagem e verificação de licenças.
- [x] Empacotamento local do código-fonte em ZIP com exclusões.\n- [ ] Publicação remota, cache, paralelismo e deploy com aprovação separada.

## Critério de suporte
Uma linguagem só será considerada validada após execução real de fixture reproduzível, em Windows e Linux quando aplicável. A existência de um adaptador e testes de contrato não prova, por si só, compatibilidade integral com todo projeto daquele ecossistema.
