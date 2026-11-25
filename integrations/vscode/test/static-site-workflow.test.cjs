const test = require("node:test");
const assert = require("node:assert/strict");
const { createStaticSiteWorkflow, normalizeStaticSiteDirectory } = require("../out/staticSiteWorkflow.js");

test("static site workflow validates HTML/CSS and deploys selected folder on selected branch", () => {
  const workflow = createStaticSiteWorkflow("main", "dist/site");
  assert.match(workflow, /html-validate/);
  assert.match(workflow, /prettier --check/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /actions\\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\\/deploy-pages@v4/);
  assert.match(workflow, /refs\\/heads\\/main/);
  assert.match(workflow, /path: 'dist\\/site'/);
});

test("static site workflow sanitizes invalid branch and publish directory", () => {
  const workflow = createStaticSiteWorkflow("main\\nmalicious: true", "../../outside");
  assert.match(workflow, /refs\\/heads\\/main/);
  assert.match(workflow, /path: '\.'/);
  assert.doesNotMatch(workflow, /malicious|outside/);
});

test("static site workflow never deploys from pull requests", () => {
  const workflow = createStaticSiteWorkflow("release", "public");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /github.event_name != 'pull_request'/);
  assert.match(workflow, /refs\\/heads\\/release/);
  assert.match(workflow, /path: 'public'/);
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
