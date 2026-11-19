# Regras obrigatórias para alterações no repositório

Estas instruções se aplicam a todas as pessoas colaboradoras e a qualquer agente de IA que trabalhe neste repositório, incluindo o mantenedor e o colaborador convidado **Arthur (@Chiizo-quent)**.

## Regra principal: nunca trabalhar diretamente na `main`

- A branch `main` é a linha principal e protegida de desenvolvimento.
- **É proibido fazer alterações de código, documentação, configuração ou workflows diretamente na `main`.**
- Toda alteração deve ser desenvolvida em uma branch separada, criada a partir da versão mais recente de `main`.
- Nenhuma contribuição deve ser integrada à `main without) revisão e aprovação por Pull Request (PR).
- Não faça push direto para `main`, não use commits diretamente nela e não contorne as revisões.

## Procedimento obrigatório

1. Atualize as referências remotas:
   ```bash
   git fetch origin
   ```
2. Parta da `main` atualizada:
   ```bash
   git switch main
   git pull --ff-only origin main
   ```
3. Crie uma branch exclusiva para a tarefa:
   ```bash
   git switch -c tipo/descricao-curta
   ```
   Exemplos: `feat/novo-adaptador`, `fix/correcao-detector`, `docs/guia-instalacao`, `test/cobertura-executor`.
4. Faça e teste as alterações somente nessa branch.
5. Revise o diff antes de enviar:
   ```bash
   git status
   git diff --check
   git diff
   ```
6. Faça commits na branch de trabalho e publique-a:
   ```bash
   git add <arquivos>
   git commit -m "tipo: descrição objetiva"
   git push -u origin HEAD
   ```
7. Abra um Pull Request apontando a branch de trabalho para `main`. Descreva objetivo, arquivos afetados, testes executados, riscos e limitações.
8. Aguarde revisão e aprovação. Resolva os comentários e só então permita o merge.

## Regras para branches e colaboração

- Use uma branch por tarefa ou conjunto pequeno e coerente de alterações.
- Não trabalhe na branch de outra pessoa sem combinar previamente.
- Não force push em branches compartilhadas. Se for indispensável reescrever histórico em uma branch exclusivamente sua, comunique antes.
- Não faça merge da `main` para sua branch usando estratégias que descartem alterações. Resolva conflitos cuidadosamente.
- Não inclua alterações alheias à tarefa no mesmo commit ou PR.
- Não apague branches de outras pessoas.
- Não altere configurações de proteção, permissões, segredos ou workflows de publicação sem autorização explícita do mantenedor.

## Segurança e qualidade

- Nunca adicione tokens, senhas, chaves privadas, certificados ou arquivos `.env` ao Git.
- Não execute pipelines, scripts de instalação, builds ou testes de projetos desconhecidos sem revisar os comandos e suas dependências.
- Não declare uma funcionalidade concluída sem evidências e testes reproduzíveis.
- Atualize a documentação e o `CHANGELOG.md` quando a alteração afetar comportamento, comandos ou distribuição.
- Preserve a compatibilidade declarada com PowerShell 7.2+, salvo decisão aprovada em PR.

## Se você já estiver na main

Se houver alterações locais não commitadas, não as descarte. Preserve-as e mova o trabalho para uma branch antes de continuar. Se já tiver criado commits locais na `main`, não faça push: avise o mantenedor e proponha a transferência segura desses commits para uma branch.

## Autoridade e exceções

Somente o mantenedor do repositório pode autorizar uma exceção, e ela deve ser registrada na issue ou no PR correspondente. Uma autorização não permite sobrescrever trabalho de outra pessoa nem ignorar requisitos de segurança.

**Na dúvida, pare antes de alterar a `main` e peça orientação.**
