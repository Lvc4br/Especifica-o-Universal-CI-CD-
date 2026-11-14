# Universal CI/CD

Ferramenta modular de integração e entrega contínuas para detectar, validar, testar, construir e reportar projetos de diferentes linguagens e ecossistemas.

> Estado inicial: repositório inicializado com a estrutura de arquitetura e o bootstrap PowerShell. Validadores por linguagem, testes reais, verificações de segurança e publicação serão implementados por etapas; não são considerados concluídos nesta versão.

## Objetivos

- Oferecer uma interface única para projetos heterogêneos.
- Detectar linguagens, frameworks, gerenciadores e ferramentas instaladas.
- Executar verificações específicas por ecossistema por meio de ferramentas nativas.
- Separar detecção, validação, testes, build, segurança e entrega.
- Gerar relatórios rastreáveis em JSON.
- Evoluir para Windows e Linux e integrar GitHub Actions.

## Requisitos iniciais

- PowerShell 7.2 ou superior.
- Git (opcional para os comandos locais iniciais; necessário para integração com repositórios).
- Ferramentas de cada linguagem serão instaladas somente quando o respectivo adaptador for utilizado.

## Começar

No terminal, a partir da raiz do repositório:

~~~powershell
pwsh ./cicd.ps1 version
pwsh ./cicd.ps1 init
pwsh ./cicd.ps1 detect
pwsh ./cicd.ps1 status
~~~

O comando init cria .cicd/config.json sem sobrescrever uma configuração existente. Detect identifica arquivos e marcadores conhecidos; detecção não significa que a tecnologia já tenha validadores funcionais. Status apresenta a configuração e os relatórios locais.

## Comandos previstos

| Comando | Estado do bootstrap |
|---|---|
| version | Implementado |
| init | Implementado |
| detect | Implementado (detecção básica por arquivos) |
| status | Implementado |
| check | Planejado: ainda não executa validadores |
| test | Planejado |
| build | Planejado |
| security | Planejado |
| report | Planejado |

## Estrutura

~~~text
Core/                 Núcleo, logging e tratamento de erros
Modules/              Detectores, configuração, validadores e adaptadores
Tests/                Testes unitários e de integração
Docs/                 Arquitetura, instalação, comandos e segurança
Templates/            Configurações iniciais por ecossistema
.github/workflows/    Automação do próprio repositório
.cicd/                Configuração e relatórios locais (gerados; ignorados pelo Git)
cicd.ps1              Ponto de entrada PowerShell
~~~

## Documentação

- [Arquitetura](Docs/ARCHITECTURE.md)
- [Roadmap](Docs/ROADMAP.md)
- [Segurança](Docs/SECURITY.md)
- [Comandos](Docs/COMMANDS.md)
- [Contribuição](CONTRIBUTING.md)

## Princípios de confiabilidade

1. Nunca apresentar uma etapa não executada como aprovada.
2. Diferenciar PASSED, FAILED, WARNING e SKIPPED nos resultados.
3. Não executar scripts arbitrários do projeto sem configuração e consentimento explícitos.
4. Não sobrescrever arquivos do usuário silenciosamente.
5. Não armazenar segredos em arquivos de configuração ou relatórios.
6. Registrar ferramentas, comandos e resultados efetivamente executados.

## Versão

Bootstrap inicial: 0.1.0-dev. A versão estável será definida após testes locais e revisão dos módulos.
