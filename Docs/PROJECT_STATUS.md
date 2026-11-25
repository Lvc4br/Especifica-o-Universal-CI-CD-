# Estado consolidado do projeto

Atualizado em 24 de novembro de 2026, com validação das PRs e execuções do GitHub Actions.

## Cadeia de Pull Requests

Todas as PRs abaixo permanecem draft/abertas e não foram mescladas; preservar a ordem de dependência:

| PR | Escopo | Base / dependência | Situação conhecida |
|---|---|---|---|
| #1 | Fundação monorepo VS Code/GitHub App | `main` | Draft; revisar sobreposição com #2 |
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
| #20 | Preview temporária GitHub Pages | #19 | Draft; preview separada, não é dependência da cadeia #21/#22 |
| #21 | Atualização automática do inspector quando o plano local muda; dashboard 0.6.0 | #19 | Draft; Monorepo CI e VS Code CI passaram |
| #22 | VS Code UPS Inspector com DAG visual interativo; extensão 0.8.0 | #21 | Draft; CI verde no SHA `15730be6`; VSIX publicado como artefato |
| #23 | Busca, rótulos de ondas e zoom do DAG; extensão 0.9.0 | #22 | Draft; Monorepo CI e VS Code Extension CI passaram |
| #24 | Verificação de integridade VSIX e checklist de smoke manual | #23 | Draft; CI verificada no último SHA da cadeia |
| #25 | Extension Development Host (F5) | #24 | Draft; Monorepo CI e VS Code Extension CI passaram no SHA `5f6afdbe` |

## Marco em desenvolvimento — VS Code 0.9.0 (PR #23)

- DAG visual identifica cada onda explicitamente.
- Busca por nome ou ID destaca jobs correspondentes.
- Zoom ajustável entre 50% e 200%, com redefinição para 100%.
- Mantém seleção de jobs, diagnósticos, caminho crítico e limites de segurança da versão 0.8.0.
- Não altera o plano, não executa jobs e não contata runners.

## Marco validado — VS Code 0.8.0 (PR #22)

- Comando UPS Inspector seleciona explicitamente um JSON UPS v1.
- Reutiliza validação, geração plan-only e análise DAG dos contratos compartilhados.
- Abre relatório textual e DAG visual lado a lado.
- Dashboard principal inclui atalho direto para abrir o inspector UPS.
- DAG mostra jobs, dependências, ondas, paralelismo estrutural, caminho crítico e diagnósticos.
- Seleção de job mostra dependências, capabilities e steps; navegação por teclado.
- Webview com CSP restritiva, sem assets remotos, sem bridge de comandos e sem `innerHTML`.
- Limites: arquivo de 1 MB, 500 jobs, 100 steps por job e relatório de 100.000 caracteres.
- Schema e validator UPS alinham nomes/executáveis não vazios, IDs, unicidade de dependências/capabilities e limites de coleção.
- Fixture Python testada ponta a ponta: validação, geração plan-only e análise DAG; executáveis declarados não são iniciados.
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
- O dashboard 0.8.0 continua local e não simula GitHub, runners remotos, telemetria ou execuções em tempo real.
- PR #21: Monorepo CI e VS Code Extension CI passaram após correção da expectativa de versão no teste do manifesto.
- PR #22 / versão 0.7.0: Monorepo CI passou no run `45467318370`; VS Code Extension CI passou no run `45467317904`.
- PR #22 / versão 0.8.0: Monorepo CI passou no run [45482619607](https://github.com/Lvc4br/Especifica-o-Universal-CI-CD-/actions/runs/45482619607); VS Code Extension CI passou no run [45482619269](https://github.com/Lvc4br/Especifica-o-Universal-CI-CD-/actions/runs/45482619269), ambos no SHA `15730be697c84ac23d22a9e1537c9fc5301a9700`.
- VSIX `universal-cicd-vscode-0.8.0` foi empacotado com o runtime de `@universal-cicd/contracts` verificado no file list; artefato ID `14963600158`, expira em 8 de dezembro de 2026.
- Ajustes finais incluem descarte de listener ao fechar painel, atalho UPS no dashboard, paridade UPS schema/validator e verificação do runtime interno dentro do VSIX.
- PR #22: VSIX `universal-cicd-vscode-0.7.0` empacotado e publicado como artefato ID `14956240032` (expira em 8 de dezembro de 2026).
- PR #23 / versão 0.9.0: Monorepo CI run `45483236417` e VS Code Extension CI run `45483236308` passaram; VSIX artefato ID `14962716420`.
- Nenhuma PR desta cadeia foi mesclada em `main`.

## Equipe

- Luca: owner, arquitetura e implementação-base.
- Higor: gerenciamento, planejamento e validação.
- Arthur: design e experiência visual nas próximas etapas.

## Conclusão

O projeto avançou até um dashboard VS Code capaz de inspecionar planos locais e abrir um DAG visual UPS v1. A extensão 0.8.0 e a navegação 0.9.0 passaram pelos workflows de CI e geraram VSIX instaláveis como artefatos; ainda não são publicações no Marketplace nem produto pronto para produção. Continua sendo uma prévia em desenvolvimento por PRs empilhadas; não é produto pronto para produção. Revisão, integração ordenada, testes de segurança e validação com usuários continuam necessários.


## Qualidade de distribuição — verificação VSIX
- Verificador pós-empacotamento criado: ZIP íntegro, manifest identity/version, entrypoint e runtime de contratos.
- O workflow VS Code Extension CI executa a verificação antes de enviar artefato.
- Evidência final pendente de CI na PR #24.


## Instalação de release — checklist
- Criado `Docs/VSIX_RELEASE_SMOKE_CHECKLIST.md` para validação manual do candidato de release: instalação pelo VS Code, reload, Explorer, dashboard, inspector, logs e fixture inválida.
- Checklist diferencia verificação automatizada do pacote e smoke test GUI real; não declara instalação manual concluída.


## Marco de desenvolvimento local — PR #25

- `.vscode/launch.json` inicia um Extension Development Host com `--extensionDevelopmentPath`.
- Tarefas encadeadas compilam contracts e VS Code, fazem staging dos contracts runtime e preparam o launch.
- Documentação em `Docs/VSCODE_DEVELOPMENT_HOST.md` e README da extensão.
- CI do monorepo e VS Code Extension passou no SHA `5f6afdbe44ed49cf95001039bc3f6632d3e0489d`.
- Ainda não é confirmação de teste F5 em desktop real. PR draft, empilhada sobre #24.
