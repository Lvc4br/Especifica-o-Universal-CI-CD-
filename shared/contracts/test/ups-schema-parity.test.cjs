const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "../universal-pipeline.schema.json"), "utf8"));
const validatorSource = fs.readFileSync(path.join(__dirname, "../src/ups-validator.ts"), "utf8");

test("UPS schema and runtime validator share the 500-job implementation bound", () => {
  assert.equal(schema.properties.jobs.maxProperties, 500);
  assert.match(validatorSource, /Object\.keys\(jobs\)\.length>500/);
  assert.match(validatorSource, /UPS_JOB_LIMIT/);
});

test("UPS schema and runtime validator enforce job ID and uniqueness rules", () => {
  assert.equal(schema.properties.jobs.propertyNames.pattern, "^[A-Za-z0-9_-]+$");
  assert.equal(schema.$defs.job.properties.needs.uniqueItems, true);
  assert.equal(schema.$defs.job.properties.runsOn.uniqueItems, true);
  assert.match(validatorSource, /UPS_JOB_ID/);
  assert.match(validatorSource, /UPS_DUPLICATE_DEPENDENCY/);
  assert.match(validatorSource, /UPS_DUPLICATE_CAPABILITY/);
});
