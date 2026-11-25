const test = require("node:test");
const assert = require("node:assert/strict");
const { createStaticSiteWorkflow } = require("../out/staticSiteWorkflow.js");

test("static site workflow validates HTML/CSS and deploys Pages only from selected branch", () => {
  const workflow = createStaticSiteWorkflow("main");
  assert.match(workflow, /html-validate/);
  assert.match(workflow, /prettier --check/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /refs\/heads\/main/);
});

test("static site workflow sanitizes invalid branch names", () => {
  const workflow = createStaticSiteWorkflow("main\nmalicious: true");
  assert.match(workflow, /refs\/heads\/main/);
  assert.doesNotMatch(workflow, /malicious/);
});

test("static site workflow generation has no deploy trigger for pull requests", () => {
  const workflow = createStaticSiteWorkflow("release");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /github.event_name != 'pull_request'/);
  assert.match(workflow, /refs\/heads\/release/);
});
