# Universal CI/CD — extensão VS Code

A extensão conecta o VS Code ao motor PowerShell existente. O motor permanece responsável por detecção, planejamento e execução; a extensão fornece comandos e uma interface nativa no Explorer.

## Requisitos
- Visual Studio Code 1.90 ou superior
- PowerShell 7.2+
- Workspace local aberto
- Motor Universal CI/CD disponível no workspace ou configurado em `universalCicd.enginePath`

## Primeiros passos
1. Abra a pasta do projeto no VS Code.
2. Garanta que o PowerShell 7 esteja instalado e acessível como `pwsh`.
3. Se `cicd.ps1` não estiver na raiz do workspace, defina `Universal CI/CD: Engine Path` para a pasta que contém o script.
4. Abra a seção **Universal CI/CD** no Explorer.
5. Execute primeiro **Detectar tecnologias**, **Validar configuração** e **Gerar plano**.
6. Só use os comandos de execução depois de revisar o plano e confirmar a aprovação modal.

## Interface
A Tree View nativa organiza os comandos em Workspace, Análise, Execução e Relatórios. O comando **Universal CI/CD: Abrir dashboard** abre o painel visual com estado do workspace, detecção do motor, atalhos operacionais e áreas de inteligência. O item Motor também informa se a extensão encontrou o script `cicd.ps1`. A saída detalhada fica no canal **Universal CI/CD** do painel Output.

O dashboard é uma preview local. Ele lê `.cicd/plans/latest-plan.json` do workspace e apresenta as etapas, tecnologias, status e motivos registrados pelo motor PowerShell. A visualização também se atualiza quando esse arquivo é criado, alterado ou removido por um comando externo, inclusive pela CLI, enquanto o painel está aberto. A leitura é limitada a 1 MB, valida o schema `1.0`, normaliza os campos e rejeita caminhos que escapem do workspace. Os cartões de inteligência e políticas descrevem capacidades existentes no Core, mas não representam serviços remotos conectados. Indicadores de GitHub, runners distribuídos e métricas em tempo real não são simulados.

Detalhes do fluxo de dados, validação, fronteiras de confiança e limitações: [VS Code Dashboard — Local Plan Inspector](../../Docs/VSCODE_DASHBOARD_PLAN_INSPECTOR.md).

## Inspecionar uma especificação UPS v1

1. Abra a Command Palette (`Ctrl+Shift+P`).
2. Execute **Universal CI/CD: Inspecionar pipeline UPS (somente leitura)**.
3. Selecione um arquivo JSON UPS v1.
4. Consulte o canal **Universal CI/CD** no painel Output para ver validação, ondas de dependência, ordem topológica, caminho crítico estrutural e diagnósticos.

O inspector usa os contratos compartilhados UPS v1, aceita arquivos de até 1 MB e até 500 jobs, e limita o relatório a 100.000 caracteres. Ele não executa steps, não contata runners e não concede aprovação ou autorização. O caminho crítico é contado em jobs, não em duração.

## Segurança
- O processo é iniciado com argumentos separados e `shell: false`.
- A extensão não executa código remoto nem faz dispatch de workflows GitHub.
- A execução local exige geração bem-sucedida do plano e confirmação explícita.
- O timeout padrão é 600 segundos e pode ser ajustado nas configurações.

## Testes
O conjunto automatizado valida a construção segura dos argumentos do motor, a exigência de aprovação explícita, o timeout e as contribuições de comandos e da Tree View no manifesto da extensão.

## Desenvolvimento
```bash
npm install
npm run typecheck
npm test
npm run build
```

Esta versão combina a Tree View nativa do VS Code com um painel Webview responsivo. O painel exibe o plano local mais recente; a visualização gráfica interativa de DAGs UPS v1 permanece como etapa futura; o comando de inspeção textual já apresenta a análise.

## Abrir o dashboard visual

1. Instale a extensão Universal CI/CD no VS Code.
2. Abra uma pasta de projeto.
3. Abra a Command Palette com `Ctrl+Shift+P`.
4. Execute **Universal CI/CD: Abrir dashboard**.
5. Configure `universalCicd.enginePath` com a pasta que contém `cicd.ps1`, caso o motor não esteja na raiz do workspace.

A validação e o empacotamento da extensão são executados pelo workflow **VS Code Extension CI** em Pull Requests que alterem a extensão. O artefato VSIX fica disponível na seção Artifacts da execução do GitHub Actions por 14 dias. Para instalar um pacote baixado, use **Extensions: Install from VSIX...** na Command Palette.

O pacote da extensão contém a integração VS Code; o motor PowerShell continua sendo distribuído/configurado separadamente nesta preview. A versão 0.7.0 ainda não é uma publicação no Marketplace.
