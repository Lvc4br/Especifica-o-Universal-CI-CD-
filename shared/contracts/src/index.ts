/** Stable, transport-neutral contracts shared by the editor and GitHub integrations. */

export type PipelineStageState =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "warning"
  | "skipped"
  | "blocked"
  | "not_implemented";

export interface PipelineStageResult {
  id: string;
  name: string;
  state: PipelineStageState;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  exitCode?: number;
  summary?: string;
}

export interface PipelineRunSummary {
  schemaVersion: "1.0";
  runId: string;
  projectPath: string;
  status: PipelineStageState;
  startedAt: string;
  completedAt?: string;
  stages: PipelineStageResult[];
  reportPath?: string;
}

export interface IntegrationHealth {
  component: "engine" | "vscode" | "github-app";
  status: "available" | "unavailable" | "not-configured";
  version?: string;
  message?: string;
}
