const test = require("node:test");
const assert = require("node:assert/strict");
const { formatUpsAnalysis } = require("../out/upsInspector.js");

test("formats UPS dependency waves and structural critical path as read-only analysis", () => {
  const plan = {
    pipelineName: "fixture",
    jobs: [
      { id: "build", name: "Build", dependencies: [], requiredCapabilities: ["node"] },
      { id: "test", name: "Tests", dependencies: ["build"], requiredCapabilities: ["node"] }
    ]
  };
  const analysis = {
    summary: { jobCount: 2, dependencyCount: 1, groupCount: 2, maxParallelism: 1 },
    parallelGroups: [["build"], ["test"]],
    topologicalOrder: ["build", "test"],
    criticalPathLengthJobs: 2,
    criticalPathJobIds: ["build", "test"],
    diagnostics: []
  };
  const result = formatUpsAnalysis(plan, analysis);
  assert.match(result, /SOMENTE LEITURA/);
  assert.match(result, /Onda 1/);
  assert.match(result, /depende de: build/);
  assert.match(result, /CAMINHO CRÍTICO ESTRUTURAL \(2 jobs\)/);
  assert.match(result, /Nenhum executável foi iniciado/);
  assert.match(result, /não em tempo estimado/);
});

test("includes diagnostic severity and recommendations", () => {
  const result = formatUpsAnalysis(
    { pipelineName: "x", jobs: [{ id: "a", dependencies: [], requiredCapabilities: [] }] },
    {
      summary: { jobCount: 1, dependencyCount: 0, groupCount: 1, maxParallelism: 1 },
      parallelGroups: [["a"]],
      topologicalOrder: ["a"],
      criticalPathLengthJobs: 1,
      criticalPathJobIds: ["a"],
      diagnostics: [{
        code: "PIPELINE_SAMPLE",
        severity: "warning",
        jobIds: ["a"],
        message: "Review this job.",
        recommendation: "Inspect its prerequisites."
      }]
    }
  );
  assert.match(result, /\[WARNING\] PIPELINE_SAMPLE/);
  assert.match(result, /Inspect its prerequisites/);
});
