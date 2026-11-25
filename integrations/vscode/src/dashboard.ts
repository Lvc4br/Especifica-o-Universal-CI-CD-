import * as vscode from "vscode";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

type SectionId = "workspace" | "analysis" | "execution" | "reports";

interface DashboardEntry {
  label: string;
  description?: string;
  tooltip?: string;
  icon: string;
  command?: string;
}

class DashboardItem extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly section?: SectionId,
    command?: string,
    description?: string,
    tooltip?: string,
    icon = "circle-outline"
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.tooltip = tooltip ?? label;
    this.iconPath = new vscode.ThemeIcon(icon);
    if (command) this.command = { command, title: label };
    this.contextValue = section ? "universalCicd.section" : "universalCicd.action";
  }
}

export class DashboardProvider implements vscode.TreeDataProvider<DashboardItem> {
  private readonly changed = new vscode.EventEmitter<DashboardItem | undefined | void>();
  readonly onDidChangeTreeData = this.changed.event;

  refresh(): void {
    this.changed.fire();
  }

  getTreeItem(item: DashboardItem): vscode.TreeItem {
    return item;
  }

  getChildren(element?: DashboardItem): DashboardItem[] {
    if (element?.section) {
      return this.entriesFor(element.section).map(entry =>
        new DashboardItem(
          entry.label,
          vscode.TreeItemCollapsibleState.None,
          undefined,
          entry.command,
          entry.description,
          entry.tooltip,
          entry.icon
        )
      );
    }

    if (element) return [];

    const workspace = vscode.workspace.workspaceFolders?.[0];
    const enginePath = vscode.workspace.getConfiguration("universalCicd").get<string>("enginePath", "").trim();
    const engineFound = enginePath
      ? existsSync(join(resolve(enginePath), "cicd.ps1"))
      : (vscode.workspace.workspaceFolders ?? []).some(folder => existsSync(join(folder.uri.fsPath, "cicd.ps1")));

    return [
      new DashboardItem(
        "Workspace",
        vscode.TreeItemCollapsibleState.Expanded,
        "workspace",
        undefined,
        workspace?.name ?? "Nenhuma pasta aberta",
        workspace?.uri.fsPath ?? "Abra uma pasta para começar",
        "folder"
      ),
      new DashboardItem(
        "Análise",
        vscode.TreeItemCollapsibleState.Expanded,
        "analysis",
        undefined,
        "Detecção, validação e planejamento",
        undefined,
        "search"
      ),
      new DashboardItem(
        "Execução",
        vscode.TreeItemCollapsibleState.Expanded,
        "execution",
        undefined,
        "Execução local com aprovação explícita",
        undefined,
        "play"
      ),
      new DashboardItem(
        "Relatórios",
        vscode.TreeItemCollapsibleState.Expanded,
        "reports",
        undefined,
        "Histórico e exportação",
        undefined,
        "file-text"
      ),
      new DashboardItem(
        "Motor",
        vscode.TreeItemCollapsibleState.None,
        undefined,
        "universalCicd.showStatus",
        engineFound ? "Motor PowerShell encontrado" : "Motor não localizado",
        enginePath || "Procura cicd.ps1 na raiz do workspace",
        engineFound ? "check-circle" : "alert"
      )
    ];
  }

  dispose(): void {
    this.changed.dispose();
  }

  private entriesFor(section: SectionId): DashboardEntry[] {
    switch (section) {
      case "workspace":
        return [
          { label: "Diagnosticar motor", command: "universalCicd.diagnoseEngine", icon: "activity" },
          { label: "Configurar motor", command: "universalCicd.configureEngine", icon: "settings" },
          { label: "Inicializar projeto", command: "universalCicd.initializeProject", icon: "folder-plus" },
          { label: "Descobrir projetos", command: "universalCicd.discoverProjects", icon: "folder-search" },
          { label: "Atualizar painel", command: "universalCicd.refreshDashboard", icon: "refresh-cw" }
        ];
      case "analysis":
        return [
          { label: "Analisar tecnologias do projeto", command: "universalCicd.analyzeWorkspace", icon: "scan-search" },
          { label: "Detectar tecnologias (engine)", command: "universalCicd.detect", icon: "search" },
          { label: "Validar configuração", command: "universalCicd.validateConfig", icon: "shield-check" },
          { label: "Gerar plano", command: "universalCicd.plan", icon: "list-checks" },
          { label: "Status do projeto", command: "universalCicd.showStatus", icon: "activity" }
        ];
      case "execution":
        return [
          { label: "Executar pipeline", description: "Requer confirmação", command: "universalCicd.run", icon: "play" },
          { label: "Executar workspace", description: "Requer confirmação", command: "universalCicd.runWorkspaces", icon: "layers" }
        ];
      case "reports":
        return [
          { label: "Ver histórico", command: "universalCicd.history", icon: "history" },
          { label: "Exportar relatório", command: "universalCicd.exportReport", icon: "file-output" },
          { label: "Abrir saída", command: "universalCicd.openOutput", icon: "terminal" }
        ];
    }
  }
}
