import type { DeliveryRecord, PipelineJob, OrchestrationStore } from "./orchestration.js";

export interface PgQueryable {
  query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}
export interface PgClient extends PgQueryable { release(): void; }
export interface PgPool extends PgQueryable { connect(): Promise<PgClient>; }

/** PostgreSQL adapter. Delivery dedupe + queued job creation are atomic. */
export class PostgresOrchestrationStore implements OrchestrationStore {
  constructor(private readonly pool: PgPool) {}

  async claimDelivery(record: DeliveryRecord): Promise<boolean> {
    const result = await this.pool.query(
      "INSERT INTO uci_cd_deliveries (delivery_id, received_at, payload_digest) VALUES ($1,$2,$3) ON CONFLICT (delivery_id) DO NOTHING RETURNING delivery_id",
      [record.deliveryId, record.receivedAt, record.payloadDigest]
    );
    return result.rows.length === 1;
  }

  async getJob(id: string): Promise<PipelineJob | undefined> {
    const result = await this.pool.query("SELECT * FROM uci_cd_jobs WHERE id=$1", [id]);
    return result.rows[0] ? rowToJob(result.rows[0]) : undefined;
  }

  async putJob(job: PipelineJob): Promise<void> {
    await this.pool.query(
      "INSERT INTO uci_cd_jobs (id, repository, pull_request_number, head_sha, state, check_run_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO UPDATE SET state=EXCLUDED.state, check_run_id=EXCLUDED.check_run_id, updated_at=EXCLUDED.updated_at",
      [job.id, job.repository, job.pullRequestNumber, job.headSha, job.state, job.checkRunId ?? null, job.createdAt, job.updatedAt]
    );
  }

  /** Atomic receipt deduplication and job enqueue to avoid stranded delivery claims. */
  async enqueueAtomically(record: DeliveryRecord, job: PipelineJob): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const delivery = await client.query(
        "INSERT INTO uci_cd_deliveries (delivery_id, received_at, payload_digest) VALUES ($1,$2,$3) ON CONFLICT (delivery_id) DO NOTHING RETURNING delivery_id",
        [record.deliveryId, record.receivedAt, record.payloadDigest]
      );
      if (!delivery.rows.length) { await client.query("ROLLBACK"); return false; }
      await client.query(
        "INSERT INTO uci_cd_jobs (id, repository, pull_request_number, head_sha, state, check_run_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING",
        [job.id, job.repository, job.pullRequestNumber, job.headSha, job.state, job.checkRunId ?? null, job.createdAt, job.updatedAt]
      );
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }
}

function rowToJob(row: Record<string, unknown>): PipelineJob {
  return {
    id: String(row.id), repository: String(row.repository),
    pullRequestNumber: Number(row.pull_request_number), headSha: String(row.head_sha),
    state: row.state as PipelineJob["state"],
    ...(row.check_run_id == null ? {} : { checkRunId: Number(row.check_run_id) }),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString()
  };
}
