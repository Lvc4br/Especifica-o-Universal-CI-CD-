# Política de segurança

## Escopo

Esta política se aplica ao Universal CI/CD e aos arquivos mantidos neste repositório.

## Reportar vulnerabilidades

Não publique credenciais, tokens, provas de conceito exploráveis ou detalhes de vulnerabilidades não corrigidas em issues públicas.

Se o recurso de *Private vulnerability reporting* estiver habilitado no GitHub, use a aba **Security** do repositório para enviar um relato privado. Caso não esteja disponível, entre em contato diretamente com o mantenedor por um canal privado antes de divulgar os detalhes.

Inclua, quando possível:
- versão ou commit afetado;
- impacto e condições necessárias para reproduzir;
- passos mínimos de reprodução;
- sugestão de mitigação, se conhecida.

## Aviso sobre versões experimentais

Versões `-dev` e beta não devem ser usadas em produção. O executor não é sandbox e pode executar scripts, plugins e dependências dos projetos autorizados. Use ambientes descartáveis sem credenciais para avaliar projetos não confiáveis.

## Divulgação

Solicita-se que o relato seja mantido privado até que o mantenedor tenha tido oportunidade razoável de avaliar e corrigir o problema. Não há prazo de resposta ou SLA garantido para versões experimentais.
