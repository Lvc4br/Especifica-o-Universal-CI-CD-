# Mercado e posicionamento competitivo (análise preliminar)

CI/CD é um mercado consolidado. Universal CI/CD não deve se posicionar como "o primeiro CI", nem afirmar substituir sistemas maduros. O diferencial precisa ser demonstrado por UX, interoperabilidade, segurança e facilidade de configuração.

## Categorias e concorrentes

| Produto | Categoria | O que já oferece | Implicação |
|---|---|---|---|
| GitHub Actions | CI/CD integrado a GitHub | workflows, jobs, runners hospedados e self-hosted, eventos, matriz e marketplace | Principal baseline para integração GitHub-first |
| GitLab CI/CD | plataforma integrada | pipelines declarados em YAML, stages/jobs e runners | Competidor integrado e amplo |
| Jenkins | automação extensível/open source | pipelines, plugins, server e ecossistema extensível | Grande flexibilidade, porém operação/configuração exigem esforço |
| CircleCI | CI cloud e self-hosted | builds, testes, deploy, vários OS e infraestrutura | Forte alternativa de plataforma |
| Buildkite | control-plane + agents | workflows flexíveis, hosted/self-hosted agents | Concorrente forte em controle de infraestrutura e escala |
| Woodpecker CI | open-source self-hosted | server, agentes, backend container/local, extensibilidade | Comparável em simplicidade e self-hosted |

## Nicho potencial para Universal CI/CD
- **Orquestração assistida de setup:** detectar projeto e produzir plano visível sem exigir que usuário comece escrevendo YAML.
- **Local-first:** mesma experiência de análise e planejamento no VS Code e CLI.
- **Multi-ecosystem:** matriz de adaptadores com comando padronizado, maturidade documentada.
- **Aprovação e transparência:** apresentar o que será executado, pré-requisitos e riscos.
- **Portabilidade:** experiência consistente, ainda que toolchains variem.
- **GitHub-first, mas modular:** provider GitHub Actions inicial; explorar outros providers conforme demanda e capacidade.
- **Onboarding:** reduzir a curva inicial de CI/CD para pequenos projetos e equipes.

## Onde já há paridade / onde ainda há gap
Paridade: pipelines, testes, builds, relatórios e automação são comuns. O produto ainda não possui runner remoto, isolamento real, cache distribuído, autoscaling, SLA, política corporativa, deploy remoto, gestão de segredos completa ou escala demonstrada.
O diferencial é uma hipótese de produto, não uma vantagem comprovada.

## Estratégia de pesquisa e validação
1. Comparar 5-10 fluxos reais (projeto simples, monorepo, projeto multi-language).
2. Medir tempo para gerar pipeline utilizável, taxa de falha, comandos errados e fricção.
3. Testar em Windows/Linux, incluindo fixtures de cada adaptador.
4. Validar onboarding com usuários iniciantes e experientes.
5. Documentar threat model e segurança do runner antes de executar PRs não confiáveis.
6. Evitar claims como "universal" ou "sem configuração" sem métricas verificáveis.

## Impacto potencial
- Desenvolvedor: menor fricção e melhor compreensão do pipeline.
- Equipe pequena: padrão reutilizável e menos trabalho repetitivo.
- Projeto multi-stack: descoberta e etapas agrupadas por ecossistema.
- Empresa: só será relevante com controle de acesso, auditoria, isolamento, políticas, SLAs e gestão de custos.

## SWOT preliminar
- **Forças:** experiência unificada, local-first, adaptadores, transparência, integração VS Code.
- **Fraquezas:** maturidade inicial, executor sem sandbox, cobertura real incompleta, runner remoto ainda não conectado.
- **Oportunidades:** monorepos, onboarding, developer experience, pipeline-as-assistance, templates.
- **Ameaças:** incumbentes, recursos gratuitos e integração nativa, security expectations, manutenção de matrizes de toolchains.
