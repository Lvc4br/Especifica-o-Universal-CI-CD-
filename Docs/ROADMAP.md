# Roadmap

## Concluído
- [x] CLI, configuração, validação estrutural, detecção e plano JSON.
- [x] Executor de processos sem shell intermediário.
- [x] Allowlist de adaptadores e aprovação explícita.
- [x] Timeout, captura stdout/stderr, exit code e duração.
- [x] Relatório JSON e mascaramento heurístico de segredos.
- [x] Testes do runner: sucesso, falha, stderr, timeout, redação e allowlist.

## Próximas etapas prioritárias
- [ ] Validação integral com motor JSON Schema.
- [ ] Descoberta de versões e validação de dependências.
- [ ] Testes unitários/integrados por módulo e fixtures de projetos.
- [ ] Relatórios Markdown, histórico e sumarização.
- [ ] Cancelamento interativo e limites de memória/CPU.
- [ ] Sandbox real para projetos não confiáveis.

## Adaptadores
- [x] Python: Ruff e pytest (básico).
- [x] JavaScript/TypeScript: npm lint/test (básico).
- [ ] Java: Maven/Gradle.
- [ ] C#: dotnet test/build.
- [ ] Go: go test/build.
- [ ] Rust: cargo test/build.
- [ ] PHP, Ruby, Lua, HTML/CSS.
- [ ] SQL com banco configurado.
- [ ] Segurança: SAST, dependências, segredos e licenças.

## Build, cobertura e entrega
- [ ] Build e manifesto de artefatos.
- [ ] Cobertura com thresholds.
- [ ] Integração/e2e e banco de dados.
- [ ] Cache e paralelismo controlado.
- [ ] GitHub Actions reutilizável e deploy com aprovação separada.

## Critério
Uma linguagem só será anunciada como suportada após adaptador real, fixture reproduzível, testes multiplataforma e documentação. Etapas ignoradas/não implementadas nunca serão aprovadas.
