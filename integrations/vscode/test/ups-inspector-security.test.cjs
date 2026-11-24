const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/extension.ts"), "utf8");
const inspector = source.split("async function inspectUpsFile(")[1]?.split("async function execute(")[0] ?? "";

test("UPS inspector is bounded and does not invoke the process executor", () => {
  assert.ok(inspector.length > 0);
  assert.match(inspector, /showOpenDialog/);
  assert.match(inspector, /bytes\.byteLength > 1_000_000/);
  assert.match(inspector, /Object\.keys\(jobs\)\.length > 500/);
  assert.match(inspector, /report\.slice\(0, 100_000\)/);
  assert.doesNotMatch(inspector, /runEngineCommand|executeCommand\(/);
});

test("UPS inspector uses shared validation, planning and DAG analysis contracts", () => {
  assert.match(inspector, /validateUpsPipeline\(document\)/);
  assert.match(inspector, /generateUpsExecutionPlan\(document\)/);
  assert.match(inspector, /analyzePipelineIntelligence\(planned\.plan\)/);
});
