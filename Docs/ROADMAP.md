# Roadmap

## Etapa 0 — Bootstrap

- [x] Criar repositório e documentação inicial.
- [x] Criar CLI PowerShell mínima.
- [x] Implementar version, init, detect e status básicos.
- [ ] Validar execução em PowerShell 7 no Windows.
- [ ] Criar testes automatizados para o bootstrap.

## Etapa 1 — Core e configuração

- [ ] Separar CLI, Core e módulos.
- [ ] Implementar logger e tratamento de erros padronizados.
- [ ] Definir schema versionado de configuração.
- [ ] Implementar códigos de saída e contratos de resultado.
- [ ] Adicionar testes unitários.

## Etapa 2 — Detecção

- [ ] Detectar linguagens e versões.
- [ ] Detectar frameworks e gerenciadores de pacotes.
- [ ] Detectar ferramentas instaladas e suas versões.
- [ ] Registrar evidências e confiança da detecção.

## Etapa 3 — Validação e testes

- [ ] Python: Ruff e pytest.
- [ ] JavaScript/TypeScript: ESLint e scripts de teste configurados.
- [ ] React: detecção via manifestos e validação no ecossistema JS.
- [ ] HTML/CSS: validadores dedicados.
- [ ] Java: Maven/Gradle e testes configurados.
- [ ] Lua: ferramentas selecionáveis.
- [ ] SQL: validação estática; testes reais exigem banco e fixtures configurados.

## Etapa 4 — Build e artefatos

- [ ] Adaptadores de build por ecossistema.
- [ ] Diretório de artefatos configurável.
- [ ] Manifesto e checksums dos artefatos.

## Etapa 5 — Segurança e relatórios

- [ ] Verificação de segredos.
- [ ] Auditoria de dependências.
- [ ] Relatórios JSON e Markdown.
- [ ] Redação de informações sensíveis nos logs.

## Etapa 6 — GitHub Actions e portabilidade

- [ ] Workflow de CI do próprio projeto.
- [ ] Testes Windows e Ubuntu.
- [ ] Templates reutilizáveis.
- [ ] Política de permissões mínimas.

## Etapa 7 — Distribuição

- [ ] Instalação e atualização documentadas.
- [ ] Versionamento semântico.
- [ ] Releases e changelog.
- [ ] Testes em repositórios de exemplo.

## Critério de conclusão

Uma tarefa só será marcada como concluída após implementação, teste reproduzível e documentação. Detecção isolada não comprova validação, teste ou build.
