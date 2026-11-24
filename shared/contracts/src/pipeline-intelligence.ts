import type { UpsExecutionPlan } from "./ups-execution-plan";
export interface PipelineIntelligenceDiagnostic { code:string; severity:"error"|"warning"|"info"; jobIds:string[]; message:string; recommendation:string; }
export interface PipelineIntelligence {
 schemaVersion:"1"; mode:"analysis-only"; pipelineName:string; topologicalOrder:string[];
 criticalPathJobIds:string[]; criticalPathLengthJobs:number; parallelGroups:string[][];
 independentJobIds:string[]; fanOut:Array<{jobId:string;dependentCount:number;dependentJobIds:string[]}>;
 summary:{jobCount:number;dependencyCount:number;groupCount:number;maxParallelism:number;independentJobCount:number;terminalJobCount:number};
 diagnostics:PipelineIntelligenceDiagnostic[];
}
export interface PipelineIntelligenceResult { valid:boolean; analysis?:PipelineIntelligence; issues:string[]; }
type JobLike={id:string;dependencies:string[]};
function isRecord(v:unknown):v is Record<string,unknown>{return typeof v==="object"&&v!==null&&!Array.isArray(v);}
function nonEmptyString(v:unknown):v is string{return typeof v==="string"&&v.trim().length>0;}
function lexical(a:string,b:string):number{return a<b?-1:a>b?1:0;}

/** Static, deterministic DAG analysis. Never executes, contacts or authorizes runners. */
export function analyzePipelineIntelligence(plan:UpsExecutionPlan):PipelineIntelligenceResult {
 if(!isRecord(plan)||plan.schemaVersion!=="1"||plan.generatedFrom!=="UPS v1"||plan.executionMode!=="plan-only"||plan.valid!==true||!nonEmptyString(plan.pipelineName))
  return {valid:false,issues:["Input must be a structurally identified, valid UPS v1 plan-only object."]};
 if(!Array.isArray(plan.jobs)||plan.jobs.length===0)return {valid:false,issues:["Plan must contain a non-empty jobs array."]};
 const issues:string[]=[];const byId=new Map<string,JobLike>();
 for(const [i,c] of plan.jobs.entries()){
  if(!isRecord(c)||!nonEmptyString(c.id)||!Array.isArray(c.dependencies)||!c.dependencies.every(nonEmptyString)){issues.push("Job at index "+i+" must have a non-empty ID and a string dependency array.");continue;}
  if(byId.has(c.id))issues.push("Duplicate job ID: "+c.id);else byId.set(c.id,{id:c.id,dependencies:[...c.dependencies]});
 }
 if(issues.length)return {valid:false,issues};
 const ids=[...byId.keys()].sort(lexical);const dependents=new Map(ids.map(id=>[id,[] as string[]]));let dependencyCount=0;
 for(const id of ids){
  const deps=byId.get(id)!.dependencies;const unique=[...new Set(deps)].sort(lexical);dependencyCount+=unique.length;
  if(unique.length!==deps.length)issues.push("Job "+id+" contains duplicate dependency references.");
  for(const dep of unique){if(dep===id)issues.push("Job "+id+" cannot depend on itself.");else if(!byId.has(dep))issues.push("Job "+id+" references missing dependency "+dep+".");else dependents.get(dep)!.push(id);}
 }
 if(issues.length)return {valid:false,issues};
 for(const values of dependents.values())values.sort(lexical);
 const remaining=new Map(ids.map(id=>[id,byId.get(id)!.dependencies.length]));let ready=ids.filter(id=>remaining.get(id)===0);
 const order:string[]=[];const depth=new Map<string,number>();const paths=new Map<string,string[]>();
 while(ready.length){
  ready.sort(lexical);const current=ready.shift()!;order.push(current);const deps=[...new Set(byId.get(current)!.dependencies)];
  depth.set(current,deps.length?Math.max(...deps.map(id=>depth.get(id)!))+1:0);
  let best=[current];
  for(const dep of deps.sort(lexical)){const candidate=[...paths.get(dep)!,current];if(candidate.length>best.length||(candidate.length===best.length&&candidate.join("\0")<best.join("\0")))best=candidate;}
  paths.set(current,best);
  for(const child of dependents.get(current)!){const n=remaining.get(child)!-1;remaining.set(child,n);if(n===0)ready.push(child);}
 }
 if(order.length!==ids.length){const cycle=ids.filter(id=>!order.includes(id));return {valid:false,issues:["Dependency cycle detected among jobs: "+cycle.join(", ")+"."]};}
 const groupsMap=new Map<number,string[]>();for(const id of order){const d=depth.get(id)!;if(!groupsMap.has(d))groupsMap.set(d,[]);groupsMap.get(d)!.push(id);}
 const parallelGroups=[...groupsMap.entries()].sort((a,b)=>a[0]-b[0]).map(([,g])=>g.sort(lexical));
 const terminal=ids.filter(id=>dependents.get(id)!.length===0);let critical:string[]=[];
 for(const id of terminal){const candidate=paths.get(id)!;if(candidate.length>critical.length||(candidate.length===critical.length&&candidate.join("\0")<critical.join("\0")))critical=candidate;}
 const independent=ids.filter(id=>byId.get(id)!.dependencies.length===0);
 const fanOut=ids.map(jobId=>({jobId,dependentCount:dependents.get(jobId)!.length,dependentJobIds:[...dependents.get(jobId)!]}));
 const maxParallelism=parallelGroups.reduce((m,g)=>Math.max(m,g.length),0);const diagnostics:PipelineIntelligenceDiagnostic[]=[];
 const parallel=parallelGroups.filter(g=>g.length>1);
 if(parallel.length)diagnostics.push({code:"PIPELINE_PARALLELISM_AVAILABLE",severity:"info",jobIds:parallel.flat(),message:"The graph contains jobs eligible in the same planning wave.",recommendation:"Consider parallel execution only after runner capacity, isolation and policy gates are implemented."});
 const high=fanOut.filter(x=>x.dependentCount>=3);
 if(high.length)diagnostics.push({code:"PIPELINE_HIGH_FAN_OUT",severity:"warning",jobIds:high.map(x=>x.jobId),message:"Some jobs are prerequisites for three or more downstream jobs.",recommendation:"Review prerequisite necessity and failure impact."});
 diagnostics.push({code:"PIPELINE_CRITICAL_PATH_IS_STRUCTURAL",severity:"info",jobIds:critical,message:"Critical path length is measured in jobs, not elapsed time.",recommendation:"Use trustworthy historical duration data before attempting time-based optimization."});
 return {valid:true,issues:[],analysis:{schemaVersion:"1",mode:"analysis-only",pipelineName:plan.pipelineName,topologicalOrder:order,criticalPathJobIds:critical,criticalPathLengthJobs:critical.length,parallelGroups,independentJobIds:independent,fanOut,summary:{jobCount:ids.length,dependencyCount,groupCount:parallelGroups.length,maxParallelism,independentJobCount:independent.length,terminalJobCount:terminal.length},diagnostics}};
}
