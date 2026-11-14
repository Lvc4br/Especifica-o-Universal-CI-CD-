const fs = require("node:fs");
const path = require("node:path");

const outputDirectory = path.join(__dirname, "..", "dist");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.copyFileSync(
  path.join(__dirname, "..", "src", "index.js"),
  path.join(outputDirectory, "index.js")
);
