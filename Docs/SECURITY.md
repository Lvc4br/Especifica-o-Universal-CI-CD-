# Segurança

## Controles implementados
- Detecção e planejamento não executam código do projeto.
- Execução requer `-Approve`.
- IDs de etapa são mapeados para argumentos estáticos em allowlist.
- Processos são iniciados sem shell intermediário, com timeout e captura de saída.
- Não há deploy ou publicação automática.

## Risco residual
Aprovar uma etapa autoriza a execução de ferramentas que podem carregar plugins, scripts e código de build do projeto: npm, Maven, Gradle, Cargo, Go e dotnet. Revise manifests, scripts e dependências antes da aprovação.

O runner não é sandbox: não limita rede, CPU, memória, filesystem ou permissões do processo. Para código não confiável, use VM/contêiner descartável, sem credenciais nem mounts sensíveis.

A redação de stdout/stderr cobre apenas padrões comuns. Não garante remoção de segredos. Evite credenciais no ambiente de execução e revise relatórios antes de compartilhá-los.
