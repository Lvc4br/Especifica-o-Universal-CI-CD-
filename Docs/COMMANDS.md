# Comandos

Execute a partir da raiz do projeto:

~~~powershell
pwsh ./cicd.ps1 help
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 status
~~~

## version
Exibe a versão da ferramenta.

## init
Cria `.cicd/config.json`. Se o arquivo já existir, não o altera.

## validate-config
Valida JSON, propriedades obrigatórias, versão de schema, nome do projeto e tipos booleanos do pipeline. O contrato formal também está em `Schemas/config.schema.json`; a validação atual ainda não usa um motor JSON Schema.

## detect
Percorre arquivos do projeto e identifica extensões e manifestos conhecidos. Apresenta evidências relativas. Não executa código do projeto. A detecção é heurística e inicial.

## plan
Verifica ferramentas relevantes no PATH, monta etapas com status de planejamento e salva `.cicd/plans/latest-plan.json`. O plano é informativo: não executa os comandos apresentados. A próxima geração substitui o plano anterior.

## status
Exibe a presença da configuração, do plano e a quantidade de relatórios locais.

## Ainda não disponíveis
`check`, `test`, `build`, `security` e `report` ainda não executam tarefas. Serão adicionados com seus adaptadores, executor controlado e testes.