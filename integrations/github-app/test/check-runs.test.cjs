const test = require("node:test");
const assert = require("node:assert/strict");
const {
  UNIVERSAL_CICD_CHECK_NAME,
  buildPendingCheckRunPayload
} = require("../dist/check-runs.js");

const validInput = {
  headSha: "A".repeat(40),
  installationId: 12,
  repositoryId: 34,
  pullRequestNumber: 56
};

test("builds a queued Check Run payload with normalized SHA", () => {
  assert.deepEqual(buildPendingCheckRunPayload(validInput), {
    name: UNIVERSAL_CICD_CHECK_NAME,
    head_sha: "a".repeat(40),
    status: "queued",
    external_id: `universal-cicd:12:34:56:${"a".repeat(40)}`
  });
});

test("rejects malformed commit SHAs", () => {
  assert.throws(
    () => buildPendingCheckRunPayload({ ...validInput, headSha: "main" }),
    /40-character Git commit SHA/
  );
});

test("rejects invalid identifiers", () => {
  assert.throws(
    () => buildPendingCheckRunPayload({ ...validInput, installationId: 0 }),
    /installationId/
  );
  assert.throws(
    () => buildPendingCheckRunPayload({ ...validInput, repositoryId: -1 }),
    /repositoryId/
  );
  assert.throws(
    () => buildPendingCheckRunPayload({ ...validInput, pullRequestNumber: 1.5 }),
    /pullRequestNumber/
  );
});

test("uses the same correlation key for the same PR head", () => {
  const first = buildPendingCheckRunPayload(validInput);
  const second = buildPendingCheckRunPayload(validInput);
  assert.equal(first.external_id, second.external_id);
});
