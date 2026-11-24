# Stack técnica

| Componente | Linguagem / tecnologia | Responsabilidade |
|---|---|---|
| Motor CLI e executor | PowerShell 7.2+ | Detecção, planejamento, comandos allowlisted, aprovação, execução e relatórios |
| Extensão VS Code | TypeScript / VS Code Extension API | UX, comandos, Tree View e adapter para motor local |
| GitHub App | TypeScript / Node.js / Probot | Recepção futura de eventos, orchestration e Check Runs |
| Contracts | TypeScript | Contratos compartilhados entre integrações |
| Persistência (fundação em PR) | SQL PostgreSQL | Delivery dedupe e jobs |
| CI do repositório | GitHub Actions / YAML | Testar e compilar monorepo |
| Diagramas | Mermaid | Arquitetura e fluxo |
| Execução de ferramentas | processos externos | Comandos de ferramentas instaladas no ambiente-alvo |

## Por que PowerShell no motor?
O motor existente é a fonte de verdade e já contém lógica de detecção, planejamento, execução, segurança de processo, relatório e adaptadores. Reescrevê-lo em outra linguagem agora aumentaria risco e duplicação. PowerShell 7.2+ oferece multiplataforma e integra-se com os executáveis de ferramentas de cada ecossistema.

## Por que TypeScript nas integrações?
TypeScript oferece suporte direto ao desenvolvimento da extensão VS Code e ao ecossistema Node.js/Probot do GitHub App. É a camada de integração, não substitui o motor.

## Ferramentas chamadas
O motor não compila/testa linguagens por si próprio: ele identifica projetos e chama ferramentas de CLI, usando adaptadores com comandos pré-definidos. As ferramentas devem estar instaladas, disponíveis no PATH e adequadas à versão/projeto.
