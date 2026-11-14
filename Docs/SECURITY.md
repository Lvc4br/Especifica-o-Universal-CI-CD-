# Segurança

## Regras obrigatórias

1. Não executar scripts do projeto automaticamente durante detecção.
2. Não avaliar conteúdo de configuração como código.
3. Não executar comandos montados por concatenação de strings não confiáveis.
4. Preferir executáveis e argumentos separados; validar caminhos e opções.
5. Não registrar tokens, senhas, chaves privadas ou variáveis secretas.
6. Não sobrescrever arquivos sem confirmação explícita.
7. Não publicar pacotes, criar releases ou realizar deploy sem autorização.
8. Tratar nomes de arquivos, manifestos e saídas de ferramentas como dados não confiáveis.

## Execução de ferramentas

Antes de executar adaptadores, o sistema deverá informar o executável, argumentos, diretório de trabalho e efeitos esperados. A configuração poderá habilitar etapas específicas, mas não deverá permitir execução arbitrária irrestrita.

## Segredos

Segredos devem ser fornecidos por variáveis de ambiente ou mecanismo seguro do provedor de CI. Nunca devem ser armazenados em .cicd/config.json, commits, relatórios ou logs.

## Relatórios

Remover ou mascarar valores de variáveis conhecidas como secret, token, password, key e credential. A redação deve ocorrer antes da persistência dos logs.

## Modelo de ameaça inicial

Considerar repositórios não confiáveis, dependências comprometidas, comandos maliciosos em scripts de pacote, caminhos manipulados e vazamento acidental de credenciais.
