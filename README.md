# Universal CI/CD

Orquestrador modular de CI/CD para projetos de diferentes linguagens. PowerShell 7.2+, multiplataforma, com detecção, planejamento, execução aprovada, timeout, captura de saída e relatórios JSON.

> Estado: 0.4.0-dev. O executor inicial possui adaptadores Python (Ruff/pytest) e JavaScript/TypeScript (npm). Builds, segurança avançada, cobertura, bancos de dados, entrega e outras linguagens ainda estão em desenvolvimento.

## Início rápido
```powershell
pwsh ./cicd.ps1 init
# Edite .cicd/config.json: habilite pipeline.check e/ou pipeline.test.
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 run                 # simulação; não executa
pwsh ./cicd.ps1 run -Approve        # execução autorizada
pwsh ./cicd.ps1 run -Approve -TimeoutSeconds 900
```

A execução só ocorre com `-Approve`. O timeout padrão é 600 segundos por etapa. Os relatórios ficam em `.cicd/reports/`.

## Recursos
| Recurso | Estado |
|---|---|
| CLI, init sem sobrescrita e validação estrutural | Implementado |
| Detecção heurística e plano JSON | Implementado |
| Runner sem shell intermediário, argumentos separados | Implementado |
| Allowlist e aprovação explícita | Implementado |
| Timeout, stdout/stderr, exit code e duração | Implementado |
| Relatório JSON e redação heurística de segredos | Implementado |
| Python: Ruff e pytest | Adaptador inicial |
| JavaScript/TypeScript: npm lint/test | Adaptador inicial |
| Java, C#, Go, Rust, PHP, Ruby, Lua, SQL, HTML/CSS | Planejado |
| Build, segurança avançada, cobertura, artefatos e deploy | Planejado |

## Segurança
- `detect` e `plan` nunca executam código do projeto.
- `run` sem `-Approve` é simulação.
- IDs de etapa são mapeados para executáveis e argumentos fixos; o JSON não injeta comandos.
- Aprovar npm permite executar scripts definidos no `package.json`: revise-os antes.
- O executor não é sandbox. Para código não confiável, use VM/contêiner descartável, sem credenciais e com rede restrita.
- Mascaramento de logs é heurístico e não garante remover todos os segredos.
- Não há publicação ou deploy automático.

## Documentação
[Arquitetura](Docs/ARCHITECTURE.md) · [Roadmap](Docs/ROADMAP.md) · [Segurança](Docs/SECURITY.md) · [Comandos](Docs/COMMANDS.md) · [Contribuição](CONTRIBUTING.md)
