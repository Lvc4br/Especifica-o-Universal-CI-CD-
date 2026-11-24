# Universal CI/CD — planejamento técnico

## Princípios
- Entregar fatias verticais pequenas e testáveis.
- Não duplicar lógica de pipeline em TypeScript.
- Preservar PowerShell 7.2+ e a CLI atual.
- Não declarar suporte sem fixtures reais.
- Executar código remoto somente em runner isolado.

## Fase 0 — fundação monorepo
- [x] Definir público all, IA opcional e freemium.
- [x] Definir fronteiras Engine, Contracts, VS Code, GitHub e providers.
- [x] Criar workspaces TypeScript, contratos iniciais e scaffolds.
- [x] Documentar arquitetura e planejamento.
- [ ] Schemas JSON Schema para requests, planos, eventos e relatórios.
- [ ] Testes de contrato/compatibilidade e pipeline CI para workspaces Node.

Saída: instalação limpa, typecheck/build/test JS e smoke test do engine sem regressões.

## Fase 1 — VS Code MVP
1. Descoberta do engine e verificação PowerShell 7.2+.
2. Adaptador de processo com spawn, shell:false, timeout, cancelamento e stdout/stderr.
3. Comandos Detect, Preview Plan, Run Approved Plan e Open Report.
4. Validar respostas contra schemas e mapear estados.
5. Tree View, progresso, Output Channel e relatórios.
6. Aprovação explícita antes da execução; nunca executar na ativação.
7. Testes unitários com processos simulados e VS Code Extension Test Runner.
8. Acessibilidade por teclado/leitor de tela, alto contraste e pt-BR/en-US.

Saída: VSIX instala, detecta fixture, exibe plano, executa só após aprovação e mostra relatório válido.

## Fase 2 — GitHub App MVP seguro
1. Registrar GitHub App e armazenar IDs/segredos em secret manager.
2. Webhook com assinatura, deduplicação e replay protection.
3. Instalar em repositório de teste e usar permissões mínimas.
4. Provider GitHub Actions com runner efêmero; App apenas coordena.
5. Runner recebe SHA imutável, executa engine e produz RunReport.
6. Check Run com sumário e anotações limitadas.
7. Retry/idempotência, rate limits e observabilidade redigida.
8. Testes de autorização, eventos inválidos, PR fork e falhas do runner.

Saída: PR de teste aciona runner, executa fixture e publica Check sem executar código no servidor do App.

## Fase 3 — experiência integrada
- Mesmo protocolo e RunReport no VS Code e GitHub.
- Correlation ID ponta a ponta.
- Compatibilidade de contrato N/N-1.
- Deep links entre Check Run, relatório e workspace local.

## Fase 4 — Freemium
- Medir custo de runners, armazenamento, filas e suporte no beta.
- Definir cotas Free e benefícios Pro/Team/Enterprise com transparência.
- Implementar identidade e entitlement no backend, com cache e tolerância a indisponibilidade.
- Delegar cobrança a provedor especializado; não armazenar cartão.
- Cliente não é autoridade para liberar recursos pagos.
- Não bloquear funções locais essenciais por falha de rede/conta.

## Fase 5 — IA opcional
- Interface AIProvider e configuração por usuário/organização.
- Opt-in explícito e aviso quando dados saírem da máquina.
- Minimização/redação de dados sensíveis.
- Começar com explicar falhas e resumir logs.
- Sem auto-fix, auto-run ou deploy.
- Testar provider indisponível, saída inválida, prompt injection e vazamento.

## Fase 6 — qualidade e lançamento
- Matriz Windows/Linux/macOS para engine e extensão.
- Fixtures reais por ecossistema declarado.
- Auditoria de permissões GitHub, isolamento e supply chain.
- Testes de acessibilidade e instalação/atualização/remoção.
- Beta privada, telemetria opt-in e documentação.
- Publicação gradual no VS Code Marketplace e GitHub Marketplace.

## Definition of Done
Escopo documentado; schemas e contratos testados; nenhum segredo/permissão excessiva; execução externa exige consentimento; logs redigidos; compatibilidade comprovada; PR revisado e sem alterações diretas em main.
