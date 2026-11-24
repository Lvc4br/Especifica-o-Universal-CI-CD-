import { validateUpsPipeline, type UpsValidationIssue } from "./ups-validator";
export interface UpsPlannedStep { id:string; name?:string; executable:string; args:string[]; cwd?:string; env?:Record<string,string>; timeoutSeconds?:number; continueOnError?:boolean; }
export interface UpsPlannedJob { id:string; name?:string; dependencies:string[]; requiredCapabilities:string[]; timeoutSeconds?:number; continueOnError?:boolean; steps:UpsPlannedStep[]; order:number; rationale:string; }
export interface UpsExecutionPlan { schemaVersion:"1"; pipelineName:string; generatedFrom:"UPS v1"; valid:true; executionMode:"plan-only"; jobs:UpsPlannedJob[]; parallelGroups:string[][]; summary:{jobCount:number;stepCount:number;requiredCapabilities:string[]}; }
export interface UpsPlanResult { valid:boolean; plan?:UpsExecutionPlan; issues:UpsValidationIssue[]; }
/** Deterministic, reviewable plan generator. Does not launch processes. */
export function generateUpsExecutionPlan(value:unknown):UpsPlanResult {
 const validation=validateUpsPipeline(value); if(!validation.valid)return {valid:false,issues:validation.issues};
 const p=value as {name:string;jobs:Record<string,any>}, ids=Object.keys(p.jobs), deps:Record<string,string[]>={};
 for(const id of ids)deps[id]=[...(p.jobs[id].needs??[])];
 const remaining=new Set(ids),ordered:string[]=[];
 while(remaining.size){const ready=[...remaining].filter(id=>deps[id].every(d=>ordered.includes(d))).sort();if(!ready.length)return {valid:false,issues:[{code:"UPS_PLAN_CYCLE",path:"jobs",message:"Dependency cycle detected."}]};for(const id of ready){ordered.push(id);remaining.delete(id);}}
 const jobs=ordered.map((id,order)=>{const j=p.jobs[id];const steps=j.steps.map((s:any)=>({id:s.id,...(s.name!==undefined?{name:s.name}:{}),executable:s.run.executable,args:[...s.run.args],...(s.run.cwd!==undefined?{cwd:s.run.cwd}:{}),...(s.run.env!==undefined?{env:{...s.run.env}}:{}),...(s.timeoutSeconds!==undefined?{timeoutSeconds:s.timeoutSeconds}:{}),...(s.continueOnError!==undefined?{continueOnError:s.continueOnError}:{})}));
 return {id,...(j.name!==undefined?{name:j.name}:{}),dependencies:[...(j.needs??[])].sort(),requiredCapabilities:[...(j.runsOn??[])].sort(),...(j.timeoutSeconds!==undefined?{timeoutSeconds:j.timeoutSeconds}:{}),...(j.continueOnError!==undefined?{continueOnError:j.continueOnError}:{}),steps,order,rationale:j.needs?.length? "Scheduled after dependencies: "+[...j.needs].sort().join(", ")+".":"No dependencies; eligible at plan start. Stable lexical ordering resolves ties."};});
 const groups:string[][]=[],scheduled=new Set<string>();for(const id of ordered){const ds=deps[id];let wave=0;while(ds.some(d=>!scheduled.has(d))&&wave<groups.length)wave++;if(wave===groups.length)groups.push([]);groups[wave].push(id);scheduled.add(id);}
 const caps=[...new Set(jobs.flatMap(j=>j.requiredCapabilities))].sort();
 return {valid:true,issues:[],plan:{schemaVersion:"1",pipelineName:p.name,generatedFrom:"UPS v1",valid:true,executionMode:"plan-only",jobs,parallelGroups:groups,summary:{jobCount:jobs.length,stepCount:jobs.reduce((n,j)=>n+j.steps.length,0),requiredCapabilities:caps}}};
}