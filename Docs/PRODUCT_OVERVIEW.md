# Universal CI/CD — Visão geral do produto

## Visão
Universal CI/CD é um orquestrador modular, com interface no VS Code e integração planejada com GitHub, que detecta tecnologias de um projeto, gera planos de validação e executa tarefas CI/CD selecionadas mediante aprovação. O objetivo é simplificar a entrada em CI/CD e oferecer uma camada de orquestração uniforme entre ecossistemas, sem esconder o que será executado.

## Problema que tenta resolver
A adoção e manutenção de CI/CD exige conhecer ferramentas específicas, manifests, comandos, configurações de runners e pipelines. O produto busca reduzir o trabalho de configuração inicial, padronizar a experiência e oferecer descoberta, planejamento, validação, relatórios e integração no fluxo de desenvolvimento.

## Público
- Desenvolvedores individuais e estudantes.
- Pequenas equipes sem especialistas dedicados em DevOps.
- Equipes profissionais que querem padronização e templates.
- Monorepos e projetos com mais de um ecossistema.
- Organizações que buscam visibilidade e governança — sujeito a desenvolvimento futuro.

## Princípios
1. Transparência: mostrar plano, ferramenta e comando.
2. Aprovação: execução explícita; detectar/planejar não executam o código do projeto.
3. Modularidade: motor, adaptadores, UI e integrações separados.
4. Portabilidade: PowerShell 7.2+ e ferramentas-alvo instaladas.
5. Segurança por padrão, com limites claramente documentados.
6. IA opcional; não é requisito para operação nem autoridade de aprovação.
7. Não confundir adaptador implementado com suporte validado.

## Capacidades atuais / desenvolvimento
- Motor CLI PowerShell, detector, planejador e executor allowlist.
- Timeout, saída limitada, relatórios JSON e histórico.
- Discovery/workspaces e execução local aprovada.
- Adaptadores iniciais para diversos ecossistemas (ver LANGUAGE_SUPPORT.md).
- Extensão VS Code em TypeScript.
- GitHub App foundation em TypeScript/Probot, Check Run payload builder e contratos de orquestração.
- PRs empilhados para fundações PostgreSQL; ainda não existe worker ou dispatch remoto integrado.

## Modelo de produto proposto
Freemium é uma hipótese, não um plano comercial aprovado. Propostas de valor pagáveis podem incluir gestão de equipe, políticas, runners gerenciados, controles organizacionais, histórico avançado e integração corporativa; nenhuma oferta ou preço está definido.

## Não é (ainda)
Não é um SaaS de execução remota pronto, sandbox de segurança, deploy universal, substituto completo de Jenkins/GitHub Actions/GitLab CI, nem suporte garantido a toda linguagem ou projeto.
