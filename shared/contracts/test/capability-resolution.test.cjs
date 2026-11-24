const test=require('node:test');
const assert=require('node:assert/strict');
const {resolvePlanCapabilities}=require('../dist/capability-resolution.js');
const plan={schemaVersion:'1',generatedFrom:'UPS v1',pipelineName:'fixture',executionMode:'plan-only',valid:true,jobs:[
 {id:'build',requiredCapabilities:['node','linux']},
 {id:'test',requiredCapabilities:['node']},
 {id:'deploy',requiredCapabilities:['cloud','credential']}
]};
test('selects deterministic lexical first compatible online runner',()=>{
 const r=resolvePlanCapabilities(plan,[{id:'z',status:'online',capabilities:['node','linux']},{id:'a',status:'online',capabilities:['node','linux']}]);
 assert.equal(r.valid,true); assert.equal(r.resolution.resolutions[0].selectedRunner,'a');
 assert.deepEqual(r.resolution.resolutions[0].compatibleRunnerIds,['a','z']);
});
test('reports missing capabilities and matching offline candidates',()=>{
 const r=resolvePlanCapabilities(plan,[{id:'runner',status:'online',capabilities:['node']},{id:'offline-cloud',status:'offline',capabilities:['cloud','credential']}]);
 assert.equal(r.resolution.summary.unresolvedJobs,2);
 assert.equal(r.resolution.resolutions[2].status,'unresolved');
 assert.ok(r.resolution.resolutions[2].reasons.some(x=>x.includes('offline')));
 assert.ok(r.resolution.resolutions[0].reasons.some(x=>x.includes('Unavailable capabilities')));
});
test('unknown matching runners remain unresolved and are reported',()=>{
 const r=resolvePlanCapabilities(plan,[{id:'maybe',status:'unknown',capabilities:['node','linux']}]);
 assert.equal(r.resolution.resolutions[0].status,'unresolved');
 assert.ok(r.resolution.resolutions[0].reasons.some(x=>x.includes('status is unknown')));
 assert.equal(r.resolution.runnerInventory.unknownCount,1);
});
test('rejects duplicate runner IDs',()=>{
 const r=resolvePlanCapabilities(plan,[{id:'x',status:'online',capabilities:[]},{id:'x',status:'offline',capabilities:[]}]);
 assert.equal(r.valid,false);
});
test('rejects duplicate job IDs and malformed plan objects',()=>{
 assert.equal(resolvePlanCapabilities({...plan,jobs:[plan.jobs[0],plan.jobs[0]]},[]).valid,false);
 assert.equal(resolvePlanCapabilities({...plan,jobs:[{id:'bad'}]},[]).valid,false);
 assert.equal(resolvePlanCapabilities({...plan,schemaVersion:'99'},[]).valid,false);
});
test('rejects malformed runner capabilities, status and labels',()=>{
 for(const runner of [
  {id:'x',status:'online',capabilities:[' ']},
  {id:'x',status:'sleeping',capabilities:[]},
  {id:'x',status:'online',capabilities:[],labels:[1]}
 ]) assert.equal(resolvePlanCapabilities(plan,[runner]).valid,false);
});
test('accepts empty runner inventory but resolves no jobs',()=>{
 const r=resolvePlanCapabilities(plan,[]);
 assert.equal(r.valid,true); assert.equal(r.resolution.summary.resolvedJobs,0);
 assert.equal(r.resolution.summary.unresolvedJobs,3);
});
test('does not mutate caller inputs',()=>{
 const runners=[{id:'b',status:'online',capabilities:['linux','node']}];
 const before=JSON.stringify({plan,runners});
 resolvePlanCapabilities(plan,runners);
 assert.equal(JSON.stringify({plan,runners}),before);
});
test('rejects non plan-only or invalid plan flags',()=>{
 assert.equal(resolvePlanCapabilities({...plan,executionMode:'execute'},[]).valid,false);
 assert.equal(resolvePlanCapabilities({...plan,valid:false},[]).valid,false);
});
