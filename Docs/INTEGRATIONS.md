# Integrações CI

O Universal CI/CD pode ser chamado por provedores externos usando PowerShell 7.

## Modelos incluídos
- GitHub Actions: `.github/workflows/ci.yml`
- GitLab CI: `.gitlab-ci.yml`
- Azure Pipelines: `azure-pipelines.yml`
- Jenkins: `Jenkinsfile`

## Responsabilidades
Os provedores externos controlam agendamento, runners, permissões, segredos, aprovações e retenção de artefatos. O Universal CI/CD controla detecção, planejamento, adaptadores locais, execução aprovada e relatórios.

## Antes de habilitar em produção
1. Revise `.cicd/config.json` e habilite apenas etapas necessárias.
2. Restrinja os runners e permissões do token ao mínimo.
3. Não exponha credenciais a builds de forks ou branches não confiáveis.
4. Configure aprovações de ambiente para deploys fora deste projeto.
5. Armazene `.cicd/reports/` e `.cicd/artifacts/` com políticas de retenção adequadas.
6. Use runners efêmeros para código de terceiros.

Os templates são pontos de partida, não uma certificação de segurança ou compatibilidade para qualquer configuração de runner.
