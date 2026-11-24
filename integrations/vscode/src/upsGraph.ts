import * as vscode from "vscode";
import { randomBytes } from "node:crypto";
import type { PipelineIntelligence } from "@universal-cicd/contracts";

interface GraphJob {
  id: string;
  name: string;
  dependencies: string[];
  requiredCapabilities: string[];
  stepCount: number;
}
interface GraphPayload {
  pipelineName: string;
  jobs: GraphJob[];
  analysis: PipelineIntelligence;
}

/** Render a read-only UPS DAG. All graph content arrives through postMessage and is inserted as text nodes. */
export function openUpsGraphPanel(context: vscode.ExtensionContext, payload: GraphPayload): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "universalCicd.upsGraph",
    "Universal CI/CD — Pipeline Graph",
    vscode.ViewColumn.Beside,
    { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
  );
  const token = randomBytes(16).toString("base64");
  panel.webview.html = graphHtml(token);
  void panel.webview.postMessage({ type: "graph", payload });
  const messageListener = panel.webview.onDidReceiveMessage(message => {
    if (message?.command === "ready") void panel.webview.postMessage({ type: "graph", payload });
  });
  panel.onDidDispose(() => messageListener.dispose());
  context.subscriptions.push(panel);
  return panel;
}

function graphHtml(token: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${token}'; script-src 'nonce-${token}';">
<title>Pipeline Graph</title>
<style nonce="${token}">
:root{color-scheme:dark;--bg:#0b1020;--panel:#111a2e;--line:#293754;--muted:#9aa9c2;--text:#edf3ff;--cyan:#58d7e8;--violet:#9b8cff;--green:#62d6a5;--amber:#f1bd67;--red:#f07878}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}.shell{padding:24px;max-width:1500px;margin:auto}.top{display:flex;justify-content:space-between;gap:16px;align-items:start;flex-wrap:wrap}.eyebrow{font-size:10px;letter-spacing:1.5px;color:var(--cyan);font-weight:800}.title{font-size:25px;margin:4px 0}.muted{color:var(--muted)}.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.chip{border:1px solid var(--line);border-radius:9px;padding:7px 10px;background:var(--panel);font-size:11px}.legend{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:11px;margin:12px 0}.graph-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}.graph-tools label{color:var(--muted);font-size:11px}.graph-tools input{background:var(--panel);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:7px 10px;min-width:190px}.graph-tools button{background:var(--panel);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:7px 10px}.graph-tools button:focus,.graph-tools input:focus{outline:2px solid var(--cyan);outline-offset:2px}.zoom-label{min-width:42px;text-align:center;color:var(--muted);font-size:11px}.key{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;background:#52627f}.key.critical{background:var(--violet)}.key.parallel{background:var(--cyan)}.canvas{border:1px solid var(--line);border-radius:14px;background:#0e1728;overflow:auto;min-height:260px}.canvas svg{display:block}.node{cursor:pointer}.node rect{fill:#17243a;stroke:#40516f;stroke-width:1.5}.node.critical rect{stroke:var(--violet);stroke-width:3}.node.parallel rect{stroke:var(--cyan);stroke-width:2}.node.selected rect{fill:#263653;stroke:#fff;stroke-width:2}.node.dim{opacity:.2}.node.match rect{stroke:var(--green);stroke-width:3}.node text{font-family:system-ui,sans-serif;pointer-events:none}.edge{fill:none;stroke:#52627f;stroke-width:1.6;opacity:.8}.edge.critical{stroke:var(--violet);stroke-width:3}.detail{margin-top:14px;padding:16px;border:1px solid var(--line);border-radius:12px;background:var(--panel);min-height:110px}.detail h2{font-size:15px;margin:0 0 8px}.detail p{margin:4px 0;color:var(--muted);overflow-wrap:anywhere}.diagnostics{margin-top:18px}.diagnostics h2{font-size:15px}.diag{border-left:3px solid var(--cyan);padding:9px 12px;background:var(--panel);margin:8px 0;border-radius:0 8px 8px 0}.diag.warning{border-color:var(--amber)}.diag.error{border-color:var(--red)}.empty{padding:32px;color:var(--muted)}@media(max-width:600px){.shell{padding:15px}.title{font-size:20px}}
</style></head><body><main class="shell">
<header class="top"><div><div class="eyebrow">UNIVERSAL CI/CD · VISUAL PIPELINE INTELLIGENCE</div><h1 class="title" id="pipeline">Carregando pipeline…</h1><div class="muted">DAG declarativo · análise somente leitura · sem execução</div></div><div class="chip">UPS v1 · ANALYSIS-ONLY</div></header>
<section class="metrics" id="metrics"></section>
<div class="legend"><span><i class="key critical"></i>Caminho crítico estrutural</span><span><i class="key parallel"></i>Job em onda paralela</span><span><i class="key"></i>Demais jobs</span></div>
<div class="graph-tools"><label for="job-search">Buscar job</label><input id="job-search" type="search" placeholder="Nome ou ID do job" autocomplete="off"><button id="zoom-out" type="button" aria-label="Diminuir zoom">−</button><button id="zoom-in" type="button" aria-label="Aumentar zoom">+</button><button id="zoom-reset" type="button">Redefinir zoom</button><span class="zoom-label" id="zoom-label">100%</span></div>\n<section class="canvas" id="canvas"><div class="empty">Preparando grafo…</div></section>
<section class="detail" id="detail"><h2>Selecione um job</h2><p>Os detalhes do job aparecerão aqui.</p></section>
<section class="diagnostics"><h2>Diagnósticos e recomendações</h2><div id="diagnostics"></div></section>
<p class="muted">O caminho crítico representa quantidade de jobs, não duração. Ondas indicam profundidade estrutural e não prometem capacidade de execução paralela. Nenhum runner foi contatado ou reservado.</p>
</main>
<script nonce="${token}">
const vscode=acquireVsCodeApi();
const ns="http://www.w3.org/2000/svg";
function el(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function html(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function render(payload){
 const a=payload.analysis,jobs=payload.jobs,byId=new Map(jobs.map(j=>[j.id,j]));
 document.getElementById("pipeline").textContent=payload.pipelineName;
 const metrics=document.getElementById("metrics");
 metrics.replaceChildren();
 const values=[["Jobs",a.summary.jobCount],["Dependências",a.summary.dependencyCount],["Ondas",a.summary.groupCount],["Paralelismo estrutural máximo",a.summary.maxParallelism],["Caminho crítico",a.criticalPathLengthJobs+" jobs"]];
 for(const [k,v] of values)metrics.appendChild(html("span","chip",k+": "+v));
 const groups=a.parallelGroups,critical=new Set(a.criticalPathJobIds),parallel=new Set(groups.filter(g=>g.length>1).flat());
 const positions=new Map(),nodeW=210,nodeH=76,gapX=90,gapY=34,pad=40;
 let maxRows=1;groups.forEach(g=>maxRows=Math.max(maxRows,g.length));
 const width=Math.max(760,pad*2+groups.length*(nodeW+gapX)-gapX),height=pad*2+maxRows*(nodeH+gapY)-gapY;
 const svg=el("svg",{width,height,viewBox:"0 0 "+width+" "+height,"role":"img","aria-label":"Grafo de dependências do pipeline"});
 groups.forEach((group,x)=>group.forEach((id,y)=>positions.set(id,{x:pad+x*(nodeW+gapX),y:pad+y*(nodeH+gapY)})));
 groups.forEach((group,x)=>svg.appendChild(el("text",{x:pad+x*(nodeW+gapX),y:22,fill:"#9aa9c2","font-size":11,"font-weight":700},"Onda "+(x+1))));
 for(const job of jobs){const target=positions.get(job.id);for(const dep of job.dependencies){const source=positions.get(dep);if(!source)continue;const d="M "+(source.x+nodeW)+" "+(source.y+nodeH/2)+" C "+(source.x+nodeW+gapX/2)+" "+(source.y+nodeH/2)+", "+(target.x-gapX/2)+" "+(target.y+nodeH/2)+", "+target.x+" "+(target.y+nodeH/2);svg.appendChild(el("path",{d,class:"edge"+(critical.has(dep)&&critical.has(job.id)?" critical":"")}));}}
 for(const group of groups){for(const id of group){const job=byId.get(id);if(!job)continue;const p=positions.get(id);const g=el("g",{class:"node"+(critical.has(id)?" critical":"")+(parallel.has(id)?" parallel":""),tabindex:"0",role:"button","aria-label":"Job "+id});g.dataset.job=id;g.appendChild(el("rect",{x:p.x,y:p.y,width:nodeW,height:nodeH,rx:10}));g.appendChild(el("text",{x:p.x+13,y:p.y+23,fill:"#edf3ff","font-size":12,"font-weight":700},(job.name||job.id).slice(0,27)));g.appendChild(el("text",{x:p.x+13,y:p.y+43,fill:"#9aa9c2","font-size":10},job.id.slice(0,30)));g.appendChild(el("text",{x:p.x+13,y:p.y+61,fill:"#9aa9c2","font-size":9},job.dependencies.length+" dependência(s) · "+job.stepCount+" step(s)"));g.addEventListener("click",()=>select(job,g));g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(job,g);}});svg.appendChild(g);}}
 const canvas=document.getElementById("canvas");canvas.replaceChildren();canvas.appendChild(svg);
 const search=document.getElementById("job-search");
 search.addEventListener("input",()=>{const query=search.value.trim().toLocaleLowerCase();for(const node of svg.querySelectorAll(".node")){const job=byId.get(node.dataset.job);const match=!!job&&(job.id.toLocaleLowerCase().includes(query)||job.name.toLocaleLowerCase().includes(query));node.classList.toggle("dim",query.length>0&&!match);node.classList.toggle("match",query.length>0&&match);}});
 let zoom=1;const zoomLabel=document.getElementById("zoom-label");
 const setZoom=()=>{svg.setAttribute("width",String(Math.round(width*zoom)));svg.setAttribute("height",String(Math.round(height*zoom)));zoomLabel.textContent=Math.round(zoom*100)+"%";};
 document.getElementById("zoom-in").addEventListener("click",()=>{zoom=Math.min(2,Math.round((zoom+0.1)*10)/10);setZoom();});
 document.getElementById("zoom-out").addEventListener("click",()=>{zoom=Math.max(0.5,Math.round((zoom-0.1)*10)/10);setZoom();});
 document.getElementById("zoom-reset").addEventListener("click",()=>{zoom=1;setZoom();});
 function select(job,node){document.querySelectorAll(".node.selected").forEach(n=>n.classList.remove("selected"));node.classList.add("selected");const detail=document.getElementById("detail");detail.replaceChildren();detail.appendChild(html("h2","",job.name||job.id));for(const line of ["ID: "+job.id,"Dependências: "+(job.dependencies.join(", ")||"Nenhuma"),"Capabilities: "+(job.requiredCapabilities.join(", ")||"Não declaradas"),"Steps declarados: "+job.stepCount,"Posição na onda: "+(groups.findIndex(g=>g.includes(job.id))+1)])detail.appendChild(html("p","",line));}
 const diagnostics=document.getElementById("diagnostics");diagnostics.replaceChildren();for(const d of a.diagnostics){const box=html("article","diag "+d.severity);box.appendChild(html("strong","",d.code+" · "+d.severity.toUpperCase()));box.appendChild(html("p","",d.message));box.appendChild(html("p","", "Jobs: "+(d.jobIds.join(", ")||"Nenhum")));box.appendChild(html("p","", "Recomendação: "+d.recommendation));diagnostics.appendChild(box);}
}
window.addEventListener("message",event=>{const m=event.data;if(m&&m.type==="graph"&&m.payload)render(m.payload);});
vscode.postMessage({command:"ready"});
</script></body></html>`;
}
