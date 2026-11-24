const test=require("node:test");const assert=require("node:assert/strict");const {validateUpsPipeline}=require("../dist/ups-validator.js");
const good={version:"1",name:"demo",jobs:{a:{steps:[{id:"run",run:{executable:"node",args:["--version"]}}]},b:{needs:["a"],steps:[{id:"test",run:{executable:"npm",args:["test"]}}]}}};
test("accepts valid pipeline",()=>assert.equal(validateUpsPipeline(good).valid,true));
test("rejects unsupported version",()=>assert.ok(validateUpsPipeline({...good,version:"2"}).issues.some(x=>x.code==="UPS_VERSION")));
test("rejects unknown fields",()=>assert.ok(validateUpsPipeline({...good,foo:true}).issues.some(x=>x.code==="UPS_UNKNOWN_FIELD")));
test("rejects unknown dependency",()=>assert.ok(validateUpsPipeline({...good,jobs:{a:{needs:["missing"],steps:good.jobs.a.steps}}}).issues.some(x=>x.code==="UPS_UNKNOWN_DEPENDENCY")));
test("detects dependency cycle",()=>assert.ok(validateUpsPipeline({...good,jobs:{a:{needs:["b"],steps:good.jobs.a.steps},b:{needs:["a"],steps:good.jobs.b.steps}}}).issues.some(x=>x.code==="UPS_CYCLE")));
test("rejects unsafe malformed args",()=>assert.ok(validateUpsPipeline({...good,jobs:{a:{steps:[{id:"x",run:{executable:"node",args:"--version"}}]}}}).issues.some(x=>x.code==="UPS_ARGS")));
test("rejects duplicate step IDs",()=>assert.ok(validateUpsPipeline({...good,jobs:{a:{steps:[{id:"x",run:{executable:"node",args:[]}},{id:"x",run:{executable:"node",args:[]}}]}}}).issues.some(x=>x.code==="UPS_DUPLICATE_STEP")));
test("rejects empty jobs",()=>assert.equal(validateUpsPipeline({version:"1",name:"empty",jobs:{}}).valid,false));

test("rejects duplicate dependency IDs to match the UPS schema",()=>{
 const value={version:"1",name:"duplicates",jobs:{a:{steps:[{id:"s",run:{executable:"node",args:[]}}]},b:{needs:["a","a"],steps:[{id:"t",run:{executable:"node",args:[]}}]}}};
 assert.ok(validateUpsPipeline(value).issues.some(x=>x.code==="UPS_DUPLICATE_DEPENDENCY"));
});
test("rejects duplicate required capabilities to match the UPS schema",()=>{
 const value={version:"1",name:"duplicates",jobs:{a:{runsOn:["linux","linux"],steps:[{id:"s",run:{executable:"node",args:[]}}]}}};
 assert.ok(validateUpsPipeline(value).issues.some(x=>x.code==="UPS_DUPLICATE_CAPABILITY"));
});
test("rejects invalid job identifiers and more than 500 jobs",()=>{
 const invalidId={version:"1",name:"invalid",jobs:{"bad.id":{steps:[{id:"s",run:{executable:"node",args:[]}}]}}};
 assert.ok(validateUpsPipeline(invalidId).issues.some(x=>x.code==="UPS_JOB_ID"));
 const jobs={};for(let i=0;i<501;i++)jobs["job_"+i]={steps:[{id:"s",run:{executable:"node",args:[]}}]};
 assert.ok(validateUpsPipeline({version:"1",name:"large",jobs}).issues.some(x=>x.code==="UPS_JOB_LIMIT"));
});

test("rejects whitespace-only pipeline names and executables",()=>{
 assert.ok(validateUpsPipeline({...good,name:"   "}).issues.some(x=>x.code==="UPS_NAME"));
 const value={version:"1",name:"demo",jobs:{a:{steps:[{id:"s",run:{executable:"   ",args:[]}}]}}};
 assert.ok(validateUpsPipeline(value).issues.some(x=>x.code==="UPS_EXECUTABLE"));
});

test("rejects more than 100 steps in one job",()=>{
 const steps=Array.from({length:101},(_,i)=>({id:"step_"+i,run:{executable:"node",args:[]}}));
 const value={version:"1",name:"too-many-steps",jobs:{a:{steps}}};
 assert.ok(validateUpsPipeline(value).issues.some(x=>x.code==="UPS_STEP_LIMIT"));
});
