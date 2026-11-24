import type { PipelineStageState } from "./index";

export interface UpsValidationIssue {
  code: string;
  path: string;
  message: string;
}
export interface UpsValidationResult { valid: boolean; issues: UpsValidationIssue[]; }
type Pipeline = { version?: unknown; name?: unknown; jobs?: unknown };

const ID = /^[A-Za-z0-9_-]+$/;
const topKeys = new Set(["version","name","description","trigger","jobs"]);
const jobKeys = new Set(["name","needs","runsOn","timeoutSeconds","continueOnError","steps"]);
const stepKeys = new Set(["id","name","run","timeoutSeconds","continueOnError"]);
const runKeys = new Set(["executable","args","cwd","env"]);
function issue(issues: UpsValidationIssue[], code: string, path: string, message: string) { issues.push({code,path,message}); }
function object(value: unknown): value is Record<string,unknown> { return !!value && typeof value==="object" && !Array.isArray(value); }
function stringArray(value:unknown): value is string[] { return Array.isArray(value)&&value.every(x=>typeof x==="string"); }
function validTimeout(v:unknown):boolean{return Number.isInteger(v)&&Number(v)>=1&&Number(v)<=86400;}

export function validateUpsPipeline(value:unknown):UpsValidationResult {
 const issues:UpsValidationIssue[]=[];
 if(!object(value)){issue(issues,"UPS_ROOT","$","Pipeline must be a JSON object.");return {valid:false,issues};}
 for(const k of Object.keys(value)) if(!topKeys.has(k)) issue(issues,"UPS_UNKNOWN_FIELD",k,"Unknown top-level field.");
 if(value.version!=="1") issue(issues,"UPS_VERSION","version",'Expected version "1".');
 if(typeof value.name!=="string"||!value.name.trim()) issue(issues,"UPS_NAME","name","A non-empty name is required.");
 if(value.description!==undefined&&typeof value.description!=="string") issue(issues,"UPS_DESCRIPTION","description","Description must be a string.");
 if(value.trigger!==undefined&&!stringArray(value.trigger)) issue(issues,"UPS_TRIGGER","trigger","Trigger must be an array of strings.");
 if(!object(value.jobs)||Object.keys(value.jobs).length===0){issue(issues,"UPS_JOBS","jobs","At least one job is required.");return {valid:false,issues};}
 const jobs=value.jobs as Record<string,unknown>; const ids=new Set(Object.keys(jobs));
 const deps:Record<string,string[]>={};
 for(const [jid,jv] of Object.entries(jobs)){
  const p="jobs."+jid;
  if(!ID.test(jid))issue(issues,"UPS_JOB_ID",p,"Job ID may contain only letters, numbers, underscore and hyphen.");
  if(!object(jv)){issue(issues,"UPS_JOB",p,"Job must be an object.");continue;}
  for(const k of Object.keys(jv))if(!jobKeys.has(k))issue(issues,"UPS_UNKNOWN_FIELD",p+"."+k,"Unknown job field.");
  if(jv.name!==undefined&&typeof jv.name!=="string")issue(issues,"UPS_JOB_NAME",p+".name","Name must be a string.");
  if(jv.needs!==undefined&&!stringArray(jv.needs))issue(issues,"UPS_NEEDS",p+".needs","needs must be an array of job IDs.");
  if(jv.runsOn!==undefined&&(!stringArray(jv.runsOn)||!jv.runsOn.length))issue(issues,"UPS_RUNS_ON",p+".runsOn","runsOn must be a non-empty array of strings.");
  if(jv.timeoutSeconds!==undefined&&!validTimeout(jv.timeoutSeconds))issue(issues,"UPS_TIMEOUT",p+".timeoutSeconds","Timeout must be an integer between 1 and 86400.");
  if(jv.continueOnError!==undefined&&typeof jv.continueOnError!=="boolean")issue(issues,"UPS_CONTINUE",p+".continueOnError","continueOnError must be boolean.");
  deps[jid]=stringArray(jv.needs)?jv.needs:[];
  if(!Array.isArray(jv.steps)||!jv.steps.length){issue(issues,"UPS_STEPS",p+".steps","Job requires at least one step.");continue;}
  const stepIds=new Set<string>();
  jv.steps.forEach((sv,i)=>{
   const sp=p+".steps["+i+"]";
   if(!object(sv)){issue(issues,"UPS_STEP",sp,"Step must be an object.");return;}
   for(const k of Object.keys(sv))if(!stepKeys.has(k))issue(issues,"UPS_UNKNOWN_FIELD",sp+"."+k,"Unknown step field.");
   if(typeof sv.id!=="string"||!ID.test(sv.id))issue(issues,"UPS_STEP_ID",sp+".id","Step ID is required and must be a valid identifier.");
   else if(stepIds.has(sv.id))issue(issues,"UPS_DUPLICATE_STEP",sp+".id","Step IDs must be unique within a job.");else stepIds.add(sv.id);
   if(sv.name!==undefined&&typeof sv.name!=="string")issue(issues,"UPS_STEP_NAME",sp+".name","Name must be a string.");
   if(sv.timeoutSeconds!==undefined&&!validTimeout(sv.timeoutSeconds))issue(issues,"UPS_TIMEOUT",sp+".timeoutSeconds","Timeout must be an integer between 1 and 86400.");
   if(sv.continueOnError!==undefined&&typeof sv.continueOnError!=="boolean")issue(issues,"UPS_CONTINUE",sp+".continueOnError","continueOnError must be boolean.");
   if(!object(sv.run)){issue(issues,"UPS_RUN",sp+".run","run must be an object.");return;}
   for(const k of Object.keys(sv.run))if(!runKeys.has(k))issue(issues,"UPS_UNKNOWN_FIELD",sp+".run."+k,"Unknown run field.");
   if(typeof sv.run.executable!=="string"||!sv.run.executable.trim())issue(issues,"UPS_EXECUTABLE",sp+".run.executable","Executable must be a non-empty string.");
   if(!stringArray(sv.run.args))issue(issues,"UPS_ARGS",sp+".run.args","args must be an array of strings.");
   if(sv.run.cwd!==undefined&&typeof sv.run.cwd!=="string")issue(issues,"UPS_CWD",sp+".run.cwd","cwd must be a string.");
   if(sv.run.env!==undefined&&(!object(sv.run.env)||Object.values(sv.run.env).some(v=>typeof v!=="string")))issue(issues,"UPS_ENV",sp+".run.env","env must be a string-to-string object.");
  });
 }
 for(const [jid,needs] of Object.entries(deps)) for(const dep of needs){if(!ids.has(dep))issue(issues,"UPS_UNKNOWN_DEPENDENCY","jobs."+jid+".needs","Unknown dependency: "+dep);if(dep===jid)issue(issues,"UPS_SELF_DEPENDENCY","jobs."+jid+".needs","Job cannot depend on itself.");}
 // Detect cycles via DFS, marking visited nodes and active recursion path.
 const active=new Set<string>(),done=new Set<string>();
 function visit(id:string){if(done.has(id))return;if(active.has(id)){issue(issues,"UPS_CYCLE","jobs."+id,"Dependency cycle detected.");return;}active.add(id);for(const d of deps[id]??[])if(ids.has(d))visit(d);active.delete(id);done.add(id);}
 for(const id of ids)visit(id);
 return {valid:issues.length===0,issues};
}
