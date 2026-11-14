# Comandos

```powershell
pwsh ./cicd.ps1 help
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 run
pwsh ./cicd.ps1 run -Approve
pwsh ./cicd.ps1 run -Approve -TimeoutSeconds 900
pwsh ./cicd.ps1 status
```

## run
Sem `-Approve`, apenas lista etapas que aguardam autorização. Com aprovação, executa etapas check/test com adaptador allowlisted e ferramenta instalada. Timeout padrão: 600 segundos por etapa. Timeout ou exit code diferente de zero marca FAILED. Relatório JSON em `.cicd/reports/`.

## Outros comandos
- `version`: versão.
- `init`: cria configuração sem sobrescrita.
- `validate-config`: valida JSON, propriedades obrigatórias e tipos básicos.
- `detect`: detecção heurística, sem execução.
- `plan`: cria plano em `.cicd/plans/latest-plan.json`.
- `status`: mostra configuração, plano e relatórios.

Habilite `pipeline.check` e/ou `pipeline.test` em `.cicd/config.json`. Revise o plano e scripts do projeto antes de aprovar. Build, security, SQL e deploy ainda não estão implementados.
