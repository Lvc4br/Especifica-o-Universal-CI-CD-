# Estratégia comercial e sustentabilidade do Universal CI/CD
Status: hipótese de negócio, não decisão final.

## Princípios
- Preservar o núcleo open-source e o acesso a funcionalidades essenciais de CI/CD.
- Não bloquear o usuário por artificialmente limitar formatos ou interoperabilidade.
- Cobrar principalmente por conveniência operacional, escala, colaboração, governança, observabilidade, suporte e serviços gerenciados.
- AI opt-in: usuário escolhe provedor, modelo, orçamento e dados que podem ser enviados; funcionalidades determinísticas continuam operacionais sem IA.
- Nunca vender dados de código, logs ou contexto do cliente.
- Não usar IA para executar, aprovar ou conceder permissões sem controles explícitos.
- Transparência de custos e limites de uso.

## Hipótese de tiers
### Community (gratuito)
Uso local, pipeline format, validação, planejamento, integrações essenciais, configurações básicas, extensões comunitárias e documentação. Limites razoáveis em serviços hospedados para controlar custo, não artificialmente no motor local.

### Pro
Para desenvolvedores individuais: histórico/insights hospedados opcionais, conveniência de sync, personalização, recursos de IA com limites explícitos, integrações premium opcionais e experiência avançada.

### Team
Colaboração, políticas compartilhadas, painel, gestão de projetos, controles, auditoria, identidade e integração de equipe. Cobrança por assento ou uso transparente, a validar.

### Enterprise
SSO, controles de organização, governança, auditoria avançada, implantação privada, SLA, suporte, conformidade, políticas e integrações customizadas.

### Cloud/Runner usage
Cobrança separada e transparente por recursos computacionais, armazenamento e duração de execução. Não subsidiar execução ilimitada; permitir runners próprios e alternativas local/self-hosted.

## IA e interatividade
- Chat contextual para pipeline, logs, configuração e diagnóstico, com citações de artefatos e links para linhas/etapas.
- IA pode explicar, sugerir, gerar drafts de mudanças e classificar falhas.
- Toda alteração sugerida deve aparecer em diff e requer aprovação humana.
- Modelo/provedor substituível; fallback determinístico; sem lock-in.
- Redação e minimização de dados, consentimento antes de enviar contexto, e políticas por workspace.
- Limites, orçamento, cache e métricas de consumo visíveis.
- Sem treinamento nos dados privados do cliente por padrão.

## Distribuição e aquisição
- Extensão VS Code como porta de entrada e UX.
- CLI e pipeline contract para uso em qualquer editor/CI.
- GitHub App para status, planejamento, comentários contextualizados e workflow controlado.
- Templates, exemplos e plugins com revisão de segurança.
- Conteúdo técnico, docs, community contribution e projetos open-source.

## Métricas de validação antes de monetizar
- Usuários ativos semanais/mensais e retenção em 30/90 dias.
- Pipelines planejados e execuções, sucesso e failure recovery.
- Tempo economizado por diagnóstico, setup e debugging.
- Conversão para paid, churn, CAC, LTV e margem.
- Custo de inference e runner por usuário/workspace.
- Incidentes de segurança e confiabilidade.
- Entrevistas e pilotos com desenvolvedores e equipes.

## Hipóteses de preço (experimentais, Brasil/internacional)
- Individual: testar faixa de US$ 5–12/mês (ou equivalente local), somente quando Pro entregar valor recorrente.
- Team: testar US$ 10–25/usuário/mês; custos de runner separados.
- Enterprise: negociação baseada em implantação, governança, suporte, escala e requisitos.
Esses valores são hipóteses para entrevistas e experimentos, não preço publicado.

## Roadmap de validação comercial
1. Entrevistas sem vender; identificar problemas frequentes e willingness-to-pay.
2. Beta aberta gratuita, medir retenção e custo.
3. Pilotar Team com 3–5 equipes; cobrar apenas por benefícios claramente entregues.
4. Publicar pricing transparente, uso e limites.
5. Revisar tiers com dados, feedback e custos.

## Proteção do projeto e governança
- Documentar licença, marca, contributor agreements e política de segurança antes de crescimento.
- Avaliar dual licensing ou licença de módulos comerciais apenas com aconselhamento jurídico e sem retroativamente retirar direitos dos contribuidores.
- Não vender promessa de superioridade ou certificação inexistente.
- Construir comunidade e roadmap público com mecanismos de feedback.
