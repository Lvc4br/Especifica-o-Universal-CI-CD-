# Roadmap

## Etapa 0 — Bootstrap
- [x] Repositório, documentação e CLI inicial.
- [x] CI do próprio projeto em Windows e Ubuntu.
- [x] Testes smoke do bootstrap.

## Etapa 1 — Core e configuração
- [x] Separar CLI, Core e módulos.
- [x] Implementar logger central.
- [x] Definir contrato padronizado de resultado.
- [x] Criar configuração sem sobrescrita silenciosa.
- [x] Implementar validação estrutural inicial da configuração.
- [x] Ampliar testes para configuração, detecção e contrato de resultado.
- [ ] Adicionar schema JSON formal e validação de tipos completa.

## Etapa 2 — Detecção
- [x] Detecção inicial de linguagens e evidências.
- [ ] Detectar versões e gerenciadores de pacotes.
- [ ] Detectar ferramentas instaladas e versões.
- [ ] Adicionar confiança e regras configuráveis por tecnologia.

## Etapa 3 — Engine e execução
- [ ] Implementar plano de execução sem executar comandos por padrão.
- [ ] Criar executor controlado de processos externos.
- [ ] Exigir aprovação para comandos definidos pelo projeto.
- [ ] Implementar códigos de saída e cancelamento.

## Etapa 4 — Validação e testes
- [ ] Python: Ruff e pytest.
- [ ] JavaScript/TypeScript: ESLint e scripts de teste configurados.
- [ ] React: validação no ecossistema JS.
- [ ] HTML/CSS: validadores dedicados.
- [ ] Java: Maven/Gradle e testes configurados.
- [ ] Lua: ferramentas selecionáveis.
- [ ] SQL: validação estática; testes reais exigem banco e fixtures.

## Etapa 5 — Build e artefatos
- [ ] Adaptadores de build por ecossistema.
- [ ] Diretório de artefatos configurável.
- [ ] Manifesto e checksums.

## Etapa 6 — Segurança e relatórios
- [ ] Verificação de segredos e dependências.
- [ ] Relatórios JSON e Markdown.
- [ ] Redação de informações sensíveis nos logs.

## Etapa 7 — Entrega e distribuição
- [ ] Integração GitHub Actions reutilizável.
- [ ] Templates e instalação documentados.
- [ ] Versionamento semântico e releases.
- [ ] Testes em repositórios de exemplo.

## Critério de conclusão
Uma tarefa só será marcada como concluída após implementação, teste reproduzível e documentação. Detecção isolada não comprova validação, teste ou build.