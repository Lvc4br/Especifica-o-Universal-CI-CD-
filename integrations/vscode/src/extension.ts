import * as vscode from "vscode";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const output = vscode.window.createOutputChannel("Universal CI/CD");

function resolveEngineDirectory(): string | undefined {
  const configured = vscode.workspace.getConfiguration("universalCicd").get<string>("enginePath", "").trim();
  if (configured) {
    const candidate = resolve(configured);
    return existsSync(join(candidate, "cicd.ps1")) ? candidate : undefined;
  }

  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    if (existsSync(join(folder.uri.fsPath, "cicd.ps1"))) {
      return folder.uri.fsPath;
    }
  }
  return undefined;
}

async function showProjectStatus(): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    void vscode.window.showWarningMessage("Abra uma pasta de projeto para usar o Universal CI/CD.");
    return;
  }

  const engineDirectory = resolveEngineDirectory();
  if (!engineDirectory) {
    void vscode.window.showErrorMessage(
      "Não encontrei cicd.ps1. Configure universalCicd.enginePath apontando para a pasta do motor."
    );
    return;
  }

  const executable = vscode.workspace.getConfiguration("universalCicd")
    .get<string>("powershellExecutable", "pwsh");
  const script = join(engineDirectory, "cicd.ps1");
  output.clear();
  output.appendLine("Universal CI/CD — status do projeto");
  output.appendLine(`Projeto: ${workspace.uri.fsPath}`);
  output.appendLine(`Motor: ${script}`);
  output.show(true);

  await new Promise<void>((resolvePromise) => {
    const child = spawn(executable, [
      "-NoLogo",
      "-NoProfile",
      "-File",
      script,
      "status",
      "-ProjectPath",
      workspace.uri.fsPath
    ], {
      cwd: engineDirectory,
      windowsHide: true
    });

    child.stdout.on("data", (chunk: Buffer) => output.append(chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => output.append(chunk.toString()));
    child.on("error", (error: Error) => {
      output.appendLine(`Falha ao iniciar PowerShell: ${error.message}`);
      void vscode.window.showErrorMessage("Não foi possível iniciar PowerShell 7. Verifique a configuração.");
      resolvePromise();
    });
    child.on("close", (code: number | null) => {
      output.appendLine(`\nProcesso encerrado com código: ${code ?? "desconhecido"}`);
      resolvePromise();
    });
  });
}

export function activate(context: vscode.ExtensionContext): void {
  output.appendLine("Universal CI/CD extension activated.");
  context.subscriptions.push(output);
  context.subscriptions.push(
    vscode.commands.registerCommand("universalCicd.showStatus", showProjectStatus)
  );
}

export function deactivate(): void {
  output.dispose();
}
