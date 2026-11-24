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

O dashboard é uma preview local. Os cartões de inteligência e políticas descrevem capacidades já existentes no Core, mas não representam serviços remotos conectados. Indicadores de GitHub, runners distribuídos e métricas em tempo real não são simulados.

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

Esta versão usa a Tree View nativa do VS Code. Um painel webview e visualização gráfica de pipelines ficam para uma etapa posterior.
