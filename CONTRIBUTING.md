# Contribuindo

## Diretrizes

- Leia Docs/ARCHITECTURE.md e Docs/SECURITY.md antes de alterar o núcleo.
- Mantenha módulos independentes e adaptadores pequenos.
- Não marque funcionalidades como concluídas sem testes reproduzíveis.
- Não introduza dependências obrigatórias sem justificar o impacto.
- Preserve compatibilidade com PowerShell 7.2+.
- Documente limitações, pré-requisitos e códigos de saída.

## Fluxo recomendado

1. Abra uma issue descrevendo problema ou proposta.
2. Faça alterações pequenas e focadas.
3. Adicione testes para comportamentos novos e corrigidos.
4. Execute a suíte de testes localmente.
5. Atualize README, documentação e CHANGELOG quando aplicável.
6. Abra um pull request com resumo, testes e riscos.

## Padrão de commits

Preferir mensagens curtas no estilo Conventional Commits, por exemplo: feat, fix, docs, test, refactor e chore.

## Regra obrigatória de branches

**Não faça alterações diretamente na branch `main`.** Toda contribuição, inclusive documentação, configuração e workflows, deve ser feita em uma branch própria e integrada somente por Pull Request revisado e aprovado. Essa regra vale para todos os colaboradores, inclusive Arthur (@Chiizo-quent), e para agentes automatizados.

Consulte [`AGENTS.md`](AGENTS.md) para o procedimento obrigatório e os comandos Git. O modelo de Pull Request em `.github/PULL_REQUEST_TEMPLATE.md` deve ser preenchido em toda contribuição.
