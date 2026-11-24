const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/upsGraph.ts"), "utf8");

test("UPS graph webview enforces a restrictive CSP and has no remote resources", () => {
  assert.match(source, /default-src 'none'/);
  assert.match(source, /style-src 'nonce-/);
  assert.match(source, /script-src 'nonce-/);
  assert.match(source, /localResourceRoots: \[\]/);
  assert.doesNotMatch(source, /<script[^>]+src=|<link[^>]+href=/i);
});

test("UPS graph renders untrusted pipeline data through DOM text nodes", () => {
  assert.match(source, /textContent/);
  assert.match(source, /createElementNS/);
  assert.doesNotMatch(source, /innerHTML|outerHTML/);
  assert.match(source, /addEventListener\("keydown"/);
});

test("UPS graph distinguishes structural critical path and diagnostics", () => {
  assert.match(source, /criticalPathJobIds/);
  assert.match(source, /parallelGroups/);
  assert.match(source, /Recomendação:/);
  assert.match(source, /não duração/);
});

test("UPS graph message listener is disposed when its panel closes", () => {
  assert.match(source, /panel\.onDidDispose\(\(\) => messageListener\.dispose\(\)\)/);
});
