# VS Code Extension Development Host

## Abrir e executar sem instalar VSIX

1. Clone o repositório e abra **a raiz do monorepo** no VS Code.
2. Instale Node.js 22 (ou versão compatível com as dependências) e execute `npm install` na raiz.
3. Abra Run and Debug (`Ctrl+Shift+D`).
4. Selecione **Universal CI/CD: Extension Development Host**.
5. Pressione F5. A configuração compila contratos e extensão, copia os contratos para a saída e inicia uma segunda janela do VS Code com a extensão carregada.
6. Na janela de desenvolvimento, use Explorer > Universal CI/CD ou a Command Palette.

A extensão é carregada diretamente a partir de `integrations/vscode` usando `--extensionDevelopmentPath`. Não é necessário criar, baixar ou instalar um VSIX para cada alteração.

## Limitações e segurança

- Este fluxo de desenvolvimento não instala a extensão na janela principal nem no perfil normal; abre um Extension Development Host separado.
- A configuração compila e prepara os contratos compartilhados localmente. Não faz deploy, não publica no Marketplace e não autoriza nem executa pipelines.
- O motor PowerShell continua separado; configure `universalCicd.enginePath` se necessário.
- A instalação/release por VSIX e o smoke test de instalação real continuam sendo fluxos distintos.
