import * as vscode from "vscode";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { EngineCommand, runEngineCommand } from "./engineClient";
import { DashboardProvider } from "./dashboard";
import { openDashboardPanel } from "./webviewDashboard";

const output = vscode.window.createOutputChannel("Universal CI/CD");
const MAX_DISPLAY_CHARS = 1_000_000;
let dashboard: DashboardProvider | undefined;

interface EngineLocation {
  scriptPath: string;
}

function resolveEngine(): EngineLocation | undefined {
  const configured = vscode.workspace
    .getConfiguration("universalCicd")
    .get<string>("enginePath", "")
    .trim();

  if (configured) {
    const scriptPath = join(resolve(configured), "cicd.ps1");
    return existsSync(scriptPath) ? { scriptPath } : undefined;
  }

  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    const scriptPath = join(folder.uri.fsPath, "cicd.ps1");
    if (existsSync(scriptPath)) return { scriptPath };
  }

  return undefined;
}

async function execute(command: EngineCommand, approved = false): Promise<boolean> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    void vscode.window.showWarningMessage("Abra uma pasta de projeto para usar o Universal CI/CD.");
    return false;
  }

  const engine = resolveEngine();
  if (!engine) {
    void vscode.window.showErrorMessage(
      "Não encontrei cicd.ps1. Configure universalCicd.enginePath com a pasta do motor PowerShell."
    );
    dashboard?.refresh();
    return false;
  }

  const config = vscode.workspace.getConfiguration("universalCicd");
  const executable = config.get<string>("powershellExecutable", "pwsh").trim() || "pwsh";
  const configuredTimeout = config.get<number>("timeoutSeconds", 600);
  const timeoutSeconds = Number.isFinite(configuredTimeout)
    ? Math.min(86400, Math.max(1, Math.floor(configuredTimeout)))
    : 600;

  output.clear();
  let displayedChars = 0;
  const appendOutput = (value: string): void => {
    const remaining = MAX_DISPLAY_CHARS - displayedChars;
    if (remaining <= 0) return;
    const visible = value.slice(0, remaining);
    displayedChars += visible.length;
    output.append(visible);
  };

  output.appendLine("Universal CI/CD");
  output.appendLine(`Comando: ${command}`);
  output.appendLine(`Projeto: ${workspace.uri.fsPath}`);
  output.appendLine(`Motor: ${engine.scriptPath}`);
  output.appendLine(`Aprovação explícita: ${approved ? "sim" : "não"}`);
  output.show(true);

  return vscode.window.withProgress(
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
          timeoutMs: timeoutSeconds * 1000,
          timeoutSeconds,
          approve: approved,
          shouldCancel: () => token.isCancellationRequested,
          onOutput: (stream, chunk) => {
            appendOutput(stream === "stderr" ? `[stderr] ${chunk}` : chunk);
          }
        });

        if (result.timedOut) {
          output.appendLine("\nTempo limite atingido; processo encerrado.");
          void vscode.window.showWarningMessage("Universal CI/CD: o comando excedeu o tempo limite.");
          return false;
        }

        if (result.cancelled) {
          output.appendLine("\nExecução cancelada pelo usuário.");
          return false;
        }

        output.appendLine(`\nProcesso encerrado com código: ${result.exitCode ?? "desconhecido"}`);
        if (result.exitCode !== 0) {
          void vscode.window.showErrorMessage(
            `Universal CI/CD: comando finalizado com código ${result.exitCode ?? "desconhecido"}. Consulte a saída.`
          );
          return false;
        }

        void vscode.window.showInformationMessage("Universal CI/CD: comando concluído.");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        output.appendLine(`\nErro: ${message}`);
        void vscode.window.showErrorMessage(message);
        return false;
      } finally {
        dashboard?.refresh();
      }
    }
  );
}

async function executeWithApproval(command: "run" | "run-workspaces"): Promise<void> {
  const planSucceeded = await execute("plan");
  if (!planSucceeded) return;

  const choice = await vscode.window.showWarningMessage(
    command === "run"
      ? "O plano foi gerado no canal de saída. Ao aprovar, o motor executará as etapas permitidas na configuração do projeto."
      : "O plano foi gerado no canal de saída. Ao aprovar, o motor executará as etapas permitidas nos projetos descobertos do workspace.",
    { modal: true },
    "Aprovar execução"
  );

  if (choice !== "Aprovar execução") return;
  await execute(command, true);
}

export function activate(context: vscode.ExtensionContext): void {
  output.appendLine("Universal CI/CD extension activated.");
  context.subscriptions.push(output);

  dashboard = new DashboardProvider();
  context.subscriptions.push(dashboard);
  context.subscriptions.push(
    vscode.window.createTreeView("universalCicd.dashboard", {
      treeDataProvider: dashboard,
      showCollapseAll: true
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => dashboard?.refresh()),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration("universalCicd.enginePath")) dashboard?.refresh();
    })
  );

  const commands: Array<[string, () => unknown]> = [
    ["universalCicd.openDashboard", () => {
      const workspace = vscode.workspace.workspaceFolders?.[0];
      const engine = resolveEngine();
      const configuredEnginePath = vscode.workspace.getConfiguration("universalCicd").get<string>("enginePath", "").trim();
      const panel = openDashboardPanel(context, () => ({
        workspaceName: vscode.workspace.workspaceFolders?.[0]?.name ?? "",
        workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "",
        engineFound: Boolean(resolveEngine()),
        enginePath: resolveEngine()?.scriptPath ?? (configuredEnginePath || (workspace ? "cicd.ps1 não encontrado no workspace" : ""))
      }));
      context.subscriptions.push(panel);
      void panel;
      void engine;
    }],
    ["universalCicd.version", () => execute("version")],
    ["universalCicd.initializeProject", () => execute("init")],
    ["universalCicd.showStatus", () => execute("status")],
    ["universalCicd.detect", () => execute("detect")],
    ["universalCicd.plan", () => execute("plan")],
    ["universalCicd.validateConfig", () => execute("validate-config")],
    ["universalCicd.discoverProjects", () => execute("discover-projects")],
    ["universalCicd.history", () => execute("history")],
    ["universalCicd.exportReport", () => execute("export-report")],
    ["universalCicd.run", () => executeWithApproval("run")],
    ["universalCicd.runWorkspaces", () => executeWithApproval("run-workspaces")],
    ["universalCicd.refreshDashboard", () => dashboard?.refresh()],
    ["universalCicd.openOutput", () => output.show(true)]
  ];

  for (const [id, callback] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, callback));
  }
}

export function deactivate(): void {
  dashboard?.dispose();
  output.dispose();
}
