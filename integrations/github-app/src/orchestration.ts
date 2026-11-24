/**
 * Framework-neutral orchestration primitives.
 * Persistence and GitHub API calls are injected by a future adapter.
 */

export type JobState = "queued" | "running" | "success" | "failure" | "cancelled";
export type DeliveryDisposition = "accepted" | "duplicate" | "stale";

export interface DeliveryRecord {
  deliveryId: string;
  receivedAt: string;
  payloadDigest: string;
}

export interface PipelineJob {
  id: string;
  repository: string;
  pullRequestNumber: number;
  headSha: string;
  state: JobState;
  checkRunId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrchestrationStore {
  /** Atomically claims deliveryId, returning false if it has already been claimed. */
  claimDelivery(record: DeliveryRecord): Promise<boolean>;
  getJob(id: string): Promise<PipelineJob | undefined>;
  putJob(job: PipelineJob): Promise<void>;
}

export interface CreateJobInput {
  delivery: DeliveryRecord;
  repository: string;
  pullRequestNumber: number;
  headSha: string;
  now: string;
}

export function validateCreateJobInput(input: CreateJobInput): void {
  if (!input.delivery.deliveryId.trim()) throw new TypeError("deliveryId is required");
  if (!input.repository.trim()) throw new TypeError("repository is required");
  if (!Number.isSafeInteger(input.pullRequestNumber) || input.pullRequestNumber <= 0) {
    throw new TypeError("pullRequestNumber must be a positive safe integer");
  }
  if (!/^[a-f0-9]{40}$/i.test(input.headSha)) throw new TypeError("headSha must be a full SHA");
  if (!input.now.trim()) throw new TypeError("now is required");
}

export function makeJobId(repository: string, pullRequestNumber: number, headSha: string): string {
  return [repository.toLowerCase(), pullRequestNumber, headSha.toLowerCase()].join(":");
}

/** Delivery dedupe is performed atomically by the storage implementation. */
export async function enqueueJob(store: OrchestrationStore, input: CreateJobInput): Promise<DeliveryDisposition> {
  validateCreateJobInput(input);
  const claimed = await store.claimDelivery(input.delivery);
  if (!claimed) return "duplicate";

  const id = makeJobId(input.repository, input.pullRequestNumber, input.headSha);
  const prior = await store.getJob(id);
  if (prior) return "stale";

  await store.putJob({
    id,
    repository: input.repository,
    pullRequestNumber: input.pullRequestNumber,
    headSha: input.headSha.toLowerCase(),
    state: "queued",
    createdAt: input.now,
    updatedAt: input.now
  });
  return "accepted";
}

const transitions: Record<JobState, readonly JobState[]> = {
  queued: ["running", "cancelled"],
  running: ["success", "failure", "cancelled"],
  success: [],
  failure: [],
  cancelled: []
};

export function transitionJob(job: PipelineJob, next: JobState, now: string): PipelineJob {
  if (!transitions[job.state].includes(next)) {
    throw new Error(`Invalid job state transition: ${job.state} -> ${next}`);
  }
  return { ...job, state: next, updatedAt: now };
}

/** Ensure the orchestration layer does not apply results to a superseded PR head. */
export function isCurrentHead(job: PipelineJob, currentHeadSha: string): boolean {
  return job.headSha.toLowerCase() === currentHeadSha.toLowerCase();
}
