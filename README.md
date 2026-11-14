# Universal CI/CD

Ferramenta modular de integração e entrega contínuas para detectar, planejar, validar, testar, construir e reportar projetos de diferentes linguagens e ecossistemas.

> Estado atual: versão de desenvolvimento 0.3.0-dev. CLI modular, configuração inicial, validação estrutural básica, detecção por evidências e geração de plano não executável estão implementados. A execução real de lint, testes, builds, segurança e entrega ainda não está implementada.

## Requisitos
- PowerShell 7.2 ou superior.
- Git para clonar e trabalhar com repositórios.
- Ferramentas específicas serão necessárias quando seus adaptadores forem implementados.

## Começar
~~~powershell
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 plan
pwsh ./cicd.ps1 status
~~~

O comando `plan` verifica ferramentas no PATH e salva `.cicd/plans/latest-plan.json`. Ele não executa comandos do projeto. O arquivo gerado é substituído a cada nova geração de plano; a configuração do usuário não é sobrescrita.

## Comandos
| Comando | Estado |
|---|---|
| version | Implementado |
| init | Implementado |
| validate-config | Validação estrutural básica |
| detect | Detecção por arquivos e manifestos |
| plan | Plano não executável e inspeção de ferramentas |
| status | Implementado |
| check / test / build / security / report | Planejados |

## Estrutura
~~~text
Core/                 Logger e contratos de resultado
Modules/Config/       Configuração
Modules/Detector/     Detecção de tecnologias
Modules/Engine/       Plano de execução
Schemas/              JSON Schema da configuração
Tests/                Testes smoke
Docs/                 Arquitetura, roadmap, segurança e comandos
.github/workflows/    CI Windows e Ubuntu
.cicd/                Configuração, planos e relatórios locais
cicd.ps1              CLI
~~~

## Segurança
- Nenhum comando do projeto é executado por `detect` ou `plan`.
- A detecção é baseada em arquivos e manifestos; não prova que um projeto compile.
- Não executar scripts arbitrários automaticamente.
- Exigir aprovação explícita antes de implementar execução de comandos.
- Não armazenar segredos em configuração ou relatórios.
- Não marcar etapas não executadas como aprovadas.

## Documentação
- [Arquitetura](Docs/ARCHITECTURE.md)
- [Roadmap](Docs/ROADMAP.md)
- [Segurança](Docs/SECURITY.md)
- [Comandos](Docs/COMMANDS.md)
- [Contribuição](CONTRIBUTING.md)

Versão `0.3.0-dev`; ainda não é adequada para pipelines críticos.