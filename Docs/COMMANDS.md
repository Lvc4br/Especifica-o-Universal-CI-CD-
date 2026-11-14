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
Python; JavaScript/TypeScript; Go; Rust; C#/.NET; Java Maven/Gradle; PHP/Composer; Ruby/Bundler; Lua; C/C++/CMake; Kotlin/Gradle; Swift; Dart; HTML/HTMLHint; CSS/Stylelint; SQL/SQLFluff. A segurança usa Gitleaks e Trivy; delivery cria ZIP local. As ferramentas precisam estar no PATH. Wrappers, monorepos e projetos complexos ainda não têm suporte completo.

Sem `-Approve`, nenhuma etapa executa. Revise os comandos e o código de build antes de autorizar.


## Workspaces e monorepos

```powershell
pwsh ./cicd.ps1 discover-projects -ProjectPath "D:\Repos\Monorepo"
pwsh ./cicd.ps1 run-workspaces -ProjectPath "D:\Repos\Monorepo"
pwsh ./cicd.ps1 run-workspaces -ProjectPath "D:\Repos\Monorepo" -Approve -TimeoutSeconds 1800
```

O descobridor procura manifestos e projetos em subdiretórios, respeitando as exclusões configuradas. Cada projeto recebe um plano e relatório próprios. Sem `-Approve`, a execução é simulada. A configuração de pipeline da raiz é aplicada a todos os projetos encontrados; revise cada plano antes de aprovar.


## Histórico e exportação de relatórios

```powershell
pwsh ./cicd.ps1 history -ProjectPath "D:\Projetos\MeuApp"
pwsh ./cicd.ps1 export-report -ProjectPath "D:\Projetos\MeuApp" -ReportFormat html
pwsh ./cicd.ps1 export-report -ProjectPath "D:\Projetos\MeuApp" -ReportFormat markdown
pwsh ./cicd.ps1 export-report -ProjectPath "D:\Projetos\MeuApp" -ReportPath "D:\Projetos\MeuApp\.cicd\reports\20261114-run.json" -ReportFormat html
```

Sem `-ReportPath`, exporta a execução mais recente. O arquivo de origem deve estar dentro de `.cicd/reports/`.
