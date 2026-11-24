import { spawn } from "node:child_process";
import { dirname } from "node:path";

export type EngineCommand =
  | "version"
  | "status"
  | "detect"
  | "validate-config"
  | "plan"
  | "run"
  | "discover-projects"
  | "run-workspaces"
  | "history"
  | "export-report";

export interface EngineRunOptions {
  executable: string;
  scriptPath: string;
  command: EngineCommand;
  projectPath: string;
  timeoutMs: number;
  approve?: boolean;
  onOutput?: (stream: "stdout" | "stderr", chunk: string) => void;
  shouldCancel?: () => boolean;
}

export interface EngineRunResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  cancelled: boolean;
}

const MAX_CAPTURE_CHARS = 1_000_000;

function appendBounded(current: string, chunk: string): string {
  const remaining = MAX_CAPTURE_CHARS - current.length;
  if (remaining <= 0) return current;
  return current + chunk.slice(0, remaining);
}

/** Build an argument vector without shell interpolation. */
export function buildEngineArgs(
  scriptPath: string,
  command: EngineCommand,
  projectPath: string,
  approve = false
): string[] {
  const args = [
    "-NoLogo",
    "-NoProfile",
    "-NonInteractive",
    "-File",
    scriptPath,
    command,
    "-ProjectPath",
    projectPath
  ];

  if (command === "run" || command === "run-workspaces") {
    args.push("-TimeoutSeconds", "600");
    if (approve) args.push("-Approve");
  }

  return args;
}

/**
 * Runs the existing PowerShell engine as a child process.
 * The caller must obtain explicit user approval before setting approve=true.
 */
export function runEngineCommand(options: EngineRunOptions): Promise<EngineRunResult> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    let cancelled = false;

    const child = spawn(
      options.executable,
      buildEngineArgs(
        options.scriptPath,
        options.command,
        options.projectPath,
        options.approve ?? false
      ),
      {
        cwd: dirname(options.scriptPath),
        windowsHide: true,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    const finish = (result: EngineRunResult): void => {
      if (settled) return;
      settled = true;
      clearInterval(cancellationPoll);
      clearTimeout(timeout);
      resolve(result);
    };

    const fail = (error: Error): void => {
      if (settled) return;
      settled = true;
      clearInterval(cancellationPoll);
      clearTimeout(timeout);
      reject(error);
    };

    child.stdout.on("data", (chunk: Buffer | string) => {
      const value = chunk.toString();
      stdout = appendBounded(stdout, value);
      options.onOutput?.("stdout", value);
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      const value = chunk.toString();
      stderr = appendBounded(stderr, value);
      options.onOutput?.("stderr", value);
    });

    child.once("error", (error: Error) => {
      fail(new Error(`Não foi possível iniciar PowerShell (${options.executable}): ${error.message}`));
    });

    child.once("close", (exitCode: number | null) => {
      finish({ exitCode, stdout, stderr, timedOut, cancelled });
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, Math.max(1, options.timeoutMs));

    const cancellationPoll = setInterval(() => {
      if (options.shouldCancel?.()) {
        cancelled = true;
        child.kill();
      }
    }, 150);
  });
}
