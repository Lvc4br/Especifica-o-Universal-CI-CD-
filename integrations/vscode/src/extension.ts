import * as vscode from "vscode";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { EngineCommand, runEngineCommand } from "./engineClient";
import { DashboardProvider } from "./dashboard";
import { openDashboardPanel } from "./webviewDashboard";
import { normalizePlanSnapshot } from "./planSnapshot";
import { analyzePipelineIntelligence, generateUpsExecutionPlan, validateUpsPipeline } from "@universal-cicd/contracts";
import { formatUpsAnalysis } from "./upsInspector";
import { openUpsGraphPanel } from "./upsGraph";

const output = vscode.window.createOutputChannel("Universal CI/CD");
const MAX_DISPLAY_CHARS = 1_000_000;
let dashboard: DashboardProvider | undefined;

interface EngineLocation {
  scriptPath: string;
}

function readLatestPlan(workspacePath: string | undefined) {
  if (!workspacePath) return undefined;
  try {
    const workspaceRoot = realpathSync(workspacePath);
    const candidate = join(workspaceRoot, ".cicd", "plans", "latest-plan.json");
    const resolved = realpathSync(candidate);
    const relativePath = relative(workspaceRoot, resolved);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) return undefined;
    const info = lstatSync(candidate);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 1_000_000) return undefined;
    return normalizePlanSnapshot(JSON.parse(readFileSync(resolved, "utf8")) as unknown);
  } catch {
    return undefined;
  }
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

async function diagnoseEngine(): Promise<void> {
  const config = vscode.workspace.getConfiguration("universalCicd");
  const configuredPath = config.get<string>("enginePath", "").trim();
  const executable = config.get<string>("powershellExecutable", "pwsh").trim() || "pwsh";
  const folders = vscode.workspace.workspaceFolders ?? [];
  const candidates = folders.map(folder => join(folder.uri.fsPath, "cicd.ps1"));
  const configuredScript = configuredPath ? join(resolve(configuredPath), "cicd.ps1") : "";
  const validConfigured = Boolean(configuredScript && existsSync(configuredScript));
  const workspaceScript = candidates.find(path => existsSync(path));
  const engine = resolveEngine();
  const details = [
    "Universal CI/CD — Diagnóstico do motor",
    "=====================================",
    `PowerShell configurado: ${executable}`,
    `Pasta configurada: ${configuredPath || "(não configurada)"}`,
    `Arquivo configurado: ${configuredScript || "(nenhum)"}`,
    `Arquivo configurado encontrado: ${validConfigured ? "SIM" : "NÃO"}`,
    `Workspace aberto: ${folders.length ? "SIM" : "NÃO"}`,
    `Motor encontrado na raiz de workspace: ${workspaceScript || "NÃO"}`,
    `Motor selecionado: ${engine?.scriptPath || "NÃO LOCALIZADO"}`
  ];

  if (!engine) {
    output.clear();
    output.appendLine(details.join("\n"));
    output.show(true);
    const choice = await vscode.window.showWarningMessage(
      configuredPath && !validConfigured
        ? "O caminho configurado não contém cicd.ps1. Configure novamente a localização do motor."
        : "O motor Universal CI/CD não foi localizado. Selecione a pasta que contém cicd.ps1.",
      "Configurar motor", "Abrir configurações"
    );
    if (choice === "Configurar motor") await vscode.commands.executeCommand("universalCicd.configureEngine");
    if (choice === "Abrir configurações") await vscode.commands.executeCommand("workbench.action.openSettings", "universalCicd");
    dashboard?.refresh();
    return;
  }

  const healthy = await execute("version");
  output.appendLine("");
  output.appendLine(details.join("\n"));
  output.appendLine(healthy
    ? "Resultado: o motor foi localizado e o comando de versão concluiu com sucesso."
    : "Resultado: o comando de versão falhou. Verifique PowerShell, permissões e saída acima.");
  if (healthy) void vscode.window.showInformationMessage("Universal CI/CD: motor localizado e comando de versão concluído.");
}

async function inspectUpsFile(context: vscode.ExtensionContext): Promise<void> {
  const selected = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Inspecionar UPS (somente leitura)",
    filters: { "Universal Pipeline Specification": ["json"] }
  });
  if (!selected?.[0]) return;

  output.clear();
  output.appendLine("Universal CI/CD — UPS Inspector");
  output.appendLine(`Arquivo selecionado: ${selected[0].fsPath}`);
  output.appendLine("Leitura limitada a 1 MB; nenhum comando será executado.");
  output.show(true);

  try {
    const bytes = await vscode.workspace.fs.readFile(selected[0]);
    if (bytes.byteLength > 1_000_000) {
      output.appendLine("ERRO: arquivo excede o limite de 1 MB.");
      void vscode.window.showErrorMessage("UPS Inspector: o arquivo excede 1 MB.");
      return;
    }

    const document = JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown;
    const jobs = (document as { jobs?: unknown } | null)?.jobs;
    if (!jobs || typeof jobs !== "object" || Array.isArray(jobs) || Object.keys(jobs).length > 500) {
      output.appendLine("ERRO: o documento deve conter um mapa jobs com no máximo 500 jobs.");
      void vscode.window.showErrorMessage("UPS Inspector: limite de 500 jobs ou estrutura inválida.");
      return;
    }
    const validation = validateUpsPipeline(document);
    if (!validation.valid) {
      output.appendLine("VALIDAÇÃO UPS: REPROVADA");
      for (const issue of validation.issues.slice(0, 100)) {
        output.appendLine(`[${issue.code}] ${issue.path}: ${issue.message}`);
      }
      if (validation.issues.length > 100) output.appendLine("Demais problemas omitidos pelo limite de saída.");
      void vscode.window.showWarningMessage("UPS Inspector: documento inválido. Consulte o canal Output.");
      return;
    }

    const planned = generateUpsExecutionPlan(document);
    if (!planned.valid || !planned.plan) {
      output.appendLine("Não foi possível gerar o plano declarativo.");
      for (const issue of planned.issues.slice(0, 100)) {
        output.appendLine(`[${issue.code}] ${issue.path}: ${issue.message}`);
      }
      return;
    }

    const intelligence = analyzePipelineIntelligence(planned.plan);
    if (!intelligence.valid || !intelligence.analysis) {
      output.appendLine("Análise de dependências indisponível.");
      for (const issue of intelligence.issues) output.appendLine(issue);
      return;
    }

    const report = formatUpsAnalysis(planned.plan, intelligence.analysis);
    openUpsGraphPanel(context, {
      pipelineName: planned.plan.pipelineName,
      jobs: planned.plan.jobs.map(job => ({
        id: job.id,
        name: job.name?.trim() || job.id,
        dependencies: [...job.dependencies],
        requiredCapabilities: [...job.requiredCapabilities],
        stepCount: job.steps.length
      })),
      analysis: intelligence.analysis
    });
    output.appendLine("");

    output.append(report.slice(0, 100_000));
    if (report.length > 100_000) output.appendLine("\nRelatório truncado no limite de 100.000 caracteres.");
    void vscode.window.showInformationMessage("UPS Inspector: análise somente leitura concluída.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível ler o documento.";
    output.appendLine(`ERRO: ${message}`);
    void vscode.window.showErrorMessage(`UPS Inspector: ${message}`);
  }
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
    ["universalCicd.configureEngine", async () => {
      const selected = await vscode.window.showOpenDialog({
        canSelectMany: false, canSelectFolders: true, canSelectFiles: false,
        openLabel: "Selecionar pasta do motor Universal CI/CD"
      });
      if (!selected?.[0]) return;
      const scriptPath = join(selected[0].fsPath, "cicd.ps1");
      if (!existsSync(scriptPath)) {
        void vscode.window.showErrorMessage("A pasta selecionada não contém cicd.ps1.");
        return;
      }
      const scope = vscode.workspace.workspaceFolders?.length
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
      await vscode.workspace.getConfiguration("universalCicd").update("enginePath", selected[0].fsPath, scope);
      output.appendLine("Motor configurado: " + scriptPath);
      output.appendLine("Verificando versão do motor...");
      dashboard?.refresh();
      await execute("version");
    }],
    ["universalCicd.diagnoseEngine", () => diagnoseEngine()],
    ["universalCicd.inspectUps", () => inspectUpsFile(context)],
    ["universalCicd.openDashboard", () => {
      const panel = openDashboardPanel(context, () => {
        const workspace = vscode.workspace.workspaceFolders?.[0];
        const engine = resolveEngine();
        const configuredPath = vscode.workspace.getConfiguration("universalCicd").get<string>("enginePath", "").trim();
        return {
          workspaceName: workspace?.name ?? "",
          workspacePath: workspace?.uri.fsPath ?? "",
          engineFound: Boolean(engine),
          enginePath: engine?.scriptPath ?? configuredPath,
          plan: readLatestPlan(workspace?.uri.fsPath)
        };
      });
      context.subscriptions.push(panel);
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
