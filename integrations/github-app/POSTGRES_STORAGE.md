# PostgreSQL storage adapter

This branch introduces the initial durable schema and an adapter using a minimal structural Pool/Client interface (compatible with node-postgres without coupling the module to it).

## Apply
Run migration `migrations/001_orchestration.sql` against a PostgreSQL database before using the adapter. Supply a managed connection pool from the application; this package does not create connections or read secrets.

## Guarantees and limits
- Delivery IDs are unique and insert deduplication is database-backed.
- `enqueueAtomically` records the delivery and job in one transaction, avoiding a claimed delivery with no job due to a process crash.
- Job identity remains repository + PR + SHA.
- No webhook listener, worker, lease, job claim, GitHub dispatch or runner is activated here.
- A queued-job conflict is idempotently ignored within the transaction.
- Pool must be configured with TLS and secrets from the deployment environment, never source control.

The existing interface-driven enqueue helper is retained for stub-based tests and future adapters. Production webhook code must call `enqueueAtomically` rather than separately claiming and writing.
