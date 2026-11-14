# Universal CI/CD

Ferramenta modular de integração e entrega contínuas para detectar, validar, testar, construir e reportar projetos de diferentes linguagens e ecossistemas.

> Estado atual: versão de desenvolvimento 0.2.0-dev. O núcleo modular, configuração inicial, validação básica de configuração, detecção por evidências e contratos de resultado estão implementados. Adaptadores reais de lint, testes, build, segurança e entrega ainda serão desenvolvidos.

## Objetivos
- Oferecer uma interface única para projetos heterogêneos.
- Detectar linguagens, frameworks, gerenciadores e ferramentas instaladas.
- Executar verificações específicas por ecossistema por meio de ferramentas nativas.
- Separar detecção, validação, testes, build, segurança e entrega.
- Gerar relatórios rastreáveis em JSON.
- Evoluir para Windows e Linux e integrar GitHub Actions.

## Requisitos
- PowerShell 7.2 ou superior.
- Git é opcional para comandos locais e necessário para fluxos de integração com repositórios.
- Ferramentas de cada linguagem serão exigidas somente quando o respectivo adaptador for utilizado.

## Começar
Na raiz do repositório:
~~~powershell
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 validate-config
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 status
~~~
`init` cria `.cicd/config.json` sem sobrescrever uma configuração existente. `validate-config` valida o JSON e os campos obrigatórios atualmente suportados. `detect` identifica marcadores e apresenta arquivos como evidências; não executa código do projeto.

## Comandos
| Comando | Estado |
|---|---|
| version | Implementado |
| init | Implementado |
| validate-config | Implementado: validação estrutural básica |
| detect | Implementado: detecção básica por arquivos e manifestos |
| status | Implementado |
| check | Planejado |
| test | Planejado |
| build | Planejado |
| security | Planejado |
| report | Planejado |

## Estrutura
~~~text
Core/                 Logger e contratos de resultado
Modules/Config/       Criação e validação da configuração
Modules/Detector/     Detecção e evidências
Tests/                Testes smoke e integração
Docs/                 Arquitetura, roadmap, comandos e segurança
Templates/            Configurações iniciais futuras
.github/workflows/    CI do próprio projeto
.cicd/                Configuração e relatórios locais (gerados)
cicd.ps1              CLI e ponto de entrada
~~~

## Princípios de confiabilidade
1. Nunca apresentar uma etapa não executada como aprovada.
2. Diferenciar PASSED, FAILED, WARNING, SKIPPED e NOT_IMPLEMENTED.
3. Não executar scripts arbitrários do projeto sem configuração e consentimento explícitos.
4. Não sobrescrever arquivos do usuário silenciosamente.
5. Não armazenar segredos em configuração ou relatórios.
6. Registrar ferramentas, comandos e resultados efetivamente executados.

## Documentação
- [Arquitetura](Docs/ARCHITECTURE.md)
- [Roadmap](Docs/ROADMAP.md)
- [Segurança](Docs/SECURITY.md)
- [Comandos](Docs/COMMANDS.md)
- [Contribuição](CONTRIBUTING.md)

## Versão
`0.2.0-dev`. Ainda não é uma versão estável; consulte o roadmap e os resultados do CI antes de utilizar em automações críticas.