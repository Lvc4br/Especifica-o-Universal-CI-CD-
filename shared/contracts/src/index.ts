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

export { validateUpsPipeline } from "./ups-validator";
export type { UpsValidationIssue, UpsValidationResult } from "./ups-validator";

export { generateUpsExecutionPlan } from "./ups-execution-plan";
export type { UpsExecutionPlan, UpsPlanResult, UpsPlannedJob, UpsPlannedStep } from "./ups-execution-plan";

export { resolvePlanCapabilities } from "./capability-resolution";
export type { CapabilityRunner, CapabilityResolution, CapabilityResolutionResult, JobResolution, RunnerStatus } from "./capability-resolution";
