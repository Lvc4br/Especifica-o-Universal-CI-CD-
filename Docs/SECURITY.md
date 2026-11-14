# Segurança

## Garantias atuais
1. Detecção e planejamento não executam código.
2. Execução requer `-Approve`.
3. IDs de etapa selecionam adaptadores fixos no código.
4. Executáveis e argumentos são passados separadamente, sem shell intermediário.
5. Há timeout e captura de stdout/stderr.
6. Não há publicação, release ou deploy automático.

## Antes de aprovar
- Revise `.cicd/plans/latest-plan.json`.
- Revise scripts do `package.json`, configuração de testes e dependências.
- Não execute projetos desconhecidos com credenciais ou acesso administrativo.
- Para código não confiável, use VM/contêiner descartável, sem mounts sensíveis e com rede restrita. O executor não é sandbox.

## Segredos
A ferramenta mascara padrões comuns (token, password, bearer e tokens GitHub) antes de salvar stdout/stderr. Isso não é garantia: formatos não reconhecidos podem vazar. Prefira executar sem credenciais e revise relatórios antes de compartilhá-los.

A allowlist limita executáveis/argumentos, mas não torna seguros scripts npm. Aprovação significa consentimento para executar o código do projeto. Não use esta versão em pipelines críticos sem sandbox e revisão adicional.
