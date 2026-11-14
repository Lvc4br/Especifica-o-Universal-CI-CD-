# Arquitetura

~~~text
cicd.ps1
  |-- Core/Logger.ps1
  |-- Core/Result.ps1
  |-- Modules/Config/Config.ps1
  |-- Modules/Detector/Detector.ps1
  |-- Modules/Engine/Plan.ps1
~~~

## Responsabilidades
- **CLI:** interface e roteamento dos comandos.
- **Core:** logs e contrato de resultados padronizados.
- **Config:** criação sem sobrescrita e validação estrutural.
- **Detector:** identifica tecnologias por arquivos/manifestos, sem executar código.
- **Engine/Plan:** verifica disponibilidade de ferramentas no PATH e cria um plano declarativo. Não inicia subprocessos nem executa scripts do projeto.

## Plano de pipeline
O plano contém versão, projeto, tecnologias detectadas, ferramentas encontradas, etapas, comandos propostos, status, justificativa e declaração explícita de que nada foi executado. Status de planejamento incluem `PLANNED`, `BLOCKED`, `DISABLED`, `NOT_APPLICABLE` e `NOT_IMPLEMENTED`; esses estados não devem ser confundidos com resultado de execução.

O plano é salvo em `.cicd/plans/latest-plan.json`. Esse artefato é regenerável e será substituído na próxima chamada de `plan`.

## Segurança e limites
A existência de uma ferramenta no PATH não garante dependências do projeto, configuração correta ou execução bem-sucedida. Comandos sugeridos são dados informativos. Um executor futuro deverá validar argumentos, diretório de trabalho, timeout, saída, cancelamento e consentimento.

O arquivo `Schemas/config.schema.json` documenta o contrato formal da configuração. O validador PowerShell atual realiza validação estrutural própria; ainda não interpreta integralmente o JSON Schema.