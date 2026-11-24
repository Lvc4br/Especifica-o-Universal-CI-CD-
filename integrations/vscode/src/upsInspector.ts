import type { PipelineIntelligence, UpsExecutionPlan } from "@universal-cicd/contracts";

/** Format a validated UPS plan and its static DAG analysis for a read-only report. */
export function formatUpsAnalysis(plan: UpsExecutionPlan, analysis: PipelineIntelligence): string {
  const jobs = new Map(plan.jobs.map(job => [job.id, job]));
  const lines = [
    "UNIVERSAL CI/CD — UPS INSPECTOR",
    "Modo: SOMENTE LEITURA / ANALYSIS-ONLY",
    `Pipeline: ${plan.pipelineName}`,
    `Jobs: ${analysis.summary.jobCount} | Dependências: ${analysis.summary.dependencyCount} | Ondas: ${analysis.summary.groupCount}`,
    `Paralelismo estrutural máximo: ${analysis.summary.maxParallelism}`,
    "",
    "GRAFO DE DEPENDÊNCIAS"
  ];
  analysis.parallelGroups.forEach((group, index) => {
    lines.push(`Onda ${index + 1} — ${group.length} job(s)`);
    for (const id of group) {
      const job = jobs.get(id);
      if (!job) continue;
      const title = job.name?.trim() || id;
      const deps = job.dependencies.length ? job.dependencies.join(", ") : "nenhuma";
      const capabilities = job.requiredCapabilities.length ? job.requiredCapabilities.join(", ") : "não declaradas";
      lines.push(`  • ${title} [${id}] | depende de: ${deps} | capabilities: ${capabilities}`);
    }
  });
  lines.push(
    "",
    `ORDEM TOPOLÓGICA: ${analysis.topologicalOrder.join(" → ")}`,
    `CAMINHO CRÍTICO ESTRUTURAL (${analysis.criticalPathLengthJobs} jobs): ${analysis.criticalPathJobIds.join(" → ")}`,
    "Nota: caminho crítico contado em quantidade de jobs, não em tempo estimado."
  );
  if (analysis.diagnostics.length) {
    lines.push("", "DIAGNÓSTICOS");
    for (const diagnostic of analysis.diagnostics) {
      lines.push(
        `[${diagnostic.severity.toUpperCase()}] ${diagnostic.code}: ${diagnostic.message}`,
        `  Jobs: ${diagnostic.jobIds.join(", ") || "nenhum"}`,
        `  Recomendação: ${diagnostic.recommendation}`
      );
    }
  }
  lines.push(
    "",
    "SEGURANÇA: este relatório valida e analisa a estrutura declarativa.",
    "Nenhum executável foi iniciado; nenhum runner foi contatado ou reservado.",
    "Este relatório não concede aprovação, autorização, credenciais ou sandbox."
  );
  return lines.join("\n");
}
