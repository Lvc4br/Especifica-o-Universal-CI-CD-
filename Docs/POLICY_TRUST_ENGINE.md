# Policy & Trust Engine — primeira versão

**Modo:** assessment-only. Esta versão avalia regras declarativas contra um plano UPS v1; não autoriza execução.

## Regras suportadas
- `max-jobs`: limita quantidade de jobs.
- `forbidden-executables`: identifica executáveis explicitamente proibidos.
- `required-capabilities`: exige que cada job declare capacidades mínimas.

Cada regra tem ID único e efeito:
- `block`: registra violação impeditiva.
- `require-review`: indica necessidade de revisão humana externa.
- `warn`: registra alerta não impeditivo.

## Resultado
- `compliant`: nenhuma regra produziu finding.
- `violations`: pelo menos um finding `block`.
- `review-required`: sem bloqueios, mas existe finding `require-review`.

Warnings são contabilizados separadamente. A avaliação não substitui controles de autorização no servidor ou runner.

## Limites e segurança
- Não executa nem autoriza comandos.
- Não cria nem registra aprovação humana.
- Não acessa secrets ou credenciais.
- Não contata, reserva ou provisiona runners.
- Não modifica o plano ou a política recebidos.
- A comparação de executáveis é textual e case-insensitive; não resolve PATH, symlinks, aliases ou equivalência entre comandos.
- O conjunto de regras é deliberadamente pequeno; não deve ser tratado como mecanismo completo de compliance.

## Evolução
Antes de qualquer execução, será necessário enforcement no componente confiável, identidade de aprovadores, trilha de auditoria imutável, política de expiração/revogação, proteção contra TOCTOU e testes adversariais.
