# Distribuição beta

## Objetivo

Este documento define como compartilhar uma compilação experimental do Universal CI/CD com um pequeno grupo de usuários para obter feedback. A versão atual é de desenvolvimento; a distribuição beta só deve começar depois da campanha final de testes e da revisão de segurança.

## Estado atual

- Versão do núcleo: 0.5.0-dev.
- Ainda não é uma versão estável nem recomendada para pipelines de produção.
- A compatibilidade varia entre linguagens e ferramentas. Consulte `Docs/ADAPTERS.md`.
- O executor não oferece isolamento (sandbox).
- O projeto ainda não contém um arquivo de licença. Antes de uma distribuição pública, o mantenedor deve escolher e adicionar uma licença explícita. Não presuma que a publicação no GitHub concede automaticamente permissão ampla de redistribuição ou uso comercial.

## Requisitos

- PowerShell 7.2 ou superior.
- Ferramentas específicas do projeto instaladas e acessíveis no PATH (por exemplo, Python/pytest/Ruff, Node/npm, Go, Rust/Cargo, .NET, Maven ou Gradle).
- Windows ou Linux, conforme a matriz de compatibilidade validada para a versão beta.

## Instalação para avaliação

1. Baixe o ZIP da release beta ou clone o repositório.
2. Extraia os arquivos em uma pasta dedicada.
3. Abra PowerShell 7 na pasta extraída.
4. Confira a versão: `pwsh ./cicd.ps1 version`.
5. Aponte para uma cópia de teste do projeto: `pwsh ./cicd.ps1 init -ProjectPath "/caminho/do/projeto"`.
6. Valide e gere o plano:
   - `pwsh ./cicd.ps1 validate-config -ProjectPath "/caminho/do/projeto"`
   - `pwsh ./cicd.ps1 detect -ProjectPath "/caminho/do/projeto"`
   - `pwsh ./cicd.ps1 plan -ProjectPath "/caminho/do/projeto"`
7. Revise o plano e os scripts/dependências do projeto antes de considerar `run -Approve`.

No Windows, substitua o caminho de exemplo por um caminho como `D:\Projetos\ProjetoTeste`.

## Regras de segurança para testadores

- Comece com um repositório descartável ou uma cópia sem dados importantes.
- Não execute projetos de terceiros ou desconhecidos com credenciais, tokens, chaves SSH ou acesso a dados sensíveis.
- A aprovação explícita não torna o processo seguro: ferramentas de build podem executar scripts, plugins e dependências do projeto.
- O executor não é sandbox e não limita rede, CPU, memória ou acesso ao sistema de arquivos.
- Revise relatórios e artefatos antes de compartilhá-los; o mascaramento de segredos é heurístico.
- Não use a versão beta em produção nem em máquinas críticas.

## Feedback e reporte

Ao relatar um problema, inclua:
- versão e sistema operacional;
- linguagem e versões das ferramentas envolvidas;
- comandos executados (remova tokens, caminhos privados e dados sensíveis);
- trecho relevante do relatório, com segredos e dados pessoais removidos;
- comportamento esperado e comportamento observado.

Abra uma issue no repositório. Para vulnerabilidades, não publique detalhes exploráveis em uma issue pública; entre em contato com o mantenedor por um canal privado previamente acordado.

## Critérios para sair da beta

- Campanha de testes concluída em ambientes suportados.
- Bugs críticos e altos corrigidos ou mitigados.
- Matriz de compatibilidade publicada com evidências.
- Revisão de segurança e empacotamento concluídos.
- Licença escolhida e incluída.
- Instruções de instalação e atualização validadas.
- Release notes e limitações conhecidas publicadas.
