export type PlanStepStatus = "PLANNED" | "BLOCKED" | "DISABLED" | "NOT_APPLICABLE" | "UNKNOWN";

export interface PlanStepSnapshot {
  id: string;
  name: string;
  category: string;
  status: PlanStepStatus;
  reason: string;
}

export interface PlanSnapshot {
  project: string;
  generatedAt: string;
  technologies: string[];
  steps: PlanStepSnapshot[];
  counts: Record<PlanStepStatus, number>;
}

/** Normalize the local PowerShell plan before exposing a small, non-executable view to the Webview. */
export function normalizePlanSnapshot(value: unknown): PlanSnapshot | undefined {
  if (!isRecord(value) || value.schemaVersion !== "1.0" || !Array.isArray(value.steps)) return undefined;
  if (value.steps.length > 100) return undefined;

  const steps: PlanStepSnapshot[] = [];
  for (const item of value.steps) {
    if (!isRecord(item) || !isText(item.id) || !isText(item.name) || !isText(item.status)) return undefined;
    const rawStatus = item.status.trim().toUpperCase();
    const status: PlanStepStatus = rawStatus === "PLANNED" || rawStatus === "BLOCKED" ||
      rawStatus === "DISABLED" || rawStatus === "NOT_APPLICABLE" ? rawStatus : "UNKNOWN";
    steps.push({
      id: clip(item.id, 80),
      name: clip(item.name, 120),
      category: isText(item.category) ? clip(item.category, 40) : "other",
      status,
      reason: isText(item.reason) ? clip(item.reason, 300) : ""
    });
  }

  const technologies = Array.isArray(value.technologies)
    ? value.technologies.filter(isText).slice(0, 30).map(item => clip(item, 60))
    : [];
  const counts: Record<PlanStepStatus, number> = {
    PLANNED: 0, BLOCKED: 0, DISABLED: 0, NOT_APPLICABLE: 0, UNKNOWN: 0
  };
  for (const step of steps) counts[step.status] += 1;

  return {
    project: isText(value.project) ? clip(value.project, 120) : "Projeto local",
    generatedAt: isText(value.generatedAt) ? clip(value.generatedAt, 64) : "",
    technologies,
    steps,
    counts
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}
