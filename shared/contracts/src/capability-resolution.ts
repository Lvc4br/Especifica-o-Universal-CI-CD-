import type { UpsExecutionPlan } from "./ups-execution-plan";

export type RunnerStatus = "online" | "offline" | "unknown";
export interface CapabilityRunner { id:string; capabilities:string[]; status:RunnerStatus; labels?:string[]; }
export interface JobResolution { jobId:string; requiredCapabilities:string[]; selectedRunner?:string; compatibleRunnerIds:string[]; status:"resolved"|"unresolved"; reasons:string[]; }
export interface CapabilityResolution {
 schemaVersion:"1"; mode:"analysis-only"; planValid:true;
 resolutions:JobResolution[];
 runnerInventory:{runnerCount:number;onlineCount:number;offlineCount:number;unknownCount:number};
 summary:{resolvedJobs:number;unresolvedJobs:number};
 warnings:string[];
}
export interface CapabilityResolutionResult { valid:boolean; resolution?:CapabilityResolution; issues:string[]; }

function isRecord(value:unknown):value is Record<string,unknown> {
 return typeof value==="object" && value!==null && !Array.isArray(value);
}
function nonEmptyString(value:unknown):value is string {
 return typeof value==="string" && value.trim().length>0;
}

/** Pure, deterministic capability analysis. Never executes, contacts or authorizes runners. */
export function resolvePlanCapabilities(plan:UpsExecutionPlan, runners:CapabilityRunner[]):CapabilityResolutionResult {
 const issues:string[]=[];
 if(!isRecord(plan) || plan.executionMode!=="plan-only" || plan.valid!==true ||
    plan.schemaVersion!=="1" || plan.generatedFrom!=="UPS v1" || !nonEmptyString(plan.pipelineName)) {
  return {valid:false,issues:["Input must be a structurally valid UPS v1 plan-only execution plan."]};
 }
 if(!Array.isArray(plan.jobs) || plan.jobs.length===0 || !Array.isArray(runners)) {
  return {valid:false,issues:["Plan jobs and runner inventory must be non-empty arrays (runner inventory may be empty)."]};
 }

 const jobIds=new Set<string>();
 for(const [index,job] of plan.jobs.entries()) {
  if(!isRecord(job) || !nonEmptyString(job.id)) { issues.push("Plan job at index "+index+" must have a non-empty ID."); continue; }
  if(jobIds.has(job.id)) issues.push("Duplicate plan job ID: "+job.id);
  jobIds.add(job.id);
  if(!Array.isArray(job.requiredCapabilities) || !job.requiredCapabilities.every(nonEmptyString))
   issues.push("Job "+job.id+" must have a string list of non-empty required capabilities.");
 }
 const runnerIds=new Set<string>();
 for(const [index,runner] of runners.entries()) {
  if(!isRecord(runner)) { issues.push("Runner at index "+index+" must be an object."); continue; }
  if(!nonEmptyString(runner.id)) issues.push("Runner IDs must be non-empty strings.");
  else if(runnerIds.has(runner.id)) issues.push("Duplicate runner ID: "+runner.id);
  else runnerIds.add(runner.id);
  if(!Array.isArray(runner.capabilities) || !runner.capabilities.every(nonEmptyString))
   issues.push("Runner "+(nonEmptyString(runner.id)?runner.id:"<unknown>")+" must have a list of non-empty capability strings.");
  if(!["online","offline","unknown"].includes(String(runner.status)))
   issues.push("Runner "+(nonEmptyString(runner.id)?runner.id:"<unknown>")+" has an invalid status.");
  if(runner.labels!==undefined && (!Array.isArray(runner.labels)||!runner.labels.every(nonEmptyString)))
   issues.push("Runner "+(nonEmptyString(runner.id)?runner.id:"<unknown>")+" labels must be non-empty strings.");
 }
 if(issues.length) return {valid:false,issues};

 const sorted=[...runners].sort((a,b)=>a.id.localeCompare(b.id));
 const resolutions:JobResolution[]=plan.jobs.map(job=>{
  const required=[...new Set(job.requiredCapabilities)].sort();
  const online=sorted.filter(r=>r.status==="online");
  const compatible=online.filter(r=>required.every(c=>r.capabilities.includes(c)));
  const reasons:string[]=[];
  if(compatible.length) {
   reasons.push("All required capabilities are present on an online runner.");
   reasons.push("Lexical runner ID tie-break is used for deterministic selection.");
   return {jobId:job.id,requiredCapabilities:required,selectedRunner:compatible[0].id,compatibleRunnerIds:compatible.map(r=>r.id),status:"resolved",reasons};
  }
  if(!online.length) reasons.push("No online runners are currently declared.");
  else reasons.push("No online runner satisfies every required capability.");
  const missing=required.filter(c=>!online.some(r=>r.capabilities.includes(c)));
  if(missing.length) reasons.push("Unavailable capabilities: "+missing.join(", ")+".");
  const offlineMatches=sorted.filter(r=>r.status==="offline"&&required.every(c=>r.capabilities.includes(c))).map(r=>r.id);
  const unknownMatches=sorted.filter(r=>r.status==="unknown"&&required.every(c=>r.capabilities.includes(c))).map(r=>r.id);
  if(offlineMatches.length) reasons.push("Matching offline runners exist: "+offlineMatches.join(", ")+".");
  if(unknownMatches.length) reasons.push("Runner status is unknown for matching candidates: "+unknownMatches.join(", ")+".");
  return {jobId:job.id,requiredCapabilities:required,compatibleRunnerIds:[],status:"unresolved",reasons};
 });
 const onlineCount=runners.filter(r=>r.status==="online").length;
 const offlineCount=runners.filter(r=>r.status==="offline").length;
 const unknownCount=runners.filter(r=>r.status==="unknown").length;
 return {valid:true,issues:[],resolution:{
  schemaVersion:"1",mode:"analysis-only",planValid:true,resolutions,
  runnerInventory:{runnerCount:runners.length,onlineCount,offlineCount,unknownCount},
  summary:{resolvedJobs:resolutions.filter(r=>r.status==="resolved").length,unresolvedJobs:resolutions.filter(r=>r.status==="unresolved").length},
  warnings:["Capability matching is descriptive and does not authorize execution.","No runner communication, provisioning, command execution or secret handling occurs."]
 }};
}
