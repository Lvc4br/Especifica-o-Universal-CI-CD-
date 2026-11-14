# Comandos

```powershell
pwsh ./cicd.ps1 help
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 validate-config -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 detect -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 plan -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 run -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 run -ProjectPath "D:\Projetos\MeuApp" -Approve -TimeoutSeconds 900
```

`-ProjectPath` aponta para o projeto-alvo. Quando omitido, usa o diretório de trabalho atual. A configuração, planos e relatórios são criados dentro do projeto-alvo; módulos da ferramenta são carregados da pasta onde `cicd.ps1` está instalado.

## Adaptadores
Python (Ruff/pytest); JavaScript/TypeScript (npm lint/test/build); Go (vet/test/build); Rust (fmt/test/build); C#/.NET (format/test/build); Java Maven/Gradle (validate/check/test/package/build). As ferramentas precisam estar no PATH. Wrappers, monorepos e projetos complexos ainda não têm suporte completo.

Sem `-Approve`, nenhuma etapa executa. Revise os comandos e o código de build antes de autorizar.
