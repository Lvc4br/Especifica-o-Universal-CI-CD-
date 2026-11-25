const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const source = fs.readFileSync(require.resolve("../scripts/verify-vsix.cjs"), "utf8");

test("VSIX verifier checks ZIP integrity, required runtime files and manifest identity", () => {
  assert.match(source, /unzip.*-t/);
  assert.match(source, /extension\/package\.json/);
  assert.match(source, /extension\/out\/extension\.js/);
  assert.match(source, /@universal-cicd\/contracts\/dist\/index\.js/);
  assert.match(source, /universal-cicd-vscode/);
  assert.match(source, /0\.9\.0/);
});
