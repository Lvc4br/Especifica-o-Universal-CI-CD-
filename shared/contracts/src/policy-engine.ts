import type { UpsExecutionPlan } from "./ups-execution-plan";

export type PolicyEffect = "block" | "require-review" | "warn";
export type PipelinePolicyRule =
 | { id:string; type:"max-jobs"; limit:number; effect:PolicyEffect }
 | { id:string; type:"forbidden-executables"; executables:string[]; effect:PolicyEffect }
 | { id:string; type:"required-capabilities"; capabilities:string[]; effect:PolicyEffect };
export interface PipelinePolicySet { schemaVersion:"1"; policyId:string; rules:PipelinePolicyRule[]; }
export interface PolicyFinding { ruleId:string; ruleType:PipelinePolicyRule["type"]; effect:PolicyEffect; jobIds:string[]; message:string; }
export interface PolicyAssessment {
 schemaVersion:"1"; mode:"assessment-only"; policyId:string;
 outcome:"compliant"|"violations"|"review-required";
 findings:PolicyFinding[];
 summary:{blockCount:number;reviewCount:number;warningCount:number;affectedJobCount:number};
 limitations:string[];
}
export interface PolicyEvaluationResult { valid:boolean; assessment?:PolicyAssessment; issues:string[]; }
function isRecord(v:unknown):v is Record<string,unknown>{return typeof v==="object"&&v!==null&&!Array.isArray(v);}
function nonEmpty(v:unknown):v is string{return typeof v==="string"&&v.trim().length>0;}
function normalized(v:string):string{return v.trim().toLowerCase();}

/** Evaluates declarative policy against a plan. This is not an execution authorization. */
export function evaluatePipelinePolicy(planInput:unknown, policyInput:unknown):PolicyEvaluationResult {
 if(!isRecord(planInput)||planInput.schemaVersion!=="1"||planInput.generatedFrom!=="UPS v1"||planInput.executionMode!=="plan-only"||planInput.valid!==true||!nonEmpty(planInput.pipelineName)||!Array.isArray(planInput.jobs)||planInput.jobs.length===0)
  return {valid:false,issues:["Input must be a non-empty, structurally identified UPS v1 plan-only object."]};
 if(!isRecord(policyInput)||policyInput.schemaVersion!=="1"||!nonEmpty(policyInput.policyId)||!Array.isArray(policyInput.rules))
  return {valid:false,issues:["Policy must have schemaVersion 1, a non-empty policyId and a rules array."]};
 const issues:string[]=[];const ruleIds=new Set<string>();
 for(const [i,raw] of (policyInput.rules as unknown[]).entries()){
  if(!isRecord(raw)){issues.push("Policy rule at index "+i+" must be an object.");continue;}
  const id=raw.id;
  if(!nonEmpty(id)||!["block","require-review","warn"].includes(String(raw.effect))){issues.push("Policy rule at index "+i+" has invalid ID or effect.");continue;}
  if(ruleIds.has(id))issues.push("Duplicate policy rule ID: "+id);
  ruleIds.add(id);
  if(raw.type==="max-jobs"){if(!Number.isInteger(raw.limit)||Number(raw.limit)<1)issues.push("Rule "+id+" requires a positive integer limit.");}
  else if(raw.type==="forbidden-executables"||raw.type==="required-capabilities"){
   const values=raw.type==="forbidden-executables"?raw.executables:raw.capabilities;
   if(!Array.isArray(values)||values.length===0||!values.every(nonEmpty))issues.push("Rule "+id+" requires a non-empty string list.");
  } else issues.push("Rule "+id+" has an unsupported type.");
 }
 if(issues.length)return {valid:false,issues};
 const plan=planInput as unknown as UpsExecutionPlan;
 const policy=policyInput as unknown as PipelinePolicySet;
 const findings:PolicyFinding[]=[];
 for(const rule of policy.rules){
  if(rule.type==="max-jobs"&&plan.jobs.length>rule.limit)findings.push({ruleId:rule.id,ruleType:rule.type,effect:rule.effect,jobIds:plan.jobs.map(j=>j.id),message:"Pipeline contains "+plan.jobs.length+" jobs; policy limit is "+rule.limit+"."});
  if(rule.type==="forbidden-executables"){
   const forbidden=new Set(rule.executables.map(normalized));const affected=plan.jobs.filter(job=>job.steps.some(step=>forbidden.has(normalized(step.executable)))).map(job=>job.id);
   if(affected.length)findings.push({ruleId:rule.id,ruleType:rule.type,effect:rule.effect,jobIds:affected,message:"One or more jobs use an executable listed by policy as forbidden."});
  }
  if(rule.type==="required-capabilities"){
   const required=new Set(rule.capabilities.map(normalized));const affected=plan.jobs.filter(job=>{const present=new Set(job.requiredCapabilities.map(normalized));return [...required].some(cap=>!present.has(cap));}).map(job=>job.id);
   if(affected.length)findings.push({ruleId:rule.id,ruleType:rule.type,effect:rule.effect,jobIds:affected,message:"One or more jobs do not declare every capability required by policy."});
  }
 }
 const blockCount=findings.filter(f=>f.effect==="block").length;
 const reviewCount=findings.filter(f=>f.effect==="require-review").length;
 const warningCount=findings.filter(f=>f.effect==="warn").length;
 const affectedJobCount=new Set(findings.flatMap(f=>f.jobIds)).size;
 const outcome=blockCount?"violations":reviewCount?"review-required":"compliant";
 return {valid:true,issues:[],assessment:{schemaVersion:"1",mode:"assessment-only",policyId:policy.policyId,outcome,findings,summary:{blockCount,reviewCount,warningCount,affectedJobCount},limitations:[
  "A compliant assessment is not permission or authorization to execute a pipeline.",
  "Review-required findings are informational; this module does not collect or approve human decisions.",
  "Policy evaluation does not execute commands, contact runners, resolve secrets or mutate the plan."
 ]}};
}
