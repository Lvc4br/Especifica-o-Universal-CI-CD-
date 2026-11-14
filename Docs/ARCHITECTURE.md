# Arquitetura do Universal CI/CD

## 1. Objetivo

Fornecer uma interface consistente para orquestrar ferramentas nativas de cada ecossistema, mantendo os adaptadores desacoplados do núcleo.

## 2. Princípios

- Modularidade: cada domínio possui responsabilidade delimitada.
- Adaptadores nativos: preferir ferramentas consolidadas do ecossistema.
- Detecção não é validação: reconhecer arquivos não comprova que um projeto compila ou passa nos testes.
- Resultados honestos: etapas não executadas devem ser SKIPPED ou NOT_IMPLEMENTED, nunca PASSED.
- Segurança por padrão: comandos externos exigem seleção explícita, validação de argumentos e registro.
- Portabilidade: evitar dependência exclusiva de recursos do Windows no núcleo.

## 3. Camadas propostas

~~~text
CLI (cicd.ps1)
    |
    v
Core / Orchestrator
    |
    +-- Config
    +-- Detector
    +-- Validators
    +-- Testing
    +-- Builder
    +-- Security
    +-- Delivery
    +-- GitHub
    +-- Reporter
    |
    v
Native ecosystem tools
~~~

### CLI

Recebe comandos, valida opções e apresenta resultados. PowerShell 7 é o primeiro frontend; a lógica de domínio deve permanecer reutilizável.

### Core

Coordena etapas, contexto de execução, logging, erros e contratos de resultado.

### Config

Lê e valida .cicd/config.json. Deve preservar configurações existentes e rejeitar propriedades inválidas quando o schema estiver disponível.

### Detector

Identifica linguagens, frameworks, gerenciadores e ferramentas instaladas. Deve registrar evidências (arquivos/manifestos) e nível de confiança.

### Validators, Testing e Builder

Executam adaptadores específicos. Cada adaptador declara pré-requisitos, comandos, arquivos de saída, códigos de saída e limitações.

### Security

Verifica dependências, segredos e configurações. Não envia dados ou segredos para serviços externos sem autorização.

### Delivery e GitHub

Preparam artefatos e integração com pipelines remotos. Publicação e deploy exigem configuração e aprovação explícitas.

### Reporter

Produz resultados JSON e resumos humanos. Um relatório deve incluir versão da ferramenta, ambiente, horário, etapas executadas e status.

## 4. Contrato de resultado

Cada etapa deverá retornar, no mínimo:

- id e nome da etapa;
- status: PASSED, FAILED, WARNING, SKIPPED ou NOT_IMPLEMENTED;
- início, término e duração;
- ferramenta e versão, quando aplicável;
- comando executado (sem valores secretos);
- código de saída;
- resumo e caminho de artefatos.

## 5. Fluxo planejado

1. Carregar e validar configuração.
2. Detectar projeto e ferramentas disponíveis.
3. Construir plano de execução.
4. Exibir plano e obter consentimento quando houver comandos externos.
5. Executar etapas habilitadas.
6. Consolidar resultados e gerar relatório.
7. Retornar código de saída coerente com o resultado.

## 6. Estado atual

O bootstrap inicial contém uma CLI PowerShell simples com version, init, detect e status. Ainda não há orquestrador modular, validadores, executor de comandos, testes automatizados ou pipeline de entrega.
