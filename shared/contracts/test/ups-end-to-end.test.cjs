const test = require("node:test");
const assert = require("node:assert/strict");
const example = require("../../../Docs/examples/ups-python.json");
const {
  validateUpsPipeline,
  generateUpsExecutionPlan,
  analyzePipelineIntelligence
} = require("../dist/index.js");

test("official UPS Python example passes validation, planning and DAG analysis end to end", () => {
  const validation = validateUpsPipeline(example);
  assert.equal(validation.valid, true, JSON.stringify(validation.issues));
  const planned = generateUpsExecutionPlan(example);
  assert.equal(planned.valid, true);
  assert.equal(planned.plan.executionMode, "plan-only");
  assert.equal(planned.plan.jobs.length, 1);
  assert.equal(planned.plan.jobs[0].steps.length, 2);
  assert.deepEqual(planned.plan.jobs[0].steps.map(step => step.executable), ["ruff", "python"]);
  const analysis = analyzePipelineIntelligence(planned.plan);
  assert.equal(analysis.valid, true);
  assert.deepEqual(analysis.analysis.parallelGroups, [["quality"]]);
  assert.equal(analysis.analysis.criticalPathLengthJobs, 1);
  assert.equal(analysis.analysis.mode, "analysis-only");
});
