const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePlanSnapshot } = require("../out/planSnapshot.js");

test("normalizes the current PowerShell plan into a bounded dashboard snapshot", () => {
  const result = normalizePlanSnapshot({
    schemaVersion: "1.0",
    project: "sample",
    generatedAt: "2026-11-24T12:00:00.000Z",
    technologies: ["TypeScript", "Node.js"],
    steps: [
      { id: "lint", name: "Lint", category: "check", status: "PLANNED", reason: "Tool available." },
      { id: "tests", name: "Tests", category: "test", status: "BLOCKED", reason: "Tool missing." }
    ]
  });
  assert.ok(result);
  assert.equal(result.steps.length, 2);
  assert.equal(result.counts.PLANNED, 1);
  assert.equal(result.counts.BLOCKED, 1);
  assert.deepEqual(result.technologies, ["TypeScript", "Node.js"]);
});

test("rejects malformed plans and oversized step collections", () => {
  assert.equal(normalizePlanSnapshot({ schemaVersion: "2.0", steps: [] }), undefined);
  assert.equal(normalizePlanSnapshot({ schemaVersion: "1.0", steps: new Array(101).fill({}) }), undefined);
  assert.equal(normalizePlanSnapshot({ schemaVersion: "1.0", steps: [{ id: "x" }] }), undefined);
});

test("clips untrusted text and maps unknown statuses without HTML interpretation", () => {
  const result = normalizePlanSnapshot({
    schemaVersion: "1.0",
    project: "x".repeat(200),
    steps: [{
      id: "a",
      name: "<img src=x onerror=alert(1)>",
      status: "FUTURE_STATE",
      reason: "r".repeat(500)
    }]
  });
  assert.ok(result);
  assert.equal(result.project.length, 120);
  assert.equal(result.steps[0].name, "<img src=x onerror=alert(1)>");
  assert.equal(result.steps[0].status, "UNKNOWN");
  assert.equal(result.steps[0].reason.length, 300);
});
