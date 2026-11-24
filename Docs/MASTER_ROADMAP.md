# Universal CI/CD — Roadmap Estratégico

**Status:** documento vivo; metas e decisões são hipóteses revisáveis.  
**Owner:** Luca Toniolo  
**Equipe:** Luca (produto, arquitetura e implementação-base), Higor (gestão, planejamento e validação), Arthur (design e experiência visual, etapa futura).

## Visão
Construir uma plataforma interoperável para análise, planejamento, integração e futura orquestração de pipelines de desenvolvimento, com interfaces VS Code, GitHub e CLI, extensibilidade e inteligência contextual opcional. Um dashboard web próprio é uma interface futura planejada, sem ser pré-requisito para o Core ou para as integrações iniciais.

## Princípios
- Local-first e portabilidade; formatos e resultados exportáveis.
- Segurança por desenho, privilégio mínimo e fronteiras explícitas.
- Planejamento determinístico sempre que possível; IA não substitui regras.
- IA opt-in, transparente, com orçamento, minimização de dados e aprovação humana.
- Sem lock-in artificial: pipelines, logs e configurações exportáveis.
- Qualidade demonstrável: testes, documentação, rastreabilidade e releases.
- Não prometer suporte, isolamento, certificação ou superioridade sem evidências.

## Roadmap por gates

### Gate 0 — Foundation
- Monorepo, engine PowerShell existente, integração VS Code e GitHub App observador.
- Contratos compartilhados, CI, docs, padrões de PR.
- **Exit:** build/testes rastreáveis, fronteiras de confiança documentadas.

### Gate 1 — Portable Pipeline
- Universal Pipeline Specification (UPS) v1.
- Validador de schema e runtime, DAG, geração de plano.
- Fixtures positivas/negativas e casos de ciclo/edge cases.
- **Exit:** validator/planner consistentes; schema e implementação reconciliados.

### Gate 2 — Capability Intelligence
- Resolver capacidades de runners declarados, relatórios explicáveis.
- Não contactar nem reservar runners.
- **Exit:** teste de DAG, inventário, desempates, status e casos não resolvidos.

### Gate 3 — Policy & Trust
- Threat model, policy engine, consentimento, approvals e trilhas de auditoria.
- Primeira avaliação declarativa em modo assessment-only; não autoriza execução.
- Secrets não disponíveis em fase de planejamento.
- **Exit:** enforcement em componente confiável, identidade e auditoria de aprovações, testes de policy e revisão de segurança; riscos mitigados documentados.

### Gate 4 — Local execution hardening
- Runner lifecycle, cancelamento, timeouts, limites de recursos e output.
- Isolamento documentado e verificado; evitar alegações de sandbox sem prova.
- **Exit:** teste de adversarial inputs, isolamento e failure modes.

### Gate 5 — Observability & GitHub lifecycle
- Logs, artefatos, estados, dedupe, stale SHA, retry e cancelamento.
- Check Runs e dispatch só depois dos gates de segurança.
- **Exit:** idempotência, recuperação e observabilidade validadas.

### Gate 6 — Distributed execution
- Runner registration, heartbeat, scheduler, queue, capacity, fairness e lifecycle.
- Ephemeral runners, trust boundaries e controles de rede.
- **Exit:** threat model, teste de escala e recuperação, isolamento aprovado.

### Gate 7 — Intelligence & agents
- Diagnóstico contextual com evidências, propostas e diffs revisáveis.
- AI provider interchangeability, limites, custo, privacidade e fallback determinístico.
- Agentes nunca concedem permissões ou aprovam execução autonomamente.
- **Exit:** avaliação de qualidade, safety tests, opt-in e rollback.

### Gate 8 — Beta, community & commercial validation
- Beta fechada, entrevistas, métricas, documentação, templates, suporte e release.
- Open Core como hipótese; monetizar escala/serviços, não bloquear core artificialmente.
- **Exit:** feedback real, retenção/uso, custo unitário, suporte e plano de release.

## Prioridades imediatas
1. Reconciliar PRs empilhadas e garantir a integração de testes.
2. Auditar UPS schema, runtime validator, planner e resolver.
3. Expandir testes: DAGs (diamond, branching, multi-dependency), capabilities, runner inventory, edge cases.
4. Documentar threat model preliminar e política de execução.
5. Melhorar DX: mensagens de diagnóstico, CLI e extensão VS Code.
6. Criar demonstração reproduzível e onboarding.

## Métricas
- Build e test pass rate; cobertura dos casos críticos.
- Bugs por release, regressões, tempo de diagnóstico.
- Usuários ativos, retenção e pipelines analisados (quando instrumentação consentida).
- Tempo economizado em estudo/piloto.
- Custo de hosting, runners e IA por unidade.
- Segurança: vulnerabilidades abertas/tempo de correção, incidentes, gates completos.
- Comunidade: contribuições, issues reproduzíveis, documentação.

## Interfaces futuras
- Site institucional e documentação pública para posicionamento, onboarding e comunidade.
- Dashboard web autenticado para observabilidade e gestão, somente após definir identidade, autorização, tenancy, API e threat model.
- O site e o dashboard serão interfaces do Universal CI/CD, não dependências do motor Core.

## Decisões pendentes
- Licença e política de contribuição.
- Naming/trademark e posicionamento.
- Compatibilidade UPS e estratégia de versionamento.
- Runner protocol e modelo de trust.
- Storage/hosting e tenancy.
- Pricing, quotas e telemetry/privacy policy.
- Release channels, support policy e SLA (não prometidos antes da validação).
