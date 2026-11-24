import * as vscode from "vscode";
import { randomBytes } from "node:crypto";

export interface DashboardState {
  workspaceName: string;
  workspacePath: string;
  engineFound: boolean;
  enginePath: string;
}

const COMMANDS = new Set([
  "universalCicd.detect",
  "universalCicd.validateConfig",
  "universalCicd.plan",
  "universalCicd.showStatus",
  "universalCicd.history",
  "universalCicd.exportReport",
  "universalCicd.run",
  "universalCicd.refreshDashboard",
  "universalCicd.openOutput"
]);

function nonce(): string {\n  return randomBytes(16).toString("base64");\n}mport * as vscode from "vscode";
import { randomBytes } from "node:crypto";

export interface DashboardState {
  workspaceName: string;
  workspacePath: string;
  engineFound: boolean;
  enginePath: string;
}

const COMMANDS = new Set([
  "universalCicd.detect",
  "universalCicd.validateConfig",
  "universalCicd.plan",
  "universalCicd.showStatus",
  "universalCicd.history",
  "universalCicd.exportReport",
  "universalCicd.run",
  "universalCicd.refreshDashboard",
  "universalCicd.openOutput"
]);

function nonce(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

export function openDashboardPanel(
  context: vscode.ExtensionContext,
  getState: () => DashboardState
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "universalCicd.dashboardPanel",
    "Universal CI/CD",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: []
    }
  );

  const token = nonce();
  panel.webview.html = getHtml(panel.webview, token);
  panel.webview.onDidReceiveMessage(async message => {
    if (!message || typeof message !== "object" || typeof message.command !== "string") return;
    if (message.command === "ready") {
      await panel.webview.postMessage({ type: "state", ...getState() });
      return;
    }
    if (!COMMANDS.has(message.command)) return;
    await vscode.commands.executeCommand(message.command);
    await panel.webview.postMessage({ type: "state", ...getState() });
  }, undefined, context.subscriptions);

  const refresh = (): void => {
    void panel.webview.postMessage({ type: "state", ...getState() });
  };
  const workspaceListener = vscode.workspace.onDidChangeWorkspaceFolders(refresh);
  const configListener = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration("universalCicd.enginePath")) refresh();
  });
  panel.onDidDispose(() => {
    workspaceListener.dispose();
    configListener.dispose();
  });

  return panel;
}

function getHtml(webview: vscode.Webview, token: string): string {
  const csp = webview.cspSource;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${token}'; script-src 'nonce-${token}';">
<title>Universal CI/CD</title>
<style nonce="${token}">
:root{color-scheme:dark;--bg:#0b1020;--panel:#111a2e;--panel2:#151f36;--line:#26334e;--muted:#91a0ba;--text:#edf3ff;--cyan:#58d7e8;--violet:#9b8cff;--green:#62d6a5;--amber:#f1bd67}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 75% -10%,#20335a 0,transparent 42%),var(--bg);color:var(--text);font:13px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
button{font:inherit;cursor:pointer}.shell{max-width:1180px;margin:0 auto;padding:30px 34px 48px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:30px}.brand{display:flex;align-items:center;gap:13px}.mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#56d8e7,#7c79f6);color:#091222;font-size:21px;font-weight:900;box-shadow:0 8px 28px #4ec9e844}.brandname{font-size:16px;font-weight:750;letter-spacing:.2px}.subbrand{font-size:11px;color:var(--muted)}.version{border:1px solid var(--line);border-radius:999px;padding:6px 11px;color:var(--muted);font-size:11px}
.hero{display:grid;grid-template-columns:1.5fr .8fr;gap:20px;margin-bottom:18px}.hero-main,.hero-side,.card{border:1px solid var(--line);border-radius:17px;background:linear-gradient(145deg,#151f35ee,#10182aee);box-shadow:0 12px 40px #00000018}.hero-main{padding:27px 29px;position:relative;overflow:hidden}.eyebrow{color:var(--cyan);font-size:10px;letter-spacing:1.7px;text-transform:uppercase;font-weight:800}.hero h1{font-size:clamp(25px,4vw,38px);line-height:1.13;letter-spacing:-1.1px;margin:10px 0 12px;max-width:560px}.hero p{color:var(--muted);max-width:570px;margin:0 0 20px}.actions{display:flex;flex-wrap:wrap;gap:9px}.btn{border:1px solid var(--line);background:#1c2942;color:var(--text);padding:9px 13px;border-radius:9px;font-weight:650}.btn.primary{background:linear-gradient(100deg,#55d6e5,#8a87ff);border:0;color:#091222}.btn:hover{filter:brightness(1.12)}.hero-side{padding:22px;display:flex;flex-direction:column;justify-content:space-between;min-height:210px}.statusline{display:flex;align-items:center;gap:9px;font-weight:700}.dot{width:8px;height:8px;border-radius:50%;background:var(--amber);box-shadow:0 0 12px currentColor}.dot.ok{background:var(--green)}.path{margin-top:7px;color:var(--muted);font-size:11px;overflow-wrap:anywhere}.workspace{margin-top:18px;padding-top:17px;border-top:1px solid var(--line)}.workspace small{display:block;color:var(--muted);margin-bottom:3px}.workspace strong{font-size:14px;overflow-wrap:anywhere}
.section-head{display:flex;justify-content:space-between;align-items:end;margin:28px 0 12px}.section-head h2{font-size:15px;margin:0}.section-head span{color:var(--muted);font-size:11px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric{padding:16px 17px}.metric-label{color:var(--muted);font-size:11px}.metric-value{font-size:22px;font-weight:750;margin-top:7px;letter-spacing:-.5px}.metric-note{font-size:10px;color:var(--muted);margin-top:2px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{padding:18px}.card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.glyph{width:34px;height:34px;border-radius:10px;background:#24334f;color:var(--cyan);display:grid;place-items:center;font-size:16px}.tag{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--amber);border:1px solid #735b35;border-radius:99px;padding:3px 7px}.tag.ready{color:var(--green);border-color:#326c5a}.card h3{margin:0 0 5px;font-size:13px}.card p{margin:0;color:var(--muted);font-size:11px;min-height:35px}.card button{margin-top:14px;background:transparent;color:var(--cyan);border:0;padding:0;font-size:11px;font-weight:700}
.bottom{display:grid;grid-template-columns:1.15fr .85fr;gap:12px;margin-top:12px}.list{display:grid;gap:11px}.listrow{display:flex;gap:11px;align-items:flex-start}.listrow .glyph{flex:none}.listrow strong{display:block;font-size:11px}.listrow span{display:block;color:var(--muted);font-size:10px}.notice{border:1px solid #665332;background:#2a2419;border-radius:12px;padding:13px;color:#e8d4aa;font-size:11px}.footer{margin-top:25px;color:#71809b;font-size:10px;display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--line);padding-top:14px}
@media(max-width:760px){.shell{padding:20px 16px 32px}.hero{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:repeat(2,1fr)}.bottom{grid-template-columns:1fr}}@media(max-width:460px){.grid{grid-template-columns:1fr}.top{align-items:flex-start}.hero-main{padding:22px}.footer{flex-direction:column}}
</style>
</head>
<body>
<div class="shell">
<header class="top"><div class="brand"><div class="mark">U</div><div><div class="brandname">UNIVERSAL CI/CD</div><div class="subbrand">Developer workflow intelligence</div></div></div><div class="version">PREVIEW · 0.4.0</div></header>
<section class="hero">
<div class="hero-main"><div class="eyebrow">Seu centro de engenharia</div><h1>Do código ao pipeline.<br>Com clareza em cada etapa.</h1><p>Analise projetos, entenda dependências e prepare fluxos de CI/CD em um único espaço de trabalho — com decisões transparentes e controle humano.</p><div class="actions"><button class="btn primary" data-command="universalCicd.plan">⌁ Gerar plano</button><button class="btn" data-command="universalCicd.detect">Detectar projeto</button><button class="btn" data-command="universalCicd.showStatus">Ver status</button></div></div>
<aside class="hero-side"><div><div class="eyebrow">Conexão local</div><div class="statusline" style="margin-top:13px"><span id="engine-dot" class="dot"></span><span id="engine-status">Verificando motor…</span></div><div id="engine-path" class="path">Aguardando informações do workspace</div></div><div class="workspace"><small>WORKSPACE ATIVO</small><strong id="workspace-name">Nenhuma pasta aberta</strong><div id="workspace-path" class="path"></div></div></aside>
</section>
<div class="section-head"><h2>Visão geral</h2><span>Estado da integração local</span></div>
<section class="metrics">
<div class="card metric"><div class="metric-label">Motor PowerShell</div><div class="metric-value" id="metric-engine">—</div><div class="metric-note">Detecção no workspace</div></div>
<div class="card metric"><div class="metric-label">Modo de operação</div><div class="metric-value">Local</div><div class="metric-note">Sem runner remoto ativo</div></div>
<div class="card metric"><div class="metric-label">Aprovação</div><div class="metric-value">Humana</div><div class="metric-note">Confirmação explícita</div></div>
<div class="card metric"><div class="metric-label">IA</div><div class="metric-value">Opcional</div><div class="metric-note">Não necessária para o Core</div></div>
</section>
<div class="section-head"><h2>Central de ferramentas</h2><span>Ações conectadas ao motor existente</span></div>
<section class="grid">
<article class="card"><div class="card-top"><div class="glyph">⌕</div><span class="tag ready">Disponível</span></div><h3>Descoberta & análise</h3><p>Identifique tecnologias e componentes do projeto aberto.</p><button data-command="universalCicd.detect">INICIAR DETECÇÃO ↗</button></article>
<article class="card"><div class="card-top"><div class="glyph">✓</div><span class="tag ready">Disponível</span></div><h3>Validação de configuração</h3><p>Verifique a configuração antes de preparar qualquer execução.</p><button data-command="universalCicd.validateConfig">VALIDAR CONFIGURAÇÃO ↗</button></article>
<article class="card"><div class="card-top"><div class="glyph">⌘</div><span class="tag ready">Disponível</span></div><h3>Planejador de pipeline</h3><p>Gere um plano revisável sem iniciar execução remota.</p><button data-command="universalCicd.plan">GERAR PLANO ↗</button></article>
<article class="card"><div class="card-top"><div class="glyph">◇</div><span class="tag">Em evolução</span></div><h3>Inteligência de pipeline</h3><p>Contratos para DAG, paralelismo, dependências e caminho crítico estrutural.</p><button data-command="universalCicd.openOutput">VER SAÍDA ↗</button></article>
<article class="card"><div class="card-top"><div class="glyph">⬡</div><span class="tag">Assessment</span></div><h3>Políticas & confiança</h3><p>Avaliação declarativa de regras; ainda não concede autorização.</p><button data-command="universalCicd.openOutput">VER SAÍDA ↗</button></article>
<article class="card"><div class="card-top"><div class="glyph">▤</div><span class="tag">Em evolução</span></div><h3>Relatórios & histórico</h3><p>Consulte o histórico e exporte relatórios produzidos pelo motor.</p><button data-command="universalCicd.history">ABRIR HISTÓRICO ↗</button></article>
</section>
<section class="bottom">
<div class="card"><div class="section-head" style="margin:0 0 15px"><h2>Próximos passos</h2><span>Fluxo recomendado</span></div><div class="list">
<div class="listrow"><div class="glyph">01</div><div><strong>Conecte o motor</strong><span>Configure o caminho de cicd.ps1 se ele não estiver na raiz do projeto.</span></div></div>
<div class="listrow"><div class="glyph">02</div><div><strong>Analise o workspace</strong><span>Execute detecção, validação e revisão do plano.</span></div></div>
<div class="listrow"><div class="glyph">03</div><div><strong>Revise antes de executar</strong><span>Execução local permanece protegida por confirmação explícita.</span></div></div>
</div></div>
<div class="card"><div class="section-head" style="margin:0 0 15px"><h2>Limites desta preview</h2></div><div class="notice">Esta interface é uma primeira camada visual conectada aos comandos locais. Dados de GitHub, runners, execuções distribuídas e métricas em tempo real ainda não são apresentados como se estivessem conectados.</div><p style="color:var(--muted);font-size:10px;margin:12px 0 0">Nenhum pipeline é executado ao abrir este painel. Toda ação operacional continua dependendo dos comandos existentes e das respectivas proteções.</p></div>
</section>
<footer class="footer"><span>UNIVERSAL CI/CD · Preview de desenvolvimento</span><span>Local-first · Human-in-the-loop · Extensível</span></footer>
</div>
<script nonce="${token}">
const vscode = acquireVsCodeApi();
document.querySelectorAll("[data-command]").forEach(button => button.addEventListener("click", () => vscode.postMessage({command:button.dataset.command})));
window.addEventListener("message", event => {
 const state=event.data;if(!state||state.type!=="state")return;
 const found=Boolean(state.engineFound);
 document.getElementById("engine-dot").classList.toggle("ok",found);
 document.getElementById("engine-status").textContent=found?"Motor PowerShell localizado":"Motor não localizado";
 document.getElementById("engine-path").textContent=state.enginePath||"Configure universalCicd.enginePath ou coloque cicd.ps1 na raiz do workspace.";
 document.getElementById("workspace-name").textContent=state.workspaceName||"Nenhuma pasta aberta";
 document.getElementById("workspace-path").textContent=state.workspacePath||"Abra uma pasta para começar";
 document.getElementById("metric-engine").textContent=found?"Conectado":"Pendente";
});
vscode.postMessage({command:"ready"});
</script>
</body></html>`;
}
