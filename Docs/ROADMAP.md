# Roadmap

## Bootstrap
- [x] Repositório, CLI, documentação e CI Windows/Linux.
- [x] Testes smoke iniciais.

## Core e configuração
- [x] Módulos Core, Config e Detector.
- [x] Logger e contrato de resultado.
- [x] Criação de configuração sem sobrescrita.
- [x] Validação estrutural inicial.
- [x] Documento JSON Schema.
- [ ] Validação completa com motor JSON Schema.

## Detecção e planejamento
- [x] Identificação inicial de linguagens por evidências.
- [x] Inspeção da disponibilidade de ferramentas no PATH.
- [x] Plano JSON não executável.
- [x] Estados de planejamento separados dos estados de execução.
- [ ] Detectar versões de ferramentas e gerenciadores de pacotes.
- [ ] Adicionar adaptadores de mais ecossistemas.

## Engine de execução
- [ ] Executor isolado de processos externos.
- [ ] Allowlist de executáveis e argumentos.
- [ ] Aprovação explícita por etapa.
- [ ] Timeout, cancelamento, captura de stdout/stderr.
- [ ] Registro de duração, exit code e artefatos.

## Adaptadores
- [ ] Python: Ruff e pytest.
- [ ] JavaScript/TypeScript: ESLint e testes declarados no package manifest.
- [ ] Java: Maven/Gradle.
- [ ] HTML/CSS e Lua: validadores específicos.
- [ ] SQL: validação estática e testes com banco configurado.
- [ ] C#, Go e Rust.

## Relatórios, segurança e entrega
- [ ] Relatórios JSON/Markdown de execução.
- [ ] Verificação de segredos e vulnerabilidades.
- [ ] Build e manifesto de artefatos.
- [ ] GitHub Actions reutilizável e releases.

## Critério de conclusão
Marcar uma tarefa como concluída exige implementação, teste reproduzível e documentação. Detecção e planejamento nunca serão apresentados como testes ou builds executados.