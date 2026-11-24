/**
 * Safe Check Run primitives for the GitHub App.
 *
 * This module only builds a validated request payload. It deliberately does
 * not create a Check Run from webhook handlers: orchestration must first add
 * durable delivery deduplication and a trusted execution provider.
 */

export const UNIVERSAL_CICD_CHECK_NAME = "Universal CI/CD";

export interface PendingCheckRunInput {
  headSha: string;
  installationId: number;
  repositoryId: number;
  pullRequestNumber: number;
}

export interface PendingCheckRunPayload {
  name: typeof UNIVERSAL_CICD_CHECK_NAME;
  head_sha: string;
  status: "queued";
  external_id: string;
}

function assertPositiveSafeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive safe integer`);
  }
}

/**
 * Build a stable, non-secret correlation identifier for a future Check Run.
 * This identifier is not an idempotency guarantee; callers still need durable
 * webhook-delivery deduplication before creating remote resources.
 */
export function buildPendingCheckRunPayload(
  input: PendingCheckRunInput
): PendingCheckRunPayload {
  if (!/^[a-f0-9]{40}$/i.test(input.headSha)) {
    throw new TypeError("headSha must be a 40-character Git commit SHA");
  }

  assertPositiveSafeInteger(input.installationId, "installationId");
  assertPositiveSafeInteger(input.repositoryId, "repositoryId");
  assertPositiveSafeInteger(input.pullRequestNumber, "pullRequestNumber");

  return {
    name: UNIVERSAL_CICD_CHECK_NAME,
    head_sha: input.headSha.toLowerCase(),
    status: "queued",
    external_id: [
      "universal-cicd",
      input.installationId,
      input.repositoryId,
      input.pullRequestNumber,
      input.headSha.toLowerCase()
    ].join(":")
  };
}
