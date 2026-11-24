-- Durable delivery idempotency and job state.
CREATE TABLE IF NOT EXISTS uci_cd_deliveries (
  delivery_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL,
  payload_digest TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uci_cd_jobs (
  id TEXT PRIMARY KEY,
  repository TEXT NOT NULL,
  pull_request_number BIGINT NOT NULL CHECK (pull_request_number > 0),
  head_sha CHAR(40) NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('queued','running','success','failure','cancelled')),
  check_run_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS uci_cd_jobs_queue_idx ON uci_cd_jobs (created_at) WHERE state='queued';
CREATE INDEX IF NOT EXISTS uci_cd_jobs_pr_idx ON uci_cd_jobs (repository, pull_request_number, updated_at DESC);
