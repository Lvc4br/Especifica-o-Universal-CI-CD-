# Análise de tecnologias do workspace

Use **Universal CI/CD: Analisar tecnologias do projeto** na Command Palette ou no Dashboard.

A análise atual é deliberadamente conservadora e somente de leitura. Ela verifica manifestos conhecidos na raiz do primeiro workspace aberto: Node.js, Python, Go, Rust, Java/Gradle, PHP/Composer, .NET solution, Docker e GitHub Actions. Para `package.json`, quando o arquivo tem até 256 KB, também lista até 30 scripts declarados e o campo `packageManager`.

Nenhum comando de build/teste é executado, nenhuma dependência é instalada e nenhum arquivo é criado ou alterado. As sugestões são orientações iniciais, não uma receita automática: revise scripts, lockfiles, plugins, versões de runtime e requisitos do projeto antes de criar um pipeline.

Limitações conhecidas:
- A detecção considera somente arquivos na raiz do primeiro workspace; monorepos e projetos aninhados exigem análise específica.
- A detecção por extensão de solução .NET considera arquivos `.sln` na raiz.
- A leitura de manifestos além de `package.json` limita-se à presença do arquivo; não há parsing completo das ferramentas.
- A análise não gera UPS nem executa o motor.
