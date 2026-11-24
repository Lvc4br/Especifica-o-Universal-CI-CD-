# Organização da equipe — Universal CI/CD

## Estrutura e autoridade

O projeto é liderado por **Luca**, responsável pelo produto e pela implementação da base técnica. As responsabilidades abaixo organizam a colaboração sem criar dependências artificiais: cada pessoa contribui dentro de sua área, e as decisões finais de escopo e direção permanecem com o mantenedor.

| Pessoa | Responsabilidade principal | Escopo |
|---|---|---|
| **Luca — mantenedor e responsável técnico** | Liderança do projeto e implementação da base completa | Arquitetura, motor, monorepo, contratos, extensão VS Code, GitHub App, segurança, integração, releases e decisões técnicas/produto |
| **Higor — gerenciamento e validação** | Gestão e acompanhamento do projeto | Organização das tarefas, acompanhamento de prazos e entregas, validação de requisitos, revisão funcional e registro de riscos/pendências |
| **Arthur — design futuro** | Design e layout nas etapas planejadas | Identidade visual, experiência de uso, fluxos, layout e refinamento da interface quando a etapa visual for iniciada |

## Modelo de trabalho

### Luca
- Define prioridades, escopo e critérios técnicos.
- Mantém a arquitetura coerente entre motor, extensão e GitHub.
- Implementa e integra a fundação do produto.
- Aprova decisões que alterem arquitetura, segurança, distribuição ou roadmap.
- Coordena revisões e integração de Pull Requests.

### Higor
- Mantém visão do andamento e das dependências.
- Confere se entregas atendem aos requisitos e critérios de aceite.
- Registra bugs, riscos, inconsistências e itens que precisam de retrabalho.
- Ajuda a manter o backlog organizado e as entregas verificáveis.
- Não precisa assumir implementação técnica para validar uma entrega.

### Arthur
- Entra prioritariamente nas fases de experiência e apresentação visual.
- Propõe e desenvolve identidade visual, componentes, layouts e fluxos de interface.
- Trabalha sobre os contratos e componentes funcionais acordados, evitando alterar o motor ou os limites de segurança sem alinhamento.
- As contribuições de design passam por revisão e integração no fluxo normal de Pull Request.

## Processo de entrega

1. Luca define o objetivo técnico e abre ou atribui uma tarefa.
2. A implementação é desenvolvida em branch própria, nunca diretamente em `main`.
3. Higor valida comportamento, requisitos e critérios de aceite.
4. Arthur contribui com design/layout quando a tarefa envolver a camada visual.
5. Luca revisa a integração e decide a liberação do Pull Request.
6. A entrega só é considerada concluída depois dos testes e da revisão aplicáveis.

## Princípios de colaboração

- A responsabilidade de cada pessoa não implica acesso irrestrito a segredos, configurações ou permissões.
- Mudanças em segurança, execução de código, runners, permissões e publicação exigem revisão técnica.
- Nenhuma pessoa deve sobrescrever trabalho de outra ou alterar branches compartilhadas sem alinhamento.
- O histórico de decisões e entregas deve permanecer registrado em issues, documentação e Pull Requests.
- A organização pode evoluir conforme o projeto crescer; alterações de responsabilidade devem ser acordadas e documentadas.
