const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../src/webviewDashboard.ts"),
  "utf8"
);

test("dashboard webview uses a cryptographic nonce and restrictive CSP", () => {
  assert.match(source, /randomBytes\(16\)\.toString\("base64"\)/);
  assert.match(source, /default-src 'none'; style-src 'nonce-\$\{token\}'; script-src 'nonce-\$\{token\}'/);
  assert.match(source, /<style nonce="\$\{token\}">/);
  assert.match(source, /<script nonce="\$\{token\}">/);
});

test("dashboard avoids inline style attributes and remote assets", () => {
  assert.doesNotMatch(source, /\sstyle="/);
  assert.doesNotMatch(source, /https?:\/\//);
  assert.match(source, /localResourceRoots: \[\]/);
});

test("dashboard messages can invoke only the explicit command allowlist", () => {
  assert.match(source, /const COMMANDS = new Set\(\[/);
  assert.match(source, /if \(!COMMANDS\.has\(message\.command\)\) return/);
  assert.doesNotMatch(source, /"universalCicd\.run",/);
});
