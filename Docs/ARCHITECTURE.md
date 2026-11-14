# Arquitetura do Universal CI/CD

## Camadas atuais
~~~text
cicd.ps1 (CLI)
  |-- Core/Logger.ps1
  |-- Core/Result.ps1
  |-- Modules/Config/Config.ps1
  |-- Modules/Detector/Detector.ps1
~~~
A CLI carrega os módulos em ordem determinística e mantém a interface de terminal. O Core fornece logging e um contrato comum para resultados. Config administra a criação e validação estrutural do arquivo local. Detector examina arquivos e manifestos sem executar código do projeto.

## Contrato de resultado
`New-CicdResult` produz um objeto com `id`, `name`, `status`, `startedAt`, `finishedAt`, `durationMs`, `tool`, `command`, `exitCode`, `summary` e `artifacts`.
Status aceitos: `PASSED`, `FAILED`, `WARNING`, `SKIPPED` e `NOT_IMPLEMENTED`. O contrato existe; a orquestração completa e o preenchimento de métricas ainda serão implementados.
`Get-CicdExitCode` retorna 1 quando há falha, 2 quando há etapa não implementada e 0 nos demais casos.

## Configuração
A configuração local é `.cicd/config.json`, com `schemaVersion` igual a `1.0`. `validate-config` verifica seções obrigatórias, versão do schema, nome do projeto e booleanos do pipeline. Validação formal via JSON Schema ainda está no roadmap.

## Detector
O detector identifica linguagens e indícios de frameworks por extensões e manifestos. O resultado inclui contagem de arquivos, extensões, evidências relativas e horário da varredura. Evidência de arquivo não prova que dependências estejam instaladas ou que o projeto compile.

## Próximas camadas
- Engine/orquestrador e plano de execução.
- Adaptadores de validação, teste e build por ecossistema.
- Segurança, relatórios e entrega.
- Aprovação explícita antes de executar comandos externos ou publicar artefatos.