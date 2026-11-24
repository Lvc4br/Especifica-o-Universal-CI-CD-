const test = require("node:test");
const assert = require("node:assert/strict");
const { buildEngineArgs } = require("../out/engineClient.js");

test("builds an argument vector without shell command concatenation", () => {
  const args = buildEngineArgs(
    "C:\\Universal CI-CD\\cicd.ps1",
    "status",
    "C:\\Users\\Developer\\My Project"
  );

  assert.deepEqual(args, [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-File",
    "C:\\Universal CI-CD\\cicd.ps1",
    "status",
    "-ProjectPath",
    "C:\\Users\\Developer\\My Project"
  ]);
});

test("does not approve a pipeline unless approval is explicitly passed", () => {
  const args = buildEngineArgs("/opt/engine/cicd.ps1", "run", "/workspace", false);
  assert.equal(args.includes("-Approve"), false);
});

test("adds the approval switch only for an approved run", () => {
  const args = buildEngineArgs("/opt/engine/cicd.ps1", "run", "/workspace", true);
  assert.equal(args.at(-1), "-Approve");
});

test("does not add approval to read-only commands", () => {
  const args = buildEngineArgs("/opt/engine/cicd.ps1", "plan", "/workspace", true);
  assert.equal(args.includes("-Approve"), false);
});
