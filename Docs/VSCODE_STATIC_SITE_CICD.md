# CI/CD para sites estáticos HTML e CSS

Use **Universal CI/CD: Configurar CI/CD para HTML e CSS (GitHub Pages)** em um workspace que tenha `index.html` na raiz.

## O que o assistente cria

O comando gera `.github/workflows/universal-cicd-static-site.yml` e não substitui um arquivo que já exista nesse caminho.

- **CI em pull requests e pushes:** valida arquivos HTML com `html-validate` e verifica sintaxe/formatação de HTML e CSS com Prettier.
- **CD em push:** depois da CI, publica o conteúdo da raiz no GitHub Pages, somente na branch escolhida.
- **Execução manual:** o workflow também pode ser iniciado pelo GitHub Actions.

## Pré-requisitos

1. O site deve ter `index.html` na raiz do workspace.
2. O repositório precisa estar no GitHub.
3. Em Settings → Pages, configure a origem como **GitHub Actions** antes do primeiro deploy.
4. A branch escolhida deve existir e receber os pushes que devem publicar.
5. O runner GitHub-hosted precisa de acesso à rede para baixar as ferramentas de validação e as actions.

## Limites e segurança

- A extensão apenas gera o YAML localmente; não envia commits, não altera configurações do repositório e não dispara workflow.
- A instalação das ferramentas ocorre no runner durante a CI, não no computador do usuário.
- A publicação acontece apenas em push na branch selecionada, nunca em pull request.
- O workflow publica a raiz do repositório. Projetos que geram conteúdo em `dist/`, `build/` ou outra pasta precisam de ajuste explícito do caminho.
- Esta versão não faz deploy para Vercel/Netlify, não cria domínio, não configura secrets e não faz rollback automático.
- Actions estão referenciadas por tags principais; organizações que exigem pinagem por SHA devem adaptar as referências conforme sua política.
- O teste HTML/CSS é uma primeira barreira de qualidade, não substitui testes visuais em navegadores, testes de acessibilidade completos ou revisão humana.
