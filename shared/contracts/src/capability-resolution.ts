import type { UpsExecutionPlan } from "./ups-execution-plan";
export type RunnerStatus = "online" | "offline" | "unknown";
export interface CapabilityRunner { id:string; capabilities:string[]; status:RunnerStatus; labels?:string[]; }
export interface JobResolution { jobId:string; requiredCapabilities:string[]; selectedRunner?:string; compatibleRunnerIds:string[]; status:"resolved"|"unresolved"; reasons:string[]; }
export interface CapabilityResolution { schemaVersion:"1"; mode:"analysis-only"; planValid:boolean; resolutions:JobResolution[]; runnerInventory:{runnerCount:number;onlineCount:number;offlineCount:number}; summary:{resolvedJobs:number;unresolvedJobs:number}; warnings:string[]; }
export interface CapabilityResolutionResult { valid:boolean; resolution?:CapabilityResolution; issues:string[]; }
/** Pure capability matching. Does not execute jobs, contact runners or grant authorization. */
export function resolvePlanCapabilities(plan:UpsExecutionPlan, runners:CapabilityRunner[]):CapabilityResolutionResult {
 const issues:string[]=[];
 if(!plan||plan.executionMode!=="plan-only"||plan.valid!==true){return {valid:false,issues:["Input must be a valid plan-only UPS execution plan."]};}
 if(!Array.isArray(plan.jobs)||!Array.isArray(runners))return {valid:false,issues:["Plan jobs and runner inventory must be arrays."]};
 const seen=new Set<string>();
 for(const r of runners){if(!r||typeof r.id!=="string"||!r.id.trim())issues.push("Runner IDs must be non-empty strings.");else if(seen.has(r.id))issues.push("Duplicate runner ID: "+r.id);else seen.add(r.id);if(!Array.isArray(r.capabilities)||!r.capabilities.every(c=>typeof c==="string"))issues.push("Runner "+(r?.id??"<unknown>")+" must have a string capability list.");if(!["online","offline","unknown"].includes(r.status))issues.push("Runner "+(r?.id??"<unknown>")+" has an invalid status.");}
 if(issues.length)return {valid:false,issues};
 const sorted=[...runners].sort((a,b)=>a.id.localeCompare(b.id));
 const resolutions=plan.jobs.map(job=>{
  const required=[...new Set(job.requiredCapabilities)].sort();
  const online=sorted.filter(r=>r.status==="online");
  const compatible=online.filter(r=>required.every(c=>r.capabilities.includes(c)));
  const reasons:string[]=[];
  if(compatible.length){reasons.push("All required capabilities are present on an online runner.");reasons.push("Lexical runner ID tie-break is used for deterministic selection.");return {jobId:job.id,requiredCapabilities:required,selectedRunner:compatible[0].id,compatibleRunnerIds:compatible.map(r=>r.id),status:"resolved" as const,reasons};}
  if(!online.length)reasons.push("No online runners are currently declared.");
  else reasons.push("No online runner satisfies every required capability.");
  const missing=required.filter(c=>!online.some(r=>r.capabilities.includes(c)));
  if(missing.length)reasons.push("Unavailable capabilities: "+missing.join(", ")+".");
  const offlineMatches=sorted.filter(r=>r.status==="offline"&&required.every(c=>r.capabilities.includes(c))).map(r=>r.id);
  if(offlineMatches.length)reasons.push("Matching offline runners exist: "+offlineMatches.join(", ")+".");
  return {jobId:job.id,requiredCapabilities:required,compatibleRunnerIds:[],status:"unresolved" as const,reasons};
 });
 const onlineCount=runners.filter(r=>r.status==="online").length,offlineCount=runners.filter(r=>r.status==="offline").length;
 return {valid:true,issues:[],resolution:{schemaVersion:"1",mode:"analysis-only",planValid:true,resolutions,runnerInventory:{runnerCount:runners.length,onlineCount,offlineCount},summary:{resolvedJobs:resolutions.filter(r=>r.status==="resolved").length,unresolvedJobs:resolutions.filter(r=>r.status==="unresolved").length},warnings:["Capability matching is descriptive and does not authorize execution.","No runner communication, provisioning, command execution or secret handling occurs."]}};
}
