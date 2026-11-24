# Estado consolidado do projeto

Atualizado em 24 de novembro de 2026, com validação das PRs e execuções do GitHub Actions.

## Cadeia de Pull Requests

Todas as PRs abaixo permanecem draft/abertas e não foram mescladas; preservar a ordem de dependência:

| PR | Escopo | Base / dependência | Situação conhecida |
|---|---|---|---|
| #2 | Arquitetura e modelo de produto | `main` | Draft |
| #3 | Adaptador VS Code | #2 | Draft |
| #4 | GitHub App / Check Run foundation | #3 | Draft |
| #5 | Estado de orquestração, dedupe e SHA | #4 | Draft; CI passou |
| #6 | Fundação PostgreSQL | #5 | Draft |
| #7 | Guia técnico/produto | cadeia anterior | Draft |
| #8 | Universal Pipeline Specification v1 | cadeia anterior | Draft |
| #9 | Validação runtime UPS | #8 | Draft |
| #10 | Execution Plan Generator | #9 | Draft |
| #11 | Estratégia comercial | cadeia anterior | Draft |
| #12 | Capability Resolution Engine | #10 | Draft |
| #13 | Roadmap, arquitetura, riscos e governança | cadeia anterior | Draft |
| #14 | Hardening do Capability Resolver | #13 / #12 | Draft; CI passou |
| #15 | Pipeline Intelligence Engine | #14 | Draft; CI passou |
| #16 | Policy & Trust Engine | #15 | Draft; CI passou |
| #17 | Protocolo de autorização/aprovação (design-only) | #16 | Draft |
| #18 | Dashboard visual VS Code 0.4.0 | #17 | Draft; Extension CI passou e VSIX publicado como artefato |
| #19 | Inspector do plano local no dashboard 0.5.0 | #18 | Draft; Extension CI e Monorepo CI passaram |
| #21 | Atualização automática do inspector quando o plano local muda; dashboard 0.6.0 | #19 | Draft; Monorepo CI e VS Code CI passaram |
| #22 | VS Code UPS Inspector com DAG visual interativo; extensão 0.8.0 | #21 | Draft; nova validação CI em andamento |

## Marco em desenvolvimento — VS Code 0.8.0 (PR #22)

- Comando UPS Inspector seleciona explicitamente um JSON UPS v1.
- Reutiliza validação, geração plan-only e análise DAG dos contratos compartilhados.
- Abre relatório textual e DAG visual lado a lado.
- DAG mostra jobs, dependências, ondas, paralelismo estrutural, caminho crítico e diagnósticos.
- Seleção de job mostra dependências, capabilities e steps; navegação por teclado.
- Webview com CSP restritiva, sem assets remotos, sem bridge de comandos e sem `innerHTML`.
- Limites herdados: arquivo de 1 MB, 500 jobs e relatório de 100.000 caracteres.
- Não executa steps, não contata runners e não autoriza execução.

## Marco anterior — VS Code 0.7.0 (PR #22)

- Comando seleciona explicitamente um arquivo JSON UPS v1.
- Validação, geração de plano plan-only e análise DAG reutilizam `@universal-cicd/contracts`.
- Exibe ondas, dependências, ordem topológica, caminho crítico estrutural e diagnósticos no Output.
- Limites: arquivo de 1 MB, 500 jobs e relatório de 100.000 caracteres.
- Não executa steps, não contata runners e não autoriza execução.

## Marco validado — VS Code 0.6.0 (PR #21)

- O dashboard observa criação, alteração e remoção de `.cicd/plans/latest-plan.json`.
- Planos gerados externamente pela CLI atualizam o painel aberto sem refresh manual.
- Watcher e listeners são descartados quando o painel é fechado.
- A atualização continua somente leitura; não executa nem altera o plano.

## Marco anterior — VS Code 0.5.0

- O dashboard lê o plano real salvo em `.cicd/plans/latest-plan.json`.
- Exibe etapas, tecnologias, status e motivos, sem inventar dependências.
- O snapshot é limitado, validado e renderizado via `textContent`.
- O VSIX 0.5.0 foi empacotado e enviado como artefato do workflow.
- O motor PowerShell continua separado do VSIX e permanece como fonte da verdade.

## Validação CI confirmada

- PR #18: VS Code Extension CI concluído com sucesso; VSIX 0.4.0 disponível no run `45435093899`.
- PR #19: VS Code Extension CI concluído com sucesso no run `45436884442`; VSIX 0.5.0 disponível como artefato ID `14940124804`.
- PR #19: Monorepo CI concluído com sucesso no run `45436884497`, incluindo typecheck de todos os workspaces, testes de contratos, adaptador VS Code, GitHub App e build.

## Segurança e limites atuais

- Nenhum runner remoto executando código de PR está ativo.
- Check Run builder ainda não cria Check Runs reais.
- PostgreSQL é fundação no PR, não infraestrutura provisionada/conectada.
- O executor local não é sandbox.
- O protocolo de aprovação da PR #17 é design-only; não implementa identidade, tokens ou autorização.
- O dashboard 0.6.0 não simula GitHub, runners remotos, telemetria ou execuções em tempo real.
- PR #21: Monorepo CI e VS Code Extension CI passaram após correção da expectativa de versão no teste do manifesto.
- PR #22 / versão 0.7.0: Monorepo CI passou no run `45467318370`; VS Code Extension CI passou no run `45467317904`.
- PR #22 / versão 0.8.0: implementação do DAG visual adicionada; aguardando nova validação CI.
- PR #22: VSIX `universal-cicd-vscode-0.7.0` empacotado e publicado como artefato ID `14956240032` (expira em 8 de dezembro de 2026).
- Nenhuma PR desta cadeia foi mesclada em `main`.

## Equipe

- Luca: owner, arquitetura e implementação-base.
- Higor: gerenciamento, planejamento e validação.
- Arthur: design e experiência visual nas próximas etapas.

## Conclusão

O projeto avançou até um dashboard VS Code capaz de inspecionar planos locais e abrir um DAG visual UPS v1; a versão 0.8.0 aguarda validação CI. Continua sendo uma prévia em desenvolvimento por PRs empilhadas; não é produto pronto para produção. Revisão, integração ordenada, testes de segurança e validação com usuários continuam necessários.
