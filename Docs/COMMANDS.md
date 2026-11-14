# Comandos

```powershell
pwsh ./cicd.ps1 help
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 run
pwsh ./cicd.ps1 run -Approve
pwsh ./cicd.ps1 run -Approve -TimeoutSeconds 900
pwsh ./cicd.ps1 status
```

## Pipeline
As opções `pipeline.check`, `pipeline.test` e `pipeline.build` controlam as categorias. O plano cria etapas apenas para tecnologias reconhecidas e marca ferramentas ausentes como BLOCKED. Sem `-Approve`, nenhum processo é iniciado.

## Adaptadores disponíveis
- Python: Ruff e pytest.
- JavaScript/TypeScript: npm lint/test/build (scripts npm podem estar ausentes).
- Go: vet, test e build.
- Rust: fmt check, test e build.
- C#/.NET: format check, test e build.
- Java: Maven validate/test/package ou Gradle check/test/build, selecionado por manifesto.

Ferramentas precisam estar no PATH. Java usa executáveis globais nesta versão. Wrappers, monorepos e projetos .NET multi-solução ainda não têm resolução específica.
