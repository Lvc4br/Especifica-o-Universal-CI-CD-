# Configuração guiada do motor

A extensão oferece o comando **Universal CI/CD: Configurar localização do motor**.

1. Abra a Command Palette (Ctrl+Shift+P).
2. Selecione o comando de configuração do motor.
3. Escolha a pasta que contém `cicd.ps1`.
4. A extensão verifica a presença do arquivo, salva o caminho e chama o comando de versão para validar a integração.

A configuração é salva no Workspace quando há uma pasta aberta, caso contrário no perfil global do VS Code. O comando não instala o PowerShell nem baixa o engine; a seleção deve apontar para uma cópia confiável que o usuário já possui.

A seleção é cancelável e o caminho só é salvo depois de verificar a existência de `cicd.ps1`. A chamada de versão é uma validação inicial da integração, não uma auditoria de segurança nem prova de que todas as operações do motor funcionam.

## Diagnóstico do motor

Use `Ctrl+Shift+P` e execute **Universal CI/CD: Diagnosticar motor**, ou acesse a ação correspondente no Dashboard. O diagnóstico informa o executável PowerShell configurado, a pasta definida, a presença de `cicd.ps1`, a existência de workspace e o caminho selecionado. Se o motor não for encontrado, oferece atalhos para configurar novamente ou abrir as configurações. Se for encontrado, executa o comando `version` para verificar a inicialização real do processo e registra o resultado no canal Output.

O diagnóstico não instala nem atualiza o PowerShell, não baixa o motor e não testa execução de pipelines. A verificação do executável ocorre indiretamente ao iniciar o comando de versão; falhas devem ser analisadas pela mensagem apresentada no Output.
