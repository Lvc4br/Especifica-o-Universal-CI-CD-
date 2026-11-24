const test = require("node:test");
const assert = require("node:assert/strict");
const manifest = require("../package.json");

test("contributes the Universal CI/CD dashboard to the Explorer", () => {
  const explorerViews = manifest.contributes.views.explorer;
  assert.ok(explorerViews.some(view => view.id === "universalCicd.dashboard"));
  assert.ok(manifest.activationEvents.includes("onView:universalCicd.dashboard"));
});

test("registers every command used by the dashboard", () => {
  const commandIds = new Set(manifest.contributes.commands.map(command => command.command));
  const required = [
    "universalCicd.initializeProject",
    "universalCicd.discoverProjects",
    "universalCicd.refreshDashboard",
    "universalCicd.detect",
    "universalCicd.validateConfig",
    "universalCicd.plan",
    "universalCicd.showStatus",
    "universalCicd.run",
    "universalCicd.runWorkspaces",
    "universalCicd.history",
    "universalCicd.exportReport",
    "universalCicd.openOutput"
  ];

  for (const command of required) {
    assert.ok(commandIds.has(command), `Missing contributed command: ${command}`);
  }
});

test("keeps execution controls configurable and PowerShell based", () => {
  const properties = manifest.contributes.configuration.properties;
  assert.equal(properties["universalCicd.powershellExecutable"].default, "pwsh");
  assert.equal(properties["universalCicd.timeoutSeconds"].default, 600);
  assert.equal(properties["universalCicd.enginePath"].default, "");
});

test("exposes the visual dashboard preview command", () => {
  const commandIds = new Set(manifest.contributes.commands.map(command => command.command));
  assert.ok(commandIds.has("universalCicd.openDashboard"));
  assert.ok(manifest.activationEvents.includes("onCommand:universalCicd.openDashboard"));
  assert.equal(manifest.version, "0.6.0");
});
