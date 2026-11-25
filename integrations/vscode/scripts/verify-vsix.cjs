#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = process.argv[2];
if (!path || !fs.existsSync(path)) {
  console.error("VSIX path is required and must exist.");
  process.exit(2);
}
execFileSync("unzip", ["-t", path], { stdio: "inherit" });
const listing = execFileSync("unzip", ["-Z1", path], { encoding: "utf8" }).split(/\r?\n/);
const required = [
  "extension/package.json",
  "extension/out/extension.js",
  "extension/out/node_modules/@universal-cicd/contracts/dist/index.js"
];
const missing = required.filter(entry => !listing.includes(entry));
if (missing.length) {
  console.error("VSIX missing required files:", missing.join(", "));
  process.exit(1);
}
const manifest = JSON.parse(execFileSync("unzip", ["-p", path, "extension/package.json"], { encoding: "utf8" }));
if (manifest.name !== "universal-cicd-vscode" || manifest.version !== "0.9.0") {
  console.error("VSIX manifest identity/version mismatch.");
  process.exit(1);
}
console.log("VSIX integrity, manifest, extension entrypoint, and shared-contract runtime verified.");
