# Pipeline Intelligence Engine

**Status:** v1 inicial — análise estrutural determinística.  
**Modo:** analysis-only; recebe um plano UPS v1 gerado e não altera nem executa o pipeline.

## Responsabilidades
- Validar defensivamente o grafo de dependências.
- Detectar IDs duplicados, dependências repetidas, autorreferência, referências ausentes e ciclos.
- Produzir ordenação topológica estável e grupos por profundidade.
- Identificar jobs independentes, terminais, fan-out e caminho crítico estrutural.
- Emitir diagnósticos com código, severidade, jobs envolvidos e recomendação.

## Métricas e limites
criticalPathLengthJobs conta jobs no maior caminho de dependências. Não é duração, latência ou previsão de tempo. maxParallelism é a maior quantidade de jobs na mesma onda estrutural; não representa capacidade real de runners nem garante paralelismo em execução.

O desempate é ordinal e determinístico. A ordem de entrada não deve alterar a análise.

## Segurança
Não inicia processos, acessa ou reserva runners, autoriza execução, acessa secrets, modifica o plano, usa IA ou envia dados a serviços externos.

## Algoritmo
Ordenação topológica de Kahn com fila lexical estável. Profundidade e melhor caminho são calculados durante a travessia. Se nem todos os jobs forem processados, os jobs restantes são reportados como envolvidos no ciclo. Travessia O(V + E), além dos custos de ordenação lexical.

## Próximas evoluções
1. Grafos grandes e benchmarks reproduzíveis.
2. Duração histórica confiável e opt-in para análise temporal.
3. Políticas explicáveis e análise de impacto de falhas.
4. Integração VS Code/GitHub após revisão dos contratos e UX.
