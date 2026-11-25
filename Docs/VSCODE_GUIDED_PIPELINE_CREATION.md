# Assistente de criação de pipeline UPS

O comando **Universal CI/CD: Criar pipeline a partir de scripts Node.js** cria um primeiro arquivo UPS v1 a partir de scripts já declarados no `package.json` da raiz do workspace.

## Fluxo
1. Lê apenas o `package.json` da raiz, com limite de 256 KB.
2. Apresenta até 100 scripts nomeados com identificadores permitidos.
3. O usuário escolhe explicitamente quais scripts declarar.
4. Gera um único job sequencial com chamadas de argumento separadas: `npm run <script>`.
5. Valida o objeto com o validador UPS compartilhado antes de oferecer o salvamento.
6. Sugere `.cicd/pipeline.ups.json`, abre o arquivo e recomenda revisão/UPS Inspector.

## Garantias e limites
- Nenhum script npm é executado durante a geração.
- Não instala dependências nem consulta rede.
- Não cria segredos ou permissões.
- O arquivo só é escrito depois da seleção explícita e validação UPS.
- Se o destino já existir, a extensão não o substitui; escolha outro local/nome.
- A versão inicial gera templates apenas para Node.js. Outras tecnologias são detectadas pelo analisador, mas ainda não possuem geradores específicos.
- A geração não é prova de que os comandos funcionarão. Revise scripts, lockfile, runtime e ambiente antes de aprovar qualquer execução.

O UPS descreve executáveis e argumentos. A geração e a inspeção são operações distintas de executar um pipeline.
