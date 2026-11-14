# Comandos

Execute a partir da raiz do projeto:

~~~powershell
pwsh ./cicd.ps1 help
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 status
~~~

## version

Exibe a versão do bootstrap.

## init

Cria .cicd/config.json. Se o arquivo já existir, não o altera.

## detect

Percorre arquivos do projeto e identifica extensões e manifestos conhecidos. Não executa código do projeto. A detecção é heurística e inicial.

## status

Exibe a presença da configuração e a quantidade de relatórios locais.

## Comandos futuros

check, test, build, security e report serão adicionados quando seus executores e contratos de resultado estiverem implementados. Não devem ser interpretados como disponíveis no bootstrap atual.
