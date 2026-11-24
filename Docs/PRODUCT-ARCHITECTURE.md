# Universal CI/CD — arquitetura de produto

## Decisões estratégicas
- **Público: all:** iniciantes, desenvolvedores independentes, profissionais, equipes e empresas.
- **IA: opcional:** fluxos essenciais funcionam sem IA, conta ou conexão externa.
- **Distribuição: freemium:** núcleo local gratuito; recursos remotos/organizacionais podem compor planos pagos, após validação de custo e demanda.

## Objetivos
1. Preservar o motor PowerShell 7.2+ como fonte única de detecção, planejamento, execução e relatórios.
2. Oferecer duas superfícies integradas: VS Code e GitHub.
3. Compartilhar contratos versionados e semântica de resultados.
4. Separar coordenação remota da execução de código não confiável.
5. Manter IA, telemetria e serviços pagos opcionais e transparentes.

## Arquitetura lógica
```text
                  Universal CI/CD
          Shared Contracts + JSON Schemas
                 /             \
                /               \
       VS Code Extension      GitHub App
       TypeScript             Webhooks / Checks
       UX e execução local    Coordenação remota
             |                      |
             v                      v
       PowerShell Engine      Execution Provider
       CLI existente          GitHub Actions runner
       pwsh 7.2+               ou runner do cliente
             \                      /
              \                    /
                  RunReport comum
                         |
                Optional AI Provider
              explicações e sugestões
```

## Componentes e fronteiras

### Engine
Continua em PowerShell 7.2+: detector, configuração, planner, registry/allowlist, executor, histórico e relatórios. Integrações usam a CLI e JSON validado; não duplicam lógica. Simulação permanece padrão e execução exige aprovação explícita. O executor não aceita comandos arbitrários.

### Shared contracts
Pacote independente de VS Code/GitHub/IA. Define versão do protocolo, requests, planos, estados, eventos, relatórios e capacidades. JSON Schema valida fronteiras; tipos TypeScript devem ser testados contra schemas. Mudança incompatível exige nova versão principal.

### VS Code
Ativação sob demanda, comandos, Tree View, progresso, Output Channel e relatórios. Descobre PowerShell 7.2+ e o motor. Invoca processos com `spawn(executable, args, { shell: false })`, sem interpolar comandos, com timeout/cancelamento. Mostra plano e exige confirmação explícita. Fluxo local não exige login nem IA. Acessibilidade: teclado, leitores de tela, foco visível, alto contraste e mensagens claras.

### GitHub App
Recebe webhooks assinados, valida assinatura, deduplica delivery IDs e coordena jobs. Permissões mínimas: Metadata read e Pull requests read; Checks write só quando Check Runs forem implementados. Não executa código de PR no servidor web. Orquestra runner isolado, recebe resultado estruturado e publica Checks. Deve ter idempotência, retry com backoff, fila e tokens curtos.

### Execution providers
Primeiro provider recomendado: GitHub Actions com runner efêmero. O runner executa o mesmo motor PowerShell e devolve RunReport. Runner próprio pode vir depois. Isolamento, limites CPU/memória/tempo e descarte do workspace são responsabilidades do provider; o App web não é sandbox.

### IA opcional
Interface substituível. Casos iniciais: explicar falhas, resumir logs e sugerir próximos passos. Desativada por padrão, consentimento explícito, contexto mínimo e redação de segredos. Não enviar tokens, variáveis de ambiente ou arquivos completos por padrão. IA não aprova execução, não altera arquivos e não inicia deploy.

### Freemium
Entitlement vive em serviço separado e controla apenas capacidades remotas/comerciais. Indisponibilidade de conta/rede não bloqueia detecção, planejamento, execução local aprovada ou relatórios locais. Proposta de planos (não lançados): Free (núcleo local e GitHub básico com cota), Pro (histórico/insights ampliados), Team (políticas e visibilidade compartilhadas), Enterprise (SSO, auditoria, retenção e runners privados). Preços e cotas dependem do beta.

## Fluxos

### VS Code local
1. Descobrir workspace e engine.
2. Consultar versão/disponibilidade.
3. Detectar e planejar sem efeitos colaterais.
4. Validar JSON e mostrar plano.
5. Solicitar aprovação explícita.
6. Executar e exibir progresso/relatório.

### Pull Request
1. Receber webhook e validar assinatura/delivery ID.
2. Validar instalação, repositório, evento e permissões.
3. Enfileirar workflow em runner isolado.
4. Runner faz checkout do SHA imutável e executa engine.
5. Publicar resultado estruturado e Check Run.
6. Repetir falhas transitórias de forma idempotente.

## Segurança e privacidade
- Tratar payloads, nomes de branches e conteúdo de PR como entrada não confiável.
- Sem shell intermediário, comandos interpolados ou credenciais em argumentos.
- Webhook com assinatura, replay protection e idempotência.
- Privilégio mínimo, tokens curtos e segredos redigidos.
- Runner efêmero sem secrets de produção para PRs não confiáveis.
- Dependências fixadas e revisão de supply chain.
- Telemetria opt-in e mínima; não coletar código-fonte por padrão.
- Definir retenção, exportação e exclusão antes da beta.

## Decisões pendentes
Hospedagem/fila do App, identidade/cobrança, cotas/preços, provider de IA/região, matriz de runners e retenção. Não codificar premissas antes de avaliar segurança, privacidade e custos.
