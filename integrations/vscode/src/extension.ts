import * as vscode from "vscode";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { EngineCommand, runEngineCommand } from "./engineClient";

const output = vscode.window.createOutputChannel("Universal CI/CD");

interface EngineLocation {
  directory: string;
  scriptPath: string;
}

function resolveEngine(): EngineLocation | undefined {
  const configured = vscode.workspace
    .getConfiguration("universalCicd")
    .get<string>("enginePath", "")
    .trim();

  if (configured) {
    const directory = resolve(configured);
    const scriptPath = join(directory, "cicd.ps1");
    return existsSync(scriptPath) ? { directory, scriptPath } : undefined;
  }

  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    const scriptPath = join(folder.uri.fsPath, "cicd.ps1");
    if (existsSync(scriptPath)) {
      return { directory: folder.uri.fsPath, scriptPath };
    }
  }

  return undefined;
}

async function execute(command: EngineCommand, approved = false): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    void vscode.window.showWarningMessage("Abra uma pasta de projeto para usar o Universal CI/CD.");
    return;
  }

  const engine = resolveEngine();
  if (!engine) {
    void vscode.window.showErrorMessage(
      "Não encontrei cicd.ps1. Configure universalCicd.enginePath com a pasta do motor PowerShell."
    );
    return;
  }

  const config = vscode.workspace.getConfiguration("universalCicd");
  const executable = config.get<string>("powershellExecutable", "pwsh").trim() || "pwsh";
  const timeoutSeconds = config.get<number>("timeoutSeconds", 600);
  const timeoutMs = Math.max(1, timeoutSeconds) * 1000;

  output.clear();
  output.appendLine("Universal CI/CD");
  output.appendLine(`Comando: ${command}`);
  output.appendLine(`Projeto: ${workspace.uri.fsPath}`);
  output.appendLine(`Motor: ${engine.scriptPath}`);
  output.appendLine(`Aprovação explícita: ${approved ? "sim" : "não"}`);
  output.show(true);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Universal CI/CD: ${command}`,
      cancellable: true
    },
    async (_progress, token) => {
      try {
        const result = await runEngineCommand({
          executable,
          scriptPath: engine.scriptPath,
          command,
          projectPath: workspace.uri.fsPath,
          timeoutMs,
          approve: approved,
          shouldCancel: () => token.isCancellationRequested,
          onOutput: (stream, chunk) => {
            if (stream === "stderr") output.append(`[stderr] ${chunk}`);
            else output.append(chunk);
          }
        });

        if (result.timedOut) {
          output.appendLine("\nTempo limite atingido; processo encerrado.");
          void vscode.window.showWarningMessage("Universal CI/CD: o comando excedeu o tempo limite.");
          return;
        }

        if (result.cancelled) {
          output.appendLine("\nExecução cancelada pelo usuário.");
          return;
        }

        output.appendLine(`\nProcesso encerrado com código: ${result.exitCode ?? "desconhecido"}`);
        if (result.exitCode !== 0) {
          void vscode.window.showErrorMessage(
            `Universal CI/CD: comando finalizado com código ${result.exitCode ?? "desconhecido"}. Consulte a saída.`
          );
        } else {
          void vscode.window.showInformationMessage("Universal CI/CD: comando concluído.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        output.appendLine(`\nErro: ${message}`);
        void vscode.window.showErrorMessage(message);
      }
    }
  );
}

async function executeWithApproval(command: "run" | "run-workspaces"): Promise<void> {
  const choice = await vscode.window.showWarningMessage(
    command === "run"
      ? "O motor poderá executar as etapas permitidas na configuração do projeto. Revise o plano antes de continuar."
      : "O motor poderá executar etapas permitidas nos projetos descobertos do workspace. Revise o escopo antes de continuar.",
    { modal: true },
    "Aprovar execução"
  );

  if (choice !== "Aprovar execução") return;
  await execute(command, true);
}

export function activate(context: vscode.ExtensionContext): void {
  output.appendLine("Universal CI/CD extension activated.");
  context.subscriptions.push(output);

  const commands: Array<[string, () => unknown]> = [
    ["universalCicd.showStatus", () => execute("status")],
    ["universalCicd.detect", () => execute("detect")],
    ["universalCicd.plan", () => execute("plan")],
    ["universalCicd.validateConfig", () => execute("validate-config")],
    ["universalCicd.discoverProjects", () => execute("discover-projects")],
    ["universalCicd.history", () => execute("history")],
    ["universalCicd.run", () => executeWithApproval("run")],
    ["universalCicd.runWorkspaces", () => executeWithApproval("run-workspaces")]
  ];

  for (const [id, callback] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, callback));
  }
}

export function deactivate(): void {
  output.dispose();
}
