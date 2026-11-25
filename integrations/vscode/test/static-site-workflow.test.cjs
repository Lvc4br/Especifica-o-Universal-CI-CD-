const test = require("node:test");
const assert = require("node:assert/strict");
const { createStaticSiteWorkflow, normalizeStaticSiteDirectory } = require("../out/staticSiteWorkflow.js");

test("static site workflow validates HTML/CSS and deploys selected folder on selected branch", () => {
  const workflow = createStaticSiteWorkflow("main", "dist/site");
  assert.ok(workflow.includes("html-validate"));
  assert.ok(workflow.includes("prettier --check"));
  assert.ok(workflow.includes("pull_request:"));
  assert.ok(workflow.includes("actions/upload-pages-artifact@v3"));
  assert.ok(workflow.includes("actions/deploy-pages@v4"));
  assert.ok(workflow.includes("refs/heads/main"));
  assert.ok(workflow.includes("path: 'dist/site'"));
});

test("static site workflow sanitizes invalid branch and publish directory", () => {
  const workflow = createStaticSiteWorkflow("main\\nmalicious: true", "../../outside");
  assert.ok(workflow.includes("refs/heads/main"));
  assert.ok(workflow.includes("path: '.'"));
  assert.ok(!workflow.includes("malicious"));
  assert.ok(!workflow.includes("outside"));
});

test("static site workflow never deploys from pull requests", () => {
  const workflow = createStaticSiteWorkflow("release", "public");
  assert.ok(workflow.includes("pull_request:"));
  assert.ok(workflow.includes("github.event_name != 'pull_request'"));
  assert.ok(workflow.includes("refs/heads/release"));
  assert.ok(workflow.includes("path: 'public'"));
});

test("publish directory accepts safe relative folders and rejects traversal", () => {
  assert.equal(normalizeStaticSiteDirectory("."), ".");
  assert.equal(normalizeStaticSiteDirectory("dist/site"), "dist/site");
  assert.equal(normalizeStaticSiteDirectory("public assets"), "public assets");
  assert.equal(normalizeStaticSiteDirectory("../outside"), undefined);
  assert.equal(normalizeStaticSiteDirectory("dist/../../outside"), undefined);
  assert.equal(normalizeStaticSiteDirectory("/etc"), undefined);
  assert.equal(normalizeStaticSiteDirectory("dist\\\\site"), undefined);
});
