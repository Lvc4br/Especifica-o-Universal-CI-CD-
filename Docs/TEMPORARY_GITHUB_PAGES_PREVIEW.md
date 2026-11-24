# Prévia temporária no GitHub Pages

**Status:** implementação em PR draft #20.  
**Objetivo:** permitir visualizar a direção do dashboard Universal CI/CD pelo navegador, sem instalar a extensão VS Code.

## URL prevista

`https://lvc4br.github.io/Especifica-o-Universal-CI-CD-/`

O endereço só estará ativo depois que o workflow `Temporary GitHub Pages Preview` concluir o deploy e o GitHub Pages aceitar a configuração do repositório.

## Como funciona

- A página estática fica em `site/index.html`.
- O workflow `.github/workflows/pages-preview.yml` valida a entrada, configura Pages, publica o artefato e faz o deploy.
- O deploy é acionado por alterações em `site/**` na branch temporária `feat/github-pages-preview`, ou manualmente.
- A publicação utiliza GitHub Actions e o ambiente `github-pages`; não é necessário colocar o site na raiz do produto.

## Escopo e limites

Esta é uma prévia visual estática e responsiva, com navegação entre visão geral, pipeline conceitual, arquitetura e roadmap.

- Não lê arquivos do computador ou do workspace.
- Não executa PowerShell, pipelines, workflows ou comandos.
- Não se conecta ao GitHub App, runners, banco de dados ou serviços de telemetria.
- Exemplos de fluxo e estados são identificados como ilustrativos.
- Não recebe nem armazena credenciais, secrets ou dados pessoais.
- Não é o dashboard web autenticado planejado para o produto final.

A extensão VS Code continua sendo a interface que pode inspecionar o plano local real. O site público não substitui essa capacidade.

## Ciclo de vida temporário

A prévia existe apenas para facilitar a visualização durante o desenvolvimento. Antes de finalizar o produto:

1. Definir a hospedagem definitiva e o domínio.
2. Migrar apenas as páginas e funcionalidades aprovadas.
3. Remover o workflow temporário, a pasta `site/` e esta documentação, se não fizerem mais sentido.
4. Desabilitar GitHub Pages no repositório.
5. Confirmar que não restaram URLs ou badges apontando para a prévia temporária.

## Manutenção

Não publicar dados internos, credenciais, logs privados ou informações de clientes nesta página pública. Mudanças no site devem passar por Pull Request e revisão.
