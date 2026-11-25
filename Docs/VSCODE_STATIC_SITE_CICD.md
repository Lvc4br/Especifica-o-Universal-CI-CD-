# CI/CD para sites estáticos HTML e CSS

Use **Universal CI/CD: Configurar CI/CD para HTML e CSS (GitHub Pages)** em um workspace que contenha um `index.html` na pasta escolhida.

## O que o assistente cria

O comando pergunta a branch de publicação e a pasta relativa que contém o site pronto. Exemplos: `.` (raiz), `site/`, `public/`, `dist/` ou `build/`.

Ele gera `.github/workflows/universal-cicd-static-site.yml` e não substitui um arquivo que já exista nesse caminho.

- **CI em pull requests e pushes:** valida arquivos HTML com `html-validate` e verifica sintaxe/formatação de HTML e CSS com Prettier.
- **CD em push:** depois da CI, publica no GitHub Pages somente a pasta selecionada e somente na branch escolhida.
- **Execução manual:** o workflow também pode ser iniciado pelo GitHub Actions na branch configurada.

## Pré-requisitos

1. A pasta escolhida deve existir dentro do workspace e conter `index.html` regular de até 1 MB.
2. O repositório precisa estar no GitHub.
3. Em Settings → Pages, configure a origem como **GitHub Actions** antes do primeiro deploy.
4. A branch escolhida deve existir e receber os pushes que devem publicar.
5. O runner GitHub-hosted precisa de acesso à rede para baixar as ferramentas de validação e as actions.

## Limites e segurança

- O caminho é relativo, validado contra traversal e symlinks que escapem do workspace.
- A extensão apenas gera o YAML localmente; não envia commits, não altera configurações do repositório e não dispara workflow.
- A instalação das ferramentas ocorre no runner durante a CI, não no computador do usuário.
- Pull requests nunca publicam.
- Esta versão não faz deploy para Vercel/Netlify, não cria domínio, não configura secrets e não faz rollback automático.
- Actions estão referenciadas por tags principais; organizações que exigem pinagem por SHA devem adaptar as referências conforme sua política.
- O teste HTML/CSS é uma primeira barreira de qualidade, não substitui testes visuais em navegadores, testes de acessibilidade completos ou revisão humana.
